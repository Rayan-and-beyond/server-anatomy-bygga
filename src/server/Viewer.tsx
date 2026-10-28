import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Stage } from '../engine/stage';
import { createServerPlan, parts, type ComponentId } from './data';
import { makePartGeometry } from './geometry';

interface ViewerProps {
  explode: number;
  selected: ComponentId | null;
  onPick: (id: ComponentId) => void;
  resetCount: number;
}

export default function Viewer({ explode, selected, onPick, resetCount }: ViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const explodeRef = useRef(explode);
  const selectionRef = useRef(selected);
  const pickRef = useRef(onPick);
  const progressRef = useRef(0.38);
  const zoomRef = useRef(1.28);
  explodeRef.current = explode;
  selectionRef.current = selected;
  pickRef.current = onPick;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.userAz = 0;
    stage.userEl = 0;
    zoomRef.current = 1.28;
    stage.autoReset = false;
  }, [resetCount]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let stage: Stage;
    try {
      stage = new Stage(host, { offscreen: true, interactive: false });
    } catch (error) {
      host.dataset.error = 'WebGL could not initialize';
      console.error('Unable to initialize 3D viewer', error);
      return;
    }
    stageRef.current = stage;
    stage.renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    stage.renderer.toneMappingExposure = 1.55;
    stage.scene.add(new THREE.HemisphereLight(0xffffff, 0xe4e9ef, 3.7));
    const light = new THREE.DirectionalLight(0xffffff, 3.3);
    light.position.set(-300, 640, 380);
    stage.scene.add(light);
    const backLight = new THREE.DirectionalLight(0xd9ecff, 1.5);
    backLight.position.set(280, 270, -500);
    stage.scene.add(backLight);
    stage.setPlan(createServerPlan());
    stage.setMode({ kind: 'assembled', view: { az: 0.64, el: 0.46 } }, { instant: true });
    stage.autoReset = false;
    stage.shadow.visible = false;
    for (const p of stage.parts) {
      const info = parts.find(item => item.id === p.item.ref);
      if (!info) continue;
      p.d.root.visible = false;
      p.node.add(makePartGeometry(info.id));
    }

    const selectionBox = new THREE.BoxHelper(stage.root, 0xcb8051);
    selectionBox.material.depthTest = false;
    selectionBox.renderOrder = 9;
    stage.scene.add(selectionBox);
    selectionBox.visible = false;
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const resize = () => stage.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const canvas = stage.renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.setAttribute('aria-label', 'Interactive 3D rack server. Drag to orbit, scroll to zoom, click a component to inspect.');
    const down = { x: 0, y: 0, active: false, distance: 0 };
    const pointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      down.x = event.clientX;
      down.y = event.clientY;
      down.distance = 0;
      down.active = true;
      canvas.style.cursor = 'grabbing';
    };
    const pointerMove = (event: PointerEvent) => {
      if (!down.active) return;
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      down.x = event.clientX;
      down.y = event.clientY;
      down.distance += Math.abs(dx) + Math.abs(dy);
      stage.userAz -= dx * 0.0075;
      stage.userEl = THREE.MathUtils.clamp(stage.userEl + dy * 0.006, -0.38, 0.84);
    };
    const pointerUp = (event: PointerEvent) => {
      if (down.active && down.distance < 8) {
        const rect = canvas.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        ray.setFromCamera(pointer, stage.camera);
        const hits = ray.intersectObjects(stage.root.children, true);
        const id = hits.map(hit => hit.object.userData.partId as ComponentId | undefined).find(Boolean);
        if (id) pickRef.current(id);
      }
      down.active = false;
      canvas.style.cursor = 'grab';
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomRef.current = THREE.MathUtils.clamp(zoomRef.current * Math.exp(event.deltaY * 0.0011), 0.75, 2.4);
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('wheel', wheel, { passive: false });

    let raf = 0;
    let last = performance.now();
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      if (document.hidden) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      progressRef.current += (explodeRef.current / 100 - progressRef.current) * (1 - Math.exp(-dt * 7.7));
      stage.userZoom = zoomRef.current * (1 + progressRef.current * 0.48);
      stage.tick(0);
      for (const pn of stage.parts) {
        const info = parts.find(part => part.id === pn.item.ref);
        if (!info) continue;
        pn.node.position.set(
          info.position[0] + info.explode[0] * progressRef.current,
          info.position[1] + info.explode[1] * progressRef.current,
          info.position[2] + info.explode[2] * progressRef.current,
        );
      }
      const id = selectionRef.current;
      if (id) {
        const part = stage.parts.find(item => item.item.ref === id);
        if (part) {
          selectionBox.setFromObject(part.node);
          selectionBox.visible = true;
        }
      } else {
        selectionBox.visible = false;
      }
      stage.render();
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('wheel', wheel);
      selectionBox.geometry.dispose();
      stage.scene.remove(selectionBox);
      stage.dispose();
      stageRef.current = null;
    };
  }, []);

  return <div className='viewer' ref={hostRef} data-testid='server-viewer'>
    <div className='stage-error'>Your browser could not start WebGL. Please enable hardware acceleration and reload.</div>
    <div className='canvas-corner corner-tl' /><div className='canvas-corner corner-tr' />
    <div className='canvas-corner corner-bl' /><div className='canvas-corner corner-br' />
  </div>;
}

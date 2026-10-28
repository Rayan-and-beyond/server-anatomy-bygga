import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Stage } from '../engine/stage';
import { BY_ID, COMPONENTS, WALKTHROUGH, createPlan, type ComponentId } from './data';
import { makePartGeometry } from './geometry';

export interface ViewerProps {
  mode: 'explore' | 'guide';
  explode: number;
  step: number;
  selected: ComponentId;
  resetToken: number;
  onSelect: (part: ComponentId) => void;
  onError: (message: string) => void;
}

export default function Viewer({ mode, explode, step, selected, resetToken, onSelect, onError }: ViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const values = useRef({ mode, explode, step, selected, resetToken, onSelect, onError });
  values.current = { mode, explode, step, selected, resetToken, onSelect, onError };

  useEffect(() => {
    if (!stageRef.current) return;
    const s = stageRef.current;
    s.userAz = 0;
    s.userEl = 0;
    s.userZoom = 1;
  }, [resetToken]);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    let s: Stage;
    try {
      s = new Stage(mount, { offscreen: true });
    } catch (e) {
      values.current.onError('WebGL could not initialize in this browser.');
      console.error(e);
      return;
    }
    stageRef.current = s;
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    s.renderer.outputColorSpace = THREE.SRGBColorSpace;
    s.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    s.renderer.toneMappingExposure = 1.18;
    s.scene.add(new THREE.HemisphereLight('#ffffff', '#bdc7ce', 2.5));
    const key = new THREE.DirectionalLight('#ffffff', 3.0);
    key.position.set(-490, 1000, 610);
    s.scene.add(key);
    const fill = new THREE.DirectionalLight('#d4edff', 1.9);
    fill.position.set(680, 430, -400);
    s.scene.add(fill);
    s.scene.add(new THREE.AmbientLight('#ffffff', .38));
    s.setPlan(createPlan());
    s.setMode({ kind: 'assembled' }, { instant: true });
    s.autoReset = false;
    s.shadow.visible = false;
    if (!Array.isArray(s.shadow.material)) s.shadow.material.visible = false;
    for (const node of s.parts) {
      node.d.root.visible = false; // Keep Bygga's animation/camera infrastructure, replace its furniture mesh.
      node.node.add(makePartGeometry(node.item.ref as ComponentId));
    }

    const selector = new THREE.BoxHelper(new THREE.Object3D(), 0xda853c);
    selector.material.depthTest = false;
    selector.material.transparent = true;
    selector.material.opacity = .9;
    selector.renderOrder = 55;
    s.scene.add(selector);
    const resize = () => s.resize(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight));
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const canvas = s.renderer.domElement;
    canvas.setAttribute('aria-label', 'PowerEdge R760 3D model. Drag to rotate, wheel or pinch to zoom, click any part to inspect.');
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';

    const pointers = new Map<number, { x: number; y: number }>();
    const ray = new THREE.Raycaster();
    const point = new THREE.Vector2();
    let down = { x: 0, y: 0, moved: 0 };
    let pinchDistance = 0;
    let pinchZoom = 1;
    let zoom = 1;
    let az = .53;
    let el = .89;
    const smooth = { zoom: 1, az: .53, el: .89 };
    let previousReset = values.current.resetToken;

    const pointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY, moved: 0 };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a.x-b.x, a.y-b.y);
        pinchZoom = zoom;
      }
      canvas.style.cursor = 'grabbing';
    };
    const pointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const dx = e.clientX-prev.x, dy=e.clientY-prev.y;
      down.moved += Math.abs(dx) + Math.abs(dy);
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x-b.x,a.y-b.y);
        if (pinchDistance>10) zoom=THREE.MathUtils.clamp(pinchZoom*pinchDistance/distance,.65,2.6);
      } else {
        az -= dx*.007;
        el = THREE.MathUtils.clamp(el+dy*.005,.24,1.43);
      }
    };
    const pointerUp = (e: PointerEvent) => {
      const wasClick=pointers.size===1 && down.moved<7 && e.type!=='pointercancel';
      pointers.delete(e.pointerId);
      if(wasClick){
        const rect=canvas.getBoundingClientRect();
        point.set(((e.clientX-rect.left)/rect.width)*2-1,1-((e.clientY-rect.top)/rect.height)*2);
        ray.setFromCamera(point,s.camera);
        const intersections=ray.intersectObjects(s.root.children,true);
        const hit=intersections.map(h=>h.object.userData.partId as ComponentId|undefined).find(Boolean);
        if(hit)values.current.onSelect(hit);
      }
      if(pointers.size<2)pinchDistance=0;
      canvas.style.cursor='grab';
    };
    const wheel = (e:WheelEvent) => {
      e.preventDefault();
      zoom=THREE.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.0012),.65,2.6);
    };
    const dblclick = () => { zoom=1;az=.53;el=.89; };
    canvas.addEventListener('pointerdown',pointerDown);
    canvas.addEventListener('pointermove',pointerMove);
    canvas.addEventListener('pointerup',pointerUp);
    canvas.addEventListener('pointercancel',pointerUp);
    canvas.addEventListener('wheel',wheel,{passive:false});
    canvas.addEventListener('dblclick',dblclick);

    // Group transform is cached across frames so moving back and forth through the guide is fluid.
    const displacement=new Map<ComponentId, number>(COMPONENTS.map(c=>[c.id,0]));
    let raf=0, last=performance.now(), frame=0;
    function tick(now:number){
      raf=requestAnimationFrame(tick);
      if(document.hidden){ last=now;return; }
      const dt=Math.min(.065,(now-last)/1000);last=now;
      const a=1-Math.exp(-dt*9.5);
      const v=values.current;
      if (v.resetToken !== previousReset) { az=.53; el=.89; zoom=1; previousReset=v.resetToken; }
      const walkthrough=WALKTHROUGH[Math.min(v.step,WALKTHROUGH.length-1)];
      const target=walkthrough.target;
      smooth.az += (az-smooth.az)*(1-Math.exp(-dt*11));
      smooth.el += (el-smooth.el)*(1-Math.exp(-dt*11));
      smooth.zoom += (zoom-smooth.zoom)*(1-Math.exp(-dt*10));
      s.tick(0);
      // Bygga automatically positions the assembled parts; apply our detailed, per-component extraction.
      for(const node of s.parts){
        const id=node.item.ref as ComponentId;
        const c=BY_ID[id];
        const pre=walkthrough.remove.includes(id);
        let dest=0;
        let visible=true;
        if(v.mode==='explore'){
          dest=v.explode/100;
          // The working top-down cutaway is open at rest: hidden lid/duct.
          if((id==='cover'||id==='shroud'||id==='backplaneCover')&&dest<.06)visible=false;
        }else{
          if(pre){dest=1.65;visible=false;}
          if(id===target && v.step>0){dest=1.0;}
          // Show hidden subassembly if it is the target, even if other removable groups are absent.
        }
        const x=displacement.get(id)||0;
        const n=x+(dest-x)*a;
        displacement.set(id,n);
        node.node.visible=visible;
        // Force Bygga's furniture placeholder off and detailed server-specific mesh on.
        node.node.position.set(c.position[0]+c.extraction[0]*n,c.position[1]+c.extraction[1]*n,c.position[2]+c.extraction[2]*n);
        node.node.rotation.set(0,0,0);
      }
      // Large, physically proportioned rack chassis, with custom orbit for stable framing.
      const bounds=(v.mode==='explore'?v.explode/100:Math.min(v.step/6,1));
      const baseHalf=mount!.clientWidth<600?610:475;
      const half=(baseHalf+bounds*133)/Math.max(.65,smooth.zoom);
      const aspect=Math.max(.3,mount!.clientWidth/Math.max(mount!.clientHeight,1));
      s.camera.left=-half*aspect;
      s.camera.right=half*aspect;
      s.camera.top=half;
      s.camera.bottom=-half;
      const direction=new THREE.Vector3(Math.sin(smooth.az)*Math.cos(smooth.el),Math.sin(smooth.el),Math.cos(smooth.az)*Math.cos(smooth.el));
      const aim=new THREE.Vector3(0,42,0).add(s.root.position);
      s.camera.position.copy(aim).addScaledVector(direction,1250);
      s.camera.up.set(0,1,0);
      s.camera.lookAt(aim);
      s.camera.near=1;
      s.camera.far=5000;
      s.camera.updateProjectionMatrix();
      s.camera.updateMatrixWorld();
      s.shadow.visible=false;
      const chosen= v.mode==='guide'?target:v.selected;
      if(frame++%5===0) {
        const part=s.parts.find(p=>p.item.ref===chosen);
        if(part?.node.visible){
          selector.setFromObject(part.node);
          selector.visible=true;
        } else selector.visible=false;
      }
      s.renderer.render(s.scene,s.camera);
    }
    raf=requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown',pointerDown);
      canvas.removeEventListener('pointermove',pointerMove);
      canvas.removeEventListener('pointerup',pointerUp);
      canvas.removeEventListener('pointercancel',pointerUp);
      canvas.removeEventListener('wheel',wheel);
      canvas.removeEventListener('dblclick',dblclick);
      s.scene.remove(selector);
      selector.geometry.dispose();
      s.dispose();
      stageRef.current=null;
    };
  }, []);

  return <div className='viewer' ref={host} data-testid='server-viewer' />;
}

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Stage } from '../engine/stage';
import { type Plan, type PartType, type PartItem } from '../lib/types';
import { makeGeometry } from './hardware3d';
import { getMachine, type MachineId, type Machine } from './catalog';

export interface ViewerProps {
  machineId: MachineId;
  mode: 'explore' | 'guide';
  selected: string;
  explode: number;
  step: number;
  resetToken: number;
  onSelect: (partId: string) => void;
  onError: (message: string) => void;
}

function makePlan(machine: Machine): Plan {
  const definitions:PartType[]=machine.assemblies.map((part,i)=>({
    id:part.id,
    label:String.fromCharCode(65+i),
    name:part.label,
    qty:1,
    shape:'box',
    size:part.size,
    material:'metal',
  }));
  const items:PartItem[]=machine.assemblies.map(a=>({
    key:a.id,ref:a.id,kind:'part',holes:[],
    final:{pos:a.position,rot:[0,0,0]},
    states:[{step:0,scene:'main',pos:a.position,rot:[0,0,0],delay:0}],
  }));
  return {
    spec:{
      name:machine.name,
      variant:machine.sub,
      category:'datacenter hardware',
      archetype:'custom',
      size:{w:machine.dimensions[0]/10,h:machine.dimensions[1]/10,d:machine.dimensions[2]/10},
      minutes:1,people:2,difficulty:3,source:'guess',
    },
    parts:definitions,items,hardware:[],
    steps:[{n:0,title:'Inspect hardware',kind:'general',people:2,pose:'+y',warnings:[],minutes:1,tools:[],scene:'main'}],
    tools:[],
  };
}

export default function Viewer(props: ViewerProps) {
  const mountRef=useRef<HTMLDivElement>(null);
  const cameraReset=useRef(0);
  const live=useRef(props);
  live.current=props;

  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount)return;
    const machine=getMachine(props.machineId);
    let stage:Stage;
    try {
      stage=new Stage(mount,{offscreen:true});
    } catch(e) {
      props.onError('WebGL could not initialize; check browser graphics acceleration.');
      console.error(e);
      return;
    }

    stage.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    stage.renderer.outputColorSpace=THREE.SRGBColorSpace;
    stage.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    stage.renderer.toneMappingExposure=1.27;
    stage.scene.background=new THREE.Color('#eef1f1');
    stage.scene.add(new THREE.HemisphereLight('#f9fbff','#82919a',2.5));
    const sun=new THREE.DirectionalLight('#ffffff',3.25);
    sun.position.set(-640,1260,530);stage.scene.add(sun);
    const fill=new THREE.DirectionalLight('#d5eaff',1.75);
    fill.position.set(590,370,-520);stage.scene.add(fill);
    stage.scene.add(new THREE.AmbientLight('#ffffff',.38));
    stage.setPlan(makePlan(machine));
    stage.setMode({kind:'assembled'}, {instant:true});
    stage.autoReset=false;
    stage.shadow.visible=false;
    if(!Array.isArray(stage.shadow.material))stage.shadow.material.visible=false;
    for(const p of stage.parts){
      p.d.root.visible=false;
      try{p.node.add(makeGeometry(machine.id,p.item.ref));}
      catch(e){console.error('Could not create '+p.item.ref,e);props.onError('Error building a hardware model.');}
    }
    const selectedOutline=new THREE.BoxHelper(new THREE.Object3D(),0xf6a348);
    selectedOutline.material.depthTest=false;
    selectedOutline.material.transparent=true;
    selectedOutline.material.opacity=.72;
    selectedOutline.renderOrder=85;
    selectedOutline.visible=false;
    stage.scene.add(selectedOutline);

    const size=()=>{
      stage.resize(Math.max(1,mount.clientWidth),Math.max(1,mount.clientHeight));
    };
    const resize=new ResizeObserver(size);
    resize.observe(mount);size();

    let az=machine.view.az,el=machine.view.el,zoom=1;
    let smoothAz=az,smoothEl=el,smoothZoom=zoom;
    let lastReset=props.resetToken;
    let miniPhase='explore';
    const canvas=stage.renderer.domElement;
    canvas.style.touchAction='none';
    canvas.style.cursor='grab';
    canvas.setAttribute('aria-label',machine.name+' 3D machine: drag to orbit, scroll to zoom, click hardware to inspect');
    const pointerMap=new Map<number,{x:number;y:number}>();
    let distance=0,pinchBase=0,pinchZoom=1;
    const ray=new THREE.Raycaster();
    const ndc=new THREE.Vector2();
    const down=(e:PointerEvent)=>{
      canvas.setPointerCapture(e.pointerId);
      pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});
      distance=0;
      if(pointerMap.size===2){
        const [a,b]=[...pointerMap.values()];
        pinchBase=Math.hypot(a.x-b.x,a.y-b.y);
        pinchZoom=zoom;
      }
      canvas.style.cursor='grabbing';
    };
    const move=(e:PointerEvent)=>{
      const prev=pointerMap.get(e.pointerId);
      if(!prev)return;
      pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});
      const dx=e.clientX-prev.x,dy=e.clientY-prev.y;
      distance+=Math.abs(dx)+Math.abs(dy);
      if(pointerMap.size>=2){
        const [a,b]=[...pointerMap.values()];
        const pd=Math.hypot(a.x-b.x,a.y-b.y);
        if(pinchBase>1)zoom=THREE.MathUtils.clamp(pinchZoom*pd/pinchBase,.55,4.5);
      }else{
        az-=dx*.0067;
        el=THREE.MathUtils.clamp(el+dy*.0051,-.13,1.53);
      }
    };
    const up=(e:PointerEvent)=>{
      const click=pointerMap.size===1 && distance<7 && e.type==='pointerup';
      pointerMap.delete(e.pointerId);
      if(click){
        const rect=canvas.getBoundingClientRect();
        ndc.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
        ray.setFromCamera(ndc,stage.camera);
        const hits=ray.intersectObjects(stage.root.children,true);
        const target=hits.map(h=>h.object.userData.partId as string|undefined).find(Boolean);
        if(target)live.current.onSelect(target);
      }
      if(pointerMap.size<2)pinchBase=0;
      canvas.style.cursor='grab';
    };
    const wheel=(e:WheelEvent)=>{
      e.preventDefault();
      zoom=THREE.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.00115),.55,4.5);
    };
    const dbl=()=>{az=machine.view.az;el=machine.view.el;zoom=1;};
    canvas.addEventListener('pointerdown',down);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',up);
    canvas.addEventListener('pointercancel',up);
    canvas.addEventListener('wheel',wheel,{passive:false});
    canvas.addEventListener('dblclick',dbl);

    let last=performance.now(),raf=0;
    let highlightTick=0;
    const current=new Map<string,number>(machine.assemblies.map(p=>[p.id,0]));
    const targetMap=new Map(machine.assemblies.map(p=>[p.id,p]));
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);
      if(document.hidden){last=now;return;}
      const dt=Math.min(.05,(now-last)/1000);
      last=now;
      const fade=1-Math.exp(-dt*9);
      const v=live.current;
      if(v.resetToken!==lastReset){
        az=machine.view.az;el=machine.view.el;zoom=1;
        lastReset=v.resetToken;
      }
      smoothAz+=(az-smoothAz)*(1-Math.exp(-dt*11));
      smoothEl+=(el-smoothEl)*(1-Math.exp(-dt*11));
      smoothZoom+=(zoom-smoothZoom)*(1-Math.exp(-dt*11));
      if(machine.id==='macmini'){
        const phase=v.mode==='guide'?(v.step>=1?'underside':'topside'):'explore';
        if(phase!==miniPhase){
          az=machine.view.az;
          el=phase==='underside'?-.74:machine.view.el;
          zoom=1;
          miniPhase=phase;
        }
      }
      stage.tick(0);
      const guide=machine.guide[Math.min(v.step,machine.guide.length-1)];
      const selected=v.mode==='guide'?guide.focus:v.selected;
      for(const node of stage.parts){
        const a=targetMap.get(node.item.ref)!;
        let target=0,visible=true;
        if(v.mode==='explore'){
          target=v.explode/100;
          if(a.absentAtRest&&target<.055)visible=false;
        }else{
          if(guide.removed.includes(a.id)){target=1.5;visible=false;}
          if(guide.focus===a.id&&v.step>0){target=1;}
          if(a.absentAtRest&&v.step===0)visible=false;
        }
        // Rack context is kept visible instead of moving the cabinet with every tray.
        if(machine.id==='gb200rack'&&a.id==='cabinet')target=0;
        const old=current.get(a.id)||0;
        const alpha=old+(target-old)*fade;
        current.set(a.id,alpha);
        node.node.position.set(
          a.position[0]+a.extract[0]*alpha,
          a.position[1]+a.extract[1]*alpha,
          a.position[2]+a.extract[2]*alpha
        );
        node.node.visible=visible;
        node.node.quaternion.identity();
      }
      // Correct orthographic framing for 2U/6U/10U and for the entire rack.
      const mobile=mount.clientWidth<650;
      const baseHalf=machine.id==='macmini'?114:machine.id==='r760'?490:machine.id==='xe9680'?645:machine.id==='dgxb200'?745:1370;
      const level=v.mode==='explore'?v.explode/100:v.step/Math.max(machine.guide.length-1,1);
      const additional=machine.id==='macmini'?level*154:machine.id==='gb200rack'?level*290:level*205;
      const half=(baseHalf+(mobile?(machine.id==='gb200rack'?190:machine.id==='macmini'?18:120):0)+additional)/Math.max(.55,smoothZoom);
      const aspect=Math.max(.4,mount.clientWidth/Math.max(1,mount.clientHeight));
      stage.camera.left=-half*aspect;
      stage.camera.right=half*aspect;
      stage.camera.top=half;
      stage.camera.bottom=-half;
      const dir=new THREE.Vector3(
        Math.sin(smoothAz)*Math.cos(smoothEl),
        Math.sin(smoothEl),
        Math.cos(smoothAz)*Math.cos(smoothEl)
      );
      const offsetY=machine.id==='macmini'?25:machine.id==='gb200rack'?1070:machine.id==='dgxb200'?186:machine.id==='xe9680'?129:42;
      const center=new THREE.Vector3(0,offsetY,0).add(stage.root.position);
      stage.camera.position.copy(center).addScaledVector(dir,machine.view.distance);
      stage.camera.up.set(0,1,0);
      stage.camera.lookAt(center);
      stage.camera.near=1;
      stage.camera.far=10000;
      stage.camera.updateProjectionMatrix();
      stage.camera.updateMatrixWorld();
      stage.shadow.visible=false;
      if(++highlightTick%8===0){
        const n=stage.parts.find(p=>p.item.ref===selected);
        const tooBroad=machine.id==='gb200rack' && ['cabinet','computes','switches','backplane','liquid'].includes(selected);
        if(n?.node.visible && !tooBroad){
          selectedOutline.setFromObject(n.node);
          selectedOutline.visible=true;
        }else selectedOutline.visible=false;
      }
      stage.renderer.render(stage.scene,stage.camera);
    };
    raf=requestAnimationFrame(frame);
    return ()=>{
      cancelAnimationFrame(raf);
      resize.disconnect();
      canvas.removeEventListener('pointerdown',down);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerup',up);
      canvas.removeEventListener('pointercancel',up);
      canvas.removeEventListener('wheel',wheel);
      canvas.removeEventListener('dblclick',dbl);
      stage.scene.remove(selectedOutline);
      selectedOutline.geometry.dispose();
      stage.dispose();
    };
  },[props.machineId]);

  return <div className='viewer' ref={mountRef} data-testid='hardware-viewer' />;
}

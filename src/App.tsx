import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Maximize, Minimize, PanelRightClose, PanelRightOpen, RotateCcw } from 'lucide-react';
import Viewer from './server/Viewer';
import { getMachine, MACHINES, type MachineId } from './server/catalog';

const firstSelected: Record<MachineId,string> = {
  r760:'cpus',
  xe9680:'gpus',
  dgxb200:'gpus',
  gb200rack:'computes',
};

export default function App() {
  const [id,setId]=useState<MachineId>('gb200rack');
  const [mode,setMode]=useState<'explore'|'guide'>('explore');
  const [selected,setSelected]=useState<string>('computes');
  const [step,setStep]=useState(0);
  const [explode,setExplode]=useState(0);
  const [collapsed,setCollapsed]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  const [error,setError]=useState('');
  const [resetToken,setResetToken]=useState(0);
  const shellRef=useRef<HTMLDivElement>(null);
  const machine=getMachine(id);
  const part=machine.assemblies.find(p=>p.id===selected)??machine.assemblies[0];
  const guide=machine.guide[step]??machine.guide[0];

  function chooseMachine(next:MachineId){
    setId(next);
    setSelected(firstSelected[next]);
    setStep(0);
    setExplode(0);
    setMode('explore');
    setError('');
    setResetToken(x=>x+1);
  }
  function chooseMode(next:'explore'|'guide'){
    setMode(next);
    if(next==='guide'){setStep(0);setSelected(machine.guide[0].focus);}
    else {setSelected(firstSelected[id]);setExplode(0);}
  }
  function selectPart(value:string){
    setSelected(value);
    if(mode==='guide')setMode('explore');
  }
  function nextStep(value:number){
    const next=Math.max(0,Math.min(value,machine.guide.length-1));
    setStep(next);
    setSelected(machine.guide[next].focus);
  }
  function resetView(){
    setResetToken(x=>x+1);
    if(mode==='guide')nextStep(0);
    else setExplode(0);
  }
  async function toggleFullscreen(){
    if(!document.fullscreenElement){
      try{
        await shellRef.current?.requestFullscreen();
        setCollapsed(true);
      }catch(e){console.warn('Fullscreen request failed',e);}
    }else{
      await document.exitFullscreen().catch(()=>{});
    }
  }
  useEffect(()=>{
    const sync=()=>setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange',sync);
    return ()=>document.removeEventListener('fullscreenchange',sync);
  },[]);
  useEffect(()=>{
    const listener=(e:KeyboardEvent)=>{
      const node=e.target as HTMLElement;
      if(node.tagName==='INPUT'||node.tagName==='TEXTAREA'||node.tagName==='BUTTON')return;
      if(mode==='guide'&&e.key==='ArrowRight'){e.preventDefault();nextStep(step+1);}
      if(mode==='guide'&&e.key==='ArrowLeft'){e.preventDefault();nextStep(step-1);}
    };
    window.addEventListener('keydown',listener);
    return ()=>window.removeEventListener('keydown',listener);
  },[id,mode,step]);

  return <div ref={shellRef} className={'app '+(collapsed?'panel-hidden':'')+(fullscreen?' is-fullscreen':'')}>
    <section className='viewport' aria-label={'Interactive '+machine.name+' hardware'}>
      <Viewer machineId={id} mode={mode} explode={explode} step={step} selected={selected}
        resetToken={resetToken} onSelect={selectPart} onError={setError}/>
      <nav className='machine-tabs' aria-label='Choose a server'>
        {[getMachine('gb200rack'),...MACHINES.filter(m=>m.id!=='gb200rack')].map(m=><button key={m.id} onClick={()=>chooseMachine(m.id)}
          role='tab' aria-selected={id===m.id} className={id===m.id?'selected':''}>
          {m.id==='r760'?'R760':m.id==='xe9680'?'XE9680':m.id==='dgxb200'?'DGX B200':'GB200 NVL72'}
        </button>)}
      </nav>
      <div className='viewport-actions'>
        <button className='ghost-control' onClick={resetView} title='Reset camera and separation' aria-label='Reset view'><RotateCcw size={18}/></button>
        <button className='ghost-control' onClick={()=>setCollapsed(v=>!v)}
          title={collapsed?'Show details panel':'Hide details panel'}
          aria-label={collapsed?'Show sidebar':'Hide sidebar'}
          data-testid='sidebar-toggle'>
          {collapsed?<PanelRightOpen size={19}/>:<PanelRightClose size={19}/>}
        </button>
        <button className='ghost-control' onClick={toggleFullscreen}
          title={fullscreen?'Exit fullscreen':'Fullscreen 3D viewer'}
          aria-label={fullscreen?'Exit fullscreen':'Enter fullscreen'}
          data-testid='fullscreen-toggle'>
          {fullscreen?<Minimize size={18}/>:<Maximize size={18}/>}
        </button>
      </div>
      {error&&<p className='render-error' role='alert'>{error}</p>}
      <div className='viewer-bottom'>
        <div className='mode-toggle'>
          <button onClick={()=>chooseMode('explore')} className={mode==='explore'?'active':''} aria-pressed={mode==='explore'}>Explore</button>
          <button onClick={()=>chooseMode('guide')} className={mode==='guide'?'active':''} aria-pressed={mode==='guide'}>Step-by-step</button>
        </div>
        {mode==='explore'?<div className='explosion'>
          <div className='range-labels'><span>Assembled</span><span>{explode}% exploded</span></div>
          <input type='range' min='0' max='100' step='1' value={explode}
            aria-label='Explode server assemblies' data-testid='explode-slider'
            style={{'--fill':explode+'%'} as React.CSSProperties}
            onChange={e=>setExplode(Number(e.target.value))}/>
        </div>:<div className='walk-controls'>
          <button className='walk-arrow' onClick={()=>nextStep(step-1)} disabled={step===0} aria-label='Previous step'><ArrowLeft size={19}/></button>
          <div className='walk-label'><span>{step+1} / {machine.guide.length}</span><strong>{guide.title}</strong></div>
          <button className='walk-arrow next' onClick={()=>nextStep(step+1)} disabled={step===machine.guide.length-1} aria-label='Next step'><ArrowRight size={19}/></button>
        </div>}
        <span className='orbit-hint'>Drag to rotate · Scroll to zoom</span>
      </div>
      {collapsed&&<div className='collapsed-info'>{machine.name} <span>·</span> {mode==='guide'?guide.title:machine.sub}</div>}
    </section>

    <aside className='sidebar' aria-label='Hardware inspector'>
      {mode==='explore'?<>
        <div className='sidebar-title'>
          <h1>{machine.name}</h1>
          <p>{machine.sub}</p>
        </div>
        <div className='selected-assembly'>
          <span className='section-rule'>SELECTED ASSEMBLY</span>
          <h2>{part.label}</h2>
          <span className='subtitle'>{part.summary}</span>
          <p>{part.detail}</p>
        </div>
        <div className='parts-list'>
          {machine.assemblies.map((a,i)=><button
            key={a.id} className={'list-line '+(a.id===selected?'current':'')}
            onClick={()=>selectPart(a.id)} aria-pressed={a.id===selected}>
            <span className='list-index'>{String(i+1).padStart(2,'0')}</span>
            <span>{a.label}</span>
            {a.id===selected&&<ChevronRight size={15}/>}
          </button>)}
        </div>
      </>:<>
        <div className='sidebar-title'>
          <h1>{machine.name}</h1>
          <p>Guided hardware walkthrough</p>
        </div>
        <div className='selected-assembly'>
          <span className='section-rule'>STEP {String(step+1).padStart(2,'0')} OF {String(machine.guide.length).padStart(2,'0')}</span>
          <h2>{guide.title}</h2>
          <p>{guide.text}</p>
          {guide.safety&&<div className='safety-note'>{guide.safety}</div>}
        </div>
        <div className='parts-list'>
          {machine.guide.map((s,i)=><button key={i}
            className={'list-line '+(i===step?'current':'')+(i<step?' complete':'')}
            onClick={()=>nextStep(i)} aria-current={step===i?'step':undefined}>
            <span className='list-index'>{String(i+1).padStart(2,'0')}</span>
            <span>{s.title}</span>
            {i===step&&<ChevronRight size={15}/>}
          </button>)}
        </div>
      </>}
      <div className='sidebar-end'>
        <a href={machine.reference} target='_blank' rel='noreferrer'>Official hardware documentation <ExternalLink size={14}/></a>
        <p>Interactive engineering study · reconstructed geometry, not manufacturer CAD.</p>
      </div>
    </aside>
  </div>;
}

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw } from 'lucide-react';
import Viewer from './server/Viewer';
import { BY_ID, COMPONENTS, REFERENCE_URLS, WALKTHROUGH, type ComponentId } from './server/data';

export default function App() {
  const [mode, setMode] = useState<'explore' | 'guide'>('explore');
  const [selected, setSelected] = useState<ComponentId>('cpus');
  const [step, setStep] = useState(0);
  const [explode, setExplode] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [error, setError] = useState('');
  const detail = BY_ID[selected];
  const current = WALKTHROUGH[step];

  const selectPart = (id: ComponentId) => {
    setSelected(id);
    if (mode === 'guide') setMode('explore');
  };
  const navigate = (newStep: number) => {
    const next = Math.max(0, Math.min(WALKTHROUGH.length - 1, newStep));
    setStep(next);
    setSelected(WALKTHROUGH[next].target);
  };
  const changeMode = (next: 'explore' | 'guide') => {
    setMode(next);
    if (next === 'guide') {
      navigate(0);
    } else {
      setSelected('cpus');
      setExplode(0);
    }
    setResetToken(x => x + 1);
  };
  const reset = () => {
    setResetToken(x => x + 1);
    if (mode === 'explore') setExplode(0);
    else navigate(0);
  };

  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (mode !== 'guide' || ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight') navigate(step + 1);
      if (e.key === 'ArrowLeft') navigate(step - 1);
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [mode, step]);

  return <div className='shell'>
    <header className='header'>
      <div className='identity'>
        <span className='identity-icon' aria-hidden='true'><span/><span/><span/></span>
        <div className='identity-text'>
          <strong>PowerEdge R760</strong>
          <span>Inside a datacenter server</span>
        </div>
      </div>
      <a className='official-link' href={REFERENCE_URLS.manual} target='_blank' rel='noreferrer'>
        Dell service manual <ExternalLink size={15} aria-hidden='true'/>
      </a>
    </header>
    <div className='experience'>
      <section className='model-area' aria-label='Interactive 3D server and disassembly controls'>
        <div className='view-controls'>
          <div className='switcher' role='group' aria-label='Exploration mode'>
            <button className={mode==='explore'?'current':''} aria-pressed={mode==='explore'} onClick={()=>changeMode('explore')}>Explore</button>
            <button className={mode==='guide'?'current':''} aria-pressed={mode==='guide'} onClick={()=>changeMode('guide')}>Step-by-step</button>
          </div>
          <button onClick={reset} className='reset-control' title='Reset camera and controls' aria-label='Reset model'>
            <RotateCcw size={17}/><span>Reset</span>
          </button>
        </div>
        <Viewer
          mode={mode} explode={explode} step={step} selected={selected}
          resetToken={resetToken} onSelect={selectPart} onError={setError}
        />
        {error && <div className='viewer-error' role='alert'>{error}</div>}
        <div className='interaction-hint'>Drag to rotate <span>·</span> Scroll to zoom <span>·</span> Click a part</div>
        <div className='bottom-control'>
          {mode==='explore' ? <>
            <div className='range-line'>
              <span>Assembled</span><span>{explode}% separated</span>
            </div>
            <input
              data-testid='explode-slider'
              type='range' min='0' max='100' step='1'
              value={explode}
              aria-label='Separate server components'
              style={{ '--fill': explode + '%' } as React.CSSProperties}
              onChange={e=>setExplode(Number(e.currentTarget.value))}
            />
          </> : <>
            <div className='step-controls'>
              <button className='step-back' aria-label='Previous step' onClick={()=>navigate(step-1)} disabled={step===0}><ArrowLeft size={20}/></button>
              <span className='step-count'>{step+1} <span>/</span> {WALKTHROUGH.length}</span>
              <div className='step-progress' aria-hidden='true'>
                {WALKTHROUGH.map((s,i)=><span key={s.target+i} className={i<=step?'done':''}/>)}
              </div>
              <button className='step-next' aria-label='Next step' onClick={()=>navigate(step+1)} disabled={step===WALKTHROUGH.length-1}>
                {step===WALKTHROUGH.length-1?'Finished':'Next'} <ArrowRight size={18}/>
              </button>
            </div>
          </>}
        </div>
      </section>

      <aside className='detail-panel'>
        {mode==='guide'? <>
          <div className='detail-content'>
            <div className='step-counter'>Step {String(step+1).padStart(2,'0')} of {WALKTHROUGH.length}</div>
            <h1>{current.title}</h1>
            <p className='description'>{current.description}</p>
            <div className='technical-note'>{current.note}</div>
          </div>
          <nav className='index' aria-label='Guided server disassembly steps'>
            <div className='index-title'>Disassembly path</div>
            <div className='index-scroll'>
              {WALKTHROUGH.map((s,i)=><button
                key={s.title}
                className={'index-item '+(step===i?'active':'')+(step>i?' done':'')}
                aria-current={step===i?'step':undefined}
                onClick={()=>navigate(i)}>
                <span className='row-n'>{String(i+1).padStart(2,'0')}</span>
                <span>{s.title}</span>
              </button>)}
            </div>
          </nav>
        </> : <>
          <div className='detail-content'>
            <div className='step-counter'>Component {String(COMPONENTS.findIndex(p=>p.id===selected)+1).padStart(2,'0')} / {COMPONENTS.length}</div>
            <h1>{detail.name}</h1>
            <p className='subtitle'>{detail.role}</p>
            <p className='description'>{detail.description}</p>
            <div className='technical-note'>{detail.hardware}</div>
          </div>
          <nav className='index' aria-label='Inspect hardware components'>
            <div className='index-title'>Inside this server</div>
            <div className='index-scroll'>
              {COMPONENTS.map((c,i)=><button
                key={c.id}
                className={'index-item '+(selected===c.id?'active':'')}
                aria-pressed={selected===c.id}
                onClick={()=>selectPart(c.id)}>
                <span className='row-n'>{String(i+1).padStart(2,'0')}</span>
                <span>{c.name}</span>
              </button>)}
            </div>
          </nav>
        </>}
        <div className='source-note'>Illustrated from Dell R760 documentation. Component placement is a close educational reconstruction, not OEM CAD or a repair procedure. <a href={REFERENCE_URLS.walkthrough} target='_blank' rel='noreferrer'>Dell’s official service walkthrough <ExternalLink size={12}/></a></div>
      </aside>
    </div>
  </div>;
}

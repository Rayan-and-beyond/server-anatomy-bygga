import { useState } from 'react';
import { ArrowUpRight, Box, Check, ChevronLeft, ChevronRight, Cpu, Layers3, Maximize2, MousePointer2, RotateCcw, ScanSearch, SlidersHorizontal, X } from 'lucide-react';
import Viewer from './server/Viewer';
import { parts, partById, type ComponentId } from './server/data';

export default function App() {
  const [explode, setExplode] = useState(43);
  const [selected, setSelected] = useState<ComponentId | null>('processors');
  const [resetCount, setResetCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const active = selected ? partById[selected] : null;
  const activeIndex = Math.max(0, parts.findIndex(p => p.id === selected));

  const stepSelection = (direction: number) => setSelected(parts[(activeIndex + direction + parts.length) % parts.length].id);
  const reset = () => { setSelected('processors'); setExplode(43); setResetCount(x => x + 1); };

  return <main className='app-shell'>
    <header className='topbar'>
      <a className='brand' href='#top' aria-label='Server Anatomy home'>
        <span className='brand-symbol'><Layers3 size={21} strokeWidth={1.8}/></span>
        <span>FIELDNOTES <span className='brand-muted'>/ LAB</span></span>
      </a>
      <span className='top-center'>INTERACTIVE HARDWARE STUDY <span className='slash'>/</span> VOL. 001</span>
      <a className='top-source' href='https://github.com/Nutlope/bygga' target='_blank' rel='noreferrer'>
        POWERED BY BYGGA <ArrowUpRight size={15}/>
      </a>
    </header>

    <section className='intro' id='top'>
      <div className='intro-label'><span className='pulse'/> SYSTEM STUDY / 001</div>
      <div className='intro-content'>
        <div>
          <h1>Inside the <em>server.</em></h1>
          <p>Take a machine apart. Understand what makes it work.</p>
        </div>
        <div className='intro-fact'><strong>9</strong><span>COMPONENT SYSTEMS<br/>ONE COMPLETE MACHINE</span></div>
      </div>
    </section>

    <div className='workspace'>
      <aside className='left-panel'>
        <div className='panel-heading'><span>01 <span className='heading-dash'>/</span> COMPONENT INDEX</span><span>{parts.length.toString().padStart(2, '0')}</span></div>
        <p className='panel-hint'>Select a part to inspect its role in the system.</p>
        <nav aria-label='Server components' className='parts-nav'>
          {parts.map((part, index) => <button key={part.id}
            className={'part-row ' + (selected === part.id ? 'active' : '')}
            onClick={() => setSelected(part.id)}
            aria-pressed={selected === part.id}
            data-testid={'component-' + part.id}>
            <span className='part-index'>{part.number}</span>
            <span className='part-title'>{part.name}</span>
            <span className='part-indicator'>{selected === part.id ? <span className='part-arrow'>↗</span> : <span className='part-dot'/>}</span>
          </button>)}
        </nav>
        <div className='sidebar-note'>
          <div className='sidebar-note-icon'><MousePointer2 size={17}/></div>
          <div><strong>Made to explore.</strong><br/><span>Rotate, separate, and inspect every subsystem.</span></div>
        </div>
      </aside>

      <section className='stage-panel' aria-label='3D server interactive diagram'>
        <div className='stage-toolbar'>
          <div className='stage-chip'><span className='online-dot'/> LIVE MODEL <span className='chip-line'>/</span> 2U RACK SERVER</div>
          <button className='icon-button' aria-label='How to control the 3D model' onClick={() => setShowHelp(v => !v)}><ScanSearch size={18}/></button>
        </div>
        <Viewer selected={selected} explode={explode} resetCount={resetCount} onPick={setSelected}/>
        <div className='stage-coordinates' aria-hidden='true'><span>VIEWPORT 01</span><span>ORTHOGRAPHIC / 3D</span></div>
        {showHelp && <div className='help-dialog'>
          <button aria-label='Close instructions' className='help-close' onClick={() => setShowHelp(false)}><X size={16}/></button>
          <strong>Navigate the model</strong>
          <p>Drag to rotate · Scroll to zoom · Click a component to inspect it. On touch devices, drag with one finger. Use the decomposition slider to spread the components apart.</p>
        </div>}
        <div className='stage-bottom'>
          <div className='mode-label'><SlidersHorizontal size={16}/> DECOMPOSITION</div>
          <div className='decomposition'>
            <div className='slider-top'><span>ASSEMBLED</span><span className='slider-percent'>{Math.round(explode)}%</span><span>EXPLODED</span></div>
            <input aria-label='Explode server components' data-testid='explode-slider' type='range' min='0' max='100' value={explode} onChange={e => setExplode(Number(e.target.value))} style={{ '--progress': explode + '%' } as React.CSSProperties}/>
            <div className='slider-stops' aria-hidden='true'><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
          </div>
          <button className='reset-button' aria-label='Reset the model view' onClick={reset}><RotateCcw size={18}/> <span>RESET</span></button>
        </div>
      </section>

      <aside className='right-panel'>
        <div className='panel-heading'><span>02 <span className='heading-dash'>/</span> PART INSPECTOR</span><span><Cpu size={17}/></span></div>
        {active ? <div className='inspector' key={active.id}>
          <div className='part-badge'>SELECTED COMPONENT <span>{active.number} / 09</span></div>
          <div className='component-art'>
            <div className='component-art-grid'/>
            <div className='component-art-mark' style={{ borderColor: active.accent }}>
              <Box size={48} strokeWidth={0.95} color={active.accent}/>
            </div>
            <span className='art-corner'>FIG {active.number}</span>
          </div>
          <div className='inspector-type'>{active.function.toUpperCase()}</div>
          <h2>{active.name}</h2>
          <p className='inspector-subtitle'>{active.subtitle}</p>
          <div className='inspector-divider'/>
          <div className='inspector-heading'>THE ROLE</div>
          <p className='inspector-copy'>{active.description}</p>
          <div className='inspector-heading'>GOOD TO KNOW</div>
          <p className='inspector-detail'>{active.detail}</p>
        </div> : <div className='inspector empty'><h2>Choose a component</h2><p>Click a part of the 3D model to learn more about it.</p></div>}
        <div className='inspector-bottom'>
          <div className='navigator-label'>EXPLORE COMPONENTS</div>
          <div className='navigator'>
            <button aria-label='Previous component' onClick={() => stepSelection(-1)}><ChevronLeft size={19}/></button>
            <span>{String(activeIndex + 1).padStart(2, '0')} <span className='nav-separator'>/</span> {String(parts.length).padStart(2, '0')}</span>
            <button aria-label='Next component' onClick={() => stepSelection(1)}><ChevronRight size={19}/></button>
          </div>
        </div>
      </aside>
    </div>

    <footer className='footer'>
      <div><span className='footer-check'><Check size={13}/></span> INTERACTIVE LEARNING PROTOTYPE <span className='footer-divider'>·</span> CONCEPTUAL HARDWARE, NOT A REPAIR GUIDE</div>
      <div>THREE.JS <span className='footer-divider'>×</span> BYGGA MIT ENGINE <span className='footer-divider'>·</span> <a href='https://github.com/Nutlope/bygga' target='_blank' rel='noreferrer'>VIEW SOURCE <ArrowUpRight size={12}/></a></div>
    </footer>
  </main>;
}

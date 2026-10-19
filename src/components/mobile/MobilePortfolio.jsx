"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, FileText, Github, House, Linkedin, Mail, Menu, UserRound, X } from 'lucide-react';
import portfolio from '@/config/portfolio.json';
import LeafMark from './LeafMark';
import styles from './MobilePortfolio.module.css';

const projects = portfolio.projects.filter(project => !project._disabled);
const novel = projects.find(project => project.name.startsWith('Novel Writing'));
const orderedProjects = [projects[0], novel, ...projects.filter(project => project !== projects[0] && project !== novel)].filter(Boolean);
const summaries = {
  ReddiChat: 'Answers grounded in Reddit.',
  [novel?.name]: 'A LLaMA model for fiction.',
};
const slug = project => project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
const titles = { work: 'Selected work', me: 'A little about me', menu: 'Explore', contact: 'Get in touch', resume: 'Résumé' };

function readLocation() {
  const hash = window.location.hash.slice(1);
  if (Object.hasOwn(titles, hash)) return hash;
  if (hash.startsWith('project/')) return projects.some(project => slug(project) === hash.slice(8)) ? hash : 'work';
  const app = new URLSearchParams(window.location.search).get('app');
  return { projects: 'work', about: 'me', contact: 'contact', experience: 'resume', resume: 'resume' }[app] || 'home';
}

function ProjectMedia({ project, detail = false }) {
  if (/\.(webm|mp4)$/i.test(project.image)) {
    return detail ? (
      <video className={styles.projectImage} src={project.image} autoPlay muted loop playsInline preload="auto" aria-label={`${project.name} preview`} />
    ) : (
      <img className={styles.projectImage} src={`/images/mobile/${project.image.split('/').pop().replace(/\.(webm|mp4)$/i, '.webp')}`} alt={`${project.name} preview`} loading="lazy" decoding="async" />
    );
  }
  // These are the original portfolio assets, loaded only when their sheet opens.
  return <img className={styles.projectImage} src={project.image} alt={`${project.name} preview`} loading="lazy" decoding="async" />;
}

function ExternalLink({ href, children, className }) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={18} aria-hidden="true" /></a>;
}

export default function MobilePortfolio() {
  const [view, setView] = useState('home');
  const [landscapeReady, setLandscapeReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState(null);
  const dragRef = useRef(null);
  const headingRef = useRef(null);
  const sheetRef = useRef(null);
  const menuRef = useRef(null);
  const workRef = useRef(null);
  const returnFocusRef = useRef(null);
  const wallpaperRef = useRef(null);
  const sheetFrameRef = useRef(null);
  const selectedProject = view.startsWith('project/') ? projects.find(project => slug(project) === view.slice(8)) : null;
  const open = view !== 'home';
  const selectedDock = view === 'work' || selectedProject ? 'work' : ['me', 'resume', 'contact'].includes(view) ? 'me' : 'home';

  function navigate(next) {
    if (next === view) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('app');
    url.hash = next === 'home' ? '' : next;
    window.history.pushState(null, '', url);
    if (view === 'home' || next === 'menu') returnFocusRef.current = document.activeElement;
    setView(next);
    setDragHeight(null);
  }

  function dismiss() {
    navigate(selectedProject ? 'work' : 'home');
  }

  function startDrag(event) {
    if (view === 'menu' || event.button !== 0) return;
    if (event.target.closest('button') && !event.target.closest('[data-drag-handle]')) return;
    dragRef.current = { startY: event.clientY, startHeight: sheetFrameRef.current.getBoundingClientRect().height, dragged: false };
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const distance = drag.startY - event.clientY;
    if (Math.abs(distance) < 8 && !drag.dragged) return;
    if (!drag.dragged) event.currentTarget.setPointerCapture(event.pointerId);
    drag.dragged = true;
    setDragHeight(Math.max(200, Math.min(window.innerHeight - 12, drag.startHeight + distance)));
  }

  function endDrag(event) {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.dragged) {
      const distance = drag.startY - event.clientY;
      if (Math.abs(distance) > 35) setExpanded(distance > 0);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragHeight(null);
    dragRef.current = null;
  }

  useEffect(() => {
    const restore = () => { setView(readLocation()); setDragHeight(null); };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    if (wallpaperRef.current?.complete) setLandscapeReady(true);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, []);

  useEffect(() => {
    sheetRef.current?.scrollTo(0, 0);
    if (open) headingRef.current?.focus({ preventScroll: true });
    else if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus({ preventScroll: true });
    else if (returnFocusRef.current) workRef.current?.focus({ preventScroll: true });
  }, [view, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const next = selectedProject ? 'work' : 'home';
        const url = new URL(window.location.href);
        url.searchParams.delete('app');
        url.hash = next === 'home' ? '' : next;
        window.history.pushState(null, '', url);
        setView(next);
        setDragHeight(null);
        if (view === 'menu') menuRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selectedProject, view]);

  function contactLinks() {
    return (
      <div className={styles.contactLinks}>
        <a className={styles.contactRow} href={`mailto:${portfolio.contact.email}`}><Mail size={22} /><span>Email<small>{portfolio.contact.email}</small></span><ArrowUpRight size={18} /></a>
        <ExternalLink className={styles.contactRow} href={`https://${portfolio.contact.github}`}><Github size={22} /><span>GitHub<small>Code and experiments</small></span></ExternalLink>
        <ExternalLink className={styles.contactRow} href={`https://${portfolio.contact.linkedin}`}><Linkedin size={22} /><span>LinkedIn<small>Let’s connect</small></span></ExternalLink>
      </div>
    );
  }

  return (
    <main className={styles.portfolio}>
      <img ref={wallpaperRef} className={styles.landscape} src="/images/worlds/ghibli/mobile-landscape.webp" alt="" fetchPriority="high" onLoad={() => setLandscapeReady(true)} onError={() => setLandscapeReady(true)} />
      {!landscapeReady && <div className={styles.loader} role="status"><LeafMark /><span>Opening a little world…</span></div>}
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate('home')} aria-label="Manish Singh — Home"><LeafMark /><span>Manish Singh</span></button>
        <button ref={menuRef} className={styles.iconButton} aria-label={view === 'menu' ? 'Close navigation' : 'Open navigation'} aria-expanded={view === 'menu'} aria-controls={view === 'menu' ? 'mobile-sheet' : undefined} onClick={() => navigate(view === 'menu' ? 'home' : 'menu')}><Menu size={26} /></button>
      </header>

      {!open && <section className={styles.hero} aria-label="Introduction">
        <h1>Software, built<br />with purpose.</h1>
        <p>{portfolio.title}.</p>
        <button className={`${styles.glass} ${styles.explore}`} onClick={() => navigate('work')}>Explore work<ArrowRight size={20} /></button>
      </section>}

      {open && <>
        <button className={styles.backdrop} onClick={dismiss} aria-label="Dismiss panel" tabIndex={-1} />
        <section ref={sheetFrameRef} id="mobile-sheet" role="dialog" aria-labelledby="mobile-sheet-title" style={dragHeight === null ? undefined : { height: dragHeight }} className={`${styles.sheet} ${styles.glass} ${view === 'menu' ? styles.menuSheet : ''} ${selectedProject || ['me', 'resume', 'contact'].includes(view) ? styles.tallSheet : ''} ${expanded && view !== 'menu' ? styles.expandedSheet : ''} ${dragHeight !== null ? styles.draggingSheet : ''}`}>
          <div className={`${styles.sheetHeader} ${view !== 'menu' ? styles.draggableHeader : ''}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { dragRef.current = null; setDragHeight(null); }}>
          {view !== 'menu' && <button data-drag-handle className={styles.dragHandle} aria-label={expanded ? 'Collapse panel' : 'Expand panel to fullscreen'} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span className={styles.handle} aria-hidden="true" /></button>}
          <div className={styles.sheetTop}>
            {selectedProject ? <button className={styles.backButton} onClick={() => navigate('work')}><ArrowLeft size={18} />Back to work</button> : <span />}
            <button className={styles.iconButton} onClick={dismiss} aria-label={selectedProject ? 'Back to work' : 'Close panel'}><X size={21} /></button>
          </div>
          <h2 id="mobile-sheet-title" ref={headingRef} tabIndex={-1} className={styles.sheetTitle}>{selectedProject ? (selectedProject === novel ? 'Novel Writing AI' : selectedProject.name) : titles[view] || 'Selected work'}</h2>
          </div>
          <div ref={sheetRef} className={styles.sheetScroll}>

          {view === 'work' && <div className={styles.projectList}>
            {orderedProjects.map(project => <button className={styles.projectRow} key={project.name} onClick={() => navigate(`project/${slug(project)}`)}>
              <span className={styles.thumbnail}><ProjectMedia project={project} /></span>
              <span className={styles.projectCopy}><strong>{project === novel ? 'Novel Writing AI' : project.name}</strong><span>{summaries[project.name] || project.techStack.slice(0, 3).join(' / ')}</span></span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>)}
          </div>}

          {selectedProject && <div className={styles.detail}>
            {summaries[selectedProject.name] && <p className={styles.subtitle}>{summaries[selectedProject.name]}</p>}
            <div className={styles.detailMedia}><ProjectMedia project={selectedProject} detail /></div>
            <p>{selectedProject.description}</p>
            <ul className={styles.tags} aria-label="Technologies">{selectedProject.techStack.map(skill => <li key={skill}>{skill}</li>)}</ul>
            <div className={styles.actions}>
              <ExternalLink className={styles.primaryButton} href={selectedProject.live}>{selectedProject === novel ? 'View dataset' : selectedProject.live.includes('github.com') ? 'View project' : 'Visit project'}</ExternalLink>
              <ExternalLink className={styles.textLink} href={selectedProject.github}>{selectedProject === novel ? 'View model' : 'GitHub'}</ExternalLink>
            </div>
          </div>}

          {view === 'me' && <div className={styles.body}>
            <p className={styles.subtitle}>{portfolio.title}.</p>
            <p>{portfolio.bio}</p>
            <h3>Things I work with</h3>
            <ul className={styles.tags}>{['Python', 'React / Next.js', 'TypeScript', 'Voice agents', 'LangGraph', 'FastAPI', 'AWS'].map(skill => <li key={skill}>{skill}</li>)}</ul>
            <div className={styles.actions}><button className={styles.primaryButton} onClick={() => navigate('contact')}>Get in touch<ArrowRight size={18} /></button><button className={styles.textLink} onClick={() => navigate('resume')}>Résumé<ArrowRight size={18} /></button></div>
            <div className={styles.socialLinks}>{portfolio.socials.slice(0, 2).map(social => <ExternalLink key={social.platform} className={styles.textLink} href={social.url}>{social.platform}</ExternalLink>)}</div>
          </div>}

          {view === 'menu' && <nav className={styles.menuList} aria-label="Explore portfolio">
            {[['home', House, 'Home', 'Back to the landscape'], ['work', BriefcaseBusiness, 'Work', 'Projects and experiments'], ['me', UserRound, 'Me', 'A little about me'], ['contact', Mail, 'Contact', 'Start a conversation'], ['resume', FileText, 'Résumé', 'Experience and skills']].map(([target, Icon, label, caption]) => <button key={target} onClick={() => navigate(target)}><Icon size={20} /><span>{label}<small>{caption}</small></span><ArrowRight size={17} /></button>)}
          </nav>}

          {view === 'contact' && <div className={styles.body}><p className={styles.subtitle}>Let’s make something useful.</p><p>Have a project in mind, a question, or just want to say hello? I’d love to hear from you.</p>{contactLinks()}</div>}

          {view === 'resume' && <div className={styles.body}>
            <p className={styles.subtitle}>Experience, skills, and education.</p>
            <h3>Experience</h3>{portfolio.experience.map(job => <article className={styles.resumeEntry} key={`${job.company}-${job.position}`}><h4>{job.position}</h4><span>{job.company} · {job.duration}</span><p>{job.description}</p></article>)}
            <h3>Skills</h3>{Object.entries(portfolio.skills).map(([category, skills]) => <div className={styles.skillGroup} key={category}><h4>{{languages: 'Languages', frameworks: 'Frameworks', tools: 'Tools', ai_ml: 'AI & machine learning'}[category]}</h4><p>{skills.join(' · ')}</p></div>)}
            <h3>Education</h3>{portfolio.education.map(item => <article className={styles.resumeEntry} key={item.degree || item.certification}><h4>{item.degree || item.certification}</h4><p>{item.institution} · {item.year}</p>{item.cgpa && <p>CGPA: {item.cgpa}</p>}</article>)}
            <button className={styles.primaryButton} onClick={() => navigate('contact')}>Get in touch<ArrowRight size={18} /></button>
          </div>}
          </div>
        </section>
      </>}

      <nav className={`${styles.dock} ${styles.glass}`} aria-label="Main navigation">
        {[['home', House, 'Home'], ['work', BriefcaseBusiness, 'Work'], ['me', UserRound, 'Me']].map(([target, Icon, label]) => <button ref={target === 'work' ? workRef : undefined} key={target} className={selectedDock === target ? styles.activeDock : ''} aria-current={selectedDock === target ? 'page' : undefined} onClick={() => navigate(target)}><Icon size={22} strokeWidth={1.8} fill={selectedDock === target && target !== 'me' ? 'currentColor' : 'none'} /><span>{label}</span></button>)}
      </nav>
    </main>
  );
}

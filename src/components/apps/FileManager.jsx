'use client';

import { useState, useMemo } from 'react';
import portfolioData from '@/config/portfolio.json';

const GREEN = 'var(--dt-accent)';
const GREEN_DIM = 'var(--dt-accent-dim)';
const GREEN_BG = 'var(--dt-accent-soft)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const webTech = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vue', 'Angular'];
const aiTech = ['Python', 'PyTorch', 'TensorFlow', 'LLM', 'LLaMA', 'Llama', 'Whisper', 'YOLOv5', 'GFPGAN', 'Deep Speech', 'LangChain', 'HuggingFace', 'OpenAI', 'Transformers'];

const allProjects = (portfolioData.projects || []).filter((p) => !p._disabled);

function filterProjects(dir) {
  if (dir === 'all') return allProjects;
  if (dir === 'web-apps') return allProjects.filter((p) => p.techStack?.some((t) => webTech.some((wt) => t.includes(wt))));
  if (dir === 'ai-ml') return allProjects.filter((p) => p.techStack?.some((t) => aiTech.some((at) => t.includes(at))));
  if (dir === 'featured') return allProjects.filter((p) => p.featured);
  return allProjects;
}

const dirs = [
  { id: 'all', label: 'all/', count: allProjects.length },
  { id: 'web-apps', label: 'web-apps/', count: filterProjects('web-apps').length },
  { id: 'ai-ml', label: 'ai-ml/', count: filterProjects('ai-ml').length },
  { id: 'featured', label: 'featured/', count: filterProjects('featured').length },
];

export default function FileManager() {
  const [selectedDir, setSelectedDir] = useState('all');
  const [hoveredRow, setHoveredRow] = useState(null);

  const projects = useMemo(() => filterProjects(selectedDir), [selectedDir]);

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'monospace', fontSize: '13px', color: TEXT_PRIMARY }}>
      {/* Left sidebar */}
      <div style={{
        width: '200px',
        flexShrink: 0,
        borderRight: `1px solid ${GREEN_BORDER}`,
        padding: '12px 0',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 12px 8px', color: TEXT_MUTED, fontSize: '11px', letterSpacing: '0.05em' }}>
          ~/projects/
        </div>
        <div className="world-divider" />
        {dirs.map((dir) => (
          <div
            key={dir.id}
            onClick={() => setSelectedDir(dir.id)}
            style={{
              padding: '6px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: selectedDir === dir.id ? 'var(--dt-accent-soft-2)' : 'transparent',
              borderLeft: selectedDir === dir.id ? `2px solid ${GREEN}` : '2px solid transparent',
              color: selectedDir === dir.id ? GREEN : TEXT_PRIMARY,
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '12px' }}>📂</span>
            <span style={{ flex: 1 }}>{dir.label}</span>
            <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>{dir.count}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '24px 1fr 180px 60px',
          gap: '8px',
          padding: '8px 16px',
          borderBottom: `1px solid ${GREEN_BORDER}`,
          color: TEXT_MUTED,
          fontSize: '11px',
          letterSpacing: '0.05em',
          position: 'sticky',
          top: 0,
          background: 'var(--dt-surface)',
          zIndex: 1,
        }}>
          <span></span>
          <span>NAME</span>
          <span>TECH STACK</span>
          <span>STATUS</span>
        </div>

        {/* Project rows */}
        {projects.length === 0 ? (
          <div style={{ padding: '32px 16px', color: TEXT_MUTED, textAlign: 'center' }}>
            No projects found.
          </div>
        ) : (
          projects.map((project) => {
            const isLive = project.live && project.live !== project.github;
            const url = project.live || project.github;
            const techTags = (project.techStack || []).slice(0, 3);

            return (
              <div
                key={project.name}
                onClick={() => window.open(url, '_blank')}
                onMouseEnter={() => setHoveredRow(project.name)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 180px 60px',
                  gap: '8px',
                  padding: '9px 16px',
                  cursor: 'pointer',
                  background: hoveredRow === project.name ? GREEN_BG : 'transparent',
                  borderBottom: `1px solid var(--dt-accent-border-dim)`,
                  alignItems: 'center',
                  transition: 'background 0.1s ease',
                }}
              >
                <span style={{ fontSize: '14px' }}>📄</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.name}
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {techTags.map((t, ti) => (
                    <span key={ti} style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      border: `1px solid ${GREEN_BORDER}`,
                      borderRadius: '3px',
                      color: GREEN_DIM,
                      whiteSpace: 'nowrap',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '13px', textAlign: 'center' }}>
                  {isLive ? '🟢' : '⚫'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

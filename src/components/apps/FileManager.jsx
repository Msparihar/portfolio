'use client';

import { useState, useMemo, useEffect } from 'react';
import portfolioData from '@/config/portfolio.json';
import { getCurrentWorldId, getWorldFileIcon, createWorldChangeListener } from '@/config/worldContent';

const GREEN = 'var(--dt-accent)';
const GREEN_DIM = 'var(--dt-accent-dim)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const GREEN_BORDER_STRONG = 'var(--dt-accent-border-strong)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';
const SURFACE_INPUT = 'var(--dt-surface-input)';
const RADIUS = 'var(--dt-window-radius, 12px)';

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

function ProjectCard({ project, worldId, hovered, onHover }) {
  const isLive = project.live && project.live !== project.github;
  const url = project.live || project.github;
  const techTags = (project.techStack || []).slice(0, 3);
  const techOverflow = (project.techStack || []).length - techTags.length;

  const openUrl = (e, target) => {
    e.stopPropagation();
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      onMouseEnter={() => onHover(project.name)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: RADIUS,
        border: `1px solid ${hovered ? GREEN_BORDER_STRONG : GREEN_BORDER}`,
        background: SURFACE_INPUT,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? 'var(--dt-shadow-unfocused)' : 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: project.image ? `url(${project.image})` : 'none',
          backgroundColor: 'var(--dt-accent-soft)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.4s ease',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%)',
        }} />
        {project.featured && (
          <span style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.04em',
            padding: '3px 8px',
            borderRadius: 999,
            background: GREEN,
            color: 'var(--dt-accent-contrast, #fff)',
          }}>
            ★ Featured
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{getWorldFileIcon(worldId, 'document')}</span>
          <span style={{
            flex: 1,
            fontFamily: 'var(--dt-font-heading, inherit)',
            fontWeight: 600,
            fontSize: 15,
            color: TEXT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {project.name}
          </span>
          <span style={{ fontSize: 11, color: isLive ? GREEN : TEXT_MUTED }}>{isLive ? '● live' : '○ repo'}</span>
        </div>

        <p style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: TEXT_MUTED,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '36px',
        }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {techTags.map((t, ti) => (
            <span key={ti} style={{
              fontSize: 10,
              padding: '2px 8px',
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: 999,
              color: 'var(--dt-accent-70)',
              whiteSpace: 'nowrap',
            }}>
              {t}
            </span>
          ))}
          {techOverflow > 0 && (
            <span style={{ fontSize: 10, padding: '2px 6px', color: TEXT_MUTED }}>+{techOverflow}</span>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: 14,
          marginTop: 2,
          paddingTop: 10,
          borderTop: `1px solid var(--dt-accent-border-dim)`,
          fontSize: 11,
        }}>
          {project.live && (
            <button onClick={(e) => openUrl(e, project.live)} style={linkBtnStyle}>Live ↗</button>
          )}
          {project.github && (
            <button onClick={(e) => openUrl(e, project.github)} style={linkBtnStyle}>GitHub ↗</button>
          )}
        </div>
      </div>
    </div>
  );
}

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: GREEN_DIM,
  fontFamily: 'inherit',
  fontSize: 11,
};

export default function FileManager() {
  const [selectedDir, setSelectedDir] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [worldId, setWorldId] = useState(null);

  useEffect(() => {
    setWorldId(getCurrentWorldId());
    return createWorldChangeListener((id) => setWorldId(id));
  }, []);

  const projects = useMemo(() => filterProjects(selectedDir), [selectedDir]);
  const activeDir = dirs.find((d) => d.id === selectedDir);

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '13px', color: TEXT_PRIMARY }}>
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
            <span style={{ fontSize: '12px' }}>{getWorldFileIcon(worldId, 'folder')}</span>
            <span style={{ flex: 1 }}>{dir.label}</span>
            <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>{dir.count}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          padding: '12px 16px',
          borderBottom: `1px solid ${GREEN_BORDER}`,
          position: 'sticky',
          top: 0,
          background: 'var(--dt-surface)',
          zIndex: 1,
        }}>
          <span style={{ color: GREEN, fontSize: 13 }}>{activeDir?.label}</span>
          <span style={{ color: TEXT_MUTED, fontSize: 11 }}>{projects.length} project{projects.length === 1 ? '' : 's'}</span>
        </div>

        {projects.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '48px 16px',
            color: TEXT_MUTED,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 28, opacity: 0.5 }}>{getWorldFileIcon(worldId, 'folder')}</span>
            <span>This folder is empty for now.</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            padding: 16,
          }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
                worldId={worldId}
                hovered={hoveredCard === project.name}
                onHover={setHoveredCard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

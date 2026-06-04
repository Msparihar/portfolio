'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import portfolioData from '@/config/portfolio.json';
import { getCurrentWorldId, getWorldFileIcon, createWorldChangeListener, getGhibliPoemFooter } from '@/config/worldContent';
import PoemFooter from '@/components/welcome/PoemFooter';
import GlassShimmerOverlay from '@/components/effects/GlassShimmerOverlay';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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

// Grove sidebar nav — maps existing dir IDs to Ghibli names
const grovePlaces = [
  { id: 'all',      label: 'Garden',     emoji: '🌻' },
  { id: 'web-apps', label: 'Greenhouse', emoji: '🌿' },
  { id: 'ai-ml',    label: 'Atelier',    emoji: '🎨' },
  { id: 'featured', label: 'Journals',   emoji: '📔' },
];

// Tile gradients per dir, matching spec palette
const TILE_GRADIENTS = {
  'all':      'linear-gradient(135deg, #a3cf94, #5a9268)',
  'web-apps': 'linear-gradient(135deg, #ffd98a, #f0a94a)',
  'ai-ml':    'linear-gradient(135deg, #cdb6e0, #8a6fb0)',
  'featured': 'linear-gradient(135deg, #9fd3e0, #4a93a8)',
};

function getProjectTileStyle(project, dirId) {
  if (project.image) {
    return {
      backgroundImage: `url(${project.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  const isWeb = project.techStack?.some((t) => webTech.some((wt) => t.includes(wt)));
  const isAi  = project.techStack?.some((t) => aiTech.some((at) => t.includes(at)));
  if (isAi)  return { background: TILE_GRADIENTS['ai-ml'] };
  if (isWeb) return { background: TILE_GRADIENTS['web-apps'] };
  return { background: TILE_GRADIENTS[dirId] ?? TILE_GRADIENTS['all'] };
}

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

// ─── Grove card (Ghibli layout) ────────────────────────────────────────────

function GroveCard({ project, dirId, hovered, onHover }) {
  const isLive = project.live && project.live !== project.github;
  const url = project.live || project.github;
  const tileStyle = getProjectTileStyle(project, dirId);
  const meta = isLive ? 'live' : `${(project.techStack || []).length} skills`;

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
        gap: 10,
        padding: 14,
        borderRadius: 'var(--sg-card-radius)',
        background: 'var(--sg-card-fill)',
        border: `1px solid var(--sg-card-stroke)`,
        cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(51, 68, 47, 0.15)' : 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      <div style={{
        width: 54,
        height: 54,
        borderRadius: 14,
        flexShrink: 0,
        ...tileStyle,
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--sg-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {project.name}
        </span>
        <span style={{
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          fontSize: 11,
          color: 'var(--sg-text-label)',
        }}>
          {meta}
        </span>
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 'auto',
        paddingTop: 8,
        borderTop: `1px solid var(--sg-sidebar-divider)`,
        fontSize: 11,
      }}>
        {project.live && (
          <button
            type="button"
            onClick={(e) => openUrl(e, project.live)}
            style={groveLinkBtnStyle}
          >
            Live ↗
          </button>
        )}
        {project.github && (
          <button
            type="button"
            onClick={(e) => openUrl(e, project.github)}
            style={groveLinkBtnStyle}
          >
            GitHub ↗
          </button>
        )}
      </div>
    </div>
  );
}

const groveLinkBtnStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontFamily: 'var(--font-geist), system-ui, sans-serif',
  fontSize: 11,
  color: 'var(--sg-text-secondary)',
};

const groveTags = [
  { id: 'web-apps', label: 'Seeds' },
  { id: 'ai-ml',    label: 'Blooms' },
  { id: 'featured', label: 'Roots' },
];

// ─── Ghibli Grove layout ───────────────────────────────────────────────────

function GroveLayout({ selectedDir, setSelectedDir, projects, poemText, mode, onToggleMode, reducedMotion }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const activePlaceLabel = grovePlaces.find((p) => p.id === selectedDir)?.label ?? 'Garden';

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {mode === 'conservatory' && !reducedMotion && <GlassShimmerOverlay />}

      {/* Sidebar */}
      <div style={{
        width: 248,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '18px 14px',
        background: 'var(--sg-sidebar-fill)',
        borderRight: `1px solid var(--sg-sidebar-divider)`,
        overflowY: 'auto',
      }}>
        {/* PLACES */}
        <span style={{
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 2,
          color: 'var(--sg-text-label)',
          marginBottom: 8,
        }}>
          PLACES
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
          {grovePlaces.map((place) => {
            const active = selectedDir === place.id;
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedDir(place.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 11px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'var(--sg-nav-active-bg)' : 'transparent',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 16 }}>{place.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-geist), system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--sg-accent-end)' : 'var(--sg-text-secondary)',
                }}>
                  {place.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: 'var(--sg-sidebar-divider)', margin: '0 0 16px' }} />

        {/* TAGS */}
        <span style={{
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 2,
          color: 'var(--sg-text-label)',
          marginBottom: 8,
        }}>
          TAGS
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {groveTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedDir(tag.id)}
              style={{
                display: 'inline-block',
                padding: '7px 11px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: selectedDir === tag.id ? 'var(--sg-nav-active-bg)' : 'transparent',
                fontFamily: 'var(--font-geist), system-ui, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--sg-text-secondary)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '24px 24px 16px',
          gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontFamily: 'var(--font-geist), system-ui, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 2,
              color: 'var(--sg-label-color)',
            }}>
              THE GROVE › {activePlaceLabel.toUpperCase()}
            </span>
            <span style={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: 27,
              fontStyle: 'italic',
              color: 'var(--sg-text-primary)',
              lineHeight: 1,
            }}>
              {activePlaceLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={{
                padding: '5px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.50)',
                fontFamily: 'var(--font-geist), system-ui, sans-serif',
                fontSize: 12,
                color: 'var(--sg-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              Recently tended ▾
            </button>
            <button
              type="button"
              aria-label={mode === 'conservatory' ? 'Switch to Grove' : 'Switch to Conservatory'}
              aria-pressed={mode === 'conservatory'}
              onClick={onToggleMode}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'conservatory' ? 'var(--sg-nav-active-bg)' : 'rgba(255, 255, 255, 0.50)',
                fontFamily: 'var(--font-geist), system-ui, sans-serif',
                fontSize: 12,
                color: mode === 'conservatory' ? 'var(--sg-accent-end)' : 'var(--sg-text-secondary)',
                fontWeight: mode === 'conservatory' ? 600 : 400,
                transition: 'background 0.18s ease, color 0.18s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'conservatory' ? '✦ Conservatory' : '✦ Grove'}
            </button>
          </div>
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '48px 24px',
            color: 'var(--sg-text-label)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 28, opacity: 0.5 }}>🌱</span>
            <span style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif', fontSize: 13 }}>
              This clearing is quiet for now.
            </span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            padding: '0 24px 24px',
          }}>
            {projects.map((project) => (
              <GroveCard
                key={project.name}
                project={project}
                dirId={selectedDir}
                hovered={hoveredCard === project.name}
                onHover={setHoveredCard}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 1, background: 'rgba(51, 68, 47, 0.08)', margin: '0 24px' }} />
          <div style={{ padding: '14px 24px' }}>
            <PoemFooter text={poemText} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root component ────────────────────────────────────────────────────────

export default function FileManager() {
  const [selectedDir, setSelectedDir] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [worldId, setWorldId] = useState(null);
  const [mode, setMode] = useState('grove');
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setWorldId(getCurrentWorldId());
    return createWorldChangeListener((id) => setWorldId(id));
  }, []);

  const handleToggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'grove' ? 'conservatory' : 'grove';
      window.dispatchEvent(new CustomEvent('conservatory-mode-changed', { detail: { active: next === 'conservatory' } }));
      return next;
    });
  }, []);

  const projects = useMemo(() => filterProjects(selectedDir), [selectedDir]);
  const activeDir = dirs.find((d) => d.id === selectedDir);
  const poemText = getGhibliPoemFooter(worldId, 'filemanager');

  if (worldId === 'ghibli') {
    return (
      <GroveLayout
        selectedDir={selectedDir}
        setSelectedDir={setSelectedDir}
        projects={projects}
        poemText={poemText}
        mode={mode}
        onToggleMode={handleToggleMode}
        reducedMotion={reducedMotion}
      />
    );
  }

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

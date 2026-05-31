'use client';

import { useState, useEffect } from 'react';
import { getCurrentWorldId, createWorldChangeListener } from '@/config/worldContent';
import CODEX_DATA from '@/config/codex.js';

const ACCENT        = 'var(--dt-accent)';
const ACCENT_BORDER = 'var(--dt-accent-border)';
const ACCENT_BORDER_STRONG = 'var(--dt-accent-border-strong)';
const ACCENT_SOFT   = 'var(--dt-accent-soft)';
const ACCENT_SOFT_2 = 'var(--dt-accent-soft-2)';
const TEXT_PRIMARY  = 'var(--dt-text)';
const TEXT_MUTED    = 'var(--dt-text-muted)';
const SURFACE_INPUT = 'var(--dt-surface-input)';
const RADIUS        = 'var(--dt-window-radius, 12px)';

const SKINS = {
  'elden-ring': {
    fontHeading: '"Cinzel", "Palatino Linotype", serif',
    fontBody: '"Crimson Text", "Georgia", serif',
    fontMono: '"Geist Mono", monospace',
    divider: '━━━ ✦ ━━━',
  },
  'ghibli': {
    fontHeading: '"Newsreader", "Palatino Linotype", serif',
    fontBody: '"Newsreader", "Georgia", serif',
    fontMono: 'var(--dt-font-mono, monospace)',
    divider: '— ✿ —',
  },
  'got': {
    fontHeading: '"Cinzel", "Palatino Linotype", serif',
    fontBody: '"Crimson Text", "Georgia", serif',
    fontMono: 'var(--dt-font-mono, monospace)',
    divider: '— ⚔ —',
  },
};

const DEFAULT_SKIN = SKINS['elden-ring'];

function getSkin(worldId) {
  return SKINS[worldId] ?? DEFAULT_SKIN;
}

function getWorldData(worldId) {
  return CODEX_DATA[worldId] ?? CODEX_DATA['elden-ring'];
}

export default function Codex() {
  const [worldId, setWorldId]               = useState(() => getCurrentWorldId());
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedEntryId, setSelectedEntryId]   = useState(null);
  const [search, setSearch]                 = useState('');
  const [hoveredCardId, setHoveredCardId]   = useState(null);

  useEffect(() => createWorldChangeListener(setWorldId), []);

  const skin = getSkin(worldId);
  const data = getWorldData(worldId);
  const { categories, entries } = data;

  const effectiveCategory = activeCategoryId ?? categories[0]?.id ?? null;

  useEffect(() => {
    setActiveCategoryId(null);
    setSelectedEntryId(null);
    setSearch('');
  }, [worldId]);

  const categoryEntries = entries.filter((e) => e.category === effectiveCategory);
  const filtered = categoryEntries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.snippet.toLowerCase().includes(q);
  });

  function selectCategory(id) {
    setActiveCategoryId(id);
    setSearch('');
    const first = entries.find((e) => e.category === id);
    setSelectedEntryId(first?.id ?? null);
  }

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) ?? filtered[0] ?? null;

  const activeCat = categories.find((c) => c.id === effectiveCategory);

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      fontFamily: skin.fontBody,
      fontSize: 13,
      color: TEXT_PRIMARY,
      overflow: 'hidden',
    }}>
      {/* Left rail */}
      <div style={{
        width: 200,
        flexShrink: 0,
        borderRight: `1px solid ${ACCENT_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 12px 8px', color: TEXT_MUTED, fontFamily: skin.fontMono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          The Archive
        </div>

        <div style={{ padding: '0 12px 10px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: SURFACE_INPUT,
              border: `1px solid ${ACCENT_BORDER}`,
              borderRadius: 6,
              padding: '5px 10px',
              color: TEXT_PRIMARY,
              fontFamily: skin.fontMono,
              fontSize: 11,
              outline: 'none',
            }}
          />
        </div>

        <div className="world-divider" />

        {categories.map((cat) => {
          const isActive = cat.id === effectiveCategory;
          const count = entries.filter((e) => e.category === cat.id).length;
          return (
            <div
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              style={{
                padding: '7px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isActive ? ACCENT_SOFT_2 : 'transparent',
                borderLeft: `2px solid ${isActive ? ACCENT : 'transparent'}`,
                color: isActive ? ACCENT : TEXT_PRIMARY,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 14 }}>{cat.icon}</span>
              <span style={{ flex: 1, fontFamily: skin.fontBody, fontSize: 13 }}>{cat.label}</span>
              <span style={{ color: TEXT_MUTED, fontFamily: skin.fontMono, fontSize: 11 }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Center grid */}
      <div style={{
        width: 280,
        flexShrink: 0,
        borderRight: `1px solid ${ACCENT_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          padding: '12px 14px',
          borderBottom: `1px solid ${ACCENT_BORDER}`,
          position: 'sticky',
          top: 0,
          background: 'var(--dt-surface)',
          zIndex: 1,
        }}>
          <span style={{ fontFamily: skin.fontHeading, fontSize: 13, color: ACCENT, letterSpacing: '0.05em' }}>
            {activeCat?.label ?? '—'}
          </span>
          <span style={{ fontFamily: skin.fontMono, fontSize: 10, color: TEXT_MUTED, background: SURFACE_INPUT, borderRadius: 10, padding: '1px 7px', border: `1px solid ${ACCENT_BORDER}` }}>
            {filtered.length}
          </span>
        </div>

        {filtered.length === 0 ? (
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
            <span style={{ fontSize: 28, opacity: 0.4 }}>{activeCat?.icon ?? '?'}</span>
            <span style={{ fontFamily: skin.fontMono, fontSize: 11 }}>No entries found.</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
            padding: 12,
          }}>
            {filtered.map((entry) => {
              const isSelected = entry.id === selectedEntry?.id;
              const isHovered  = entry.id === hoveredCardId;
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  onMouseEnter={() => setHoveredCardId(entry.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: '12px 12px 10px',
                    borderRadius: RADIUS,
                    border: `1px solid ${isSelected ? ACCENT : isHovered ? ACCENT_BORDER_STRONG : ACCENT_BORDER}`,
                    background: isSelected ? ACCENT_SOFT_2 : isHovered ? ACCENT_SOFT : SURFACE_INPUT,
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? `0 0 10px 2px var(--dt-accent, #7c5cfc33)`
                      : isHovered
                      ? 'var(--dt-shadow-unfocused)'
                      : 'none',
                    transform: isHovered && !isSelected ? 'translateY(-1px)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: isSelected ? 'var(--dt-accent-soft-2)' : SURFACE_INPUT,
                    border: `1px solid ${ACCENT_BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {entry.sigil}
                  </div>
                  <div style={{
                    fontFamily: skin.fontHeading,
                    fontSize: 12,
                    fontWeight: 600,
                    color: isSelected ? ACCENT : TEXT_PRIMARY,
                    lineHeight: 1.3,
                    letterSpacing: '0.02em',
                  }}>
                    {entry.name}
                  </div>
                  <div style={{
                    fontFamily: skin.fontBody,
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: TEXT_MUTED,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {entry.snippet}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right detail panel */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {!selectedEntry ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT_MUTED,
            fontFamily: skin.fontMono,
            fontSize: 12,
          }}>
            Select an entry.
          </div>
        ) : (
          <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Sigil tile */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              background: SURFACE_INPUT,
              border: `1px solid ${ACCENT_BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              flexShrink: 0,
            }}>
              {selectedEntry.sigil}
            </div>

            {/* Type tag */}
            <div style={{
              fontFamily: skin.fontMono,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: ACCENT,
              background: ACCENT_SOFT_2,
              border: `1px solid ${ACCENT_BORDER}`,
              borderRadius: 999,
              padding: '3px 12px',
              alignSelf: 'flex-start',
            }}>
              {selectedEntry.type}
            </div>

            {/* Entry name */}
            <div style={{
              fontFamily: skin.fontHeading,
              fontSize: 20,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              letterSpacing: '0.03em',
              lineHeight: 1.25,
            }}>
              {selectedEntry.name}
            </div>

            {/* Ornamental divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: ACCENT,
            }}>
              <div style={{ flex: 1, height: 1, background: ACCENT_BORDER }} />
              <span style={{ fontFamily: skin.fontMono, fontSize: 11, opacity: 0.7 }}>{skin.divider}</span>
              <div style={{ flex: 1, height: 1, background: ACCENT_BORDER }} />
            </div>

            {/* Lore body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedEntry.body.map((para, i) => (
                <p key={i} style={{
                  margin: 0,
                  fontFamily: skin.fontBody,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: TEXT_PRIMARY,
                }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Lore quote */}
            {selectedEntry.quote && (
              <p style={{
                margin: 0,
                fontFamily: skin.fontBody,
                fontSize: 13,
                fontStyle: 'italic',
                color: TEXT_MUTED,
                lineHeight: 1.6,
                paddingLeft: 14,
                borderLeft: `2px solid ${ACCENT_BORDER}`,
              }}>
                {selectedEntry.quote}
              </p>
            )}

            {/* Stats row */}
            {selectedEntry.stats && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                padding: '14px 16px',
                background: SURFACE_INPUT,
                border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: RADIUS,
              }}>
                {Object.entries(selectedEntry.stats).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 100 }}>
                    <span style={{ fontFamily: skin.fontMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_MUTED }}>
                      {k}
                    </span>
                    <span style={{ fontFamily: skin.fontBody, fontSize: 12, color: TEXT_PRIMARY }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer entry number */}
            <div style={{
              marginTop: 4,
              fontFamily: skin.fontMono,
              fontSize: 10,
              color: TEXT_MUTED,
              letterSpacing: '0.06em',
              opacity: 0.6,
            }}>
              {(() => {
                const idx = entries.findIndex((e) => e.id === selectedEntry.id);
                return `Entry ${String(idx + 1).padStart(3, '0')} / ${String(entries.length).padStart(3, '0')}`;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

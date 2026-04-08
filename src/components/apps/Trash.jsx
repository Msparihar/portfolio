'use client';

import { useState } from 'react';

const ACCENT = 'var(--dt-accent)';
const BORDER = 'var(--dt-accent-border)';
const TEXT = 'var(--dt-text)';
const MUTED = 'var(--dt-text-muted)';
const SURFACE = 'var(--dt-context-bg)';

const RECENTLY_DELETED = [
  { name: 'old-resume-v1.pdf', icon: '📄', date: '2 days ago', size: '12 KB' },
  { name: 'draft-blog-post.md', icon: '📝', date: '5 days ago', size: '3 KB' },
  { name: 'cover-photo-old.png', icon: '🖼️', date: '12 days ago', size: '890 KB' },
];

const ARCHIVE = [
  { name: 'projects-2022/', icon: '📁', date: '1 month ago', size: '—' },
  { name: 'old-portfolio.html', icon: '📄', date: '3 months ago', size: '45 KB' },
];

export default function Trash() {
  const [emptied, setEmptied] = useState(false);
  const [fading, setFading] = useState(false);

  const handleEmpty = () => {
    setFading(true);
    setTimeout(() => setEmptied(true), 400);
  };

  const totalItems = RECENTLY_DELETED.length + ARCHIVE.length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'monospace', color: TEXT, padding: '16px 20px' }}>
      {emptied ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
          <div style={{ fontSize: '48px' }}>🗑️</div>
          <div style={{ color: MUTED, fontSize: '13px' }}>Trash is empty</div>
        </div>
      ) : (
        <>
          {/* Recently Deleted */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
              Recently Deleted
            </div>
            <div style={{
              border: `1px solid ${BORDER}`,
              borderRadius: '6px',
              overflow: 'hidden',
              opacity: fading ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}>
              {RECENTLY_DELETED.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderBottom: i < RECENTLY_DELETED.length - 1 ? `1px solid ${BORDER}` : 'none',
                    fontSize: '13px',
                    cursor: 'default',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dt-accent-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ flex: 1, color: TEXT }}>{item.name}</span>
                  <span style={{ color: MUTED, fontSize: '11px', minWidth: '80px' }}>{item.date}</span>
                  <span style={{ color: MUTED, fontSize: '11px', minWidth: '50px', textAlign: 'right' }}>{item.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Archive */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.08em', marginBottom: '10px', textTransform: 'uppercase' }}>
              Archive
            </div>
            <div style={{
              border: `1px solid ${BORDER}`,
              borderRadius: '6px',
              overflow: 'hidden',
              opacity: fading ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}>
              {ARCHIVE.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderBottom: i < ARCHIVE.length - 1 ? `1px solid ${BORDER}` : 'none',
                    fontSize: '13px',
                    cursor: 'default',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dt-accent-border)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ flex: 1, color: TEXT }}>{item.name}</span>
                  <span style={{ color: MUTED, fontSize: '11px', minWidth: '80px' }}>{item.date}</span>
                  <span style={{ color: MUTED, fontSize: '11px', minWidth: '50px', textAlign: 'right' }}>{item.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleEmpty}
              disabled={fading}
              style={{
                padding: '6px 16px',
                background: fading ? 'var(--dt-accent-dim)' : ACCENT,
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: fading ? 'not-allowed' : 'pointer',
              }}
            >
              Empty Trash
            </button>
            <span style={{ color: MUTED, fontSize: '11px' }}>
              {fading ? '0' : totalItems} items
            </span>
          </div>
        </>
      )}
    </div>
  );
}

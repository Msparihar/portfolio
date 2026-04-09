'use client';

import { useState, useEffect } from 'react';
import portfolioData from '@/config/portfolio.json';

const GREEN = 'var(--dt-accent)';
const GREEN_BG = 'var(--dt-accent-20)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const blogs = portfolioData.blogs || [];

function formatDate(dateStr) {
  if (!dateStr) return '1970-01-01 10:00:00';
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} 10:00:00`;
}

const FILTERS = ['INFO', 'WARN', 'DEBUG'];

export default function LogViewer() {
  const [activeFilter, setActiveFilter] = useState('INFO');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--dt-font-mono, monospace)', color: TEXT_PRIMARY }}>
      {/* Filter bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 14px',
        borderBottom: `1px solid ${GREEN_BORDER}`,
        background: 'var(--dt-surface)',
        flexShrink: 0,
      }}>
        <span style={{ color: TEXT_MUTED, fontSize: '12px', alignSelf: 'center', marginRight: '4px' }}>filter:</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '3px 10px',
              fontSize: '12px',
              fontFamily: 'var(--dt-font-mono, monospace)',
              cursor: 'pointer',
              border: `1px solid ${activeFilter === f ? GREEN : GREEN_BORDER}`,
              borderRadius: 'var(--dt-radius-sm, 4px)',
              background: activeFilter === f ? GREEN_BG : 'transparent',
              color: activeFilter === f ? GREEN : TEXT_MUTED,
              transition: 'all 0.15s ease',
            }}
          >
            [{f}]
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: TEXT_MUTED, fontSize: '11px', alignSelf: 'center' }}>
          {blogs.length} entries
        </span>
      </div>

      {/* Log entries */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {activeFilter === 'WARN' ? (
          <div style={{ padding: '24px 16px', color: 'var(--dt-warn-color, #facc15)', fontSize: '13px' }}>
            <span style={{ color: 'var(--dt-warn-color, #facc15)' }}>[WARN]</span> No warnings. All systems operational.
          </div>
        ) : activeFilter === 'DEBUG' ? (
          <div style={{ padding: '24px 16px', color: TEXT_MUTED, fontSize: '13px' }}>
            <span style={{ color: 'var(--dt-info-color, #60a5fa)' }}>[DEBUG]</span> Debug mode disabled in production.
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.slug}
              onClick={() => blog.url && window.open(blog.url, '_blank')}
              onMouseEnter={() => setHoveredRow(blog.slug)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                padding: '7px 16px',
                cursor: 'pointer',
                background: hoveredRow === blog.slug ? 'var(--dt-accent-border-dim)' : 'transparent',
                borderBottom: '1px solid var(--dt-accent-03)',
                fontSize: '13px',
                display: 'flex',
                gap: '8px',
                alignItems: 'baseline',
                transition: 'background 0.1s ease',
              }}
            >
              <span style={{ color: TEXT_MUTED, whiteSpace: 'nowrap', fontSize: '12px' }}>
                [{formatDate(blog.date)}]
              </span>
              <span style={{ color: GREEN, fontWeight: 'bold', fontSize: '12px' }}>INFO </span>
              <span style={{ color: TEXT_PRIMARY, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {blog.title}
              </span>
              {blog.readTime && (
                <span style={{ color: TEXT_MUTED, fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {blog.readTime}min read
                </span>
              )}
            </div>
          ))
        )}

        {/* Blinking cursor */}
        <div style={{ padding: '8px 16px', color: GREEN, fontSize: '13px' }}>
          <span style={{ opacity: blink ? 1 : 0, transition: 'opacity 0.1s' }}>█</span>
        </div>
      </div>
    </div>
  );
}

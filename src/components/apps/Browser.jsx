'use client';

import { useState, useRef, useEffect } from 'react';
import portfolioData from '@/config/portfolio.json';

const GREEN = 'var(--dt-accent)';
const GREEN_BG = 'var(--dt-accent-soft)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const liveProjects = (portfolioData.projects || []).filter(
  (p) => !p._disabled && p.live && p.live !== p.github
);

export default function Browser({ url: urlProp }) {
  const [url, setUrl] = useState(urlProp || '');
  const [inputVal, setInputVal] = useState(urlProp || '');
  const [loadState, setLoadState] = useState(urlProp ? 'loading' : 'start'); // start | loading | loaded | error
  const [iframeKey, setIframeKey] = useState(0);
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  // When the url prop changes from outside (e.g. opened with a URL)
  useEffect(() => {
    if (urlProp && urlProp !== url) {
      navigate(urlProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProp]);

  function navigate(target) {
    let finalUrl = target.trim();
    if (!finalUrl) {
      setUrl('');
      setInputVal('');
      setLoadState('start');
      return;
    }
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);
    setInputVal(finalUrl);
    setLoadState('loading');
    setIframeKey((k) => k + 1);

    // Timeout: if iframe doesn't fire onLoad within 8s, assume blocked
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoadState('error');
    }, 8000);
  }

  function handleLoad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Most blocked iframes still fire onLoad — we can't fully detect blocking.
    // We show loaded state and rely on onError for hard failures.
    setLoadState('loaded');
  }

  function handleError() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoadState('error');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') navigate(inputVal);
  }

  function handleReload() {
    if (url) navigate(url);
  }

  function openExternal() {
    if (url) window.open(url, '_blank');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>
      {/* Address bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderBottom: `1px solid ${GREEN_BORDER}`,
        background: 'var(--dt-surface)',
        flexShrink: 0,
        height: '48px',
        boxSizing: 'border-box',
      }}>
        {/* Reload */}
        <button
          onClick={handleReload}
          disabled={!url}
          title="Reload"
          style={{
            background: 'transparent',
            border: `1px solid ${GREEN_BORDER}`,
            borderRadius: '4px',
            color: url ? GREEN : TEXT_MUTED,
            cursor: url ? 'pointer' : 'not-allowed',
            padding: '4px 8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          ↻
        </button>

        {/* URL input */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${GREEN_BORDER}`,
            borderRadius: '4px',
            padding: '5px 10px',
            color: TEXT_PRIMARY,
            fontFamily: 'monospace',
            fontSize: '12px',
            outline: 'none',
          }}
        />

        {/* Status indicator */}
        <span style={{ fontSize: '11px', color: TEXT_MUTED, flexShrink: 0, minWidth: '60px', textAlign: 'center' }}>
          {loadState === 'loading' ? '⏳ loading' : loadState === 'error' ? '🚫 error' : loadState === 'loaded' ? '🟢 ok' : ''}
        </span>

        {/* External link */}
        <button
          onClick={openExternal}
          disabled={!url}
          title="Open in new tab"
          style={{
            background: 'transparent',
            border: `1px solid ${GREEN_BORDER}`,
            borderRadius: '4px',
            color: url ? GREEN : TEXT_MUTED,
            cursor: url ? 'pointer' : 'not-allowed',
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          ↗
        </button>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Start screen */}
        {loadState === 'start' && (
          <div style={{
            height: '100%',
            overflowY: 'auto',
            padding: '28px 24px',
            boxSizing: 'border-box',
          }}>
            <div style={{ color: GREEN, fontSize: '12px', letterSpacing: '0.08em', marginBottom: '18px' }}>
              ▸ QUICK LAUNCH — Live Projects
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
            }}>
              {liveProjects.map((p, i) => (
                <div
                  key={p.name}
                  onClick={() => navigate(p.live)}
                  style={{
                    padding: '14px 16px',
                    border: `1px solid ${GREEN_BORDER}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'var(--dt-accent-03)',
                    transition: 'background 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = GREEN_BG;
                    e.currentTarget.style.borderColor = 'var(--dt-accent-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--dt-accent-03)';
                    e.currentTarget.style.borderColor = GREEN_BORDER;
                  }}
                >
                  <div style={{ fontSize: '13px', color: TEXT_PRIMARY, marginBottom: '4px', fontWeight: 'bold' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: TEXT_MUTED, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.live}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(p.techStack || []).slice(0, 2).map((t, ti) => (
                      <span key={ti} style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        border: `1px solid ${GREEN_BORDER}`,
                        borderRadius: '3px',
                        color: 'var(--dt-accent-dim)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', color: TEXT_MUTED, fontSize: '11px' }}>
              Type a URL in the address bar or click a project above to navigate.
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadState === 'loading' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--dt-surface)',
            color: GREEN,
            fontFamily: 'monospace',
            fontSize: '13px',
            zIndex: 2,
            pointerEvents: 'none',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <div>Loading {url}</div>
            </div>
          </div>
        )}

        {/* Error screen */}
        {loadState === 'error' && (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px',
            color: TEXT_PRIMARY,
            fontFamily: 'monospace',
          }}>
            <div style={{ fontSize: '36px' }}>🚫</div>
            <div style={{ fontSize: '14px', color: TEXT_PRIMARY }}>This site cannot be displayed inside Portfolio OS.</div>
            <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Most sites block embedding via X-Frame-Options or CSP headers.</div>
            <button
              onClick={openExternal}
              style={{
                marginTop: '8px',
                padding: '8px 18px',
                background: 'transparent',
                border: `1px solid ${GREEN}`,
                borderRadius: '5px',
                color: GREEN,
                fontFamily: 'monospace',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Open in new tab →
            </button>
          </div>
        )}

        {/* Iframe (visible when url is set) */}
        {url && loadState !== 'start' && (
          <iframe
            key={iframeKey}
            src={url}
            title="browser-frame"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: loadState === 'error' ? 'none' : 'block',
              background: '#fff',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  );
}

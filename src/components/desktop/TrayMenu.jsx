'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePrefsStore } from '@/store/prefsStore';
import { WORLDS, applyWorldWithTransition } from '@/config/worlds';
import { getCurrentWorldId, createWorldChangeListener } from '@/config/worldContent';

const MENU_BG = {
  background: 'var(--dt-context-bg)',
  backdropFilter: 'var(--dt-window-blur)',
  WebkitBackdropFilter: 'var(--dt-window-blur)',
  border: '1px solid var(--dt-accent-border)',
  borderRadius: 'var(--dt-window-radius, 8px)',
  boxShadow: 'var(--dt-shadow-focused)',
};

function useFormattedDateTime() {
  const [dt, setDt] = useState({ time: '', date: '' });
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const time = `${String(h).padStart(2, '0')}:${m} ${ampm}`;
      const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      return { time, date };
    };
    setDt(fmt());
    const id = setInterval(() => setDt(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return dt;
}

export default function TrayMenu({ x, y, onClose }) {
  const menuRef = useRef(null);
  const mascotVisible = usePrefsStore((s) => s.mascotVisible);
  const toggleMascotVisible = usePrefsStore((s) => s.toggleMascotVisible);
  const [worldId, setWorldId] = useState(() => getCurrentWorldId());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showWorlds, setShowWorlds] = useState(false);
  const [worldsFocus, setWorldsFocus] = useState(0);
  const [modal, setModal] = useState(null);
  const dt = useFormattedDateTime();

  useEffect(() => createWorldChangeListener((id) => setWorldId(id)), []);

  // Clamp to viewport on mount
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      x: Math.min(x, vw - rect.width - 8),
      y: Math.min(y, vh - rect.height - 8),
    });
  }, [x, y]);

  const handleSwitchWorld = useCallback((id) => {
    applyWorldWithTransition(id);
    onClose();
  }, [onClose]);

  const handleAbout = useCallback(() => {
    setModal('about');
  }, []);

  const handleToggleMascot = useCallback(() => {
    toggleMascotVisible();
    onClose();
  }, [toggleMascotVisible, onClose]);

  // Items (no dead actions — every item maps to something that exists)
  const items = [
    { id: 'worlds', label: 'Switch World…', icon: '🌍', submenu: true },
    { id: 'about', label: 'About this Portfolio', icon: 'ℹ️', action: handleAbout },
    { id: 'mascot', label: mascotVisible ? 'Hide Mascot' : 'Show Mascot', icon: mascotVisible ? '👁️' : '🙈', action: handleToggleMascot },
  ];

  const closeSubmenu = useCallback(() => {
    setShowWorlds(false);
    setWorldsFocus(0);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (!modal) onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose, modal]);

  useEffect(() => {
    const handleKey = (e) => {
      if (modal) return;

      if (e.key === 'Escape') {
        if (showWorlds) { e.preventDefault(); closeSubmenu(); }
        else onClose();
        return;
      }

      if (showWorlds) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setWorldsFocus((p) => Math.min(p + 1, WORLDS.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setWorldsFocus((p) => Math.max(p - 1, 0)); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); closeSubmenu(); }
        else if (e.key === 'Enter') { e.preventDefault(); handleSwitchWorld(WORLDS[worldsFocus].id); }
        return;
      }

      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex((p) => Math.min(p + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex((p) => Math.max(p - 1, 0)); }
      else if (e.key === 'ArrowRight') {
        if (items[focusedIndex]?.submenu) { e.preventDefault(); setShowWorlds(true); setWorldsFocus(0); }
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        const item = items[focusedIndex];
        if (item.submenu) { setShowWorlds(true); setWorldsFocus(0); }
        else item.action?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [focusedIndex, showWorlds, worldsFocus, items, modal, onClose, closeSubmenu, handleSwitchWorld]);

  const world = WORLDS.find((w) => w.id === worldId);

  return (
    <>
      <div
        ref={menuRef}
        role="menu"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          minWidth: 210,
          ...MENU_BG,
          padding: '4px 0',
          zIndex: 300,
        }}
      >
        {/* Header: date + time */}
        <div
          aria-hidden="true"
          style={{
            padding: '8px 16px 6px',
            borderBottom: '1px solid var(--dt-accent-border-dim)',
            marginBottom: 4,
          }}
        >
          <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: 15, color: 'var(--dt-text)', fontWeight: 600, letterSpacing: '0.03em' }}>
            {dt.time}
          </div>
          <div style={{ fontFamily: 'var(--dt-font-mono)', fontSize: 11, color: 'var(--dt-text-muted)', marginTop: 2 }}>
            {dt.date}
          </div>
          {world && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: world.swatch,
                boxShadow: `0 0 4px ${world.swatch}66`,
              }} />
              <span style={{ fontFamily: 'var(--dt-font-mono)', fontSize: 11, color: 'var(--dt-accent-70)' }}>
                {world.name}
              </span>
            </div>
          )}
        </div>

        {/* Menu items */}
        {items.map((item, idx) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <button
              role="menuitem"
              onMouseEnter={() => {
                setFocusedIndex(idx);
                if (item.submenu) { setShowWorlds(true); setWorldsFocus(0); }
                else closeSubmenu();
              }}
              onClick={() => {
                if (item.submenu) { setShowWorlds((cur) => !cur); setWorldsFocus(0); }
                else item.action?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '6px 16px',
                fontFamily: 'var(--dt-font-mono)',
                fontSize: 13,
                color: focusedIndex === idx ? 'var(--dt-accent)' : 'var(--dt-text)',
                background: focusedIndex === idx ? 'var(--dt-accent-border)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s ease, color 0.1s ease',
              }}
            >
              <span style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.submenu && <span style={{ opacity: 0.6, fontSize: 11 }}>▸</span>}
            </button>

            {item.submenu && showWorlds && focusedIndex === idx && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: 0,
                  marginRight: 4,
                  minWidth: 190,
                  ...MENU_BG,
                  padding: '4px 0',
                  zIndex: 301,
                }}
              >
                {WORLDS.map((w, wIdx) => (
                  <button
                    key={w.id}
                    role="menuitem"
                    onMouseEnter={() => setWorldsFocus(wIdx)}
                    onClick={() => handleSwitchWorld(w.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '6px 16px',
                      fontFamily: 'var(--dt-font-mono)',
                      fontSize: 13,
                      color: worldsFocus === wIdx ? 'var(--dt-accent)' : 'var(--dt-text)',
                      background: worldsFocus === wIdx ? 'var(--dt-accent-border)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s ease, color 0.1s ease',
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: w.swatch,
                      boxShadow: `0 0 4px ${w.swatch}66`,
                      flexShrink: 0,
                    }} />
                    <span style={{ flex: 1 }}>{w.name}</span>
                    {w.id === worldId && <span style={{ color: 'var(--dt-accent)', fontSize: 10 }}>●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal === 'about' && (
        <AboutModal worldId={worldId} onClose={() => { setModal(null); onClose(); }} />
      )}
    </>
  );
}

function Modal({ title, children, onClose }) {
  const contentRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    previousActiveRef.current = document.activeElement;
    const node = contentRef.current;
    if (node) {
      const focusables = node.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      if (first instanceof HTMLElement) first.focus();
      else node.focus();
    }
    return () => {
      const prev = previousActiveRef.current;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const node = contentRef.current;
      if (!node) return;
      const focusables = Array.from(
        node.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el instanceof HTMLElement && !el.hasAttribute('inert'));
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--dt-font-mono)',
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'var(--dt-context-bg)',
          backdropFilter: 'var(--dt-window-blur)',
          WebkitBackdropFilter: 'var(--dt-window-blur)',
          border: '1px solid var(--dt-accent-border)',
          borderRadius: 'var(--dt-window-radius, 8px)',
          boxShadow: 'var(--dt-shadow-focused)',
          padding: '18px 22px',
          minWidth: 360,
          maxWidth: 520,
          maxHeight: '80vh',
          overflow: 'auto',
          color: 'var(--dt-text)',
          outline: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          paddingBottom: 8,
          borderBottom: '1px solid var(--dt-accent-border-dim)',
        }}>
          <span style={{ color: 'var(--dt-accent)', fontSize: 14, letterSpacing: '0.05em' }}>{title}</span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--dt-text-muted)', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AboutModal({ worldId, onClose }) {
  const world = WORLDS.find((w) => w.id === worldId);
  return (
    <Modal title="About this Portfolio" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 14, rowGap: 8, fontSize: 12 }}>
        <span style={{ color: 'var(--dt-text-muted)' }}>Build</span>
        <span>v0.9</span>
        <span style={{ color: 'var(--dt-text-muted)' }}>Current world</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {world && (
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: world.swatch,
              boxShadow: `0 0 4px ${world.swatch}66`,
            }} />
          )}
          {world?.name ?? '—'}
        </span>
        <span style={{ color: 'var(--dt-text-muted)' }}>Author</span>
        <span>Manish Singh Parihar</span>
        <span style={{ color: 'var(--dt-text-muted)' }}>Repo</span>
        <span>
          <a href="https://github.com/Msparihar" target="_blank" rel="noreferrer" style={{ color: 'var(--dt-accent)' }}>
            github.com/Msparihar
          </a>
        </span>
      </div>
      <p style={{ marginTop: 14, color: 'var(--dt-text-muted)', fontSize: 11, lineHeight: 1.5 }}>
        This portfolio is a desktop OS simulator. Each world is a fully themed shell — fonts,
        wallpapers, particles, lore. Right-click anywhere to control the shell.
      </p>
    </Modal>
  );
}

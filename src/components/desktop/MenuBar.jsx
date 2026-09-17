'use client';

import { useEffect, useState } from 'react';
import * as Menubar from '@radix-ui/react-menubar';
import { LayoutGrid, Wind } from 'lucide-react';
import { useWindowStore } from '@/store/windowStore';
import { useUiStore } from '@/store/uiStore';
import { WORLDS } from '@/config/worlds';
import {
  getWorldMenuBarNav,
  getWorldMenuBarCta,
  getWorldTaskbar,
  createWorldChangeListener,
} from '@/config/worldContent';
import WorldPicker from './WorldPicker';
import { Tooltip } from '@/components/ui/Tooltip';
import TrayMenu from './TrayMenu';

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    };
    setTime(fmt());
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    let intervalId = null;
    const timeoutId = setTimeout(() => {
      setTime(fmt());
      intervalId = setInterval(() => setTime(fmt()), 60_000);
    }, msUntilNextMinute);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, []);
  return time;
}

function GhibliLeafMark() {
  return (
    <svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14.1 23.8c-.2-5.4 1.3-10.2 4.5-14.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M14.8 15.2C8.1 15.6 4.2 12.5 4 6.4c6.3-.5 10.5 2.6 10.8 8.8Z" fill="currentColor" />
      <path d="M17.1 11.7c.5-5.2 3.6-8 8.2-7.5.3 5-2.7 7.8-8.2 7.5Z" fill="currentColor" opacity=".78" />
    </svg>
  );
}

export default function MenuBar({ slimMode = false }) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const windows = useWindowStore((s) => s.windows);
  const nextZIndex = useWindowStore((s) => s.nextZIndex);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);
  const clock = useClock();

  const [worldId, setWorldId] = useState(null);
  useEffect(() => createWorldChangeListener(setWorldId), []);

  const world = worldId ? WORLDS.find((w) => w.id === worldId) : null;
  const navItems = getWorldMenuBarNav(worldId);
  const cta = getWorldMenuBarCta(worldId);
  const taskbarLabels = getWorldTaskbar(worldId);
  const isGhibli = worldId === 'ghibli';

  // Brand-swatch easter egg: click 3 times in 3s for the founder mark.
  const [brandClicks, setBrandClicks] = useState([]);
  const [brandPulse, setBrandPulse] = useState(false);
  const [foundMark, setFoundMark] = useState(false);
  const [timePulse, setTimePulse] = useState(false);
  const [trayMenu, setTrayMenu] = useState(null); // { x, y } | null

  // Brand-flash hook: ContextMenu hint dispatches `brand-flash` → pulse for 2s.
  useEffect(() => {
    const handler = () => {
      setBrandPulse(true);
      setTimeout(() => setBrandPulse(false), 2000);
    };
    window.addEventListener('brand-flash', handler);
    return () => window.removeEventListener('brand-flash', handler);
  }, []);

  // 3:33 brand pulse — checks every 30s, pulses for 60s when local minute == 33 and hour ends in 3.
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const h = now.getHours() % 12; // 3 AM and 3 PM both qualify
      setTimePulse(h === 3 && now.getMinutes() === 33);
    };
    check();
    const id = setInterval(check, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleBrandClick = () => {
    const now = Date.now();
    const recent = [...brandClicks, now].filter((t) => now - t <= 3000);
    setBrandClicks(recent);
    if (recent.length >= 3) {
      setBrandClicks([]);
      setFoundMark(true);
      window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'founder-mark' } }));
      setTimeout(() => setFoundMark(false), 3200);
    }
  };

  const focusedId = windows.find((w) => w.zIndex >= nextZIndex - 1 && !w.isMinimized)?.id ?? null;

  const handleNavClick = (action) => {
    if (action === 'resume') {
      window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
      return;
    }
    openWindow(action);
  };

  const handleWindowItemClick = (win) => {
    if (win.isMinimized) restoreWindow(win.id);
    else if (win.id === focusedId) minimizeWindow(win.id);
    else focusWindow(win.id);
  };

  return (
    <div
      role="banner"
      data-kitsune-platform="menubar"
      className={`dt-menubar${isGhibli ? ' dt-menubar--ghibli' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--dt-menubar-height)',
        zIndex: 100,
        background: 'var(--dt-menubar-bg)',
        backdropFilter: 'var(--dt-window-blur)',
        WebkitBackdropFilter: 'var(--dt-window-blur)',
        borderBottom: '1px solid var(--dt-menubar-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <Tooltip content={world ? `World: ${world.name ?? world.id}` : 'Portfolio'} side="bottom">
          <span
            aria-label={world ? `Current world: ${world.name ?? world.id}` : 'Portfolio'}
            role="button"
            tabIndex={0}
            onClick={handleBrandClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBrandClick(); } }}
            className={`menubar-brand-swatch${brandPulse || foundMark || timePulse ? ' is-pulsing' : ''}`}
            style={{
              width: isGhibli ? 30 : 18,
              height: isGhibli ? 30 : 18,
              borderRadius: isGhibli ? 0 : 4,
              background: isGhibli ? 'transparent' : (world?.swatch ?? 'var(--dt-accent)'),
              border: 'none',
              boxShadow: worldId === 'ghibli' ? 'none' : `0 0 8px ${world?.swatch ?? 'var(--dt-accent)'}66`,
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {isGhibli && <GhibliLeafMark />}
          </span>
        </Tooltip>
        <span
          style={{
            fontFamily: world ? 'var(--dt-font-heading, monospace)' : 'var(--dt-font-mono, monospace)',
            fontSize: 13,
            letterSpacing: world ? '1.2px' : '0',
            color: 'var(--dt-accent-70)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            textShadow: 'var(--dt-menubar-text-glow)',
          }}
        >
          {world?.brandText || '>_ manish@portfolio'}
        </span>
      </div>

      {/* Horizontal nav (Radix Menubar) — hidden in slimMode */}
      {!slimMode && (
        <Menubar.Root
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          {navItems.map((item) => (
            <Menubar.Menu key={item.action}>
              <Tooltip content={item.tooltip ?? item.label} side="bottom">
              <Menubar.Trigger
                onClick={() => handleNavClick(item.action)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--dt-menubar-link)',
                  cursor: 'pointer',
                  fontFamily: 'var(--dt-font-body, sans-serif)',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '8px 12px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--dt-accent-soft)';
                  e.currentTarget.style.color = 'var(--dt-menubar-link-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--dt-menubar-link)';
                }}
              >
                {item.label}
              </Menubar.Trigger>
              </Tooltip>
            </Menubar.Menu>
          ))}

          {/* Open-window list collapses into a "Windows" submenu when any are open */}
          {windows.length > 0 && (
            <Menubar.Menu>
              <Menubar.Trigger
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--dt-menubar-link-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--dt-font-body, sans-serif)',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '8px 12px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
              >
                Windows ({windows.length})
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content
                  align="start"
                  sideOffset={6}
                  style={{
                    background: 'var(--dt-context-bg)',
                    backdropFilter: 'var(--dt-window-blur)',
                    WebkitBackdropFilter: 'var(--dt-window-blur)',
                    border: '1px solid var(--dt-accent-border-strong)',
                    borderRadius: 'var(--dt-window-radius, 8px)',
                    padding: 6,
                    minWidth: 220,
                    boxShadow: 'var(--dt-shadow-focused)',
                    zIndex: 300,
                  }}
                >
                  {windows.map((win) => (
                    <Menubar.Item
                      key={win.id}
                      onSelect={() => handleWindowItemClick(win)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: 'var(--dt-font-mono)',
                        fontSize: 12,
                        color: win.isMinimized ? 'var(--dt-text-muted)' : 'var(--dt-text)',
                        fontStyle: win.isMinimized ? 'italic' : 'normal',
                      }}
                    >
                      <span style={{ flex: 1 }}>{win.title}</span>
                      {win.id === focusedId && !win.isMinimized && (
                        <span style={{ color: 'var(--dt-accent)', fontSize: 10 }}>●</span>
                      )}
                    </Menubar.Item>
                  ))}
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          )}
        </Menubar.Root>
      )}

      {/* Spacer so right cluster stays flush-right in slimMode */}
      {slimMode && <div style={{ flex: 1 }} />}

      {/* Right cluster */}
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setTrayMenu({ x: e.clientX, y: e.clientY });
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        {!slimMode && (
          <Tooltip content={cta.label} side="bottom">
          <button
            onClick={() => openWindow(cta.target)}
            style={{
              background: 'var(--dt-accent)',
              color: 'var(--dt-bg)',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: 'var(--dt-font-body, sans-serif)',
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dt-accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--dt-accent)'; }}
          >
            {cta.label}
          </button>
          </Tooltip>
        )}

        <WorldPicker />

        <Tooltip content="Switch to Website Mode (Ctrl+Shift+W)" side="bottom">
        <button
          onClick={toggleWebsiteMode}
          aria-label="Switch to Website Mode"
          className="dt-menubar-icon-button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--dt-text-muted)',
            cursor: 'pointer',
            fontSize: 14,
            padding: 6,
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
        >
          <LayoutGrid size={15} strokeWidth={2} aria-hidden="true" />
        </button>
        </Tooltip>

        <span
          aria-label={taskbarLabels.wifiLabel}
          className={isGhibli ? 'dt-wind-status' : undefined}
          style={{ color: 'var(--dt-accent-70)', fontSize: 11, letterSpacing: 1, fontFamily: 'var(--dt-menubar-font-tray)', whiteSpace: 'nowrap' }}
        >
          {isGhibli ? (
            <><Wind className="dt-wind-glyph" size={15} strokeWidth={2} aria-hidden="true" /><span>breeze</span></>
          ) : taskbarLabels.wifiLabel}
        </span>
        <span
          aria-label="Clock"
          style={{ color: 'var(--dt-accent-dim)', fontSize: 12, fontFamily: 'var(--dt-menubar-font-tray)', whiteSpace: 'nowrap' }}
        >
          {clock}
        </span>
      </div>

      {trayMenu && (
        <TrayMenu
          x={trayMenu.x}
          y={trayMenu.y}
          onClose={() => setTrayMenu(null)}
        />
      )}
    </div>
  );
}

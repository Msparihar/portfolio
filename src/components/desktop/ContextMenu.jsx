'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useUiStore } from '@/store/uiStore';
import { usePrefsStore } from '@/store/prefsStore';
import {
  getCurrentWorldId,
  getWorldIcon,
  getWorldMenuPrefix,
  createWorldChangeListener,
} from '@/config/worldContent';
import { WORLDS, applyWorldWithTransition, normalizeWallpaper } from '@/config/worlds';
import { useSeasonStore } from '@/store/seasonStore';

/**
 * Build the flat list of menu items. Submenu items are inlined; rendering decides
 * whether to show the child popout. We keep keyboard nav simple: arrows move within
 * the currently visible level (root, or open submenu).
 */
function buildMenuModel(ctx) {
  const { worldId, prefs, actions } = ctx;
  const isPinned = prefs.pinnedWallpaperId && prefs.pinnedWallpaperId !== 'auto';
  const pinIcon = isPinned ? '📌' : '📍';
  const mascotIcon = prefs.mascotVisible ? '👁️' : '🙈';
  const kitsuneIcon = prefs.kitsuneModeEnabled ? '🦊' : '🐾';

  return [
    { label: 'Open Terminal', action: actions.openTerminal, icon: getWorldIcon(worldId, 'terminal', '🖥️', 'Terminal').icon },
    { label: 'Open File Manager', action: actions.openFileManager, icon: getWorldIcon(worldId, 'filemanager', '📁', 'File Manager').icon },
    { type: 'divider' },
    {
      label: 'Switch World',
      icon: '🌍',
      submenu: WORLDS.map((world) => ({
        label: world.name,
        icon: <span style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: world.swatch,
          boxShadow: `0 0 4px ${world.swatch}66`,
        }} />,
        action: () => actions.switchWorld(world.id),
        active: worldId === world.id,
      })),
    },
    {
      label: isPinned ? 'Unpin Wallpaper' : 'Pin Current Wallpaper',
      action: actions.togglePinWallpaper,
      icon: pinIcon,
    },
    {
      label: prefs.mascotVisible ? 'Hide Mascot' : 'Show Mascot',
      action: actions.toggleMascotVisible,
      icon: mascotIcon,
    },
    {
      label: prefs.kitsuneModeEnabled ? 'Disable Kitsune Mode' : 'Enable Kitsune Mode',
      action: actions.toggleKitsuneMode,
      icon: kitsuneIcon,
    },
    { type: 'divider' },
    { label: 'Refresh Desktop', action: actions.refreshDesktop, icon: '🔄' },
    { label: 'Keyboard Shortcuts…', action: actions.showShortcuts, icon: '⌨️' },
    {
      label: 'Easter Egg Hints',
      icon: '🥚',
      submenu: [
        { label: 'Try the Konami code', action: actions.hintKonami, icon: '🎮' },
        { label: 'Click the brand 3× for the founder mark', action: actions.hintBrand, icon: '✨' },
        { label: 'Type "sudo summon" in Terminal', action: actions.hintSudo, icon: '🪄' },
        { label: 'Watch the brand at 3:33', action: actions.hintBrand, icon: '⏱️' },
        { label: 'Stay idle for 90 seconds', action: actions.hintIdle, icon: '💤' },
      ],
    },
    { type: 'divider' },
    { label: 'About this Portfolio', action: actions.showAbout, icon: 'ℹ️' },
    { label: 'View Source', action: actions.viewSource, icon: getWorldIcon(worldId, 'resume', '📄', 'Resume').icon },
    { type: 'divider' },
    { label: 'Switch to Website Mode…', action: actions.confirmWebsiteMode, icon: '🌐' },
  ];
}

const MENU_BG = {
  background: 'var(--dt-context-bg)',
  backdropFilter: 'var(--dt-window-blur)',
  WebkitBackdropFilter: 'var(--dt-window-blur)',
  border: '1px solid var(--dt-accent-border)',
  borderRadius: 'var(--dt-window-radius, 8px)',
  boxShadow: 'var(--dt-shadow-focused)',
};

function MenuItemButton({ item, focused, hasSubmenu, onMouseEnter, onClick, worldId, showWorldPrefix = true }) {
  return (
    <button
      role="menuitem"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '6px 16px',
        fontFamily: 'var(--dt-font-mono)',
        fontSize: 13,
        color: focused ? 'var(--dt-accent)' : 'var(--dt-text)',
        background: focused ? 'var(--dt-accent-border)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.1s ease, color 0.1s ease',
      }}
    >
      <span style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>
        {showWorldPrefix && worldId ? `${getWorldMenuPrefix(worldId)} ${item.label}` : item.label}
      </span>
      {hasSubmenu && <span style={{ opacity: 0.6, fontSize: 11 }}>▸</span>}
      {item.active && <span style={{ color: 'var(--dt-accent)', fontSize: 10 }}>●</span>}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  const contentRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    previousActiveRef.current = document.activeElement;
    // Focus the first focusable inside the modal on open.
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
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = contentRef.current;
      if (!node) return;
      const focusables = Array.from(
        node.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el instanceof HTMLElement && !el.hasAttribute('inert'));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
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
          ...MENU_BG,
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
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--dt-text-muted)',
              cursor: 'pointer',
              fontSize: 16,
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ShortcutsModal({ onClose }) {
  const rows = [
    ['Ctrl + Shift + W', 'Toggle Website Mode'],
    ['Right-click desktop', 'Open this context menu'],
    ['Escape', 'Close menu / modal / popup'],
    ['Arrow Up / Down', 'Navigate menu items'],
    ['Arrow Right', 'Open submenu'],
    ['Arrow Left', 'Close submenu'],
    ['Enter', 'Activate focused item'],
    ['Click empty desktop', 'Dismiss context menu'],
  ];

  return (
    <Modal title="Keyboard Shortcuts" onClose={onClose}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {rows.map(([keys, desc]) => (
            <tr key={keys}>
              <td style={{ padding: '6px 12px 6px 0', whiteSpace: 'nowrap' }}>
                <kbd style={{
                  background: 'var(--dt-surface-input)',
                  border: '1px solid var(--dt-accent-border)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontFamily: 'var(--dt-font-mono)',
                  color: 'var(--dt-accent)',
                  fontSize: 11,
                }}>
                  {keys}
                </kbd>
              </td>
              <td style={{ padding: '6px 0', color: 'var(--dt-text)' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 14, color: 'var(--dt-text-muted)', fontSize: 11 }}>
        More shortcuts unlock as you explore. Check the Easter Egg Hints menu for clues.
      </p>
    </Modal>
  );
}

function AboutModal({ worldId, onClose }) {
  const world = WORLDS.find((w) => w.id === worldId);
  return (
    <Modal title="About this Portfolio" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 14, rowGap: 8, fontSize: 12 }}>
        <span style={{ color: 'var(--dt-text-muted)' }}>Build</span>
        <span>v0.8 — contextmenu</span>

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
          <a
            href="https://github.com/Msparihar"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--dt-accent)' }}
          >
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

function ConfirmModal({ title, body, confirmLabel, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ fontSize: 13, color: 'var(--dt-text)', lineHeight: 1.5, margin: 0 }}>{body}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid var(--dt-accent-border)',
            color: 'var(--dt-text)',
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'var(--dt-font-mono)',
            fontSize: 12,
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{
            background: 'var(--dt-accent)',
            border: 'none',
            color: 'var(--dt-bg)',
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'var(--dt-font-mono)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function Banner({ message, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3200);
    return () => clearTimeout(id);
  }, [onDismiss]);
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        ...MENU_BG,
        padding: '8px 16px',
        fontFamily: 'var(--dt-font-mono)',
        fontSize: 12,
        color: 'var(--dt-text)',
        zIndex: 400,
      }}
    >
      {message}
    </div>
  );
}

export default function ContextMenu({ x, y, onClose }) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);

  const pinnedWallpaperId = usePrefsStore((s) => s.pinnedWallpaperId);
  const mascotVisible = usePrefsStore((s) => s.mascotVisible);
  const kitsuneModeEnabled = usePrefsStore((s) => s.kitsuneModeEnabled);
  const setPinnedWallpaper = usePrefsStore((s) => s.setPinnedWallpaper);
  const toggleMascotVisible = usePrefsStore((s) => s.toggleMascotVisible);
  const toggleKitsuneMode = usePrefsStore((s) => s.toggleKitsuneMode);
  const setKitsuneMode = (val) => usePrefsStore.setState({ kitsuneModeEnabled: val });
  const currentRegion = useSeasonStore((s) => s.currentRegion);

  const menuRef = useRef(null);
  const [worldId, setWorldId] = useState(() => getCurrentWorldId());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [openSubmenu, setOpenSubmenu] = useState(null); // index of open submenu in items
  const [submenuFocus, setSubmenuFocus] = useState(0);
  const [modal, setModal] = useState(null); // 'shortcuts' | 'about' | 'website-mode'
  const [banner, setBanner] = useState(null);

  useEffect(() => createWorldChangeListener((id) => setWorldId(id)), []);

  const showBanner = useCallback((msg) => setBanner(msg), []);

  const flashBrand = useCallback(() => {
    window.dispatchEvent(new CustomEvent('brand-flash'));
  }, []);

  const actions = {
    openTerminal: () => { openWindow('terminal'); onClose(); },
    openFileManager: () => { openWindow('filemanager'); onClose(); },
    refreshDesktop: () => { window.location.reload(); },
    showShortcuts: () => setModal('shortcuts'),
    showAbout: () => setModal('about'),
    viewSource: () => { window.open('https://github.com/Msparihar', '_blank'); onClose(); },
    confirmWebsiteMode: () => setModal('website-mode'),
    switchWorld: (id) => { applyWorldWithTransition(id); onClose(); },
    togglePinWallpaper: () => {
      const isPinned = pinnedWallpaperId && pinnedWallpaperId !== 'auto';
      if (isPinned) {
        setPinnedWallpaper('auto');
        showBanner('Wallpaper unpinned');
      } else {
        // Read the currently displayed wallpaper src from the active world/region.
        const currentWorldId = getCurrentWorldId();
        const world = currentWorldId ? WORLDS.find((w) => w.id === currentWorldId) : null;
        const rawEntry = world?.regions && currentRegion
          ? (world.regions[currentRegion]?.wallpaper ?? world.wallpaper)
          : world?.wallpaper;
        const src = normalizeWallpaper(rawEntry).src;
        if (src) {
          setPinnedWallpaper(src);
          showBanner('Wallpaper pinned');
        } else {
          showBanner('No wallpaper to pin');
        }
      }
    },
    toggleMascotVisible: () => {
      toggleMascotVisible();
      showBanner(mascotVisible ? 'Mascot hidden' : 'Mascot visible');
    },
    toggleKitsuneMode: () => {
      // Safe no-op if Kitsune Mode feature isn't merged yet — flag is still toggled
      // and the banner makes the intent visible.
      toggleKitsuneMode();
      showBanner(kitsuneModeEnabled ? 'Kitsune Mode off' : 'Kitsune Mode on');
    },
    hintKonami: () => { showBanner('Hint: ↑ ↑ ↓ ↓ ← → ← → B A'); onClose(); },
    hintSudo: () => { showBanner('Hint: open the Terminal first'); onClose(); },
    hintBrand: () => { flashBrand(); showBanner('Hint: timing matters — and three clicks help'); onClose(); },
    hintIdle: () => { showBanner('Hint: walk away from the keyboard'); onClose(); },
  };

  const items = buildMenuModel({
    worldId,
    prefs: { pinnedWallpaperId, mascotVisible, kitsuneModeEnabled },
    actions,
  });

  // Navigable items (skip dividers)
  const navigableIndices = items
    .map((item, idx) => (item.type === 'divider' ? -1 : idx))
    .filter((idx) => idx !== -1);

  const closeSubmenu = useCallback(() => {
    setOpenSubmenu(null);
    setSubmenuFocus(0);
  }, []);

  // Outside click handler
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // Don't close if a modal is intercepting — modal has its own outside handling.
        if (!modal) onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, modal]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modal) return; // modal handles its own keys
      if (e.key === 'Escape') {
        if (openSubmenu !== null) {
          e.preventDefault();
          closeSubmenu();
        } else {
          onClose();
        }
        return;
      }

      if (openSubmenu !== null) {
        const sub = items[openSubmenu].submenu;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSubmenuFocus((p) => Math.min(p + 1, sub.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSubmenuFocus((p) => Math.max(p - 1, 0));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          closeSubmenu();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          sub[submenuFocus]?.action();
          if (items[openSubmenu].label !== 'Switch World') onClose();
        }
        return;
      }

      const navPos = navigableIndices.indexOf(focusedIndex);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = navPos === -1 ? 0 : Math.min(navPos + 1, navigableIndices.length - 1);
        setFocusedIndex(navigableIndices[next]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = navPos === -1 ? 0 : Math.max(navPos - 1, 0);
        setFocusedIndex(navigableIndices[next]);
      } else if (e.key === 'ArrowRight') {
        const item = items[focusedIndex];
        if (item?.submenu) {
          e.preventDefault();
          setOpenSubmenu(focusedIndex);
          setSubmenuFocus(0);
        }
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        const item = items[focusedIndex];
        if (item.submenu) {
          setOpenSubmenu(focusedIndex);
          setSubmenuFocus(0);
        } else {
          item.action();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, openSubmenu, submenuFocus, items, navigableIndices, modal, onClose, closeSubmenu]);

  return (
    <>
      <div
        ref={menuRef}
        role="menu"
        // Prevent menu clicks from bubbling to Desktop.onClick which would
        // dismiss the menu BEFORE the item's action (e.g. setModal('about'))
        // has had a chance to commit its render.
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          minWidth: 240,
          ...MENU_BG,
          padding: '4px 0',
          zIndex: 200,
        }}
      >
        {items.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div
                key={`divider-${idx}`}
                style={{
                  height: 1,
                  background: 'var(--dt-accent-border-dim)',
                  margin: '4px 8px',
                }}
              />
            );
          }
          const isFocused = focusedIndex === idx;
          return (
            <div key={idx} style={{ position: 'relative' }}>
              <MenuItemButton
                item={item}
                focused={isFocused}
                hasSubmenu={!!item.submenu}
                worldId={worldId}
                onMouseEnter={() => {
                  setFocusedIndex(idx);
                  if (item.submenu) {
                    setOpenSubmenu(idx);
                    setSubmenuFocus(0);
                  } else if (openSubmenu !== null) {
                    closeSubmenu();
                  }
                }}
                onClick={() => {
                  if (item.submenu) {
                    setOpenSubmenu((cur) => (cur === idx ? null : idx));
                    setSubmenuFocus(0);
                  } else {
                    item.action();
                  }
                }}
              />
              {openSubmenu === idx && item.submenu && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: 0,
                    marginLeft: 4,
                    minWidth: 220,
                    ...MENU_BG,
                    padding: '4px 0',
                    zIndex: 201,
                  }}
                >
                  {item.submenu.map((sub, subIdx) => (
                    <MenuItemButton
                      key={subIdx}
                      item={sub}
                      focused={submenuFocus === subIdx}
                      hasSubmenu={false}
                      worldId={worldId}
                      showWorldPrefix={false}
                      onMouseEnter={() => setSubmenuFocus(subIdx)}
                      onClick={() => {
                        sub.action();
                        if (item.label !== 'Switch World') onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal === 'shortcuts' && (
        <ShortcutsModal onClose={() => { setModal(null); onClose(); }} />
      )}
      {modal === 'about' && (
        <AboutModal worldId={worldId} onClose={() => { setModal(null); onClose(); }} />
      )}
      {modal === 'website-mode' && (
        <ConfirmModal
          title="Switch to Website Mode?"
          body="Leave the desktop shell? You'll get a flat portfolio site. You can come back anytime from the website header."
          confirmLabel="Switch mode"
          onConfirm={() => toggleWebsiteMode()}
          onClose={() => { setModal(null); onClose(); }}
        />
      )}
      {banner && <Banner message={banner} onDismiss={() => setBanner(null)} />}
    </>
  );
}

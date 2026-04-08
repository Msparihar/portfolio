'use client';

import { useEffect, useRef, useState } from 'react';
import { useWindowStore } from '@/store/windowStore';
import { useUiStore } from '@/store/uiStore';

export default function ContextMenu({ x, y, onClose }) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);
  const menuRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const MENU_ITEMS = [
    { label: 'Open Terminal', action: () => openWindow('terminal'), icon: '🖥️' },
    { label: 'Open File Manager', action: () => openWindow('filemanager'), icon: '📁' },
    { type: 'divider' },
    { label: 'Refresh Desktop', action: () => window.location.reload(), icon: '🔄' },
    { label: 'neofetch', action: () => openWindow('about'), icon: 'ℹ️' },
    { type: 'divider' },
    { label: 'Switch to Website Mode', action: () => toggleWebsiteMode(), icon: '🌐' },
    { type: 'divider' },
    { label: 'View Source', action: () => window.open('https://github.com/Msparihar', '_blank'), icon: '📄' },
  ];

  // Navigable items (non-dividers) with their original indices
  const navigableItems = MENU_ITEMS.map((item, idx) => ({ item, idx })).filter(({ item }) => item.type !== 'divider');

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, navigableItems.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter' && focusedIndex >= 0) {
        const { item } = navigableItems[focusedIndex];
        item.action();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, focusedIndex, navigableItems]);

  // Focus first item on mount for keyboard nav
  useEffect(() => {
    setFocusedIndex(-1);
  }, []);

  let navigableCounter = -1;

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        minWidth: '220px',
        background: 'var(--dt-context-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--dt-accent-border)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        padding: '4px 0',
        zIndex: 200,
      }}
    >
      {MENU_ITEMS.map((item, idx) => {
        if (item.type === 'divider') {
          return (
            <div
              key={`divider-${idx}`}
              style={{
                height: '1px',
                background: 'var(--dt-accent-border-dim)',
                margin: '4px 8px',
              }}
            />
          );
        }

        navigableCounter += 1;
        const navIdx = navigableCounter;
        const isKeyFocused = focusedIndex === navIdx;

        return (
          <button
            key={idx}
            role="menuitem"
            onClick={() => {
              item.action();
              onClose();
            }}
            onMouseEnter={() => setFocusedIndex(navIdx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '6px 16px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: isKeyFocused ? 'var(--dt-accent)' : 'var(--dt-text)',
              background: isKeyFocused ? 'var(--dt-accent-border)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s ease, color 0.1s ease',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            <span>$ {item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

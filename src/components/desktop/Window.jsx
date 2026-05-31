'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/store/windowStore';
import WindowTitlebar from './WindowTitlebar';

const MENUBAR_HEIGHT = 44;
const ICONSTRIP_WIDTH = 64;

const DUR_OPEN  = 0.18;
const DUR_CLOSE = 0.15;
const DUR_MIN   = 0.16;

export default function Window({ windowData, children }) {
  const closeWindow    = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow);
  const focusWindow    = useWindowStore((s) => s.focusWindow);
  const setPosition    = useWindowStore((s) => s.setPosition);
  const setSize        = useWindowStore((s) => s.setSize);
  const nextZIndex     = useWindowStore((s) => s.nextZIndex);

  const { id, title, isMinimized, isMaximized, position, size, zIndex } = windowData;

  const shouldReduceMotion = useReducedMotion();
  const dur = useCallback((d) => (shouldReduceMotion ? 0 : d), [shouldReduceMotion]);

  const [minimizing, setMinimizing] = useState(false);

  // Reset if store's isMinimized is cleared externally (e.g. restored via dock click before animation ends)
  useEffect(() => {
    if (!isMinimized) setMinimizing(false);
  }, [isMinimized]);

  if (isMinimized && !minimizing) return null;

  const viewportWidth  = typeof window !== 'undefined' ? window.innerWidth  : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const maximizedStyle = {
    position: { x: 0, y: MENUBAR_HEIGHT },
    size: {
      width:  viewportWidth  - ICONSTRIP_WIDTH,
      height: viewportHeight - MENUBAR_HEIGHT,
    },
  };

  const clampedPosition = {
    x: Math.max(-((size?.width  || 320) - 100), Math.min(position.x, viewportWidth  - 100)),
    y: Math.max(MENUBAR_HEIGHT, Math.min(position.y, viewportHeight - 40)),
  };

  const rndPosition = isMaximized ? maximizedStyle.position : clampedPosition;
  const rndSize     = isMaximized ? maximizedStyle.size     : size;

  const handleMinimize = () => {
    if (shouldReduceMotion) {
      minimizeWindow(id);
      return;
    }
    setMinimizing(true);
  };

  const handleMinimizeAnimationComplete = (definition) => {
    if (definition === 'minimized') {
      minimizeWindow(id);
      setMinimizing(false);
    }
  };

  const isFocused = zIndex >= nextZIndex - 1;

  const animateTarget = minimizing ? 'minimized' : 'open';

  const variants = {
    initial: {
      opacity: 0,
      scale: 0.96,
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: dur(DUR_OPEN), ease: [0.22, 1, 0.36, 1] },
    },
    closed: {
      opacity: 0,
      scale: 0.97,
      transition: { duration: dur(DUR_CLOSE), ease: [0.4, 0, 0.6, 1] },
    },
    minimized: {
      opacity: 0,
      scale: 0.88,
      y: viewportHeight * 0.25,
      transition: { duration: dur(DUR_MIN), ease: [0.4, 0, 1, 1] },
    },
  };

  return (
    <Rnd
      position={rndPosition}
      size={rndSize}
      style={{ zIndex, position: 'relative' }}
      dragHandleClassName="window-drag-handle"
      disableDragging={isMaximized || minimizing}
      enableResizing={!isMaximized && !minimizing}
      bounds="parent"
      role="dialog"
      aria-label={title}
      onDragStop={(_e, d) => {
        const clampedX = Math.max(-((size?.width || 320) - 100), Math.min(d.x, viewportWidth - 100));
        const clampedY = Math.max(MENUBAR_HEIGHT, Math.min(d.y, viewportHeight - 40));
        setPosition(id, { x: clampedX, y: clampedY });
      }}
      onResizeStop={(_e, _dir, _ref, _delta, pos) => {
        setSize(id, { width: _ref.offsetWidth, height: _ref.offsetHeight });
        setPosition(id, pos);
      }}
      onMouseDown={() => focusWindow(id)}
      minWidth={320}
      minHeight={200}
    >
      <motion.div
        className="window-panel"
        key={id}
        initial="initial"
        animate={animateTarget}
        exit="closed"
        variants={variants}
        onAnimationComplete={handleMinimizeAnimationComplete}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--dt-window-radius, 12px)',
          background: 'var(--dt-surface)',
          border: 'var(--dt-window-border, 1px solid var(--dt-accent-border-strong))',
          boxShadow: isFocused
            ? 'var(--dt-shadow-focused)'
            : 'var(--dt-shadow-unfocused)',
          backdropFilter: 'var(--dt-window-blur)',
          WebkitBackdropFilter: 'var(--dt-window-blur)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <WindowTitlebar
          title={title}
          isMaximized={isMaximized}
          onClose={() => closeWindow(id)}
          onMinimize={handleMinimize}
          onMaximize={() => maximizeWindow(id)}
        />

        <div
          className="dark"
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '40px',
            minHeight: 0,
            background: 'transparent',
            color: 'var(--dt-text)',
          }}
        >
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}

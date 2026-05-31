'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useWindowStore } from '@/store/windowStore';
import {
  getWorldIcon,
  getCurrentWorldId,
  createWorldChangeListener,
} from '@/config/worldContent';
import { Tooltip } from '@/components/ui/Tooltip';

const STRIP_ITEMS = [
  { appId: 'terminal',    icon: '🖥️', label: 'Terminal'    },
  { appId: 'filemanager', icon: '📁', label: 'Files'       },
  { appId: 'logviewer',   icon: '📰', label: 'Blog'        },
  { appId: 'browser',     icon: '🌐', label: 'Browser'     },
  { appId: 'gallery',     icon: '🖼️', label: 'Gallery'     },
  { appId: 'journal',     icon: '📖', label: 'Journal'     },
  { appId: 'codex',       icon: '📖', label: 'Codex'       },
  { appId: 'about',       icon: '👤', label: 'About'       },
  { appId: 'mail',        icon: '✉️', label: 'Contact'     },
  { appId: 'resume',      icon: '📄', label: 'Resume'      },
  { appId: 'trash',       icon: '🗑️', label: 'Trash'       },
];

const SPRING = { type: 'spring', stiffness: 400, damping: 20 };

export default function IconStrip() {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [worldId, setWorldId] = useState(getCurrentWorldId);
  const reducedMotion = useReducedMotion();

  useEffect(() => createWorldChangeListener(setWorldId), []);

  const handleClick = (action) => {
    if (action === 'resume') {
      window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
      return;
    }
    openWindow(action);
  };

  const hoverAnim = reducedMotion ? {} : { y: -2, scale: 1.12 };
  const tapAnim   = reducedMotion ? {} : { scale: 0.9 };

  return (
    <aside
      aria-label="Application launcher"
      data-kitsune-platform="iconstrip"
      style={{
        position: 'fixed',
        right: 0,
        top: 'var(--dt-menubar-height)',
        bottom: 0,
        width: 'var(--dt-iconstrip-width)',
        zIndex: 90,
        background: 'var(--dt-iconstrip-bg)',
        backdropFilter: 'var(--dt-window-blur)',
        WebkitBackdropFilter: 'var(--dt-window-blur)',
        borderLeft: '1px solid var(--dt-iconstrip-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: 4,
        overflowY: 'auto',
      }}
    >
      {STRIP_ITEMS.map((item) => {
        const { icon, label } = getWorldIcon(worldId, item.appId, item.icon, item.label);
        return (
          <Tooltip key={item.appId} content={label} side="left">
            <motion.button
              onClick={() => handleClick(item.appId)}
              aria-label={label}
              whileHover={hoverAnim}
              whileTap={tapAnim}
              transition={SPRING}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: 52,
                padding: '8px 4px',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--dt-text)',
                fontFamily: 'var(--dt-font-body, sans-serif)',
                transition: 'background 0.12s ease, border-color 0.12s ease, color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--dt-accent-soft)';
                e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
                e.currentTarget.style.color = 'var(--dt-accent)';
                if (!reducedMotion) {
                  e.currentTarget.style.boxShadow = '0 0 10px 2px var(--dt-accent, #7c5cfc44)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--dt-text)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                  color: 'var(--dt-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 52,
                }}
              >
                {label}
              </span>
            </motion.button>
          </Tooltip>
        );
      })}
    </aside>
  );
}

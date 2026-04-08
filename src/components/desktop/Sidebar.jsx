'use client';

import { useSidebarStore } from '@/store/sidebarStore';
import { useWindowStore } from '@/store/windowStore';

const ITEMS = [
  { icon: '👤', label: 'About Me', action: 'about' },
  { icon: '📰', label: 'Blog', action: 'logviewer' },
  { icon: '📁', label: 'Projects', action: 'filemanager' },
  { icon: '📄', label: 'Resume', action: 'resume' },
  { icon: '✉️', label: 'Contact', action: 'mail' },
  { icon: '🗑️', label: 'Trash', action: 'trash' },
];

export default function Sidebar() {
  const sidebarOpen = useSidebarStore((s) => s.sidebarOpen);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const openWindow = useWindowStore((s) => s.openWindow);

  const handleClick = (action) => {
    if (action === 'resume') {
      window.open('/resume.pdf', '_blank');
      return;
    }
    openWindow(action);
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: '48px',
        width: sidebarOpen ? '200px' : '40px',
        zIndex: 90,
        background: 'var(--dt-surface)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid var(--dt-accent-border)',
        transition: 'width 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--dt-text-muted)',
          cursor: 'pointer',
          padding: '10px',
          fontSize: '12px',
          textAlign: sidebarOpen ? 'right' : 'center',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dt-accent)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dt-text-muted)'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
        {ITEMS.map((item) => (
          <button
            key={item.action}
            onClick={() => handleClick(item.action)}
            title={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              height: '48px',
              padding: sidebarOpen ? '0 16px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--dt-text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'monospace',
              transition: 'background 0.1s ease, color 0.1s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dt-accent-border)';
              e.currentTarget.style.color = 'var(--dt-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--dt-text)';
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

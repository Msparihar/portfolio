'use client';

import { useState, useCallback, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import { getWorldIcon, getCurrentWorldId, createWorldChangeListener } from '@/config/worldContent';

const DESKTOP_ICONS = [
  { appId: 'terminal',    icon: '🖥️', label: 'terminal.sh' },
  { appId: 'filemanager', icon: '📁', label: 'projects/'    },
  { appId: 'logviewer',   icon: '📰', label: 'system.log'   },
  { appId: 'mail',        icon: '✉️', label: 'mail'          },
  { appId: 'about',       icon: '👤', label: 'whoami'        },
  { appId: 'browser',     icon: '🌐', label: 'browser'       },
  { appId: 'resume',      icon: '📄', label: 'resume.pdf'   },
  { appId: 'trash',       icon: '🗑️', label: 'trash'         },
];

export default function DesktopIconGrid({ onOpenApp, selectedIcon, onSelectIcon }) {
  const [worldId, setWorldId] = useState(getCurrentWorldId);

  useEffect(() => {
    return createWorldChangeListener(setWorldId);
  }, []);

  const handleSelect = useCallback(
    (appId) => {
      if (onSelectIcon) onSelectIcon(appId);
    },
    [onSelectIcon]
  );

  const handleOpen = useCallback(
    (appId) => {
      if (onOpenApp) onOpenApp(appId);
    },
    [onOpenApp]
  );

  return (
    <div
      className="flex flex-col flex-wrap gap-2"
      style={{
        maxHeight: 'calc(100vh - 80px)',
        alignContent: 'flex-start',
      }}
    >
      {DESKTOP_ICONS.map((item) => {
        const { icon, label } = getWorldIcon(worldId, item.appId, item.icon, item.label);
        return (
          <DesktopIcon
            key={item.appId}
            icon={icon}
            label={label}
            appId={item.appId}
            isSelected={selectedIcon === item.appId}
            onSelect={handleSelect}
            onOpen={handleOpen}
          />
        );
      })}
    </div>
  );
}

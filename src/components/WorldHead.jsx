"use client";

import { useEffect } from 'react';
import { getCurrentWorldId, getWorldPageTitle, createWorldChangeListener } from '@/config/worldContent';

export default function WorldHead() {
  useEffect(() => {
    const update = (worldId) => {
      document.title = getWorldPageTitle(worldId);
    };

    update(getCurrentWorldId());
    return createWorldChangeListener(update);
  }, []);

  return null;
}

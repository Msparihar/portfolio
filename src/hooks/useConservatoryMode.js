'use client';

import { useState, useEffect } from 'react';

export function useConservatoryMode() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (e) => setActive(Boolean(e.detail?.active));
    window.addEventListener('conservatory-mode-changed', handler);
    return () => window.removeEventListener('conservatory-mode-changed', handler);
  }, []);

  return active;
}

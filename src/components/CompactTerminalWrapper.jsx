"use client";

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false for CompactTerminal (uses browser APIs)
const CompactTerminal = dynamic(() => import("@/components/CompactTerminal").then(mod => ({ default: mod.CompactTerminal })), {
  ssr: false
});

export default CompactTerminal;

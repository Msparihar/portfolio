"use client";
import dynamic from 'next/dynamic';

const EnhancedTerminal = dynamic(() => import("@/components/terminal/EnhancedTerminal"), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading terminal...</div>
});

export default EnhancedTerminal;

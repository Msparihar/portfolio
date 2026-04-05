"use client";

import { useState, useEffect } from "react";
import BootOverlay from "./BootOverlay";
import Desktop from "./Desktop";

export default function DesktopPage({ githubData }) {
  const [booted, setBooted] = useState(false);
  const [initialApp, setInitialApp] = useState(null);

  // Read ?app= from URL on mount (client-side, compatible with ISR pages)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get("app");
    if (app) setInitialApp(app);
  }, []);

  return (
    <>
      {/* Boot overlay is shown on top (position:fixed) until boot completes */}
      {!booted && <BootOverlay onBootComplete={() => setBooted(true)} />}

      {/* Desktop renders beneath (or immediately for returning visitors) */}
      <Desktop githubData={githubData} initialApp={initialApp} />
    </>
  );
}

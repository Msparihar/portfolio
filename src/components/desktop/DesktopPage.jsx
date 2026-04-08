"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useUiStore } from "@/store/uiStore";
import { WORLDS, WORLD_STORAGE_KEY } from '@/config/worlds';
import BootOverlay from "./BootOverlay";
import Desktop from "./Desktop";

const WebsiteMode = dynamic(() => import("@/components/website/WebsiteMode"), {
  ssr: false,
});

export default function DesktopPage({ githubData }) {
  const [booted, setBooted] = useState(false);
  const [initialApp, setInitialApp] = useState(null);
  const websiteMode = useUiStore((s) => s.websiteMode);
  const [worldBootConfig] = useState(() => {
    try {
      const worldId = localStorage.getItem(WORLD_STORAGE_KEY);
      if (!worldId) return null;
      const world = WORLDS.find(w => w.id === worldId);
      if (!world?.bootLines) return null;
      return {
        bootLines: world.bootLines,
        bootAccentColor: world.bootAccentColor ?? null,
      };
    } catch { return null; }
  });

  // Read ?app= from URL on mount (client-side, compatible with ISR pages)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get("app");
    if (app) setInitialApp(app);
  }, []);

  // Website Mode: skip boot overlay and render website layout
  if (websiteMode) {
    return <WebsiteMode />;
  }

  return (
    <>
      {!booted && (
        <BootOverlay
          bootLines={worldBootConfig?.bootLines ?? null}
          bootAccentColor={worldBootConfig?.bootAccentColor ?? null}
          onBootComplete={() => setBooted(true)}
        />
      )}
      <Desktop githubData={githubData} initialApp={initialApp} />
    </>
  );
}

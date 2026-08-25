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

const WelcomeLanding = dynamic(
  () => import("@/components/welcome/WelcomeLanding"),
  { ssr: false }
);

const SG_ENTERED_KEY = 'sg_entered_ghibli';

export default function DesktopPage({ githubData }) {
  const [booted, setBooted] = useState(false);
  const [initialApp, setInitialApp] = useState(null);
  const websiteMode = useUiStore((s) => s.websiteMode);
  const [worldBootConfig, setWorldBootConfig] = useState(null);
  const [entrySurface, setEntrySurface] = useState(null);

  useEffect(() => {
    let savedWorldId = 'ghibli';
    try {
      savedWorldId = localStorage.getItem(WORLD_STORAGE_KEY) || savedWorldId;
      const world = WORLDS.find(w => w.id === savedWorldId);
      if (world?.bootLines) {
        setWorldBootConfig({
          bootLines: world.bootLines,
          bootAccentColor: world.bootAccentColor ?? null,
        });
      }

      if (window.innerWidth >= 768 && savedWorldId === 'ghibli') {
        const entered = localStorage.getItem(SG_ENTERED_KEY) === '1';
        setEntrySurface(entered ? 'desktop' : 'welcome');
      } else {
        setEntrySurface('desktop');
      }
    } catch {
      // If storage is unavailable, preserve the existing fallback of entering
      // the desktop instead of trapping the visitor at an unpersistable gate.
      setEntrySurface('desktop');
    }
  }, []);

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

  if (!booted) {
    return (
      <BootOverlay
        bootLines={worldBootConfig?.bootLines ?? null}
        bootAccentColor={worldBootConfig?.bootAccentColor ?? null}
        onBootComplete={() => setBooted(true)}
      />
    );
  }

  if (entrySurface === 'welcome') {
    return (
      <WelcomeLanding
        worldSkin="ghibli"
        onEnter={() => setEntrySurface('desktop')}
      />
    );
  }

  if (entrySurface === 'desktop') {
    return <Desktop githubData={githubData} initialApp={initialApp} />;
  }

  return null;
}

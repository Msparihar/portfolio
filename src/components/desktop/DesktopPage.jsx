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
  const [worldId, setWorldId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [desktopReady, setDesktopReady] = useState(false);

  useEffect(() => {
    try {
      const savedWorldId = localStorage.getItem(WORLD_STORAGE_KEY) || 'ghibli';
      setWorldId(savedWorldId);
      const world = WORLDS.find(w => w.id === savedWorldId);
      if (world?.bootLines) {
        setWorldBootConfig({
          bootLines: world.bootLines,
          bootAccentColor: world.bootAccentColor ?? null,
        });
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  useEffect(() => {
    if (!booted || isMobile || worldId !== 'ghibli') return;
    try {
      const entered = localStorage.getItem(SG_ENTERED_KEY) === '1';
      if (!entered) setShowWelcome(true);
    } catch { /* storage unavailable */ }
  }, [booted, isMobile, worldId]);

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
      <Desktop githubData={githubData} initialApp={initialApp} autoOpen={desktopReady} />
      {showWelcome && (
        <WelcomeLanding
          worldSkin="ghibli"
          onEnter={() => {
            setDesktopReady(true);
            setShowWelcome(false);
          }}
        />
      )}
    </>
  );
}

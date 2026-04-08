"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useUiStore } from "@/store/uiStore";
import BootOverlay from "./BootOverlay";
import Desktop from "./Desktop";

const WebsiteMode = dynamic(() => import("@/components/website/WebsiteMode"), {
  ssr: false,
});

export default function DesktopPage({ githubData }) {
  const [booted, setBooted] = useState(false);
  const [initialApp, setInitialApp] = useState(null);
  const websiteMode = useUiStore((s) => s.websiteMode);

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
      {!booted && <BootOverlay onBootComplete={() => setBooted(true)} />}
      <Desktop githubData={githubData} initialApp={initialApp} />
    </>
  );
}

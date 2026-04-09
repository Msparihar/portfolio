"use client";

import { useState, useEffect } from "react";

const BOOT_LINES = [
  "PORTFOLIO OS v3.0",
  "Copyright (C) 2026 Manish Singh Parihar",
  "",
  "Detecting hardware................OK",
  "Loading kernel modules.............OK",
  "Mounting filesystems...............OK",
  "Starting network services..........OK",
  "Loading portfolio data.............OK",
  "Initializing window manager........OK",
  "",
  "Welcome to manish@portfolio",
  "Starting desktop...",
];

// Lines that end with "OK" get the brighter green treatment
const isOkLine = (line) => line.trimEnd().endsWith("OK");

function BootLine({ line, okColor }) {
  if (line === "") return <div className="h-4" />;

  if (isOkLine(line)) {
    const okIndex = line.lastIndexOf("OK");
    const before = line.slice(0, okIndex);
    return (
      <div>
        <span>{before}</span>
        <span style={{ color: okColor || "var(--dt-accent)" }}>OK</span>
      </div>
    );
  }

  return <div>{line}</div>;
}

export default function BootOverlay({ onBootComplete, bootLines: customBootLines, bootAccentColor }) {
  const activeBootLines = customBootLines && customBootLines.length > 0 ? customBootLines : BOOT_LINES;

  const [visibleLines, setVisibleLines] = useState([]);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check if already booted — skip animation
    try {
      if (localStorage.getItem("portfolio_booted") === "1") {
        onBootComplete();
        return;
      }
    } catch {
      // localStorage may be unavailable (SSR/private mode) — proceed with animation
    }

    let cancelled = false;
    let timeoutId;

    async function runBootSequence() {
      for (let i = 0; i < activeBootLines.length; i++) {
        if (cancelled) return;
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, i === 0 ? 0 : 175);
        });
        if (cancelled) return;
        setVisibleLines((prev) => [...prev, activeBootLines[i]]);
      }

      // All lines shown — wait 500ms then fade out
      await new Promise((resolve) => {
        timeoutId = setTimeout(resolve, 500);
      });
      if (cancelled) return;

      setFading(true);

      // After fade transition (800ms), mark done and call callback
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setDone(true);
        try {
          localStorage.setItem("portfolio_booted", "1");
        } catch {
          // ignore
        }
        onBootComplete();
      }, 800);
    }

    runBootSequence();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [onBootComplete]);

  if (done) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--dt-bg)',
        padding: "40px",
        fontFamily: "var(--dt-font-mono, monospace)",
        fontSize: "0.875rem",
        color: bootAccentColor?.text || "var(--dt-accent)",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {visibleLines.map((line, i) => {
        const isLast = i === visibleLines.length - 1;
        const isFirstLine = i === 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", fontFamily: isFirstLine ? "var(--dt-font-heading, var(--dt-font-mono, monospace))" : undefined }}>
            <BootLine line={line} okColor={bootAccentColor?.ok} />
            {isLast && !fading && (
              <span
                style={{
                  display: "inline-block",
                  width: "0.6em",
                  height: "1.1em",
                  backgroundColor: bootAccentColor?.text || "var(--dt-accent)",
                  marginLeft: "2px",
                  verticalAlign: "text-bottom",
                  animation: "boot-cursor-blink 1s step-end infinite",
                }}
              />
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes boot-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

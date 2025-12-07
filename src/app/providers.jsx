"use client";

import { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import ImagePreloader from "@/components/ImagePreloader";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";

// Clean up ref param from URL after tracking
function RefCleanup() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("ref=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  return null;
}

export function Providers({ children }) {
  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="portfolio-theme"
      >
        <TerminalProvider>
          <ImagePreloader />
          <RefCleanup />
          <Suspense fallback={null}>
            <RouteLoadingIndicator />
          </Suspense>
          {children}
        </TerminalProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
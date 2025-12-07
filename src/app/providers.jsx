"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import ImagePreloader from "@/components/ImagePreloader";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";

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
          <Suspense fallback={null}>
            <RouteLoadingIndicator />
          </Suspense>
          {children}
        </TerminalProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
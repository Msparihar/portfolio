"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import ImagePreloader from "@/components/ImagePreloader";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";

export function Providers({ children }) {
  return (
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
  );
}
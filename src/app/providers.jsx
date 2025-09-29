"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import ImagePreloader from "@/components/ImagePreloader";
import { config } from '@fortawesome/fontawesome-svg-core';

// Initialize Font Awesome
config.autoAddCss = false;

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
        {children}
      </TerminalProvider>
    </ThemeProvider>
  );
}
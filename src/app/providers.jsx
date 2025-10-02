"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import ImagePreloader from "@/components/ImagePreloader";

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
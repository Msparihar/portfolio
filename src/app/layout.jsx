"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TerminalProvider } from "@/components/TerminalContext";
import ImagePreloader from "@/components/ImagePreloader";
import "./globals.css";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Initialize Font Awesome
config.autoAddCss = false;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/icons/terminal-favicon.svg" type="image/svg+xml" />
        <title>Manish Singh Parihar | Full Stack & AI Engineer</title>

        {/* Resource hints for external domains */}
        <link rel="dns-prefetch" href="//github.com" />
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="dns-prefetch" href="//avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="//raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="//blog.futuresmart.ai" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />

        {/* Preconnect to critical external domains */}
        <link rel="preconnect" href="https://github.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.github.com" crossOrigin="" />
        <link rel="preconnect" href="https://blog.futuresmart.ai" crossOrigin="" />

        {/* Prefetch critical fonts */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap" as="style" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap" as="style" />

        {/* Preload critical project images */}
        <link rel="preload" href="/images/llama-3.1-novel.png" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/fire.gif" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/video-super-resolution.png" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/globetrotter.png" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/youtube-transcriber.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/medical-chatbot.png" as="image" fetchPriority="high" />

        {/* Preload critical blog images */}
        <link rel="preload" href="/images/blog-finetune-llama.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/blog-rag-evaluation.jpg" as="image" fetchPriority="high" />
        <link rel="preload" href="/images/blog-ollama.jpg" as="image" fetchPriority="high" />
      </head>
      <body>
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
      </body>
    </html>
  );
}

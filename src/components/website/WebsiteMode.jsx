'use client';

import { useUiStore } from '@/store/uiStore';
import WebsiteNav from './WebsiteNav';
import WebsiteHero from './WebsiteHero';
import WebsiteAbout from './WebsiteAbout';
import WebsiteProjects from './WebsiteProjects';
import WebsiteBlog from './WebsiteBlog';
import WebsiteContact from './WebsiteContact';

export default function WebsiteMode() {
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <WebsiteNav />
      <main>
        <WebsiteHero />
        <WebsiteAbout />
        <WebsiteProjects />
        <WebsiteBlog />
        <WebsiteContact />
      </main>
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <button
          onClick={toggleWebsiteMode}
          className="text-zinc-400 hover:text-white transition-colors underline"
        >
          Switch to OS Mode
        </button>
        <p className="mt-4">&copy; {new Date().getFullYear()} Manish Singh Parihar</p>
      </footer>
    </div>
  );
}

'use client';

import { useUiStore } from '@/store/uiStore';
import portfolioData from '@/config/portfolio.json';

export default function WebsiteHero() {
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {portfolioData.name}
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-8">
          {portfolioData.title}
        </p>
        <p className="text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
          {portfolioData.bio}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="px-6 py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
          >
            Get in Touch
          </a>
          <button
            onClick={toggleWebsiteMode}
            className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-sm"
          >
            Switch to OS Mode &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}

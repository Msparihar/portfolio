'use client';

import portfolioData from '@/config/portfolio.json';

const SKILL_CATEGORIES = [
  { label: 'Languages', key: 'languages' },
  { label: 'Frameworks', key: 'frameworks' },
  { label: 'Tools', key: 'tools' },
  { label: 'AI/ML', key: 'ai_ml' },
];

export default function WebsiteAbout() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">About</h2>
        <p className="text-zinc-400 leading-relaxed mb-12 max-w-2xl">
          {portfolioData.bio}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SKILL_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(portfolioData.skills?.[cat.key] ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

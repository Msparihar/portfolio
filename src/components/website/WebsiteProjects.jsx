'use client';

import portfolioData from '@/config/portfolio.json';

function isVideo(src) {
  return src?.endsWith('.webm') || src?.endsWith('.mp4');
}

export default function WebsiteProjects() {
  const projects = portfolioData.projects ?? [];

  return (
    <section id="projects" className="py-24 px-6 bg-zinc-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <a
              key={i}
              href={project.github || project.live || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors"
            >
              {project.image && (
                <div className="aspect-video overflow-hidden">
                  {isVideo(project.image) ? (
                    <video
                      src={project.image}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="text-white font-medium mb-1">{project.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                {project.tech && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tech.slice(0, 4).map((t) => (
                      <span key={t} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

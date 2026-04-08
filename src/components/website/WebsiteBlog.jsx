'use client';

import portfolioData from '@/config/portfolio.json';

export default function WebsiteBlog() {
  const blogs = portfolioData.blogs ?? [];

  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post, i) => (
            <a
              key={i}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors"
            >
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-white font-medium mb-1 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-zinc-600">
                  <span>{post.date}</span>
                  {post.readTime && <span>{post.readTime} min read</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import portfolioData from '@/config/portfolio.json';

export default function sitemap() {
  const baseUrl = 'https://manishsingh.tech';

  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Add project pages (if you want individual project pages in the future)
  // const projectRoutes = portfolioData.projects.map((project) => ({
  //   url: `${baseUrl}/projects/${encodeURIComponent(project.name.toLowerCase().replace(/\s+/g, '-'))}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'monthly',
  //   priority: 0.7,
  // }));

  // Add blog post pages (external links, so typically not included)
  // But if you want to list them for reference:
  // const blogRoutes = portfolioData.blogs.map((blog) => ({
  //   url: blog.url, // External URL
  //   lastModified: new Date(blog.date),
  //   changeFrequency: 'never',
  //   priority: 0.5,
  // }));

  return routes;
}
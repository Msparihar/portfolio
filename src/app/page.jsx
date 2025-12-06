import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import portfolioData from '@/config/portfolio.json';
import { Github, Linkedin, Twitter, Hash } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Terminal } from '@/components/TerminalContext';

// Lazy load GitHub contributions to reduce initial bundle size
const GithubContributions = dynamic(() => import('@/components/GithubContributions'), {
  ssr: true, // Keep SSR for ISR data
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading GitHub contributions...</div>
});

import FeaturedProjects from '@/components/FeaturedProjects';
import { ClientWrapper } from '@/components/ClientWrapper';
import { personSchema, websiteSchema, profilePageSchema } from './metadata';

// ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

// Metadata for home page
export const metadata = {
  title: 'Home',
  description: `${portfolioData.name} - ${portfolioData.title}. ${portfolioData.bio}`,
  openGraph: {
    title: `${portfolioData.name} | ${portfolioData.title}`,
    description: portfolioData.bio,
    url: 'https://manishsingh.tech',
    type: 'website'
  }
};

// Import fast fallback-first GitHub function for instant page loads
import { getGithubContributionsFast } from '@/lib/githubContributions';

// Fetch GitHub contributions data server-side with fallback-first strategy
// This returns cached/fallback data instantly without waiting for API
async function fetchGithubContributions() {
  try {
    const githubUsername = portfolioData.githubUsername || 'Msparihar';
    const result = await getGithubContributionsFast(githubUsername);
    return result;
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return { error: true, message: error.message };
  }
}

const NavLink = ({ path, label, isActive = false }) => (
  <Link
    href={`/${path === 'home' ? '' : path}`}
    className={`group text-left transition-colors px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-sm sm:text-base
    ${isActive
      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
      : 'hover:bg-black/20 dark:hover:bg-white/5 hover:text-green-500'
    }`}
  >
    <span className="terminal-prompt">$</span>
    <span className={`ml-1 ${isActive ? 'text-green-500' : 'text-muted-foreground group-hover:text-green-500'}`}>
      {label || path}
    </span>
  </Link>
);

export default async function Home() {
  // Fetch GitHub contributions data server-side for ISR
  const githubData = await fetchGithubContributions();

  return (
    <ClientWrapper>
      {/* JSON-LD Structured Data - Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* JSON-LD Structured Data - Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* JSON-LD Structured Data - Profile Page Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
        {/* Grid background for the entire page */}
        <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8">
          {/* Header with Navigation */}
          <div className="mb-6 sm:mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
            <div className="p-3 sm:p-4 md:p-5 grid [grid-template-columns:1fr_auto] md:grid-cols-3 gap-3 sm:gap-4 md:items-center">
              {/* Terminal identifier - Left */}
              <div className="col-start-1 row-start-1 flex items-center text-sm sm:text-base text-green-500/90">
                <span className="terminal-prompt mr-2">~</span>
                <span className="font-medium truncate">{portfolioData.name.toLowerCase()}</span>
              </div>

              {/* Navigation - Center on desktop, full width row 2 on mobile */}
              <nav className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1 flex flex-nowrap items-center gap-1.5 sm:gap-3 md:justify-self-center">
                <NavLink path="home" isActive={true} />
                <NavLink path="projects" />
                <NavLink path="contact" />
                <NavLink path="blog" label="blog" />
              </nav>

              {/* Theme toggle - Right on same row as name (mobile), Right on desktop */}
              <div className="col-start-2 row-start-1 md:col-start-3 justify-self-end">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Main terminal interface */}
          <div className="relative">
            <Terminal />
          </div>

          {/* Featured Projects Section */}
          <FeaturedProjects />

          {/* GitHub Contributions Section */}
          <div className="mt-12 min-h-[520px]">
            <GithubContributions githubData={githubData} />
          </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground border-t border-border/20 pt-4 pb-2">
          <div className="terminal-line opacity-60 px-2">
            <span className="terminal-prompt">$</span>
            <span className="ml-2 break-words" suppressHydrationWarning>
              {`echo "© ${new Date().getFullYear()} • ${portfolioData.name} • Built with Next.js and Tailwind CSS"`}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 sm:gap-6 px-3">
            <a
              href={`https://${portfolioData.contact.github}`}
              className="text-muted-foreground hover:text-[#333] dark:hover:text-white transition-colors flex items-center gap-1 sm:gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">GitHub</span>
            </a>
            <a
              href={`https://${portfolioData.contact.linkedin}`}
              className="text-muted-foreground hover:text-[#0077B5] transition-colors flex items-center gap-1 sm:gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">LinkedIn</span>
            </a>
            {portfolioData.contact.twitter && (
              <a
                href={`https://twitter.com/${portfolioData.contact.twitter.replace('@', '')}`}
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center gap-1 sm:gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Twitter</span>
              </a>
            )}
            <a
              href="https://hashnode.com/@manishsparihar"
              className="text-muted-foreground hover:text-[#2962FF] transition-colors flex items-center gap-1 sm:gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Hash className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Hashnode</span>
            </a>
          </div>
        </footer>
        </div>
      </main>
    </ClientWrapper>
  );
}

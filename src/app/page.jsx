import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import portfolioData from '@/config/portfolio.json';
import { Github, Linkedin, Twitter, Hash } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load Terminal component to reduce initial bundle size
const Terminal = dynamic(() => import('@/components/TerminalContext').then(mod => ({ default: mod.Terminal })), {
  ssr: true,
  loading: () => (
    <div className="terminal-container relative overflow-hidden min-h-[200px] flex items-center justify-center">
      <div className="text-center text-muted-foreground">Loading terminal...</div>
    </div>
  )
});

// Lazy load GitHub contributions to reduce initial bundle size
const GithubContributions = dynamic(() => import('@/components/GithubContributions'), {
  ssr: true, // Keep SSR for ISR data
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading GitHub contributions...</div>
});
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
    className={`group text-left transition-colors px-3 py-1.5 rounded-md
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Header with Navigation */}
          <div className="mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
            <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Terminal identifier */}
              <div className="flex items-center text-sm text-green-500/90 hidden md:flex">
                <span className="terminal-prompt mr-2">~</span>
                <span className="mr-4 font-medium">{portfolioData.name.toLowerCase()}</span>
              </div>

              {/* Navigation */}
              <nav className="flex flex-wrap items-center gap-2">
                <NavLink path="home" isActive={true} />
                <NavLink path="projects" />
                <NavLink path="contact" />
                <NavLink path="blog" label="blog" />
              </nav>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* Main terminal interface */}
          <div className="relative">
            <Terminal />
          </div>

          {/* GitHub Contributions Section */}
          <div className="mt-12 min-h-[520px]">
            <GithubContributions githubData={githubData} />
          </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground border-t border-border/20 pt-4 pb-2">
          <div className="terminal-line opacity-60">
            <span className="terminal-prompt">$</span>
            <span className="ml-2" suppressHydrationWarning>
              {`echo "© ${new Date().getFullYear()} • ${portfolioData.name} • Built with Next.js and
              Tailwind CSS"`}
            </span>
          </div>
          <div className="mt-3 flex justify-center space-x-6">
            <a
              href={`https://${portfolioData.contact.github}`}
              className="text-muted-foreground hover:text-[#333] dark:hover:text-white transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href={`https://${portfolioData.contact.linkedin}`}
              className="text-muted-foreground hover:text-[#0077B5] transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
            </a>
            {portfolioData.contact.twitter && (
              <a
                href={`https://twitter.com/${portfolioData.contact.twitter.replace('@', '')}`}
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </a>
            )}
            <a
              href="https://hashnode.com/@manishsparihar"
              className="text-muted-foreground hover:text-[#2962FF] transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Hash className="w-5 h-5" />
              <span>Hashnode</span>
            </a>
          </div>
        </footer>
        </div>
      </main>
    </ClientWrapper>
  );
}

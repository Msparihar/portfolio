import { Terminal } from "@/components/TerminalContext";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import portfolioData from '@/config/portfolio.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedinIn,
  faTwitter,
  faHashnode
} from '@fortawesome/free-brands-svg-icons';
import GithubContributions from '@/components/GithubContributions';
import { ClientWrapper } from '@/components/ClientWrapper';

// ISR: Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

// Fetch GitHub contributions data server-side
async function getGithubContributions() {
  try {
    const githubUsername = portfolioData.githubUsername || 'Msparihar';
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/github-contributions?username=${githubUsername}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const result = await response.json();
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
  const githubData = await getGithubContributions();

  return (
    <ClientWrapper>
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
          <div className="mt-12">
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
              <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href={`https://${portfolioData.contact.linkedin}`}
              className="text-muted-foreground hover:text-[#0077B5] transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5" />
              <span>LinkedIn</span>
            </a>
            {portfolioData.contact.twitter && (
              <a
                href={`https://twitter.com/${portfolioData.contact.twitter.replace('@', '')}`}
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
                <span>Twitter</span>
              </a>
            )}
            <a
              href="https://hashnode.com/@manishsparihar"
              className="text-muted-foreground hover:text-[#2962FF] transition-colors flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faHashnode} className="w-5 h-5" />
              <span>Hashnode</span>
            </a>
          </div>
        </footer>
        </div>
      </main>
    </ClientWrapper>
  );
}

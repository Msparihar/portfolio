import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import portfolioData from '@/config/portfolio.json';
import { Github, Linkedin, Twitter, Hash } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load components
const GithubContributions = dynamic(() => import('@/components/GithubContributions'), {
  ssr: true,
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading GitHub contributions...</div>
});

// Import client wrappers for components that require ssr: false
import EnhancedTerminal from '@/components/terminal/EnhancedTerminalWrapper';
import TypewriterHero from '@/components/hero/TypewriterHeroWrapper';
import ParticleBackground from '@/components/effects/ParticleBackgroundWrapper';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { ParallaxLayer } from '@/components/effects/ParallaxLayer';
import { NumberCounter } from '@/components/effects/NumberCounter';

import { ClientWrapper } from '@/components/ClientWrapper';
import { personSchema, websiteSchema, profilePageSchema } from './metadata';

// ISR: Revalidate every 24 hours
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

// Import shared GitHub contributions function
import { getGithubContributions } from '@/lib/githubContributions';

// Fetch GitHub contributions data server-side
async function fetchGithubContributions() {
  try {
    const githubUsername = portfolioData.githubUsername || 'Msparihar';
    const result = await getGithubContributions(githubUsername);
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
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
        {/* Particle Background Effect */}
        <ParticleBackground variant="matrix" />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10 opacity-30" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

        {/* Parallax Animated gradient orbs */}
        <ParallaxLayer speed={0.3} className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <ParallaxLayer speed={0.5} className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
        <ParallaxLayer speed={0.2} className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500 pointer-events-none" />

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
                <NavLink path="about" label="about" />
                <NavLink path="skills" label="skills" />
                <NavLink path="projects" />
                <NavLink path="blog" label="blog" />
                <NavLink path="contact" />
              </nav>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* Advanced Hero Section with Typewriter & Animations */}
          <TypewriterHero portfolioData={portfolioData} />

          {/* Enhanced Terminal Interface */}
          <ScrollReveal className="relative mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-sm text-muted-foreground font-medium">Interactive Terminal</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <EnhancedTerminal />
          </ScrollReveal>

          {/* Stats Section */}
          <ScrollReveal className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">
                  <NumberCounter value={portfolioData.projects.length} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
              <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">
                  <NumberCounter value={githubData?.totalContributions || 0} />
                </div>
                <div className="text-sm text-muted-foreground">Contributions</div>
              </div>
              <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">
                  <NumberCounter value={portfolioData.experience?.length || 5} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                  <NumberCounter value={Object.keys(portfolioData.skills).reduce((acc, key) => acc + portfolioData.skills[key].length, 0)} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Technologies</div>
              </div>
            </div>
          </ScrollReveal>

          {/* GitHub Contributions Section */}
          <ScrollReveal className="mt-12 min-h-[520px]">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Github className="w-6 h-6 text-green-500" />
                GitHub Activity
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <GithubContributions githubData={githubData} />
          </ScrollReveal>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground border-t border-border/20 pt-6 pb-4">
          <div className="terminal-line opacity-60 mb-4">
            <span className="terminal-prompt">$</span>
            <span className="ml-2" suppressHydrationWarning>
              {`echo "© ${new Date().getFullYear()} • ${portfolioData.name} • Built with Next.js and Tailwind CSS"`}
            </span>
          </div>
          <div className="flex justify-center space-x-6">
            <a
              href={`https://${portfolioData.contact.github}`}
              className="text-muted-foreground hover:text-[#333] dark:hover:text-white transition-colors flex items-center gap-2 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
            </a>
            <a
              href={`https://${portfolioData.contact.linkedin}`}
              className="text-muted-foreground hover:text-[#0077B5] transition-colors flex items-center gap-2 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
            </a>
            {portfolioData.contact.twitter && (
              <a
                href={`https://twitter.com/${portfolioData.contact.twitter.replace('@', '')}`}
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center gap-2 group"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Twitter</span>
              </a>
            )}
            <a
              href="https://hashnode.com/@manishsparihar"
              className="text-muted-foreground hover:text-[#2962FF] transition-colors flex items-center gap-2 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Hash className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Hashnode</span>
            </a>
          </div>
        </footer>
        </div>
      </main>
    </ClientWrapper>
  );
}

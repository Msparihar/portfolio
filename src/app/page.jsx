import Terminal from "@/components/Terminal";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const NavLink = ({ path }) => (
  <Link
    href={`/${path}`}
    className="group text-left hover:text-green-500 transition-colors"
  >
    <span className="terminal-prompt">$</span>
    <span className="ml-1 text-muted-foreground group-hover:text-green-500">
      /{path}
    </span>
  </Link>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header with Navigation */}
        <div className="mb-8 border-[0.5px] border-border/20 rounded-lg terminal-nav relative overflow-hidden">
          <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Navigation */}
            <nav className="flex flex-wrap items-center gap-3 md:gap-4">
              <NavLink path="home" />
              <NavLink path="projects" />
              <NavLink path="skills" />
              <NavLink path="contact" />
            </nav>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Main terminal interface */}
        <Terminal />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <div className="terminal-line opacity-60">
            <span className="terminal-prompt">$</span>
            <span className="ml-2">
              echo &quot;© {new Date().getFullYear()} • Built with Next.js and
              Tailwind CSS&quot;
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

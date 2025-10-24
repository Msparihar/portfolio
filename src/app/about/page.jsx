import Link from "next/link";
import { ArrowLeft, Download, Award, Code2, Briefcase, GraduationCap, Heart, Coffee, Music, Book } from "lucide-react";
import portfolioData from '@/config/portfolio.json';
import ExperienceTimeline from '@/components/timeline/ExperienceTimelineWrapper';

export const metadata = {
  title: 'About',
  description: `Learn more about ${portfolioData.name} - ${portfolioData.title}`,
  openGraph: {
    title: `About | ${portfolioData.name}`,
    description: `Learn more about ${portfolioData.name} - ${portfolioData.title}`,
    url: 'https://manishsingh.tech/about',
    type: 'website'
  }
};

export default function AboutPage() {
  const funFacts = [
    { icon: Coffee, text: "Coffee enthusiast ☕ - Powered by caffeine and code" },
    { icon: Music, text: "Love coding with lo-fi beats in the background" },
    { icon: Book, text: "Always learning something new in tech" },
    { icon: Heart, text: "Passionate about open source and giving back to the community" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center text-sm text-green-500/90 hover:text-green-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="terminal-prompt">$</span>
                  <span className="ml-1">cd ..</span>
                </Link>
                <div className="text-2xl font-bold text-foreground">
                  <span className="terminal-prompt">$</span>
                  <span className="ml-2">cat about.md</span>
                </div>
              </div>
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12 bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                About Me
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                {portfolioData.bio}
              </p>
              <p className="text-gray-400 leading-relaxed">
                I'm passionate about building innovative solutions that combine cutting-edge AI with robust web technologies. 
                My journey in tech has been driven by curiosity and a constant desire to learn and create.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center">
                <Code2 className="w-32 h-32 text-green-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{portfolioData.projects.length}+</div>
            <div className="text-sm text-gray-400">Projects Built</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{portfolioData.blogs.length}+</div>
            <div className="text-sm text-gray-400">Blog Posts</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Object.values(portfolioData.skills).flat().length}+
            </div>
            <div className="text-sm text-gray-400">Technologies</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">4+</div>
            <div className="text-sm text-gray-400">Years Experience</div>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-green-500" />
              Experience & Education
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <ExperienceTimeline />
        </div>

        {/* Fun Facts */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-6 h-6 text-green-500" />
              Fun Facts
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {funFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-green-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-gray-300 flex-1">{fact.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-8 border border-green-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Let's Work Together</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            I'm always interested in hearing about new projects and opportunities. 
            Whether you have a question or just want to say hi, feel free to reach out!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Get in Touch
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-gray-700"
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
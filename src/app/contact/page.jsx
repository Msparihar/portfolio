import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import portfolioData from '@/config/portfolio.json';
import CompactTerminal from '@/components/CompactTerminalWrapper';
import ContactInteractive from '@/components/contact/ContactInteractive';

// Metadata for SEO
export const metadata = {
  title: 'Contact',
  description: `Get in touch with ${portfolioData.name}. Available for freelance projects, collaborations, and opportunities.`,
  openGraph: {
    title: `Contact | ${portfolioData.name}`,
    description: `Get in touch with ${portfolioData.name}. Available for freelance projects, collaborations, and opportunities.`,
    url: 'https://manishsingh.tech/contact',
    type: 'website'
  }
};

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Link
                href="/"
                className="flex items-center text-xs sm:text-sm text-green-500/90 hover:text-green-400 transition-colors w-fit"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="terminal-prompt">$</span>
                <span className="ml-1">cd ..</span>
              </Link>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                <span className="terminal-prompt">$</span>
                <span className="ml-2">cat contact.txt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Contact Component */}
        <ContactInteractive />
      </div>

      {/* Compact Terminal */}
      <CompactTerminal />
    </div>
  );
};

export default ContactPage;

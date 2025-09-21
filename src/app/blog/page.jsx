import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogInteractive from "@/components/blog/BlogInteractive";
import { CompactTerminal } from "@/components/CompactTerminal";

// Static generation - no client-side state needed
const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
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
                  <span className="ml-2">ls blog/</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Blog Component */}
        <BlogInteractive />
      </div>

      {/* Compact Terminal */}
      <CompactTerminal />
    </div>
  );
};

export default BlogPage;

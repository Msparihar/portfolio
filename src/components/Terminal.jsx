"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import portfolioData from '@/config/portfolio.json';
import { LoadingDotsCommand } from '@/components/ui/LoadingDots';

const TypeWriter = ({ text, delay = 50, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, delay, text]);

  return (
    <span className={`${className} ${currentIndex < text.length ? 'typing-animation' : ''}`}>
      {displayText}
    </span>
  );
};

const Terminal = () => {
  const router = useRouter();
  const [history, setHistory] = useState([
    {
      command: 'whoami',
      output: `Welcome! I'm ${portfolioData.name}
${portfolioData.bio}

Type 'help' to see available commands.`
    }
  ]);

  const [input, setInput] = useState('');
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const commands = {
    help: {
      description: 'Show available commands',
      execute: () => `Available commands:
- whoami: About me
- projects: View my projects
- skills: List my technical skills
- contact: Get my contact information
- clear: Clear the terminal
- help: Show this help message`
    },
    clear: {
      description: 'Clear the terminal',
      execute: () => {
        setHistory([]);
        return '';
      }
    },
    projects: {
      description: 'View my projects',
      execute: () => {
        if (!isNavigating) {
          setIsNavigating(true);
          setInputEnabled(false);
          setTimeout(() => {
            router.push('/projects');
          }, 1500);
          return `Navigating to projects page...
Type 'cd ..' or click the back button to return to terminal.`;
        }
        return 'Navigation already in progress...';
      }
    },
    skills: {
      description: 'List my technical skills',
      execute: () => `Technical Skills:

Languages:
${portfolioData.skills.languages.map(skill => `→ ${skill}`).join('\n')}

Frameworks & Libraries:
${portfolioData.skills.frameworks.map(skill => `→ ${skill}`).join('\n')}

Tools & Technologies:
${portfolioData.skills.tools.map(skill => `→ ${skill}`).join('\n')}`
    },
    contact: {
      description: 'Get my contact information',
      execute: () => `Contact Information:

Email: ${portfolioData.contact.email}
GitHub: ${portfolioData.contact.github}
LinkedIn: ${portfolioData.contact.linkedin}${portfolioData.contact.twitter ? `\nTwitter: ${portfolioData.contact.twitter}` : ''}

Feel free to reach out!`
    }
  };

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const commandEntry = { command: cmd, output: '' };

    if (trimmedCmd in commands) {
      commandEntry.output = commands[trimmedCmd].execute();
      if (trimmedCmd === 'projects' && !isNavigating) {
        commandEntry.loading = true;
      }
    } else if (trimmedCmd !== '') {
      commandEntry.output = `Command not found: ${cmd}. Type 'help' for available commands.`;
    }

    setHistory(prev => [...prev, commandEntry]);
    setInput('');
  };

  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-black/95" />

      {/* Radial gradient for fading effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

      {/* Scanline effect */}
      <div className="absolute inset-0 bg-scanline pointer-events-none"
           style={{
             backgroundImage: `repeating-linear-gradient(
               0deg,
               rgba(0, 150, 0, 0.03),
               rgba(0, 150, 0, 0.03) 1px,
               transparent 1px,
               transparent 2px
             )`,
             backgroundSize: '100% 4px',
             animation: 'scanline 10s linear infinite'
           }}
      />

      {/* Main terminal content */}
      <div className="terminal-container font-mono overflow-auto relative z-10">
        {history.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center">
              <span className="text-green-500/80 mr-2">$</span>
              <TypeWriter text={entry.command} />
            </div>
            {entry.output && (
              <div className="command-output whitespace-pre-line mt-2">
                <div className="flex">
                  <span className="text-green-500/80 mr-2">&gt;</span>
                  <div className="flex-1">
                    <TypeWriter text={entry.output} delay={20} />
                    {entry.loading && (
                      <div className="mt-4">
                        <LoadingDotsCommand />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-500/80 mr-2">$</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputEnabled) {
                  handleCommand(input);
                }
              }}
              className="bg-transparent w-full outline-none absolute top-0 left-0 text-transparent"
              placeholder="Type 'help' for available commands..."
              disabled={!inputEnabled}
              autoFocus
            />
            <span className="inline-block">
              {input}
              <span className="terminal-cursor inline-block w-2 -mb-1">█</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terminal;

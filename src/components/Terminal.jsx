"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import portfolioData from '@/config/portfolio.json';
import { LoadingDotsCommand, TerminalLoader } from '@/components/ui/LoadingDots';
import { useTheme } from 'next-themes';
import TerminalLogo from './TerminalLogo';

const TypeWriter = ({ text, delay = 10, className = '' }) => {
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
  const { theme } = useTheme();
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([
    {
      command: 'whoami',
      output: `Welcome! I'm ${portfolioData.name}
${portfolioData.title}
${portfolioData.bio}

Type 'help' to see available commands.`
    }
  ]);

  const [input, setInput] = useState('');
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

 // Debug logging
 useEffect(() => {
   console.log('Terminal theme:', theme);
   console.log('Input value:', input);
   console.log('Theme-based color:', theme === 'dark' ? '#4ade80' : '#166534');
 }, [theme, input]);

 useEffect(() => {
   console.log('Z-index values - Input: 10, Text span: 15');
 }, []);

  useEffect(() => {
    console.log('Mounted state:', mounted);
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Automatically scroll to bottom when content changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when component mounts or when clicking on terminal
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleTerminalClick = () => {
    if (inputRef.current && inputEnabled) {
      inputRef.current.focus();
    }
  };

  const commands = {
    help: {
      description: 'Show available commands',
      execute: () => `Available commands:
- whoami: About me
- projects: View my projects
- exp | experience: View my work experience
- edu | education: View my education
- contact: Get my contact information
- blog: View my blog
- github: View GitHub contributions
- cd [directory]: Navigate to a page (e.g., cd projects, cd contact, cd blog)
- clear: Clear the terminal
- echo [text]: Display text
- date: Show current date and time
- ls | dir: List available sections
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

          // Faster navigation with immediate redirect and visual feedback
          const output = `Navigating to projects page...`;
          setTimeout(() => {
            router.push('/projects');
          }, 400); // Reduced from 1500ms to 400ms

          return output;
        }
        return 'Navigation already in progress...';
      }
    },
    contact: {
      description: 'Get my contact information',
      execute: () => {
        if (!isNavigating) {
          setIsNavigating(true);
          setInputEnabled(false);

          // Faster navigation with immediate redirect and visual feedback
          const output = `Navigating to contact page...`;
          setTimeout(() => {
            router.push('/contact');
          }, 400);

          return output;
        }
        return 'Navigation already in progress...';
      }
    },
    blog: {
      description: 'View my blog',
      execute: () => {
        if (!isNavigating) {
          setIsNavigating(true);
          setInputEnabled(false);

          const output = `Navigating to blog page...`;
          setTimeout(() => {
            router.push('/blog');
          }, 400);

          return output;
        }
        return 'Navigation already in progress...';
      }
    },
    github: {
      description: 'View GitHub contributions',
      execute: () => {
        // Scroll to GitHub contributions section
        const githubSection = document.querySelector('.github-contributions-section');
        if (githubSection) {
          githubSection.scrollIntoView({ behavior: 'smooth' });
          return 'Scrolling to GitHub contributions...';
        }
        return 'GitHub contributions section not found.';
      }
    },
    whoami: {
      description: 'Display user information',
      execute: () => `${portfolioData.name}
${portfolioData.title}
${portfolioData.bio}`
    },
    date: {
      description: 'Display current date and time',
      execute: () => {
        const now = new Date();
        return now.toLocaleString();
      }
    },
    echo: {
      description: 'Display text',
      execute: (args) => args || ''
    },
    exp: {
      description: 'View my work experience',
      execute: () => {
        if (!portfolioData.experience || portfolioData.experience.length === 0) {
          return 'No experience data available.';
        }

        return `Work Experience:

${portfolioData.experience.map(job =>
  `${job.position} @ ${job.company}
  ${job.duration}
  ${job.description}
`).join('\n')}`;
      }
    },
    experience: {
      description: 'View my work experience',
      execute: () => commands.exp.execute()
    },
    edu: {
      description: 'View my education',
      execute: () => {
        if (!portfolioData.education || portfolioData.education.length === 0) {
          return 'No education data available.';
        }

        return `Education:

${portfolioData.education.map(edu =>
  `${edu.degree || edu.certification}
  ${edu.institution} (${edu.year})
`).join('\n')}`;
      }
    },
    education: {
      description: 'View my education',
      execute: () => commands.edu.execute()
    },
    ls: {
      description: 'List available sections',
      execute: () => `Directory listing:

about/
projects/
experience/
education/
contact/
blog/

Use the corresponding command to navigate to each section.`
    },
    dir: {
      description: 'List available sections (alias for ls)',
      execute: () => commands.ls.execute()
    },
    cd: {
      description: 'Change directory or navigate to a page',
      execute: (args) => {
        if (!args) {
          return 'Usage: cd [directory]';
        }

        // Remove trailing slash if present
        const path = args.toLowerCase().replace(/\/$/, '');

        if (path === 'projects') {
          if (!isNavigating) {
            setIsNavigating(true);
            setInputEnabled(false);
            setTimeout(() => {
              router.push('/projects');
            }, 400);
            return `Navigating to projects/...`;
          }
          return 'Navigation already in progress...';
        }
        else if (path === 'blog') {
          if (!isNavigating) {
            setIsNavigating(true);
            setInputEnabled(false);
            setTimeout(() => {
              router.push('/blog');
            }, 400);
            return `Navigating to blog/...`;
          }
          return 'Navigation already in progress...';
        }
        else if (path === 'contact') {
          if (!isNavigating) {
            setIsNavigating(true);
            setInputEnabled(false);
            setTimeout(() => {
              router.push('/contact');
            }, 400);
            return `Navigating to contact/...`;
          }
          return 'Navigation already in progress...';
        }
        else if (path === '~' || path === 'home') {
          if (!isNavigating) {
            setIsNavigating(true);
            setInputEnabled(false);
            setTimeout(() => {
              router.push('/');
            }, 400);
            return `Navigating to home directory...`;
          }
          return 'Navigation already in progress...';
        }
        else {
          return `cd: no such directory: ${args}`;
        }
      }
    }
  };

  const parseCommand = (cmdString) => {
    const parts = cmdString.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    return { cmd, args };
  };

  const handleCommand = (cmdString) => {
    const { cmd, args } = parseCommand(cmdString);

    // Add to command history
    if (cmdString.trim() !== '') {
      setCommandHistory(prev => [...prev, cmdString]);
      setHistoryIndex(-1);
    }

    const commandEntry = { command: cmdString, output: '' };

    if (cmd in commands) {
      commandEntry.output = commands[cmd].execute(args);
      if ((cmd === 'projects' || cmd === 'contact' || cmd === 'blog') && !isNavigating) {
        commandEntry.loading = true;
      }
    } else if (cmd !== '') {
      commandEntry.output = `Command not found: ${cmd}. Type 'help' for available commands.`;
    }

    setHistory(prev => [...prev, commandEntry]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputEnabled) {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      // Navigate up through command history
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      // Navigate down through command history
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      // Simple command completion
      e.preventDefault();
      const partialCmd = input.toLowerCase();
      if (partialCmd) {
        const matches = Object.keys(commands).filter(cmd =>
          cmd.startsWith(partialCmd)
        );
        if (matches.length === 1) {
          setInput(matches[0]);
        }
      }
    }
  };

  return (
    <div className="relative border border-border/30 rounded-lg overflow-hidden">
      {/* Terminal header */}
      <div className="bg-black/90 dark:bg-terminal-black border-b border-border/20 px-4 py-2 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex items-center justify-center text-xs text-green-500/80 dark:text-white/80 flex-1">
          <TerminalLogo size={18} className="mr-2" />
          {portfolioData.name} @ portfolio
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 top-9 bg-grid-small-white/[0.1] bg-black/95 dark:bg-terminal-black" />

      {/* Radial gradient for fading effect */}
      <div className="absolute inset-0 top-9 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 top-9 bg-scanline pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 150, 0, 0.05),
            rgba(0, 150, 0, 0.05) 1px,
            transparent 1px,
            transparent 2px
          )`,
          backgroundSize: '100% 4px',
          animation: 'scanline 10s linear infinite'
        }}
      />

      {/* CRT flicker effect */}
      <div className="absolute inset-0 top-9 pointer-events-none bg-white/5 opacity-0 animate-[terminal-flicker_5s_ease-in-out_infinite]"></div>

      {/* Main terminal content */}
      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="terminal-container font-mono overflow-auto relative z-10"
        style={{ height: '60vh' }}
      >
        {history.map((entry, index) => (
          <div key={index} className="mb-4">
            <div className="flex">
              <span className="text-green-500/80 mr-2">$</span>
              <TypeWriter text={entry.command} />
            </div>
            {entry.output && (
              <div className="command-output whitespace-pre-line mt-2">
                <div className="flex">
                  <span className="text-green-500/80 mr-2">&gt;</span>
                  <div className="flex-1">
                    <TypeWriter text={entry.output} delay={7} />
                    {entry.loading && (
                      <div className="mt-4">
                        <TerminalLoader color={theme === 'light' ? 'darkGreen' : 'green'} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Terminal Input - positioned right after the last output */}
        <div className="flex items-center">
          <span className="text-green-500/80 mr-2">$</span>
          <div className="flex-1 relative">
            {mounted && (
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent w-full outline-none absolute top-0 left-0 text-transparent caret-transparent"
                placeholder={inputEnabled ? "Type 'help' for available commands..." : "Processing..."}
                disabled={!inputEnabled}
                autoFocus
                autoComplete="off"
                name="terminal-input"
                suppressHydrationWarning
                style={{ zIndex: 10, color: 'transparent' }}
              />
            )}
            {!mounted && (
              <span className="inline-block" suppressHydrationWarning>
                {/* placeholder during SSR to avoid mismatches */}
              </span>
            )}
            <span
              className="inline-block"
              style={{
                color: theme === 'dark' ? '#4ade80' : '#166534',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                zIndex: 15,
                position: 'relative'
              }}
            >
              {input}
              <span className="terminal-cursor inline-block w-2 h-4 -mb-1 bg-green-500/80"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terminal;


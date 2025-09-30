"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import portfolioData from '@/config/portfolio.json';
import { LoadingDotsCommand, TerminalLoader } from '@/components/ui/LoadingDots';
import { useTheme } from 'next-themes';
import TerminalLogo from './TerminalLogo';

const TypeWriter = ({ text, delay = 5, className = '' }) => {
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
    <span className={className}>
      {displayText}
    </span>
  );
};

const HighlightedTypeWriter = ({ text, delay = 3, className = '' }) => {
  // Parse markup tags and render immediately (no animation)
  const parseMarkup = (text) => {
    const segments = [];
    const regex = /\[(\w+)\](.*?)\[\/\1\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, match.index),
          type: 'normal'
        });
      }
      segments.push({
        text: match[2],
        type: match[1]
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        type: 'normal'
      });
    }

    return segments.length > 0 ? segments : [{ text, type: 'normal' }];
  };

  const getHighlightClass = (type) => {
    switch (type) {
      case 'highlight': return 'text-green-600 dark:text-green-400 font-bold';
      case 'accent': return 'text-cyan-700 dark:text-cyan-400 font-semibold';
      case 'tech': return 'text-yellow-700 dark:text-yellow-400';
      case 'link': return 'text-blue-600 dark:text-blue-400 underline';
      case 'command': return 'text-purple-600 dark:text-purple-400';
      default: return '';
    }
  };

  const segments = parseMarkup(text);

  return (
    <span className={className}>
      {segments.map((segment, i) => (
        <span key={i} className={getHighlightClass(segment.type)}>
          {segment.text}
        </span>
      ))}
    </span>
  );
};

const MultiLineTypeWriter = ({ lines, className = '' }) => {
  // Render all lines immediately without animation
  return (
    <div className={className}>
      {lines.map((line, index) => (
        <div key={index}>
          <HighlightedTypeWriter text={line} />
        </div>
      ))}
    </div>
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
      output: null, // Will be handled by multiLineOutput
      multiLineOutput: [
        `Welcome! I'm [highlight]${portfolioData.name}[/highlight]`,
        `[accent]${portfolioData.title}[/accent]`,
        `A versatile engineer specializing in both [tech]Full Stack Development[/tech] and [tech]Artificial Intelligence[/tech]. Experienced in building modern web applications with [tech]Next.js[/tech] and [tech]FastAPI[/tech], as well as developing AI solutions including [tech]computer vision systems[/tech], [tech]language models[/tech], and [tech]intelligent document processing systems[/tech]. Passionate about creating innovative solutions that combine cutting-edge AI with robust web technologies.`,
        '',
        "Type [command]'help'[/command] to see available commands."
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);


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
- [command]whoami[/command]: About me
- [command]projects[/command]: View my projects
- [command]exp[/command] | [command]experience[/command]: View my work experience
- [command]edu[/command] | [command]education[/command]: View my education
- [command]contact[/command]: Get my contact information
- [command]blog[/command]: View my blog
- [command]github[/command]: View GitHub contributions
- [command]cd[/command] [accent][directory][/accent]: Navigate to a page (e.g., cd projects, cd contact, cd blog)
- [command]clear[/command]: Clear the terminal
- [command]echo[/command] [accent][text][/accent]: Display text
- [command]date[/command]: Show current date and time
- [command]ls[/command] | [command]dir[/command]: List available sections
- [command]help[/command]: Show this help message`
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
          const output = `[accent]Navigating to[/accent] [highlight]projects[/highlight] [accent]page...[/accent]`;
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
          const output = `[accent]Navigating to[/accent] [highlight]contact[/highlight] [accent]page...[/accent]`;
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

          const output = `[accent]Navigating to[/accent] [highlight]blog[/highlight] [accent]page...[/accent]`;
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
      execute: () => `[highlight]${portfolioData.name}[/highlight]
[accent]${portfolioData.title}[/accent]
A versatile engineer specializing in both [tech]Full Stack Development[/tech] and [tech]Artificial Intelligence[/tech]. Experienced in building modern web applications with [tech]Next.js[/tech] and [tech]FastAPI[/tech], as well as developing AI solutions including [tech]computer vision systems[/tech], [tech]language models[/tech], and [tech]intelligent document processing systems[/tech]. Passionate about creating innovative solutions that combine cutting-edge AI with robust web technologies.`
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
      <div className="bg-white/95 dark:bg-black/90 border-b border-border/20 px-4 py-2 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex items-center justify-center text-xs text-green-800 dark:text-green-500/80 flex-1">
          <TerminalLogo size={18} className="mr-2" />
          {portfolioData.name} @ portfolio
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 top-9 bg-grid-small-black/[0.1] dark:bg-grid-small-white/[0.1] bg-white/95 dark:bg-black/95" />

      {/* Radial gradient for fading effect */}
      <div className="absolute inset-0 top-9 bg-gradient-to-t from-white/20 via-white/5 to-transparent dark:from-black/20 dark:via-black/5 dark:to-transparent" />

      {/* Scanline effect - disabled on mobile */}
      <div
        className="hidden md:block absolute inset-0 top-9 bg-scanline pointer-events-none opacity-10"
        style={{
          backgroundImage: theme === 'dark'
            ? `repeating-linear-gradient(
                0deg,
                rgba(0, 150, 0, 0.05),
                rgba(0, 150, 0, 0.05) 1px,
                transparent 1px,
                transparent 2px
              )`
            : `repeating-linear-gradient(
                0deg,
                rgba(0, 100, 0, 0.03),
                rgba(0, 100, 0, 0.03) 1px,
                transparent 1px,
                transparent 2px
              )`,
          backgroundSize: '100% 4px',
          animation: 'scanline 10s linear infinite'
        }}
      />

      {/* CRT flicker effect - disabled on mobile */}
      <div className="hidden md:block absolute inset-0 top-9 pointer-events-none bg-black/5 dark:bg-white/5 opacity-0 animate-[terminal-flicker_5s_ease-in-out_infinite]"></div>

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
              <span className="text-green-700/90 dark:text-green-500/80 mr-2">$</span>
              <TypeWriter text={entry.command} />
            </div>
            {entry.multiLineOutput && (
              <div className="command-output mt-2">
                <div className="flex">
                  <span className="text-green-700/90 dark:text-green-500/80 mr-2">&gt;</span>
                  <div className="flex-1">
                    <MultiLineTypeWriter lines={entry.multiLineOutput} />
                  </div>
                </div>
              </div>
            )}
            {entry.output && (
              <div className="command-output whitespace-pre-line mt-2">
                <div className="flex">
                  <span className="text-green-700/90 dark:text-green-500/80 mr-2">&gt;</span>
                  <div className="flex-1">
                    <HighlightedTypeWriter text={entry.output} />
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
        <div className="flex items-center" style={{ minHeight: '24px' }}>
          <span className="text-green-700/90 dark:text-green-500/80 mr-2">$</span>
          <div className="flex-1 relative" style={{ minHeight: '20px' }}>
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
                style={{ zIndex: 10, color: 'transparent', height: '20px' }}
              />
            )}
            {!mounted && (
              <span className="inline-block" suppressHydrationWarning style={{ height: '20px', visibility: 'hidden' }}>
                {/* placeholder during SSR to avoid mismatches - reserve space */}
                &nbsp;
              </span>
            )}
            <span
              className="inline-block"
              style={{
                color: theme === 'dark' ? '#4ade80' : '#166534',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                zIndex: 15,
                position: 'relative',
                minHeight: '20px'
              }}
            >
              {input}
              <span className="inline-block w-2 h-4 -mb-1 bg-green-700/90 dark:bg-green-500/80" style={{
                animation: 'terminal-blink 1s step-end infinite'
              }}></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terminal;


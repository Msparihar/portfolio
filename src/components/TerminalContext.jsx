"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import portfolioData from '@/config/portfolio.json';
import { LoadingDotsCommand, TerminalLoader } from '@/components/ui/LoadingDots';
import { useTheme } from 'next-themes';
import TerminalLogo from './TerminalLogo';

const TypeWriter = ({ text, delay = 10, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const rafRef = useRef(null);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    // Defer animation start until after initial paint
    const startTimer = requestIdleCallback ?
      requestIdleCallback(() => setStarted(true)) :
      setTimeout(() => setStarted(true), 0);

    return () => {
      if (requestIdleCallback) {
        cancelIdleCallback(startTimer);
      } else {
        clearTimeout(startTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!started || currentIndex >= text.length) return;

    const animate = (currentTime) => {
      if (currentTime - lastFrameTime.current >= delay) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        lastFrameTime.current = currentTime;
      }

      if (currentIndex + 1 < text.length) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentIndex, delay, text, started]);

  return (
    <span className={`${className} ${currentIndex < text.length ? 'typing-animation' : ''}`}>
      {displayText}
    </span>
  );
};

// Terminal Context
const TerminalContext = createContext();

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};

// Terminal Provider Component
export const TerminalProvider = ({ children }) => {
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


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mounted, history]);

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

          const output = `Navigating to projects page...`;
          setTimeout(() => {
            router.push('/projects');
          }, 400);

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
  `${edu.degree} @ ${edu.institution}
  ${edu.duration}
  ${edu.description}
`).join('\n')}`;
      }
    },
    education: {
      description: 'View my education',
      execute: () => commands.edu.execute()
    },
    ls: {
      description: 'List available sections',
      execute: () => `Available sections:
- projects: My development projects
- contact: Contact information
- blog: My blog posts
- github: GitHub contributions
- experience: Work experience
- education: Educational background`
    },
    dir: {
      description: 'List available sections',
      execute: () => commands.ls.execute()
    },
    cd: {
      description: 'Navigate to a page',
      execute: (args) => {
        if (!args) {
          return 'Usage: cd [directory]\nAvailable directories: projects, contact, blog';
        }

        const validDirectories = ['projects', 'contact', 'blog', 'home', '..'];
        const directory = args.toLowerCase();

        if (!validDirectories.includes(directory)) {
          return `Directory '${args}' not found. Available: ${validDirectories.join(', ')}`;
        }

        if (!isNavigating) {
          setIsNavigating(true);
          setInputEnabled(false);

          let path = '/';
          if (directory === 'projects') path = '/projects';
          else if (directory === 'contact') path = '/contact';
          else if (directory === 'blog') path = '/blog';
          else if (directory === 'home' || directory === '..') path = '/';

          const output = `Changing directory to ${directory}...`;
          setTimeout(() => {
            router.push(path);
          }, 400);

          return output;
        }
        return 'Navigation already in progress...';
      }
    }
  };

  const commandNames = Object.keys(commands);
  const cdDirs = ['projects', 'contact', 'blog', 'home', '..'];

  const getSuggestion = (currentInput) => {
    if (!currentInput) return '';
    const lower = currentInput.toLowerCase();
    if (lower.startsWith('cd ')) {
      const partial = lower.slice(3);
      if (!partial) return '';
      const match = cdDirs.find(d => d.startsWith(partial) && d !== partial);
      return match ? match.slice(partial.length) : '';
    }
    const match = commandNames.find(c => c.startsWith(lower) && c !== lower);
    return match ? match.slice(lower.length) : '';
  };

  const suggestion = getSuggestion(input);

  const executeCommand = (commandInput) => {
    const [command, ...args] = commandInput.trim().split(' ');
    const argsString = args.join(' ');

    if (commands[command]) {
      try {
        const result = commands[command].execute(argsString);
        return result;
      } catch (error) {
        return `Error executing command: ${error.message}`;
      }
    } else {
      return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !inputEnabled) return;

    const command = input.trim();
    const output = executeCommand(command);

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setHistory(prev => [...prev, { command, output }]);
    setInput('');

    // Reset navigation state after a shorter delay
    if (isNavigating) {
      setTimeout(() => {
        setIsNavigating(false);
        setInputEnabled(true);
      }, 500); // Reduced from 1000ms to 500ms
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowRight' && suggestion && e.target.selectionStart === input.length) {
      e.preventDefault();
      setInput(input + suggestion);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const lower = input.toLowerCase();
      if (!lower) return;
      if (lower.startsWith('cd ')) {
        const partial = lower.slice(3);
        if (!partial) return;
        const matches = cdDirs.filter(d => d.startsWith(partial));
        if (matches.length === 1) {
          setInput('cd ' + matches[0]);
        } else if (matches.length > 1) {
          setHistory(prev => [...prev, { command: input, output: matches.join('  ') }]);
        }
      } else {
        const matches = commandNames.filter(c => c.startsWith(lower));
        if (matches.length === 1) {
          setInput(matches[0]);
        } else if (matches.length > 1) {
          setHistory(prev => [...prev, { command: input, output: matches.join('  ') }]);
        }
      }
    }
  };

  const value = {
    history,
    input,
    setInput,
    inputEnabled,
    isNavigating,
    handleSubmit,
    handleKeyDown,
    inputRef,
    terminalRef,
    mounted,
    theme,
    suggestion
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

// Terminal Component
export const Terminal = () => {
  const {
    history,
    input,
    setInput,
    inputEnabled,
    isNavigating,
    handleSubmit,
    handleKeyDown,
    inputRef,
    terminalRef,
    mounted,
    theme,
    suggestion
  } = useTerminal();

  if (!mounted) {
    return <TerminalLoader />;
  }

  return (
    <div className="terminal-container relative overflow-hidden cursor-text select-none" onClick={() => inputRef.current?.focus()}>
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-small-white/[0.05] dark:bg-grid-small-white/[0.02]" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 150, 0, 0.1),
            rgba(0, 150, 0, 0.1) 1px,
            transparent 1px,
            transparent 2px
          )`,
          backgroundSize: '100% 4px',
          animation: 'scanline 10s linear infinite'
        }}
      />

      {/* Terminal content */}
      <div className="relative z-10 p-6">
        {/* Terminal header */}
        <div className="flex items-center mb-6">
          <TerminalLogo />
          <div className="ml-4">
            <div className="text-sm text-green-500/80 font-mono">
              <span className="terminal-prompt">$</span>
              <span className="ml-2">Terminal v2.0</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Connected to portfolio server
            </div>
          </div>
        </div>

        {/* Terminal history */}
        <div ref={terminalRef} className="terminal-output mb-4 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
          {history.map((entry, index) => (
            <div key={index} className="terminal-line">
              <div className="flex items-start">
                <span className="terminal-prompt text-green-500 mr-2 flex-shrink-0">$</span>
                <span className="text-foreground font-mono">{entry.command}</span>
              </div>
              {entry.output && (
                <div className="mt-1 ml-6 text-muted-foreground font-mono whitespace-pre-wrap">
                  <TypeWriter text={entry.output} delay={10} />
                </div>
              )}
            </div>
          ))}

          {/* Terminal input - positioned right after the last output */}
          <form onSubmit={handleSubmit} className="flex items-center" style={{ minHeight: '24px' }}>
            <span className="terminal-prompt text-green-500 mr-2">$</span>
            <div className="flex-1 relative" style={{ minHeight: '20px' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!inputEnabled}
                className="bg-transparent border-none outline-none font-mono absolute"
                style={{
                  color: 'transparent',
                  opacity: 0,
                  width: '1px',
                  height: '1px',
                  top: 0,
                  left: 0,
                  zIndex: -1
                }}
                placeholder=""
                autoComplete="off"
                autoFocus
              />
              <span className="font-mono pointer-events-none whitespace-pre" style={{
                color: theme === 'dark' ? 'hsl(0, 0%, 98%)' : 'hsl(0, 0%, 3.9%)',
              }}>
                {input || (inputEnabled ? <span className="text-muted-foreground">Type a command...</span> : <span className="text-muted-foreground">Processing...</span>)}
                <span className="inline-block w-[2px] h-[1.1em] bg-green-500 align-middle ml-[1px]" style={{ animation: 'terminal-blink 1s step-end infinite' }} />
                {suggestion && input && <span className="text-green-500/30">{suggestion}</span>}
              </span>
            </div>
            {isNavigating && <LoadingDotsCommand />}
          </form>
        </div>
      </div>
    </div>
  );
};


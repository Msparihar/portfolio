"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import portfolioData from '@/config/portfolio.json';
import { useWindowStore } from '@/store/windowStore';
import { TerminalLoader } from '@/components/ui/LoadingDots';
import { useTheme } from 'next-themes';
import TerminalLogo from './TerminalLogo';

const BootSequence = () => {
  const [step, setStep] = useState(0);
  const [dotsCount, setDotsCount] = useState(0);
  const maxSteps = 6;

  const skills = portfolioData.skills;
  const allSkills = [
    ...skills.languages,
    ...skills.frameworks.slice(0, 3),
    ...skills.ai_ml.slice(0, 2)
  ];

  useEffect(() => {
    if (step >= maxSteps) return;

    // Step 2 (loading skills) has dot animation
    if (step === 2 && dotsCount < 10) {
      const dotTimer = setTimeout(() => setDotsCount(d => d + 1), 80);
      return () => clearTimeout(dotTimer);
    }

    const delays = [0, 300, 600, 1400, 1800, 2200];
    const timer = setTimeout(() => setStep(s => s + 1), delays[step] || 400);
    return () => clearTimeout(timer);
  }, [step, dotsCount]);

  return (
    <div className="font-mono text-sm space-y-1">
      {step >= 1 && (
        <div>
          <span className="text-green-500">{'>'}</span>
          <span className="text-foreground ml-2 font-bold">{portfolioData.name}</span>
        </div>
      )}
      {step >= 2 && (
        <div>
          <span className="text-green-500">{'>'}</span>
          <span className="text-terminal-cyan ml-2">{portfolioData.title}</span>
        </div>
      )}
      {step >= 3 && (
        <div>
          <span className="text-green-500">{'>'}</span>
          <span className="text-muted-foreground ml-2">
            Loading skills{'.' .repeat(Math.min(dotsCount, 10))}
          </span>
          {dotsCount >= 10 && <span className="text-green-500 ml-1">done</span>}
        </div>
      )}
      {step >= 4 && (
        <div className="flex flex-wrap gap-1.5 ml-4 mt-1">
          {allSkills.map((skill, i) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20"
              style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {step >= 5 && (
        <div className="mt-2">
          <span className="text-green-500">{'>'}</span>
          <span className="text-muted-foreground ml-2">
            Type <span className="text-terminal-cyan">'help'</span> for available commands
          </span>
        </div>
      )}
    </div>
  );
};

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
  const { theme } = useTheme();
  const openWindow = useWindowStore((s) => s.openWindow);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([
    {
      command: 'whoami',
      output: null,
      bootSequence: true
    }
  ]);

  const [input, setInput] = useState('');
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

  // Auto-scroll terminal to bottom on any DOM change
  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    const scroll = () => { el.scrollTop = el.scrollHeight; };
    scroll();
    const observer = new MutationObserver(scroll);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mounted, history]);

  const commands = {
    help: {
      description: 'Show available commands',
      execute: () => `Available commands:
- whoami: About me
- projects: Open File Manager (projects)
- exp | experience: View my work experience
- edu | education: View my education
- contact: Open Mail (contact)
- blog: Open Log Viewer (blog)
- about: Open About window
- open [app]: Open an application window
- cd [directory]: Open an app window (e.g., cd projects, cd contact, cd blog)
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
      description: 'Open File Manager (projects)',
      execute: () => {
        openWindow('filemanager');
        return 'Opening File Manager...';
      }
    },
    contact: {
      description: 'Get my contact information',
      execute: () => {
        openWindow('mail');
        return 'Opening Mail...';
      }
    },
    blog: {
      description: 'View my blog',
      execute: () => {
        openWindow('logviewer');
        return 'Opening Log Viewer...';
      }
    },
    github: {
      description: 'View GitHub & about info',
      execute: () => {
        openWindow('about');
        return 'Opening About...';
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
      execute: () => `Available sections (use 'open [name]' to launch):
- filemanager: My development projects
- mail: Contact information
- logviewer: My blog posts
- about: About & GitHub contributions
- browser: Web browser
- experience: Work experience (type 'exp')
- education: Educational background (type 'edu')`
    },
    dir: {
      description: 'List available sections',
      execute: () => commands.ls.execute()
    },
    cd: {
      description: 'Open an app window by directory name',
      execute: (args) => {
        if (!args) {
          return 'Usage: cd [directory]\nAvailable directories: projects, contact, blog, home, ..';
        }

        const validDirectories = ['projects', 'contact', 'blog', 'home', '..'];
        const directory = args.toLowerCase().trim();

        if (!validDirectories.includes(directory)) {
          return `Directory '${args}' not found. Available: ${validDirectories.join(', ')}`;
        }

        if (directory === 'projects') {
          openWindow('filemanager');
          return 'Opening File Manager...';
        } else if (directory === 'contact') {
          openWindow('mail');
          return 'Opening Mail...';
        } else if (directory === 'blog') {
          openWindow('logviewer');
          return 'Opening Log Viewer...';
        } else if (directory === 'home' || directory === '..') {
          return 'Already at ~/';
        }
      }
    },
    open: {
      description: 'Open an application window',
      execute: (args) => {
        if (!args) {
          return 'Usage: open [app]\nAvailable apps: terminal, filemanager, logviewer, mail, about, browser';
        }
        const appId = args.toLowerCase().trim();
        const validApps = ['terminal', 'filemanager', 'logviewer', 'mail', 'about', 'browser'];
        if (!validApps.includes(appId)) {
          return `App '${args}' not found. Available: ${validApps.join(', ')}`;
        }
        openWindow(appId);
        return `Opening ${appId}...`;
      }
    }
  };

  const commandNames = Object.keys(commands);
  const cdDirs = ['projects', 'contact', 'blog', 'home', '..'];
  const openApps = ['terminal', 'filemanager', 'logviewer', 'mail', 'about', 'browser'];

  const getSuggestion = (currentInput) => {
    if (!currentInput) return '';
    const lower = currentInput.toLowerCase();
    if (lower.startsWith('cd ')) {
      const partial = lower.slice(3);
      if (!partial) return '';
      const match = cdDirs.find(d => d.startsWith(partial) && d !== partial);
      return match ? match.slice(partial.length) : '';
    }
    if (lower.startsWith('open ')) {
      const partial = lower.slice(5);
      if (!partial) return '';
      const match = openApps.find(a => a.startsWith(partial) && a !== partial);
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
    if (!input.trim()) return;

    const command = input.trim();
    const output = executeCommand(command);

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setHistory(prev => [...prev, { command, output }]);
    setInput('');
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
      } else if (lower.startsWith('open ')) {
        const partial = lower.slice(5);
        if (!partial) return;
        const matches = openApps.filter(a => a.startsWith(partial));
        if (matches.length === 1) {
          setInput('open ' + matches[0]);
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

export const Terminal = () => {
  const {
    history,
    input,
    setInput,
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
    <div className="terminal-container relative cursor-text select-none" onClick={() => inputRef.current?.focus()} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
      <div className="relative z-10 p-6 flex flex-col" style={{ flex: 1, minHeight: 0 }}>
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
        <div ref={terminalRef} className="terminal-output space-y-2 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {history.map((entry, index) => (
            <div key={index} className="terminal-line">
              <div className="flex items-start">
                <span className="terminal-prompt text-green-500 mr-2 flex-shrink-0">$</span>
                <span className="text-foreground font-mono">{entry.command}</span>
              </div>
              {entry.bootSequence ? (
                <div className="mt-1 ml-6">
                  <BootSequence />
                </div>
              ) : entry.output && (
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
                color: 'var(--dt-text)',
              }}>
                {input || <span className="text-muted-foreground">Type a command...</span>}
                <span className="inline-block w-[2px] h-[1.1em] bg-green-500 align-middle ml-[1px]" style={{ animation: 'terminal-blink 1s step-end infinite' }} />
                {suggestion && input && <span className="text-green-500/30">{suggestion}</span>}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


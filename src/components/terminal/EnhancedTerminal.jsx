"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // Available commands with descriptions
  const commands = {
    help: {
      description: 'Show available commands',
      usage: 'help [command]',
      execute: (args) => {
        if (args.length > 0) {
          const cmd = args[0];
          if (commands[cmd]) {
            return [
              `Command: ${cmd}`,
              `Description: ${commands[cmd].description}`,
              `Usage: ${commands[cmd].usage}`,
              ...(commands[cmd].examples ? [`Examples:`, ...commands[cmd].examples] : [])
            ];
          } else {
            return [`Command '${cmd}' not found. Type 'help' to see available commands.`];
          }
        }
        return [
          'Available commands:',
          '',
          ...Object.entries(commands).map(([cmd, info]) => 
            `  ${cmd.padEnd(12)} - ${info.description}`
          ),
          '',
          'Type "help <command>" for detailed information about a specific command.'
        ];
      }
    },
    ls: {
      description: 'List available sections',
      usage: 'ls [section]',
      execute: (args) => {
        const sections = {
          '/': ['projects', 'blog', 'contact', 'about', 'skills'],
          projects: ['web-apps', 'ai-projects', 'open-source'],
          blog: ['tutorials', 'guides', 'thoughts'],
          about: ['experience', 'education', 'skills']
        };
        
        const section = args[0] || '/';
        if (sections[section]) {
          return [
            `Contents of ${section}:`,
            '',
            ...sections[section].map(item => `  📁 ${item}`)
          ];
        } else {
          return [`Directory '${section}' not found.`];
        }
      }
    },
    cd: {
      description: 'Navigate to a section',
      usage: 'cd <section>',
      examples: ['cd projects', 'cd blog', 'cd contact'],
      execute: (args) => {
        if (args.length === 0) {
          return ['Usage: cd <section>. Available: projects, blog, contact, about'];
        }
        
        const section = args[0].toLowerCase();
        const validSections = ['projects', 'blog', 'contact', 'about', 'skills'];

        if (validSections.includes(section)) {
          window.location.href = `/${section}`;
          return [`Navigating to ${section}...`];
        } else {
          return [`Section '${section}' not found. Available: ${validSections.join(', ')}`];
        }
      }
    },
    cat: {
      description: 'Display content of a file/section',
      usage: 'cat <file>',
      examples: ['cat about.txt', 'cat skills.json'],
      execute: (args) => {
        if (args.length === 0) {
          return ['Usage: cat <file>'];
        }
        
        const file = args[0].toLowerCase();
        const files = {
          'about.txt': [
            'Manish Singh Parihar',
            'Full Stack & AI Engineer',
            '',
            'A versatile engineer specializing in both Full Stack Development',
            'and Artificial Intelligence. Experienced in building modern web',
            'applications with Next.js and FastAPI, as well as developing AI',
            'solutions including computer vision systems, language models,',
            'and intelligent document processing systems.'
          ],
          'skills.json': [
            '{',
            '  "languages": ["Python", "JavaScript/TypeScript", "SQL"],',
            '  "frameworks": ["React/Next.js", "FastAPI", "PyTorch"],',
            '  "tools": ["Git/GitHub", "Docker", "AWS/Vercel"],',
            '  "ai_ml": ["Computer Vision", "NLP", "LLMs"]',
            '}'
          ],
          'contact.txt': [
            'Contact Information:',
            '',
            '📧 Email: manishsparihar@gmail.com',
            '🐙 GitHub: github.com/Msparihar',
            '💼 LinkedIn: linkedin.com/in/manishsparihar',
            '🐦 Twitter: @manishs_parihar'
          ]
        };
        
        if (files[file]) {
          return files[file];
        } else {
          return [`File '${file}' not found. Available files: ${Object.keys(files).join(', ')}`];
        }
      }
    },
    whoami: {
      description: 'Display current user information',
      usage: 'whoami',
      execute: () => [
        'manish@portfolio:~$ whoami',
        'Manish Singh Parihar',
        'Full Stack & AI Engineer',
        'Currently building innovative solutions at StringifyAI'
      ]
    },
    pwd: {
      description: 'Print working directory',
      usage: 'pwd',
      execute: () => ['/home/manish/portfolio']
    },
    date: {
      description: 'Display current date and time',
      usage: 'date',
      execute: () => [new Date().toString()]
    },
    clear: {
      description: 'Clear the terminal screen',
      usage: 'clear',
      execute: () => {
        setHistory([]);
        return [];
      }
    },
    history: {
      description: 'Show command history',
      usage: 'history',
      execute: () => [
        'Command History:',
        '',
        ...commandHistory.map((cmd, index) => `  ${(index + 1).toString().padStart(3)} ${cmd}`)
      ]
    },
    find: {
      description: 'Search for projects or blog posts',
      usage: 'find <query>',
      examples: ['find react', 'find ai', 'find chatbot'],
      execute: (args) => {
        if (args.length === 0) {
          return ['Usage: find <query>'];
        }
        
        const query = args.join(' ').toLowerCase();
        // This would integrate with your actual search functionality
        return [
          `Searching for "${query}"...`,
          'Found 3 results:',
          '  📁 projects/reddichat - AI chatbot with Reddit insights',
          '  📁 projects/medical-chatbot - Healthcare chatbot using Llama2',
          '  📝 blog/llama-fine-tuning - Fine-tune Llama models'
        ];
      }
    },
    grep: {
      description: 'Search within content',
      usage: 'grep <pattern> <file>',
      examples: ['grep "react" skills.json', 'grep "ai" about.txt'],
      execute: (args) => {
        if (args.length < 2) {
          return ['Usage: grep <pattern> <file>'];
        }
        
        const pattern = args[0].toLowerCase();
        const file = args[1].toLowerCase();
        
        return [
          `Searching for "${pattern}" in ${file}...`,
          'Match found on line 2: "React/Next.js development"'
        ];
      }
    },
    theme: {
      description: 'Change terminal theme',
      usage: 'theme <name>',
      examples: ['theme matrix', 'theme hacker', 'theme default'],
      execute: (args) => {
        const themes = ['default', 'matrix', 'hacker', 'retro'];
        if (args.length === 0) {
          return [`Available themes: ${themes.join(', ')}`];
        }
        
        const theme = args[0].toLowerCase();
        if (themes.includes(theme)) {
          return [`Theme changed to '${theme}'`];
        } else {
          return [`Theme '${theme}' not found. Available: ${themes.join(', ')}`];
        }
      }
    }
  };

  // Auto-complete suggestions
  useEffect(() => {
    if (input.trim()) {
      const commandNames = Object.keys(commands);
      const matches = commandNames.filter(cmd => 
        cmd.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0 && input.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  // Handle command execution
  const executeCommand = (command) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedCommand]);
    setHistoryIndex(-1);

    // Parse command and arguments
    const parts = trimmedCommand.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add command to terminal history
    const newEntry = {
      type: 'command',
      content: `$ ${trimmedCommand}`,
      timestamp: new Date()
    };

    if (commands[cmd]) {
      const output = commands[cmd].execute(args);
      const outputEntry = {
        type: 'output',
        content: output,
        timestamp: new Date()
      };
      
      if (cmd === 'clear') {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, newEntry, outputEntry]);
      }
    } else {
      const errorEntry = {
        type: 'error',
        content: [`Command '${cmd}' not found. Type 'help' for available commands.`],
        timestamp: new Date()
      };
      setHistory(prev => [...prev, newEntry, errorEntry]);
    }

    setInput('');
    setShowSuggestions(false);
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-black/90 rounded-lg border border-green-500/30 p-4 font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-500/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-green-400 text-xs">
          manish@portfolio:~
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent"
      >
        {/* Welcome Message */}
        {history.length === 0 && (
          <div className="text-green-400 mb-4">
            <div>Welcome to Manish's Portfolio Terminal</div>
            <div className="text-gray-400 text-xs mt-1">
              Type 'help' to see available commands
            </div>
          </div>
        )}

        {/* Command History */}
        <AnimatePresence>
          {history.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2"
            >
              {entry.type === 'command' && (
                <div className="text-green-400">{entry.content}</div>
              )}
              {entry.type === 'output' && (
                <div className="text-gray-300 ml-2">
                  {Array.isArray(entry.content) ? (
                    entry.content.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))
                  ) : (
                    <div>{entry.content}</div>
                  )}
                </div>
              )}
              {entry.type === 'error' && (
                <div className="text-red-400 ml-2">
                  {Array.isArray(entry.content) ? (
                    entry.content.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))
                  ) : (
                    <div>{entry.content}</div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current Input Line */}
        <div className="flex items-center text-green-400">
          <span className="mr-2">$</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-green-400 caret-green-400"
              autoComplete="off"
              spellCheck="false"
            />
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-green-500/30 rounded p-2 z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion);
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className="block w-full text-left px-2 py-1 text-green-400 hover:bg-green-500/20 rounded text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="mt-4 pt-2 border-t border-green-500/30 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Press Tab for autocomplete, ↑↓ for history</span>
          <span>{commandHistory.length} commands executed</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTerminal;
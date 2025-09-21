"use client";

import React, { useState } from 'react';
import { useTerminal } from '@/components/TerminalContext';
import { Terminal as TerminalIcon, X, Minimize2 } from 'lucide-react';

export const CompactTerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const {
    history,
    input,
    setInput,
    inputEnabled,
    isNavigating,
    handleSubmit,
    handleKeyDown,
    inputRef
  } = useTerminal();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Terminal"
        >
          <TerminalIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-background border border-border/30 rounded-lg shadow-lg transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-[500px] h-80'
    }`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/30 bg-muted/20">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-muted-foreground font-mono ml-2">Terminal</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted rounded"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div className="p-3 h-full overflow-hidden flex flex-col">
          {/* Terminal History */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-1 text-sm">
            {history.slice(-8).map((entry, index) => (
              <div key={index} className="terminal-line">
                <div className="flex items-start">
                  <span className="terminal-prompt text-green-500 mr-2 flex-shrink-0">$</span>
                  <span className="text-foreground font-mono">{entry.command}</span>
                </div>
                {entry.output && (
                  <div className="ml-6 text-muted-foreground font-mono text-sm whitespace-pre-wrap">
                    {entry.output.length > 150 ? entry.output.substring(0, 150) + '...' : entry.output}
                  </div>
                )}
              </div>
            ))}

            {/* Terminal Input - positioned right after the last output */}
            <form onSubmit={handleSubmit} className="flex items-center py-2">
              <span className="terminal-prompt text-green-500 mr-2 text-sm">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!inputEnabled}
                className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder-muted-foreground py-1"
                placeholder={inputEnabled ? "Type a command..." : "Processing..."}
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

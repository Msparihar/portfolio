import React from 'react';

const TerminalLogo = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Terminal body */}
      <div className="absolute inset-0 border-2 rounded-md overflow-hidden" style={{ borderColor: 'var(--dt-accent)', background: 'var(--dt-bg)' }}>
        {/* Terminal header */}
        <div className="h-1/4 flex items-center justify-start px-1" style={{ background: 'var(--dt-accent)' }}>
          <div className="w-1 h-1 rounded-full mr-0.5" style={{ background: 'var(--dt-on-accent, #fff)' }}></div>
          <div className="w-1 h-1 rounded-full mr-0.5" style={{ background: 'var(--dt-on-accent, #fff)' }}></div>
          <div className="w-1 h-1 rounded-full" style={{ background: 'var(--dt-on-accent, #fff)' }}></div>
        </div>

        {/* Terminal content - command line */}
        <div className="absolute left-1 bottom-1.5 w-2/3 h-1 animate-pulse" style={{ background: 'var(--dt-accent)' }}></div>
      </div>
    </div>
  );
};

export default TerminalLogo;

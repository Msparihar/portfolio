import React from 'react';

const TerminalLogo = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Terminal body */}
      <div className="absolute inset-0 bg-black border-2 border-green-500 rounded-md overflow-hidden">
        {/* Terminal header */}
        <div className="h-1/4 bg-green-500 flex items-center justify-start px-1">
          <div className="w-1 h-1 rounded-full bg-white mr-0.5"></div>
          <div className="w-1 h-1 rounded-full bg-white mr-0.5"></div>
          <div className="w-1 h-1 rounded-full bg-white"></div>
        </div>

        {/* Terminal content - command line */}
        <div className="absolute left-1 bottom-1.5 w-2/3 h-1 bg-green-500 animate-pulse"></div>
      </div>
    </div>
  );
};

export default TerminalLogo;

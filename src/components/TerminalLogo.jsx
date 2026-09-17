import React from 'react';

const TerminalLogo = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.24)),
        color: 'var(--dt-accent)',
        background: 'linear-gradient(145deg, rgba(255,255,255,.64), rgba(226,238,224,.30))',
        border: '1px solid rgba(255,255,255,.78)',
        boxShadow: '0 7px 18px rgba(45,82,55,.16), inset 0 1px 0 rgba(255,255,255,.9)',
        backdropFilter: 'blur(10px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.25)',
      }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M5.5 7.5 9.5 12l-4 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17h6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default TerminalLogo;

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WORLDS, WORLD_STORAGE_KEY, applyWorld } from '@/config/worlds';
import { THEME_STORAGE_KEY, applyTheme, DEFAULT_THEME_ID } from '@/config/themes';
import { getCurrentWorldId } from '@/config/worldContent';

// World-specific CTA button text
const WORLD_CTA = {
  'elden-ring': 'Arise, Tarnished →',
  'ghibli': 'Enter the Forest →',
  'got': 'Claim the Throne →',
};

// World emoji icons for card headers
const WORLD_EMOJI = {
  'elden-ring': '🌑',
  'ghibli': '🌿',
  'got': '⚔️',
};

export default function WorldSwitcherPopup({ isOpen, onClose, onDontShowAgain }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWorldId, setCurrentWorldId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollRef = useRef(null);
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Sync current world
  useEffect(() => {
    setCurrentWorldId(getCurrentWorldId());
    const handleWorldChange = (e) => {
      setCurrentWorldId(e.detail?.worldId ?? getCurrentWorldId());
    };
    window.addEventListener('worldchange', handleWorldChange);
    return () => window.removeEventListener('worldchange', handleWorldChange);
  }, []);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Focus the modal after it opens
      requestAnimationFrame(() => {
        if (firstFocusableRef.current) firstFocusableRef.current.focus();
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Keyboard handling: Escape + arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCarousel(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCarousel(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const handleTabTrap = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll(focusableSelectors)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabTrap);
    return () => document.removeEventListener('keydown', handleTabTrap);
  }, [isOpen]);

  // Scroll to current world on open
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll('[data-world-card]');
    if (!cards.length) return;

    // Find current world index
    const currentIdx = WORLDS.findIndex((w) => w.id === currentWorldId);
    const targetIdx = currentIdx >= 0 ? currentIdx : 0;
    const targetCard = cards[targetIdx];
    if (!targetCard) return;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();
      const scrollLeft =
        targetCard.offsetLeft - containerRect.width / 2 + cardRect.width / 2;
      container.scrollLeft = scrollLeft;
    });
  }, [isOpen, currentWorldId]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  const handleDontShowAgain = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDontShowAgain();
    }, 150);
  }, [onDontShowAgain]);

  const handleSwitchWorld = useCallback((worldId) => {
    const canvas = document.querySelector('.desktop-canvas');
    if (!canvas) return;
    canvas.style.transition = 'opacity 200ms ease';
    canvas.style.opacity = '0';
    setTimeout(() => {
      applyWorld(canvas, worldId);
      localStorage.setItem(WORLD_STORAGE_KEY, worldId);
      localStorage.removeItem(THEME_STORAGE_KEY);
      canvas.style.opacity = '1';
    }, 200);
    window.dispatchEvent(new CustomEvent('worldchange', { detail: { worldId } }));
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  const scrollCarousel = useCallback((direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = 260 + 20; // card width + gap
    container.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }, []);

  if (!isOpen && !isVisible) return null;

  const worldName = WORLDS.find((w) => w.id === currentWorldId)?.name ?? 'Unknown';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease',
        cursor: 'default',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-hidden={!isOpen}
    >
      {/* Modal container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="World Switcher"
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '900px',
          background: 'var(--dt-surface)',
          backdropFilter: 'var(--dt-window-blur)',
          WebkitBackdropFilter: 'var(--dt-window-blur)',
          border: '1px solid var(--dt-accent-border-strong)',
          borderRadius: 'var(--dt-window-radius)',
          boxShadow: 'var(--dt-shadow-focused)',
          overflow: 'hidden',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 200ms ease, opacity 150ms ease',
          cursor: 'default',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={firstFocusableRef}
          aria-label="Close"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--dt-accent-soft)',
            border: '1px solid var(--dt-accent-border)',
            color: 'var(--dt-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            lineHeight: 1,
            transition: 'background 0.15s ease, color 0.15s ease',
            zIndex: 10,
            fontFamily: 'var(--dt-font-mono)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--dt-accent-soft-2)';
            e.currentTarget.style.color = 'var(--dt-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--dt-accent-soft)';
            e.currentTarget.style.color = 'var(--dt-text-muted)';
          }}
        >
          ✕
        </button>

        {/* Inner padding */}
        <div style={{ padding: '32px 32px 0' }}>
          {/* Timer badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '999px',
                background: 'var(--dt-accent-soft)',
                border: '1px solid var(--dt-accent-border-strong)',
                color: 'var(--dt-text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--dt-font-mono)',
                letterSpacing: '0.03em',
              }}
            >
              <span>⏱</span>
              <span>5 minutes in {currentWorldId ? worldName : 'this world'}</span>
            </div>
          </div>

          {/* Title */}
          <h2
            style={{
              textAlign: 'center',
              fontFamily: 'var(--dt-font-heading)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--dt-text)',
              margin: '0 0 10px',
              letterSpacing: '-0.01em',
            }}
          >
            Choose Your World
          </h2>

          {/* Subtitle */}
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'var(--dt-font-body)',
              fontSize: '14px',
              color: 'var(--dt-text-muted)',
              margin: '0 0 28px',
              lineHeight: 1.5,
            }}
          >
            Each world transforms the entire interface — colors, fonts, icons, and atmosphere.
          </p>
        </div>

        {/* Carousel area */}
        <div style={{ position: 'relative', paddingBottom: '8px' }}>
          {/* Left arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => scrollCarousel(-1)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--dt-surface)',
              border: '1px solid var(--dt-accent-border-strong)',
              color: 'var(--dt-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontFamily: 'var(--dt-font-mono)',
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dt-accent-soft)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--dt-surface)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            }}
          >
            ‹
          </button>

          {/* Right arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => scrollCarousel(1)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--dt-surface)',
              border: '1px solid var(--dt-accent-border-strong)',
              color: 'var(--dt-accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontFamily: 'var(--dt-font-mono)',
              transition: 'background 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--dt-accent-soft)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--dt-surface)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            }}
          >
            ›
          </button>

          {/* Scrollable carousel */}
          <style>{`
            .world-switcher-scroll::-webkit-scrollbar { display: none; }
          `}</style>
          <div
            ref={scrollRef}
            className="world-switcher-scroll"
            style={{
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: '20px',
              padding: '8px 60px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            {WORLDS.map((world) => {
              const isCurrent = world.id === currentWorldId;
              const isHovered = hoveredCard === world.id;

              return (
                <div
                  key={world.id}
                  data-world-card={world.id}
                  style={{
                    minWidth: '260px',
                    maxWidth: '260px',
                    scrollSnapAlign: 'center',
                    flexShrink: 0,
                    borderRadius: 'calc(var(--dt-window-radius) - 2px)',
                    border: isCurrent
                      ? '1px solid var(--dt-accent)'
                      : `1px solid var(--dt-accent-border${isHovered ? '-strong' : ''})`,
                    background: isCurrent ? 'var(--dt-accent-soft-2)' : 'var(--dt-surface-deep)',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    transform: isHovered && !isCurrent ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHovered && !isCurrent ? 'var(--dt-shadow-focused)' : 'none',
                    cursor: isCurrent ? 'default' : 'pointer',
                  }}
                  onMouseEnter={() => setHoveredCard(world.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card gradient header */}
                  <div
                    style={{
                      height: '80px',
                      background: `linear-gradient(135deg, ${world.swatch}33 0%, ${world.swatch}11 100%)`,
                      borderBottom: '1px solid var(--dt-accent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Swatch accent dot */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: world.swatch,
                        boxShadow: `0 0 8px ${world.swatch}88`,
                      }}
                    />
                    {/* World emoji */}
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>
                      {WORLD_EMOJI[world.id] ?? '🌍'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px' }}>
                    {/* World name */}
                    <div
                      style={{
                        fontFamily: 'var(--dt-font-heading)',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: isCurrent ? 'var(--dt-accent)' : 'var(--dt-text)',
                        marginBottom: '6px',
                        lineHeight: 1.2,
                      }}
                    >
                      {world.name}
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: 'var(--dt-font-body)',
                        fontSize: '12px',
                        color: 'var(--dt-text-muted)',
                        margin: '0 0 16px',
                        lineHeight: 1.5,
                        minHeight: '36px',
                      }}
                    >
                      {world.description}
                    </p>

                    {/* CTA or current badge */}
                    {isCurrent ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          borderRadius: '999px',
                          background: 'var(--dt-accent-soft)',
                          border: '1px solid var(--dt-accent)',
                          color: 'var(--dt-accent)',
                          fontSize: '11px',
                          fontFamily: 'var(--dt-font-mono)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--dt-accent)',
                            display: 'inline-block',
                            boxShadow: '0 0 6px var(--dt-accent-glow)',
                          }}
                        />
                        <span>Current World</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSwitchWorld(world.id)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--dt-radius-sm, 4px)',
                          background: 'var(--dt-accent-soft)',
                          border: '1px solid var(--dt-accent-border-strong)',
                          color: 'var(--dt-accent)',
                          fontSize: '12px',
                          fontFamily: 'var(--dt-font-mono)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                          textAlign: 'center',
                          letterSpacing: '0.02em',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--dt-accent-soft-2)';
                          e.currentTarget.style.borderColor = 'var(--dt-accent)';
                          e.currentTarget.style.color = 'var(--dt-accent-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--dt-accent-soft)';
                          e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
                          e.currentTarget.style.color = 'var(--dt-accent)';
                        }}
                      >
                        {WORLD_CTA[world.id] ?? 'Switch World →'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            margin: '0 32px',
            background: 'linear-gradient(to right, transparent 0%, var(--dt-accent-border-strong) 30%, var(--dt-accent-border-strong) 70%, transparent 100%)',
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px 24px',
            gap: '12px',
          }}
        >
          {/* Keyboard hint */}
          <div
            style={{
              fontFamily: 'var(--dt-font-mono)',
              fontSize: '11px',
              color: 'var(--dt-text-muted)',
              opacity: 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <kbd
              style={{
                padding: '2px 5px',
                borderRadius: '3px',
                background: 'var(--dt-accent-soft)',
                border: '1px solid var(--dt-accent-border)',
                fontSize: '10px',
                fontFamily: 'var(--dt-font-mono)',
                color: 'var(--dt-text-muted)',
              }}
            >
              ←
            </kbd>
            <kbd
              style={{
                padding: '2px 5px',
                borderRadius: '3px',
                background: 'var(--dt-accent-soft)',
                border: '1px solid var(--dt-accent-border)',
                fontSize: '10px',
                fontFamily: 'var(--dt-font-mono)',
                color: 'var(--dt-text-muted)',
              }}
            >
              →
            </kbd>
            <span style={{ marginLeft: '4px' }}>to browse</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleDontShowAgain}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--dt-radius-sm, 4px)',
                background: 'transparent',
                border: '1px solid var(--dt-accent-border)',
                color: 'var(--dt-text-muted)',
                fontSize: '12px',
                fontFamily: 'var(--dt-font-mono)',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, color 0.15s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
                e.currentTarget.style.color = 'var(--dt-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
                e.currentTarget.style.color = 'var(--dt-text-muted)';
              }}
            >
              Don't show again
            </button>

            <button
              onClick={handleClose}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--dt-radius-sm, 4px)',
                background: 'var(--dt-accent-soft)',
                border: '1px solid var(--dt-accent-border-strong)',
                color: 'var(--dt-text)',
                fontSize: '12px',
                fontFamily: 'var(--dt-font-mono)',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--dt-accent-soft-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--dt-accent-soft)';
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

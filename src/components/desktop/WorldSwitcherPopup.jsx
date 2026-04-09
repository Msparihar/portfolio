'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WORLDS, applyWorldWithTransition } from '@/config/worlds';
import { getCurrentWorldId, getWorldCta, getWorldEmoji, createWorldChangeListener } from '@/config/worldContent';

const CARD_WIDTH = 280; // px including gap

function CarouselArrow({ direction, onClick }) {
  const isLeft = direction === 'left';
  return (
    <button
      aria-label={`Scroll ${direction}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        [isLeft ? 'left' : 'right']: '12px',
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
      {isLeft ? '‹' : '›'}
    </button>
  );
}

function KbdHint({ children }) {
  return (
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
      {children}
    </kbd>
  );
}

export default function WorldSwitcherPopup({ isOpen, onClose, onDontShowAgain }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWorldId, setCurrentWorldId] = useState(null);
  const scrollRef = useRef(null);
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Sync current world using shared listener
  useEffect(() => {
    setCurrentWorldId(getCurrentWorldId());
    return createWorldChangeListener(setCurrentWorldId);
  }, []);

  // Animate in/out + focus
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        if (firstFocusableRef.current) firstFocusableRef.current.focus();
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Clean up any pending close timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scrollCarousel = useCallback((direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction * CARD_WIDTH, behavior: 'smooth' });
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 150);
  }, [onClose]);

  const handleDontShowAgain = useCallback(() => {
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onDontShowAgain();
    }, 150);
  }, [onDontShowAgain]);

  // Keyboard: Escape + arrow keys + focus trap
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
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusable = [...modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, scrollCarousel]);

  // Scroll to current world on open
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll('[data-world-card]');
    if (!cards.length) return;

    const currentIdx = WORLDS.findIndex((w) => w.id === currentWorldId);
    const targetCard = cards[currentIdx >= 0 ? currentIdx : 0];
    if (!targetCard) return;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const cardRect = targetCard.getBoundingClientRect();
      container.scrollLeft = targetCard.offsetLeft - containerRect.width / 2 + cardRect.width / 2;
    });
  }, [isOpen]); // only on open, not on currentWorldId change during close

  const handleSwitchWorld = useCallback((worldId) => {
    applyWorldWithTransition(worldId);
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 150);
  }, [onClose]);

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

        {/* Header */}
        <div style={{ padding: '32px 32px 0' }}>
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

        {/* Carousel */}
        <div style={{ position: 'relative', paddingBottom: '8px' }}>
          <CarouselArrow direction="left" onClick={() => scrollCarousel(-1)} />
          <CarouselArrow direction="right" onClick={() => scrollCarousel(1)} />

          <div
            ref={scrollRef}
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
            className="world-switcher-scroll"
          >
            {WORLDS.map((world) => {
              const isCurrent = world.id === currentWorldId;

              return (
                <div
                  key={world.id}
                  data-world-card={world.id}
                  data-current={isCurrent || undefined}
                  style={{
                    minWidth: '260px',
                    maxWidth: '260px',
                    scrollSnapAlign: 'center',
                    flexShrink: 0,
                    borderRadius: 'calc(var(--dt-window-radius) - 2px)',
                    border: isCurrent
                      ? '1px solid var(--dt-accent)'
                      : '1px solid var(--dt-accent-border)',
                    background: isCurrent ? 'var(--dt-accent-soft-2)' : 'var(--dt-surface-deep)',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    cursor: isCurrent ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--dt-shadow-focused)';
                      e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
                    }
                  }}
                >
                  {/* Card header */}
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
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>
                      {getWorldEmoji(world.id)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '16px' }}>
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
                        {getWorldCta(world.id)}
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
            <KbdHint>←</KbdHint>
            <KbdHint>→</KbdHint>
            <span style={{ marginLeft: '4px' }}>to browse</span>
          </div>

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

'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { getCurrentWorldId, createWorldChangeListener, getGhibliPoemFooter } from '@/config/worldContent';
import PoemFooter from '@/components/welcome/PoemFooter';
import JOURNAL_ENTRIES from '@/config/journal.js';

// react-pageflip is canvas/DOM-heavy — never SSR
const HTMLFlipBook = dynamic(
  () => import('react-pageflip').then((m) => m.default ?? m.HTMLFlipBook ?? m),
  { ssr: false }
);

// ─── Per-world skin tokens ─────────────────────────────────────────────────
// Values are CSS or inline values. Live --dt-* tokens used where possible
// so the theme system drives all three worlds from one component.

const SKINS = {
  'elden-ring': {
    // Book body: dark leather (matches MgyGb frame fill #1a150d→#120e08)
    bookBg: 'linear-gradient(180deg, #1a150d 0%, #120e08 100%)',
    bookBorder: '#c9a84c',
    spineBg: 'linear-gradient(180deg, #0d0a06 0%, #1a1409 50%, #0d0a06 100%)',
    spineAccent: '#c9a84c80',
    // Page parchment (left page: #f0e8d0→#dfd1ae, right slightly cooler)
    leftPageBg: 'linear-gradient(135deg, #f0e8d0 0%, #e8ddc0 50%, #dfd1ae 100%)',
    rightPageBg: 'linear-gradient(315deg, #eee3c8 0%, #e4d6b8 50%, #daccaa 100%)',
    pageText: '#2a1a0a',
    pageMuted: '#6b4f2a',
    pageAccent: '#c9a84c',
    pageBorder: '#c9a84c60',
    fontHeading: '"Cinzel", "Palatino Linotype", serif',
    fontBody: '"Crimson Text", "Georgia", serif',
    fontMono: '"Geist Mono", monospace',
    divider: '✦',
    flourish: '━━━━ ⚜ ━━━━',
    coverTitle: '✦ TARNISHED CODEX ✦',
    coverSubtitle: 'FIELD JOURNAL',
    coverFont: '"Cinzel", serif',
    coverBg: 'linear-gradient(180deg, #1a150d 0%, #120e08 100%)',
    coverText: '#c9a84c',
    coverMuted: '#c9a84c70',
    goldLine: '#c9a84c',
    shadow: '0 12px 48px -4px #00000088, 0 4px 16px 0 #c9a84c22',
  },
  'ghibli': {
    // Leather cover: spec gradient at 120° — #d3bd92 → #bd9e6c @50% → #a8895a
    bookBg: 'linear-gradient(120deg, #d3bd92 0%, #bd9e6c 50%, #a8895a 100%)',
    bookBorder: '#6e5836',
    // Spine shadow strip: #2a1c0a at 0%/35%/0% across
    spineBg: 'linear-gradient(90deg, #2a1c0a00 0%, #2a1c0a59 50%, #2a1c0a00 100%)',
    spineAccent: '#2a1c0a40',
    // Open pages: #ece1c2 fill + radial vignette overlay handled in EntryPage
    leftPageBg: '#ece1c2',
    rightPageBg: '#ece1c2',
    pageText: '#4a3622',
    pageMuted: '#8a6a3a',
    pageAccent: '#8a7444',
    pageBorder: '#8a744440',
    fontHeading: 'var(--font-newsreader), "Palatino Linotype", serif',
    fontBody: 'var(--font-newsreader), Georgia, serif',
    fontMono: 'var(--font-geist), "Segoe UI", sans-serif',
    divider: '✿',
    flourish: '✿   ❦   ✿',
    // Cover identity
    coverTitle: 'Almanac',
    coverSubtitle: 'Observations & Wonders',
    coverFont: 'var(--font-newsreader), serif',
    coverText: '#3a2c14',
    coverMuted: '#f0e7d080',
    goldLine: '#8a7444',
    shadow: '0 24px 56px -4px #00000073, 0 4px 16px 0 #6e583622',
    // Almanac-only extras
    tooledBorderColor: '#f0e7d0',
    cornerBloomColor: '#9d8ec9',
    ribbonCrimson: '#9d8ec9',
    ribbonCrimsonTip: '#7d6ea9',
    ribbonGold: '#88a079',
    ribbonGoldTip: '#6f8a62',
    curlReveal: '#f4ead2',
    curlFlap: 'linear-gradient(315deg, #c7b083 0%, #f3e9cf 100%)',
    curlHint: '#8a7444',
    dateColor: '#8a6a3a',
    ruleColor: '#8a744472',
  },
  'got': {
    bookBg: 'linear-gradient(180deg, #1a1e24 0%, #0d1014 100%)',
    bookBorder: '#8a8fa0',
    spineBg: 'linear-gradient(180deg, #0a0c10 0%, #151820 50%, #0a0c10 100%)',
    spineAccent: '#8a8fa060',
    leftPageBg: 'linear-gradient(135deg, #f0eeea 0%, #e8e4de 50%, #dcd6cc 100%)',
    rightPageBg: 'linear-gradient(315deg, #eceae6 0%, #e2ddd6 50%, #d6cfc4 100%)',
    pageText: '#1e2028',
    pageMuted: '#5a5e70',
    pageAccent: '#8a8fa0',
    pageBorder: '#8a8fa040',
    fontHeading: '"Cinzel", "Palatino Linotype", serif',
    fontBody: '"Crimson Text", "Georgia", serif',
    fontMono: 'var(--dt-font-mono, monospace)',
    divider: '⚔',
    flourish: '— ⚔ —',
    coverTitle: 'RAVEN SCROLLS',
    coverSubtitle: 'Observations from the Realm',
    coverFont: '"Cinzel", serif',
    coverBg: 'linear-gradient(180deg, #1a1e24 0%, #0d1014 100%)',
    coverText: '#c0c4d0',
    coverMuted: '#8a8fa070',
    goldLine: '#8a8fa0',
    shadow: '0 12px 48px -4px #00000088, 0 4px 16px 0 #8a8fa022',
  },
};

const DEFAULT_SKIN = SKINS['elden-ring'];

function getSkin(worldId) {
  return SKINS[worldId] ?? DEFAULT_SKIN;
}

// ─── Page components (forwardRef required by react-pageflip) ───────────────

const AlmanacCoverDecorations = ({ skin, isGhibli }) => {
  if (!isGhibli) return null;
  return (
    <>
      {/* Tooled border frame */}
      <div style={{
        position: 'absolute',
        inset: 6,
        borderRadius: 8,
        border: `1px solid ${skin.tooledBorderColor}`,
        pointerEvents: 'none',
      }} />

      {/* Corner blooms — all four corners */}
      {[
        { top: 4, left: 4 },
        { top: 4, right: 4 },
        { bottom: 4, left: 4 },
        { bottom: 4, right: 4 },
      ].map((pos, i) => (
        <span key={i} style={{
          position: 'absolute',
          ...pos,
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          color: skin.cornerBloomColor,
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>✿</span>
      ))}

      {/* Crimson ribbon — hanging from top */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 28,
        width: 20,
        height: 180,
        background: skin.ribbonCrimson,
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        {/* Triangle tip */}
        <div style={{
          position: 'absolute',
          bottom: -13,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `13px solid ${skin.ribbonCrimsonTip}`,
        }} />
      </div>

      {/* Gold ribbon — hanging from top, slightly longer */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 8,
        width: 20,
        height: 220,
        background: skin.ribbonGold,
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          bottom: -13,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `13px solid ${skin.ribbonGoldTip}`,
        }} />
      </div>

      {/* Page curl — bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 78,
        height: 78,
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        {/* Curl reveal (underside parchment) */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 78,
          height: 78,
          background: skin.curlReveal,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }} />
        {/* Curl shadow */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 78,
          height: 78,
          background: 'rgba(42, 31, 14, 0.22)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          filter: 'blur(6px)',
        }} />
        {/* Curl flap */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 72,
          height: 72,
          background: skin.curlFlap,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          outline: '0.5px solid rgba(184, 160, 106, 0.5)',
        }} />
        {/* Curl crease line */}
        <svg
          style={{ position: 'absolute', bottom: 0, right: 0, width: 78, height: 78, pointerEvents: 'none' }}
          viewBox="0 0 78 78"
          fill="none"
        >
          <line x1="78" y1="0" x2="0" y2="78" stroke="#fff7e0" strokeWidth="1.5" opacity="0.7" />
        </svg>
        {/* "turn the page" hint */}
        <span style={{
          position: 'absolute',
          bottom: 6,
          right: 2,
          fontFamily: 'var(--font-geist), sans-serif',
          fontSize: 9,
          fontStyle: 'italic',
          color: skin.curlHint,
          opacity: 0.6,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
          transform: 'rotate(-45deg)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          turn the page
        </span>
      </div>
    </>
  );
};

const CoverPage = forwardRef(function CoverPage({ skin, isBack, isGhibli }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        background: skin.coverBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '40px 32px',
        boxSizing: 'border-box',
        borderRadius: isBack ? '0 4px 4px 0' : '4px 0 0 4px',
        border: `1px solid ${isGhibli ? skin.bookBorder : skin.goldLine}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isGhibli ? (
        <>
          <div style={{
            width: '80%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${skin.tooledBorderColor}, transparent)`,
          }} />
          <div style={{
            fontFamily: skin.coverFont,
            fontSize: 26,
            fontStyle: 'italic',
            fontWeight: 400,
            color: skin.coverText,
            letterSpacing: 2,
            textAlign: 'center',
            lineHeight: 1.05,
          }}>
            {isBack ? '— fin —' : skin.coverTitle}
          </div>
          {!isBack && (
            <div style={{
              fontFamily: skin.fontMono,
              fontSize: 10,
              color: skin.coverText,
              opacity: 0.6,
              letterSpacing: 3,
              textAlign: 'center',
            }}>
              {skin.coverSubtitle}
            </div>
          )}
          <div style={{
            width: '80%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${skin.tooledBorderColor}, transparent)`,
          }} />
        </>
      ) : (
        <>
          <div style={{
            width: '80%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
          }} />
          <div style={{
            fontFamily: skin.coverFont,
            fontSize: 20,
            fontWeight: 700,
            color: skin.coverText,
            letterSpacing: 4,
            textAlign: 'center',
          }}>
            {isBack ? '— fin —' : skin.coverTitle}
          </div>
          {!isBack && (
            <div style={{
              fontFamily: skin.fontMono,
              fontSize: 10,
              color: skin.coverMuted,
              letterSpacing: 3,
              textAlign: 'center',
            }}>
              {skin.coverSubtitle}
            </div>
          )}
          <div style={{
            width: '80%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
          }} />
        </>
      )}

      <AlmanacCoverDecorations skin={skin} isGhibli={isGhibli} />
    </div>
  );
});

const EntryPage = forwardRef(function EntryPage({ entry, pageNum, skin, isLeft, isGhibli, allEntries }, ref) {
  const radius = isLeft ? '4px 0 0 4px' : '0 4px 4px 0';

  if (isGhibli) {
    return (
      <div
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
          background: skin.leftPageBg,
          display: 'flex',
          flexDirection: 'column',
          padding: isLeft ? '44px 40px 40px 52px' : '44px 52px 40px 46px',
          boxSizing: 'border-box',
          gap: 14,
          borderRadius: radius,
          border: `1px solid ${skin.pageBorder}`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Radial vignette overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(107,82,38,0.25) 100%)',
          pointerEvents: 'none',
          borderRadius: radius,
        }} />

        {isLeft ? (
          // LEFT PAGE — index/chapter list style
          <>
            <div style={{
              fontFamily: skin.fontHeading,
              fontSize: 13,
              fontWeight: 600,
              color: skin.pageMuted,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}>
              Contents
            </div>

            {/* Decorative divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: 0.6,
            }}>
              <div style={{ flex: 1, height: 1, background: skin.pageBorder }} />
              <span style={{ fontFamily: skin.fontBody, fontSize: 14, color: skin.pageAccent }}>+</span>
              <div style={{ flex: 1, height: 1, background: skin.pageBorder }} />
            </div>

            {/* Chapter entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1 }}>
              {(allEntries ?? []).slice(0, 6).map((e, i) => (
                <div key={i} style={{
                  fontFamily: skin.fontBody,
                  fontSize: 13,
                  color: skin.pageText,
                  lineHeight: 1.4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <span style={{ fontStyle: 'italic' }}>{e.title}</span>
                  <span style={{ color: skin.pageMuted, fontSize: 11 }}>{i + 1}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Bottom flourish */}
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: skin.pageAccent,
              opacity: 0.4,
              textAlign: 'center',
              letterSpacing: 4,
            }}>
              ✿   ❦   ✿
            </div>
          </>
        ) : (
          // RIGHT PAGE — full entry view
          <>
            {/* Date stamp */}
            {entry && (
              <div style={{
                fontFamily: skin.fontMono,
                fontSize: 10,
                fontWeight: 600,
                color: skin.dateColor,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}>
                {entry.date}
              </div>
            )}

            {/* Newsreader 26px italic title */}
            {entry && (
              <div style={{
                fontFamily: skin.fontHeading,
                fontSize: 26,
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#3a2c14',
                lineHeight: 1.05,
              }}>
                {entry.title}
              </div>
            )}

            {/* Rule */}
            <div style={{
              width: 130,
              height: 2,
              background: skin.ruleColor,
              flexShrink: 0,
            }} />

            {/* Body paragraphs at spec: 15.5px Newsreader, #4a3622, line-height 1.6 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {entry && entry.body.map((para, i) => (
                <p key={i} style={{
                  fontFamily: skin.fontBody,
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  color: i === entry.body.length - 1 && para.startsWith('"')
                    ? skin.pageMuted
                    : skin.pageText,
                  fontStyle: i === entry.body.length - 1 && para.startsWith('"') ? 'italic' : 'normal',
                  margin: 0,
                }}>
                  {para}
                </p>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Folio: "~  xxxi  ~" */}
            <div style={{
              fontFamily: skin.fontBody,
              fontSize: 13,
              fontStyle: 'italic',
              color: skin.pageMuted,
              textAlign: 'center',
            }}>
              ~&nbsp;&nbsp;{pageNum}&nbsp;&nbsp;~
            </div>
          </>
        )}

        {/* Almanac page curl on right-side pages */}
        {!isLeft && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 78,
            height: 78,
            pointerEvents: 'none',
            zIndex: 3,
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 78,
              height: 78,
              background: skin.curlReveal,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 78,
              height: 78,
              background: 'rgba(42, 31, 14, 0.22)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              filter: 'blur(6px)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 72,
              height: 72,
              background: skin.curlFlap,
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              outline: '0.5px solid rgba(184, 160, 106, 0.5)',
            }} />
            <svg
              style={{ position: 'absolute', bottom: 0, right: 0, width: 78, height: 78 }}
              viewBox="0 0 78 78"
              fill="none"
            >
              <line x1="78" y1="0" x2="0" y2="78" stroke="#fff7e0" strokeWidth="1.5" opacity="0.7" />
            </svg>
            <span style={{
              position: 'absolute',
              bottom: 6,
              right: 2,
              fontFamily: 'var(--font-geist), sans-serif',
              fontSize: 9,
              fontStyle: 'italic',
              color: skin.curlHint,
              opacity: 0.6,
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              transform: 'rotate(-45deg)',
              transformOrigin: 'bottom right',
              userSelect: 'none',
            }}>
              turn the page
            </span>
          </div>
        )}
      </div>
    );
  }

  // Non-Ghibli worlds: original layout
  const bgStyle = isLeft ? skin.leftPageBg : skin.rightPageBg;
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        background: bgStyle,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 36px 28px',
        boxSizing: 'border-box',
        gap: 14,
        borderRadius: radius,
        border: `1px solid ${skin.pageBorder}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top flourish */}
      <div style={{
        fontFamily: skin.fontMono,
        fontSize: 10,
        color: skin.pageAccent,
        textAlign: 'center',
        letterSpacing: 3,
        opacity: 0.7,
      }}>
        {skin.flourish}
      </div>

      {entry && (
        <>
          <div style={{
            fontFamily: skin.fontHeading,
            fontSize: 16,
            fontWeight: 700,
            color: skin.pageText,
            textAlign: 'center',
            letterSpacing: 2,
            lineHeight: 1.3,
          }}>
            {entry.title}
          </div>
          <div style={{
            fontFamily: skin.fontMono,
            fontSize: 10,
            color: skin.pageMuted,
            textAlign: 'center',
            letterSpacing: 1,
          }}>
            {entry.date}
          </div>
        </>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: `${skin.pageAccent}`,
        opacity: 0.6,
      }}>
        <div style={{ flex: 1, height: 1, background: skin.pageBorder }} />
        <span style={{ fontFamily: skin.fontMono, fontSize: 12 }}>{skin.divider}</span>
        <div style={{ flex: 1, height: 1, background: skin.pageBorder }} />
      </div>

      {entry && entry.body.map((para, i) => (
        <p key={i} style={{
          fontFamily: skin.fontBody,
          fontSize: 14,
          lineHeight: 1.65,
          color: i === entry.body.length - 1 && para.startsWith('"')
            ? skin.pageMuted
            : skin.pageText,
          fontStyle: i === entry.body.length - 1 && para.startsWith('"') ? 'italic' : 'normal',
          margin: 0,
          flex: i === entry.body.length - 1 ? 1 : undefined,
        }}>
          {para}
        </p>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{
        fontFamily: skin.fontMono,
        fontSize: 10,
        color: skin.pageAccent,
        textAlign: 'center',
        letterSpacing: 2,
        opacity: 0.5,
      }}>
        ━━━━━ {skin.divider} ━━━━━
      </div>
      <div style={{
        fontFamily: skin.fontHeading,
        fontSize: 11,
        color: skin.pageMuted,
        textAlign: 'center',
      }}>
        {pageNum}
      </div>

      {!isLeft && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 40,
          height: 32,
          background: 'linear-gradient(225deg, rgba(0,0,0,0.18) 0%, transparent 70%)',
          borderRadius: '0 0 4px 0',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
});

// ─── Main Journal component ────────────────────────────────────────────────

export default function Journal() {
  const [worldId, setWorldId] = useState(() => getCurrentWorldId());
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Reduced-motion detection — flip time near-zero means instant page turn,
  // pages remain fully readable and navigable.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => createWorldChangeListener(setWorldId), []);

  const skin = getSkin(worldId);
  const isGhibli = worldId === 'ghibli';
  const entries = JOURNAL_ENTRIES[worldId] ?? JOURNAL_ENTRIES['elden-ring'];
  const poemText = getGhibliPoemFooter(worldId, 'journal');

  const handleFlip = (e) => setCurrentPage(e.data);

  const flipNext = () => bookRef.current?.pageFlip().flipNext();
  const flipPrev = () => bookRef.current?.pageFlip().flipPrev();

  // Pages: cover + N entries + back cover.
  // react-pageflip shows them as spreads: showCover=true renders cover+back as singles.

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: isGhibli ? 'var(--sg-canvas-bg, #121c15)' : 'var(--dt-bg, #0a0a0a)',
      padding: isGhibli ? '12px 8px 8px' : '20px 12px',
      boxSizing: 'border-box',
      gap: isGhibli ? 12 : 16,
      userSelect: 'none',
    }}>
      {/* Book stage */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isGhibli ? 10 : 8,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
      }}>
        {!isGhibli && (
          <>
            <div style={{
              fontFamily: skin.fontMono,
              fontSize: 9,
              color: skin.goldLine,
              letterSpacing: 4,
              opacity: 0.6,
              textAlign: 'center',
            }}>
              {skin.coverTitle}
            </div>
            <div style={{
              width: 'min(90%, 700px)',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
              opacity: 0.5,
            }} />
          </>
        )}

        {/* The book itself — Almanac gets leather shadow + border */}
        <div style={{
          boxShadow: skin.shadow,
          borderRadius: isGhibli ? 12 : 4,
          background: skin.bookBg,
          border: `1px solid ${skin.bookBorder}`,
          position: 'relative',
          overflow: isGhibli ? 'visible' : undefined,
        }}>
          {/* Almanac page stack layers (decorative, behind the book) */}
          {isGhibli && (
            <>
              <div style={{
                position: 'absolute',
                inset: '-10px -6px -10px -6px',
                background: '#b09766',
                borderRadius: 7,
                zIndex: -1,
              }} />
              <div style={{
                position: 'absolute',
                inset: '-7px -3px -7px -3px',
                background: '#c6af80',
                borderRadius: 6,
                zIndex: -1,
              }} />
              <div style={{
                position: 'absolute',
                inset: '-4px 0px -4px 0px',
                background: '#d8c596',
                borderRadius: 5,
                zIndex: -1,
              }} />
            </>
          )}

          <HTMLFlipBook
            ref={bookRef}
            width={isGhibli ? 400 : 380}
            height={isGhibli ? 540 : 520}
            size="fixed"
            drawShadow={!reducedMotion}
            flippingTime={reducedMotion ? 1 : 700}
            usePortrait={false}
            showCover={true}
            maxShadowOpacity={0.4}
            mobileScrollSupport={false}
            className="journal-flipbook"
            style={{}}
            onFlip={handleFlip}
          >
            <CoverPage skin={skin} isBack={false} isGhibli={isGhibli} />
            {entries.map((entry, i) => (
              <EntryPage
                key={`${worldId}-${i}`}
                entry={entry}
                pageNum={i + 1}
                skin={skin}
                isLeft={i % 2 === 0}
                isGhibli={isGhibli}
                allEntries={entries}
              />
            ))}
            <CoverPage skin={skin} isBack={true} isGhibli={isGhibli} />
          </HTMLFlipBook>
        </div>

        {!isGhibli && (
          <div style={{
            width: 'min(90%, 700px)',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
            opacity: 0.5,
          }} />
        )}
      </div>

      {/* Navigation controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={flipPrev}
          aria-label="Previous page"
          disabled={currentPage === 0}
          style={{
            fontFamily: skin.fontMono,
            fontSize: 11,
            letterSpacing: 2,
            color: currentPage === 0 ? `${skin.pageAccent}40` : skin.pageAccent,
            background: 'transparent',
            border: `1px solid ${currentPage === 0 ? skin.pageBorder : skin.pageAccent}`,
            borderRadius: 3,
            padding: '4px 14px',
            cursor: currentPage === 0 ? 'default' : 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          ← prev
        </button>

        <span style={{
          fontFamily: skin.fontMono,
          fontSize: 10,
          color: skin.pageMuted,
          letterSpacing: 2,
          minWidth: 60,
          textAlign: 'center',
        }}>
          {currentPage + 1} / {entries.length + 2}
        </span>

        <button
          type="button"
          onClick={flipNext}
          aria-label="Next page"
          disabled={currentPage >= entries.length + 1}
          style={{
            fontFamily: skin.fontMono,
            fontSize: 11,
            letterSpacing: 2,
            color: currentPage >= entries.length + 1 ? `${skin.pageAccent}40` : skin.pageAccent,
            background: 'transparent',
            border: `1px solid ${currentPage >= entries.length + 1 ? skin.pageBorder : skin.pageAccent}`,
            borderRadius: 3,
            padding: '4px 14px',
            cursor: currentPage >= entries.length + 1 ? 'default' : 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          next →
        </button>
      </div>

      {/* Poem footer — Ghibli world only */}
      {poemText && (
        <PoemFooter text={poemText} style={{ paddingBottom: 4, flexShrink: 0 }} />
      )}
    </div>
  );
}

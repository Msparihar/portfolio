'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { getCurrentWorldId, createWorldChangeListener } from '@/config/worldContent';
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
    bookBg: 'linear-gradient(180deg, #2d3b2a 0%, #1e2a1c 100%)',
    bookBorder: 'var(--dt-accent, #7c5cfc)',
    spineBg: 'linear-gradient(180deg, #1a2518 0%, #243020 50%, #1a2518 100%)',
    spineAccent: 'var(--dt-accent-border, #7c5cfc80)',
    leftPageBg: 'linear-gradient(135deg, #faf7f0 0%, #f4f0e4 50%, #ece5d2 100%)',
    rightPageBg: 'linear-gradient(315deg, #f6f2e8 0%, #eee8d8 50%, #e4dcc4 100%)',
    pageText: '#2a2a1e',
    pageMuted: '#5a6642',
    pageAccent: 'var(--dt-accent, #7c5cfc)',
    pageBorder: 'var(--dt-accent-border, #7c5cfc40)',
    fontHeading: '"Newsreader", "Palatino Linotype", serif',
    fontBody: '"Newsreader", "Georgia", serif',
    fontMono: 'var(--dt-font-mono, monospace)',
    divider: '✿',
    flourish: '— ✿ —',
    coverTitle: 'THE GARDEN JOURNAL',
    coverSubtitle: 'Observations & Wonders',
    coverFont: '"Newsreader", serif',
    coverBg: 'linear-gradient(180deg, #2d3b2a 0%, #1e2a1c 100%)',
    coverText: 'var(--dt-accent, #a8d8a8)',
    coverMuted: '#7aaa7a80',
    goldLine: 'var(--dt-accent, #7c5cfc)',
    shadow: '0 12px 48px -4px #00000060, 0 4px 16px 0 #7c5cfc22',
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

const CoverPage = forwardRef(function CoverPage({ skin, isBack }, ref) {
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
        border: `1px solid ${skin.goldLine}`,
      }}
    >
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
    </div>
  );
});

const EntryPage = forwardRef(function EntryPage({ entry, pageNum, skin, isLeft }, ref) {
  const bgStyle = isLeft ? skin.leftPageBg : skin.rightPageBg;
  const radius = isLeft ? '4px 0 0 4px' : '0 4px 4px 0';

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

      {/* Entry heading + date (only on left/start pages) */}
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

      {/* Divider */}
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

      {/* Body paragraphs */}
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

      {/* Bottom ornament + page number */}
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

      {/* Curled corner shadow (right-side pages only) */}
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
  const entries = JOURNAL_ENTRIES[worldId] ?? JOURNAL_ENTRIES['elden-ring'];

  const handleFlip = (e) => setCurrentPage(e.data);

  const flipNext = () => bookRef.current?.pageFlip().flipNext();
  const flipPrev = () => bookRef.current?.pageFlip().flipPrev();

  // Pages: cover + 4 entries (each entry = 1 page) + back cover = 6 pages total.
  // react-pageflip shows them as spreads: [cover|entry1], [entry2|entry3], [entry4|back].
  // showCover=true makes cover+back render as singles at edges.

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'var(--dt-bg, #0a0a0a)',
      padding: '20px 12px',
      boxSizing: 'border-box',
      gap: 16,
      userSelect: 'none',
    }}>
      {/* Book stage with outer frame label */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: '100%',
      }}>
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

        {/* Gold hairline top */}
        <div style={{
          width: 'min(90%, 700px)',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
          opacity: 0.5,
        }} />

        {/* The book itself */}
        <div style={{
          boxShadow: skin.shadow,
          borderRadius: 4,
          background: skin.bookBg,
          border: `1px solid ${skin.bookBorder}`,
        }}>
          <HTMLFlipBook
            ref={bookRef}
            width={380}
            height={520}
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
            <CoverPage skin={skin} isBack={false} />
            {entries.map((entry, i) => (
              <EntryPage
                key={`${worldId}-${i}`}
                entry={entry}
                pageNum={i + 1}
                skin={skin}
                isLeft={i % 2 === 0}
              />
            ))}
            <CoverPage skin={skin} isBack={true} />
          </HTMLFlipBook>
        </div>

        {/* Gold hairline bottom */}
        <div style={{
          width: 'min(90%, 700px)',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${skin.goldLine}, transparent)`,
          opacity: 0.5,
        }} />
      </div>

      {/* Navigation controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <button
          onClick={flipPrev}
          aria-label="Previous page"
          disabled={currentPage === 0}
          style={{
            fontFamily: skin.fontMono,
            fontSize: 11,
            letterSpacing: 2,
            color: currentPage === 0 ? `${skin.pageAccent}40` : skin.pageAccent,
            background: 'transparent',
            border: `1px solid ${currentPage === 0 ? `${skin.pageBorder}` : skin.pageAccent}`,
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
          onClick={flipNext}
          aria-label="Next page"
          disabled={currentPage >= entries.length + 1}
          style={{
            fontFamily: skin.fontMono,
            fontSize: 11,
            letterSpacing: 2,
            color: currentPage >= entries.length + 1
              ? `${skin.pageAccent}40`
              : skin.pageAccent,
            background: 'transparent',
            border: `1px solid ${currentPage >= entries.length + 1
              ? skin.pageBorder
              : skin.pageAccent}`,
            borderRadius: 3,
            padding: '4px 14px',
            cursor: currentPage >= entries.length + 1 ? 'default' : 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          next →
        </button>
      </div>
    </div>
  );
}

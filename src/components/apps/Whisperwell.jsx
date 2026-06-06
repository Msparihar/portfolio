'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentWorldId, createWorldChangeListener, getGhibliPoemFooter } from '@/config/worldContent';
import PoemFooter from '@/components/welcome/PoemFooter';

const GARDEN_REPLIES = [
  "The wisteria is loudest this morning. Three new shoots by the eastern stones — go before the bees lay claim.",
  "She is kept in the pressed pages — the thirty-first of May, the day the arch first turned to lavender.",
  "The moss remembers every footstep. You have walked this path before, though you may not recall the season.",
  "Listen at dusk — the garden speaks in rustles and drips. What you seek is already here, beneath the fern.",
  "The well knows two things: what you have planted, and what you have forgotten to water.",
];

const SPELL_CHIPS = [
  { emoji: '🌱', label: 'plant' },
  { emoji: '👂', label: 'listen' },
  { emoji: '🌬', label: 'wander' },
  { emoji: '🕯', label: 'remember' },
  { emoji: '☾', label: 'dream' },
];

const INITIAL_MESSAGES = [
  { role: 'garden', text: GARDEN_REPLIES[0] },
  { role: 'garden', text: GARDEN_REPLIES[1] },
];

function GhibliWhisperwell() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const replyIndexRef = useRef(2);
  const transcriptRef = useRef(null);
  const inputRef = useRef(null);
  const poemText = getGhibliPoemFooter('ghibli', 'whisperwell');

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || sending) return;

    setSending(true);
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text }]);

    await new Promise((r) => setTimeout(r, 600));

    const idx = replyIndexRef.current % GARDEN_REPLIES.length;
    replyIndexRef.current += 1;
    setMessages((prev) => [...prev, { role: 'garden', text: GARDEN_REPLIES[idx] }]);
    setSending(false);
  }

  function handleChipClick(label) {
    setInputValue(label);
    inputRef.current?.focus();
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      fontFamily: 'var(--font-newsreader), Georgia, serif',
      color: 'var(--sg-text-primary)',
      overflow: 'hidden',
    }}>
      {/* Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '30px 30px 20px',
        overflow: 'hidden',
      }}>

        {/* Well Pool */}
        <div style={{
          width: '100%',
          height: '190px',
          flexShrink: 0,
          borderRadius: '22px',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 42%, #06151a 0%, #0a1f24 60%, #123338 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {/* Concentric ripple rings */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', width: '320px', height: '80px', borderRadius: '50%', border: '1px solid rgba(191,233,236,0.12)' }} />
            <div style={{ position: 'absolute', width: '220px', height: '55px', borderRadius: '50%', border: '1px solid rgba(205,238,240,0.18)' }} />
            <div style={{ position: 'absolute', width: '130px', height: '34px', borderRadius: '50%', border: '1px solid rgba(224,244,245,0.22)' }} />
          </div>

          {/* Moon glint */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '76px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255,233,194,0.55)',
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }} />

          {/* Pool label */}
          <div style={{
            fontFamily: 'var(--dt-font-mono, Geist Mono, monospace)',
            fontSize: '10px',
            fontWeight: 600,
            color: '#a7cdcd',
            letterSpacing: '2px',
            position: 'relative',
            zIndex: 1,
          }}>
            THE WHISPERING WELL
          </div>

          {/* Invite text */}
          <div style={{
            fontFamily: 'var(--font-newsreader), Georgia, serif',
            fontSize: '19px',
            fontStyle: 'italic',
            color: '#dcf0f0',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            Whisper, and the garden listens.
          </div>
        </div>

        {/* Transcript */}
        <div
          ref={transcriptRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {messages.map((msg, i) => (
            msg.role === 'user' ? (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  borderRadius: '999px',
                  background: 'rgba(51,68,47,0.06)',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-newsreader), Georgia, serif',
                  fontSize: '15px',
                  color: '#33442f',
                  maxWidth: '70%',
                }}>
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div aria-hidden="true" style={{
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: 'rgba(74,124,89,0.08)',
                  border: '1px solid rgba(74,124,89,0.15)',
                }} />
                <div style={{
                  fontFamily: 'var(--font-newsreader), Georgia, serif',
                  fontSize: '16px',
                  color: '#33442f',
                  lineHeight: 1.5,
                  maxWidth: '80%',
                }}>
                  {msg.text}
                </div>
              </div>
            )
          ))}
          {sending && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div aria-hidden="true" style={{
                width: '28px',
                height: '28px',
                flexShrink: 0,
                borderRadius: '50%',
                background: 'rgba(74,124,89,0.08)',
                border: '1px solid rgba(74,124,89,0.15)',
              }} />
              <div style={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontSize: '15px',
                fontStyle: 'italic',
                color: '#a7b89a',
              }}>
                the garden stirs…
              </div>
            </div>
          )}
        </div>

        {/* Spell chips */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--dt-font-mono, Geist Mono, monospace)',
            fontSize: '11px',
            fontStyle: 'italic',
            color: '#8a9678',
          }}>
            cast a spell
          </span>
          {SPELL_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip.label)}
              style={{
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.70)',
                padding: '6px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--dt-font-mono, Geist Mono, monospace)',
                fontSize: '12px',
                fontWeight: 500,
                color: '#52634a',
                transition: 'background 0.15s ease',
              }}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSend}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.80)',
            border: '1px solid rgba(255,255,255,0.70)',
            padding: '8px 8px 8px 20px',
          }}
        >
          <span aria-hidden="true" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            color: '#6f8a86',
            flexShrink: 0,
          }}>
            ◌
          </span>
          <label htmlFor="whisperwell-input" className="sr-only">Whisper into the well</label>
          <input
            id="whisperwell-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="whisper into the well…"
            disabled={sending}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--dt-font-mono, Geist Mono, monospace)',
              fontSize: '14px',
              color: '#33442f',
            }}
          />
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            aria-label="Send whisper"
            style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
              borderRadius: '50%',
              background: (sending || !inputValue.trim())
                ? 'rgba(74,124,89,0.35)'
                : 'linear-gradient(135deg, #5aa0a0 0%, #3f6e4c 100%)',
              border: 'none',
              cursor: (sending || !inputValue.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(47,93,63,0.35)',
              transition: 'background 0.15s ease',
            }}
          >
            ✦
          </button>
        </form>
      </div>

      {/* Poem footer */}
      {poemText && (
        <div style={{ padding: '10px 24px 14px', flexShrink: 0 }}>
          <PoemFooter text={poemText} />
        </div>
      )}
    </div>
  );
}

export default function Whisperwell() {
  const [worldId, setWorldId] = useState(() => getCurrentWorldId());

  useEffect(() => createWorldChangeListener(setWorldId), []);

  if (worldId === 'ghibli') return <GhibliWhisperwell />;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      fontFamily: 'var(--dt-font-mono, monospace)',
      fontSize: '14px',
      color: 'var(--dt-text-muted)',
    }}>
      Whisperwell is a Ghibli-world experience
    </div>
  );
}

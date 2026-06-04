'use client';

import { useState, useEffect } from 'react';
import portfolioData from '@/config/portfolio.json';
import { createWorldChangeListener, getGhibliPoemFooter } from '@/config/worldContent';
import PoemFooter from '@/components/welcome/PoemFooter';

const GREEN = 'var(--dt-accent)';
const GREEN_BG = 'var(--dt-accent-soft-2)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const contact = portfolioData.contact || {};

const today = new Date().toDateString();

const MAILBOXES = [
  { id: 'inbox', icon: '📥', label: 'Inbox', count: 1 },
  { id: 'sent', icon: '📤', label: 'Sent', count: 0 },
  { id: 'drafts', icon: '📝', label: 'Drafts', count: 0 },
  { id: 'compose', icon: '✏️', label: 'Compose', count: null },
];

function inputStyle(focused) {
  return {
    width: '100%',
    background: focused ? 'var(--dt-accent-border-dim)' : 'var(--dt-surface-input)',
    border: `1px solid ${focused ? 'var(--dt-accent-dim)' : GREEN_BORDER}`,
    borderRadius: 'var(--dt-radius-sm, 4px)',
    padding: '7px 10px',
    color: TEXT_PRIMARY,
    fontFamily: 'var(--dt-font-mono, monospace)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  };
}

// ─── Ghibli message data (reuses existing inbox message content) ───────────

const GHIBLI_MAILBOXES = [
  { id: 'received', label: 'Received', count: 3 },
  { id: 'sent', label: 'Sent', count: 0 },
  { id: 'drafts', label: 'Drafts', count: 1 },
  { id: 'kept', label: 'Pressed & Kept', count: 9 },
];

const GHIBLI_MESSAGES = {
  received: [
    {
      id: 'vesper',
      sender: 'Vesper the fox',
      initials: 'VF',
      subject: 'On the matter of the missing plums',
      preview: 'I confess it was me. The plums were too warm and golden to resist…',
      time: 'this morning',
      body: [
        'Dear keeper of the garden,',
        '',
        'I confess it was me. The plums on the low branch by the stone wall — I took three of them at dawn, when the dew was still on the grass and you had not yet come outside.',
        '',
        'They were too warm and golden to resist, and I am a fox, after all.',
        '',
        'In return I have left a smooth river stone by your door. It is not quite a fair trade, I know, but it is the best I have. Please find it before the rain comes.',
      ],
      signoff: 'With sincere regret and mild satisfaction,',
      signature: 'Vesper',
    },
    {
      id: 'westwind',
      sender: 'The west wind',
      initials: 'WW',
      subject: 'A message carried a long way',
      preview: 'I have been travelling since the mountains and picked this up…',
      time: 'yesterday',
      body: [
        'I have been travelling since the mountains and picked this up somewhere over the valley.',
        '',
        'I do not know who sent it first. By the time it reached me it smelled of pine and rain.',
      ],
      signoff: 'Still moving,',
      signature: 'The West Wind',
    },
    {
      id: 'spirit',
      sender: 'A forest spirit',
      initials: 'FS',
      subject: 'You left your lantern on',
      preview: 'The light drew moths all night. I watched from the cedar grove.',
      time: 'two days ago',
      body: [
        'The light from your lantern drew moths all night. I watched from the cedar grove.',
        '',
        'It was beautiful, actually. You may leave it on again if you like.',
      ],
      signoff: 'Quietly yours,',
      signature: 'A Forest Spirit',
    },
    {
      id: 'mori',
      sender: 'Old gardener Mori',
      initials: 'GM',
      subject: 'The persimmon tree',
      preview: 'She is ready to be pruned. Come before the first frost.',
      time: 'last week',
      body: [
        'The persimmon tree near the east wall is ready to be pruned.',
        '',
        'Come before the first frost. Bring the long-handled shears — not the short ones.',
      ],
      signoff: 'As ever,',
      signature: 'Mori',
    },
    {
      id: 'slow',
      sender: 'A slow correspondent',
      initials: 'SC',
      subject: 'Still thinking about what you said',
      preview: 'It has been three seasons. I am still thinking about it.',
      time: '3 seasons ago',
      body: [
        'It has been three seasons. I am still thinking about what you said.',
        '',
        'I do not have a reply yet. I wanted you to know I received your letter.',
      ],
      signoff: 'In time,',
      signature: 'A Slow Correspondent',
    },
  ],
  sent: [],
  drafts: [
    {
      id: 'draft1',
      sender: 'You (unsent)',
      initials: 'ME',
      subject: 'Reply to Vesper',
      preview: 'Thank you for the river stone. I have placed it on the windowsill…',
      time: 'this morning',
      body: [
        'Dear Vesper,',
        '',
        'Thank you for the river stone. I have placed it on the windowsill where the light hits it in the afternoon.',
        '',
        'Please help yourself to the plums on the low branch whenever they are ripe. I leave them there for you.',
      ],
      signoff: 'Warmly,',
      signature: 'The Keeper',
    },
  ],
  kept: [],
};

const SEASONAL_QUOTE = '“The wind brings news from every meadow.”';

// ─── Ghibli three-column layout ────────────────────────────────────────────

function GhibliMail() {
  const [activeMailbox, setActiveMailbox] = useState('received');
  const [selectedMsg, setSelectedMsg] = useState(GHIBLI_MESSAGES.received[0]);
  const [showCompose, setShowCompose] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState({ from: '', subject: '', message: '' });
  const [sendStatus, setSendStatus] = useState('idle');
  const [sendError, setSendError] = useState('');

  const messages = GHIBLI_MESSAGES[activeMailbox] ?? [];

  function selectMailbox(id) {
    setActiveMailbox(id);
    const msgs = GHIBLI_MESSAGES[id] ?? [];
    setSelectedMsg(msgs[0] ?? null);
    setShowCompose(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!form.from || !form.subject || !form.message) return;
    setSendStatus('sending');
    setSendError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.from, subject: form.subject, message: form.message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendStatus('sent');
        setTimeout(() => {
          setForm({ from: '', subject: '', message: '' });
          setSendStatus('idle');
          setSendError('');
          setShowCompose(false);
        }, 3000);
      } else {
        setSendStatus('idle');
        setSendError(data.error || 'Failed to send. Try emailing directly: ' + (contact.email || 'manishsparihar@gmail.com'));
      }
    } catch {
      setSendStatus('idle');
      setSendError('Failed to send. Try emailing directly: ' + (contact.email || 'manishsparihar@gmail.com'));
    }
  }

  const poemText = getGhibliPoemFooter('ghibli', 'mail');

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
      {/* Three-column body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Column 1: Mailboxes — 228px */}
        <div style={{
          width: '228px',
          flexShrink: 0,
          background: 'var(--sg-sidebar-fill)',
          borderRight: '1px solid var(--sg-sidebar-divider)',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          padding: '18px 14px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: 'var(--dt-font-mono, monospace)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--sg-text-label)',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            MAILBOXES
          </div>

          {GHIBLI_MAILBOXES.map((mb) => {
            const isActive = activeMailbox === mb.id;
            return (
              <button
                key={mb.id}
                type="button"
                onClick={() => selectMailbox(mb.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 11px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{
                  fontFamily: 'var(--dt-font-mono, monospace)',
                  fontSize: '13px',
                  color: isActive ? 'var(--sg-text-primary)' : 'var(--sg-text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}>
                  {mb.label}
                </span>
                {mb.count > 0 && (
                  <span style={{
                    fontFamily: 'var(--dt-font-mono, monospace)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isActive ? '#3f6e4c' : '#8a9678',
                    background: 'transparent',
                  }}>
                    {mb.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Seasonal quote card */}
          <div style={{
            marginTop: 'auto',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.40)',
            padding: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{
              fontFamily: 'var(--dt-font-mono, monospace)',
              fontSize: '9px',
              fontWeight: 600,
              color: '#8a9678',
              letterSpacing: '2px',
            }}>
              THIS SEASON
            </div>
            <div style={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#33442f',
              lineHeight: 1.35,
            }}>
              {SEASONAL_QUOTE}
            </div>
          </div>
        </div>

        {/* Column 2: Message list — 340px */}
        <div style={{
          width: '340px',
          flexShrink: 0,
          borderRight: '1px solid var(--sg-sidebar-divider)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* List header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '16px 18px 12px 18px',
            borderBottom: '1px solid rgba(51, 68, 47, 0.08)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--sg-text-primary)',
              }}>
                {GHIBLI_MAILBOXES.find((m) => m.id === activeMailbox)?.label ?? 'Received'}
              </div>
              <div style={{
                fontFamily: 'var(--dt-font-mono, monospace)',
                fontSize: '11px',
                color: 'var(--sg-text-label)',
                marginTop: '2px',
              }}>
                {activeMailbox === 'received' ? 'Received' : activeMailbox}
              </div>
            </div>
            {activeMailbox === 'received' && (
              <div style={{
                fontFamily: 'var(--dt-font-mono, monospace)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--sg-text-label)',
              }}>
                3 new
              </div>
            )}
          </div>

          {/* Message rows */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 10px' }}>
            {messages.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                fontFamily: 'var(--dt-font-mono, monospace)',
                fontSize: '12px',
                color: 'var(--sg-text-label)',
                fontStyle: 'italic',
              }}>
                no letters here
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = selectedMsg?.id === msg.id && !showCompose;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => { setSelectedMsg(msg); setShowCompose(false); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '11px',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.55)' : 'transparent',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.50)' : '1px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-newsreader), Georgia, serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--sg-text-primary)',
                    }}>
                      {msg.sender}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-newsreader), Georgia, serif',
                      fontSize: '13px',
                      color: 'var(--sg-text-secondary)',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {msg.subject}
                    </div>
                    <div style={{
                      fontFamily: 'var(--dt-font-mono, monospace)',
                      fontSize: '11px',
                      color: 'var(--sg-text-label)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {msg.preview}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Reading pane — fill */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          padding: '26px 30px 22px 30px',
          overflowY: 'auto',
        }}>
          {showCompose ? (
            <GhibliCompose
              form={form}
              setForm={setForm}
              sendStatus={sendStatus}
              sendError={sendError}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              onSend={handleSend}
              onCancel={() => setShowCompose(false)}
            />
          ) : selectedMsg ? (
            <>
              {/* Letter header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                {/* Sender avatar */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '999px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #f1b487 0%, #c8784a 100%)',
                  boxShadow: '0 0 12px rgba(200, 120, 74, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--dt-font-mono, monospace)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '1px',
                }}>
                  {selectedMsg.initials}
                </div>

                {/* Sender info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '4px' }}>
                  <div style={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--sg-text-primary)',
                  }}>
                    {selectedMsg.sender}
                  </div>
                  <div style={{
                    fontFamily: 'var(--dt-font-mono, monospace)',
                    fontSize: '11px',
                    color: 'var(--sg-text-label)',
                  }}>
                    {selectedMsg.time}
                  </div>
                </div>

                {/* Keep star button */}
                <button
                  type="button"
                  aria-label="Keep this letter"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.50)',
                    border: '1px solid rgba(255, 255, 255, 0.70)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    transition: 'background 0.15s ease',
                  }}
                >
                  ☆
                </button>
              </div>

              {/* Subject */}
              <div style={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontSize: '30px',
                fontStyle: 'italic',
                color: '#33442f',
                lineHeight: 1.1,
              }}>
                {selectedMsg.subject}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(51, 68, 47, 0.08)' }} />

              {/* Letter body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                {selectedMsg.body.map((para, i) => (
                  para === '' ? (
                    <div key={i} style={{ height: '4px' }} />
                  ) : (
                    <p key={i} style={{
                      fontFamily: 'var(--font-newsreader), Georgia, serif',
                      fontSize: '15px',
                      color: (i === 0 || i === selectedMsg.body.length - 1) ? '#33442f' : '#46583f',
                      lineHeight: 1.5,
                      margin: 0,
                    }}>
                      {para}
                    </p>
                  )
                ))}

                {/* Sign-off + signature */}
                <div style={{ marginTop: '8px' }}>
                  <p style={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontSize: '15px',
                    color: '#33442f',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {selectedMsg.signoff}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontSize: '19px',
                    fontStyle: 'italic',
                    color: '#33442f',
                    margin: '4px 0 0 0',
                  }}>
                    {selectedMsg.signature}
                  </p>
                </div>
              </div>

              {/* Actions bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowCompose(true)}
                  style={{
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #5a9268 0%, #3f6e4c 100%)',
                    border: 'none',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--dt-font-mono, monospace)',
                    fontSize: '13px',
                    color: '#fff',
                    fontWeight: 500,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  ↩ Reply
                </button>
                <button
                  type="button"
                  aria-label="Keep this letter in Pressed & Kept"
                  style={{
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.70)',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--dt-font-mono, monospace)',
                    fontSize: '13px',
                    color: '#33442f',
                    transition: 'background 0.15s ease',
                  }}
                >
                  ☆ Keep
                </button>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => setShowCompose(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--dt-font-mono, monospace)',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: '#8a9678',
                    padding: 0,
                  }}
                >
                  write a letter →
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: '15px',
              fontStyle: 'italic',
              color: 'var(--sg-text-label)',
            }}>
              select a letter to read
            </div>
          )}
        </div>
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

function GhibliCompose({ form, setForm, sendStatus, sendError, focusedField, setFocusedField, onSend, onCancel }) {
  const sgInputStyle = (focused) => ({
    width: '100%',
    background: focused ? 'rgba(255, 255, 255, 0.60)' : 'rgba(255, 255, 255, 0.40)',
    border: `1px solid ${focused ? 'rgba(74, 124, 89, 0.50)' : 'rgba(51, 68, 47, 0.15)'}`,
    borderRadius: '10px',
    padding: '9px 13px',
    color: '#33442f',
    fontFamily: 'var(--font-newsreader), Georgia, serif',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  });

  if (sendStatus === 'sent') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <div style={{ fontSize: '36px' }}>✉️</div>
        <div style={{ fontFamily: 'var(--font-newsreader), Georgia, serif', fontSize: '18px', fontStyle: 'italic', color: '#3f6e4c' }}>
          Your letter has been carried off by the breeze.
        </div>
        <div style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '12px', color: '#8a9678' }}>
          returning in a moment…
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--dt-font-mono, monospace)',
          fontSize: '10px',
          fontWeight: 600,
          color: '#8a9678',
          letterSpacing: '2px',
        }}>
          NEW LETTER
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close compose"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--dt-font-mono, monospace)',
            fontSize: '12px',
            color: '#8a9678',
            padding: 0,
          }}
        >
          ← back
        </button>
      </div>

      <form onSubmit={onSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="sg-mail-to" style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '11px', color: '#8a9678', width: '56px', flexShrink: 0 }}>To:</label>
          <input
            id="sg-mail-to"
            type="text"
            value={contact.email || 'manishsparihar@gmail.com'}
            readOnly
            style={{ ...sgInputStyle(false), color: '#8a9678', cursor: 'default', flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="sg-mail-from" style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '11px', color: '#8a9678', width: '56px', flexShrink: 0 }}>From:</label>
          <input
            id="sg-mail-from"
            type="email"
            placeholder="your@address"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
            onFocus={() => setFocusedField('from')}
            onBlur={() => setFocusedField(null)}
            required
            style={{ ...sgInputStyle(focusedField === 'from'), flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="sg-mail-subject" style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '11px', color: '#8a9678', width: '56px', flexShrink: 0 }}>Subject:</label>
          <input
            id="sg-mail-subject"
            type="text"
            placeholder="What's this about?"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            onFocus={() => setFocusedField('subject')}
            onBlur={() => setFocusedField(null)}
            required
            style={{ ...sgInputStyle(focusedField === 'subject'), flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <label htmlFor="sg-mail-message" style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '11px', color: '#8a9678', width: '56px', flexShrink: 0, paddingTop: '10px' }}>Message:</label>
          <textarea
            id="sg-mail-message"
            placeholder="Write your letter here…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            required
            rows={5}
            style={{
              ...sgInputStyle(focusedField === 'message'),
              flex: 1,
              resize: 'vertical',
              minHeight: '120px',
              fontStyle: 'italic',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px', flexShrink: 0 }}>
          {sendError && (
            <div style={{ fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '12px', color: '#c0392b', alignSelf: 'center', flex: 1 }}>
              {sendError}
            </div>
          )}
          <button
            type="submit"
            disabled={sendStatus === 'sending'}
            style={{
              borderRadius: '999px',
              background: sendStatus === 'sending'
                ? 'rgba(74, 124, 89, 0.40)'
                : 'linear-gradient(135deg, #5a9268 0%, #3f6e4c 100%)',
              border: 'none',
              padding: '10px 20px',
              fontFamily: 'var(--dt-font-mono, monospace)',
              fontSize: '13px',
              color: '#fff',
              fontWeight: 500,
              cursor: sendStatus === 'sending' ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            {sendStatus === 'sending' ? 'sending…' : 'send ✉️'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Default Mail (non-Ghibli worlds) ─────────────────────────────────────

export default function Mail() {
  const [worldId, setWorldId] = useState(null);

  useEffect(() => createWorldChangeListener(setWorldId), []);

  if (worldId === 'ghibli') return <GhibliMail />;

  return <DefaultMail />;
}

function DefaultMail() {
  const [selected, setSelected] = useState('inbox');
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState({ from: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    if (!form.from || !form.subject || !form.message) return;
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.from,
          subject: form.subject,
          message: form.message,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sent');
        setTimeout(() => {
          setForm({ from: '', subject: '', message: '' });
          setStatus('idle');
          setError('');
        }, 3000);
      } else {
        setStatus('idle');
        setError(data.error || 'Failed to send. Try emailing directly: ' + (contact.email || 'manishsparihar@gmail.com'));
      }
    } catch {
      setStatus('idle');
      setError('Failed to send. Try emailing directly: ' + (contact.email || 'manishsparihar@gmail.com'));
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'var(--dt-font-mono, monospace)', color: TEXT_PRIMARY }}>
      {/* Sidebar */}
      <div style={{
        width: '180px',
        flexShrink: 0,
        borderRight: `1px solid ${GREEN_BORDER}`,
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <div style={{ padding: '0 12px 10px', color: TEXT_MUTED, fontSize: '11px', letterSpacing: '0.05em' }}>
          MAILBOXES
        </div>
        {MAILBOXES.map((mb) => (
          <div
            key={mb.id}
            onClick={() => setSelected(mb.id)}
            style={{
              padding: '7px 14px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: selected === mb.id ? GREEN_BG : 'transparent',
              borderLeft: selected === mb.id ? `2px solid ${GREEN}` : '2px solid transparent',
              color: selected === mb.id ? GREEN : TEXT_PRIMARY,
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{mb.icon} {mb.label}</span>
            {mb.count !== null && mb.count > 0 && (
              <span style={{
                background: 'var(--dt-accent-20)',
                color: GREEN,
                borderRadius: 'var(--dt-window-radius, 10px)',
                padding: '1px 6px',
                fontSize: '11px',
              }}>
                {mb.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selected === 'inbox' && (
          <div style={{ padding: '20px 24px' }}>
            {/* Email header */}
            <div style={{
              borderBottom: `1px solid ${GREEN_BORDER}`,
              paddingBottom: '14px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: TEXT_PRIMARY }}>
                Welcome! Let&apos;s connect
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: TEXT_MUTED }}>
                <div><span style={{ color: GREEN }}>From:</span> {portfolioData.contact?.email || 'manishsparihar@gmail.com'}</div>
                <div><span style={{ color: GREEN }}>To:</span> visitor@portfolio.os</div>
                <div><span style={{ color: GREEN }}>Date:</span> {today}</div>
              </div>
            </div>

            {/* Email body */}
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: TEXT_PRIMARY }}>
              <p>Hey there!</p>
              <br />
              <p>
                {portfolioData.bio}
              </p>
              <br />
              <p>
                Whether you have a project in mind, want to collaborate, or just want to say hi —
                I&apos;d love to hear from you. Feel free to compose a message using the sidebar.
              </p>
              <br />
              <p>
                You can also reach me at{' '}
                <span
                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                  style={{ color: GREEN, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {contact.email}
                </span>
              </p>
              <br />
              <p style={{ color: TEXT_MUTED }}>— {portfolioData.name}</p>
            </div>
          </div>
        )}

        {(selected === 'sent' || selected === 'drafts') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: TEXT_MUTED, fontSize: '13px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{selected === 'sent' ? '📤' : '📝'}</div>
              <div>{selected === 'sent' ? 'No sent messages.' : 'No drafts.'}</div>
            </div>
          </div>
        )}

        {selected === 'compose' && (
          <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '18px', letterSpacing: '0.05em' }}>
              NEW MESSAGE
            </div>
            <div className="world-divider" />

            {status === 'sent' ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}>
                <div style={{ fontSize: '36px' }}>✅</div>
                <div style={{ color: GREEN, fontSize: '14px' }}>Message sent successfully!</div>
                <div style={{ color: TEXT_MUTED, fontSize: '12px' }}>Resetting form…</div>
              </div>
            ) : (
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* To */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="mail-to" style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>To:</label>
                  <input
                    id="mail-to"
                    type="text"
                    value={contact.email || 'manishsparihar@gmail.com'}
                    readOnly
                    style={{ ...inputStyle(false), color: TEXT_MUTED, cursor: 'default', flex: 1 }}
                  />
                </div>

                {/* From */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="mail-from" style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>From:</label>
                  <input
                    id="mail-from"
                    type="email"
                    placeholder="your@email.com"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    onFocus={() => setFocusedField('from')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{ ...inputStyle(focusedField === 'from'), flex: 1 }}
                  />
                </div>

                {/* Subject */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="mail-subject" style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>Subject:</label>
                  <input
                    id="mail-subject"
                    type="text"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{ ...inputStyle(focusedField === 'subject'), flex: 1 }}
                  />
                </div>

                {/* Message */}
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <label htmlFor="mail-message" style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0, paddingTop: '8px' }}>Message:</label>
                  <textarea
                    id="mail-message"
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={5}
                    style={{
                      ...inputStyle(focusedField === 'message'),
                      flex: 1,
                      resize: 'vertical',
                      minHeight: '120px',
                    }}
                  />
                </div>

                {/* Send button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{
                      padding: '8px 20px',
                      background: status === 'sending' ? 'var(--dt-accent-dim)' : GREEN,
                      color: 'var(--dt-on-accent, #000)',
                      border: 'none',
                      borderRadius: 'var(--dt-radius-sm, 4px)',
                      fontFamily: 'var(--dt-font-mono, monospace)',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {status === 'sending' ? '⏳ Sending...' : '📨 Send'}
                  </button>
                </div>
                {error && (
                  <div style={{ color: 'var(--dt-accent)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>
                    {error}
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import portfolioData from '@/config/portfolio.json';

const GREEN = 'var(--dt-accent)';
const GREEN_BG = 'var(--dt-accent-soft-2)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const contact = portfolioData.contact || {};

const today = new Date().toDateString();

const MAILBOXES = [
  { id: 'inbox', label: '📥 Inbox', count: 1 },
  { id: 'sent', label: '📤 Sent', count: 0 },
  { id: 'drafts', label: '📝 Drafts', count: 0 },
  { id: 'compose', label: '✏️ Compose', count: null },
];

function inputStyle(focused) {
  return {
    width: '100%',
    background: focused ? 'var(--dt-accent-border-dim)' : 'var(--dt-surface-input)',
    border: `1px solid ${focused ? 'var(--dt-accent-dim)' : GREEN_BORDER}`,
    borderRadius: '4px',
    padding: '7px 10px',
    color: TEXT_PRIMARY,
    fontFamily: 'monospace',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  };
}

export default function Mail() {
  const [selected, setSelected] = useState('inbox');
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState({ from: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent
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
    <div style={{ display: 'flex', height: '100%', fontFamily: 'monospace', color: TEXT_PRIMARY }}>
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
            <span>{mb.label}</span>
            {mb.count !== null && mb.count > 0 && (
              <span style={{
                background: 'var(--dt-accent-20)',
                color: GREEN,
                borderRadius: '10px',
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
                <div><span style={{ color: GREEN }}>From:</span> manish@portfolio.os</div>
                <div><span style={{ color: GREEN }}>To:</span> visitor@portfolio.os</div>
                <div><span style={{ color: GREEN }}>Date:</span> {today}</div>
              </div>
            </div>

            {/* Email body */}
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: TEXT_PRIMARY }}>
              <p>Hey there!</p>
              <br />
              <p>
                Thanks for checking out my portfolio. I&apos;m Manish — a Full Stack &amp; AI Engineer
                based in India. I build things with Next.js, FastAPI, and a healthy dose of LLMs.
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
              <p style={{ color: TEXT_MUTED }}>— Manish</p>
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
                <div style={{ color: TEXT_MUTED, fontSize: '12px' }}>Resetting form...</div>
              </div>
            ) : (
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* To */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>To:</label>
                  <input
                    type="text"
                    value={contact.email || 'manishsparihar@gmail.com'}
                    readOnly
                    style={{ ...inputStyle(false), color: TEXT_MUTED, cursor: 'default', flex: 1 }}
                  />
                </div>

                {/* From */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>From:</label>
                  <input
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
                  <label style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0 }}>Subject:</label>
                  <input
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
                  <label style={{ color: GREEN, fontSize: '12px', width: '60px', flexShrink: 0, paddingTop: '8px' }}>Message:</label>
                  <textarea
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
                      color: '#000',
                      border: 'none',
                      borderRadius: '5px',
                      fontFamily: 'monospace',
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

'use client';

import { useState } from 'react';
import portfolioData from '@/config/portfolio.json';

export default function WebsiteContact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const contact = portfolioData.contact || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.message) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setErrorMsg(`Failed to send. Try emailing directly: ${contact.email}`);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-zinc-900/50">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8">Get in Touch</h2>

        {status === 'sent' ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">&#x2705;</div>
            <p className="text-zinc-300">Message sent! I&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-500 mb-1">Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-y"
                placeholder="Your message..."
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

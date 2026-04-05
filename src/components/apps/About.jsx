'use client';

import portfolioData from '@/config/portfolio.json';

const GREEN = 'var(--dt-accent)';
const GREEN_BORDER = 'var(--dt-accent-border)';
const GREEN_DIM = 'var(--dt-accent-dim)';
const TEXT_PRIMARY = 'var(--dt-text)';
const TEXT_MUTED = 'var(--dt-text-muted)';

const skills = portfolioData.skills || {};
const experience = portfolioData.experience || [];

const ASCII_MSP = `
 ███╗   ███╗███████╗██████╗
 ████╗ ████║██╔════╝██╔══██╗
 ██╔████╔██║███████╗██████╔╝
 ██║╚██╔╝██║╚════██║██╔═══╝
 ██║ ╚═╝ ██║███████║██║
 ╚═╝     ╚═╝╚══════╝╚═╝`.trim();

const INFO_LINES = [
  { label: 'OS', value: 'Portfolio OS 0.3.0' },
  { label: 'Host', value: 'manishsingh.tech' },
  { label: 'Kernel', value: 'Next.js 15' },
  { label: 'Shell', value: 'bash 5.0' },
  { label: 'Terminal', value: 'IBM Plex Mono' },
  { label: 'Name', value: 'Manish Singh Parihar' },
  { label: 'Role', value: 'Full Stack & AI Engineer' },
  { label: 'Location', value: 'India' },
  { label: 'Company', value: 'StringifyAI' },
  { label: 'Education', value: 'B.Sc. CS — VIT (2020-2024)' },
];

const SKILL_CATEGORIES = [
  { label: 'Languages', key: 'languages' },
  { label: 'Frameworks', key: 'frameworks' },
  { label: 'Tools', key: 'tools' },
  { label: 'AI / ML', key: 'ai_ml' },
];

function Tag({ children }) {
  return (
    <span style={{
      padding: '2px 8px',
      border: `1px solid ${GREEN_BORDER}`,
      borderRadius: '4px',
      fontSize: '11px',
      color: GREEN_DIM,
      fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export default function About() {
  return (
    <div style={{
      fontFamily: 'monospace',
      color: TEXT_PRIMARY,
      padding: '20px 24px',
      overflowY: 'auto',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Top section: ASCII + Info */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {/* ASCII art */}
        <pre style={{
          color: GREEN,
          fontSize: '9px',
          lineHeight: '1.2',
          margin: 0,
          fontFamily: 'monospace',
          flexShrink: 0,
          textShadow: `0 0 8px var(--dt-accent-border-dim)`,
        }}>
          {ASCII_MSP}
        </pre>

        {/* Info lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '240px' }}>
          {INFO_LINES.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <span style={{
                color: GREEN,
                minWidth: '90px',
                textAlign: 'right',
                flexShrink: 0,
                fontSize: '12px',
              }}>
                {label}:
              </span>
              <span style={{ color: TEXT_PRIMARY }}>{value}</span>
            </div>
          ))}

          {/* Color palette dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '98px' }}>
            {['#22c55e', '#16a34a', '#15803d', '#166534', '#1a2e1c', '#0f1a0f', '#e8f5e9', '#6b7a6e'].map((c) => (
              <div key={c} style={{
                width: '14px',
                height: '14px',
                borderRadius: '2px',
                background: c,
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${GREEN_BORDER}`, marginBottom: '20px' }} />

      {/* Skills section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: GREEN, fontSize: '12px', letterSpacing: '0.08em', marginBottom: '12px' }}>
          ▸ SKILLS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SKILL_CATEGORIES.map(({ label, key }) => {
            const items = skills[key] || [];
            return (
              <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{
                  color: GREEN,
                  fontSize: '11px',
                  minWidth: '90px',
                  paddingTop: '3px',
                  flexShrink: 0,
                }}>
                  {label}:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {items.map((skill) => <Tag key={skill}>{skill}</Tag>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${GREEN_BORDER}`, marginBottom: '20px' }} />

      {/* Experience section */}
      <div>
        <div style={{ color: GREEN, fontSize: '12px', letterSpacing: '0.08em', marginBottom: '12px' }}>
          ▸ EXPERIENCE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {experience.map((job, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px' }}>
              {/* Timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: GREEN,
                  marginTop: '4px',
                  boxShadow: `0 0 6px var(--dt-accent-dim)`,
                }} />
                {i < experience.length - 1 && (
                  <div style={{ width: '1px', flex: 1, background: GREEN_BORDER, marginTop: '4px' }} />
                )}
              </div>

              {/* Job details */}
              <div style={{ flex: 1, paddingBottom: i < experience.length - 1 ? '8px' : 0 }}>
                <div style={{ fontSize: '13px', color: TEXT_PRIMARY, marginBottom: '2px' }}>
                  <span style={{ color: GREEN }}>{job.position}</span>
                  <span style={{ color: TEXT_MUTED }}> @ </span>
                  <span>{job.company}</span>
                  <span style={{ color: TEXT_MUTED, marginLeft: '8px', fontSize: '11px' }}>
                    | {job.duration}
                  </span>
                </div>
                {job.description && (
                  <div style={{ color: TEXT_MUTED, fontSize: '12px', lineHeight: '1.6' }}>
                    {job.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

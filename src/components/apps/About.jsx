'use client';

import { useState, useEffect } from 'react';
import portfolioData from '@/config/portfolio.json';
import { getCurrentWorldId, createWorldChangeListener } from '@/config/worldContent';

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
      borderRadius: 'var(--dt-radius-sm, 4px)',
      fontSize: '11px',
      color: GREEN_DIM,
      fontFamily: 'var(--dt-font-mono, monospace)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function GhibliTag({ children }) {
  return (
    <span style={{
      padding: '3px 10px',
      border: '1px solid rgba(138, 116, 68, 0.30)',
      borderRadius: '999px',
      fontSize: '12px',
      color: 'var(--dt-text-muted)',
      fontFamily: 'var(--dt-font-body, Georgia, serif)',
      background: 'rgba(255, 255, 255, 0.35)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function GhibliSection({ title, children }) {
  return (
    <div style={{
      borderRadius: 'var(--dt-window-radius, 12px)',
      background: 'rgba(255, 255, 255, 0.30)',
      border: '1px solid rgba(255, 255, 255, 0.45)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{
        fontFamily: 'var(--dt-font-heading, Georgia, serif)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--dt-accent)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function GhibliAbout() {
  return (
    <div style={{
      fontFamily: 'var(--dt-font-body, Georgia, serif)',
      color: 'var(--dt-text)',
      padding: '24px 26px',
      overflowY: 'auto',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    }}>
      {/* Header */}
      <div style={{
        borderRadius: 'var(--dt-window-radius, 12px)',
        background: 'rgba(255, 255, 255, 0.30)',
        border: '1px solid rgba(255, 255, 255, 0.45)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{
          fontFamily: 'var(--dt-font-heading, Georgia, serif)',
          fontSize: '26px',
          fontStyle: 'italic',
          fontWeight: 400,
          color: 'var(--dt-text)',
          lineHeight: 1.1,
        }}>
          Manish Singh Parihar
        </div>
        <div style={{
          fontFamily: 'var(--dt-font-body, Georgia, serif)',
          fontSize: '14px',
          color: 'var(--dt-accent)',
        }}>
          Full Stack &amp; AI Engineer
        </div>
        <div style={{ height: '1px', background: 'rgba(138, 116, 68, 0.20)', margin: '6px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {INFO_LINES.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <span style={{
                fontFamily: 'var(--dt-font-body, Georgia, serif)',
                color: 'var(--dt-text-muted)',
                minWidth: '80px',
                flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{ color: 'var(--dt-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <GhibliSection title="Skills">
        {SKILL_CATEGORIES.map(({ label, key }) => {
          const items = skills[key] || [];
          return (
            <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--dt-font-body, Georgia, serif)',
                color: 'var(--dt-text-muted)',
                fontSize: '12px',
                minWidth: '80px',
                paddingTop: '4px',
                flexShrink: 0,
              }}>
                {label}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {items.map((skill) => <GhibliTag key={skill}>{skill}</GhibliTag>)}
              </div>
            </div>
          );
        })}
      </GhibliSection>

      {/* Experience */}
      <GhibliSection title="Experience">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {experience.map((job, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--dt-accent)',
                  marginTop: '5px',
                }} />
                {i < experience.length - 1 && (
                  <div style={{ width: '1px', flex: 1, background: 'rgba(138, 116, 68, 0.25)', marginTop: '4px' }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: i < experience.length - 1 ? '8px' : 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--dt-text)', marginBottom: '2px', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--dt-accent)' }}>{job.position}</span>
                  <span style={{ color: 'var(--dt-text-muted)' }}> at </span>
                  <span>{job.company}</span>
                  <span style={{ color: 'var(--dt-text-muted)', marginLeft: '8px', fontSize: '11px' }}>
                    {job.duration}
                  </span>
                </div>
                {job.description && (
                  <div style={{ color: 'var(--dt-text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
                    {job.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GhibliSection>
    </div>
  );
}

export default function About() {
  const [worldId, setWorldId] = useState(() => getCurrentWorldId());

  useEffect(() => createWorldChangeListener(setWorldId), []);

  if (worldId === 'ghibli') return <GhibliAbout />;

  return (
    <div style={{
      fontFamily: 'var(--dt-font-mono, monospace)',
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
          fontFamily: 'var(--dt-font-mono, monospace)',
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
            {['var(--dt-accent)', 'var(--dt-accent-hover)', 'var(--dt-accent-dim)', 'var(--dt-accent-70)', 'var(--dt-accent-45)', 'var(--dt-accent-30)', 'var(--dt-accent-20)', 'var(--dt-text-muted)'].map((c) => (
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

      <div className="world-divider" />
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

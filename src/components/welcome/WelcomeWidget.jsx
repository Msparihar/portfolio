'use client';

import Image from 'next/image';

const GLASS = {
  background: 'rgba(253, 250, 242, 0.90)',
  border: '1.5px solid rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 10px 24px rgba(75, 94, 61, 0.20)',
  borderRadius: 22,
  padding: 18,
};

function Label({ children }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'var(--font-geist, Geist, sans-serif)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 2,
      color: '#6f7e63',
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </span>
  );
}

function WeatherWidget({ data }) {
  return (
    <div style={{ ...GLASS, width: 212 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{data.icon}</span>
        <span style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 17,
          color: '#33442f',
        }}>{data.condition}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 40,
          fontWeight: 500,
          color: '#33442f',
          lineHeight: 1,
        }}>{data.temp}</span>
        <span style={{
          fontFamily: 'var(--font-geist, Geist, sans-serif)',
          fontSize: 11,
          color: '#52634a',
        }}>{data.sub}</span>
      </div>
    </div>
  );
}

function NowPlayingWidget({ data }) {
  return (
    <div style={{ ...GLASS, width: 268 }}>
      <Label>{data.label}</Label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #7fb08a, #4a7c59)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            color: '#f7f3e8',
          }}>♪</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-newsreader, Newsreader, serif)',
            fontSize: 16,
            color: '#33442f',
            marginBottom: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{data.song}</div>
          <div style={{
            fontFamily: 'var(--font-geist, Geist, sans-serif)',
            fontSize: 11,
            color: '#6f7e63',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{data.artist}</div>
        </div>
      </div>
      <div style={{
        height: 5, borderRadius: 999,
        background: 'rgba(51, 68, 47, 0.15)',
        marginBottom: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${data.progress}%`,
          background: '#4a7c59',
          borderRadius: 999,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-geist, Geist, sans-serif)', fontSize: 10, color: '#6f7e63' }}>{data.elapsed}</span>
        <span style={{ fontFamily: 'var(--font-geist, Geist, sans-serif)', fontSize: 10, color: '#6f7e63' }}>{data.duration}</span>
      </div>
    </div>
  );
}

function IntentionWidget({ data }) {
  return (
    <div style={{ ...GLASS, width: 212 }}>
      <Label>{data.label}</Label>
      <p style={{
        fontFamily: 'var(--font-newsreader, Newsreader, serif)',
        fontSize: 18,
        fontStyle: 'italic',
        color: '#33442f',
        lineHeight: 1.35,
        margin: '0 0 12px 0',
      }}>{data.quote}</p>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        background: 'rgba(74, 124, 89, 0.15)',
        padding: '5px 12px',
      }}>
        <span style={{ fontSize: 12 }}>🌱</span>
        <span style={{
          fontFamily: 'var(--font-geist, Geist, sans-serif)',
          fontSize: 12,
          fontWeight: 500,
          color: '#3f6e4c',
        }}>in progress</span>
      </div>
    </div>
  );
}

function MemoryWidget({ data }) {
  return (
    <div style={{ ...GLASS, width: 212, padding: 12 }}>
      <Label>{data.label}</Label>
      <div style={{
        width: '100%',
        height: 112,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
      }}>
        <Image
          src={data.imageSrc}
          alt={data.caption}
          fill
          sizes="212px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <p style={{
        fontFamily: 'var(--font-newsreader, Newsreader, serif)',
        fontSize: 13,
        fontStyle: 'italic',
        color: '#33442f',
        margin: 0,
      }}>{data.caption}</p>
    </div>
  );
}

export default function WelcomeWidget({ variant, data }) {
  if (variant === 'weather') return <WeatherWidget data={data} />;
  if (variant === 'nowPlaying') return <NowPlayingWidget data={data} />;
  if (variant === 'intention') return <IntentionWidget data={data} />;
  if (variant === 'memory') return <MemoryWidget data={data} />;
  return null;
}

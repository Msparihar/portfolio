'use client';

export default function PoemFooter({ text, style }) {
  if (!text) return null;
  return (
    <p
      style={{
        fontFamily: 'var(--font-newsreader), Georgia, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        fontWeight: 400,
        color: 'var(--sg-poem-footer)',
        textAlign: 'center',
        margin: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {text}
    </p>
  );
}

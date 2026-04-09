import Link from "next/link";

export default function NotFound() {
  return (
    <div className="desktop-canvas min-h-screen flex items-center justify-center" style={{ background: 'var(--dt-bg, #000)' }}>
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold" style={{ color: 'var(--dt-accent, #22c55e)', fontFamily: 'var(--dt-font-heading, monospace)' }}>404</h1>
        <h2 className="text-2xl" style={{ color: 'var(--dt-accent, #22c55e)', fontFamily: 'var(--dt-font-mono, monospace)' }}>
          $ command not found
        </h2>
        <p style={{ color: 'var(--dt-text-muted, #9ca3af)', fontFamily: 'var(--dt-font-mono, monospace)' }}>
          The page you&apos;re looking for doesn&apos;t exist in this directory.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 transition-colors"
            style={{
              background: 'var(--dt-accent-soft, rgba(34,197,94,0.2))',
              color: 'var(--dt-accent, #22c55e)',
              fontFamily: 'var(--dt-font-mono, monospace)',
              border: '1px solid var(--dt-accent-border, rgba(34,197,94,0.5))',
              borderRadius: 'var(--dt-radius-sm, 4px)',
            }}
          >
            $ cd ~
          </Link>
        </div>
      </div>
    </div>
  );
}

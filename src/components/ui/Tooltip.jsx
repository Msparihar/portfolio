'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';

/**
 * Shared theme-aware tooltip used across the desktop shell.
 * Themed via --dt-tooltip-* tokens (set in globals.css, may be overridden per world).
 *
 * Wrap the entire app in <TooltipProvider /> once (e.g. at Desktop root).
 * Then use <Tooltip content="...">...</Tooltip> per icon/button.
 */
export function TooltipProvider({ children, delayDuration = 300, skipDelayDuration = 100 }) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({
  content,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  asChild = true,
}) {
  if (disabled || content == null || content === '') {
    return children;
  }

  return (
    <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixTooltip.Trigger asChild={asChild}>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className="dt-tooltip-content"
          style={{
            background: 'var(--dt-tooltip-bg)',
            color: 'var(--dt-tooltip-text)',
            border: '1px solid var(--dt-tooltip-border)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 12,
            fontFamily: 'var(--dt-font-body, sans-serif)',
            lineHeight: 1.3,
            maxWidth: 260,
            boxShadow: 'var(--dt-shadow-focused, 0 4px 16px rgba(0,0,0,0.4))',
            zIndex: 500,
            userSelect: 'none',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {content}
          <RadixTooltip.Arrow
            width={10}
            height={5}
            style={{ fill: 'var(--dt-tooltip-bg)' }}
          />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export default Tooltip;

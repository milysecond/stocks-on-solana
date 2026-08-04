'use client';

import { type CSSProperties } from 'react';
import { ThinkingOrb, type OrbState, type OrbSize } from 'thinking-orbs';

type Props = {
  state?: OrbState;
  size?: OrbSize;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/** Brand loading indicator — https://orbs.jakubantalik.com */
export default function LoadingOrb({
  state = 'working',
  size = 64,
  label,
  className,
  style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size === 64 ? 14 : 6,
        ...style,
      }}
    >
      <ThinkingOrb state={state} size={size} theme="dark" aria-label={label || 'Loading'} />
      {label ? (
        <span
          style={{
            fontSize: size === 64 ? 11 : 9,
            letterSpacing: 2,
            color: '#666',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

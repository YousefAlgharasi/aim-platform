import type { CSSProperties } from 'react';

export type OrbState = 'idle' | 'speaking' | 'listening' | 'thinking';

/**
 * The animated AI teacher orb. Its motion shows whose turn it is. Decorative: the status text next to it is the
 * accessible version. While the microphone is open and nobody is talking, [level] (0..1) makes it swell with the
 * student's voice, so they can see they are being heard.
 */
export function VoiceOrb({ state, level = 0, className = '' }: { state: OrbState; level?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      data-live={level > 0 ? 'true' : undefined}
      className={`vr-orb ${className}`}
      style={{ ['--vr-level' as string]: level.toFixed(2) } as CSSProperties}
    />
  );
}

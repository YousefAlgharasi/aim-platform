export type OrbState = 'idle' | 'speaking' | 'listening' | 'thinking';

/** The animated AI teacher orb. Its motion shows whose turn it is. Decorative: the status text next to it is the accessible version. */
export function VoiceOrb({ state, className = '' }: { state: OrbState; className?: string }) {
  return <span aria-hidden="true" data-state={state} className={`vr-orb ${className}`} />;
}

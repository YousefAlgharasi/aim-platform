import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { getEngagementState, subscribeEngagement, type EngagementState } from './engagementStore';
import { isSoundEnabled, playSound, setSoundEnabled, subscribeSound, type SoundCue } from './sound';

export function useEngagement(): EngagementState {
  return useSyncExternalStore(subscribeEngagement, getEngagementState, getEngagementState);
}

/** [on, setOn] for the optional UI sound effects (saved on this device). */
export function useSoundSetting(): [boolean, (next: boolean) => void] {
  const on = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);
  return [on, setSoundEnabled];
}

/**
 * Play `cue` once each time `trigger` changes to a new non-empty value (e.g. the id of the answer that was
 * just checked). Re-renders and remounts with the same value stay silent.
 */
export function useSoundOn(cue: SoundCue | null, trigger: string | number | null | undefined) {
  const last = useRef<string | number | null | undefined>(undefined);
  useEffect(() => {
    if (trigger == null || trigger === '' || cue == null) { last.current = trigger; return; }
    if (last.current === trigger) return;
    last.current = trigger;
    playSound(cue);
  }, [cue, trigger]);
}

/** Stable callback for imperative use in event handlers. */
export function usePlaySound() {
  return useCallback((cue: SoundCue) => playSound(cue), []);
}

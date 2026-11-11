// AIM interaction layer: shared motion (motion.css), optional UI sounds, and the streak celebration.
// Tune timings in motion.css (:root --ix-*), tones in sound.ts (CUES), streak wording in streak.ts.
export { playSound, resultCue, holdUiSounds, trackLearningAudio, isSoundEnabled, setSoundEnabled } from './sound';
export type { SoundCue } from './sound';
export { useEngagement, useSoundOn, useSoundSetting, usePlaySound } from './hooks';
export { refreshEngagement, reportLearningCompleted } from './engagementStore';
export { StreakCelebrationHost, StreakFlame } from './StreakCelebration';
export { StreakBadge } from './StreakBadge';
export { SoundSwitch, SoundToggleButton } from './SoundToggle';
export { ResultIcon } from './ResultIcon';

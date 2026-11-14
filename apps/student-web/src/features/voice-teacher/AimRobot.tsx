import type { CSSProperties } from 'react';
import robot from '../../assets/robot/aim-robot.webp';

export type RobotState = 'idle' | 'speaking' | 'listening' | 'thinking';

/**
 * The AIM teacher robot. The picture is the robot with a blank face screen; the eyebrows, eyes and mouth are drawn on top
 * (coordinates are in the picture's own 658x760 pixels) so they can move: the eyes blink and glance around, and while it
 * speaks the mouth opens and closes and the brows lift. The body never moves. Its state also shows as a soft glow behind it
 * (blue while it speaks, red while it hears the student, a slow pulse while it thinks). While the microphone is open and
 * nobody talks, [level] (0..1) makes the glow follow the student's voice, so they can see they are being heard.
 */
export function AimRobot({ state, level = 0, className = '' }: { state: RobotState; level?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      data-live={level > 0 ? 'true' : undefined}
      className={`vr-robot ${className}`}
      style={{ ['--vr-level' as string]: level.toFixed(2) } as CSSProperties}
    >
      <span className="vr-body">
      <img src={robot} alt="" draggable={false} />
      <svg className="vr-face" viewBox="0 0 658 760" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g className="vr-brows">
          <path className="vr-brow vr-brow-a" d="M184 160 Q198 140 219 141" />
          <path className="vr-brow vr-brow-b" d="M322 121 Q338 107 355 112" />
        </g>
        <g className="vr-eyes">
          <path className="vr-eye vr-eye-a" d="M193 228 Q222 170 255 222" />
          <path className="vr-eye vr-eye-b" d="M323 194 Q346 138 372 184" />
        </g>
        <g className="vr-mouth-wrap">
          <path className="vr-mouth" d="M276 238 Q301 249 326 238 Q321 270 301 270 Q281 270 276 238 Z" />
        </g>
      </svg>
      </span>
    </span>
  );
}

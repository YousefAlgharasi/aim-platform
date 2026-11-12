import type { ReactNode } from 'react';
import type { Character } from '../dialogue/characters';

interface PresenterProps {
  guide: Character;
  children: ReactNode;
  /** The hello and finish cards stand the character a little taller. */
  large?: boolean;
}

/**
 * A student character beside a speech bubble. On a phone the character stands above the bubble; from tablet width
 * it stands beside it. The artwork is mirrored when needed so the character always faces its bubble.
 */
export function Presenter({ guide, large = false, children }: PresenterProps) {
  const flip = guide.faces !== 'right';
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
      <img
        src={guide.body}
        alt=""
        draggable={false}
        className={`block w-auto shrink-0 select-none self-start ${large ? 'h-52 sm:h-80' : 'h-40 sm:h-64'} ${flip ? 'scale-x-[-1] rtl:scale-x-100' : 'rtl:scale-x-[-1]'}`}
      />
      <div className="relative min-w-0 flex-1 rounded-3xl border-2 border-line-strong bg-surface p-5 sm:mb-8 sm:p-6">
        <span
          aria-hidden="true"
          className="absolute -top-[9px] start-14 size-4 rotate-45 border-l-2 border-t-2 border-line-strong bg-surface rtl:-rotate-45 rtl:border-l-0 rtl:border-r-2 sm:bottom-12 sm:top-auto sm:-start-[9px] sm:border-b-2 sm:border-t-0"
        />
        {children}
      </div>
    </div>
  );
}

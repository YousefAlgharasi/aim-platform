import { Markdown } from './Markdown';
import { Popover } from './Popover';
import { InfoIcon } from './Icons';

interface InfoPopoverButtonProps {
  /** Popover heading. */
  title: string;
  /** Accessible name of the icon button. */
  label: string;
  /** Text shown in the popover, exactly as stored. */
  text: string;
  /** 'onPrimary' for icons placed on the indigo/gradient surfaces. */
  tone?: 'default' | 'onPrimary';
}

/** Info icon that opens a small popover with a description, so the description itself isn't shown inline. */
export function InfoPopoverButton({ title, label, text, tone = 'default' }: InfoPopoverButtonProps) {
  const toneCls =
    tone === 'onPrimary'
      ? 'text-on-brand hover:text-white hover:bg-white/20 focus-visible:ring-surface'
      : 'text-ink-faint hover:text-brand-ink hover:bg-brand-soft focus-visible:ring-focus';
  return (
    <Popover
      title={title}
      renderTrigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          aria-label={label}
          className={`size-6 shrink-0 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 ${toneCls}`}
        >
          <InfoIcon className="size-[18px]" />
        </button>
      )}
    >
      <Markdown text={text} className="text-sm leading-relaxed text-ink-soft" />
    </Popover>
  );
}

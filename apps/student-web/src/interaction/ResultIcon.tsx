/** Result marks for answer feedback: a tick that draws itself, or a calm "not quite" mark. Decorative; pair with text. */
export function ResultIcon({ correct, className = 'size-7' }: { correct: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`ix-pop grid shrink-0 place-items-center rounded-full text-white ${correct ? 'bg-success' : 'bg-danger'} ${className}`}
    >
      <svg viewBox="0 0 12 12" fill="none" className="size-[58%]">
        {correct ? (
          <path className="ix-draw" pathLength={1} d="M2.5 6.2l2.4 2.4 4.6-4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3.4 3.4l5.2 5.2M8.6 3.4L3.4 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}

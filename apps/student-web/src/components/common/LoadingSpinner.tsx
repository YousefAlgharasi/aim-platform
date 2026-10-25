import { SpinnerIcon } from './Icons';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-10" role="status" aria-label="Loading">
      <SpinnerIcon className="size-9 text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}

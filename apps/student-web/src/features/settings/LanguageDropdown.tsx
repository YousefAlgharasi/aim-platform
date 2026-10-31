import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../../components/common/Button';
import { LANGUAGE_OPTIONS } from '../profile/profileApi';
import { ChevronDownIcon } from '../../components/common/Icons';

interface LanguageDropdownProps {
  value: 'en' | 'ar';
  onChange: (lang: 'en' | 'ar') => void;
  onSave: () => void;
  disabled: boolean;
  loading: boolean;
}

export function LanguageDropdown({ value, onChange, onSave, disabled, loading }: LanguageDropdownProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLabel = LANGUAGE_OPTIONS.find(o => o.value === value)?.label || value;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  async function handleSave() {
    onSave();
    setIsOpen(false);
  }

  const isSaveDisabled = disabled || loading;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentLabel}</span>
        <ChevronDownIcon className="size-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full start-0 end-0 mt-2 z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
          <ul className="list-none m-0 p-2 flex flex-col gap-1" role="listbox">
            {LANGUAGE_OPTIONS.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => onChange(option.value as 'en' | 'ar')}
                  className={`w-full px-3 py-2 rounded text-sm text-start transition-colors ${
                    value === option.value
                      ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200'
                  }`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-100 dark:border-slate-700 p-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={isSaveDisabled}
              className="w-full"
            >
              {loading ? t('Saving…') : t('Save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

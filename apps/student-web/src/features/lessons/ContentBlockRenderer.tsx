import { useI18n } from '../../i18n/I18nContext';
import { t as tr, plural } from '../../i18n';
import { AuthAudioPlayer } from './AuthAudioPlayer';
import { AudioPlayer } from '../../components/common/AudioPlayer';
import { fetchLessonAssetAudio, type LessonAsset } from './lessonsApi';

interface ContentBlockRendererProps {
  asset: LessonAsset;
  stepNumber: number;
}

const TYPE_LABEL: Record<string, string> = {
  text: 'Reading',
  image: 'Image',
  audio: 'Listening',
  video: 'Video',
  document: 'Document',
  vocabulary: 'Vocabulary',
  exercise: 'Exercise',
  external_reference: 'Reference',
};

const TYPE_ICON: Record<string, string> = {
  text: '📝',
  image: '🖼️',
  audio: '🎧',
  video: '▶️',
  document: '📄',
  vocabulary: '📖',
  exercise: '✅',
  external_reference: '🔗',
};

function typeLabel(type: string): string {
  const key = TYPE_LABEL[type];
  return key ? tr(key) : type;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return s ? tr('{m} min {s}s', { m, s }) : tr('{m} min', { m });
  return tr('{s}s', { s });
}

function metaNumber(asset: LessonAsset, key: string): number | null {
  const v = asset.metadata?.[key];
  return typeof v === 'number' ? Math.round(v) : null;
}

/**
 * Renders one published lesson asset (GET /curriculum/lesson-assets), mirroring
 * Flutter's LessonContentRenderer: every value is backend-supplied verbatim.
 */
export function ContentBlockRenderer({ asset, stepNumber }: ContentBlockRendererProps) {
  const { t } = useI18n();
  const meta: string[] = [typeLabel(asset.type)];
  if (asset.durationSeconds != null) meta.push(formatDuration(asset.durationSeconds));
  const words = asset.type === 'vocabulary' ? metaNumber(asset, 'wordCount') : null;
  if (words != null) meta.push(plural(words, { one: t('1 new word'), two: t('2 new words'), few: t('{n} new words', { n: words }), other: t('{n} new words', { n: words }) }));
  const items = asset.type === 'exercise' ? metaNumber(asset, 'itemCount') : null;
  if (items != null) meta.push(plural(items, { one: t('1 item'), two: t('2 items'), few: t('{n} items', { n: items }), other: t('{n} items', { n: items }) }));

  const script = asset.metadata?.script;
  const hasScript = typeof script === 'string' && script.trim().length > 0;

  return (
    <article className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm flex flex-col gap-3" aria-label={t('Step {n}: {title}', { n: stepNumber, title: asset.title })}>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-lg shrink-0" aria-hidden="true">{TYPE_ICON[asset.type] ?? '📎'}</span>
        <div className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t('Step {n} · {meta}', { n: stepNumber, meta: meta.join(' · ') })}</span>
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug m-0">{asset.title}</h3>
        </div>
      </div>

      {asset.description && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 m-0 whitespace-pre-wrap">{asset.description}</p>}

      {asset.type === 'image' && (
        asset.url ? (
          <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/60">
            <img src={asset.url} alt={asset.altText ?? asset.title} className="w-full h-auto block" loading="lazy" />
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">{t('Image unavailable for “{title}”.', { title: asset.title })}</p>
        )
      )}

      {asset.type === 'audio' && hasScript && (
        <AuthAudioPlayer load={() => fetchLessonAssetAudio(asset.id)} label={t('Listen')} />
      )}
      {asset.type === 'audio' && !hasScript && asset.url && (
        <AudioPlayer src={asset.url} preload="none" label={t('Listen')} />
      )}

      {asset.type === 'video' && asset.url && asset.mimeType?.startsWith('video/') && (
        <video controls src={asset.url} poster={asset.thumbnailUrl ?? undefined} className="w-full rounded-xl" preload="metadata" />
      )}

      {asset.url && asset.type !== 'image' && asset.type !== 'audio' &&
        !(asset.type === 'video' && asset.mimeType?.startsWith('video/')) && (
          <a href={asset.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center self-start h-10 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 text-sm font-bold no-underline hover:bg-indigo-100 dark:hover:bg-indigo-950">
            {t('Open {type} ↗', { type: TYPE_LABEL[asset.type] ? tr(TYPE_LABEL[asset.type]).toLowerCase() : t('resource') })}
          </a>
      )}
    </article>
  );
}

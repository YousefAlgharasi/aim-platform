import { AuthAudioPlayer } from './AuthAudioPlayer';
import { fetchLessonAssetAudio, type LessonAsset } from './lessonsApi';
import styles from './ContentBlock.module.css';

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min${s ? ` ${s}s` : ''}` : `${s}s`;
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
  const meta: string[] = [TYPE_LABEL[asset.type] ?? asset.type];
  if (asset.durationSeconds != null) meta.push(formatDuration(asset.durationSeconds));
  const words = asset.type === 'vocabulary' ? metaNumber(asset, 'wordCount') : null;
  if (words != null) meta.push(`${words} new words`);
  const items = asset.type === 'exercise' ? metaNumber(asset, 'itemCount') : null;
  if (items != null) meta.push(`${items} items`);

  const script = asset.metadata?.script;
  const hasScript = typeof script === 'string' && script.trim().length > 0;

  return (
    <article className={`${styles.block} ${styles.stepCard}`} aria-label={`Step ${stepNumber}: ${asset.title}`}>
      <div className={styles.stepHeader}>
        <span className={styles.stepIcon} aria-hidden="true">{TYPE_ICON[asset.type] ?? '📎'}</span>
        <div className={styles.stepHeading}>
          <span className={styles.stepMeta}>Step {stepNumber} · {meta.join(' · ')}</span>
          <h3 className={styles.stepTitle}>{asset.title}</h3>
        </div>
      </div>

      {asset.description && <p className={styles.textBlock}>{asset.description}</p>}

      {asset.type === 'image' && (
        asset.url ? (
          <div className={styles.imageBlock}>
            <img src={asset.url} alt={asset.altText ?? asset.title} className={styles.image} loading="lazy" />
          </div>
        ) : (
          <p className={styles.caption}>Image unavailable for “{asset.title}”.</p>
        )
      )}

      {asset.type === 'audio' && hasScript && (
        <AuthAudioPlayer load={() => fetchLessonAssetAudio(asset.id)} label="Listen" />
      )}
      {asset.type === 'audio' && !hasScript && asset.url && (
        <audio controls src={asset.url} className={styles.audio} preload="none" />
      )}

      {asset.type === 'video' && asset.url && asset.mimeType?.startsWith('video/') && (
        <video controls src={asset.url} poster={asset.thumbnailUrl ?? undefined} className={styles.video} preload="metadata" />
      )}

      {asset.url && asset.type !== 'image' && asset.type !== 'audio' &&
        !(asset.type === 'video' && asset.mimeType?.startsWith('video/')) && (
          <a href={asset.url} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
            Open {TYPE_LABEL[asset.type]?.toLowerCase() ?? 'resource'} ↗
          </a>
      )}
    </article>
  );
}

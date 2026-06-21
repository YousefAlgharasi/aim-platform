import type { ContentBlock } from './LessonPlayerShell';
import styles from './ContentBlock.module.css';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <div className={styles.block}>
          <p className={styles.textBlock}>{block.content}</p>
        </div>
      );

    case 'image':
      return (
        <div className={`${styles.block} ${styles.imageBlock}`}>
          <img
            src={block.content}
            alt={block.metadata?.alt || ''}
            className={styles.image}
            loading="lazy"
          />
          {block.metadata?.caption && (
            <span className={styles.caption}>{block.metadata.caption}</span>
          )}
        </div>
      );

    case 'video':
      return (
        <div className={`${styles.block} ${styles.videoBlock}`}>
          <iframe
            src={block.content}
            title={block.metadata?.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );

    case 'code':
      return (
        <div className={styles.block}>
          {block.metadata?.language && (
            <div className={styles.codeLang}>{block.metadata.language}</div>
          )}
          <pre className={styles.codeBlock}>
            <code>{block.content}</code>
          </pre>
        </div>
      );

    case 'callout':
      return (
        <div className={`${styles.block} ${styles.calloutBlock}`}>
          <span className={styles.calloutIcon} aria-hidden="true">💡</span>
          <span>{block.content}</span>
        </div>
      );

    case 'divider':
      return <hr className={styles.divider} />;

    default:
      return null;
  }
}

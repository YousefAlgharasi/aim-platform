import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { humanize, prettifySkillId, type RecommendationEntry } from '../../progress/aimApi';
import * as ui from './ui';

interface RecommendationWidgetProps {
  /** Active AIM recommendations, already ordered by rank by the backend. */
  recommendations: RecommendationEntry[];
  limit?: number;
}

export function RecommendationWidget({ recommendations, limit = 3 }: RecommendationWidgetProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No recommendations"
          message="Complete more lessons to get personalized recommendations."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={ui.cardTitle}>Recommended for you</h3>
          <Link to="/progress/recommendations" className={ui.link}>View all</Link>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {recommendations.slice(0, limit).map((rec) => (
            <li key={rec.id} className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-indigo-50 dark:bg-slate-900/40 dark:hover:bg-indigo-950/40">
              <Link
                to={rec.targetLessonId ? `/lessons/${rec.targetLessonId}` : '/progress/recommendations'}
                className="flex flex-col gap-0.5 no-underline"
              >
                <span className={ui.eyebrow}>{humanize(rec.kind)}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{prettifySkillId(rec.targetSkillId)}</span>
                <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{rec.reason}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

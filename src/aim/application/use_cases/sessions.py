"""Session attempt use cases."""

from __future__ import annotations

from typing import Sequence

from aim.application.errors import ValidationError
from aim.application.use_cases.goals import GoalUseCases
from aim.domain.services.performance_analyzer import AttemptRecord, PerformanceAnalyzer
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


class SessionUseCases:
    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow

    def record_attempts(
        self,
        session_id: str,
        attempts: Sequence[AttemptRecord],
    ) -> dict:
        if not attempts:
            raise ValidationError("No attempts provided.")

        mismatched = [attempt for attempt in attempts if attempt.session_id != session_id]
        if mismatched:
            raise ValidationError(
                f"{len(mismatched)} attempt(s) have a session_id that does not "
                f"match the URL parameter '{session_id}'."
            )

        analyzer = PerformanceAnalyzer(self._uow.attempts)
        analyzer.record_session_attempts(attempts)

        metrics_summary = []
        for student_id, skill_id in {(a.student_id, a.skill_id) for a in attempts}:
            metrics = analyzer.calculate_all_metrics(student_id, skill_id)
            metrics_summary.append(
                {
                    "student_id": metrics.student_id,
                    "skill_id": metrics.skill_id,
                    "accuracy": metrics.accuracy,
                    "avg_speed": metrics.avg_speed,
                    "retry_rate": metrics.retry_rate,
                    "hesitation_index": metrics.hesitation_index,
                }
            )
            GoalUseCases(self._uow).refresh_goals(
                student_id,
                current_skill_id=skill_id,
                commit=False,
            )

        self._uow.commit()
        return {
            "session_id": session_id,
            "attempts_saved": len(attempts),
            "metrics_updated": metrics_summary,
        }

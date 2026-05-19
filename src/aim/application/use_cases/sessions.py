"""Session attempt use cases."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Sequence

from aim.application.errors import ValidationError
from aim.application.use_cases.goals import GoalUseCases
from aim.domain.services.calibration import CalibrationStub
from aim.domain.services.difficulty_adapter import DifficultyAdapter
from aim.domain.services.error_pattern_classifier import (
    ErrorAttempt,
    ErrorPatternClassifier,
)
from aim.domain.services.emotional_state_detector import (
    EmotionalAttempt,
    EmotionalStateDetector,
)
from aim.domain.services.mastery_calculator import MasteryCalculator
from aim.domain.services.performance_analyzer import AttemptRecord, PerformanceAnalyzer
from aim.domain.services.prompt_adaptation_generator import (
    PromptAdaptationGenerator,
    PromptLearnerState,
)
from aim.domain.services.recommendation_engine import RecommendationEngine
from aim.domain.services.retention_tracker import RetentionTracker
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.infrastructure.skill_graph import SkillGraph


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

        skills_touched = sorted({(a.student_id, a.skill_id) for a in attempts})
        previous_state = {}
        for student_id, skill_id in skills_touched:
            state = self._uow.students.get_skill_state(
                student_id,
                skill_id,
            )
            previous_state[(student_id, skill_id)] = {
                "mastery": state.mastery if state is not None else 0.0,
                "confidence": state.confidence if state is not None else 0.0,
                "current_difficulty": state.current_difficulty
                if state is not None
                else 1,
                "avg_speed": state.avg_speed
                if state is not None and state.avg_speed > 0
                else None,
            }

        analyzer = PerformanceAnalyzer(self._uow.attempts)
        analyzer.record_session_attempts(attempts)
        mastery_calculator = MasteryCalculator(
            attempt_repo=self._uow.attempts,
            state_repo=self._uow.attempts,
            calibration=CalibrationStub(),
        )
        weakness_detector = WeaknessDetector()
        error_classifier = ErrorPatternClassifier()
        emotional_detector = EmotionalStateDetector()
        difficulty_adapter = DifficultyAdapter()
        retention_tracker = RetentionTracker(self._uow.retention)
        recommendation_engine = RecommendationEngine(self._uow.recommendation_context)
        prompt_generator = PromptAdaptationGenerator()
        skill_graph = SkillGraph()

        metrics_summary = []
        adaptive_results = []
        lesson_attempt_inputs = {}
        for student_id, skill_id in skills_touched:
            completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
            prior_state = previous_state[(student_id, skill_id)]
            prior_mastery = float(prior_state["mastery"])
            prior_confidence = float(prior_state["confidence"])
            prior_difficulty = int(prior_state["current_difficulty"])
            prior_avg_speed = prior_state["avg_speed"]
            metrics = analyzer.calculate_all_metrics(student_id, skill_id)
            mastery_result = mastery_calculator.calculate(student_id, skill_id)
            self._uow.mastery_history.add_from_result(mastery_result)
            skill_attempts = self._uow.attempts.get_attempts(student_id, skill_id)
            weakness = weakness_detector.calculate_skill_weakness(
                [
                    WeaknessAttempt(
                        student_id=attempt.student_id,
                        skill_id=attempt.skill_id,
                        is_correct=attempt.is_correct,
                        difficulty=attempt.difficulty,
                        skip=attempt.skip,
                    )
                    for attempt in skill_attempts
                ],
                skill_id,
            )
            self._uow.weakness.save_and_update_state(
                student_id=student_id,
                weakness=weakness,
            )
            error_pattern = error_classifier.classify(
                [
                    ErrorAttempt(
                        student_id=attempt.student_id,
                        skill_id=attempt.skill_id,
                        question_id=attempt.question_id,
                        is_correct=attempt.is_correct,
                        question_subtype=attempt.question_id.split(":")[0]
                        if ":" in attempt.question_id
                        else None,
                        is_timed=False,
                        session_position=attempt.session_position,
                        skip=attempt.skip,
                    )
                    for attempt in skill_attempts
                ]
            )
            error_pattern_record = self._uow.error_patterns.add_record(
                student_id=student_id,
                skill_id=skill_id,
                result=error_pattern,
            )
            error_pattern_type = error_pattern_record.pattern_type
            session_attempts = [
                attempt for attempt in attempts
                if attempt.student_id == student_id and attempt.skill_id == skill_id
            ]
            emotional_result = emotional_detector.detect(
                [
                    EmotionalAttempt(
                        question_id=attempt.question_id,
                        is_correct=attempt.is_correct,
                        response_time=attempt.response_time,
                        previously_correct=prior_mastery >= 70.0,
                        skip=attempt.skip,
                    )
                    for attempt in session_attempts
                ],
                historical_avg_speed=prior_avg_speed,
            )
            self._uow.students.update_frustration_score(
                student_id,
                skill_id,
                emotional_result.frustration_score,
            )
            retention_result = retention_tracker.update_after_session(
                student_id,
                skill_id,
                mastery_result.mastery,
            )
            difficulty_decision = difficulty_adapter.decide(
                mastery=mastery_result.mastery,
                confidence=prior_confidence,
                consistency=mastery_result.consistency_score,
                current_difficulty=prior_difficulty,
            )
            self._uow.students.update_difficulty_state(
                student_id,
                skill_id,
                consistency=mastery_result.consistency_score,
                current_difficulty=difficulty_decision.target_difficulty,
            )
            prerequisite_gaps = self._sync_prerequisite_gaps(
                student_id,
                skill_id,
                skill_graph,
            )
            recommendation = recommendation_engine.get_next_action(student_id)
            recommendation_log = self._uow.recommendation_logger.log(recommendation)
            prompt_instruction = prompt_generator.generate(
                student_id=student_id,
                lesson_id=session_id,
                skill_id=skill_id,
                recommendation=recommendation,
                learner_state=PromptLearnerState(
                    mastery=mastery_result.mastery,
                    retention=retention_result.retention,
                    weakness_score=weakness.weakness_score,
                    frustration_score=emotional_result.frustration_score,
                    error_pattern_type=error_pattern_type,
                    current_difficulty=difficulty_decision.target_difficulty,
                    missing_prerequisites=recommendation.inputs_snapshot.get(
                        "missing_prerequisites",
                        [],
                    ),
                ),
            )
            prompt_row = self._uow.prompt_adaptations.add_instruction(
                prompt_instruction
            )
            lesson_input = lesson_attempt_inputs.setdefault(
                student_id,
                {
                    "started_at": completed_at,
                    "ended_at": completed_at,
                    "scores": [],
                    "frustration_scores": [],
                    "recommendation_id": recommendation_log.id,
                },
            )
            lesson_input["ended_at"] = max(lesson_input["ended_at"], completed_at)
            lesson_input["scores"].append(metrics.accuracy)
            lesson_input["frustration_scores"].append(
                emotional_result.frustration_score
            )
            updated_state = self._uow.students.get_skill_state(student_id, skill_id)
            adaptive_result = {
                "updated_skill_state": self._serialize_skill_state(updated_state),
                "performance_metrics": self._serialize_performance_metrics(metrics),
                "mastery_result": self._serialize_mastery_result(mastery_result),
                "weakness_result": self._serialize_weakness_result(weakness),
                "error_pattern": self._serialize_error_pattern(
                    error_pattern,
                    error_pattern_type,
                ),
                "frustration_score": emotional_result.frustration_score,
                "retention_result": self._serialize_retention_result(retention_result),
                "difficulty_decision": self._serialize_difficulty_decision(
                    difficulty_decision
                ),
                "recommendation": self._serialize_recommendation(
                    recommendation,
                    recommendation_log.id,
                ),
                "prompt_adaptation_instruction": (
                    self._serialize_prompt_instruction(prompt_instruction, prompt_row.id)
                ),
                "prerequisite_gaps": [
                    self._serialize_prerequisite_gap(gap)
                    for gap in prerequisite_gaps
                ],
            }
            adaptive_results.append(adaptive_result)
            metrics_summary.append(
                {
                    "student_id": metrics.student_id,
                    "skill_id": metrics.skill_id,
                    "accuracy": metrics.accuracy,
                    "avg_speed": metrics.avg_speed,
                    "retry_rate": metrics.retry_rate,
                    "hesitation_index": metrics.hesitation_index,
                    "retention": retention_result.retention,
                    "retention_due_at": retention_result.due_at.isoformat(),
                    "review_priority": retention_result.review_priority,
                }
            )
            GoalUseCases(self._uow).refresh_goals(
                student_id,
                current_skill_id=skill_id,
                commit=False,
            )

        lesson_attempt_rows = []
        for student_id, values in lesson_attempt_inputs.items():
            lesson_attempt_rows.append(
                self._uow.learning_history.add_lesson_attempt(
                    student_id=student_id,
                    lesson_id=session_id,
                    course_id=None,
                    started_at=values["started_at"],
                    ended_at=values["ended_at"],
                    completed=True,
                    early_exit=False,
                    score=round(
                        sum(values["scores"]) / len(values["scores"]),
                        2,
                    ),
                    frustration_score=max(values["frustration_scores"]),
                    recommendation_id=values["recommendation_id"],
                )
            )

        self._uow.commit()
        return {
            "session_id": session_id,
            "attempts_saved": len(attempts),
            "metrics_updated": metrics_summary,
            "adaptive_results": adaptive_results,
            "lesson_attempts": [
                self._serialize_lesson_attempt(row)
                for row in lesson_attempt_rows
            ],
            **(adaptive_results[0] if adaptive_results else {}),
        }

    def _sync_prerequisite_gaps(
        self,
        student_id: int,
        skill_id: str,
        skill_graph: SkillGraph,
    ) -> list:
        if skill_id not in skill_graph:
            return []

        states = {
            state.skill_id: state.mastery
            for state in self._uow.students.list_skill_states(student_id)
        }
        open_gaps = []
        for prereq in skill_graph.get_prerequisites(skill_id):
            prereq_id = prereq["skill_id"]
            prereq_mastery = float(states.get(prereq_id, 0.0))
            if prereq_mastery < skill_graph.MASTERY_THRESHOLD:
                severity = round(skill_graph.MASTERY_THRESHOLD - prereq_mastery, 2)
                open_gaps.append(
                    self._uow.prerequisite_gaps.upsert_open_gap(
                        student_id=student_id,
                        skill_id=skill_id,
                        missing_prerequisite_skill_id=prereq_id,
                        severity=severity,
                    )
                )
            else:
                self._uow.prerequisite_gaps.resolve_gap(
                    student_id=student_id,
                    skill_id=skill_id,
                    missing_prerequisite_skill_id=prereq_id,
                )
        return open_gaps

    @staticmethod
    def _serialize_performance_metrics(metrics) -> dict:
        return {
            "student_id": metrics.student_id,
            "skill_id": metrics.skill_id,
            "accuracy": metrics.accuracy,
            "avg_speed": metrics.avg_speed,
            "retry_rate": metrics.retry_rate,
            "hesitation_index": metrics.hesitation_index,
        }

    @staticmethod
    def _serialize_mastery_result(result) -> dict:
        return {
            "student_id": result.student_id,
            "skill_id": result.skill_id,
            "mastery": result.mastery,
            "accuracy": result.accuracy_score,
            "speed_score": result.speed_score,
            "consistency": result.consistency_score,
            "retention": result.retention_score,
            "difficulty_performance": result.difficulty_score,
            "attempt_count": result.attempt_count,
        }

    @staticmethod
    def _serialize_weakness_result(weakness) -> dict:
        return {
            "skill_id": weakness.skill_id,
            "weakness_score": weakness.weakness_score,
            "error_frequency": weakness.error_frequency,
            "difficulty_weight": weakness.difficulty_weight,
            "repeated_mistakes": weakness.repeated_mistakes,
        }

    @staticmethod
    def _serialize_error_pattern(error_pattern, pattern_type: str) -> dict:
        return {
            "pattern_type": pattern_type,
            "treatment_recommendation": error_pattern.treatment_recommendation,
            "accuracy": error_pattern.accuracy,
            "attempts_analyzed": error_pattern.attempts_analyzed,
            "evidence": dict(error_pattern.evidence),
        }

    @staticmethod
    def _serialize_retention_result(result) -> dict:
        return {
            "student_id": result.student_id,
            "skill_id": result.skill_id,
            "due_at": result.due_at.isoformat(),
            "retention": result.retention,
            "retention_lambda": result.retention_lambda,
            "review_priority": result.review_priority,
            "is_due": result.is_due,
        }

    @staticmethod
    def _serialize_difficulty_decision(decision) -> dict:
        return {
            "action": decision.action.value,
            "score": decision.score,
            "current_difficulty": decision.current_difficulty,
            "target_difficulty": decision.target_difficulty,
        }

    @staticmethod
    def _serialize_recommendation(recommendation, recommendation_id: int) -> dict:
        return {
            "id": recommendation_id,
            "student_id": recommendation.student_id,
            "action_type": recommendation.action_type.value,
            "skill_id": recommendation.skill_id,
            "difficulty": recommendation.difficulty,
            "reason": recommendation.reason,
            "inputs_snapshot": dict(recommendation.inputs_snapshot),
        }

    @staticmethod
    def _serialize_prompt_instruction(prompt_instruction, instruction_id: int) -> dict:
        return {
            "id": instruction_id,
            "student_id": prompt_instruction.student_id,
            "lesson_id": prompt_instruction.lesson_id,
            "skill_id": prompt_instruction.skill_id,
            "tone": prompt_instruction.tone,
            "difficulty": prompt_instruction.difficulty,
            "teaching_strategy": prompt_instruction.teaching_strategy,
            "focus_weaknesses": list(prompt_instruction.focus_weaknesses),
            "avoid_patterns": list(prompt_instruction.avoid_patterns),
            "micro_goal": prompt_instruction.micro_goal,
            "instruction_text": prompt_instruction.instruction_text,
        }

    @staticmethod
    def _serialize_skill_state(state) -> dict | None:
        if state is None:
            return None
        return {
            "id": state.id,
            "student_id": state.student_id,
            "skill_id": state.skill_id,
            "mastery": state.mastery,
            "confidence": state.confidence,
            "attempts": state.attempts,
            "avg_speed": state.avg_speed,
            "retry_rate": state.retry_rate,
            "hesitation_index": state.hesitation_index,
            "consistency": state.consistency,
            "current_difficulty": state.current_difficulty,
            "retention": state.retention,
            "retention_lambda": state.retention_lambda,
            "review_due": state.review_due,
            "weakness_score": state.weakness_score,
            "frustration_score": state.frustration_score,
            "last_reviewed_at": (
                state.last_reviewed_at.isoformat()
                if state.last_reviewed_at is not None
                else None
            ),
        }

    @staticmethod
    def _serialize_lesson_attempt(row) -> dict:
        return {
            "id": row.id,
            "student_id": row.student_id,
            "lesson_id": row.lesson_id,
            "course_id": row.course_id,
            "started_at": row.started_at.isoformat(),
            "ended_at": row.ended_at.isoformat(),
            "completed": row.completed,
            "early_exit": row.early_exit,
            "score": row.score,
            "frustration_score": row.frustration_score,
            "recommendation_id": row.recommendation_id,
        }

    @staticmethod
    def _serialize_prerequisite_gap(row) -> dict:
        return {
            "id": row.id,
            "student_id": row.student_id,
            "skill_id": row.skill_id,
            "missing_prerequisite_skill_id": row.missing_prerequisite_skill_id,
            "severity": row.severity,
            "status": row.status,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "resolved_at": row.resolved_at.isoformat() if row.resolved_at else None,
        }

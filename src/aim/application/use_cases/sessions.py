"""Session attempt use cases."""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timezone
from typing import Sequence

from aim.application.errors import ValidationError
from aim.application.use_cases.goals import GoalUseCases
from aim.domain.services.calibration import CalibrationStub
from aim.domain.services.difficulty_adapter import DifficultyAdapter
from aim.domain.services.decision_conflict_resolver import (
    DecisionConflictInput,
    DecisionConflictResolver,
)
from aim.domain.services.error_pattern_classifier import (
    ErrorAttempt,
    ErrorPatternClassifier,
)
from aim.domain.services.emotional_state_detector import (
    EmotionalAttempt,
    EmotionalStateDetector,
)
from aim.domain.services.evidence_quality_engine import (
    EvidenceQualityEngine,
    EvidenceQualityInput,
)
from aim.domain.services.fairness_audit_engine import (
    FairnessAuditEngine,
    FairnessAuditInput,
)
from aim.domain.services.learning_response_pattern_detector import (
    LearningPatternAttempt,
    LearningResponsePatternDetector,
)
from aim.domain.services.mastery_calculator import MasteryCalculator
from aim.domain.services.performance_analyzer import AttemptRecord, PerformanceAnalyzer
from aim.domain.services.prompt_adaptation_generator import (
    PromptAdaptationGenerator,
    PromptLearnerState,
)
from aim.domain.services.recommendation_engine import RecommendationEngine
from aim.domain.services.question_quality_analyzer import (
    QuestionQualityAnalyzer,
    QuestionQualityInput,
)
from aim.domain.services.reliability_engine import ReliabilityEngine
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
                "retention": state.retention if state is not None else 100.0,
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
        evidence_quality_engine = EvidenceQualityEngine()
        fairness_audit_engine = FairnessAuditEngine()
        learning_pattern_detector = LearningResponsePatternDetector()
        question_quality_analyzer = QuestionQualityAnalyzer()
        reliability_engine = ReliabilityEngine()
        conflict_resolver = DecisionConflictResolver()
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
            skill_attempts = self._uow.attempts.get_attempts(student_id, skill_id)
            session_attempts = [
                attempt for attempt in attempts
                if attempt.student_id == student_id and attempt.skill_id == skill_id
            ]
            question_quality_results = []
            question_quality_by_id = {}
            for question_id in sorted({attempt.question_id for attempt in session_attempts}):
                question_attempts = [
                    attempt for attempt in session_attempts
                    if attempt.question_id == question_id
                ]
                valid_question_attempts = [
                    attempt for attempt in question_attempts
                    if not attempt.skip
                ]
                total = len(question_attempts)
                valid_total = len(valid_question_attempts)
                question_error_rate = (
                    sum(1 for attempt in valid_question_attempts if not attempt.is_correct)
                    / valid_total
                    if valid_total
                    else 1.0
                )
                question_quality = question_quality_analyzer.analyze(
                    QuestionQualityInput(
                        question_id=question_id,
                        question_error_rate=question_error_rate,
                        avg_response_time=(
                            sum(attempt.response_time for attempt in valid_question_attempts)
                            / valid_total
                            if valid_total
                            else 0.0
                        ),
                        hint_usage_rate=(
                            sum(1 for attempt in valid_question_attempts if attempt.hint_used)
                            / valid_total
                            if valid_total
                            else 0.0
                        ),
                        skip_rate=(
                            sum(1 for attempt in question_attempts if attempt.skip) / total
                            if total
                            else 0.0
                        ),
                        discrimination_index=0.5,
                    )
                )
                question_quality_results.append(question_quality)
                question_quality_by_id[question_id] = question_quality.quality_score
                self._uow.question_quality.upsert_result(question_quality)

            evidence_quality_result = evidence_quality_engine.score_session(
                EvidenceQualityInput(
                    is_correct=attempt.is_correct,
                    difficulty=attempt.difficulty,
                    hint_used=attempt.hint_used,
                    retry_count=max(0, attempt.attempts - 1),
                    skip=attempt.skip,
                    question_quality_score=question_quality_by_id.get(
                        attempt.question_id,
                        100.0,
                    ),
                )
                for attempt in session_attempts
            )
            reliability_result = reliability_engine.calculate(
                sum(1 for attempt in session_attempts if not attempt.skip)
            )
            mastery_result = mastery_calculator.calculate(
                student_id,
                skill_id,
                evidence_quality_score=evidence_quality_result.evidence_quality_score,
            )
            self._uow.mastery_history.add_from_result(mastery_result)
            weakness = weakness_detector.calculate_skill_weakness(
                [
                    WeaknessAttempt(
                        student_id=attempt.student_id,
                        skill_id=attempt.skill_id,
                        is_correct=attempt.is_correct,
                        difficulty=attempt.difficulty,
                        skip=attempt.skip,
                        hint_used=attempt.hint_used,
                        attempts=attempt.attempts,
                    )
                    for attempt in skill_attempts
                ],
                skill_id,
                hesitation_index=metrics.hesitation_index,
                retention_drop=max(0.0, prior_state.get("retention", 100.0) - mastery_result.retention_score)
                if "retention" in prior_state
                else 0.0,
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
            emotional_result = emotional_detector.detect(
                [
                    EmotionalAttempt(
                        question_id=attempt.question_id,
                        is_correct=attempt.is_correct,
                        response_time=attempt.response_time,
                        previously_correct=prior_mastery >= 70.0,
                        skip=attempt.skip,
                        hint_used=attempt.hint_used,
                        attempts=attempt.attempts,
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
            learning_pattern = learning_pattern_detector.detect(
                [
                    LearningPatternAttempt(
                        is_correct=attempt.is_correct,
                        response_time=attempt.response_time,
                        hint_used=attempt.hint_used,
                        attempts=attempt.attempts,
                        difficulty=attempt.difficulty,
                        question_subtype=attempt.question_id.split(":")[0]
                        if ":" in attempt.question_id
                        else None,
                    )
                    for attempt in session_attempts
                    if not attempt.skip
                ],
                mastery=mastery_result.mastery,
                confidence_score=prior_confidence,
            )
            self._uow.learning_response_patterns.add_result(
                student_id=student_id,
                skill_id=skill_id,
                result=learning_pattern,
            )
            self._uow.students.update_learning_state(
                student_id,
                skill_id,
                reliability=reliability_result.reliability,
                hint_usage_rate=metrics.hint_usage_rate,
                skip_rate=metrics.skip_rate,
                learning_response_pattern=learning_pattern.learning_response_pattern,
            )
            difficulty_decision = difficulty_adapter.decide(
                mastery=mastery_result.mastery,
                confidence=prior_confidence,
                consistency=mastery_result.consistency_score,
                reliability=reliability_result.reliability,
                weakness_score=weakness.weakness_score,
                frustration_score=emotional_result.frustration_score,
                retention=retention_result.retention,
                repeated_failure_count=self._recent_failure_count(session_attempts),
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
            fairness_result = fairness_audit_engine.audit(
                FairnessAuditInput(
                    accuracy_score=mastery_result.accuracy_score,
                    avg_response_time=metrics.avg_speed,
                    response_time_used_in_mastery=False,
                    mastery_delta=mastery_result.mastery - prior_mastery,
                    reliability=reliability_result.reliability,
                    evidence_quality_score=mastery_result.evidence_quality_score,
                    difficulty_action=difficulty_decision.action.value,
                    question_quality_score=(
                        sum(result.quality_score for result in question_quality_results)
                        / len(question_quality_results)
                        if question_quality_results
                        else 100.0
                    ),
                )
            )
            self._uow.fairness_audits.add_result(
                student_id=student_id,
                skill_id=skill_id,
                result=fairness_result,
            )
            conflict_result = conflict_resolver.resolve(
                DecisionConflictInput(
                    frustration_score=emotional_result.frustration_score,
                    emotional_signal=emotional_result.emotional_signal,
                    prerequisite_gap_score=max(
                        [gap.severity for gap in prerequisite_gaps],
                        default=0.0,
                    ),
                    weakness_score=weakness.weakness_score,
                    error_pattern_type=error_pattern_type,
                    retention=retention_result.retention,
                    confidence_mismatch=(
                        prior_confidence >= 80.0 and mastery_result.mastery < 60.0
                    ),
                    difficulty_action=difficulty_decision.action.value,
                    transfer_category=None,
                    current_skill_id=skill_id,
                    prerequisite_skill_id=(
                        prerequisite_gaps[0].missing_prerequisite_skill_id
                        if prerequisite_gaps
                        else None
                    ),
                )
            )
            recommendation = recommendation_engine.get_next_action(student_id)
            recommendation = replace(
                recommendation,
                evidence={
                    **recommendation.evidence,
                    "fairness_warnings": fairness_result.fairness_warnings,
                    "conflict_resolution": conflict_result.evidence,
                },
                inputs_snapshot={
                    **recommendation.inputs_snapshot,
                    "fairness_risk_level": fairness_result.fairness_risk_level,
                    "decision_priority": conflict_result.final_priority,
                },
                decision_priority=conflict_result.final_priority,
            )
            recommendation_log = self._uow.recommendation_logger.log(recommendation)
            self._uow.explanation_logs.add_log(
                student_id=student_id,
                skill_id=skill_id,
                decision_type="mastery_and_recommendation",
                explanation=mastery_result.explanation,
                evidence={
                    "mastery": self._serialize_mastery_result(mastery_result),
                    "recommendation": recommendation.reason,
                    "fairness": fairness_result.evidence,
                    "conflict": conflict_result.evidence,
                },
            )
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
                "safe_emotional_signal": self._serialize_emotional_result(
                    emotional_result
                ),
                "retention_result": self._serialize_retention_result(retention_result),
                "evidence_quality": self._serialize_evidence_quality(
                    evidence_quality_result
                ),
                "reliability": self._serialize_reliability(reliability_result),
                "question_quality": [
                    self._serialize_question_quality(result)
                    for result in question_quality_results
                ],
                "learning_response_pattern": self._serialize_learning_pattern(
                    learning_pattern
                ),
                "fairness_audit": self._serialize_fairness_audit(fairness_result),
                "decision_conflict": self._serialize_conflict_result(conflict_result),
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
                    "hint_usage_rate": metrics.hint_usage_rate,
                    "skip_rate": metrics.skip_rate,
                    "hesitation_index": metrics.hesitation_index,
                    "difficulty_performance": metrics.difficulty_performance,
                    "consistency": metrics.consistency,
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

    @staticmethod
    def _recent_failure_count(attempts: Sequence[AttemptRecord]) -> int:
        streak = 0
        for attempt in reversed(list(attempts)):
            if attempt.skip:
                continue
            if not attempt.is_correct:
                streak += 1
            else:
                break
        return streak

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
            "hint_usage_rate": metrics.hint_usage_rate,
            "skip_rate": metrics.skip_rate,
            "hesitation_index": metrics.hesitation_index,
            "difficulty_performance": metrics.difficulty_performance,
            "consistency": metrics.consistency,
        }

    @staticmethod
    def _serialize_mastery_result(result) -> dict:
        return {
            "student_id": result.student_id,
            "skill_id": result.skill_id,
            "mastery": result.mastery,
            "previous_mastery": result.previous_mastery,
            "mastery_raw": result.mastery_raw,
            "mastery_adjusted": result.mastery_adjusted,
            "final_mastery": result.final_mastery,
            "reliability": result.reliability,
            "decision_confidence": result.decision_confidence,
            "accuracy": result.accuracy_score,
            "accuracy_score": result.accuracy_score,
            "consistency": result.consistency_score,
            "retention": result.retention_score,
            "difficulty_performance": result.difficulty_score,
            "difficulty_performance_score": result.difficulty_performance_score,
            "evidence_quality_score": result.evidence_quality_score,
            "penalties": dict(result.penalties),
            "explanation": result.explanation,
            "attempt_count": result.attempt_count,
            "valid_attempt_count": result.valid_attempt_count,
        }

    @staticmethod
    def _serialize_weakness_result(weakness) -> dict:
        return {
            "skill_id": weakness.skill_id,
            "weakness_score": weakness.weakness_score,
            "error_frequency": weakness.error_frequency,
            "hint_usage_rate": weakness.hint_usage_rate,
            "retry_rate": weakness.retry_rate,
            "skip_rate": weakness.skip_rate,
            "hesitation_index": weakness.hesitation_index,
            "retention_drop": weakness.retention_drop,
            "prerequisite_gap_score": weakness.prerequisite_gap_score,
            "main_weaknesses": list(weakness.main_weaknesses),
            "weakness_evidence": dict(weakness.weakness_evidence),
            "severity": weakness.severity,
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
    def _serialize_emotional_result(result) -> dict:
        return {
            "frustration_score": result.frustration_score,
            "emotional_signal": result.emotional_signal,
            "confidence_level": result.confidence_level,
            "evidence": dict(result.evidence),
            "easy_win_mode": result.easy_win_mode,
            "attempts_analyzed": result.attempts_analyzed,
        }

    @staticmethod
    def _serialize_evidence_quality(result) -> dict:
        return {
            "evidence_quality_score": result.evidence_quality_score,
            "evidence_summary": result.evidence_summary,
            "evidence_warnings": list(result.evidence_warnings),
            "evidence": dict(result.evidence),
        }

    @staticmethod
    def _serialize_reliability(result) -> dict:
        return {
            "reliability": result.reliability,
            "decision_confidence": result.decision_confidence,
            "evidence_warning": result.evidence_warning,
            "valid_attempt_count": result.valid_attempt_count,
        }

    @staticmethod
    def _serialize_question_quality(result) -> dict:
        return {
            "question_id": result.question_id,
            "quality_score": result.quality_score,
            "flag_for_review": result.flag_for_review,
            "impact_weight": result.impact_weight,
            "warnings": list(result.warnings),
            "evidence": dict(result.evidence),
        }

    @staticmethod
    def _serialize_learning_pattern(result) -> dict:
        return {
            "learning_response_pattern": result.learning_response_pattern,
            "confidence": result.confidence,
            "evidence": dict(result.evidence),
        }

    @staticmethod
    def _serialize_fairness_audit(result) -> dict:
        return {
            "fairness_risk_level": result.fairness_risk_level,
            "fairness_warnings": list(result.fairness_warnings),
            "suggested_correction": result.suggested_correction,
            "evidence": dict(result.evidence),
        }

    @staticmethod
    def _serialize_conflict_result(result) -> dict:
        return {
            "final_priority": result.final_priority,
            "selected_action": result.selected_action,
            "reason": result.reason,
            "evidence": dict(result.evidence),
        }

    @staticmethod
    def _serialize_difficulty_decision(decision) -> dict:
        return {
            "action": decision.action.value,
            "score": decision.score,
            "current_difficulty": decision.current_difficulty,
            "target_difficulty": decision.target_difficulty,
            "reason": decision.reason,
            "evidence": dict(decision.evidence),
        }

    @staticmethod
    def _serialize_recommendation(recommendation, recommendation_id: int) -> dict:
        return {
            "id": recommendation_id,
            "student_id": recommendation.student_id,
            "action": recommendation.action,
            "action_type": recommendation.action_type.value,
            "target_skill_id": recommendation.target_skill_id,
            "skill_id": recommendation.skill_id,
            "difficulty": recommendation.difficulty,
            "reason": recommendation.reason,
            "evidence": dict(recommendation.evidence),
            "confidence": recommendation.confidence,
            "decision_priority": recommendation.decision_priority,
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
            "difficulty_instruction": prompt_instruction.difficulty_instruction,
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
            "hint_usage_rate": state.hint_usage_rate,
            "skip_rate": state.skip_rate,
            "reliability": state.reliability,
            "hesitation_index": state.hesitation_index,
            "consistency": state.consistency,
            "current_difficulty": state.current_difficulty,
            "retention": state.retention,
            "retention_lambda": state.retention_lambda,
            "review_due": state.review_due,
            "weakness_score": state.weakness_score,
            "frustration_score": state.frustration_score,
            "learning_response_pattern": state.learning_response_pattern,
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

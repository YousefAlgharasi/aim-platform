# 04 — Core Algorithms and Business Logic

## 1. Ranking of Algorithms in the AIM Platform

1. **Mastery Calculation V2** (`services/api/src/aim/domain/services/mastery_calculator.py`) — *Core Algorithm*
2. **Weakness Detection V2** (`services/api/src/aim/domain/services/weakness_detector.py`) — *Core Algorithm*
3. **Difficulty Adaptation V2** (`services/api/src/aim/domain/services/difficulty_adapter.py`) — *Core Algorithm*
4. **Recommendation Engine V2** (`services/api/src/aim/domain/services/recommendation_engine.py`) — *Core Orchestration Algorithm*
5. **Supporting Cognitive & Reliability Algorithms** (`services/api/src/aim/domain/services/`):
   - `evidence_quality_engine.py`, `reliability_engine.py`, `retention_tracker.py`, `confidence_matrix.py`, `emotional_state_detector.py`, `error_pattern_classifier.py`, `micro_goal_generator.py`, `transfer_learning_detector.py`, `contextual_memory.py`.

---

## 2. Mastery Calculation V2 (`mastery_calculator.py`)
- **Purpose**: Computes a stabilized mastery score `[0, 100]` for a `(student_id, skill_id)` pair.
- **Key Design Decision**: *"Response time is intentionally excluded from mastery and from this module's attempt snapshot contract."* (Lines 3–4). This prevents penalizing thoughtful or slower learners who answer accurately.
- **Inputs**: `AttemptSnapshot(is_correct, attempts, difficulty, skip, hint_used)` and `SkillState(retention, confidence, mastery)`.
- **Supporting Engines**: Uses `EvidenceQualityEngine` and `ReliabilityEngine` to weight attempt evidence before updating `SkillStateRepository.update_mastery()`.

## 3. Weakness Detection V2 (`weakness_detector.py`)
- **Purpose**: Computes an explainable `SkillWeakness` score and severity (`"low" | "medium" | "high"`) per skill.
- **Inputs**: `WeaknessAttempt(student_id, skill_id, is_correct, difficulty, skip, hint_used, attempts)` plus optional `hesitation_index_by_skill`, `retention_drop_by_skill`, and `prerequisite_gap_by_skill`.
- **Outputs**: `SkillWeakness` containing `weakness_score`, `error_frequency`, `hint_usage_rate`, `retry_rate`, `skip_rate`, `hesitation_index`, `retention_drop`, `prerequisite_gap_score`, and `main_weaknesses`.

## 4. Difficulty Adaptation V2 (`difficulty_adapter.py`)
- **Purpose**: Conservatively adjusts question difficulty (`MIN_DIFFICULTY = 1` to `MAX_DIFFICULTY = 5`) returning `DifficultyAction` (`INCREASE`, `MAINTAIN`, `DECREASE`).
- **Mathematical Formula** (Lines 61–67):
  $$\text{readiness\_score} = \text{round}(0.45 \cdot \text{mastery} + 0.25 \cdot \text{consistency} + 0.20 \cdot \text{retention} + 0.10 \cdot (\text{reliability} \times 100), 2)$$
- **Safety-First Rule** (Line 79): Risk signals (`weakness_score`, `frustration_score`, `repeated_failure_count`) are evaluated *first* to trigger `DECREASE` before considering `INCREASE`.
- **Complexity**: $O(1)$ time and $O(1)$ space per decision.

## 5. Recommendation Engine V2 (`recommendation_engine.py`)
- **Purpose**: Selects the next pedagogical action (`RecommendationActionType`):
  - `COLLECT_MORE_EVIDENCE`, `EASY_WIN`, `REVIEW_PREREQUISITE`, `RETEACH_CONCEPT`, `TARGETED_PRACTICE`, `SPACED_REVIEW`, `CONFIDENCE_BUILDER`, `REFLECTION_PRACTICE`, `MIXED_PRACTICE`, `INCREASE_DIFFICULTY`, `CONTINUE_CURRENT_SKILL`, `TRIGGER_TUTOR_INTERVENTION`.
- **How It Works**: Combines outputs from `ConfidenceMatrix`, `ContextualMemory`, `DifficultyAdapter`, `EmotionalStateDetector`, `ErrorPatternClassifier`, `MicroGoalGenerator`, `WeaknessDetector`, and `SkillGraph`.

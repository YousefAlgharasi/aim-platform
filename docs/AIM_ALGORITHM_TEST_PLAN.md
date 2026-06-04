# AIM Algorithm Test Plan

## Purpose

This test harness verifies the AIM adaptive algorithm before product app work begins. It exercises the real backend session pipeline with fixed student-behavior scenarios and flexible behavioral assertions.

The tests are intended to answer:

* Did the API save session attempts and return the expected adaptive result shape?
* Did AIM move mastery, weakness, emotional signal, difficulty, recommendation, and prompt guidance in a reasonable direction?
* Did a scenario expose a mismatch between expected adaptive behavior and the current algorithm?

The harness does not test the visual demo page, Supabase, Flutter, Next.js, or production application flows.

## Why The Harness Uses `/sessions/{session_id}/attempts`

The production-style session attempt endpoint is:

```http
POST /sessions/{session_id}/attempts
```

That route converts API request payloads into domain `AttemptRecord` objects and calls:

```python
SessionUseCases.record_attempts(...)
```

Using this endpoint keeps the tests close to the real integration boundary while still running in an isolated in-memory SQLite database. The tests do not call `/dev/aim/demo-session`, because that endpoint maps real pipeline output into a visual-dashboard shape and is meant for browser demos.

## Response Time Rule

Response time is behavioral evidence only. It must not directly raise or lower:

* mastery
* skill mastery
* student level
* the mastery calculation inputs used by difficulty adaptation

The mastery calculation is based on:

* accuracy
* consistency
* retention
* difficulty performance
* evidence quality
* hint, retry, and skip penalties
* reliability
* stabilization against one-session jumps

Response time may still appear in:

* `performance_metrics.avg_speed`
* `performance_metrics.hesitation_index`
* safe emotional or session behavior signals such as `hesitation_signal`, `rushing_signal`, `fatigue_or_distraction_signal`, and `possible_learning_overload`
* learning response patterns such as `slow_but_accurate` or `fast_but_careless`
* question quality and fairness evidence fields for audit visibility

Speed must not determine student level. Slow correct students should not be punished in mastery, and fast wrong students should not be rewarded in mastery.

## Scenario Fixtures

Shared scenario input definitions live in:

```txt
src/aim/application/demo/aim_demo_scenarios.py
```

Both the visual demo endpoint and the automated algorithm harness use these shared scenario definitions. The test fixture module is a thin adapter that converts the shared scenarios into `/sessions/{session_id}/attempts` payloads and attaches test-only expected behavior rules.

Reusable test fixture adapters live in:

```txt
tests/fixtures/aim_scenarios.py
```

Each fixture defines:

* initial student skill state
* target skill
* session id
* attempt list
* flexible expected behavior rules

The fixtures do not hardcode exact final algorithm numbers. They describe input behavior and broad outcome expectations.

## Scenarios

### strong_student

Input signals:

* high accuracy
* fast response time
* low retries
* low hint usage
* medium/high difficulty questions
* strong previous mastery, confidence, retention, and difficulty

Expected adaptive outcomes:

* mastery stays high or improves
* weakness score remains low
* frustration score remains low
* difficulty maintains or increases
* recommendation is challenge, continue, mixed practice, or advance style
* prompt instruction is non-empty and should guide current or harder practice

### weak_reading_student

Input signals:

* low reading accuracy
* slow response time
* repeated mistakes
* high hint usage
* answer changes

Expected adaptive outcomes:

* weakness score is greater than zero
* reading skill is the affected skill
* mastery does not jump too high
* recommendation is review, reteach, targeted practice, evidence collection, or support style
* prompt instruction is non-empty and should mention foundational, review, guided, step-by-step, or support-oriented practice

### rushing_student

Input signals:

* very fast answers
* many wrong answers
* low hint usage
* high confidence-like initial state

Expected adaptive outcomes:

* emotional evidence should show rushing or fast-wrong behavior when supported
* recommendation should be reflective, confidence-calibrating, targeted, review, or evidence-collection style
* difficulty should not increase aggressively
* prompt instruction should be non-empty and should support slower reasoning or calibration when supported

Current limitation:

The real session API does not accept an `is_timed` field, and the session use case currently passes `is_timed=False` into the error pattern classifier. That means pressure-error classification may not be reachable through `/sessions/{session_id}/attempts` until timed-attempt evidence is modeled in the real API.

### frustrated_student

Input signals:

* repeated wrong answers
* slower responses over time
* hint usage
* skipped question
* strong previous mastery, making repeated errors meaningful to the safe emotional detector

Expected adaptive outcomes:

* high frustration score
* difficulty reduces or does not increase
* recommendation is easy win, tutor intervention, supportive review, or similar
* prompt instruction uses supportive/encouraging/easier guidance

### low_confidence_student

Input signals:

* mostly correct answers
* high hint usage or answer changes
* low previous confidence
* medium mastery

Expected adaptive outcomes:

* mastery may improve, but difficulty should not jump too quickly
* recommendation should use confidence-building, diagnostic, targeted, or steady support when available
* prompt instruction should stay supportive

### hint_dependent_student

Input signals:

* correct answers often happen after hints
* many `hint_used = true` attempts
* moderate accuracy

Expected adaptive outcomes:

* evidence quality is reduced by hint and retry support
* weakness/support need is detected
* recommendation should target practice, reteaching, confidence building, evidence collection, or steady support
* prompt should guide practice that reduces hint dependency gradually

### prerequisite_gap_student

Input signals:

* student attempts `GRAMMAR_PASSIVE_VOICE`
* `GRAMMAR_TO_BE` is below the prerequisite mastery threshold

Expected adaptive outcomes:

* prerequisite gap is logged when the skill graph supports it
* recommendation should prefer prerequisite review or a safe fallback
* prompt should focus on prerequisite support

### retention_review_student

Input signals:

* previous mastery was good
* retention is low
* current performance is mixed

Expected adaptive outcomes:

* retention review path should be recommended when no higher-priority intervention overrides it
* prompt should include spaced review, refresh, or guided review practice

### slow_but_accurate_student

Input signals:

* correct answers
* slow response times
* low retries
* low hints

Expected adaptive outcomes:

* mastery is not punished because response time is behavioral only
* behavioral pattern may show slow-but-accurate or slowdown evidence
* recommendation should not reduce mastery because of speed

### low_reliability_student

Input signals:

* only one or two valid attempts

Expected adaptive outcomes:

* reliability and decision confidence are low
* mastery does not jump too high
* recommendation should collect more evidence or otherwise stay conservative

### questionable_question_quality_student

Input signals:

* repeated attempts against one poor-quality item
* high error, hint, and skip rates

Expected adaptive outcomes:

* question quality is flagged when supported
* evidence quality is reduced
* student is not strongly punished by one poor-quality question

## How To Run

Run the AIM algorithm harness:

```powershell
pytest tests/integration/api/test_aim_algorithm_harness.py
```

Run the response-time mastery guard tests:

```powershell
pytest tests/integration/api/test_response_time_behavior_only.py
```

Run all tests:

```powershell
pytest
```

## How To Interpret Failures

If a response-shape assertion fails, the real pipeline contract likely changed. Update the harness only after confirming the new contract is intentional.

If a behavior assertion fails, classify it before changing code:

* The test expectation is wrong if the current AIM behavior is pedagogically reasonable and the scenario description was too narrow.
* The scenario input needs adjustment if it does not strongly express the intended behavior signal.
* The algorithm may have a real issue if the fixture clearly expresses the behavior but AIM recommends an unsafe, overly aggressive, or unrelated adaptation.

Exact numeric values should be avoided unless the algorithm intentionally guarantees them. Prefer threshold, direction, membership, and non-empty assertions.

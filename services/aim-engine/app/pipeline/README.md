# AIM Engine Pipeline Boundary

This package defines the pipeline interface for future adaptive session-completion processing.

## P1-029 scope

This task is interface-only.

It adds:

- `AdaptiveSessionCompletionPipeline`
- `PipelineExecutionContext`
- pipeline-specific error types
- `PlaceholderAdaptiveSessionCompletionPipeline`

## Placeholder behavior

The placeholder implementation returns an `accepted` response with empty output lists.

It does not calculate:

- mastery
- confidence
- weakness
- difficulty
- recommendations
- retention schedules
- emotional state
- learner level

## Boundary rule

The AIM Engine remains backend-owned. Clients must not calculate mastery, weakness, difficulty, retention, recommendations, or learner intelligence locally.

## Future direction

Later tasks should replace the placeholder with explicit orchestration that calls internal engine components in the approved order, after persistence and service boundaries are clear.

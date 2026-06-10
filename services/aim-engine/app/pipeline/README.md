# AIM Engine Pipeline Boundary

This package is reserved for future pipeline orchestration.

Do not add adaptive-learning behavior here in P1-026.

Expected future direction:

1. Contract models are introduced first.
2. Pipeline interfaces are introduced after contracts.
3. Algorithm implementation is integrated only after contracts and persistence boundaries are clear.

The AIM Engine remains backend-owned. Clients must not calculate mastery, weakness, difficulty, retention, recommendations, or learner intelligence locally.

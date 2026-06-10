# AIM Engine Tests

## Guard tests

P1-030 adds no-speed mastery guard tests.

These tests protect a Phase 1 rule:

> Speed, response time, average response time, or speed score must not directly increase mastery, learner level, or difficulty.

The tests are intentionally not full algorithm tests. They verify that the current pipeline boundary does not produce mastery, weakness, difficulty, retention, or recommendation outputs from response time alone.

When real adaptive logic is implemented later, these guard tests should remain and be adapted to the real implementation so that speed remains contextual evidence only, not a direct mastery or difficulty-increase signal.

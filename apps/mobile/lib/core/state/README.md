# Riverpod StateNotifier Foundation

P1-041 adds the shared state conventions for Flutter Mobile.

## Scope

This is a foundation only. It defines reusable state shapes and a base `StateNotifier` style class.

Included:

- `AppAsyncState<T>`
- `AppFormState`
- `RetryState`
- `AppStateNotifier<T>`

## Convention

Feature providers should live inside each feature's:

```text
lib/features/<feature>/logic/provider
```

Feature providers should use `StateNotifier`-style classes for screen, loading, form, retry, and error state.

## Forbidden in Flutter State

Flutter state must not calculate:

- mastery
- learner level
- weakness
- difficulty
- retention
- recommendations

Flutter Mobile sends learner evidence to the Backend API and renders backend-approved outputs only.

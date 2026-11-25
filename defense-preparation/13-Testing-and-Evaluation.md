# 13 — Testing and Evaluation

## 1. Verified Test Suites (from `CLEANUP_README.md`)
| Component | Command | Verified Result |
| :--- | :--- | :--- |
| **Backend API** | `npm test -- --runInBand` | 370 suites passed (4 skipped), 3,916 tests passed (49 skipped), 0 failures |
| **Admin Dashboard** | `npm test -- --runInBand` | 35 suites / 246 tests passed |
| **Student Web** | `npm test -- --runInBand` | 70 suites / 666 tests passed |
| **Flutter Mobile** | `flutter test` / `analyze` | Not run to completion locally (SDK 3.32.5 vs required >=3.44.0) |
| **AIM Engine** | `pytest` (`--cov=app --cov-fail-under=60`) | Configured in `pyproject.toml`; not rerun locally after cleanup |

## 2. Missing Evaluation & How to Defend It
- **AI / Pedagogical Evaluation**: There are no measured A/B test results or human-evaluated BLEU/rubric scores for AI Teacher responses or longitudinal learning-gain studies in the repository.
- **Defense Strategy**: Acknowledge this honestly as a **limitation / future work**, and propose a concrete evaluation plan (pre/post-test learning gains, teacher rubric grading of 100 AI Teacher responses for Arabic-English accuracy, and latency benchmarking).

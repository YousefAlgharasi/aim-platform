# `services/api/src/aim` — what this is, and what it isn't

## Short version

This directory is where AIM adaptive-learning algorithms were originally
prototyped, before `services/aim-engine` existed as the real, deployed
engine. `services/api` itself is **not** a deployed service — it has no
entry in `render.yaml` or `infra/docker/docker-compose.yml` (only
`aim-backend-api` and `aim-engine` are deployed).

**However — and this is the part worth reading carefully — most of this
directory is a sandbox, but not all of it.** A specific subset of
`domain/services/` (plus one file under `infrastructure/skill_graph/`) is a
genuine, live runtime dependency of the deployed `services/aim-engine`
container. Editing those specific files changes production behavior on the
next `aim-engine` deploy. Editing anything else in this tree has zero
effect on any running service. The breakdown below tells you which is
which — don't assume based on the directory name alone.

## How the live dependency actually works

`services/aim-engine/Dockerfile` copies this **entire** directory into the
aim-engine image and puts it on the Python path:

```
COPY --chown=aim:aim services/api/src/aim ./api/src/aim
ENV PYTHONPATH=/app/api/src
```

`render.yaml`'s `aim-engine` service builds from the repo root using that
same Dockerfile — so this is the real production build, not just a local
convenience copy.

At runtime, `services/aim-engine/app/pipeline/aim_analysis_pipeline.py`
explicitly inserts this directory's parent onto `sys.path` and imports
several classes directly from `aim.domain.services.*` — the exact same
`.py` files that live in this repo, not a copy of them:

```python
from aim.domain.services.difficulty_adapter import DifficultyAction, DifficultyAdapter
from aim.domain.services.emotional_state_detector import EmotionalAttempt, EmotionalStateDetector
from aim.domain.services.mastery_calculator import AttemptSnapshot, MasteryCalculator, MasteryResult, SkillState
from aim.domain.services.recommendation_engine import RecommendationEngine, ...
from aim.domain.services.retention_tracker import RetentionSkillState, RetentionTracker
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector
```

Those six modules transitively pull in several more `domain/services/`
modules and one `infrastructure/` module. The full live set, verified by
tracing every `from aim.*` import starting from
`aim_analysis_pipeline.py` (checked against this repo's actual code, not
assumed):

### Live in production (part of the deployed `aim-engine` image, imported at runtime)

- `domain/services/difficulty_adapter.py` — imported directly by the pipeline
- `domain/services/emotional_state_detector.py` — imported directly by the pipeline
- `domain/services/mastery_calculator.py` — imported directly by the pipeline (wired in P20-007)
- `domain/services/recommendation_engine.py` — imported directly by the pipeline (wired in P20-009)
- `domain/services/retention_tracker.py` — imported directly by the pipeline (wired in P20-008)
- `domain/services/weakness_detector.py` — imported directly by the pipeline
- `domain/services/confidence_matrix.py` — imported by `recommendation_engine.py`
- `domain/services/contextual_memory.py` — imported by `recommendation_engine.py`
- `domain/services/decision_conflict_resolver.py` — imported by `recommendation_engine.py`
- `domain/services/error_pattern_classifier.py` — imported by `recommendation_engine.py`
- `domain/services/micro_goal_generator.py` — imported by `recommendation_engine.py`
- `domain/services/transfer_learning_detector.py` — imported by `recommendation_engine.py`
- `domain/services/evidence_quality_engine.py` — imported by `mastery_calculator.py`
- `domain/services/reliability_engine.py` — imported by `mastery_calculator.py`
- `infrastructure/skill_graph/skill_graph.py` — imported by `transfer_learning_detector.py`

### Genuinely prototype-only (never imported by `aim-engine`; changes here have zero production effect)

- `domain/services/calibration.py`
- `domain/services/fairness_audit_engine.py`
- `domain/services/learning_response_pattern_detector.py`
- `domain/services/outcome_tracker.py`
- `domain/services/performance_analyzer.py`
- `domain/services/prompt_adaptation_generator.py`
- `domain/services/question_quality_analyzer.py`
- `domain/entities/`, `domain/value_objects/`
- `application/` (ports, services, use_cases, demo)
- `content/`
- `infrastructure/database/`, `infrastructure/repositories/`, `infrastructure/scheduler/`, `infrastructure/config.py`
- `ml/`
- `presentation/` — the standalone FastAPI app (`presentation/api/app.py`) that this whole
  package used to be built around. It is never started by any deployed
  service — see the note at the top of that file.

## What "porting" (P20-007/008/009) actually means here

Tasks P20-007 (mastery), P20-008 (retention), and P20-009
(recommendations) did **not** copy these algorithms into
`services/aim-engine`'s own source tree — the classes above were already
being imported live from this directory (that's the discovery this task,
P20-015, made explicit). What those tasks actually did was write
side-effect-free adapter classes *inside* `services/aim-engine` that
satisfy the repository-injection Protocols these classes expect (e.g.
`MasteryCalculator` wants something that looks like a mastery-state
repository), with every write method as a deliberate no-op — because the
AIM Engine itself must never write to a database. The underlying
algorithm source code has always lived here, in `services/api/src/aim`,
and continues to. "Porting" the *next* algorithm (e.g. one of the
prototype-only modules above) means the same thing: wiring an import +
writing an adapter in `services/aim-engine`, not copying the file.

## A stale reference worth a human's attention (not fixed in this task)

`aim_analysis_pipeline.py`'s own module docstring currently says
"Concrete adaptive-learning algorithms live in the domain services under
`app/domain/` and `packages/ai_core/`." Neither is accurate: `aim-engine`'s
`app/domain/__init__.py` is an empty P1-026-era placeholder with no
algorithm code, and `packages/ai_core/` is a separate, unused directory
containing similarly-named files that nothing imports. The real source is
this directory, reached via the explicit `sys.path` insert shown above.
This is a documentation-only task (P20-015) scoped to
`services/api/src/aim` — fixing that docstring, or resolving what
`packages/ai_core/` is for, is left for a human to decide.

# AIM Visual Demo Dashboard

The AIM visual demo is a development dashboard for testing the adaptive pipeline in the browser.

The visual demo and automated AIM algorithm harness use the same shared scenario definitions from:

```txt
src/aim/application/demo/aim_demo_scenarios.py
```

## Run the Backend

From the repository root:

```powershell
uvicorn backend.main:app --reload
```

The backend should be available at `http://127.0.0.1:8000`.

## Run the Frontend

From `frontend/`:

```powershell
npm start
```

Open `http://localhost:3000/aim-demo`.

## Demo Endpoint

The page calls:

```http
POST /dev/aim/demo-session
```

Example body:

```json
{
  "scenario": "weak_reading_student"
}
```

This endpoint is development/demo only. It creates isolated input data from the shared scenarios, runs the real AIM pipeline, and maps the result into the visual dashboard shape. It is not intended for production student sessions.

## Scenarios

The backend demo endpoint accepts every shared scenario key, including scenarios that are not yet listed in the frontend dropdown.

Strong student:
- Proves high mastery / challenge-ready behavior.

Weak reading student:
- Proves reading weakness and supportive reteach/review behavior.

Rushing student:
- Proves fast-wrong behavior signals and reflective/supportive next steps.

Frustrated student:
- Proves overload, easier difficulty, and encouraging prompt behavior.

Low confidence student:
- Proves mostly-correct but uncertain learners get conservative supportive guidance.

Hint dependent student:
- Proves hints reduce evidence quality and trigger support needs.

Prerequisite gap student:
- Proves skill-graph prerequisite gaps can drive fill-gaps-first behavior.

Retention review student:
- Proves low retention can drive spaced review or refresh practice.

Slow but accurate student:
- Proves slow correct answers are not punished in mastery.

Low reliability student:
- Proves low attempt counts keep confidence low and avoid aggressive mastery changes.

Questionable question quality student:
- Proves poor-quality items can be flagged and reduce evidence impact.

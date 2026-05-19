# AIM Visual Demo Dashboard

The AIM visual demo is a development dashboard for testing the adaptive pipeline in the browser.

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

This endpoint is development/demo only. It returns deterministic data for visual inspection and is not intended for production student sessions.

## Scenarios

Strong student:
- Expect high mastery.
- Difficulty increases.
- Recommendation is `Challenge`.
- Prompt asks for harder reading exercises.

Weak reading student:
- Expect low reading mastery.
- Reading weakness is detected.
- Recommendation is `Reteach Concept`.
- Prompt asks for easier passages, vocabulary support, and step-by-step comprehension checks.

Rushing student:
- Expect very fast answers with many wrong answers.
- Error pattern is `rushing`.
- Recommendation is `Timed Practice`.
- Prompt asks the tutor to slow down and use step-by-step questions.

Frustrated student:
- Expect repeated wrong answers, skips, and high frustration.
- Difficulty reduces.
- Recommendation is `Easy Win + Encourage`.
- Prompt asks for encouraging tone and easier questions.

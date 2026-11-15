# Starter course Arabic seed

Adds Arabic (`ar`) teaching content for the Starter course (course id
`c2f2a93b-b4bb-4786-a381-c4e97932af08`) on top of the existing lesson translation system.
NOT to be run in production without approval.

## Where the data lands

| Source JSON key | Table / column |
|---|---|
| `title`, `description` | `lesson_translations` (`locale='ar'`) title/description. Existing ar rows are kept: only the content column is overwritten unless the row is missing (then title/description are inserted). |
| `explanation`, `assets` | `lesson_translations.content` JSONB (`{ "explanation": {...}, "assets": {...} }`) |
| `questions.<id>.stem/explanation` | `question_bank.translations -> 'ar'` (`{"stem","explanation"}`) |
| `questions.<id>.choices.<id>` | `question_choices.translations -> 'ar'` (`{"text"}`) |

Never translated: fill-in accepted answers, True/False labels, grading data.

## Input: `content/<lessonId>.ar.json`

One file per Starter lesson (12 lessons). Translators own `content/`.

```json
{
  "lessonId": "<uuid>",
  "title": "string",
  "description": "string",
  "explanation": {
    "overview": "string",
    "sections": [
      { "heading": "string", "body": "markdown string",
        "examples": [ { "text": "English, copied verbatim", "note": "Arabic note" } ] }
    ],
    "keyPoints": ["string"],
    "commonMistakes": [ { "wrong": "verbatim", "right": "verbatim", "why": "Arabic" } ],
    "recap": "string"
  },
  "assets": { "<lessonAssetId>": { "title": "string?", "description": "string?" } },
  "questions": {
    "<questionId>": {
      "stem": "string",
      "explanation": "string",
      "choices": { "<choiceId>": "string" }
    }
  }
}
```

Rules (validated by the generator; any violation aborts with a non-zero exit and writes nothing):

- `lessonId` equals the file name prefix and is a Starter lesson id.
- `explanation` has the same shape as the English `lessons.explanation`, with identical array lengths:
  `sections`, each section's `examples`, `keyPoints`, `commonMistakes`. `explanation` is
  required when English `lessons.explanation` exists. `recap` present iff present in English.
- `examples[].text`, `commonMistakes[].wrong` and `.right` must equal the English text exactly.
- `assets` keys must be asset ids of that lesson; `questions` keys must be question ids linked to
  that lesson; `choices` keys must be choice ids of that question. Unknown ids fail.
- Strings must be non-empty after trim. `hint` is optional per question (`"hint"`), only if English has one.

## Generate and apply (dev DB only)

```
node database/seeds/starter-arabic/generate.js            # validate + write apply.sql
node database/seeds/starter-arabic/generate.js --check    # validate only
```

The generator validates against the English source read from the DB
(env `SEED_DATABASE_URL` or the dev container `aim-lessons-test-pg` via `docker exec`), then
rewrites `apply.sql`: one transaction, idempotent upserts (`ON CONFLICT (lesson_id, locale)`,
`UPDATE ... SET translations = jsonb_set(...)`), Starter ids only. Re-running is safe.

Requires migration `20261114130000_lesson_translation_content` (adds the `content` and
`translations` columns) to be applied first.

# English fix: Starter lesson "Numbers 11-20"

NOT to be run in production without approval.

Lesson id `8e45a282-d726-48ef-97c5-897764156bb9`. Fix applied to
`starter-arabic/source/starter-en.json` and the Arabic file
`starter-arabic/content/8e45a282-d726-48ef-97c5-897764156bb9.ar.json`.
`numbers-11-20.sql` updates `lessons.explanation` (single transaction, idempotent, id-scoped).
No `question_bank` rows change: the 10 questions are correct.

## What was wrong

"th" was said to appear in eleven, fourteen ... nineteen (only thirteen has it); stress was said to be
on the first syllable of every word (eleven is e-LEV-en; -teen words are stressed on -teen when said
alone, thir-TEEN, and may shift forward before a noun, THIR-teen PEO-ple; twelve is one syllable);
"eighteen o'clock" is not idiomatic English; "date" was listed as a use of cardinal numbers (dates use ordinals).

## Before / after

| Location | Before | After |
|---|---|---|
| overview | ...age, money, dates and many daily situations. | ...age, money, time and many daily situations. |
| "How to say them" body, bullet 1 | The sound **th** in eleven, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen is soft, like the **th** in *think*. | The sound **th** in thirteen is soft, like the **th** in *think*. Only thirteen has this sound; eleven and fourteen to nineteen do not. |
| body, bullet 2 | The stress is on the first syllable of each word. | Stress: *eleven* is stressed on the second syllable (e-LEV-en), and *twelve* has only one syllable. Thirteen to nineteen are stressed on -teen when you say them alone (thir-TEEN). Before a noun the stress often moves to the first syllable (THIR-teen PEO-ple). |
| example "eleven" note | soft th sound | stress on the second syllable: e-LEV-en |
| example "thirteen" note | soft th sound | soft th sound; stress on -teen: thir-TEEN |
| example "seventeen" note | stress on first syllable | stress on -teen when said alone: seven-TEEN |
| "Using numbers" body, bullet 3 | ...to tell age or date. | ...to tell age or time. |
| "Using numbers" example text | The meeting starts at eighteen o'clock. | The class starts at eleven o'clock. |
| keyPoint 2 | the "th" sound is soft, like in think | the "th" sound in thirteen is soft, like in think |
| keyPoint 3 | the stress is on the first syllable of each number word | eleven is stressed on the second syllable (e-LEV-en); thirteen to nineteen are stressed on -teen when said alone (thir-TEEN), and the stress may move to the first syllable before a noun |

Array lengths and order are unchanged.

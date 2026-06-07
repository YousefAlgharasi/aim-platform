# AIM A1 Pilot Curriculum — 2-Week Plan
**Target Learners:** Arabic-speaking adults at CEFR A1 English level  
**Duration:** 2 weeks (10 lessons, ~20–30 min each)  
**Pilot Size:** 5 students  
**Task:** AIM-021 | Branch: feature/a1-pilot-content

---

## Curriculum Goals

By the end of 2 weeks, students should be able to:
- Introduce themselves and greet others in English.
- Use the verb "to be" correctly in simple sentences.
- Identify and use basic vocabulary (numbers, colors, family, body).
- Describe daily routines using present simple.
- Read and understand very short English texts (3–5 sentences).

---

## 2-Week Lesson Map

| Lesson | Title (EN) | Title (AR) | Week | Core Skill | Difficulty |
|--------|-----------|-----------|------|------------|------------|
| L01 | Greetings & Introductions | التحيات والتعريف بالنفس | 1 | Speaking / Vocabulary | 1 |
| L02 | The Verb "To Be" | فعل "to be" | 1 | Grammar | 1 |
| L03 | Numbers & Colors | الأرقام والألوان | 1 | Vocabulary | 1 |
| L04 | My Family | عائلتي | 1 | Vocabulary + Grammar | 2 |
| L05 | Daily Routines – Part 1 | روتيني اليومي – الجزء الأول | 1 | Grammar / Vocabulary | 2 |
| L06 | Daily Routines – Part 2 | روتيني اليومي – الجزء الثاني | 2 | Grammar | 2 |
| L07 | Present Simple – Questions | الحاضر البسيط – الأسئلة | 2 | Grammar | 3 |
| L08 | My Home & My City | منزلي ومدينتي | 2 | Vocabulary | 2 |
| L09 | Basic Reading | القراءة الأساسية | 2 | Reading Comprehension | 3 |
| L10 | Review & Post-Test | مراجعة واختبار ختامي | 2 | Mixed | 2 |

---

## Pre-Test (Before L01)

Administered before the first lesson to establish a baseline mastery score.  
See: `packages/content/assessments/pre_test.json`

---

## Post-Test (After L10)

Administered after the last lesson to measure learning gain.  
See: `packages/content/assessments/post_test.json`

---

## Lesson Structure (Per Lesson)

Each lesson JSON file includes:
```
skill_id
lesson_id
title_en
title_ar
week
difficulty (1–5 scale)
prerequisites (list of skill_ids)
learning_objectives (list)
questions (list of question objects)
  - question_id
  - concept
  - prompt_en
  - prompt_ar
  - type (mcq | fill | true_false)
  - choices (for mcq)
  - correct_answer
  - explanation_en
  - explanation_ar
  - common_error_tags
  - difficulty
  - prerequisites
```

---

## Skill Map

| skill_id | Skill Name | Prerequisites |
|----------|-----------|---------------|
| SK-G01 | verb_to_be_present | — |
| SK-G02 | present_simple_positive | SK-G01 |
| SK-G03 | present_simple_negative | SK-G02 |
| SK-G04 | present_simple_question | SK-G02 |
| SK-V01 | greetings_vocabulary | — |
| SK-V02 | numbers_1_to_20 | — |
| SK-V03 | colors_basic | — |
| SK-V04 | family_vocabulary | — |
| SK-V05 | daily_routine_verbs | SK-G01 |
| SK-V06 | home_and_city_vocabulary | — |
| SK-R01 | basic_reading_comprehension | SK-G02, SK-V05 |

---

## Common Error Tags Used

```
wrong_verb_form
subject_verb_agreement_error
missing_auxiliary
confusion_am_is_are
false_cognate_arabic
word_order_error
omitted_article
omitted_subject_pronoun
```

---

## Notes for Pilot

- All prompts have both English and Arabic versions so students can refer to Arabic when stuck.
- Hints are available (max 2 per question) — hint usage is tracked by AIM.
- Each lesson ends with a 3–5 question micro-quiz that feeds data into the AIM adaptive engine.
- Difficulty increases only when the AIM algorithm signals readiness (mastery ≥ 85, consistency ≥ 75, reliability ≥ 0.70).

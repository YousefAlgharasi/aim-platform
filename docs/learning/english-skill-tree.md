# AIM English Skill Tree — MVP (A1 Beginner)

## Purpose

This document defines the MVP English skill tree for beginner Arabic-speaking A1 learners. It provides skill IDs, categories, prerequisites, difficulty levels, and notes to support lesson planning, question tagging, placement testing, and AIM Engine processing.

## Scope

This is Phase 0 planning documentation. It does not implement backend APIs, database schemas, Flutter code, Student Web App code, or AIM Engine runtime logic. Skill IDs defined here are the canonical reference for all Phase 0 and Phase 1 content, question metadata, and AIM Engine inputs.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-004 | `docs/product/mvp-scope.md` | Checked locally and present. |

## Skill ID Format

```
EN-A1-{CATEGORY}-{NUMBER}
```

- `EN` — English language
- `A1` — CEFR A1 level (absolute beginner)
- `{CATEGORY}` — PHO, VOC, GRA, READ, WRITE, LIS, SPE (see below)
- `{NUMBER}` — Zero-padded three-digit sequence within the category

## Skill Categories

| Code | Category | Description |
|---|---|---|
| PHO | Phonics and Pronunciation | Recognizing and producing English letters, sounds, and basic phoneme patterns. |
| VOC | Vocabulary | Learning core A1 English words and phrases organized by topic. |
| GRA | Grammar | Understanding and applying beginner English grammar structures. |
| READ | Reading | Recognizing words and reading simple sentences and short texts. |
| WRITE | Writing | Forming letters and writing simple words and sentences. |
| LIS | Listening | Comprehending spoken English at A1 level, including letters, words, instructions, and short dialogues. |
| SPE | Speaking | Producing spoken English at A1 level, from individual sounds to simple guided exchanges. |

## Difficulty Scale

| Level | Label | Description |
|---|---|---|
| 1 | Foundation | Zero prerequisites; no prior English knowledge assumed. |
| 2 | Beginner | Requires one or more Foundation skills. |
| 3 | Elementary | Requires multiple Beginner skills; combines concepts. |
| 4 | Early A1+ | Approaching A1 completion; integrates multiple skill areas. |

---

## Category: Phonics and Pronunciation (PHO)

| Skill ID | Skill Name | Difficulty | Prerequisites | Notes for Arabic Speakers |
|---|---|---|---|---|
| EN-A1-PHO-001 | Uppercase letter recognition (A–Z) | 1 | None | Arabic uses a completely different script; treat all 26 letters as new symbols. |
| EN-A1-PHO-002 | Lowercase letter recognition (a–z) | 1 | None | Distinguish visually from uppercase; common confusion pairs: b/d, p/q, m/n. |
| EN-A1-PHO-003 | Letter-to-sound mapping: short vowels (a, e, i, o, u) | 2 | EN-A1-PHO-001, EN-A1-PHO-002 | Arabic has only three vowel sounds; all five English short vowels need explicit teaching. |
| EN-A1-PHO-004 | Letter-to-sound mapping: consonants (b, d, f, g, h, j, k, l, m, n, p, r, s, t, v, w, y, z) | 2 | EN-A1-PHO-001, EN-A1-PHO-002 | Some English consonants have no Arabic equivalent (p, v, g-as-in-go); reinforce carefully. |
| EN-A1-PHO-005 | CVC word decoding (cat, bed, sit, hop, cup) | 2 | EN-A1-PHO-003, EN-A1-PHO-004 | Consonant-Vowel-Consonant pattern; the foundational blending unit for early reading. |
| EN-A1-PHO-006 | Letter-to-sound mapping: digraphs (ch, sh, th, wh) | 3 | EN-A1-PHO-004 | Arabic has equivalents for sh and a variant of th; ch and wh need extra practice. |
| EN-A1-PHO-007 | Long vowel sounds with silent-e pattern (cake, bike, note) | 3 | EN-A1-PHO-003, EN-A1-PHO-005 | The silent-e rule is absent in Arabic; needs explicit instruction. |
| EN-A1-PHO-008 | Common vowel digraphs (ea, oo, ee, ai) | 3 | EN-A1-PHO-003, EN-A1-PHO-005 | Two letters, one sound; model with high-frequency words only at A1. |
| EN-A1-PHO-009 | Word stress: two-syllable words (TEA-cher, stu-DENT) | 4 | EN-A1-PHO-005, EN-A1-PHO-006 | Arabic stress patterns differ; model with words already in VOC category. |
| EN-A1-PHO-010 | Basic sentence stress and rhythm (I am a STUdent.) | 4 | EN-A1-PHO-009 | Focus on content-word stress only; function-word reduction is post-A1. |

---

## Category: Vocabulary (VOC)

### Sub-topic: Identity and Personal Information

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-001 | Greetings and basic politeness | 1 | None | hello, hi, goodbye, bye, please, thank you, sorry, excuse me, yes, no |
| EN-A1-VOC-002 | Personal identity words | 1 | None | name, age, country, city, nationality, language, I am, my name is |
| EN-A1-VOC-003 | Numbers 0–20 | 1 | None | zero through twenty; ordinal forms (first, second) introduced at difficulty 2 |
| EN-A1-VOC-004 | Numbers 21–100 | 2 | EN-A1-VOC-003 | twenty-one, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred |

### Sub-topic: Time and Calendar

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-005 | Days of the week | 1 | None | Monday through Sunday, today, tomorrow, yesterday |
| EN-A1-VOC-006 | Months of the year | 2 | EN-A1-VOC-005 | January through December, this month, next month |
| EN-A1-VOC-007 | Telling time (hours and half-hours) | 2 | EN-A1-VOC-003 | o'clock, half past, What time is it? It is three o'clock. |

### Sub-topic: People and Family

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-008 | Family members | 1 | None | mother, father, sister, brother, son, daughter, husband, wife, family |
| EN-A1-VOC-009 | Describing people (basic adjectives) | 2 | EN-A1-VOC-008 | tall, short, old, young, big, small, happy, sad, nice, friendly |

### Sub-topic: Places and Objects

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-010 | Classroom objects | 1 | None | book, pen, pencil, bag, table, chair, board, window, door, notebook |
| EN-A1-VOC-011 | Colors | 1 | None | red, blue, green, yellow, orange, purple, black, white, brown, pink |
| EN-A1-VOC-012 | Common places in a city | 2 | EN-A1-VOC-002 | school, home, shop, hospital, park, street, bank, restaurant, mosque |

### Sub-topic: Food and Drink

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-013 | Common food words | 1 | None | rice, bread, water, milk, egg, chicken, fruit, vegetable, apple, orange |
| EN-A1-VOC-014 | Ordering and expressing preference | 2 | EN-A1-VOC-013, EN-A1-VOC-001 | I want, I like, I don't like, Can I have, please, thank you |

### Sub-topic: Body and Health

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-015 | Body parts | 1 | None | head, eyes, ears, nose, mouth, hand, arm, leg, foot, back |
| EN-A1-VOC-016 | Simple health expressions | 2 | EN-A1-VOC-015 | I am sick, I have a headache, I feel good, I am tired |

### Sub-topic: Actions and Verbs

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-017 | Common action verbs | 1 | None | go, come, eat, drink, read, write, speak, listen, sit, stand, open, close |
| EN-A1-VOC-018 | Common state verbs | 2 | EN-A1-VOC-017 | have, want, like, know, need, see, hear, feel, think, understand |

### Sub-topic: Spatial and Positional Words

| Skill ID | Skill Name | Difficulty | Prerequisites | Key Words |
|---|---|---|---|---|
| EN-A1-VOC-019 | Basic prepositions of place | 2 | EN-A1-VOC-010 | in, on, under, next to, in front of, behind, between |
| EN-A1-VOC-020 | Direction words | 3 | EN-A1-VOC-019 | left, right, straight, turn, near, far, here, there |

---

## Category: Grammar (GRA)

### Sub-topic: Pronouns and Articles

| Skill ID | Skill Name | Difficulty | Prerequisites | Example |
|---|---|---|---|---|
| EN-A1-GRA-001 | Subject pronouns | 1 | None | I, you, he, she, it, we, they |
| EN-A1-GRA-002 | Indefinite articles (a / an) | 1 | EN-A1-PHO-003 | a book, an apple, a student, an orange |
| EN-A1-GRA-003 | Definite article (the) | 2 | EN-A1-GRA-002 | the book, the teacher, the school — Arabic has the equivalent ال but rules differ |
| EN-A1-GRA-004 | Possessive adjectives | 2 | EN-A1-GRA-001 | my, your, his, her, its, our, their |
| EN-A1-GRA-005 | Demonstratives | 2 | EN-A1-GRA-001 | this, that, these, those |

### Sub-topic: To Be

| Skill ID | Skill Name | Difficulty | Prerequisites | Example |
|---|---|---|---|---|
| EN-A1-GRA-006 | To be — affirmative (am, is, are) | 1 | EN-A1-GRA-001 | I am a student. She is happy. They are here. |
| EN-A1-GRA-007 | To be — negative (am not, is not, are not) | 2 | EN-A1-GRA-006 | I am not tired. He is not late. — Contractions introduced here. |
| EN-A1-GRA-008 | To be — yes/no questions and short answers | 2 | EN-A1-GRA-006, EN-A1-GRA-007 | Are you a student? Yes, I am. / No, I am not. |
| EN-A1-GRA-009 | To be — wh-questions | 3 | EN-A1-GRA-008 | What is your name? Where are you from? How old are you? |

### Sub-topic: Nouns

| Skill ID | Skill Name | Difficulty | Prerequisites | Example |
|---|---|---|---|---|
| EN-A1-GRA-010 | Regular plural nouns | 2 | EN-A1-GRA-002 | book → books, pen → pens, box → boxes — Arabic plurals are irregular; this rule needs explicit teaching. |
| EN-A1-GRA-011 | Common irregular plural nouns | 3 | EN-A1-GRA-010 | man → men, woman → women, child → children |

### Sub-topic: Present Simple

| Skill ID | Skill Name | Difficulty | Prerequisites | Example |
|---|---|---|---|---|
| EN-A1-GRA-012 | Present simple — affirmative | 2 | EN-A1-GRA-001, EN-A1-VOC-017 | I read. She reads. They eat. — Third-person -s is a common error for Arabic speakers. |
| EN-A1-GRA-013 | Present simple — negative (don't / doesn't) | 3 | EN-A1-GRA-012 | I don't like coffee. She doesn't go to school. |
| EN-A1-GRA-014 | Present simple — yes/no questions | 3 | EN-A1-GRA-012, EN-A1-GRA-013 | Do you speak Arabic? Does she live here? |
| EN-A1-GRA-015 | Present simple — wh-questions | 4 | EN-A1-GRA-014 | What do you eat? Where does he work? |

### Sub-topic: Functional Structures

| Skill ID | Skill Name | Difficulty | Prerequisites | Example |
|---|---|---|---|---|
| EN-A1-GRA-016 | There is / There are | 2 | EN-A1-GRA-006 | There is a book on the table. There are three students. |
| EN-A1-GRA-017 | Can for ability | 2 | EN-A1-GRA-001, EN-A1-VOC-017 | I can swim. She can't drive. Can you speak English? |
| EN-A1-GRA-018 | Imperative sentences | 2 | EN-A1-GRA-001, EN-A1-VOC-017 | Open your book. Sit down. Don't talk. Please listen. |
| EN-A1-GRA-019 | Have got (simple possession) | 3 | EN-A1-GRA-006, EN-A1-GRA-004 | I have got a pen. She hasn't got a bag. Have you got a phone? |
| EN-A1-GRA-020 | Basic sentence word order (SVO) | 3 | EN-A1-GRA-012 | Subject + Verb + Object. I eat rice. She reads books. — Arabic VSO order causes frequent transfer errors. |

---

## Category: Reading (READ)

| Skill ID | Skill Name | Difficulty | Prerequisites | Description |
|---|---|---|---|---|
| EN-A1-READ-001 | Recognizing uppercase letters in words | 1 | EN-A1-PHO-001 | Identify named letters inside printed words. |
| EN-A1-READ-002 | Recognizing lowercase letters in words | 1 | EN-A1-PHO-002 | Identify named letters inside printed words. |
| EN-A1-READ-003 | Reading CVC words aloud or silently | 2 | EN-A1-PHO-005, EN-A1-READ-002 | Decode short consonant-vowel-consonant words (cat, hot, big). |
| EN-A1-READ-004 | Reading high-frequency sight words | 2 | EN-A1-READ-003 | the, is, are, a, an, I, and, in, on, to, have, be, this, that, it, of, for, not |
| EN-A1-READ-005 | Reading simple noun phrases | 2 | EN-A1-READ-004, EN-A1-GRA-002 | a red pen, the old book, my sister, three apples |
| EN-A1-READ-006 | Reading simple declarative sentences | 3 | EN-A1-READ-005, EN-A1-GRA-006 | I am a student. She is happy. They have a book. |
| EN-A1-READ-007 | Reading simple question sentences | 3 | EN-A1-READ-006, EN-A1-GRA-008 | Are you a student? What is your name? Can you swim? |
| EN-A1-READ-008 | Reading a short text (3–5 sentences) | 3 | EN-A1-READ-006, EN-A1-VOC-002 | A short paragraph about a person, place, or daily routine. Answer basic comprehension questions. |
| EN-A1-READ-009 | Reading and following simple instructions | 3 | EN-A1-READ-006, EN-A1-GRA-018 | Classroom instructions, simple signs, step lists (Circle the correct answer, Write your name). |
| EN-A1-READ-010 | Reading a short personal profile or form | 4 | EN-A1-READ-008, EN-A1-VOC-002 | A pilot-learner profile card: name, age, nationality, language, likes. |

---

## Category: Writing (WRITE)

| Skill ID | Skill Name | Difficulty | Prerequisites | Description |
|---|---|---|---|---|
| EN-A1-WRITE-001 | Writing uppercase letters (A–Z) | 1 | EN-A1-PHO-001 | Trace and copy all 26 uppercase letters correctly. |
| EN-A1-WRITE-002 | Writing lowercase letters (a–z) | 1 | EN-A1-PHO-002 | Trace and copy all 26 lowercase letters correctly; common confusion pairs b/d, p/q. |
| EN-A1-WRITE-003 | Copying simple words | 2 | EN-A1-WRITE-001, EN-A1-WRITE-002 | Copy familiar vocabulary words from VOC-001 to VOC-010 without errors. |
| EN-A1-WRITE-004 | Writing basic vocabulary words from memory | 2 | EN-A1-WRITE-003, EN-A1-VOC-001 | Spell common words from dictation using known vocabulary. |
| EN-A1-WRITE-005 | Writing a simple noun phrase | 2 | EN-A1-WRITE-004, EN-A1-GRA-002 | Write: a red pen, my book, three apples. |
| EN-A1-WRITE-006 | Writing a simple sentence using to be | 3 | EN-A1-WRITE-005, EN-A1-GRA-006 | Write: I am a student. She is ten years old. |
| EN-A1-WRITE-007 | Writing a simple sentence using present simple | 3 | EN-A1-WRITE-006, EN-A1-GRA-012 | Write: I like rice. She reads every day. |
| EN-A1-WRITE-008 | Writing answers to simple questions | 3 | EN-A1-WRITE-006, EN-A1-GRA-008 | Answer: What is your name? → My name is Ahmed. Where are you from? → I am from Saudi Arabia. |
| EN-A1-WRITE-009 | Writing a short personal description (3 sentences) | 4 | EN-A1-WRITE-008, EN-A1-VOC-009 | Produce three connected sentences about self: name, age, country, one preference. |
| EN-A1-WRITE-010 | Writing a short daily routine (3–4 sentences) | 4 | EN-A1-WRITE-009, EN-A1-GRA-012 | Produce: I wake up at seven. I eat breakfast. I go to school. I study English. |

---

## Category: Listening (LIS)

> **MVP Pilot Note:** Listening skills are defined here as the canonical planning reference. Serving LIS questions in the pilot requires confirmed audio delivery infrastructure. Until audio delivery is confirmed, LIS skills are tagged `lesson_eligible = false` and `placement_eligible = false`. Questions may be authored with audio reference metadata at planning level only.

| Skill ID | Skill Name | Difficulty | Prerequisites | Notes for Arabic Speakers |
|---|---|---|---|---|
| EN-A1-LIS-001 | Recognizing spoken English alphabet letters | 2 | EN-A1-PHO-001, EN-A1-PHO-002 | Arabic uses a completely different script and sound system; all 26 letter names must be treated as new auditory items. Confusion between similar-sounding letters (b/d/e/g/p/t/v) is very common. |
| EN-A1-LIS-002 | Distinguishing short vowel sounds in simple words | 2 | EN-A1-PHO-003 | Arabic has only three vowel phonemes; listening discrimination of all five English short vowels (a/e/i/o/u) requires targeted minimal-pair ear training before production. |
| EN-A1-LIS-003 | Identifying familiar A1 words when spoken slowly | 2 | EN-A1-LIS-001, EN-A1-VOC-001 | Arabic learners rely heavily on written cues; listening without visual text support is a new processing challenge that requires deliberate scaffolding. |
| EN-A1-LIS-004 | Understanding basic classroom instructions | 2 | EN-A1-LIS-003, EN-A1-VOC-010, EN-A1-GRA-018 | Imperative verbs (open, sit, write, listen) are the target; focus on action words already established in VOC-017 and the imperative structure from GRA-018. |
| EN-A1-LIS-005 | Understanding greetings and simple personal questions | 2 | EN-A1-LIS-003, EN-A1-VOC-001, EN-A1-GRA-006 | English rising intonation on yes/no questions is unfamiliar to Arabic speakers; model the intonation pattern explicitly alongside the lexical content. |
| EN-A1-LIS-006 | Understanding numbers 0–20 when spoken | 2 | EN-A1-LIS-003, EN-A1-VOC-003 | Similar-sounding number pairs (thirteen/thirty, fourteen/forty) are a known error source; scope this skill strictly to 0–20 to avoid confusion at A1. |
| EN-A1-LIS-007 | Understanding simple "to be" sentences | 3 | EN-A1-LIS-005, EN-A1-GRA-006, EN-A1-GRA-007 | Contracted speech forms (I'm, she's, they're) are harder to parse aurally than written; model both full and contracted forms before expecting comprehension of natural speech. |
| EN-A1-LIS-008 | Understanding short A1 mini-dialogues | 4 | EN-A1-LIS-007, EN-A1-LIS-004, EN-A1-VOC-001 | Processing connected speech across 2–4 turns is cognitively demanding at A1; deliver at slow native speed with familiar vocabulary only. Comprehension questions should target explicit content, not inference. |

---

## Category: Speaking (SPE)

> **MVP Pilot Note:** Speaking skills are defined here as the canonical planning reference. Automated scoring of free-speech production is **out of scope for MVP**. SPE skills may be used in structured non-automated exercises (e.g., prompted repetition, read-aloud with manual review) where explicitly approved. All SPE questions must be tagged `placement_eligible = false`. Free-speech open scoring must not be implemented in the MVP client or backend.

| Skill ID | Skill Name | Difficulty | Prerequisites | Notes for Arabic Speakers |
|---|---|---|---|---|
| EN-A1-SPE-001 | Producing English alphabet letter names | 2 | EN-A1-PHO-001, EN-A1-PHO-002, EN-A1-LIS-001 | Arabic speakers struggle most with p, v, w, g (as in "go"), and short vowel letter names (a, e, i). These must be drilled as individual items before sequencing into the alphabet. |
| EN-A1-SPE-002 | Producing common consonant sounds, especially p/v/g | 2 | EN-A1-PHO-004, EN-A1-LIS-002 | No Arabic equivalents exist for /p/, /v/, or the English /g/ (as in "go"); learners typically substitute the closest Arabic phoneme. Minimal-pair contrast drills (pen/ben, van/ban) are essential. |
| EN-A1-SPE-003 | Producing short vowel sounds in CVC words | 2 | EN-A1-PHO-005, EN-A1-LIS-002 | All five short vowels must be distinguished in production; repetitive CVC minimal-pair production (cat/cut/cot) is the core method. Arabic short-vowel habits (a/i/u only) will interfere. |
| EN-A1-SPE-004 | Saying basic greetings and polite phrases | 1 | EN-A1-VOC-001 | High-frequency social phrases (hello, thank you, goodbye, excuse me) can be learned as holistic chunks at A1. Pronunciation accuracy is secondary to communicative intent at this stage. |
| EN-A1-SPE-005 | Saying personal identity sentences | 2 | EN-A1-SPE-004, EN-A1-GRA-006, EN-A1-VOC-002 | Producing "I am…", "My name is…", and "I am from…" sentences; Arabic VSO word-order habit may cause learners to reorder the English SVO structure incorrectly. |
| EN-A1-SPE-006 | Asking and answering simple "to be" questions | 3 | EN-A1-SPE-005, EN-A1-GRA-008, EN-A1-LIS-007 | Rising question intonation ("Are you a student?") is unfamiliar; model the intonation contour explicitly. Short answers (Yes, I am / No, I'm not) must also be drilled. |
| EN-A1-SPE-007 | Producing simple present-tense sentences | 3 | EN-A1-SPE-005, EN-A1-GRA-012 | Third-person -s inflection (she reads, he eats) is absent in Arabic; this is one of the highest-frequency production errors for Arabic A1 learners and requires intensive repeated practice. |
| EN-A1-SPE-008 | Participating in a short A1 guided dialogue | 4 | EN-A1-SPE-006, EN-A1-SPE-007, EN-A1-LIS-008 | Combining real-time listening and speaking in a structured exchange is the peak A1 speaking challenge; use scripted dialogue frames with fixed turn patterns to reduce cognitive load. |

---

## Skill Prerequisite Graph (Summary)

The table below shows each skill's immediate prerequisite(s) only. Full chains are derivable by traversing the table recursively.

| Skill ID | Immediate Prerequisites |
|---|---|
| EN-A1-PHO-001 | None |
| EN-A1-PHO-002 | None |
| EN-A1-PHO-003 | EN-A1-PHO-001, EN-A1-PHO-002 |
| EN-A1-PHO-004 | EN-A1-PHO-001, EN-A1-PHO-002 |
| EN-A1-PHO-005 | EN-A1-PHO-003, EN-A1-PHO-004 |
| EN-A1-PHO-006 | EN-A1-PHO-004 |
| EN-A1-PHO-007 | EN-A1-PHO-003, EN-A1-PHO-005 |
| EN-A1-PHO-008 | EN-A1-PHO-003, EN-A1-PHO-005 |
| EN-A1-PHO-009 | EN-A1-PHO-005, EN-A1-PHO-006 |
| EN-A1-PHO-010 | EN-A1-PHO-009 |
| EN-A1-VOC-001 | None |
| EN-A1-VOC-002 | None |
| EN-A1-VOC-003 | None |
| EN-A1-VOC-004 | EN-A1-VOC-003 |
| EN-A1-VOC-005 | None |
| EN-A1-VOC-006 | EN-A1-VOC-005 |
| EN-A1-VOC-007 | EN-A1-VOC-003 |
| EN-A1-VOC-008 | None |
| EN-A1-VOC-009 | EN-A1-VOC-008 |
| EN-A1-VOC-010 | None |
| EN-A1-VOC-011 | None |
| EN-A1-VOC-012 | EN-A1-VOC-002 |
| EN-A1-VOC-013 | None |
| EN-A1-VOC-014 | EN-A1-VOC-013, EN-A1-VOC-001 |
| EN-A1-VOC-015 | None |
| EN-A1-VOC-016 | EN-A1-VOC-015 |
| EN-A1-VOC-017 | None |
| EN-A1-VOC-018 | EN-A1-VOC-017 |
| EN-A1-VOC-019 | EN-A1-VOC-010 |
| EN-A1-VOC-020 | EN-A1-VOC-019 |
| EN-A1-GRA-001 | None |
| EN-A1-GRA-002 | EN-A1-PHO-003 |
| EN-A1-GRA-003 | EN-A1-GRA-002 |
| EN-A1-GRA-004 | EN-A1-GRA-001 |
| EN-A1-GRA-005 | EN-A1-GRA-001 |
| EN-A1-GRA-006 | EN-A1-GRA-001 |
| EN-A1-GRA-007 | EN-A1-GRA-006 |
| EN-A1-GRA-008 | EN-A1-GRA-006, EN-A1-GRA-007 |
| EN-A1-GRA-009 | EN-A1-GRA-008 |
| EN-A1-GRA-010 | EN-A1-GRA-002 |
| EN-A1-GRA-011 | EN-A1-GRA-010 |
| EN-A1-GRA-012 | EN-A1-GRA-001, EN-A1-VOC-017 |
| EN-A1-GRA-013 | EN-A1-GRA-012 |
| EN-A1-GRA-014 | EN-A1-GRA-012, EN-A1-GRA-013 |
| EN-A1-GRA-015 | EN-A1-GRA-014 |
| EN-A1-GRA-016 | EN-A1-GRA-006 |
| EN-A1-GRA-017 | EN-A1-GRA-001, EN-A1-VOC-017 |
| EN-A1-GRA-018 | EN-A1-GRA-001, EN-A1-VOC-017 |
| EN-A1-GRA-019 | EN-A1-GRA-006, EN-A1-GRA-004 |
| EN-A1-GRA-020 | EN-A1-GRA-012 |
| EN-A1-READ-001 | EN-A1-PHO-001 |
| EN-A1-READ-002 | EN-A1-PHO-002 |
| EN-A1-READ-003 | EN-A1-PHO-005, EN-A1-READ-002 |
| EN-A1-READ-004 | EN-A1-READ-003 |
| EN-A1-READ-005 | EN-A1-READ-004, EN-A1-GRA-002 |
| EN-A1-READ-006 | EN-A1-READ-005, EN-A1-GRA-006 |
| EN-A1-READ-007 | EN-A1-READ-006, EN-A1-GRA-008 |
| EN-A1-READ-008 | EN-A1-READ-006, EN-A1-VOC-002 |
| EN-A1-READ-009 | EN-A1-READ-006, EN-A1-GRA-018 |
| EN-A1-READ-010 | EN-A1-READ-008, EN-A1-VOC-002 |
| EN-A1-WRITE-001 | EN-A1-PHO-001 |
| EN-A1-WRITE-002 | EN-A1-PHO-002 |
| EN-A1-WRITE-003 | EN-A1-WRITE-001, EN-A1-WRITE-002 |
| EN-A1-WRITE-004 | EN-A1-WRITE-003, EN-A1-VOC-001 |
| EN-A1-WRITE-005 | EN-A1-WRITE-004, EN-A1-GRA-002 |
| EN-A1-WRITE-006 | EN-A1-WRITE-005, EN-A1-GRA-006 |
| EN-A1-WRITE-007 | EN-A1-WRITE-006, EN-A1-GRA-012 |
| EN-A1-WRITE-008 | EN-A1-WRITE-006, EN-A1-GRA-008 |
| EN-A1-WRITE-009 | EN-A1-WRITE-008, EN-A1-VOC-009 |
| EN-A1-WRITE-010 | EN-A1-WRITE-009, EN-A1-GRA-012 |
| EN-A1-LIS-001 | EN-A1-PHO-001, EN-A1-PHO-002 |
| EN-A1-LIS-002 | EN-A1-PHO-003 |
| EN-A1-LIS-003 | EN-A1-LIS-001, EN-A1-VOC-001 |
| EN-A1-LIS-004 | EN-A1-LIS-003, EN-A1-VOC-010, EN-A1-GRA-018 |
| EN-A1-LIS-005 | EN-A1-LIS-003, EN-A1-VOC-001, EN-A1-GRA-006 |
| EN-A1-LIS-006 | EN-A1-LIS-003, EN-A1-VOC-003 |
| EN-A1-LIS-007 | EN-A1-LIS-005, EN-A1-GRA-006, EN-A1-GRA-007 |
| EN-A1-LIS-008 | EN-A1-LIS-007, EN-A1-LIS-004, EN-A1-VOC-001 |
| EN-A1-SPE-001 | EN-A1-PHO-001, EN-A1-PHO-002, EN-A1-LIS-001 |
| EN-A1-SPE-002 | EN-A1-PHO-004, EN-A1-LIS-002 |
| EN-A1-SPE-003 | EN-A1-PHO-005, EN-A1-LIS-002 |
| EN-A1-SPE-004 | EN-A1-VOC-001 |
| EN-A1-SPE-005 | EN-A1-SPE-004, EN-A1-GRA-006, EN-A1-VOC-002 |
| EN-A1-SPE-006 | EN-A1-SPE-005, EN-A1-GRA-008, EN-A1-LIS-007 |
| EN-A1-SPE-007 | EN-A1-SPE-005, EN-A1-GRA-012 |
| EN-A1-SPE-008 | EN-A1-SPE-006, EN-A1-SPE-007, EN-A1-LIS-008 |

---

## Skill Count Summary

| Category | Skill Count |
|---|---|
| PHO — Phonics and Pronunciation | 10 |
| VOC — Vocabulary | 20 |
| GRA — Grammar | 20 |
| READ — Reading | 10 |
| WRITE — Writing | 10 |
| LIS — Listening | 8 |
| SPE — Speaking | 8 |
| **Total** | **86** |

---

## Completed MVP Pilot Scope — Phase 1 Readiness Note

The full 86-skill tree is defined and ready for Phase 1. The table below records the skill subset used in the initial A1 pilot and the Phase 1 delivery status of each group.

| Group | Skills | Phase 1 Status |
|---|---|---|
| Core pilot skills | EN-A1-PHO-001 through PHO-005, EN-A1-VOC-001 through VOC-017, EN-A1-GRA-001 through GRA-018, EN-A1-READ-001 through READ-008, EN-A1-WRITE-001 through WRITE-008 | Ready. Covers foundational phonics, essential vocabulary, core grammar, basic reading, and basic writing. |
| Advanced integration skills | EN-A1-PHO-009, PHO-010, EN-A1-VOC-019, VOC-020, EN-A1-GRA-019, GRA-020, EN-A1-READ-009, READ-010, EN-A1-WRITE-009, WRITE-010 | Ready for Phase 1. These integrate multiple skill areas; sequence after pilot cohort baseline is established. |
| LIS — audio delivery dependency | EN-A1-LIS-001 through LIS-008 | Skills are fully defined. Enable once audio delivery infrastructure is confirmed in Phase 1. |
| SPE — scoring infrastructure dependency | EN-A1-SPE-001 through SPE-008 | Skills are fully defined. Enable once automated or structured scoring pipeline is confirmed in Phase 1. |

---

## Notes for Arabic-Speaking A1 Learners

| Area | Common Transfer Issue | Implication for Skill Design |
|---|---|---|
| Script direction | Arabic is right-to-left; English is left-to-right. | Letter recognition tasks must explicitly reinforce left-to-right reading direction. |
| Vowel system | Arabic has three vowel sounds; English has many more. | Short vowel skills (PHO-003) need more repetition and discrimination practice. |
| Grammar structure | Arabic uses VSO word order; English uses SVO. | GRA-020 (word order) is a high-error area; include explicit negative examples. |
| Third-person -s | Arabic verbs do not have a third-person -s inflection. | GRA-012 needs focused practice on she reads, he eats, etc. |
| Definite article | Arabic uses ال (al-) but rules differ from English the. | GRA-003 must distinguish from Arabic article usage explicitly. |
| P and V sounds | No equivalent for p and v in most Arabic dialects. | PHO-004 should include extra discrimination exercises for these phonemes. |
| Silent letters | Arabic script is largely phonemic; silent letters are unexpected. | PHO-007 (silent-e rule) needs explicit instruction and visual support. |

---

## Assumptions

- This skill tree covers CEFR A1 level only. A2 and above are out of scope for the MVP pilot.
- Skill IDs defined here are stable references for Phase 1 content and AIM Engine question metadata.
- PHO skills support reading and writing but may be partially tested via audio in later phases; Phase 0 treats them as text-based for planning.
- The pilot will not require all 70 skills to be covered in lessons; the subset defined in the MVP Pilot Skill Scope section is the minimum needed.
- Skill difficulty levels (1–4) are relative within A1 only, not aligned to post-A1 levels.

## Open Questions

| Question | Current Handling |
|---|---|
| Should Speaking/Oral Production be a separate skill category in the MVP? | Resolved. SPE is now a defined skill category (EN-A1-SPE-001 through SPE-008). Automated free-speech scoring remains out of MVP scope; SPE skills require manual review or structured non-automated exercises until scoring is confirmed. |
| Should Listening be a separate skill category? | Resolved. LIS is now a defined skill category (EN-A1-LIS-001 through LIS-008). Serving LIS questions requires confirmed audio delivery infrastructure; all LIS skills are tagged deferred until audio is confirmed. |
| Which exact skills will each of the 6–10 pilot lessons cover? | To be decided in P0-011 (Define Lesson Content Structure). |
| Should placement test questions map to specific skill IDs from this tree? | Yes, this is the expected design. Placement test strategy (P0-010) should reference skill IDs from this document. LIS and SPE are excluded from placement in MVP. |
| Are common error tags aligned to skill IDs or defined separately? | To be defined in P0-012 (Define Question Bank Standards). Common error tags should reference skill IDs. |
| Should pilot lessons group skills by topic (e.g., one lesson covers VOC and GRA together) or by skill type? | Open decision. Topic-grouped lessons are more learner-friendly. Skill-type grouping is more AIM-efficient. Defer to lesson structure planning. |

## Related Documents

- `docs/product/mvp-scope.md`
- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependency checked: P0-004 (`docs/product/mvp-scope.md`) is present and meaningful.
- This document has a title, purpose, scope, skill ID format, five skill categories with full skill tables, prerequisite graph, count summary, MVP pilot scope, Arabic-learner notes, assumptions, open questions, and related documents.
- No runtime source code, Student Web App, Flutter AIM logic, database migrations, or backend implementation was added.
- Task is ready to mark Done in Notion.

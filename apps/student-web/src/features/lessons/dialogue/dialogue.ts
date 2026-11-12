// Pure helpers for dialogue lessons: read "Man: Hello! Woman: Hi!" scripts and decide which
// character plays each speaker. No React, no network; everything is deterministic.
import { CHARACTERS, FEMALE_POOL, MALE_POOL, type Character, type Gender } from './characters';

export interface DialogueLine {
  speaker: string;
  text: string;
}

/** A speaker label sits at the start of the script or right after the end of a sentence: "Man: " / "Shop assistant: ". */
const LABEL = /(^|[.!?…"”’')]\s+)([A-Z][A-Za-z]{1,14}(?: [A-Za-z]{1,14})?):\s+/g;

export const MAX_SPEAKERS = 4;

/**
 * Split a script into spoken lines. Returns null when it is not a conversation: it must start with a speaker
 * label, have at least two lines and two different speakers (a lone "Note: …" or "Now: …" is just text).
 */
export function parseDialogue(script: string | null | undefined): DialogueLine[] | null {
  const text = (script ?? '').trim();
  if (!text) return null;
  const marks: { speaker: string; start: number; end: number }[] = [];
  for (const m of text.matchAll(LABEL)) {
    const start = (m.index ?? 0) + m[1].length;
    marks.push({ speaker: m[2], start, end: (m.index ?? 0) + m[0].length });
  }
  if (marks.length < 2 || marks[0].start !== 0) return null;
  const lines: DialogueLine[] = marks.map((mk, i) => ({
    speaker: mk.speaker,
    text: text.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : undefined).trim(),
  }));
  if (lines.some((l) => !l.text)) return null;
  const speakers = new Set(lines.map((l) => l.speaker));
  if (speakers.size < 2 || speakers.size > MAX_SPEAKERS) return null;
  return lines;
}

const MALE_WORDS = ['boy', 'man', 'male', 'father', 'dad', 'daddy', 'brother', 'son', 'husband', 'gentleman', 'grandfather', 'grandpa', 'uncle', 'mr', 'sir'];
const FEMALE_WORDS = ['girl', 'woman', 'female', 'mother', 'mom', 'mum', 'mummy', 'sister', 'daughter', 'wife', 'lady', 'grandmother', 'grandma', 'aunt', 'mrs', 'ms', 'miss', 'madam', 'waitress'];

/** Gender a speaker label points to ("Girl", "Woman"), or null for neutral roles such as "Doctor" or "Waiter". */
export function genderOf(label: string): Gender | null {
  const word = label.trim().toLowerCase();
  if (MALE_WORDS.includes(word)) return 'male';
  if (FEMALE_WORDS.includes(word)) return 'female';
  return null;
}

/** Small stable number from text, so the same lesson always gets the same cast. */
export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Pick a character for each speaker, in order of first appearance.
 * Labels that name a gender get a matching character; neutral roles take the opposite gender of the previous
 * speaker so a scene looks mixed. Nobody is used twice. Different lessons rotate through the cast via `seed`.
 */
export function assignCharacters(speakers: string[], seed: string): Character[] {
  const n = hashSeed(seed);
  const used = new Set<string>();
  const cast: Character[] = [];
  speakers.forEach((label, i) => {
    let gender = genderOf(label);
    if (!gender) {
      const prev = cast[cast.length - 1];
      gender = prev ? (prev.gender === 'male' ? 'female' : 'male') : n % 2 === 0 ? 'male' : 'female';
    }
    const pool = gender === 'male' ? MALE_POOL : FEMALE_POOL;
    const free = pool.filter((id) => !used.has(id));
    const everyone = [...MALE_POOL, ...FEMALE_POOL].filter((id) => !used.has(id));
    const options = free.length > 0 ? free : everyone;
    const id = options[(n + i) % options.length];
    used.add(id);
    cast.push(CHARACTERS[id]);
  });
  return cast;
}

export function uniqueSpeakers(lines: DialogueLine[]): string[] {
  return Array.from(new Set(lines.map((l) => l.speaker)));
}

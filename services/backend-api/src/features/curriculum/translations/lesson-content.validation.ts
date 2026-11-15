import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

/**
 * Shape of lesson_translations.content (JSONB):
 *   { explanation?: LessonExplanation-shaped, teachingOutline?: string[],
 *     assets?: { [lessonAssetId]: { title?, description?, metadata? } } }
 * Validated strictly (unknown keys rejected) and size-capped before it is stored.
 */

export const LESSON_CONTENT_MAX_BYTES = 200_000;
const MAX_SECTIONS = 40;
const MAX_EXAMPLES = 40;
const MAX_LIST = 60;
const MAX_ASSETS = 200;
const TEXT_MAX = 20_000;
const SHORT_MAX = 1_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(message: string): never {
  throw new AppError({
    code: ApiErrorCode.VALIDATION_ERROR,
    message: `Invalid translation content: ${message}`,
    statusCode: HttpStatus.BAD_REQUEST,
  });
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function onlyKeys(obj: Record<string, unknown>, allowed: readonly string[], path: string): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) fail(`${path}: unknown field "${key}"`);
  }
}

function str(v: unknown, path: string, max: number, required = true): string | undefined {
  if (v === undefined || v === null) {
    if (required) fail(`${path} is required`);
    return undefined;
  }
  if (typeof v !== 'string') fail(`${path} must be a string`);
  if (required && v.trim().length === 0) fail(`${path} must not be empty`);
  if (v.length > max) fail(`${path} must be at most ${max} characters`);
  return v;
}

function arr(v: unknown, path: string, max: number): unknown[] {
  if (!Array.isArray(v)) fail(`${path} must be an array`);
  if (v.length > max) fail(`${path} must have at most ${max} items`);
  return v;
}

function validateExplanation(raw: unknown): Record<string, unknown> {
  if (!isObject(raw)) fail('explanation must be an object');
  onlyKeys(raw, ['overview', 'sections', 'keyPoints', 'commonMistakes', 'recap'], 'explanation');
  const out: Record<string, unknown> = {};
  out.overview = str(raw.overview, 'explanation.overview', TEXT_MAX);
  out.sections = arr(raw.sections, 'explanation.sections', MAX_SECTIONS).map((s, i) => {
    const p = `explanation.sections[${i}]`;
    if (!isObject(s)) fail(`${p} must be an object`);
    onlyKeys(s, ['heading', 'body', 'examples'], p);
    const section: Record<string, unknown> = {
      heading: str(s.heading, `${p}.heading`, SHORT_MAX),
      body: str(s.body, `${p}.body`, TEXT_MAX),
    };
    if (s.examples !== undefined) {
      section.examples = arr(s.examples, `${p}.examples`, MAX_EXAMPLES).map((e, j) => {
        const ep = `${p}.examples[${j}]`;
        if (!isObject(e)) fail(`${ep} must be an object`);
        onlyKeys(e, ['text', 'note'], ep);
        const ex: Record<string, unknown> = { text: str(e.text, `${ep}.text`, SHORT_MAX) };
        const note = str(e.note, `${ep}.note`, SHORT_MAX, false);
        if (note !== undefined) ex.note = note;
        return ex;
      });
    }
    return section;
  });
  out.keyPoints = arr(raw.keyPoints, 'explanation.keyPoints', MAX_LIST).map((k, i) =>
    str(k, `explanation.keyPoints[${i}]`, SHORT_MAX),
  );
  if (raw.commonMistakes !== undefined) {
    out.commonMistakes = arr(raw.commonMistakes, 'explanation.commonMistakes', MAX_LIST).map((m, i) => {
      const p = `explanation.commonMistakes[${i}]`;
      if (!isObject(m)) fail(`${p} must be an object`);
      onlyKeys(m, ['wrong', 'right', 'why'], p);
      return {
        wrong: str(m.wrong, `${p}.wrong`, SHORT_MAX),
        right: str(m.right, `${p}.right`, SHORT_MAX),
        why: str(m.why, `${p}.why`, SHORT_MAX),
      };
    });
  }
  const recap = str(raw.recap, 'explanation.recap', TEXT_MAX, false);
  if (recap !== undefined) out.recap = recap;
  return out;
}

function validateAssets(raw: unknown): Record<string, unknown> {
  if (!isObject(raw)) fail('assets must be an object keyed by lesson asset id');
  const keys = Object.keys(raw);
  if (keys.length > MAX_ASSETS) fail(`assets must have at most ${MAX_ASSETS} entries`);
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const p = `assets.${key}`;
    if (!UUID_RE.test(key)) fail(`${p}: key must be a lesson asset id (uuid)`);
    const a = raw[key];
    if (!isObject(a)) fail(`${p} must be an object`);
    onlyKeys(a, ['title', 'description', 'metadata'], p);
    const entry: Record<string, unknown> = {};
    const title = str(a.title, `${p}.title`, SHORT_MAX, false);
    if (title !== undefined) entry.title = title;
    const description = str(a.description, `${p}.description`, TEXT_MAX, false);
    if (description !== undefined) entry.description = description;
    if (a.metadata !== undefined && a.metadata !== null) {
      if (!isObject(a.metadata)) fail(`${p}.metadata must be an object`);
      entry.metadata = a.metadata;
    }
    out[key] = entry;
  }
  return out;
}

/** Returns the sanitised content to store, or null for "clear". Throws a 400 AppError on any violation. */
export function validateLessonContent(raw: unknown): Record<string, unknown> | null {
  if (raw === null) return null;
  if (!isObject(raw)) fail('content must be an object or null');
  onlyKeys(raw, ['explanation', 'teachingOutline', 'assets'], 'content');
  const out: Record<string, unknown> = {};
  if (raw.explanation !== undefined) out.explanation = validateExplanation(raw.explanation);
  if (raw.teachingOutline !== undefined) {
    out.teachingOutline = arr(raw.teachingOutline, 'teachingOutline', MAX_LIST * 2).map((t, i) =>
      str(t, `teachingOutline[${i}]`, SHORT_MAX),
    );
  }
  if (raw.assets !== undefined) out.assets = validateAssets(raw.assets);
  if (Buffer.byteLength(JSON.stringify(out), 'utf8') > LESSON_CONTENT_MAX_BYTES) {
    fail(`content must be at most ${LESSON_CONTENT_MAX_BYTES} bytes`);
  }
  return out;
}

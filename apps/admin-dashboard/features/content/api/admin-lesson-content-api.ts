// P11-026: Admin lesson content blocks API client.
// Backend is final authority for lesson content blocks.

import { adminApiClient } from '../../../core/api';

export type ContentBlockType = 'text' | 'image' | 'video' | 'audio' | 'exercise' | 'vocabulary';

export type AdminContentBlock = {
  readonly id: string;
  readonly lessonId: string;
  readonly type: ContentBlockType;
  readonly title: string;
  readonly content: string;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminContentBlockListData = {
  readonly blocks: AdminContentBlock[];
  readonly total: number;
};

export type CreateContentBlockPayload = {
  readonly type: ContentBlockType;
  readonly title: string;
  readonly content: string;
  readonly sortOrder?: number;
};

export type UpdateContentBlockPayload = {
  readonly title?: string;
  readonly content?: string;
  readonly sortOrder?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeContentBlock(value: unknown): AdminContentBlock {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid content block response shape.');
  }
  return {
    id: value.id,
    lessonId: typeof value.lessonId === 'string' ? value.lessonId : '',
    type: (value.type ?? 'text') as ContentBlockType,
    title: typeof value.title === 'string' ? value.title : '',
    content: typeof value.content === 'string' ? value.content : '',
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeContentBlockList(value: unknown): AdminContentBlockListData {
  if (!isObject(value) || !Array.isArray(value.blocks)) {
    throw new Error('Invalid content block list response shape.');
  }
  return {
    blocks: value.blocks.map(decodeContentBlock),
    total: typeof value.total === 'number' ? value.total : 0,
  };
}

// The backend has no /content-blocks route. Lesson content lives in
// lessons.explanation (JSONB) and lesson_assets, so blocks are a view over those:
//   ids "<lessonId>:overview | section-N | key-points | common-mistakes | recap"
//   -> parts of lessons.explanation; any other id -> a lesson_assets row.
type Explanation = {
  overview: string;
  sections: Array<{ heading: string; body: string; examples?: unknown[] }>;
  keyPoints: string[];
  commonMistakes?: Array<{ wrong: string; right: string; why: string }>;
  recap?: string;
};

const MEDIA_TYPES = ['image', 'video', 'audio'];

function asRecord(v: unknown): Record<string, unknown> {
  return isObject(v) ? v : {};
}
function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*[-•]\s*/, '').trim())
    .filter(Boolean);
}
function normalizeExplanation(raw: unknown): Explanation {
  const ex = asRecord(raw);
  return {
    overview: str(ex.overview),
    sections: (Array.isArray(ex.sections) ? ex.sections : []).map((r) => {
      const sec = asRecord(r);
      return {
        heading: str(sec.heading),
        body: str(sec.body),
        examples: Array.isArray(sec.examples) ? sec.examples : undefined,
      };
    }),
    keyPoints: (Array.isArray(ex.keyPoints) ? ex.keyPoints : []).map(str).filter(Boolean),
    commonMistakes: (Array.isArray(ex.commonMistakes) ? ex.commonMistakes : []).map((r) => {
      const m = asRecord(r);
      return { wrong: str(m.wrong), right: str(m.right), why: str(m.why) };
    }),
    recap: str(ex.recap),
  };
}

function explanationToBlocks(
  lessonId: string,
  lesson: Record<string, unknown>,
  ex: Explanation,
): AdminContentBlock[] {
  const createdAt = String(lesson.createdAt ?? '');
  const updatedAt = String(lesson.updatedAt ?? '');
  const out: AdminContentBlock[] = [];
  const push = (key: string, title: string, content: string) => {
    if (!content.trim()) return;
    out.push({
      id: `${lessonId}:${key}`,
      lessonId,
      type: 'text',
      title,
      content,
      sortOrder: out.length + 1,
      createdAt,
      updatedAt,
    });
  };
  push('overview', 'Overview', ex.overview);
  ex.sections.forEach((sec, i) => push(`section-${i}`, sec.heading || `Section ${i + 1}`, sec.body));
  push('key-points', 'Key points', ex.keyPoints.map((k) => `- ${k}`).join('\n'));
  push(
    'common-mistakes',
    'Common mistakes (one per line: wrong | right | why)',
    (ex.commonMistakes ?? []).map((m) => `${m.wrong} | ${m.right} | ${m.why}`).join('\n'),
  );
  push('recap', 'Recap', ex.recap ?? '');
  return out;
}

async function getLessonRecord(token: string, lessonId: string): Promise<Record<string, unknown>> {
  const env = await adminApiClient.get<Record<string, unknown>>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
    (v) => asRecord(v),
    { headers: { authorization: `Bearer ${token}` } },
  );
  return env.data;
}

async function saveExplanation(token: string, lessonId: string, ex: Explanation): Promise<void> {
  await adminApiClient.patch<Record<string, unknown>>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
    (v) => asRecord(v),
    { headers: { authorization: `Bearer ${token}` }, body: { explanation: ex } },
  );
}

function assetToBlock(lessonId: string, a: Record<string, unknown>, order: number): AdminContentBlock {
  const t = str(a.type);
  const type: ContentBlockType = (['image', 'video', 'audio', 'vocabulary', 'exercise'] as string[]).includes(t)
    ? (t as ContentBlockType)
    : 'text';
  return {
    id: str(a.id),
    lessonId,
    type,
    title: str(a.title),
    content: MEDIA_TYPES.includes(t) ? str(a.url) : str(a.description),
    sortOrder: order,
    createdAt: String(a.createdAt ?? ''),
    updatedAt: String(a.updatedAt ?? ''),
  };
}

function assetBody(type: string, content: string): Record<string, unknown> {
  return MEDIA_TYPES.includes(type) ? { url: content } : { description: content };
}

export async function fetchLessonContentBlocks(
  token: string,
  lessonId: string,
): Promise<AdminContentBlockListData> {
  const headers = { authorization: `Bearer ${token}` };
  const [lesson, assetsEnv] = await Promise.all([
    getLessonRecord(token, lessonId),
    adminApiClient.get<Record<string, unknown>>(
      '/curriculum/lesson-assets',
      (v) => asRecord(v),
      { headers, query: { lessonId, limit: 100 } },
    ),
  ]);
  const blocks = explanationToBlocks(lessonId, lesson, normalizeExplanation(lesson.explanation));
  const assets = Array.isArray(assetsEnv.data.assets) ? assetsEnv.data.assets : [];
  for (const raw of assets) {
    const a = asRecord(raw);
    if (str(a.status) === 'archived') continue;
    blocks.push(assetToBlock(lessonId, a, blocks.length + 1));
  }
  return { blocks, total: blocks.length };
}

export async function createLessonContentBlock(
  token: string,
  lessonId: string,
  payload: CreateContentBlockPayload,
): Promise<AdminContentBlock> {
  if (payload.type === 'text') {
    const lesson = await getLessonRecord(token, lessonId);
    const ex = normalizeExplanation(lesson.explanation);
    ex.sections.push({ heading: payload.title, body: payload.content });
    await saveExplanation(token, lessonId, ex);
    const i = ex.sections.length - 1;
    return {
      id: `${lessonId}:section-${i}`,
      lessonId,
      type: 'text',
      title: payload.title,
      content: payload.content,
      sortOrder: i + 1,
      createdAt: '',
      updatedAt: '',
    };
  }
  const existing = await fetchLessonContentBlocks(token, lessonId);
  const env = await adminApiClient.post<Record<string, unknown>>(
    '/curriculum/lesson-assets',
    (v) => asRecord(v),
    {
      headers: { authorization: `Bearer ${token}` },
      body: {
        lessonId,
        type: payload.type,
        title: payload.title,
        order: payload.sortOrder && payload.sortOrder > 0 ? payload.sortOrder : existing.total + 1,
        ...assetBody(payload.type, payload.content),
      },
    },
  );
  return assetToBlock(lessonId, env.data, existing.total + 1);
}

export async function updateLessonContentBlock(
  token: string,
  lessonId: string,
  blockId: string,
  payload: UpdateContentBlockPayload,
): Promise<AdminContentBlock> {
  const key = blockId.startsWith(`${lessonId}:`) ? blockId.slice(lessonId.length + 1) : null;
  if (key) {
    const lesson = await getLessonRecord(token, lessonId);
    const ex = normalizeExplanation(lesson.explanation);
    const content = payload.content;
    if (key === 'overview' && content !== undefined) ex.overview = content;
    else if (key === 'recap' && content !== undefined) ex.recap = content;
    else if (key === 'key-points' && content !== undefined) ex.keyPoints = lines(content);
    else if (key === 'common-mistakes' && content !== undefined) {
      ex.commonMistakes = lines(content).map((l) => {
        const [wrong = '', right = '', ...why] = l.split('|').map((p) => p.trim());
        return { wrong, right, why: why.join(' | ') };
      });
    } else if (key.startsWith('section-')) {
      const sec = ex.sections[Number(key.slice(8))];
      if (!sec) throw new Error('Section no longer exists. Reload the page.');
      if (payload.title !== undefined) sec.heading = payload.title;
      if (content !== undefined) sec.body = content;
    }
    await saveExplanation(token, lessonId, ex);
    const block = explanationToBlocks(lessonId, lesson, ex).find((b) => b.id === blockId);
    return (
      block ?? {
        id: blockId, lessonId, type: 'text', title: payload.title ?? '',
        content: content ?? '', sortOrder: 0, createdAt: '', updatedAt: '',
      }
    );
  }

  const headers = { authorization: `Bearer ${token}` };
  const current = await adminApiClient.get<Record<string, unknown>>(
    `/curriculum/lesson-assets/${encodeURIComponent(blockId)}`,
    (v) => asRecord(v),
    { headers },
  );
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.content !== undefined) Object.assign(body, assetBody(str(current.data.type), payload.content));
  if (payload.sortOrder !== undefined && payload.sortOrder > 0) body.order = payload.sortOrder;
  const env = await adminApiClient.patch<Record<string, unknown>>(
    `/curriculum/lesson-assets/${encodeURIComponent(blockId)}`,
    (v) => asRecord(v),
    { headers, body },
  );
  return assetToBlock(lessonId, env.data, payload.sortOrder ?? 0);
}

export async function deleteLessonContentBlock(
  token: string,
  lessonId: string,
  blockId: string,
): Promise<void> {
  const key = blockId.startsWith(`${lessonId}:`) ? blockId.slice(lessonId.length + 1) : null;
  if (key) {
    const lesson = await getLessonRecord(token, lessonId);
    const ex = normalizeExplanation(lesson.explanation);
    if (key === 'overview') ex.overview = '';
    else if (key === 'recap') ex.recap = '';
    else if (key === 'key-points') ex.keyPoints = [];
    else if (key === 'common-mistakes') ex.commonMistakes = [];
    else if (key.startsWith('section-')) ex.sections.splice(Number(key.slice(8)), 1);
    await saveExplanation(token, lessonId, ex);
    return;
  }
  await adminApiClient.post(
    `/curriculum/lesson-assets/${encodeURIComponent(blockId)}/archive`,
    (v) => asRecord(v),
    { headers: { authorization: `Bearer ${token}` } },
  );
}

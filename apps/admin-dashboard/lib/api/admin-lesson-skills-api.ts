// Phase 3 — P3-058
// Admin lesson-skills API client.
//
// Critical rule: Every published lesson must be linked to at least one skill.
// This client calls the backend lesson-skills endpoints. The backend enforces
// the lesson-skill requirement at publish time. The UI enforces it visually
// but is NOT the authority — backend is.
//
// Endpoints consumed:
//   GET    /curriculum/lessons/:lessonId/skills
//   POST   /curriculum/lessons/:lessonId/skills        body: { skillId }
//   DELETE /curriculum/lessons/:lessonId/skills/:skillId

import { adminApiClient } from './index';

export type AdminLessonSkillLink = {
  readonly lessonId: string;
  readonly skillId: string;
  readonly createdAt: string;
};

export type AdminLessonSkillListData = {
  readonly links: AdminLessonSkillLink[];
  readonly total: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeLessonSkillLink(value: unknown): AdminLessonSkillLink {
  if (!isObject(value) || typeof value.lessonId !== 'string' || typeof value.skillId !== 'string') {
    throw new Error('Invalid lesson-skill link response shape.');
  }
  return {
    lessonId: value.lessonId,
    skillId: value.skillId,
    createdAt: String(value.createdAt ?? ''),
  };
}

function decodeLessonSkillListData(value: unknown): AdminLessonSkillListData {
  if (!isObject(value) || !Array.isArray(value.links)) {
    throw new Error('Invalid lesson-skill list response shape.');
  }
  return {
    links: value.links.map(decodeLessonSkillLink),
    total: typeof value.total === 'number' ? value.total : 0,
  };
}

function decodeVoid(_value: unknown): null {
  return null;
}

export async function fetchLessonSkillLinks(
  token: string,
  lessonId: string,
): Promise<AdminLessonSkillListData> {
  const envelope = await adminApiClient.get<AdminLessonSkillListData>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/skills`,
    decodeLessonSkillListData,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export async function addSkillToLesson(
  token: string,
  lessonId: string,
  skillId: string,
): Promise<AdminLessonSkillLink> {
  const envelope = await adminApiClient.post<AdminLessonSkillLink>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/skills`,
    decodeLessonSkillLink,
    { headers: { authorization: `Bearer ${token}` }, body: { skillId } },
  );
  return envelope.data;
}

export async function removeSkillFromLesson(
  token: string,
  lessonId: string,
  skillId: string,
): Promise<void> {
  await adminApiClient.delete<null>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/skills/${encodeURIComponent(skillId)}`,
    decodeVoid,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

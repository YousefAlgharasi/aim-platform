// Admin question-skills API client.
//
// Reads the backend's question-skill links so admin UI can show whether a
// question has been linked to at least one skill, instead of assuming.
//
// Endpoint consumed:
//   GET /curriculum/questions/:questionId/skills

import { adminApiClient } from '../../../core/api';

export type AdminQuestionSkillLink = {
  readonly questionId: string;
  readonly skillId: string;
  readonly isPrimary: boolean;
  readonly createdAt: string;
};

export type AdminQuestionSkillListData = {
  readonly links: AdminQuestionSkillLink[];
  readonly total: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeQuestionSkillLink(value: unknown): AdminQuestionSkillLink {
  if (!isObject(value) || typeof value.questionId !== 'string' || typeof value.skillId !== 'string') {
    throw new Error('Invalid question-skill link response shape.');
  }
  return {
    questionId: value.questionId,
    skillId: value.skillId,
    isPrimary: Boolean(value.isPrimary),
    createdAt: String(value.createdAt ?? ''),
  };
}

function decodeQuestionSkillListData(value: unknown): AdminQuestionSkillListData {
  if (!isObject(value) || !Array.isArray(value.links)) {
    throw new Error('Invalid question-skill list response shape.');
  }
  return {
    links: value.links.map(decodeQuestionSkillLink),
    total: typeof value.total === 'number' ? value.total : 0,
  };
}

export async function fetchQuestionSkillLinks(
  token: string,
  questionId: string,
): Promise<AdminQuestionSkillListData> {
  const envelope = await adminApiClient.get<AdminQuestionSkillListData>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/skills`,
    decodeQuestionSkillListData,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

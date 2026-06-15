// Phase 3 — P3-058
// Admin lesson skill linking page.
//
// Priority: P0 — Critical Phase 3 requirement.
//
// Every lesson must be linked to one or more skills before it can be published.
// The backend enforces this at publish time. This UI makes the requirement
// visible and actionable for content managers.
//
// Security:
// - Token is read server-side from HTTP-only cookie; never sent to the browser.
// - Backend is the authority for skill keys, lesson status, and publish rules.
// - This page does not implement publish/archive actions.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../../lib/api';
import {
  fetchLessonSkillLinks,
  addSkillToLesson,
  removeSkillFromLesson,
  type AdminLessonSkillListData,
} from '../../../../../../lib/api/admin-lesson-skills-api';
import {
  fetchAdminSkillsForPicker,
  type AdminSkillListData,
} from '../../../../../../lib/api/admin-skills-api';
import { SkillLinker } from './skill-linker';

type Props = {
  params: Promise<{ lessonId: string }>;
};

async function getLessonTitle(token: string, lessonId: string): Promise<string> {
  try {
    const { adminApiClient } = await import('../../../../../../lib/api');

    function isObj(v: unknown): v is Record<string, unknown> {
      return typeof v === 'object' && v !== null;
    }

    const envelope = await adminApiClient.get<{ title: string; status: string }>(
      `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
      (v) => {
        if (!isObj(v) || typeof (v as Record<string, unknown>).title !== 'string') throw new Error('bad');
        return { title: String((v as Record<string, unknown>).title), status: String((v as Record<string, unknown>).status ?? 'draft') };
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return `${envelope.data.title}|||${envelope.data.status}`;
  } catch {
    return `Lesson ${lessonId}|||draft`;
  }
}

export default async function LessonSkillLinkerPage({ params }: Props) {
  const { lessonId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let skillLinks: AdminLessonSkillListData | null = null;
  let availableSkills: AdminSkillListData | null = null;
  let fetchError: string | null = null;
  let lessonTitle = `Lesson ${lessonId}`;
  let lessonStatus = 'draft';

  const lessonInfo = await getLessonTitle(token, lessonId);
  const [parsedTitle, parsedStatus] = lessonInfo.split('|||');
  lessonTitle = parsedTitle;
  lessonStatus = parsedStatus;

  try {
    [skillLinks, availableSkills] = await Promise.all([
      fetchLessonSkillLinks(token, lessonId),
      fetchAdminSkillsForPicker(token),
    ]);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load skill data. Check backend connectivity.';
  }

  async function handleAddSkill(skillId: string): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await addSkillToLesson(token, lessonId, skillId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to link skill.';
      return { error: msg };
    }
  }

  async function handleRemoveSkill(skillId: string): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await removeSkillFromLesson(token, lessonId, skillId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to remove skill link.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/content/lessons">Lessons</Link>
        <span aria-hidden="true">/</span>
        <span>Skill Links</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum — P0</p>
        <h1>Lesson Skill Links</h1>
        <p className="admin-page-meta">
          Every lesson must be linked to at least one skill before it can be published.
          The AIM Engine uses skill links to track what each lesson develops in the student.
        </p>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {skillLinks && availableSkills && (
        <SkillLinker
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          lessonStatus={lessonStatus}
          linkedSkills={skillLinks.links}
          availableSkills={availableSkills.skills}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />
      )}
    </section>
  );
}

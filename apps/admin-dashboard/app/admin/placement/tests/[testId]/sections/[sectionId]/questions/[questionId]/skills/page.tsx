// Phase 4 — P4-057
// Admin placement question skills page (server component).
//
// Route: /admin/placement/tests/[testId]/sections/[sectionId]/questions/[questionId]/skills
//
// Scope: Placement Test phase only — admin UI to link placement questions to skills.
//
// Security rules:
// - Only pilot_admin and content_manager roles may access this page.
// - Role enforcement is the backend's responsibility (placement:admin:questions:manage permission).
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - correct_answer is NEVER fetched, stored, or rendered here or in any child component.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
// - is_primary constraint (exactly one per question before activation) enforced by backend.
//
// Backend dependency:
// GET    /admin/placement/questions/:questionId/skills  — declared in P4-006 API map
// POST   /admin/placement/questions/:questionId/skills
// DELETE /admin/placement/questions/:questionId/skills/:skillId
// PATCH  /admin/placement/questions/:questionId/skills/:skillId
// If endpoints not yet deployed, the page renders a clear notice and does not crash.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../../../../../../../lib/auth';
import {
  fetchPlacementQuestionSkillLinks,
  addPlacementQuestionSkillLink,
  removePlacementQuestionSkillLink,
  setPrimaryPlacementQuestionSkillLink,
  AdminApiClientError,
} from '../../../../../../../../../../../../lib/api/admin-placement-question-skills-api';
import {
  fetchAdminSkillsForPicker,
  type AdminSkillSummary,
} from '../../../../../../../../../../../../lib/api/admin-skills-api';
import { fetchAdminPlacementQuestions } from '../../../../../../../../../../../../lib/api/admin-placement-questions-api';
import { PlacementQuestionSkillLinker } from './placement-question-skill-linker';
import type { PlacementQuestionSkillLinksData } from '../../../../../../../../../../../../lib/api/admin-placement-question-skills-api';

type Props = {
  params: Promise<{ testId: string; sectionId: string; questionId: string }>;
};

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AdminApiClientError) {
    const e = error as { status?: number; message: string };
    return `Backend error ${e.status ?? ''}: ${e.message}`;
  }
  return fallback;
}

export default async function AdminPlacementQuestionSkillsPage({ params }: Props) {
  const { testId, sectionId, questionId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // Fetch existing skill links for this question
  let linksData: PlacementQuestionSkillLinksData | null = null;
  let linksError: string | null = null;
  let backendUnavailable = false;

  try {
    linksData = await fetchPlacementQuestionSkillLinks(token, questionId);
  } catch (err) {
    const error = err as Record<string, unknown> | null;
    const status = typeof error?.['status'] === 'number' ? error['status'] : 0;
    if (status === 404 || status === 501 || status === 503) {
      backendUnavailable = true;
    } else {
      linksError = toErrorMessage(
        err,
        'Failed to load skill links. Check backend connectivity.',
      );
    }
  }

  // Fetch available published skills for the picker
  let skillsError: string | null = null;
  let availableSkills: AdminSkillSummary[] = [];

  try {
    const skillsData = await fetchAdminSkillsForPicker(token);
    availableSkills = skillsData.skills;
  } catch (error) {
    skillsError = toErrorMessage(
      error,
      'Could not load skills list. Check backend connectivity.',
    );
  }

  // Fetch question metadata for context display (prompt, skillCode)
  // No correct_answer is ever fetched — admin inspection metadata only.
  let questionPrompt = `Question …${questionId.slice(-8)}`;
  let questionSkillCode = '';

  try {
    const questionsData = await fetchAdminPlacementQuestions(token, sectionId);
    const question = questionsData.questions.find(
      (q: { id: string; prompt: string; skillCode: string }) => q.id === questionId,
    );
    if (question) {
      questionPrompt =
        question.prompt.length > 60
          ? `${question.prompt.slice(0, 60)}…`
          : question.prompt;
      questionSkillCode = question.skillCode;
    }
  } catch {
    // Non-critical — metadata display only; skill linking still works without it
  }

  // ---------------------------------------------------------------------------
  // Server actions — called from the client component via prop injection.
  // Token is captured in closure; never sent to the browser.
  // ---------------------------------------------------------------------------

  async function handleAdd(
    skillId: string,
    isPrimary: boolean,
  ): Promise<{ error?: string }> {
    'use server';
    try {
      await addPlacementQuestionSkillLink(token, questionId, { skillId, isPrimary });
      return {};
    } catch (error) {
      return { error: toErrorMessage(error, 'Failed to add skill link. Check backend connectivity.') };
    }
  }

  async function handleRemove(skillId: string): Promise<{ error?: string }> {
    'use server';
    try {
      await removePlacementQuestionSkillLink(token, questionId, skillId);
      return {};
    } catch (error) {
      return { error: toErrorMessage(error, 'Failed to remove skill link. Check backend connectivity.') };
    }
  }

  async function handleSetPrimary(skillId: string): Promise<{ error?: string }> {
    'use server';
    try {
      await setPrimaryPlacementQuestionSkillLink(token, questionId, skillId);
      return {};
    } catch (error) {
      return { error: toErrorMessage(error, 'Failed to set primary skill. Check backend connectivity.') };
    }
  }

  return (
    <section className="admin-curriculum-page">
      {/* Breadcrumb */}
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/placement">Placement</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/placement/tests">Tests</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/placement/tests/${testId}/sections`}>Sections</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/placement/tests/${testId}/sections/${sectionId}/questions`}>
          Questions
        </Link>
        <span aria-hidden="true">/</span>
        <span>Skills</span>
      </nav>

      {/* Page header */}
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Placement</p>
        <h1>Placement Question Skills</h1>
        {linksData && (
          <p className="admin-page-meta">
            {linksData.links.length} skill{linksData.links.length !== 1 ? 's' : ''} linked
          </p>
        )}
      </header>

      {/* Security boundary note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Skill links are managed by the backend.{' '}
        <strong>correct_answer is never fetched or displayed</strong> — it is
        backend-only. The backend requires exactly one{' '}
        <strong>primary</strong> skill link before a question can be activated in a live
        placement test. Placement scores, skill maps, and weakness maps are always
        computed server-side — never by this UI.
      </div>

      {/* Backend not yet available */}
      {backendUnavailable && (
        <div className="admin-boundary-note" role="status">
          <strong>Notice:</strong> The admin placement question skills endpoint (
          <code>GET /admin/placement/questions/:questionId/skills</code>) is not yet
          deployed. This page is ready and will display skill links automatically once
          the backend endpoint is available.
        </div>
      )}

      {/* Error banners */}
      {linksError && (
        <p className="admin-error-banner" role="alert">
          {linksError}
        </p>
      )}
      {skillsError && (
        <p className="admin-error-banner" role="alert">
          {skillsError}
        </p>
      )}

      {/* Skill linker */}
      {linksData && (
        <PlacementQuestionSkillLinker
          questionId={questionId}
          questionPrompt={questionPrompt}
          questionSkillCode={questionSkillCode}
          links={linksData.links}
          availableSkills={availableSkills}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onSetPrimary={handleSetPrimary}
        />
      )}
    </section>
  );
}

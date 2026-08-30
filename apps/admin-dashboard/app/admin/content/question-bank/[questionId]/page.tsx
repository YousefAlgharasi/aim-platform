import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../core/auth';
import { AdminApiClientError } from '../../../../../core/api';
import {
  createAdminQuestionChoice,
  deleteAdminQuestionChoice,
  fetchAdminQuestion,
  fetchAdminQuestionChoices,
  reorderAdminQuestionChoices,
  updateAdminQuestion,
  updateAdminQuestionChoice,
  type AdminQuestionChoice,
  type AdminQuestionDetail,
  type QuestionDifficulty,
} from '../../../../../features/content/api/admin-question-bank-api';
import { fetchQuestionSkillLinks } from '../../../../../features/content/api/admin-question-skills-api';
import { QuestionEditorClient } from '../../../../../features/content';

type Props = {
  params: Promise<{ questionId: string }>;
};

export default async function AdminQuestionDetailPage({ params }: Props) {
  const { questionId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let question: AdminQuestionDetail | null = null;
  let fetchError: string | null = null;
  let hasSkillLinks = false;
  let choices: AdminQuestionChoice[] = [];

  try {
    question = await fetchAdminQuestion(token, questionId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load question. Check backend connectivity.';
  }

  if (question) {
    try {
      const skillLinks = await fetchQuestionSkillLinks(token, questionId);
      hasSkillLinks = skillLinks.links.length > 0;
    } catch {
      // Skill link status is advisory for the validation panel; if the
      // backend call fails, fall back to "no links" rather than blocking
      // the page.
      hasSkillLinks = false;
    }

    try {
      const choiceData = await fetchAdminQuestionChoices(token, questionId);
      choices = choiceData.choices;
    } catch {
      // Choice data is advisory for the editor/validation panel; if the
      // backend call fails, fall back to an empty list rather than blocking
      // the page.
      choices = [];
    }
  }

  async function handleUpdate(formData: {
    stem: string;
    difficulty: QuestionDifficulty;
    explanation: string | null;
    hint: string | null;
    tags: string[];
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminQuestion(token, questionId, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update question.';
      return { error: msg };
    }
  }

  async function handleAddChoice(input: {
    text: string;
    isCorrect: boolean;
    explanation?: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      const existing = await fetchAdminQuestionChoices(token, questionId);
      const nextOrder = existing.choices.reduce((max, c) => Math.max(max, c.order), 0) + 1;
      await createAdminQuestionChoice(token, questionId, { ...input, order: nextOrder });
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to add choice.';
      return { error: msg };
    }
  }

  async function handleUpdateChoice(
    choiceId: string,
    input: { text?: string; isCorrect?: boolean; explanation?: string | null },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminQuestionChoice(token, questionId, choiceId, input);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update choice.';
      return { error: msg };
    }
  }

  async function handleRemoveChoice(choiceId: string): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await deleteAdminQuestionChoice(token, questionId, choiceId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to remove choice.';
      return { error: msg };
    }
  }

  async function handleReorderChoices(orderedChoiceIds: string[]): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await reorderAdminQuestionChoices(token, questionId, orderedChoiceIds);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to reorder choices.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/content/question-bank">Question Bank</Link>
        <span aria-hidden="true">/</span>
        <span>{question?.stem.slice(0, 40) ?? 'Question'}</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Question Editor</p>
        <h1>{question ? `Edit Question` : 'Question Not Found'}</h1>
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {question && (
        <QuestionEditorClient
          question={question}
          hasSkillLinks={hasSkillLinks}
          choices={choices}
          onUpdate={handleUpdate}
          onAddChoice={handleAddChoice}
          onUpdateChoice={handleUpdateChoice}
          onRemoveChoice={handleRemoveChoice}
          onReorderChoices={handleReorderChoices}
        />
      )}
    </section>
  );
}

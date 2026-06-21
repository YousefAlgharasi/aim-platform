'use client';

// Phase 4 — P4-057
// PlacementQuestionSkillLinker — client component.
//
// Scope: Placement Test phase only — admin UI to link placement questions to skills.
//
// Security rules:
// - All initial data is fetched server-side (page.tsx) and passed as props.
// - This component calls server actions (passed as props) — never calls the backend directly.
// - Backend is the sole authority for skill links, is_primary enforcement, and activation rules.
// - correct_answer is NEVER included in props or rendered here.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - is_primary = true marks the primary skill for backend scoring attribution only.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PlacementQuestionSkillLink } from '../../../../../../../../../../../lib/api/admin-placement-question-skills-api';
import type { AdminSkillSummary } from '../../../../../../../../../../../lib/api/admin-skills-api';

type PlacementQuestionSkillLinkerProps = {
  readonly questionId: string;
  readonly questionPrompt: string;
  readonly questionSkillCode: string;
  readonly links: PlacementQuestionSkillLink[];
  readonly availableSkills: AdminSkillSummary[];
  readonly onAdd: (
    skillId: string,
    isPrimary: boolean,
  ) => Promise<{ error?: string }>;
  readonly onRemove: (skillId: string) => Promise<{ error?: string }>;
  readonly onSetPrimary: (skillId: string) => Promise<{ error?: string }>;
};

export function PlacementQuestionSkillLinker({
  questionId: _questionId,
  questionPrompt,
  questionSkillCode,
  links,
  availableSkills,
  onAdd,
  onRemove,
  onSetPrimary,
}: PlacementQuestionSkillLinkerProps) {
  const router = useRouter();
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [makePrimary, setMakePrimary] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkedSkillIds = new Set(links.map((l) => l.skillId));
  const unlinkedSkills = availableSkills.filter((s) => !linkedSkillIds.has(s.id));
  const hasPrimary = links.some((l) => l.isPrimary);
  const hasNoLinks = links.length === 0;

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleAdd() {
    if (!selectedSkillId) return;
    setActionError(null);
    startTransition(async () => {
      const result = await onAdd(selectedSkillId, makePrimary);
      if (result.error) {
        setActionError(result.error);
      } else {
        setSelectedSkillId('');
        setMakePrimary(false);
        refresh();
      }
    });
  }

  async function handleRemove(skillId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onRemove(skillId);
      if (result.error) {
        setActionError(result.error);
      } else {
        refresh();
      }
    });
  }

  async function handleSetPrimary(skillId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onSetPrimary(skillId);
      if (result.error) {
        setActionError(result.error);
      } else {
        refresh();
      }
    });
  }

  // Merge link records with full skill details from availableSkills
  const linkedSkillDetails = links.map((link) => ({
    link,
    skill: availableSkills.find((s) => s.id === link.skillId),
  }));

  return (
    <div className="skill-linker">
      {/* Question context */}
      <div className="skill-linker-meta">
        <span className="skill-linker-lesson-title">{questionPrompt}</span>
        <span className="status-badge status-draft">
          skill: {questionSkillCode || '—'}
        </span>
      </div>

      {/* Warning: no skills linked */}
      {hasNoLinks && (
        <div className="skill-linker-warning" role="alert">
          <strong>⚠ No skills linked.</strong> A placement question must have at least
          one skill link with a primary designation before it can be activated in a live
          placement test. The backend enforces this rule at the activation endpoint.
        </div>
      )}

      {/* Warning: has links but no primary */}
      {!hasNoLinks && !hasPrimary && (
        <div className="skill-linker-warning" role="alert">
          <strong>⚠ No primary skill set.</strong> A placement question requires exactly
          one primary skill link for backend scoring attribution. Use the{' '}
          <strong>Set Primary</strong> button below.
        </div>
      )}

      {/* Linked skills section */}
      <section className="skill-linker-section">
        <h2>Linked Skills ({links.length})</h2>
        {links.length === 0 ? (
          <p className="skill-linker-empty">No skills linked yet.</p>
        ) : (
          <ul className="skill-link-list">
            {linkedSkillDetails.map(({ link, skill }) => (
              <li key={link.skillId} className="skill-link-item">
                <div className="skill-link-info">
                  <code className="skill-key">{skill?.key ?? link.skillId}</code>
                  {skill && <span className="skill-title">{skill.title}</span>}
                  <span
                    className={`skill-domain-badge domain-${skill?.domain ?? 'grammar'}`}
                  >
                    {skill?.domain ?? '—'}
                  </span>
                  {link.isPrimary && (
                    <span
                      className="status-badge status-published"
                      title="Primary skill drives backend scoring attribution"
                    >
                      Primary
                    </span>
                  )}
                </div>
                <div className="skill-link-actions">
                  {!link.isPrimary && (
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleSetPrimary(link.skillId)}
                      disabled={isPending}
                      aria-label={`Set ${skill?.key ?? link.skillId} as primary skill`}
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => handleRemove(link.skillId)}
                    disabled={isPending}
                    aria-label={`Remove skill ${skill?.key ?? link.skillId}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add skill section */}
      <section className="skill-linker-section">
        <h2>Add Skill</h2>
        {unlinkedSkills.length === 0 ? (
          <p className="skill-linker-empty">
            {availableSkills.length === 0
              ? 'No published skills available. Create and publish skills first.'
              : 'All available skills are already linked.'}
          </p>
        ) : (
          <div className="skill-add-row">
            <select
              className="skill-select"
              value={selectedSkillId}
              onChange={(e: { target: { value: string } }) => setSelectedSkillId(e.target.value)}
              disabled={isPending}
              aria-label="Select skill to link"
            >
              <option value="">— Select a skill —</option>
              {unlinkedSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.key} — {skill.title}
                </option>
              ))}
            </select>
            <label className="skill-primary-label">
              <input
                type="checkbox"
                checked={makePrimary}
                onChange={(e: { target: { checked: boolean } }) => setMakePrimary(e.target.checked)}
                disabled={isPending}
              />
              {' '}Mark as primary skill
            </label>
            <button
              className="btn-primary"
              onClick={handleAdd}
              disabled={isPending || !selectedSkillId}
            >
              {isPending ? 'Saving…' : 'Link Skill'}
            </button>
          </div>
        )}

        {actionError && (
          <p className="course-form-error" role="alert">
            {actionError}
          </p>
        )}
      </section>

      {/* Backend authority note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Skill links and the primary-skill constraint
        are enforced by the backend. The{' '}
        <strong>is_primary</strong> flag drives scoring attribution — the backend
        requires exactly one primary skill link before a question can be activated in a
        live placement test. This UI calls backend APIs and does not bypass backend
        authority. Placement scores, skill maps, and weakness maps are always computed
        server-side.
      </div>
    </div>
  );
}

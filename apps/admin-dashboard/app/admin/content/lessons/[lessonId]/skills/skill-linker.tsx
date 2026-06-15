'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminLessonSkillLink } from '../../../../../../lib/api/admin-lesson-skills-api';
import type { AdminSkillSummary } from '../../../../../../lib/api/admin-skills-api';

type SkillLinkerProps = {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly lessonStatus: string;
  readonly linkedSkills: AdminLessonSkillLink[];
  readonly availableSkills: AdminSkillSummary[];
  readonly onAddSkill: (skillId: string) => Promise<{ error?: string }>;
  readonly onRemoveSkill: (skillId: string) => Promise<{ error?: string }>;
};

export function SkillLinker({
  lessonId: _lessonId,
  lessonTitle,
  lessonStatus,
  linkedSkills,
  availableSkills,
  onAddSkill,
  onRemoveSkill,
}: SkillLinkerProps) {
  const router = useRouter();
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkedSkillIds = new Set(linkedSkills.map((l) => l.skillId));
  const unlinkedSkills = availableSkills.filter((s) => !linkedSkillIds.has(s.id));

  const isPublished = lessonStatus === 'published';
  const hasNoSkills = linkedSkills.length === 0;

  function refresh() {
    startTransition(() => { router.refresh(); });
  }

  async function handleAdd() {
    if (!selectedSkillId) return;
    setActionError(null);
    startTransition(async () => {
      const result = await onAddSkill(selectedSkillId);
      if (result.error) {
        setActionError(result.error);
      } else {
        setSelectedSkillId('');
        refresh();
      }
    });
  }

  async function handleRemove(skillId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onRemoveSkill(skillId);
      if (result.error) {
        setActionError(result.error);
      } else {
        refresh();
      }
    });
  }

  const linkedSkillDetails = linkedSkills.map((link) => ({
    link,
    skill: availableSkills.find((s) => s.id === link.skillId),
  }));

  return (
    <div className="skill-linker">
      <div className="skill-linker-meta">
        <span className="skill-linker-lesson-title">{lessonTitle}</span>
        <span className={`status-badge status-${lessonStatus}`}>{lessonStatus}</span>
      </div>

      {hasNoSkills && (
        <div className="skill-linker-warning" role="alert">
          <strong>⚠ No skills linked.</strong> This lesson cannot be published until at
          least one skill is linked. The AIM Engine requires skill links to track
          what each lesson develops in the student.
        </div>
      )}

      {isPublished && hasNoSkills && (
        <div className="skill-linker-error" role="alert">
          <strong>Critical:</strong> This lesson is published but has no skill links.
          The backend should have blocked this — contact your administrator.
        </div>
      )}

      <section className="skill-linker-section">
        <h2>Linked Skills ({linkedSkills.length})</h2>
        {linkedSkills.length === 0 ? (
          <p className="skill-linker-empty">No skills linked yet.</p>
        ) : (
          <ul className="skill-link-list">
            {linkedSkillDetails.map(({ link, skill }) => (
              <li key={link.skillId} className="skill-link-item">
                <div className="skill-link-info">
                  <code className="skill-key">{skill?.key ?? link.skillId}</code>
                  {skill && (
                    <span className="skill-title">{skill.title}</span>
                  )}
                  <span className={`skill-domain-badge domain-${skill?.domain ?? 'grammar'}`}>
                    {skill?.domain ?? '—'}
                  </span>
                </div>
                <button
                  className="btn-danger btn-sm"
                  onClick={() => handleRemove(link.skillId)}
                  disabled={isPending}
                  aria-label={`Remove skill ${skill?.key ?? link.skillId}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
              onChange={(e) => setSelectedSkillId(e.target.value)}
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
          <p className="course-form-error" role="alert">{actionError}</p>
        )}
      </section>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Skill identifiers are stable keys
        (e.g. <code>grammar.past_simple.forms</code>). The backend enforces
        that every published lesson must have at least one skill link. This UI
        calls backend APIs and does not bypass backend content authority.
      </div>
    </div>
  );
}

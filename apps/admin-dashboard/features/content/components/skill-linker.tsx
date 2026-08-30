'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminLessonSkillLink } from '../api/admin-lesson-skills-api';
import type { AdminSkillSummary } from '../api/admin-skills-api';
import {
  AdminCard,
  AdminBadge,
  AdminButton,
  AdminSelect,
  AdminFormField,
} from '../../../shared/components/Misc';
import { AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

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
    <div className="flex flex-col gap-4">
      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-semibold text-[var(--text-primary)]">{lessonTitle}</span>
          <AdminBadge variant={isPublished ? 'success' : 'default'}>{lessonStatus.replace('_', ' ')}</AdminBadge>
        </div>

        {hasNoSkills && (
          <div className="mt-3">
            <AdminErrorBanner
              variant="warning"
              title="No skills linked"
              message="This lesson cannot be published until at least one skill is linked. The AIM Engine requires skill links to track what each lesson develops in the student."
            />
          </div>
        )}

        {isPublished && hasNoSkills && (
          <div className="mt-3">
            <AdminErrorBanner
              title="Critical"
              message="This lesson is published but has no skill links. The backend should have blocked this — contact your administrator."
            />
          </div>
        )}
      </AdminCard>

      {actionError && <AdminErrorBanner message={actionError} />}

      <AdminCard title={`Linked Skills (${linkedSkills.length})`}>
        {linkedSkills.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No skills linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linkedSkillDetails.map(({ link, skill }) => (
              <li
                key={link.skillId}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                    {skill?.key ?? link.skillId}
                  </code>
                  {skill && <span className="text-sm text-[var(--text-primary)]">{skill.title}</span>}
                  <AdminBadge variant="primary">{skill?.domain ?? '—'}</AdminBadge>
                </div>
                <AdminButton
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(link.skillId)}
                  disabled={isPending}
                  aria-label={`Remove skill ${skill?.key ?? link.skillId}`}
                >
                  Remove
                </AdminButton>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Add Skill">
        {unlinkedSkills.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            {availableSkills.length === 0
              ? 'No published skills available. Create and publish skills first.'
              : 'All available skills are already linked.'}
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <AdminFormField id="skill-linker-select" label="Skill">
                <AdminSelect
                  id="skill-linker-select"
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
                </AdminSelect>
              </AdminFormField>
            </div>
            <AdminButton
              variant="primary"
              onClick={handleAdd}
              disabled={isPending || !selectedSkillId}
              loading={isPending}
            >
              Link Skill
            </AdminButton>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

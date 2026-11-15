// Learner data is keyed by different ids depending on the table: some use
// users.id, most learner tables (progress, attempts, enrollments, results,
// certificates, achievements) use users.supabase_auth_uid, and a few use
// student_profiles.id. The admin views therefore match a student on all of
// them so nothing is hidden, whichever id the table was written with.

import { DatabaseService } from '../../../database/database.service';

export async function resolveStudentIds(db: DatabaseService, studentId: string): Promise<string[]> {
  const r = await db.query<{ id: string; supabase_auth_uid: string | null; profile_id: string | null }>(
    `SELECT u.id, u.supabase_auth_uid, sp.id AS profile_id
       FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.id = $1`,
    [studentId],
  );
  const row = r.rows[0];
  const ids = new Set<string>([studentId]);
  if (row?.supabase_auth_uid) ids.add(row.supabase_auth_uid);
  if (row?.profile_id) ids.add(row.profile_id);
  return [...ids];
}

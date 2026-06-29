-- The student role had no curriculum read permission at all, so every
-- learner-facing curriculum endpoint (courses, levels, chapters, lessons)
-- returned 403 Insufficient permission. Grant the read-only "published"
-- permission to the student role; draft/archived content remains
-- restricted to admin/reviewer/super_admin.

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.key = 'student'
  AND p.key = 'curriculum.content.read.published'
ON CONFLICT DO NOTHING;

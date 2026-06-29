-- The auth bootstrap flow created student_profiles rows for every learner
-- but never assigned the 'student' role in user_roles, so every learner
-- account has always had zero roles/permissions. Backfill role assignment
-- for any existing user with user_type = 'student' that's missing it.
-- New users get this automatically going forward via
-- AuthProfileBootstrapService.ensureRoleAssigned.

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.key = 'student'
WHERE u.user_type = 'student'
ON CONFLICT (user_id, role_id) DO NOTHING;

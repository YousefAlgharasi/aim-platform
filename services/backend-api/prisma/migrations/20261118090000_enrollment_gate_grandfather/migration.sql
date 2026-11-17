-- Enrollment gate: course content now requires a course_access row (enrolled).
-- Grandfather students who already started a FREE course (an enrollment row or lesson progress)
-- so nobody loses a course they were already studying. Paid courses already required access.
INSERT INTO course_access (student_id, course_id, payment_request_id, status, starts_at, expires_at)
SELECT DISTINCT u.id, c.id, NULL::uuid, 'active', now(), now() + interval '365000 days'
FROM courses c
JOIN users u ON TRUE
WHERE c.status = 'published'
  AND (
    EXISTS (SELECT 1 FROM course_enrollments ce
            WHERE ce.course_id = c.id AND ce.student_id::text IN (u.id::text, u.supabase_auth_uid::text))
    OR EXISTS (SELECT 1 FROM lesson_progress lp
               JOIN lessons les ON les.id = lp.lesson_id
               JOIN chapters ch ON ch.id = les.chapter_id
               JOIN levels lv ON lv.id = ch.level_id
               LEFT JOIN student_profiles sp ON sp.user_id = u.id
               WHERE lv.course_id = c.id
                 AND lp.student_id::text IN (u.id::text, u.supabase_auth_uid::text, sp.id::text))
  )
  AND NOT EXISTS (SELECT 1 FROM course_prices cp WHERE cp.course_id = c.id AND cp.amount > 0)
  AND NOT EXISTS (SELECT 1 FROM course_access ca
                  WHERE ca.student_id = u.id AND ca.course_id = c.id AND ca.status IN ('active', 'completed'));

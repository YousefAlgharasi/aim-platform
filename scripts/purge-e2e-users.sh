#!/usr/bin/env bash
# Remove throwaway students created by the E2E tests (e2e-*@local.com) and
# everything the placement flow created for them. Run on the server.
set -euo pipefail
DB="${DB_CONTAINER:-supabase-db}"
docker exec -i "$DB" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
begin;
delete from placement_audit_log where placement_attempt_id in (select a.id from placement_attempts a join users u on u.id=a.student_id where u.email like 'e2e-%@local.com');
delete from learning_sessions where placement_result_id in (select r.id from placement_results r join placement_attempts a on a.id=r.placement_attempt_id join users u on u.id=a.student_id where u.email like 'e2e-%@local.com');
delete from users where email like 'e2e-%@local.com';
delete from auth.users where email like 'e2e-%@local.com';
commit;
select 'remaining e2e users: ' || count(*) from users where email like 'e2e-%@local.com';
SQL

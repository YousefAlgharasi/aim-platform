# Full Supabase backup

Complete `pg_dump` of the self-hosted Supabase Postgres database (all schemas, all tables, all records), taken 2026-11-12.
Contains test data only.

Restore: `gunzip -c supabase_full.sql.gz | psql -U postgres -d <db>`

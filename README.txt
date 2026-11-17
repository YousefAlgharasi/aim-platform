AIM Supabase full backup - 20261117T062804Z (UTC)
database-full.dump     pg_dump custom format, whole 'postgres' DB (all schemas: public, auth, storage...). Restore: pg_restore -U postgres -d postgres --clean --if-exists database-full.dump
database-full.sql.gz   same data as plain SQL (no owners/privileges) - portable to any Postgres: gunzip -c file | psql
roles-globals.sql      database roles (contains password hashes - keep private)
storage-files.tar.gz   uploaded files of Supabase Storage (volumes/storage)
Not included: /opt/supabase-aim/.env (secrets/JWT keys) - copy it separately and securely.

# Supabase

This folder contains Supabase database assets for the AIM platform.

## Structure

```txt
supabase/
├── migrations/  # Versioned SQL database migrations
├── seed/        # Development and demo seed data
└── policies/    # Row Level Security policy documentation and SQL
```

## Current Status

This folder is prepared for the upcoming database implementation. The actual production schema should be added through versioned migrations after the AIM database design is finalized.

## Rules

* Keep every schema change inside `migrations/`.
* Keep seed/demo data inside `seed/`.
* Keep RLS policy SQL and documentation inside `policies/`.
* Do not store Supabase secrets or service role keys in this repository.

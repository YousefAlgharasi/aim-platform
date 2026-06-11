# Secret Scanning and Environment Safety Check

## Purpose

This document defines the Phase 1 repository safety check for secrets and environment files.

The goal is to prevent committed secrets, AI provider keys, Supabase privileged credentials, JWT secrets, database credentials, private keys, and unsafe `.env` files.

## Scope

The safety check is implemented in:

```text
scripts/check-env-safety.sh
```

The script is a repository-level guard that checks tracked files only.

It is safe for local development because it does not read untracked local `.env` files.

## What the Check Blocks

The check blocks:

- committed `.env` files
- committed `.env.local` files
- committed private key blocks
- likely real assignments for privileged keys
- likely real AI provider keys
- likely real Supabase service-role/JWT secrets
- likely real database URLs

## Allowed Files

The following are allowed:

```text
.env.example
.env.template
example.env
```

These files must contain placeholders only.

## Required Git Ignore Rules

The repository must ignore:

```text
.env
.env.local
```

## Forbidden Secret Categories

The check covers these categories:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
AI_PROVIDER_API_KEY
AIM_AI_PROVIDER_API_KEY
JWT_SECRET
DATABASE_URL
OPENAI_API_KEY
ANTHROPIC_API_KEY
DEEPSEEK_API_KEY
GOOGLE_API_KEY
FIREBASE_PRIVATE_KEY
PRIVATE_KEY
```

## Allowed Placeholder Values

The check allows placeholder/demo values such as:

```text
<placeholder>
<project-ref>
<password>
localhost
127.0.0.1
example
example.com
example.test
dummy
fake
test
changeme
development
```

## Usage

Run:

```bash
bash scripts/check-env-safety.sh
```

Expected success output:

```text
AIM env/secret safety check passed.
```

## Recommended CI Usage

A future CI task may call this script before build/test steps.

Recommended command:

```bash
bash scripts/check-env-safety.sh
```

## Client-Safety Rules

Secrets must never be passed to:

- Flutter Mobile
- Admin Dashboard browser bundle
- any `NEXT_PUBLIC_*` variable
- any `--dart-define` value
- client-side local config

Backend-only secrets must remain server-side.

## Relationship to P1-009

This check builds on the Phase 1 environment file strategy:

- `.env.example` contains placeholders only.
- `.gitignore` excludes local `.env` files.
- secrets stay outside Git.
- service-role keys and AI provider keys remain backend-only.

## Non-Goals

This check does not:

- replace GitHub secret scanning
- replace organization-level secret protection
- validate runtime environment values
- verify whether a placeholder is deployable
- connect to Supabase
- connect to AI providers
- manage production credentials

## Acceptance Notes

- Secret scanning / env safety check exists.
- Committed `.env` files are blocked.
- Required `.gitignore` env exclusions are checked.
- AI provider keys are guarded.
- Supabase privileged keys are guarded.
- JWT/database/private-key patterns are guarded.
- Placeholder values are allowed.
- Local untracked env files are not read.
- No secrets are committed.
- No runtime service code was added.
- No database migration was added.
- No client AIM logic was added.
- No Student Web App work was added.

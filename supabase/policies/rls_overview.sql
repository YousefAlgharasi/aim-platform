-- AIM Platform RLS Overview
-- This file documents the planned Row Level Security policy groups.
-- Real table-specific policies should be added after schema migrations are finalized.

-- Planned groups:
-- 1. Student policies
-- 2. Parent policies
-- 3. Admin policies
-- 4. Audit and internal service policies

-- Security rule:
-- Never expose service_role keys in frontend, Flutter, React, or public client code.

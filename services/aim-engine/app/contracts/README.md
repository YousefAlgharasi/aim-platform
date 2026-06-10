# AIM Engine Contract Models

This package contains Pydantic models that define the boundary between the NestJS Backend API and the Python AIM Engine.

## P1-028 scope

This task is contract-only.

It defines validated request and response shapes for future AIM Engine calls, especially adaptive session-completion processing.

## Not included

P1-028 does not implement:

- mastery calculation
- weakness detection
- difficulty adaptation
- recommendation generation
- retention scheduling
- emotional-state detection
- persistence
- HTTP processing endpoints

## Boundary rule

Clients must not calculate or directly own mastery, weakness, difficulty, retention, or recommendation logic. These contracts are for backend-to-engine integration only.

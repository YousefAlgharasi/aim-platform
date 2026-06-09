# AIM Platform — System Architecture

> **Status:** Stub — to be completed in a dedicated planning task.

## High-Level Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          Clients                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Flutter App │  │  React Web  │  │    Admin Dashboard       │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬─────────────┘ │
└─────────┼────────────────┼───────────────────────┼──────────────┘
          │                │                       │
          ▼                ▼                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                        AIM Engine API                            │
│              (All adaptive logic lives here)                     │
├──────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
│  │  AIM Engine   │  │  AI Teacher    │  │  Analytics Service  │ │
│  │  (Adaptive    │  │  (Hint /       │  │  (Metrics,          │ │
│  │   Scoring)    │  │   Feedback)    │  │   Reporting)        │ │
│  └───────────────┘  └────────────────┘  └─────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                        Database Layer                            │
│              (Supabase / PostgreSQL)                             │
└──────────────────────────────────────────────────────────────────┘
```

## Key Principles

- All clients communicate exclusively through the AIM Engine API.
- No client holds AI provider keys or adaptive logic.
- Audio and speech data are uploaded to the backend; scoring never happens on-device.

## Sections To Complete

- [ ] Detailed sequence diagrams (learner session flow)
- [ ] Auth flow (Supabase JWT)
- [ ] Media storage architecture (audio assets, speech uploads)
- [ ] Deployment topology (cloud provider, regions)
- [ ] Scaling strategy

---
*Last updated: 2026-06-09*

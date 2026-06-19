# Phase 10 Readiness Checklist

**Task:** P9-109
**Date:** 2026-06-19

## Prerequisites from Phase 9

### Backend Voice Infrastructure

- [x] Voice session management (start, list, history)
- [x] Audio upload with MIME validation and format sniffing
- [x] STT gateway with confidence and language policies
- [x] AI response generation pipeline
- [x] TTS gateway with voice selection and safe failure
- [x] Audio storage with opaque audioRef pattern
- [x] Audio cleanup with retention policies (24h grace, 7d hard cap)
- [x] Voice orchestrator integrating STT → AI → TTS pipeline
- [x] Rate limiting (20/session, 30/hour, 100/day)
- [x] Safety event logging (input/output, allowed/rejected)
- [x] Voice feedback collection
- [x] Message persistence with transcript storage
- [x] Session context linking

### Backend API Layer

- [x] 6 REST endpoints with JWT authentication
- [x] Session and audio ownership guards (IDOR protection)
- [x] DTO validation with class-validator
- [x] File upload constraints (10 MB, MIME allowlist)
- [x] API tests for all controllers

### Flutter Voice UI

- [x] Feature structure (data/logic/ui layers)
- [x] Remote datasource with backend API integration
- [x] Repository and provider setup (Riverpod)
- [x] Microphone permission flow with Arabic fallback
- [x] Voice teacher screen with chat bubbles
- [x] Record button with timer
- [x] Recording state bar with actions
- [x] Waveform indicator (respects reduced motion)
- [x] Transcription preview with role labels
- [x] AI speaking/thinking indicator
- [x] Audio playback controls
- [x] Error state with retry and text fallback
- [x] Feedback actions (thumbs up/down + comment)
- [x] Record and submit flow notifier
- [x] Voice response playback notifier
- [x] Voice-to-text fallback widget
- [x] Widget tests (5 test files + 1 model test)

### Quality Reviews Completed

- [x] No direct provider calls (P9-096, P9-105)
- [x] No AIM authority violations (P9-106)
- [x] RTL/Arabic compliance (P9-097)
- [x] Accessibility check (P9-098)
- [x] Design system usage review (P9-100)
- [x] End-to-end flow verification (P9-101)
- [x] Security review (P9-102)
- [x] Privacy review (P9-103)
- [x] Safety review (P9-104)
- [x] Cost control documentation (P9-107)
- [x] Output completeness review (P9-108)

## Phase 10 Entry Requirements

### Merge Phase 9 Branches

Before starting Phase 10, all Phase 9 feature branches should be merged
to main via pull requests:

- [ ] Merge all Group F-K branches (P9-063 through P9-110)
- [ ] Resolve any merge conflicts
- [ ] Verify CI passes on main after merge

### Environment Setup

- [ ] STT provider credentials configured in backend environment
- [ ] TTS provider credentials configured in backend environment
- [ ] AI/LLM provider credentials configured in backend environment
- [ ] Audio storage location configured
- [ ] Database migrations applied for voice tables

### Integration Testing

- [ ] End-to-end voice session test with real providers
- [ ] Audio upload → STT → AI → TTS → playback flow test
- [ ] Rate limiting behavior verified in staging
- [ ] Audio cleanup cron/job scheduled

### Mobile Testing

- [ ] Voice teacher screen accessible from home page
- [ ] Microphone permission flow works on iOS and Android
- [ ] Recording and playback functional on both platforms
- [ ] RTL/Arabic layout verified on device
- [ ] Error states display correctly with retry

## Known Items for Phase 10

1. **Provider integration testing** — Phase 9 built the infrastructure
   with injectable provider interfaces; Phase 10 should test with real
   STT/TTS/AI providers in a staging environment.

2. **Audio cleanup scheduling** — The cleanup service is built but needs
   a cron job or scheduled task to run periodically.

3. **Voice UI polish** — Minor accessibility improvements recommended
   (reduced motion in ai_speaking_indicator and recording_state_bar,
   error dismiss button touch target).

4. **Monitoring setup** — Provider cost metrics and rate limit dashboards
   should be configured per the cost control notes.

# Voice Cost Control Notes

**Task:** P9-107
**Date:** 2026-06-19

## Overview

This document summarizes the cost control mechanisms in the Phase 9 Voice
Teacher feature. All cost controls are enforced server-side; the Flutter
client has no visibility into rate limits or provider costs.

## Cost Drivers

The voice teacher feature incurs costs from three external provider calls,
all made backend-side:

| Provider | Operation | Cost Factor |
|----------|-----------|-------------|
| STT (Speech-to-Text) | Transcribe student audio | Audio duration |
| AI/LLM | Generate teacher response | Token count (input + output) |
| TTS (Text-to-Speech) | Synthesize teacher audio response | Character count |

## Rate Limiting

Rate limits are enforced by `VoiceRateLimitPolicyService` before any
provider call is made.

| Limit | Value | Scope |
|-------|-------|-------|
| Max turns per session | 20 | Single voice session |
| Max turns per student per hour | 30 | Rolling 1-hour window |
| Max turns per student per day | 100 | Rolling 24-hour window |
| Min turn gap | 1 second | Between consecutive turns in a session |

These limits prevent runaway costs from individual students. When a limit
is breached, the API returns a 429-style error; the Flutter client shows
an error state with retry guidance.

## Audio Upload Constraints

| Constraint | Value | Cost Impact |
|-----------|-------|-------------|
| Max file size | 10 MB | Limits STT input size |
| Max audio duration | 120 seconds | Caps per-turn STT cost |
| Min audio duration | 200 ms | Rejects empty/accidental recordings |
| Allowed MIME types | webm, mp4, ogg, wav, x-m4a | Standard formats only |

## Audio Storage Cost Control

| Policy | Implementation | Effect |
|--------|---------------|--------|
| Post-transcription cleanup | Audio deleted 24h after STT completes | Minimizes storage duration |
| TTS audio cleanup | Deleted after delivery or session end + 24h | Prevents accumulation |
| Hard retention cap | All audio deleted after 7 days | Absolute storage limit |
| Opaque audioRef | No direct storage URLs leaked | Prevents unauthorized access |

The `AudioCleanupPolicyService` and `AudioCleanupService` automatically
remove audio assets according to these policies, keeping storage costs
proportional to active usage rather than total historical usage.

## Response Generation Cost Control

| Control | Implementation |
|---------|---------------|
| Rate limits | Applied before AI/LLM call |
| Session scoping | Conversations are session-scoped, not unlimited |
| Backend-only | No client can bypass rate limits to call providers directly |

## Monitoring Recommendations

| Metric | Purpose |
|--------|---------|
| Turns per student per day | Identify high-usage students |
| STT audio duration distribution | Track per-turn cost patterns |
| TTS character count per response | Monitor response verbosity |
| Rate limit 429 count | Track limit breach frequency |
| Audio storage volume | Monitor cleanup effectiveness |
| Provider error rate | Detect provider issues early |
| Provider log entries | `VoiceProviderLogRepository` records all provider calls |

## Provider Logging

The `VoiceProviderLogRepository` records metadata for all provider
interactions, enabling cost attribution and anomaly detection without
storing sensitive audio content.

## Summary

Cost is controlled at multiple layers:
1. **Rate limiting** — caps per-student usage (20/session, 30/hour, 100/day)
2. **Audio constraints** — limits upload size (10 MB) and duration (120s)
3. **Auto cleanup** — removes audio within 24h-7d, preventing storage growth
4. **Backend-only provider access** — no client can bypass controls
5. **Provider logging** — enables cost monitoring and attribution

# 07 — AI Inference Pipeline

## 1. End-to-End Inference Flow in AIM

```mermaid
flowchart LR
    U[Student Input<br/>Text or Audio] --> B[NestJS Backend<br/>ai-teacher / voice-teacher]
    B -->|If Audio| STT[External STT API<br/>STT_PROVIDER_MODEL]
    STT -->|Transcript| B
    B --> DB[(Prisma / PostgreSQL<br/>Lesson & Learner Context)]
    B --> LLM[External LLM API<br/>AI_PROVIDER_MODEL]
    LLM -->|Tutoring Text| B
    B -->|If Voice Mode| TTS[External TTS API<br/>TTS_PROVIDER_MODEL]
    TTS -->|Audio Stream| B
    B --> U
```

## 2. Key Inference Concepts
- **Prompt Construction**: Backend-only (`Keep adaptive decisions and provider credentials on the backend`, `README.md` line 56).
- **Decoding Parameters**: Temperature (controls randomness; lower = more deterministic grammar explanations), `top_p` (nucleus sampling), and `max_tokens` (caps latency and API cost).
- **Streaming & Compression**: `services/backend-api/src/main.ts` (lines 28–29) explicitly skips gzip compression for `text/event-stream` and `audio/` responses so SSE token streaming and voice audio are not buffered.

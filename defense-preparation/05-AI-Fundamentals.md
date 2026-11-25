# 05 — AI Fundamentals

## 1. What AI Components Exist in the AIM Platform?
In the AIM Platform, "AI" is split into two distinct subsystems:
1. **Symbolic / Statistical Adaptive AI (`services/aim-engine` + `packages/ai_core`)**: Deterministic cognitive modeling (mastery, weakness, retention, difficulty, recommendations).
2. **Generative & Speech AI (`services/backend-api/src/features/ai-teacher` & `voice-teacher`)**: Calls external hosted foundation models via API keys (`AI_PROVIDER_API_KEY`, `AI_PROVIDER_MODEL`, `STT_PROVIDER_API_KEY`, `TTS_PROVIDER_API_KEY` in `render.yaml`).

## 2. Transformer & LLM Concepts (For Defense Questions)
Even though AIM calls an external LLM API rather than hosting weights locally, examiners will test whether you understand how the underlying LLM works:
- **Transformer Architecture**: Relies on **Self-Attention** ($\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$) to weigh relationships between all tokens in a context window simultaneously.
- **Tokenization & Embeddings**: Text is split into subword tokens (e.g., BPE) and mapped to dense vectors + positional encodings.
- **Autoregressive Generation**: The model predicts one next token at a time conditioned on all previous tokens (system prompt + learner context + chat history).

## 3. Genuine AI Contribution of This Project
- **What we did NOT build**: We did not train an LLM from scratch or fine-tune LoRA weights.
- **What we DID build**: Context-aware pedagogical orchestration—injecting the learner's adaptive profile (mastery, weaknesses, lesson context) into structured backend prompts and combining it with real-time STT/TTS voice interaction.

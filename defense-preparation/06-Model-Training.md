# 06 — Model Training & Fine-Tuning (Actual Status vs. Theory)

## 1. Actual Implementation Status in the Repository
- **LLM Fine-Tuning / LoRA**: **Not implemented** in this repository. The AI Teacher (`services/backend-api/src/features/ai-teacher`) uses an external LLM API (`AI_PROVIDER_MODEL` + `AI_PROVIDER_API_KEY`).
- **ML Scaffolding (`packages/ml/`)**: Contains `data_pipeline.py`, `train_recommendation_model.py`, `evaluation.py`, and `ab_test_framework.py` for future supervised/recommendation model training, but the live `services/aim-engine` runs the deterministic `services/api/src/aim/domain/services/` algorithms.

## 2. Why External API + Prompting Was Chosen Over Fine-Tuning
1. **Zero GPU Infrastructure Cost**: Fine-tuning and hosting a 7B–70B parameter LLM requires dedicated GPUs (e.g., A100/L40S), which is incompatible with Render Starter plans (`render.yaml`).
2. **Data Availability**: Supervised fine-tuning (SFT) or LoRA requires thousands of curated, high-quality Arabic-English tutoring dialogues.
3. **Rapid Iteration**: Prompt engineering + adaptive context injection allows immediate pedagogical tuning without retraining cycles.

## 3. Defense-Ready Explanation (If Asked About LoRA / Fine-Tuning)
If an examiner asks *"Why didn't you fine-tune Llama/Mistral with LoRA?"*, answer:
> *"We evaluated fine-tuning (LoRA adapts low-rank matrices $W + \Delta W = W + BA$ with rank $r \ll d$), which is ideal when you have a large domain-specific dataset and GPU hosting. However, for our graduation project, our core innovation is the **adaptive learner model** (`aim-engine`) coupled with **context-injected LLM tutoring** via external APIs. This avoids GPU hosting costs and prevents hallucination-prone small local models from degrading English grammar explanations."*

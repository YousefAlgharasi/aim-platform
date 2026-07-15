// P4-052: PlacementAiGradingService.
//
// Scope: AI grading of placement WRITING and SPEAKING answers only.
//
// Responsibility:
//   Send a student's writing text or speaking transcript, together with a
//   fixed rubric prompt, to the SAME OpenAI-compatible provider already
//   used by AI Teacher (AiTeacherProviderGateway / AI_PROVIDER_BASE_URL,
//   AI_PROVIDER_API_KEY — no new provider seam is introduced). The model is
//   expected to reply with a small JSON object; this service is defensive
//   about parse failures and always returns a valid PlacementAiGradingResult
//   (never throws on a malformed model reply).
//
// Security rules:
//   - Never exposes raw provider prompts/credentials to any client.
//   - Feedback text returned here is student-safe wording — this service
//     does not add internal-only fields (mastery, skill weights, etc.).
//   - No secrets, service-role keys, or privileged config here — the API
//     key is read only via ProviderGatewayConfigService (existing seam).

import { Injectable, Logger } from '@nestjs/common';
import { AiTeacherProviderGateway } from '../ai-teacher/governance/ai-teacher-provider.interface';
import { ProviderGatewayConfigService } from '../ai-teacher/provider-gateway/provider-gateway.config';
import { PlacementAiGradingResult } from './placement.types';

const RUBRIC_SYSTEM_PROMPT =
  'You are grading a placement test response for an English-language-learning app. ' +
  'Grade the student response on a 0-10 scale for overall English proficiency ' +
  '(grammar, vocabulary, coherence, and task fulfillment). ' +
  'Reply with ONLY a compact JSON object of the exact shape ' +
  '{"score": <number 0-10>, "feedback": "<one or two short sentences of constructive feedback>"} ' +
  'and no other text.';

const DEFAULT_GRADING_RESULT: PlacementAiGradingResult = {
  score: 0,
  feedback: 'Automatic grading was unavailable for this response.',
};

@Injectable()
export class PlacementAiGradingService {
  private readonly logger = new Logger(PlacementAiGradingService.name);

  constructor(
    private readonly provider: AiTeacherProviderGateway,
    private readonly providerGatewayConfig: ProviderGatewayConfigService,
  ) {}

  /** Grade a WRITING answer's submitted text. */
  async gradeWriting(promptText: string, submittedText: string): Promise<PlacementAiGradingResult> {
    return this.grade(promptText, submittedText, 'writing');
  }

  /** Grade a SPEAKING answer's STT transcript. */
  async gradeSpeaking(promptText: string, transcript: string): Promise<PlacementAiGradingResult> {
    return this.grade(promptText, transcript, 'speaking');
  }

  private async grade(
    promptText: string,
    responseText: string,
    kind: 'writing' | 'speaking',
  ): Promise<PlacementAiGradingResult> {
    const trimmed = responseText.trim();
    if (trimmed.length === 0) {
      return { score: 0, feedback: 'No response was submitted.' };
    }

    const { model } = this.providerGatewayConfig.getConfig();

    const userPrompt =
      `Question prompt: ${promptText}\n\n` +
      `Student's ${kind === 'writing' ? 'written response' : 'spoken response (transcribed)'}: ` +
      `${trimmed}`;

    try {
      const response = await this.provider.generateText({
        providerKeyRef: 'placement-grading',
        modelId: model,
        prompt: `${RUBRIC_SYSTEM_PROMPT}\n\n${userPrompt}`,
      });

      return this.parseGradingReply(response.text);
    } catch (error: unknown) {
      this.logger.warn(
        `PlacementAiGradingService.grade: provider call failed for ${kind} grading — ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      return DEFAULT_GRADING_RESULT;
    }
  }

  /**
   * Defensively parse the model's reply into a PlacementAiGradingResult.
   * Never throws — falls back to DEFAULT_GRADING_RESULT on any parse issue,
   * and always clamps score into [0, 10].
   */
  private parseGradingReply(rawText: string): PlacementAiGradingResult {
    if (!rawText || rawText.trim().length === 0) {
      return DEFAULT_GRADING_RESULT;
    }

    // Models sometimes wrap JSON in markdown code fences or add stray text
    // around it — extract the first {...} block defensively.
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return DEFAULT_GRADING_RESULT;
    }

    try {
      const parsed = JSON.parse(match[0]) as { score?: unknown; feedback?: unknown };
      const rawScore = typeof parsed.score === 'number' ? parsed.score : Number(parsed.score);
      const score = Number.isFinite(rawScore) ? Math.min(10, Math.max(0, rawScore)) : 0;
      const feedback =
        typeof parsed.feedback === 'string' && parsed.feedback.trim().length > 0
          ? parsed.feedback.trim()
          : DEFAULT_GRADING_RESULT.feedback;

      return { score, feedback };
    } catch {
      this.logger.warn('PlacementAiGradingService.parseGradingReply: failed to parse JSON reply.');
      return DEFAULT_GRADING_RESULT;
    }
  }
}

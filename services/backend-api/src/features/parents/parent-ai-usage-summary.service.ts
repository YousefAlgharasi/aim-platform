// P18-070: Create Parent AI Read-Only Summary UI (backend)
// Exposes a linked, consented child's AI Teacher/Voice Tutor usage counts
// to their parent. Access is always verified first via
// ParentAccessPolicyService.assertAccess('activity_view') — no link or
// consent state is trusted from client input. This service only counts
// already-persisted session rows; it never reads conversation/voice
// transcript content, never computes mastery/weakness/difficulty/
// recommendation/review-schedule data, and never calls an AI provider.

import { Injectable } from '@nestjs/common';

import { AiChatSessionRepository } from '../ai-teacher/repositories/ai-chat-session.repository';
import { VoiceSessionRepository } from '../voice-teacher/repositories/voice-session.repository';
import { ParentAiUsageSummaryEntity } from './dto/parent-ai-usage-summary.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';

@Injectable()
export class ParentAiUsageSummaryService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly aiChatSessionRepository: AiChatSessionRepository,
    private readonly voiceSessionRepository: VoiceSessionRepository,
  ) {}

  async getAiUsageSummaryForParent(
    parentId: string,
    childId: string,
  ): Promise<ParentAiUsageSummaryEntity> {
    await this.parentAccessPolicyService.assertAccess(parentId, childId, 'activity_view');

    const [textChatSessions, voiceSessions] = await Promise.all([
      this.aiChatSessionRepository.findByStudentId(childId),
      this.voiceSessionRepository.findByStudentId(childId),
    ]);

    const latestTimestamps = [
      ...textChatSessions.map((row) => row.updated_at),
      ...voiceSessions.map((row) => row.updated_at),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const summary = new ParentAiUsageSummaryEntity();
    summary.childId = childId;
    summary.textChatSessionCount = textChatSessions.length;
    summary.voiceSessionCount = voiceSessions.length;
    summary.lastActivityAt = latestTimestamps[0] ?? null;
    summary.retrievedAt = new Date().toISOString();

    return summary;
  }
}

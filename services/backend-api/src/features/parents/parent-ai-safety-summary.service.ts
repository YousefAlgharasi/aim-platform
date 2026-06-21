// P18-071: Create Parent AI Safety Summary UI (backend)
// Exposes a linked, consented child's AI Teacher/Voice Tutor blocked-
// interaction count to their parent. Access is always verified first via
// ParentAccessPolicyService.assertAccess('activity_view') — no link or
// consent state is trusted from client input. This service only counts
// already-persisted safety event rows; it never reads the rejected raw
// message/audio/transcript content and never exposes the internal
// reason_category taxonomy.

import { Injectable } from '@nestjs/common';

import { AiSafetyEventRepository } from '../ai-teacher/repositories/ai-safety-event.repository';
import { VoiceSafetyEventRepository } from '../voice-teacher/repositories/voice-safety-event.repository';
import { ParentAiSafetySummaryEntity } from './dto/parent-ai-safety-summary.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';

@Injectable()
export class ParentAiSafetySummaryService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly aiSafetyEventRepository: AiSafetyEventRepository,
    private readonly voiceSafetyEventRepository: VoiceSafetyEventRepository,
  ) {}

  async getAiSafetySummaryForParent(
    parentId: string,
    childId: string,
  ): Promise<ParentAiSafetySummaryEntity> {
    await this.parentAccessPolicyService.assertAccess(parentId, childId, 'activity_view');

    const [chatRejectedCount, voiceRejectedCount] = await Promise.all([
      this.aiSafetyEventRepository.countRejectedByStudentId(childId),
      this.voiceSafetyEventRepository.countRejectedByStudentId(childId),
    ]);

    const summary = new ParentAiSafetySummaryEntity();
    summary.childId = childId;
    summary.blockedInteractionCount = chatRejectedCount + voiceRejectedCount;
    summary.retrievedAt = new Date().toISOString();

    return summary;
  }
}

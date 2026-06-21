// P18-070: Create Parent AI Read-Only Summary UI (backend)
// Read-only parent-facing AI usage summary for a linked, consented child.
// Every field is a count/timestamp already persisted by the AI Teacher
// (text chat) and Voice Tutor session tables — no mastery, weakness,
// difficulty, recommendation, or review-schedule value is computed here,
// and no raw conversation/voice content or safety reason-category
// taxonomy is ever included.

import { ApiProperty } from '@nestjs/swagger';

export class ParentAiUsageSummaryEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty({ description: 'Total AI Teacher text chat sessions started.' })
  textChatSessionCount!: number;

  @ApiProperty({ description: 'Total Voice Tutor sessions started.' })
  voiceSessionCount!: number;

  @ApiProperty({ nullable: true, description: 'Most recent AI Teacher or Voice Tutor activity timestamp.' })
  lastActivityAt!: string | null;

  @ApiProperty()
  retrievedAt!: string;
}

// P18-071: Create Parent AI Safety Summary UI (backend)
// Read-only parent-facing AI safety summary for a linked, consented child.
// Exposes only a count of blocked/rejected safety events across AI Teacher
// text chat and Voice Tutor sessions — never the raw rejected message,
// audio, transcript, or the internal reason_category taxonomy.

import { ApiProperty } from '@nestjs/swagger';

export class ParentAiSafetySummaryEntity {
  @ApiProperty()
  childId!: string;

  @ApiProperty({
    description:
      'Total count of AI Teacher/Voice Tutor responses or messages blocked by Safety Filtering for this child.',
  })
  blockedInteractionCount!: number;

  @ApiProperty()
  retrievedAt!: string;
}

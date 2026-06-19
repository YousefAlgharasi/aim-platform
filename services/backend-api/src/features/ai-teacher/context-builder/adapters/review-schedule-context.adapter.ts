// P8-036: Add Review Schedule Context
// Wraps ReviewScheduleReadService (P5-072) — exposes backend-approved,
// already-scheduled spaced-repetition reviews as read-only AI Teacher
// prompt context so AI Teacher can reference reviews without generating
// or recalculating a schedule itself.

import { Injectable } from '@nestjs/common';
import { ReviewScheduleReadService } from '../../../aim/result/review-schedule-read.service';

export interface ReviewScheduleContextEntry {
  readonly skillId: string;
  readonly dueAt: string;
  readonly status: string;
}

@Injectable()
export class ReviewScheduleContextAdapter {
  constructor(private readonly reviewScheduleRead: ReviewScheduleReadService) {}

  async getReviewScheduleContext(studentId: string): Promise<ReviewScheduleContextEntry[] | null> {
    const { reviewSchedules } = await this.reviewScheduleRead.getReviewSchedulesForStudent(
      studentId,
    );
    const pending = reviewSchedules.filter((entry) => entry.status !== 'completed');
    if (pending.length === 0) {
      return null;
    }
    return pending.map((entry) => ({
      skillId: entry.skillId,
      dueAt: entry.dueAt,
      status: entry.status,
    }));
  }
}

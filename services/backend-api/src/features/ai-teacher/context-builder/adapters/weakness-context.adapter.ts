// P8-034: Add Weakness Context
// Wraps WeaknessRecordsReadService (P5-070) — exposes backend-approved,
// already-persisted weakness records as read-only AI Teacher prompt context
// so AI Teacher can explain/target weaknesses without recalculating them.

import { Injectable } from '@nestjs/common';
import { WeaknessRecordsReadService } from '../../../aim/result/weakness-records-read.service';

export interface WeaknessContextEntry {
  readonly skillId: string;
  readonly severity: string;
  readonly status: string;
  readonly detectedAt: string;
}

@Injectable()
export class WeaknessContextAdapter {
  constructor(private readonly weaknessRecordsRead: WeaknessRecordsReadService) {}

  async getWeaknessContext(studentId: string): Promise<WeaknessContextEntry[] | null> {
    const { weaknessRecords } = await this.weaknessRecordsRead.getWeaknessRecordsForStudent(
      studentId,
    );
    const active = weaknessRecords.filter((record) => record.status !== 'resolved');
    if (active.length === 0) {
      return null;
    }
    return active.map((record) => ({
      skillId: record.skillId,
      severity: record.severity,
      status: record.status,
      detectedAt: record.detectedAt,
    }));
  }
}

// StudentChaptersService.
//
// Scope: Compute the mobile Chapter List screen's per-chapter progress
// summary (percent complete, status) from real lesson_progress data. This
// is a straightforward count-based percentage, not an AIM mastery/level
// computation — it never touches skill_states, weakness_records, or any
// AIM-owned table, so it is not subject to the "no client-side AIM logic"
// rule (the computation itself lives here, backend-side, not in Flutter).

import { Injectable } from '@nestjs/common';
import { StudentChaptersRepository } from './student-chapters.repository';
import {
  StudentChapterStatus,
  StudentChapterSummary,
  StudentChaptersResponse,
} from './student-chapters.types';

@Injectable()
export class StudentChaptersService {
  constructor(private readonly repository: StudentChaptersRepository) {}

  async getChapters(studentId: string, levelId: string): Promise<StudentChaptersResponse> {
    const rows = await this.repository.findChaptersWithProgress(studentId, levelId);

    const chapters: StudentChapterSummary[] = rows.map((row) => {
      const lessonCount = parseInt(row.lesson_count, 10) || 0;
      const completedLessonCount = parseInt(row.completed_lesson_count, 10) || 0;
      const percent = lessonCount === 0 ? 0 : Math.round((completedLessonCount / lessonCount) * 100);

      let status: StudentChapterStatus;
      if (lessonCount > 0 && completedLessonCount === lessonCount) {
        status = 'completed';
      } else if (completedLessonCount > 0) {
        status = 'in_progress';
      } else {
        status = 'not_started';
      }

      return {
        chapterId: row.chapter_id,
        title: row.title,
        description: row.description,
        levelCode: row.level_code,
        lessonCount,
        completedLessonCount,
        percent,
        status,
      };
    });

    return { chapters };
  }
}

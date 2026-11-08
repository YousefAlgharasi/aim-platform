import { Injectable } from '@nestjs/common';

import type { SupportedLocale } from '../../common/locale/locale.constants';
import { LevelsService } from '../curriculum/levels/levels.service';
import { StudentChaptersService } from '../student-chapters/student-chapters.service';
import type { StudentChapterSummary } from '../student-chapters/student-chapters.types';
import { StudentLessonsService } from '../student-lessons/student-lessons.service';
import type { StudentCoursePathResponse } from './student-course-path.types';

const MAX_LEVELS = 100;

/**
 * Picks the chapter to work on: the first in-progress chapter that is not
 * locked, else the first not-completed chapter that is not locked. A chapter
 * is locked until the one before it (across levels) is completed. Returns the
 * index in `chapters`, or -1 when none applies.
 */
export function pickActiveChapterIndex(chapters: readonly Pick<StudentChapterSummary, 'status'>[]): number {
  const isLocked = (i: number): boolean =>
    chapters[i].status !== 'completed' && i > 0 && chapters[i - 1].status !== 'completed';
  const inProgress = chapters.findIndex((c, i) => c.status === 'in_progress' && !isLocked(i));
  if (inProgress >= 0) return inProgress;
  return chapters.findIndex((c, i) => c.status !== 'completed' && !isLocked(i));
}

@Injectable()
export class StudentCoursePathService {
  constructor(
    private readonly levels: LevelsService,
    private readonly chapters: StudentChaptersService,
    private readonly lessons: StudentLessonsService,
  ) {}

  /** `studentId` must come from the JWT; the caller must already have checked course access. */
  async getPath(studentId: string, courseId: string, locale: SupportedLocale): Promise<StudentCoursePathResponse> {
    const { levels } = await this.levels.listLevels(courseId, 1, MAX_LEVELS, 'published');

    const perLevel = await Promise.all(levels.map((level) => this.chapters.getChapters(studentId, level.id, locale)));

    const pathLevels = levels.map((level, i) => ({
      levelId: level.id,
      title: level.title,
      code: level.code,
      sortOrder: level.sortOrder,
      chapters: perLevel[i].chapters,
    }));
    const ordered = pathLevels.flatMap((l) => l.chapters);
    const finalExam = perLevel.find((r) => r.finalExam)?.finalExam ?? null;

    const idx = pickActiveChapterIndex(ordered);
    if (idx < 0) return { levels: pathLevels, finalExam, activeChapter: null };

    const { lessons, quiz } = await this.lessons.getLessons(studentId, ordered[idx].chapterId, locale);
    return {
      levels: pathLevels,
      finalExam,
      activeChapter: { chapterId: ordered[idx].chapterId, chapterNumber: idx + 1, lessons, quiz },
    };
  }
}

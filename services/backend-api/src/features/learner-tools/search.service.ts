import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { courseTextSql, lessonTextSql } from '../../common/locale/course-text.sql';

export interface SearchResults {
  courses: Array<{ id: string; title: string; levelCode: string | null }>;
  lessons: Array<{ id: string; title: string; courseId: string; courseTitle: string }>;
  words: Array<{ id: string; word: string; meaning: string | null }>;
}

/** Escape LIKE wildcards so a query like "50%" matches literally. */
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async search(studentId: string, rawQuery: string, locale: 'en' | 'ar'): Promise<SearchResults> {
    const q = (rawQuery ?? '').trim().slice(0, 60);
    if (q.length < 2) return { courses: [], lessons: [], words: [] };
    const pat = likePattern(q);
    const ct = courseTextSql('co', '$2');
    const lt = lessonTextSql('l', '$2');
    const [courses, lessons, words] = await Promise.all([
      this.db.query<any>(
        `SELECT co.id, ${ct.title} AS title, co.cefr_code
         FROM courses co ${ct.joins}
         WHERE co.status = 'published'
           AND (co.title ILIKE $1 OR ${ct.title} ILIKE $1
                OR EXISTS (SELECT 1 FROM course_translations t WHERE t.course_id = co.id AND t.title ILIKE $1))
         ORDER BY co.cefr_rank NULLS LAST LIMIT 6`, [pat, locale]),
      this.db.query<any>(
        `SELECT l.id, ${lt.title} AS title, co.id AS course_id, co.title AS course_title
         FROM lessons l ${lt.joins}
         JOIN chapters ch ON ch.id = l.chapter_id
         JOIN levels lv ON lv.id = ch.level_id
         JOIN courses co ON co.id = lv.course_id AND co.status = 'published'
         WHERE l.status = 'published'
           AND (l.title ILIKE $1 OR ${lt.title} ILIKE $1
                OR EXISTS (SELECT 1 FROM lesson_translations t WHERE t.lesson_id = l.id AND t.title ILIKE $1))
         ORDER BY co.cefr_rank NULLS LAST, ch.sort_order, l.sort_order LIMIT 8`, [pat, locale]),
      this.db.query<any>(
        `SELECT id, word, meaning FROM saved_words
         WHERE student_id = $3 AND (word ILIKE $1 OR meaning ILIKE $1) ORDER BY created_at DESC LIMIT 6`,
        [pat, locale, studentId]),
    ]);
    return {
      courses: courses.rows.map((r) => ({ id: r.id, title: r.title, levelCode: r.cefr_code })),
      lessons: lessons.rows.map((r) => ({ id: r.id, title: r.title, courseId: r.course_id, courseTitle: r.course_title })),
      words: words.rows.map((r) => ({ id: r.id, word: r.word, meaning: r.meaning })),
    };
  }
}

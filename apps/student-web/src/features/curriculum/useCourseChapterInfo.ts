import { useEffect, useState } from 'react';
import { fetchCourseLevels, fetchStudentChapters, type StudentCourse } from './curriculumApi';

export interface CourseChapterInfo {
  count: number;
  /** Published chapter titles in curriculum order. */
  titles: string[];
}

/**
 * Published chapter count and titles per course id, from the existing level and chapter endpoints
 * (the courses list doesn't carry them). A course whose lookup fails is left out, so its card just
 * omits the count and the list.
 */
export function useCourseChapterInfo(courses: StudentCourse[]): Record<string, CourseChapterInfo> {
  const [info, setInfo] = useState<Record<string, CourseChapterInfo>>({});

  useEffect(() => {
    let cancelled = false;
    courses.forEach((course) => {
      fetchCourseLevels(course.courseId)
        .then((levels) => Promise.all(levels.map((l) => fetchStudentChapters(l.id))))
        .then((perLevel) => {
          const titles = perLevel.flatMap((r) => r.chapters.map((c) => c.title)).filter(Boolean);
          const count = perLevel.reduce((sum, r) => sum + r.chapters.length, 0);
          if (!cancelled) setInfo((prev) => ({ ...prev, [course.courseId]: { count, titles } }));
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [courses]);

  return info;
}

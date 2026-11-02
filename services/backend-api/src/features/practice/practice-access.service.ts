// Practice Speaking / Write a Paragraph are for students who have started a course and still
// have access to it (running paid window, completed, or a free course).

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { DatabaseService } from '../../database/database.service';
import { COURSE_PAYMENT_REQUIRED, CourseAccessService } from '../course-billing/course-access.service';

@Injectable()
export class PracticeAccessService {
  constructor(
    private readonly db: DatabaseService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  async assertAccess(studentId: string): Promise<void> {
    const student = await this.courseAccess.resolveStudent(studentId);
    const enrollment = await this.db.query<{ course_id: string }>(
      `SELECT course_id FROM course_enrollments
       WHERE student_id::text = ANY($1) AND status = 'active' LIMIT 1`,
      [student.forms],
    );
    const courseId = enrollment.rows[0]?.course_id;
    const hasAccess = courseId
      ? (await this.courseAccess.getBilling(student.userId, courseId)).access.hasAccess
      : false;
    if (!hasAccess) {
      throw new AppError({
        code: COURSE_PAYMENT_REQUIRED,
        message: 'Start a course to use practice speaking and writing.',
        statusCode: HttpStatus.PAYMENT_REQUIRED,
      });
    }
  }
}

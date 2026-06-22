/**
 * P8-068: Build AI Teacher Feedback Service (Group G — AI Teacher Backend
 * Pipeline). Records a student's helpful/not-helpful rating of an AI
 * Teacher reply via `AiTeacherFeedbackRepository` (P8-026). Validates that
 * the referenced message exists, was authored by the AI Teacher (not the
 * student's own message), and belongs to the given studentId, and that no
 * feedback has already been recorded for that message. Computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value;
 * feedback is advisory only and is never read by the AIM Engine
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

import { AiChatMessageRepository } from '../repositories/ai-chat-message.repository';
import { AiTeacherFeedbackRepository } from '../repositories/ai-teacher-feedback.repository';
import {
  SubmitTeacherFeedbackInput,
  SubmitTeacherFeedbackResult,
} from './ai-teacher-feedback-submit.types';

const VALID_RATINGS = new Set(['helpful', 'not_helpful']);

@Injectable()
export class AiTeacherFeedbackSubmitService {
  constructor(
    private readonly chatMessageRepository: AiChatMessageRepository,
    private readonly feedbackRepository: AiTeacherFeedbackRepository,
  ) {}

  async submitFeedback(
    input: SubmitTeacherFeedbackInput,
  ): Promise<SubmitTeacherFeedbackResult> {
    const studentId = input.studentId?.trim();
    const messageId = input.messageId?.trim();
    const rating = input.rating;

    if (!studentId) {
      throw new BadRequestException('Cannot submit AI Teacher feedback: studentId is missing.');
    }

    if (!messageId) {
      throw new BadRequestException('Cannot submit AI Teacher feedback: messageId is missing.');
    }

    if (!VALID_RATINGS.has(rating)) {
      throw new BadRequestException('Cannot submit AI Teacher feedback: rating must be helpful or not_helpful.');
    }

    const message = await this.chatMessageRepository.findById(messageId);

    if (!message || message.student_id !== studentId) {
      throw new NotFoundException('Cannot submit AI Teacher feedback: message not found.');
    }

    if (message.role !== 'ai_teacher') {
      throw new BadRequestException('Cannot submit AI Teacher feedback: message is not an AI Teacher reply.');
    }

    const existing = await this.feedbackRepository.findByMessageId(messageId);

    if (existing) {
      throw new ConflictException('Cannot submit AI Teacher feedback: feedback already recorded for this message.');
    }

    const feedback = await this.feedbackRepository.create(messageId, studentId, rating);

    return {
      feedbackId: feedback.id,
      messageId: feedback.message_id,
      rating: feedback.rating,
      createdAt: feedback.created_at,
    };
  }
}

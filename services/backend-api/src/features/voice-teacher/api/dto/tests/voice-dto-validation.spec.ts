import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StartVoiceSessionDto } from '../start-voice-session.dto';
import { SubmitVoiceFeedbackDto, VoiceFeedbackRatingDto } from '../submit-voice-feedback.dto';

describe('StartVoiceSessionDto', () => {
  it('should accept empty body', async () => {
    const dto = plainToInstance(StartVoiceSessionDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept valid contextRef', async () => {
    const dto = plainToInstance(StartVoiceSessionDto, { contextRef: 'lesson-1' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject non-string contextRef', async () => {
    const dto = plainToInstance(StartVoiceSessionDto, { contextRef: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('SubmitVoiceFeedbackDto', () => {
  it('should accept valid feedback', async () => {
    const dto = plainToInstance(SubmitVoiceFeedbackDto, {
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      rating: VoiceFeedbackRatingDto.HELPFUL,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject missing messageId', async () => {
    const dto = plainToInstance(SubmitVoiceFeedbackDto, {
      rating: 'helpful',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid rating', async () => {
    const dto = plainToInstance(SubmitVoiceFeedbackDto, {
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 'invalid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept optional comment', async () => {
    const dto = plainToInstance(SubmitVoiceFeedbackDto, {
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      rating: VoiceFeedbackRatingDto.NOT_HELPFUL,
      comment: 'Too fast',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

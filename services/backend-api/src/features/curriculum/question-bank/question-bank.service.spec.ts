import { HttpStatus } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = {
  query: jest.fn(),
} as unknown as DatabaseService;

const service = new QuestionBankService(mockDb);

beforeEach(() => jest.clearAllMocks());

const NOW = '2026-01-01T00:00:00Z';
const USER_ID = 'user-uuid-1';

const baseRow = {
  id: 'q-uuid-1',
  type: 'multiple_choice',
  stem: 'What is the past simple of "go"?',
  rich_stem: null,
  difficulty: 'elementary',
  explanation: null,
  hint: null,
  tags: [],
  status: 'draft',
  created_by: USER_ID,
  created_at: NOW,
  updated_at: NOW,
};

describe('QuestionBankService.listQuestions', () => {
  it('returns paginated result with no filters', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '5' }] })
      .mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.listQuestions(1, 20);
    expect(result.total).toBe(5);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].stem).toBe(baseRow.stem);
  });

  it('rejects invalid type', async () => {
    await expect(service.listQuestions(1, 20, 'bad_type')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('rejects invalid difficulty', async () => {
    await expect(
      service.listQuestions(1, 20, undefined, 'super_hard'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects invalid status', async () => {
    await expect(
      service.listQuestions(1, 20, undefined, undefined, 'unknown'),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('clamps limit to MAX_LIMIT', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listQuestions(1, 9999);
    const secondCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(secondCall[1]).toContain(100);
  });

  it('applies text search across question fields', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listQuestions(1, 20, undefined, undefined, undefined, 'past');

    const countCall = (mockDb.query as jest.Mock).mock.calls[0];
    expect(countCall[0]).toContain('stem ILIKE $1');
    expect(countCall[0]).toContain('array_to_string(tags');
    expect(countCall[1]).toContain('%past%');
  });
});

describe('QuestionBankService.getQuestion', () => {
  it('returns question detail', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.getQuestion('q-uuid-1');
    expect(result.id).toBe('q-uuid-1');
    expect(result.type).toBe('multiple_choice');
    expect(result.explanation).toBeNull();
  });

  it('throws NOT_FOUND when question is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getQuestion('missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});

describe('QuestionBankService.createQuestion', () => {
  const validInput = {
    type: 'multiple_choice' as const,
    stem: 'What is the past simple of "go"?',
    difficulty: 'elementary' as const,
    createdBy: USER_ID,
  };

  it('creates question in draft status', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.createQuestion(validInput);
    expect(result.status).toBe('draft');
    expect(result.type).toBe('multiple_choice');
  });

  it('throws BAD_REQUEST for empty stem', async () => {
    await expect(
      service.createQuestion({ ...validInput, stem: '  ' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST for invalid type', async () => {
    await expect(
      service.createQuestion({ ...validInput, type: 'essay' as any }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST for invalid difficulty', async () => {
    await expect(
      service.createQuestion({ ...validInput, difficulty: 'very_hard' as any }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });
});

describe('QuestionBankService.updateQuestion', () => {
  it('throws FORBIDDEN when question is not draft', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ ...baseRow, status: 'published' }],
    });

    await expect(
      service.updateQuestion('q-uuid-1', { stem: 'New stem' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.FORBIDDEN });
  });

  it('throws BAD_REQUEST when stem set to empty', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    await expect(
      service.updateQuestion('q-uuid-1', { stem: '' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws BAD_REQUEST for invalid difficulty', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    await expect(
      service.updateQuestion('q-uuid-1', { difficulty: 'mega_hard' as any }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('returns existing when no fields changed', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.updateQuestion('q-uuid-1', {});
    expect(result.id).toBe('q-uuid-1');
    expect((mockDb.query as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('updates stem successfully', async () => {
    const updated = { ...baseRow, stem: 'Updated stem?' };
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [baseRow] })
      .mockResolvedValueOnce({ rows: [updated] });

    const result = await service.updateQuestion('q-uuid-1', { stem: 'Updated stem?' });
    expect(result.stem).toBe('Updated stem?');
  });
});

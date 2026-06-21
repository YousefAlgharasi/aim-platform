import { HttpStatus } from '@nestjs/common';
import { ContentStatusWorkflowService } from './content-status-workflow.service';

const mockQuery = jest.fn();
const mockDb = { query: mockQuery } as any;
const mockPublishValidation = {
  validateReadyForPublish: jest.fn(),
} as any;
const mockAnalyticsEventIngestion = {
  ingest: jest.fn().mockResolvedValue(undefined),
} as any;

const service = new ContentStatusWorkflowService(mockDb, mockPublishValidation, mockAnalyticsEventIngestion);

beforeEach(() => {
  mockQuery.mockReset();
  mockPublishValidation.validateReadyForPublish.mockReset();
  mockAnalyticsEventIngestion.ingest.mockClear();
});

function makeStatusRow(status: string) {
  return { rows: [{ id: 'uuid-1', status, updated_at: '2026-01-01T00:00:00Z' }] };
}

describe('ContentStatusWorkflowService', () => {
  describe('publish', () => {
    it('transitions draft course to published', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('draft'))
        .mockResolvedValueOnce(makeStatusRow('published'));
      mockPublishValidation.validateReadyForPublish.mockResolvedValueOnce(undefined);

      const result = await service.publish('courses', 'uuid-1');

      expect(result.previousStatus).toBe('draft');
      expect(result.currentStatus).toBe('published');
      expect(result.entityType).toBe('courses');
      expect(mockPublishValidation.validateReadyForPublish).toHaveBeenCalledWith('courses', 'uuid-1');
    });

    it('rejects published -> published transition', async () => {
      mockQuery.mockResolvedValueOnce(makeStatusRow('published'));

      await expect(service.publish('courses', 'uuid-1')).rejects.toMatchObject({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('rejects archived -> published transition', async () => {
      mockQuery.mockResolvedValueOnce(makeStatusRow('archived'));

      await expect(service.publish('courses', 'uuid-1')).rejects.toMatchObject({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('rejects publish when publish validation fails', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('draft'));
      mockPublishValidation.validateReadyForPublish.mockRejectedValueOnce({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });

      await expect(service.publish('lessons', 'uuid-1')).rejects.toMatchObject({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('allows lesson publish when publish validation passes', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('draft'))
        .mockResolvedValueOnce(makeStatusRow('published'));
      mockPublishValidation.validateReadyForPublish.mockResolvedValueOnce(undefined);

      const result = await service.publish('lessons', 'uuid-1');
      expect(result.currentStatus).toBe('published');
      expect(mockPublishValidation.validateReadyForPublish).toHaveBeenCalledWith('lessons', 'uuid-1');
    });
  });

  describe('archive', () => {
    it('transitions published entity to archived', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('published'))
        .mockResolvedValueOnce(makeStatusRow('archived'));

      const result = await service.archive('lessons', 'uuid-1');
      expect(result.currentStatus).toBe('archived');
    });

    it('transitions draft entity to archived', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('draft'))
        .mockResolvedValueOnce(makeStatusRow('archived'));

      const result = await service.archive('chapters', 'uuid-1');
      expect(result.currentStatus).toBe('archived');
    });
  });

  describe('restore', () => {
    it('transitions archived entity back to draft', async () => {
      mockQuery
        .mockResolvedValueOnce(makeStatusRow('archived'))
        .mockResolvedValueOnce(makeStatusRow('draft'));

      const result = await service.restore('courses', 'uuid-1');
      expect(result.currentStatus).toBe('draft');
      expect(result.previousStatus).toBe('archived');
    });

    it('rejects published -> draft transition', async () => {
      mockQuery.mockResolvedValueOnce(makeStatusRow('published'));

      await expect(service.restore('courses', 'uuid-1')).rejects.toMatchObject({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });
  });

  describe('entity validation', () => {
    it('throws 400 for unknown entity type', async () => {
      await expect(service.publish('unknown' as any, 'uuid-1')).rejects.toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });

    it('throws 404 when entity does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.publish('courses', 'uuid-missing')).rejects.toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });
});

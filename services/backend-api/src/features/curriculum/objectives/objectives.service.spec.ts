import { Test, TestingModule } from '@nestjs/testing';
import { ObjectivesService } from './objectives.service';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';

describe('ObjectivesService', () => {
  let service: ObjectivesService;
  let dbService: DatabaseService;

  const mockDbService = {
    query: jest.fn(),
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectivesService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<ObjectivesService>(ObjectivesService);
    dbService = module.get<DatabaseService>(DatabaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createObjective', () => {
    it('should throw if title is empty', async () => {
      await expect(service.createObjective({ title: '   ' })).rejects.toThrow(AppError);
    });

    it('should throw if key format is invalid', async () => {
      await expect(service.createObjective({ title: 'T', key: 'Invalid Key!' })).rejects.toThrow(AppError);
    });
  });

  describe('listObjectives', () => {
    it('should throw if status is invalid', async () => {
      await expect(service.listObjectives(1, 20, 'invalid_status')).rejects.toThrow(AppError);
    });
  });
});

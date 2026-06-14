import { HttpStatus } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = { query: jest.fn() } as unknown as DatabaseService;
const service = new SkillsService(mockDb);

beforeEach(() => jest.clearAllMocks());

const skillRow = {
  id: 'skill-uuid-1',
  key: 'grammar.past_simple.forms',
  title: 'Past Simple Forms',
  description: null,
  domain: 'grammar',
  parent_skill_id: null,
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('SkillsService.listSkills', () => {
  it('returns paginated skills', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '5' }] })
      .mockResolvedValueOnce({ rows: [skillRow] });

    const result = await service.listSkills(1, 20);

    expect(result.total).toBe(5);
    expect(result.skills[0].key).toBe('grammar.past_simple.forms');
  });

  it('rejects invalid domain', async () => {
    await expect(service.listSkills(1, 20, 'invalid_domain')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('rejects invalid status', async () => {
    await expect(service.listSkills(1, 20, undefined, 'bad_status')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});

describe('SkillsService.getSkill', () => {
  it('throws NOT_FOUND when missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getSkill('missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns skill summary', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [skillRow] });

    const skill = await service.getSkill('skill-uuid-1');

    expect(skill.key).toBe('grammar.past_simple.forms');
    expect(skill.domain).toBe('grammar');
    expect(skill.parentSkillId).toBeNull();
  });
});

describe('SkillsService.getSkillByKey', () => {
  it('returns skill by stable key', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [skillRow] });

    const skill = await service.getSkillByKey('grammar.past_simple.forms');

    expect(skill.id).toBe('skill-uuid-1');
  });

  it('throws NOT_FOUND for unknown key', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getSkillByKey('grammar.unknown')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});

describe('SkillsService.createSkill', () => {
  it('rejects invalid key format', async () => {
    await expect(
      service.createSkill({ key: 'BadKey', title: 'T', domain: 'grammar' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects key with no dots', async () => {
    await expect(
      service.createSkill({ key: 'grammar', title: 'T', domain: 'grammar' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects invalid domain', async () => {
    await expect(
      service.createSkill({ key: 'grammar.test.key', title: 'T', domain: 'invalid' as never }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('rejects empty title', async () => {
    await expect(
      service.createSkill({ key: 'grammar.test.key', title: '  ', domain: 'grammar' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.BAD_REQUEST });
  });

  it('throws CONFLICT on duplicate key', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

    await expect(
      service.createSkill({ key: 'grammar.past_simple.forms', title: 'T', domain: 'grammar' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('creates skill in draft status', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ ...skillRow, id: 'new-uuid', title: 'Past Simple Forms' }],
      });

    const skill = await service.createSkill({
      key: 'grammar.past_simple.forms',
      title: 'Past Simple Forms',
      domain: 'grammar',
    });

    expect(skill.status).toBe('draft');
    expect(skill.key).toBe('grammar.past_simple.forms');
  });
});

describe('SkillsService.updateSkill', () => {
  it('throws NOT_FOUND when skill missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.updateSkill('missing', { title: 'X' })).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns existing skill when no fields to update', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [skillRow] })
      .mockResolvedValueOnce({ rows: [skillRow] });

    const skill = await service.updateSkill('skill-uuid-1', {});

    expect(skill.key).toBe('grammar.past_simple.forms');
  });

  it('rejects empty title on update', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [skillRow] });

    await expect(service.updateSkill('skill-uuid-1', { title: '' })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});

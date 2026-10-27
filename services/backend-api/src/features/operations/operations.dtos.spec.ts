import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFeedbackDto, CreateSupportTicketDto, CreateTicketCommentDto } from './operations.dtos';

const ticket = { category: 'general', severity: 'low', subject: 'Help', description: 'Broken' };
const feedback = { category: 'other', title: 'Nice', body: 'Great', sourceSurface: 'api' };

async function errorsFor<T extends object>(cls: new () => T, plain: Record<string, unknown>) {
  const instance = plainToInstance(cls, plain);
  return { instance, errors: (await validate(instance, { whitelist: true, forbidNonWhitelisted: true })).map((e) => e.property) };
}

describe('operations DTO text trimming', () => {
  it('rejects whitespace-only ticket subject and description', async () => {
    const { errors } = await errorsFor(CreateSupportTicketDto, { ...ticket, subject: '   ', description: ' \n\t ' });
    expect(errors).toEqual(expect.arrayContaining(['subject', 'description']));
  });

  it('trims valid ticket text', async () => {
    const { instance, errors } = await errorsFor(CreateSupportTicketDto, { ...ticket, subject: '  Help  ', description: '  Broken ' });
    expect(errors).toEqual([]);
    expect(instance.subject).toBe('Help');
    expect(instance.description).toBe('Broken');
  });

  it('applies the subject length limit after trimming', async () => {
    const ok = await errorsFor(CreateSupportTicketDto, { ...ticket, subject: ` ${'a'.repeat(500)} ` });
    expect(ok.errors).toEqual([]);
    const tooLong = await errorsFor(CreateSupportTicketDto, { ...ticket, subject: 'a'.repeat(501) });
    expect(tooLong.errors).toContain('subject');
  });

  it('rejects a whitespace-only comment body and trims a valid one', async () => {
    expect((await errorsFor(CreateTicketCommentDto, { body: '   ' })).errors).toContain('body');
    const { instance, errors } = await errorsFor(CreateTicketCommentDto, { body: '  hi ' });
    expect(errors).toEqual([]);
    expect(instance.body).toBe('hi');
  });

  it('rejects whitespace-only feedback title and body, keeps non-strings invalid', async () => {
    const blank = await errorsFor(CreateFeedbackDto, { ...feedback, title: ' ', body: ' ' });
    expect(blank.errors).toEqual(expect.arrayContaining(['title', 'body']));
    const nonString = await errorsFor(CreateFeedbackDto, { ...feedback, title: 123 });
    expect(nonString.errors).toContain('title');
  });
});

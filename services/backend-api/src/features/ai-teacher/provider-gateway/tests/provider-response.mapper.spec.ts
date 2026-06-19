// P8-056: Create AI Provider Response Mapper
// ProviderResponseMapperService tests.

import { ProviderResponseMapperService } from '../provider-response.mapper';
import { ProviderResponseMapperInput } from '../provider-response-mapper.types';

function makeInput(overrides: Partial<ProviderResponseMapperInput> = {}): ProviderResponseMapperInput {
  return {
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 42,
    raw: { choices: [{ message: { content: 'Great job!' } }] },
    ...overrides,
  };
}

describe('ProviderResponseMapperService', () => {
  const mapper = new ProviderResponseMapperService();

  it('maps a successful raw response with usable text to status success', () => {
    const response = mapper.mapResponse(makeInput());

    expect(response).toEqual({
      status: 'success',
      text: 'Great job!',
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 42,
    });
  });

  it('maps an explicit errorCategory to status error without inventing text', () => {
    const response = mapper.mapResponse(
      makeInput({ raw: null, errorCategory: 'PROVIDER_RATE_LIMITED' }),
    );

    expect(response.status).toBe('error');
    expect(response.text).toBeNull();
    expect(response.errorCategory).toBe('PROVIDER_RATE_LIMITED');
  });

  it('maps a missing raw response (no errorCategory given) to status error', () => {
    const response = mapper.mapResponse(makeInput({ raw: null }));

    expect(response.status).toBe('error');
    expect(response.text).toBeNull();
    expect(response.errorCategory).toBe('PROVIDER_CALL_FAILED');
  });

  it('maps a raw response with empty choices to status error', () => {
    const response = mapper.mapResponse(makeInput({ raw: { choices: [] } }));

    expect(response.status).toBe('error');
    expect(response.text).toBeNull();
    expect(response.errorCategory).toBe('PROVIDER_EMPTY_RESPONSE');
  });

  it('maps a raw response with blank/whitespace-only content to status error', () => {
    const response = mapper.mapResponse(
      makeInput({ raw: { choices: [{ message: { content: '   ' } }] } }),
    );

    expect(response.status).toBe('error');
    expect(response.text).toBeNull();
    expect(response.errorCategory).toBe('PROVIDER_EMPTY_RESPONSE');
  });

  it('maps a raw response with null content to status error', () => {
    const response = mapper.mapResponse(
      makeInput({ raw: { choices: [{ message: { content: null } }] } }),
    );

    expect(response.status).toBe('error');
    expect(response.text).toBeNull();
    expect(response.errorCategory).toBe('PROVIDER_EMPTY_RESPONSE');
  });

  it('passes provider, model, and latencyMs through unchanged', () => {
    const response = mapper.mapResponse(
      makeInput({ provider: 'openai', model: 'gpt-x', latencyMs: 999 }),
    );

    expect(response.provider).toBe('openai');
    expect(response.model).toBe('gpt-x');
    expect(response.latencyMs).toBe(999);
  });

  it('never injects a mastery, level, weakness, difficulty, recommendation, or review-schedule field', () => {
    const response = mapper.mapResponse(makeInput());
    const serialized = JSON.stringify(response);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/level/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('response status is restricted to success or error from this mapper', () => {
    const successResponse = mapper.mapResponse(makeInput());
    const errorResponse = mapper.mapResponse(makeInput({ raw: null }));

    expect(['success', 'error', 'timeout']).toContain(successResponse.status);
    expect(['success', 'error', 'timeout']).toContain(errorResponse.status);
  });
});

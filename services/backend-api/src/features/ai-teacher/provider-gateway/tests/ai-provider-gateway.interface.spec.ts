// P8-053: Create AI Provider Interface
// AiProviderGateway contract tests.

import { AiProviderGateway } from '../ai-provider-gateway.interface';
import { AiProviderRequest, AiProviderResponse } from '../provider-gateway.types';
import { AiTeacherPrompt } from '../../prompt-builder/prompt-builder.types';

class FakeAiProviderGateway extends AiProviderGateway {
  async complete(request: AiProviderRequest): Promise<AiProviderResponse> {
    return {
      status: 'success',
      text: `echo: ${request.prompt.studentMessage}`,
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 12,
    };
  }
}

function makePrompt(studentMessage: string): AiTeacherPrompt {
  return {
    systemInstructions: 'system instructions',
    sections: [],
    studentMessage,
  };
}

describe('AiProviderGateway', () => {
  it('can be implemented by a concrete class conforming to the contract', async () => {
    const gateway: AiProviderGateway = new FakeAiProviderGateway();
    const response = await gateway.complete({
      sessionId: 'session-1',
      prompt: makePrompt('Hello'),
    });

    expect(response.status).toBe('success');
    expect(response.text).toBe('echo: Hello');
  });

  it('response type never carries a mastery, level, weakness, difficulty, recommendation, or review-schedule field', async () => {
    const gateway: AiProviderGateway = new FakeAiProviderGateway();
    const response = await gateway.complete({
      sessionId: 'session-1',
      prompt: makePrompt('Hello'),
    });

    const serialized = JSON.stringify(response);
    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/level/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('response status is restricted to success, error, or timeout', async () => {
    const gateway: AiProviderGateway = new FakeAiProviderGateway();
    const response = await gateway.complete({
      sessionId: 'session-1',
      prompt: makePrompt('Hello'),
    });

    expect(['success', 'error', 'timeout']).toContain(response.status);
  });
});

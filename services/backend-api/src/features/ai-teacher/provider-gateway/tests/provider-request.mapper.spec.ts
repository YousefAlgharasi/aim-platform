// P8-055: Create AI Provider Request Mapper
// ProviderRequestMapperService tests.

import { ProviderRequestMapperService } from '../provider-request.mapper';
import { ProviderGatewayConfigService } from '../provider-gateway.config';
import { AiProviderRequest } from '../provider-gateway.types';
import { AiTeacherPrompt } from '../../prompt-builder/prompt-builder.types';

function makeConfigService(model: string): ProviderGatewayConfigService {
  return {
    getConfig: () => ({ apiKey: 'test-api-key', model }),
  } as unknown as ProviderGatewayConfigService;
}

function makePrompt(overrides: Partial<AiTeacherPrompt> = {}): AiTeacherPrompt {
  return {
    systemInstructions: 'system instructions',
    sections: [],
    studentMessage: 'Hello',
    ...overrides,
  };
}

describe('ProviderRequestMapperService', () => {
  it('maps the prompt system instructions to a system message', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('test-model'));
    const request: AiProviderRequest = {
      sessionId: 'session-1',
      prompt: makePrompt({ systemInstructions: 'You are the AI Teacher.' }),
    };

    const mapped = mapper.mapRequest(request);

    expect(mapped.messages[0]).toEqual({
      role: 'system',
      content: 'You are the AI Teacher.',
    });
  });

  it('reads the model from ProviderGatewayConfigService rather than hard-coding it', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('configured-model'));
    const request: AiProviderRequest = { sessionId: 'session-1', prompt: makePrompt() };

    const mapped = mapper.mapRequest(request);

    expect(mapped.model).toBe('configured-model');
  });

  it('combines sections and the student message into a single user message, in order', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('test-model'));
    const request: AiProviderRequest = {
      sessionId: 'session-1',
      prompt: makePrompt({
        sections: [
          { key: 'currentLesson', content: '{"lessonId":"lesson-1"}' },
          { key: 'weakness', content: '{"skillId":"skill-1"}' },
        ],
        studentMessage: 'Can you help with this lesson?',
      }),
    };

    const mapped = mapper.mapRequest(request);
    const userMessage = mapped.messages[1];

    expect(userMessage.role).toBe('user');
    expect(userMessage.content.indexOf('[currentLesson]')).toBeLessThan(
      userMessage.content.indexOf('[weakness]'),
    );
    expect(userMessage.content.indexOf('[weakness]')).toBeLessThan(
      userMessage.content.indexOf('Student: Can you help with this lesson?'),
    );
  });

  it('produces exactly one system message and one user message when there are no sections', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('test-model'));
    const request: AiProviderRequest = {
      sessionId: 'session-1',
      prompt: makePrompt({ sections: [], studentMessage: 'Hi' }),
    };

    const mapped = mapper.mapRequest(request);

    expect(mapped.messages).toHaveLength(2);
    expect(mapped.messages[1]).toEqual({ role: 'user', content: 'Student: Hi' });
  });

  it('never includes the provider API key in the mapped request', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('test-model'));
    const request: AiProviderRequest = { sessionId: 'session-1', prompt: makePrompt() };

    const mapped = mapper.mapRequest(request);

    expect(JSON.stringify(mapped)).not.toMatch(/test-api-key/);
  });

  it('never injects a mastery, level, weakness, difficulty, recommendation, or review-schedule value', () => {
    const mapper = new ProviderRequestMapperService(makeConfigService('test-model'));
    const request: AiProviderRequest = {
      sessionId: 'session-1',
      prompt: makePrompt({
        sections: [{ key: 'weakness', content: '{"skillId":"skill-1"}' }],
      }),
    };

    const mapped = mapper.mapRequest(request);
    const serialized = JSON.stringify(mapped);

    expect(serialized).not.toMatch(/"mastery":\s*\d/);
    expect(serialized).not.toMatch(/"level":\s*\d/);
    expect(serialized).not.toMatch(/"difficulty":\s*\d/);
  });

  it('never reads process.env or hard-codes a provider API key in the mapper source', () => {
    const source = require('fs').readFileSync(
      require.resolve('../provider-request.mapper'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});

// P4-052: PlacementAiGradingService unit tests.
//
// Coverage:
//   - gradeWriting parses a well-formed JSON reply.
//   - gradeSpeaking parses a well-formed JSON reply.
//   - Malformed / non-JSON model replies fall back defensively (never throw).
//   - Score is clamped into [0, 10].
//   - A provider call failure falls back defensively (never throws).
//   - Empty submitted text short-circuits without calling the provider.

import { AiTeacherProviderGateway } from '../ai-teacher/governance/ai-teacher-provider.interface';
import { ProviderGatewayConfigService } from '../ai-teacher/provider-gateway/provider-gateway.config';
import { PlacementAiGradingService } from './placement-ai-grading.service';

function makeProvider(replyText: string | null): jest.Mocked<Pick<AiTeacherProviderGateway, 'generateText'>> {
  return {
    generateText: jest.fn().mockResolvedValue({ text: replyText ?? '', tokensUsed: 10 }),
  };
}

function makeConfig(): jest.Mocked<Pick<ProviderGatewayConfigService, 'getConfig'>> {
  return {
    getConfig: jest.fn().mockReturnValue({ apiKey: 'test-key', model: 'test-model', baseUrl: 'https://example.test' }),
  };
}

describe('PlacementAiGradingService', () => {
  it('gradeWriting parses a well-formed JSON reply', async () => {
    const provider = makeProvider('{"score": 7.5, "feedback": "Good structure, minor grammar issues."}');
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeWriting('Describe your city.', 'My city is very nice and big.');
    expect(result.score).toBe(7.5);
    expect(result.feedback).toContain('grammar');
    expect(provider.generateText).toHaveBeenCalledTimes(1);
  });

  it('gradeSpeaking parses a well-formed JSON reply', async () => {
    const provider = makeProvider('{"score": 4, "feedback": "Limited vocabulary."}');
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeSpeaking('Talk about yourself.', 'My name is Ali I like football.');
    expect(result.score).toBe(4);
    expect(result.feedback).toBe('Limited vocabulary.');
  });

  it('falls back defensively when the reply is not valid JSON', async () => {
    const provider = makeProvider('Sorry, I cannot grade this right now.');
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeWriting('prompt', 'some text');
    expect(result.score).toBe(0);
    expect(result.feedback).toBeTruthy();
  });

  it('clamps an out-of-range score into [0, 10]', async () => {
    const provider = makeProvider('{"score": 25, "feedback": "excellent"}');
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeWriting('prompt', 'some text');
    expect(result.score).toBe(10);
  });

  it('falls back defensively when the provider call throws', async () => {
    const provider = { generateText: jest.fn().mockRejectedValue(new Error('network down')) };
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeWriting('prompt', 'some text');
    expect(result.score).toBe(0);
    expect(result.feedback).toBeTruthy();
  });

  it('short-circuits without calling the provider for empty submitted text', async () => {
    const provider = makeProvider(null);
    const svc = new PlacementAiGradingService(
      provider as unknown as AiTeacherProviderGateway,
      makeConfig() as unknown as ProviderGatewayConfigService,
    );

    const result = await svc.gradeWriting('prompt', '   ');
    expect(result.score).toBe(0);
    expect(provider.generateText).not.toHaveBeenCalled();
  });
});

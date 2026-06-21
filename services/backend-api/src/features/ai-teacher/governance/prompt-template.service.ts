// P18-027: Create Prompt Template Service
// Backend-controlled prompt resolution/versioning by name, locale, and
// audience. Centralizes prompt authority — callers never select a
// template body directly; they ask for a (name, locale, audience) and
// always receive the current active version, server-resolved.

import { Injectable, NotFoundException } from '@nestjs/common';

import { AiPromptTemplateRepository } from './ai-prompt-template.repository';
import { AiPromptTemplateRow } from './governance-repository.types';

@Injectable()
export class PromptTemplateService {
  constructor(private readonly promptTemplateRepository: AiPromptTemplateRepository) {}

  async resolveActiveTemplate(
    name: string,
    locale: string,
    audience: string,
  ): Promise<AiPromptTemplateRow> {
    const template = await this.promptTemplateRepository.findActiveByNameAndLocale(
      name,
      locale,
      audience,
    );

    if (!template) {
      throw new NotFoundException(
        `No active prompt template found for name="${name}" locale="${locale}" audience="${audience}"`,
      );
    }

    return template;
  }

  async listActiveTemplates(): Promise<AiPromptTemplateRow[]> {
    return this.promptTemplateRepository.listByStatus('active');
  }
}

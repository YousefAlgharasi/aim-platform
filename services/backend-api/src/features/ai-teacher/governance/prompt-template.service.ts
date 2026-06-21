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

  // ---------------------------------------------------------------------
  // P18-048: Admin AI Prompt Management API — read/draft/versioning/
  // publishing. Only an admin caller (enforced by the controller's role
  // guard) may reach these; prompt authority never moves to the client.
  // ---------------------------------------------------------------------

  async listAllTemplates(): Promise<AiPromptTemplateRow[]> {
    return this.promptTemplateRepository.listAll();
  }

  async getTemplateById(id: string): Promise<AiPromptTemplateRow> {
    const template = await this.promptTemplateRepository.findById(id);

    if (!template) {
      throw new NotFoundException(`Prompt template not found: ${id}`);
    }

    return template;
  }

  async createDraftTemplate(input: {
    name: string;
    locale: string;
    audience: string;
    body: string;
    safetyTags?: Record<string, unknown>;
  }): Promise<AiPromptTemplateRow> {
    const version = await this.promptTemplateRepository.findNextVersion(
      input.name,
      input.locale,
      input.audience,
    );

    return this.promptTemplateRepository.createDraft({ ...input, version });
  }

  /** Publishes a draft/retired version as the sole active version for its
   *  (name, locale, audience) triple, retiring any previously active one. */
  async publishTemplate(id: string): Promise<AiPromptTemplateRow> {
    const template = await this.getTemplateById(id);

    await this.promptTemplateRepository.retireActiveByNameAndLocale(
      template.name,
      template.locale,
      template.audience,
    );

    const published = await this.promptTemplateRepository.updateStatus(id, 'active');

    if (!published) {
      throw new NotFoundException(`Prompt template not found: ${id}`);
    }

    return published;
  }

  async retireTemplate(id: string): Promise<AiPromptTemplateRow> {
    const retired = await this.promptTemplateRepository.updateStatus(id, 'retired');

    if (!retired) {
      throw new NotFoundException(`Prompt template not found: ${id}`);
    }

    return retired;
  }
}

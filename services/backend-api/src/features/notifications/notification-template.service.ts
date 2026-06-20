import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationTemplateRow } from './notification-repository.types';

@Injectable()
export class NotificationTemplateService {
  constructor(private readonly repo: NotificationRepository) {}

  async resolveTemplate(
    key: string,
    channel: string,
    locale: string,
  ): Promise<NotificationTemplateRow> {
    const template = await this.repo.findTemplateByKeyChannelLocale(key, channel, locale);
    if (!template) {
      const fallback = await this.repo.findTemplateByKeyChannelLocale(key, channel, 'en');
      if (!fallback) {
        throw new NotFoundException(`No active template found for key=${key}, channel=${channel}`);
      }
      return fallback;
    }
    return template;
  }

  async findByCategoryAndChannel(
    category: string,
    channel: string,
  ): Promise<NotificationTemplateRow[]> {
    return this.repo.findTemplatesByCategoryAndChannel(category, channel);
  }

  renderTemplate(template: NotificationTemplateRow, variables: Record<string, string>): { title: string; body: string } {
    let title = template.title_template;
    let body = template.body_template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      title = title.split(placeholder).join(value);
      body = body.split(placeholder).join(value);
    }
    return { title, body };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsAuditService } from './operations-audit.service';
import { ReleaseNote } from './operations.entities';

export interface CreateReleaseNoteDraftDto {
  title: string;
  body?: string;
  version: string;
  audience: ReleaseNote['audience'];
}

@Injectable()
export class ReleaseNotesService {
  private readonly logger = new Logger(ReleaseNotesService.name);

  constructor(private readonly auditService: OperationsAuditService) {}

  async createDraft(
    dto: CreateReleaseNoteDraftDto,
    adminId: string,
  ): Promise<ReleaseNote> {
    const note: ReleaseNote = {
      id: crypto.randomUUID(),
      title: dto.title,
      body: dto.body || null,
      version: dto.version,
      audience: dto.audience,
      status: 'draft',
      createdBy: adminId,
      publishedAt: null,
      publishedBy: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Release note draft created: ${note.id} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.draft_created',
      'release_note',
      note.id,
      { title: dto.title, version: dto.version },
    );

    // TODO: Persist to database when operations repository is implemented
    return note;
  }

  async getDrafts(adminId: string): Promise<ReleaseNote[]> {
    this.logger.debug(`Fetching release note drafts for admin ${adminId}`);

    // TODO: Query from database filtering status='draft'
    return [];
  }

  async getPublished(audience?: string): Promise<ReleaseNote[]> {
    this.logger.debug(`Fetching published release notes for audience=${audience || 'all'}`);

    // TODO: Query from database filtering status='published' and optional audience
    return [];
  }

  async getById(id: string): Promise<ReleaseNote> {
    this.logger.debug(`Fetching release note: ${id}`);

    // TODO: Query from database when operations repository is implemented
    throw new NotFoundException(`Release note ${id} not found`);
  }

  async publish(id: string, adminId: string): Promise<ReleaseNote> {
    const note = await this.getById(id);

    const published: ReleaseNote = {
      ...note,
      status: 'published',
      publishedAt: new Date(),
      publishedBy: adminId,
      updatedAt: new Date(),
    };

    this.logger.log(`Release note ${id} published by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.published',
      'release_note',
      id,
      { title: note.title, version: note.version },
    );

    // TODO: Persist to database when operations repository is implemented
    return published;
  }

  async archive(id: string, adminId: string): Promise<ReleaseNote> {
    const note = await this.getById(id);

    const archived: ReleaseNote = {
      ...note,
      status: 'archived',
      updatedAt: new Date(),
    };

    this.logger.log(`Release note ${id} archived by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.archived',
      'release_note',
      id,
      { title: note.title, version: note.version },
    );

    // TODO: Persist to database when operations repository is implemented
    return archived;
  }
}

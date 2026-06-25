import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
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

  constructor(
    private readonly opsRepo: OperationsRepository,
    private readonly auditService: OperationsAuditService,
  ) {}

  async createDraft(
    dto: CreateReleaseNoteDraftDto,
    adminId: string,
  ): Promise<ReleaseNote> {
    const note = await this.opsRepo.createReleaseNote({
      title: dto.title,
      body: dto.body || null,
      version: dto.version,
      audience: dto.audience,
      createdBy: adminId,
      metadata: {},
    });

    this.logger.log(`Release note draft created: ${note.id} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.draft_created',
      'release_note',
      note.id,
      { title: dto.title, version: dto.version },
    );

    return note;
  }

  async getDrafts(adminId: string): Promise<ReleaseNote[]> {
    this.logger.debug(`Fetching release note drafts for admin ${adminId}`);
    return this.opsRepo.findAllReleaseNotes(50, 0);
  }

  async getPublished(audience?: string): Promise<ReleaseNote[]> {
    this.logger.debug(`Fetching published release notes for audience=${audience || 'all'}`);
    return this.opsRepo.findPublishedReleaseNotes(50, 0);
  }

  async getById(id: string): Promise<ReleaseNote> {
    this.logger.debug(`Fetching release note: ${id}`);
    const note = await this.opsRepo.findReleaseNoteById(id);
    if (!note) {
      throw new NotFoundException(`Release note ${id} not found`);
    }
    return note;
  }

  async publish(id: string, adminId: string): Promise<ReleaseNote> {
    const note = await this.getById(id);

    const published = await this.opsRepo.publishReleaseNote(id, adminId);
    if (!published) {
      throw new NotFoundException(`Release note ${id} not found`);
    }

    this.logger.log(`Release note ${id} published by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.published',
      'release_note',
      id,
      { title: note.title, version: note.version },
    );

    return published;
  }

  async archive(id: string, adminId: string): Promise<ReleaseNote> {
    const note = await this.getById(id);

    const archived = await this.opsRepo.archiveReleaseNote(id);
    if (!archived) {
      throw new NotFoundException(`Release note ${id} not found`);
    }

    this.logger.log(`Release note ${id} archived by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'release_note.archived',
      'release_note',
      id,
      { title: note.title, version: note.version },
    );

    return archived;
  }
}

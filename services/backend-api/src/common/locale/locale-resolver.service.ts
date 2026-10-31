import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { DEFAULT_LOCALE, SupportedLocale } from './locale.constants';
import { normalizeLocale } from './locale.util';
import { LocaleContext } from './request-locale.decorator';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class LocaleResolverService {
  constructor(private readonly db: DatabaseService) {}

  async resolve(context: LocaleContext): Promise<SupportedLocale> {
    if (context.requested !== null) {
      return context.requested;
    }

    if (context.userId !== null) {
      const stored = await this.readStoredPreference(context.userId);
      if (stored !== null) {
        return stored;
      }
    }

    return DEFAULT_LOCALE;
  }

  resolveExplicit(context: LocaleContext): SupportedLocale {
    return context.requested ?? DEFAULT_LOCALE;
  }

  private async readStoredPreference(userId: string): Promise<SupportedLocale | null> {
    if (!UUID_PATTERN.test(userId)) {
      return null;
    }

    try {
      const result = await this.db.query<{ preferred_language: string | null }>(
        `SELECT preferred_language FROM student_profiles WHERE user_id = $1::uuid LIMIT 1`,
        [userId],
      );
      return normalizeLocale(result.rows[0]?.preferred_language);
    } catch {
      return null;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthEventType, AuthLogContext } from './auth-logging.types';

@Injectable()
export class AuthLoggingService {
  private readonly logger = new Logger(AuthLoggingService.name);

  constructor(private readonly db: DatabaseService) {}

  async log(eventType: AuthEventType, context: AuthLogContext = {}): Promise<void> {
    const { userId, supabaseAuthUid, actorUserId, ipAddress, userAgent, metadata } = context;

    try {
      await this.db.query(
        `INSERT INTO auth_audit_logs
           (user_id, supabase_auth_uid, event_type, actor_user_id, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId ?? null,
          supabaseAuthUid ?? null,
          eventType,
          actorUserId ?? null,
          ipAddress ?? null,
          userAgent ?? null,
          metadata ? JSON.stringify(metadata) : null,
        ],
      );
    } catch (error) {
      this.logger.error(
        `Failed to write auth audit log for event "${eventType}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

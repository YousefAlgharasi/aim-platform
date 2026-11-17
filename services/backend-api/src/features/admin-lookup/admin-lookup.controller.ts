// Admin name lookup: turns UUIDs shown in admin tables into human-readable names.
// Read-only, admin/super_admin only. IDs are globally unique UUIDs, so one call resolves mixed kinds
// (students, users, assessments, skills, courses, lessons, ...).
import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { DatabaseService } from '../../database/database.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 300;

// Each branch yields (id, name, detail, kind). Student/admin profile ids and user ids all resolve to the person.
const LOOKUP_SQL = `
  SELECT sp.id::text AS id, COALESCE(NULLIF(btrim(sp.display_name), ''), u.email) AS name, u.email AS detail, 'student' AS kind
    FROM student_profiles sp LEFT JOIN users u ON u.id = sp.user_id WHERE sp.id = ANY($1::uuid[])
  UNION ALL
  SELECT ap.id::text, COALESCE(NULLIF(btrim(ap.display_name), ''), u.email), u.email, 'admin'
    FROM admin_profiles ap LEFT JOIN users u ON u.id = ap.user_id WHERE ap.id = ANY($1::uuid[])
  UNION ALL
  SELECT u.id::text,
         COALESCE(NULLIF(btrim(sp.display_name), ''), NULLIF(btrim(ap.display_name), ''), u.email), u.email, 'user'
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    LEFT JOIN admin_profiles ap ON ap.user_id = u.id
   WHERE u.id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'assessment' FROM assessments WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'skill' FROM skills WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'course' FROM courses WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'level' FROM levels WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'chapter' FROM chapters WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'lesson' FROM lessons WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'objective' FROM objectives WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'placement_test' FROM placement_tests WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'story' FROM stories WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, title, NULL, 'achievement' FROM achievement_definitions WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, left(stem, 80), NULL, 'question' FROM question_bank WHERE id = ANY($1::uuid[])
  UNION ALL SELECT id::text, word, NULL, 'vocabulary' FROM vocabulary_words WHERE id = ANY($1::uuid[])
`;

export interface LookupEntry {
  name: string;
  detail: string | null;
  kind: string;
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/lookup')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminLookupController {
  constructor(private readonly db: DatabaseService) {}

  @Post('names')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resolve UUIDs to human-readable names (students, users, assessments, skills, courses, ...). Admin only.' })
  async names(@Body() body: { ids?: unknown }): Promise<Record<string, LookupEntry>> {
    if (!Array.isArray(body?.ids)) throw new BadRequestException('ids must be a list of UUIDs.');
    const ids = Array.from(new Set(body.ids.filter((x): x is string => typeof x === 'string' && UUID.test(x)))).slice(0, MAX_IDS);
    if (ids.length === 0) return {};
    const r = await this.db.query<{ id: string; name: string | null; detail: string | null; kind: string }>(LOOKUP_SQL, [ids]);
    const out: Record<string, LookupEntry> = {};
    for (const row of r.rows) {
      if (!row.name) continue;
      // A person can match twice (profile id vs user id never collide); keep the first non-empty hit per id.
      out[row.id] ??= { name: row.name, detail: row.detail, kind: row.kind };
    }
    return out;
  }
}

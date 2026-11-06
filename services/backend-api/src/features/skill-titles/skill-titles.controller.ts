// GET /student/skills/titles — skill key → readable title, for every published skill.
//
// Security: same guards as the other student endpoints; the data is a public-facing catalogue
// (titles only), never per-student.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { SkillTitle, SkillTitlesService } from './skill-titles.service';

@ApiTags('skills')
@Controller('student/skills')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class SkillTitlesController {
  constructor(private readonly service: SkillTitlesService) {}

  @Get('titles')
  @ApiOperation({ summary: 'Readable titles for every published skill key.' })
  @ApiOkResponse({ description: 'Skill titles: { skills: [{ key, title }] }.' })
  async titles(): Promise<{ skills: SkillTitle[] }> {
    return { skills: await this.service.list() };
  }
}

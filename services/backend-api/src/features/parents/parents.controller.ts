// P12-031: Create Parent Children API
// Exposes the authenticated parent's own linked children. This endpoint
// is self-scoping (it only ever returns links owned by the requesting
// parent), so it requires authentication only — no per-child guard is
// needed since no single child id is taken from client input.

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { StudentsService } from '../students/students.service';
import { ParentChildSummaryEntity } from './dto/parent-child-summary.entity';
import { ParentDashboardSummaryDto } from './dto/parent-dashboard-summary.dto';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentDashboardSummaryService } from './parent-dashboard-summary.service';

@ApiTags('Parent')
@ApiBearerAuth()
@Controller('api/v1/parent')
export class ParentsController {
  constructor(
    private readonly parentChildLinkService: ParentChildLinkService,
    private readonly studentsService: StudentsService,
    private readonly parentDashboardSummaryService: ParentDashboardSummaryService,
  ) {}

  @Get('children')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "List the authenticated parent's linked children." })
  @ApiOkResponse({ type: ParentChildSummaryEntity, isArray: true })
  async listChildren(@CurrentUser() user: AuthenticatedUser): Promise<ParentChildSummaryEntity[]> {
    const links = await this.parentChildLinkService.listLinksForParent(user.id);
    const activeLinks = links.filter((link) => link.status !== 'revoked');

    return Promise.all(
      activeLinks.map(async (link) => {
        const studentProfile = await this.studentsService.findByUserId(link.childId);

        const summary = new ParentChildSummaryEntity();
        summary.childId = link.childId;
        summary.displayName = studentProfile?.displayName ?? link.childId;
        summary.relationshipType = link.relationshipType;
        summary.linkStatus = link.status;

        return summary;
      }),
    );
  }

  @Get('dashboard-summary')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "Return the authenticated parent's dashboard summary across all linked children." })
  @ApiOkResponse({ type: ParentDashboardSummaryDto })
  async getDashboardSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ParentDashboardSummaryDto> {
    return this.parentDashboardSummaryService.getSummaryForParent(user.id);
  }
}

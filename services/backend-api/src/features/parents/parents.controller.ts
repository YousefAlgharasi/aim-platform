// P12-031: Create Parent Children API
// Exposes the authenticated parent's own linked children. This endpoint
// is self-scoping (it only ever returns links owned by the requesting
// parent), so it requires authentication only — no per-child guard is
// needed since no single child id is taken from client input.

import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { StudentsService } from '../students/students.service';
import { ParentChildSummaryEntity } from './dto/parent-child-summary.entity';
import { ParentDashboardSummaryDto } from './dto/parent-dashboard-summary.dto';
import { ParentChildProgressEntity } from './dto/parent-child-progress.entity';
import { ParentAssessmentSummaryEntity } from './dto/parent-assessment-summary.entity';
import { ParentActivitySummaryEntity } from './dto/parent-activity-summary.entity';
import { ParentChildReportEntity } from './dto/parent-child-report.entity';
import { GetParentReportRequestDto } from './dto/get-parent-report-request.dto';
import { ParentInvitationEntity } from './dto/parent-invitation.entity';
import { CreateParentInvitationRequestDto } from './dto/create-parent-invitation-request.dto';
import { AcceptParentInvitationRequestDto } from './dto/accept-parent-invitation-request.dto';
import { ParentConsentEntity } from './dto/parent-consent.entity';
import { GrantParentConsentRequestDto } from './dto/grant-parent-consent-request.dto';
import { RevokeParentConsentRequestDto } from './dto/revoke-parent-consent-request.dto';
import { ParentNotificationPreferenceEntity } from './dto/parent-notification-preference.entity';
import { UpdateParentNotificationPreferenceRequestDto } from './dto/update-parent-notification-preference-request.dto';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentDashboardSummaryService } from './parent-dashboard-summary.service';
import { ParentChildProgressService } from './parent-child-progress.service';
import { ParentAssessmentSummaryService } from './parent-assessment-summary.service';
import { ParentActivitySummaryService } from './parent-activity-summary.service';
import { ParentReportService } from './parent-report.service';
import { ParentInvitationService } from './parent-invitation.service';
import { ParentConsentService } from './parent-consent.service';
import { ParentNotificationPreferenceService } from './parent-notification-preference.service';
import { RequireParentChildAccess, ParentChildAccessGuard } from './guards';

@ApiTags('Parent')
@ApiBearerAuth()
@Controller('api/v1/parent')
export class ParentsController {
  constructor(
    private readonly parentChildLinkService: ParentChildLinkService,
    private readonly studentsService: StudentsService,
    private readonly parentDashboardSummaryService: ParentDashboardSummaryService,
    private readonly parentChildProgressService: ParentChildProgressService,
    private readonly parentAssessmentSummaryService: ParentAssessmentSummaryService,
    private readonly parentActivitySummaryService: ParentActivitySummaryService,
    private readonly parentReportService: ParentReportService,
    private readonly parentInvitationService: ParentInvitationService,
    private readonly parentConsentService: ParentConsentService,
    private readonly parentNotificationPreferenceService: ParentNotificationPreferenceService,
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

  @Get('children/:childId/progress')
  @UseGuards(SupabaseJwtAuthGuard, ParentChildAccessGuard)
  @RequireParentChildAccess({ consentType: 'progress_view' })
  @ApiOperation({ summary: "Return a linked, consented child's progress and skill-state summary." })
  @ApiParam({ name: 'childId' })
  @ApiOkResponse({ type: ParentChildProgressEntity })
  async getChildProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ): Promise<ParentChildProgressEntity> {
    return this.parentChildProgressService.getProgressForParent(user.id, childId);
  }

  @Get('children/:childId/assessments')
  @UseGuards(SupabaseJwtAuthGuard, ParentChildAccessGuard)
  @RequireParentChildAccess({ consentType: 'assessment_view' })
  @ApiOperation({ summary: "Return a linked, consented child's assessment results and upcoming deadlines." })
  @ApiParam({ name: 'childId' })
  @ApiOkResponse({ type: ParentAssessmentSummaryEntity })
  async getChildAssessments(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ): Promise<ParentAssessmentSummaryEntity> {
    return this.parentAssessmentSummaryService.getAssessmentSummaryForParent(user.id, childId);
  }

  @Get('children/:childId/activity')
  @UseGuards(SupabaseJwtAuthGuard, ParentChildAccessGuard)
  @RequireParentChildAccess({ consentType: 'progress_view' })
  @ApiOperation({ summary: "Return a linked, consented child's recent activity/session summary." })
  @ApiParam({ name: 'childId' })
  @ApiOkResponse({ type: ParentActivitySummaryEntity })
  async getChildActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
  ): Promise<ParentActivitySummaryEntity> {
    return this.parentActivitySummaryService.getActivitySummaryForParent(user.id, childId);
  }

  @Get('children/:childId/reports')
  @UseGuards(SupabaseJwtAuthGuard, ParentChildAccessGuard)
  @RequireParentChildAccess()
  @ApiOperation({ summary: "Return a backend-approved weekly/monthly report for a linked child." })
  @ApiParam({ name: 'childId' })
  @ApiOkResponse({ type: ParentChildReportEntity })
  async getChildReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('childId') childId: string,
    @Query() query: GetParentReportRequestDto,
  ): Promise<ParentChildReportEntity> {
    return this.parentReportService.getReportForParent(user.id, childId, query.period ?? 'weekly');
  }

  @Post('invitations')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: 'Create a pending parent-child invitation.' })
  @ApiOkResponse({ type: ParentInvitationEntity })
  async createInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateParentInvitationRequestDto,
  ): Promise<ParentInvitationEntity> {
    return this.parentInvitationService.createInvitation(
      user.id,
      body.relationshipType,
      body.childEmail,
      body.childId,
    );
  }

  @Post('invitations/accept')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: 'Accept a pending invitation by its code, establishing an active link.' })
  @ApiOkResponse({ type: ParentInvitationEntity })
  async acceptInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AcceptParentInvitationRequestDto,
  ): Promise<ParentInvitationEntity> {
    return this.parentInvitationService.acceptInvitation(user.id, body.invitationCode);
  }

  @Post('invitations/:invitationId/revoke')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "Revoke one of the authenticated parent's own pending invitations." })
  @ApiParam({ name: 'invitationId' })
  @ApiOkResponse({ type: ParentInvitationEntity })
  async revokeInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('invitationId') invitationId: string,
  ): Promise<ParentInvitationEntity> {
    return this.parentInvitationService.revokeInvitation(user.id, invitationId);
  }

  @Get('invitations')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "List the authenticated parent's invitations." })
  @ApiOkResponse({ type: ParentInvitationEntity, isArray: true })
  async listInvitations(@CurrentUser() user: AuthenticatedUser): Promise<ParentInvitationEntity[]> {
    return this.parentInvitationService.listInvitationsForParent(user.id);
  }

  @Post('consents')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: 'Grant a consent type on an existing parent-child link. Only the child party of the link may grant their own consent.' })
  @ApiOkResponse({ type: ParentConsentEntity })
  async grantConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GrantParentConsentRequestDto,
  ): Promise<ParentConsentEntity> {
    await this.assertChildOwnsLink(user.id, body.parentChildLinkId);

    return this.parentConsentService.grantConsent(body.parentChildLinkId, body.consentType, user.id);
  }

  @Post('consents/revoke')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: 'Revoke a consent type on an existing parent-child link. Only the child party of the link may revoke their own consent.' })
  @ApiOkResponse({ type: ParentConsentEntity })
  async revokeConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RevokeParentConsentRequestDto,
  ): Promise<ParentConsentEntity> {
    await this.assertChildOwnsLink(user.id, body.parentChildLinkId);

    return this.parentConsentService.revokeConsentByType(body.parentChildLinkId, body.consentType);
  }

  @Get('links/:linkId/consents')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: 'List consents for a parent-child link. Only the parent or child party of the link may read it.' })
  @ApiParam({ name: 'linkId' })
  @ApiOkResponse({ type: ParentConsentEntity, isArray: true })
  async listConsentsForLink(
    @CurrentUser() user: AuthenticatedUser,
    @Param('linkId') linkId: string,
  ): Promise<ParentConsentEntity[]> {
    const link = await this.parentChildLinkService.findLinkById(linkId);

    if (!link || (link.parentId !== user.id && link.childId !== user.id)) {
      throw new ForbiddenException('You do not have access to this parent-child link.');
    }

    return this.parentConsentService.listConsentsForLink(linkId);
  }

  @Get('notification-preferences')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "List the authenticated parent's notification preferences." })
  @ApiOkResponse({ type: ParentNotificationPreferenceEntity, isArray: true })
  async listNotificationPreferences(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ParentNotificationPreferenceEntity[]> {
    return this.parentNotificationPreferenceService.listPreferencesForParent(user.id);
  }

  @Patch('notification-preferences')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiOperation({ summary: "Update one of the authenticated parent's notification preferences." })
  @ApiOkResponse({ type: ParentNotificationPreferenceEntity })
  async updateNotificationPreference(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateParentNotificationPreferenceRequestDto,
  ): Promise<ParentNotificationPreferenceEntity> {
    return this.parentNotificationPreferenceService.updatePreference(
      user.id,
      body.channel,
      body.category,
      body.enabled,
    );
  }

  /**
   * Consent is the child's own grant of visibility to a parent — only the
   * child party of the link may grant or revoke it, never the parent
   * themselves or an unrelated caller.
   */
  private async assertChildOwnsLink(userId: string, linkId: string): Promise<void> {
    const link = await this.parentChildLinkService.findLinkById(linkId);

    if (!link || link.childId !== userId) {
      throw new ForbiddenException('Only the child party of this link may manage its consent.');
    }
  }
}

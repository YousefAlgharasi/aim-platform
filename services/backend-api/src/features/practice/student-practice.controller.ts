// Student practice endpoints (all gated by PracticeAccessService inside the services).
//
//   GET  /student/practice/topics?kind=speaking|writing    topics (translated)
//   POST /student/practice/speaking/start      { topicId }  -> attempt + AI voice session
//   POST /student/practice/speaking/:attemptId/complete     -> XP
//   POST /student/practice/writing/submit      { topicId, text } -> AI score, corrections, XP
//
// The student id always comes from the verified JWT. Speaking turns themselves use the existing
// /voice-teacher/sessions/:id/* endpoints with the returned sessionId.

import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { ResolveInternalUserIdGuard } from '../../auth/authorization/resolve-internal-user-id.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { ResolvedInternalUserId } from '../../auth/current-user.decorator';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { LocaleHeadersInterceptor } from '../../common/locale/locale-headers.interceptor';
import { LocaleResolverService } from '../../common/locale/locale-resolver.service';
import { LocaleContext, RequestLocale } from '../../common/locale/request-locale.decorator';
import { PracticeAccessService } from './practice-access.service';
import { PracticeAttemptsService } from './practice-attempts.service';
import { PracticeTopicsService } from './practice-topics.service';
import { StartSpeakingDto, SubmitWritingDto } from './practice.dtos';
import { PracticeKind, PracticeTopicView, SpeakingCompleteResult, SpeakingStartResult, WritingResult } from './practice.types';

@ApiTags('practice')
@Controller('student/practice')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@UseInterceptors(LocaleHeadersInterceptor)
@ApiBearerAuth()
export class StudentPracticeController {
  constructor(
    private readonly access: PracticeAccessService,
    private readonly topics: PracticeTopicsService,
    private readonly attempts: PracticeAttemptsService,
    private readonly localeResolver: LocaleResolverService,
  ) {}

  @Get('topics')
  @ApiOperation({ summary: 'Active practice topics of a kind, in the requested language.' })
  async list(
    @ResolvedInternalUserId() studentId: string,
    @Query('kind') kind: string,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<PracticeTopicView[]> {
    if (kind !== 'speaking' && kind !== 'writing') throw new BadRequestException('kind must be speaking or writing');
    await this.access.assertAccess(studentId);
    return this.topics.listActive(kind as PracticeKind, await this.localeResolver.resolve(localeCtx));
  }

  @Post('speaking/start')
  @HttpCode(HttpStatus.CREATED)
  async startSpeaking(
    @ResolvedInternalUserId() studentId: string,
    @Body() body: StartSpeakingDto,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<SpeakingStartResult> {
    return this.attempts.startSpeaking(studentId, body.topicId, await this.localeResolver.resolve(localeCtx));
  }

  @Post('speaking/:attemptId/complete')
  @HttpCode(HttpStatus.OK)
  async completeSpeaking(
    @ResolvedInternalUserId() studentId: string,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ): Promise<SpeakingCompleteResult> {
    return this.attempts.completeSpeaking(studentId, attemptId);
  }

  @Post('writing/submit')
  @HttpCode(HttpStatus.OK)
  async submitWriting(
    @ResolvedInternalUserId() studentId: string,
    @Body() body: SubmitWritingDto,
    @RequestLocale() localeCtx: LocaleContext,
  ): Promise<WritingResult> {
    return this.attempts.submitWriting(studentId, body.topicId, body.text, await this.localeResolver.resolve(localeCtx));
  }
}

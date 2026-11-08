import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { ResolveInternalUserIdGuard } from '../../auth/authorization/resolve-internal-user-id.guard';
import { CurrentUser, ResolvedInternalUserId } from '../../auth/current-user.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { VocabularyService } from './vocabulary.service';
import { StudyPlanService } from './study-plan.service';
import { MistakesService } from './mistakes.service';
import { SearchService } from './search.service';

const locale = (v?: string): 'en' | 'ar' => (v === 'ar' ? 'ar' : 'en');

@ApiTags('Learner tools')
@Controller()
@UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
@RequireRoles(AuthorizedRole.STUDENT)
@ApiBearerAuth()
export class LearnerToolsController {
  constructor(
    private readonly vocab: VocabularyService,
    private readonly plan: StudyPlanService,
    private readonly mistakes: MistakesService,
    private readonly search: SearchService,
  ) {}

  @Get('vocabulary')
  @ApiOperation({ summary: "List the student's saved words and how many are due for review." })
  list(@ResolvedInternalUserId() id: string) { return this.vocab.list(id); }

  @Post('vocabulary')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a word (re-saving updates its meaning/context).' })
  save(@ResolvedInternalUserId() id: string, @Body() body: Record<string, unknown>) { return this.vocab.save(id, body ?? {}); }

  // Declared before ':id' routes so "review" is not read as an id.
  @Get('vocabulary/review')
  @ApiOperation({ summary: 'Flashcards due for review now.' })
  due(@ResolvedInternalUserId() id: string) { return this.vocab.dueCards(id).then((cards) => ({ cards })); }

  @Post('vocabulary/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a flashcard answer (correct/incorrect) and reschedule it.' })
  review(@ResolvedInternalUserId() id: string, @Param('id', ParseUUIDPipe) wordId: string, @Body() body: { correct?: unknown }) {
    return this.vocab.review(id, wordId, body?.correct);
  }

  @Delete('vocabulary/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved word.' })
  async remove(@ResolvedInternalUserId() id: string, @Param('id', ParseUUIDPipe) wordId: string) { await this.vocab.remove(id, wordId); }

  @Get('student/study-plan')
  @ApiOperation({ summary: "The student's onboarding study plan, or null if not set yet." })
  async getPlan(@ResolvedInternalUserId() id: string) { return { plan: await this.plan.get(id) }; }

  @Put('student/study-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update the study plan (goal, daily minutes, reminder time).' })
  async savePlan(@ResolvedInternalUserId() id: string, @Body() body: Record<string, unknown>) { return { plan: await this.plan.save(id, body ?? {}) }; }

  @Get('student/mistakes')
  @ApiOperation({ summary: 'Questions whose latest attempt was wrong (for retry practice).' })
  listMistakes(@ResolvedInternalUserId() id: string, @CurrentUser('id') authId: string, @Query('skill') skill?: string) {
    // Attempts are stored under the sign-in id, so look under both ids. Optional skill filter: only the
    // mistakes that train this skill (used by the Improve page).
    return this.mistakes.list([id, authId], 30, skill?.trim() || undefined);
  }

  @Post('student/mistakes/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check a retry answer. Drill only: records no attempt and no mastery.' })
  checkMistake(@ResolvedInternalUserId() id: string, @CurrentUser('id') authId: string, @Body() body: { itemId?: unknown; answerId?: unknown }) {
    return this.mistakes.check([id, authId], body?.itemId, body?.answerId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search courses, lessons and saved words.' })
  find(@ResolvedInternalUserId() id: string, @Query('q') q = '', @Query('locale') loc?: string) {
    return this.search.search(id, q, locale(loc));
  }
}

// Admin AI Teacher "System prompt & rules" view.
//
// Read-only. Returns the instructions the AI Teacher is *actually* given, taken
// straight from the same builders the prompt pipeline uses, so what the admin
// sees can never drift from what the model receives.

import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import { AI_TEACHER_MAX_INVOCATIONS_PER_SESSION, AI_TEACHER_MAX_RESPONSE_WORDS } from '../ai-teacher.constants';
import {
  AI_PRACTICE_GREETING_INSTRUCTION,
  AI_TEACHER_GREETING_INSTRUCTION,
  AI_TEACHER_PROMPT_SECTION_ORDER,
  LESSON_COMPLETE_MARKER,
} from '../prompt-builder/prompt-builder.constants';
import {
  AiTeacherPromptSettingsService,
  PROMPT_PART_KEYS,
  PromptPartKey,
  PromptSettingsError,
} from '../prompt-builder/prompt-settings.service';

type Req_ = { user?: { id?: string; email?: string } };
const who = (r: Req_) => r.user?.email ?? r.user?.id ?? null;

function partKey(raw: string): PromptPartKey {
  if (!(PROMPT_PART_KEYS as readonly string[]).includes(raw)) throw new BadRequestException('Unknown prompt part.');
  return raw as PromptPartKey;
}

async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof PromptSettingsError) throw new BadRequestException(e.message);
    throw e;
  }
}

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/ai/system-prompt')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class AdminSystemPromptController {
  constructor(private readonly settings: AiTeacherPromptSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'The live AI Teacher prompt parts (default / override / effective), extra rules and limits. Admin only.' })
  @ApiOkResponse({ description: 'Prompt parts, rules and safety limits.' })
  async get() {
    await this.settings.refresh();
    return {
      ...this.settings.view(),
      practiceGreeting: AI_PRACTICE_GREETING_INSTRUCTION,
      greetingInstruction: AI_TEACHER_GREETING_INSTRUCTION,
      lessonCompleteMarker: LESSON_COMPLETE_MARKER,
      contextSections: [...AI_TEACHER_PROMPT_SECTION_ORDER, 'conversationHistory'],
      safetyRules: [
        `Replies longer than ${AI_TEACHER_MAX_RESPONSE_WORDS} words are rejected.`,
        'Replies containing prohibited language (hate, kill, abuse, racist, sexist, slur) are rejected.',
        'Replies that contain the correct answer of the question being practised are rejected (answer leakage).',
        `At most ${AI_TEACHER_MAX_INVOCATIONS_PER_SESSION} AI invocations per session for hooks.`,
        'AIM Engine is the only authority for mastery, level, weakness, difficulty, recommendations and review schedule.',
        'Per-student daily/monthly quotas are enforced before any provider call (see Usage).',
      ],
    };
  }

  @Put('parts/:key')
  @ApiOperation({ summary: 'Override one prompt part. Admin only.' })
  async setPart(@Param('key') key: string, @Body() body: { body?: unknown }, @Req() req: Req_) {
    const k = partKey(key);
    if (typeof body?.body !== 'string') throw new BadRequestException('body must be text.');
    await guard(() => this.settings.setPart(k, body.body as string, who(req)));
    return this.get();
  }

  @Delete('parts/:key')
  @ApiOperation({ summary: 'Reset one prompt part to the built-in default. Admin only.' })
  async resetPart(@Param('key') key: string) {
    await this.settings.resetPart(partKey(key));
    return this.get();
  }

  @Post('rules')
  @ApiOperation({ summary: 'Add an extra rule that is appended to every AI Teacher prompt. Admin only.' })
  async addRule(@Body() body: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }, @Req() req: Req_) {
    await guard(() => this.settings.createRule({ title: String(body?.title ?? ''), body: String(body?.body ?? ''), enabled: body?.enabled, courseTitles: body?.courseTitles }, who(req)));
    return this.get();
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Edit, enable or disable an extra rule. Admin only.' })
  async updateRule(@Param('id') id: string, @Body() body: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }, @Req() req: Req_) {
    await guard(() => this.settings.updateRule(id, body ?? {}, who(req)));
    return this.get();
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete an extra rule. Admin only.' })
  async deleteRule(@Param('id') id: string) {
    await this.settings.deleteRule(id);
    return this.get();
  }
}

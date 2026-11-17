// Admin "Voice languages" API: which languages speech-to-text and text-to-speech may use (Arabic / English only).
import { BadRequestException, Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../auth/authorization/required-roles.decorator';
import { OPENAPI_TAGS } from '../../../openapi/openapi.tags';
import {
  VOICE_LANGUAGES,
  VoiceLanguage,
  VoiceLanguageSettings,
  VoiceLanguageSettingsService,
} from './voice-language-settings.service';

interface UpdateBody {
  allowedLanguages?: unknown;
  sttDefaultLanguage?: unknown;
  sttMode?: unknown;
  ttsDefaultLanguage?: unknown;
  ttsArModel?: unknown;
  ttsArVoice?: unknown;
}

const isLang = (v: unknown): v is VoiceLanguage => typeof v === 'string' && (VOICE_LANGUAGES as readonly string[]).includes(v);
const optText = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 120) : null);

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/voice/settings')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class VoiceLanguageSettingsController {
  constructor(private readonly settings: VoiceLanguageSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Speech language settings (STT/TTS). Admin only.' })
  @ApiOkResponse({ description: 'Current settings.' })
  get(): Promise<VoiceLanguageSettings> {
    return this.settings.get();
  }

  @Put()
  @ApiOperation({ summary: 'Update speech language settings. Only ar and en are accepted. Admin only.' })
  async update(@Body() body: UpdateBody, @Req() req: { user?: { id?: string; email?: string } }): Promise<VoiceLanguageSettings> {
    const patch: Partial<Omit<VoiceLanguageSettings, 'updatedAt'>> = {};
    if (body.allowedLanguages !== undefined) {
      if (!Array.isArray(body.allowedLanguages) || !body.allowedLanguages.every(isLang) || body.allowedLanguages.length === 0) {
        throw new BadRequestException('allowedLanguages must be a non-empty list of "ar" and/or "en".');
      }
      patch.allowedLanguages = body.allowedLanguages;
    }
    if (body.sttDefaultLanguage !== undefined) {
      if (!isLang(body.sttDefaultLanguage)) throw new BadRequestException('sttDefaultLanguage must be "ar" or "en".');
      patch.sttDefaultLanguage = body.sttDefaultLanguage;
    }
    if (body.ttsDefaultLanguage !== undefined) {
      if (!isLang(body.ttsDefaultLanguage)) throw new BadRequestException('ttsDefaultLanguage must be "ar" or "en".');
      patch.ttsDefaultLanguage = body.ttsDefaultLanguage;
    }
    if (body.sttMode !== undefined) {
      if (body.sttMode !== 'auto' && body.sttMode !== 'fixed') throw new BadRequestException('sttMode must be "auto" or "fixed".');
      patch.sttMode = body.sttMode;
    }
    if (body.ttsArModel !== undefined) patch.ttsArModel = optText(body.ttsArModel);
    if (body.ttsArVoice !== undefined) patch.ttsArVoice = optText(body.ttsArVoice);
    try {
      return await this.settings.update(patch, req.user?.email ?? req.user?.id ?? null);
    } catch (e) {
      throw new BadRequestException(e instanceof Error ? e.message : 'Invalid settings.');
    }
  }
}

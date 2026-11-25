// Student API: pick the AI Teacher's voice. Only voices from the catalog (Groq English + Arabic) are accepted, and only
// for the languages the admin has enabled (Admin > Voice Languages).
//   GET  /student/voice-preferences          catalog + current choice
//   PUT  /student/voice-preferences          { en?: string|null, ar?: string|null }  (null = default)
//   GET  /student/voice-preferences/preview  ?language=en|ar&voice=<id>  -> audio/wav sample
import { BadRequestException, Body, Controller, Get, Header, HttpCode, HttpException, HttpStatus, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { SupabaseJwtAuthGuard } from '../../../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../../../auth/authorization/role.guard';
import { AuthorizedRole } from '../../../../auth/authorization/authorized-role';
import { RequireRoles } from '../../../../auth/authorization/required-roles.decorator';
import { ResolveInternalUserIdGuard } from '../../../../auth/authorization/resolve-internal-user-id.guard';
import { ResolvedInternalUserId } from '../../../../auth/current-user.decorator';
import { VoiceLanguageSettingsService } from '../../language-settings/voice-language-settings.service';
import { TtsAudioGenerationService } from '../tts-audio-generation.service';
import { StudentVoicePreferencesService, StudentVoiceChoice } from './student-voice-preferences.service';
import { PREVIEW_TEXT, VOICE_CATALOG, VoiceLang, isValidVoice } from './voice-catalog';

interface PutBody { en?: unknown; ar?: unknown }

const isLang = (v: unknown): v is VoiceLang => v === 'en' || v === 'ar';

@ApiTags('Voice Teacher')
@ApiBearerAuth()
@Controller('student/voice-preferences')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard, ResolveInternalUserIdGuard)
@RequireRoles(AuthorizedRole.STUDENT)
export class StudentVoicePreferencesController {
  constructor(
    private readonly prefs: StudentVoicePreferencesService,
    private readonly languages: VoiceLanguageSettingsService,
    private readonly tts: TtsAudioGenerationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Voices the student can choose from and the current choice.' })
  async get(@ResolvedInternalUserId() studentId: string) {
    const [selected, settings] = await Promise.all([this.prefs.get(studentId), this.languages.get()]);
    const languages = settings.allowedLanguages.map((code) => ({
      code,
      voices: VOICE_CATALOG[code],
      selected: selected[code],
      // Arabic speech only works when the admin has configured the Arabic model.
      available: code === 'en' || !!settings.ttsArModel,
    }));
    return { languages };
  }

  @Put()
  @ApiOperation({ summary: 'Choose the AI Teacher voice per language (null resets to the default).' })
  async put(@ResolvedInternalUserId() studentId: string, @Body() body: PutBody): Promise<StudentVoiceChoice> {
    const settings = await this.languages.get();
    const patch: { en?: string | null; ar?: string | null } = {};
    for (const lang of ['en', 'ar'] as const) {
      const v = body[lang];
      if (v === undefined) continue;
      if (v === null) { patch[lang] = null; continue; }
      if (typeof v !== 'string' || !isValidVoice(lang, v)) throw new BadRequestException(`Unknown ${lang} voice.`);
      if (!settings.allowedLanguages.includes(lang)) throw new BadRequestException(`${lang} speech is not enabled.`);
      patch[lang] = v;
    }
    return this.prefs.set(studentId, patch);
  }

  @Get('preview')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'private, max-age=86400')
  @ApiOperation({ summary: 'A short audio sample of one voice (generated once, then reused).' })
  async preview(@Query('language') language: string, @Query('voice') voice: string, @Res() res: Response): Promise<void> {
    if (!isLang(language) || !voice || !isValidVoice(language, voice)) throw new BadRequestException('Unknown voice.');
    const settings = await this.languages.get();
    if (!settings.allowedLanguages.includes(language)) throw new BadRequestException(`${language} speech is not enabled.`);
    let audio = await this.prefs.getPreview(language, voice);
    if (!audio) {
      try {
        audio = await this.tts.synthesizePreview(language, voice, PREVIEW_TEXT[language]);
      } catch (error) {
        // The provider refusing (most often Groq's small daily Arabic quota) is not a server fault: say so clearly.
        const msg = error instanceof Error ? error.message : String(error);
        const limited = /429|rate limit/i.test(msg);
        throw new HttpException(
          limited
            ? 'This voice sample is not available right now (the daily speech limit was reached). Please try again later.'
            : 'This voice sample could not be created. Please try again.',
          limited ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      await this.prefs.savePreview(language, voice, audio);
    }
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': String(audio.length) });
    res.end(audio);
  }
}

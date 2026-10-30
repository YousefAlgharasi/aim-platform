import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';

import { AudioTranscoderService, MP3_MIME } from './audio-transcoder.service';

const WAV_MIME = 'audio/wav';
const MP3_MEDIA_TYPES = new Set(['audio/mpeg', 'audio/mp3']);

export interface DeliverableAudio {
  readonly data: Buffer;
  readonly contentType: string;
}

/**
 * True when the request's Accept header explicitly lists MP3 with a non-zero quality. Wildcards do not
 * count: app versions released before the MP3 change send no audio Accept header (or a generic one) and
 * some of them save every clip as ".wav", so they must keep receiving WAV.
 */
export function acceptsMp3(accept: string | undefined): boolean {
  if (!accept) return false;
  return accept.split(',').some((range) => {
    const [type, ...params] = range.split(';').map((part) => part.trim().toLowerCase());
    if (!MP3_MEDIA_TYPES.has(type)) return false;
    const q = params.find((param) => param.startsWith('q='));
    return q === undefined || Number(q.slice(2)) > 0;
  });
}

/**
 * Sends stored TTS audio in a format the client can play. Stored assets are MP3; clients that have not
 * opted in get the same speech as WAV, decoded once per clip and kept alongside the shared MP3 buffer.
 */
@Injectable()
export class TtsAudioDeliveryService {
  private readonly logger = new Logger(TtsAudioDeliveryService.name);
  // Keyed by the MP3 Buffer that the asset cache and every student's reference share, so one decoded copy
  // serves all of them and disappears with the clip.
  private readonly wavCopies = new WeakMap<Buffer, Buffer>();

  constructor(private readonly transcoder: AudioTranscoderService) {}

  async forClient(audio: DeliverableAudio, accept: string | undefined): Promise<DeliverableAudio> {
    if (audio.contentType !== MP3_MIME || acceptsMp3(accept)) return audio;

    const cached = this.wavCopies.get(audio.data);
    if (cached) return { data: cached, contentType: WAV_MIME };

    try {
      const wav = await this.transcoder.mp3ToWav(audio.data);
      this.wavCopies.set(audio.data, wav);
      return { data: wav, contentType: WAV_MIME };
    } catch (error) {
      // MP3 is still playable by most players; sending it beats failing the request outright.
      this.logger.warn(`TtsAudioDeliveryService: WAV fallback unavailable (${error instanceof Error ? error.message : 'unknown'}); sending MP3`);
      return audio;
    }
  }

  async send(res: Response, audio: DeliverableAudio, accept: string | undefined): Promise<void> {
    const delivered = await this.forClient(audio, accept);
    res.status(HttpStatus.OK).set('Content-Type', delivered.contentType).set('Vary', 'Accept').send(delivered.data);
  }
}

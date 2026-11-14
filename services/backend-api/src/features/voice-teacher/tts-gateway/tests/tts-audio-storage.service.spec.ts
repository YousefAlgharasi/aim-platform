import { TtsAudioStorageService } from '../tts-audio-storage.service';
import { TtsAudioStorageInput } from '../tts-audio-storage.types';

describe('TtsAudioStorageService', () => {
  let service: TtsAudioStorageService;

  const validInput: TtsAudioStorageInput = {
    audioRef: 'tts_abc123_xyz',
    audioData: Buffer.from('fake-audio-data'),
    contentType: 'audio/mpeg',
    durationMs: 1500,
    sessionId: 'session-1',
    studentId: 'student-1',
  };

  beforeEach(() => {
    service = new TtsAudioStorageService();
  });

  it('should store audio successfully', async () => {
    const result = await service.storeAudio(validInput);
    expect(result.stored).toBe(true);
    expect(result.audioRef).toBe('tts_abc123_xyz');
  });

  it('should reject empty audioData', async () => {
    const result = await service.storeAudio({
      ...validInput,
      audioData: Buffer.alloc(0),
    });
    expect(result.stored).toBe(false);
    expect(result.errorCategory).toBe('TTS_AUDIO_STORAGE_FAILED');
  });

  it('should reject invalid content type', async () => {
    const result = await service.storeAudio({
      ...validInput,
      contentType: 'text/html',
    });
    expect(result.stored).toBe(false);
  });

  it('should retrieve stored audio for the correct student', async () => {
    await service.storeAudio(validInput);
    const retrieved = await service.retrieveAudio('tts_abc123_xyz', 'student-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.contentType).toBe('audio/mpeg');
  });

  it('should deny retrieval for wrong student (ownership check)', async () => {
    await service.storeAudio(validInput);
    const retrieved = await service.retrieveAudio('tts_abc123_xyz', 'student-other');
    expect(retrieved).toBeNull();
  });

  it('should return null for non-existent audioRef', async () => {
    const retrieved = await service.retrieveAudio('nonexistent', 'student-1');
    expect(retrieved).toBeNull();
  });

  it('should reject missing audioRef', async () => {
    const result = await service.storeAudio({
      ...validInput,
      audioRef: '',
    });
    expect(result.stored).toBe(false);
  });

  it('forgets a clip once it is older than its time to live', async () => {
    const now = jest.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    await service.storeAudio(validInput);
    now.mockReturnValue(1_000_000 + 31 * 60 * 1000);
    expect(await service.retrieveAudio('tts_abc123_xyz', 'student-1')).toBeNull();
    now.mockRestore();
  });

  it('keeps memory bounded: the oldest clips are dropped past the capacity', async () => {
    for (let i = 0; i < 305; i += 1) {
      await service.storeAudio({ ...validInput, audioRef: `tts_${i}` });
    }
    expect(await service.retrieveAudio('tts_0', 'student-1')).toBeNull();
    expect(await service.retrieveAudio('tts_304', 'student-1')).not.toBeNull();
  });
});

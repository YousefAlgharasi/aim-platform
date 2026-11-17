import { getAdminToken } from '../../../core/api/admin-token';
import { AdminApiClientError } from '../../../core/api';
import {
  fetchAdminVoiceSettings,
  updateAdminVoiceSettings,
  type AdminVoiceSettings,
} from '../../../core/api/admin-voice-api';
import { VoiceLanguagesForm } from '../../../features/voice-languages/voice-languages-form';
import { AdminApiErrorState } from '../../../shared/components/error-handling';

export default async function AdminVoiceLanguagesPage() {
  const token = await getAdminToken();
  let settings: AdminVoiceSettings | null = null;
  let error: string | null = null;
  try {
    settings = await fetchAdminVoiceSettings(token);
  } catch (e) {
    error = e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to load voice settings.';
  }

  async function save(body: Omit<AdminVoiceSettings, 'updatedAt'>): Promise<{ error?: string; settings?: AdminVoiceSettings }> {
    'use server';
    const t = await getAdminToken();
    try {
      return { settings: await updateAdminVoiceSettings(t, body) };
    } catch (e) {
      return { error: e instanceof AdminApiClientError ? `Backend error ${e.status}: ${e.message}` : 'Failed to save.' };
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 style={{ margin: 0 }}>Voice Languages</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.7 }}>Control which languages speech recognition (STT) and the teacher&apos;s voice (TTS) can use.</p>
      </div>
      {error && <AdminApiErrorState message={error} />}
      {settings && <VoiceLanguagesForm initial={settings} onSave={save} />}
    </section>
  );
}

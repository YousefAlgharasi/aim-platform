'use client';

import { useState, useTransition } from 'react';
import type { AdminVoiceSettings, VoiceLang } from '../../core/api/admin-voice-api';

type Props = {
  readonly initial: AdminVoiceSettings;
  readonly onSave: (s: Omit<AdminVoiceSettings, 'updatedAt'>) => Promise<{ error?: string; settings?: AdminVoiceSettings }>;
};

const NAMES: Record<VoiceLang, string> = { ar: 'Arabic (العربية)', en: 'English' };
const box = { border: '1px solid var(--border-default, #2a3142)', borderRadius: 10, padding: 16 } as const;

export function VoiceLanguagesForm({ initial, onSave }: Props) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function toggle(l: VoiceLang) {
    const has = s.allowedLanguages.includes(l);
    const next = has ? s.allowedLanguages.filter((x) => x !== l) : [...s.allowedLanguages, l];
    if (next.length === 0) return; // at least one language must stay on
    setS({
      ...s,
      allowedLanguages: next,
      sttDefaultLanguage: next.includes(s.sttDefaultLanguage) ? s.sttDefaultLanguage : next[0],
      ttsDefaultLanguage: next.includes(s.ttsDefaultLanguage) ? s.ttsDefaultLanguage : next[0],
    });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const r = await onSave({
        allowedLanguages: s.allowedLanguages,
        sttDefaultLanguage: s.sttDefaultLanguage,
        sttMode: s.sttMode,
        ttsDefaultLanguage: s.ttsDefaultLanguage,
        ttsArModel: s.ttsArModel,
        ttsArVoice: s.ttsArVoice,
      });
      if (r.error) setMsg({ ok: false, text: r.error });
      else {
        if (r.settings) setS(r.settings);
        setMsg({ ok: true, text: 'Saved. Applies to new voice requests within ~15 seconds.' });
      }
    });
  }

  const langSelect = (value: VoiceLang, onChange: (l: VoiceLang) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value as VoiceLang)} style={{ padding: 6 }}>
      {s.allowedLanguages.map((l) => <option key={l} value={l}>{NAMES[l]}</option>)}
    </select>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <section style={box}>
        <h3 style={{ margin: 0 }}>Allowed speech languages</h3>
        <p style={{ margin: '4px 0 12px', opacity: 0.7, fontSize: 14 }}>
          Speech recognition (STT) and the voice teacher (TTS) will only use the languages ticked here. Only Arabic and English can be enabled.
        </p>
        {(['ar', 'en'] as VoiceLang[]).map((l) => (
          <label key={l} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <input type="checkbox" checked={s.allowedLanguages.includes(l)} onChange={() => toggle(l)} />
            {NAMES[l]}
          </label>
        ))}
      </section>

      <section style={box}>
        <h3 style={{ margin: 0 }}>Speech-to-text (what the student says)</h3>
        <label style={{ display: 'block', margin: '12px 0 6px' }}>
          Mode:{' '}
          <select value={s.sttMode} onChange={(e) => setS({ ...s, sttMode: e.target.value as 'auto' | 'fixed' })} style={{ padding: 6 }}>
            <option value="auto">Auto-detect (Arabic or English only)</option>
            <option value="fixed">Always use the default language</option>
          </select>
        </label>
        <p style={{ margin: '0 0 10px', opacity: 0.7, fontSize: 14 }}>
          Auto-detect lets learners speak either language; if anything else is detected it is re-transcribed in the default language. Fixed is the most accurate when you know learners always speak one language.
        </p>
        <label>Default language: {langSelect(s.sttDefaultLanguage, (l) => setS({ ...s, sttDefaultLanguage: l }))}</label>
      </section>

      <section style={box}>
        <h3 style={{ margin: 0 }}>Text-to-speech (the teacher&apos;s voice)</h3>
        <label style={{ display: 'block', margin: '12px 0 10px' }}>
          Default language: {langSelect(s.ttsDefaultLanguage, (l) => setS({ ...s, ttsDefaultLanguage: l }))}
        </label>
        <p style={{ margin: '0 0 8px', opacity: 0.7, fontSize: 14 }}>
          English uses the server&apos;s configured voice. For Arabic speech, set an Arabic-capable model and voice (leave empty to use the English voice).
        </p>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Arabic model:{' '}
          <input value={s.ttsArModel ?? ''} onChange={(e) => setS({ ...s, ttsArModel: e.target.value })} placeholder="e.g. canopylabs/orpheus-arabic-saudi" style={{ padding: 6, width: 340 }} />
        </label>
        <label>
          Arabic voice:{' '}
          <input value={s.ttsArVoice ?? ''} onChange={(e) => setS({ ...s, ttsArVoice: e.target.value })} placeholder="e.g. lulwa" style={{ padding: 6, width: 200 }} />
        </label>
      </section>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="button" onClick={save} disabled={pending} style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        {msg && <span role="status" style={{ color: msg.ok ? 'var(--success, #3ecf8e)' : 'var(--danger, #ff6b6b)' }}>{msg.text}</span>}
        {initial.updatedAt && <span style={{ opacity: 0.6, fontSize: 13 }}>Last saved: {new Date(initial.updatedAt).toLocaleString()}</span>}
      </div>
    </div>
  );
}

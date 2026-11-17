import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { FilterPills } from '../../components/common/FilterPills';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { CheckIcon } from '../../components/common/Icons';
import { voiceApi, voiceLabel, type VoiceGender, type VoiceLang, type VoiceLanguage, type VoiceOption } from './voiceApi';

type GenderFilter = 'all' | VoiceGender;

/** Route: /settings/voice — the student picks the AI Teacher's voice (English and Arabic, male or female). */
export function VoicePage() {
  const { t, locale } = useI18n();
  const arabicUi = locale === 'ar';
  const [languages, setLanguages] = useState<VoiceLanguage[] | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [filters, setFilters] = useState<Record<string, GenderFilter>>({});

  const load = useCallback(() => {
    setError('');
    voiceApi.get().then((r) => setLanguages(r.languages)).catch((e) => setError(getErrorMessage(e, t('Could not load your voice settings.'))));
  }, [t]);
  useEffect(() => { load(); }, [load]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setPlaying(null);
  }, []);
  useEffect(() => stop, [stop]);

  async function play(lang: VoiceLang, v: VoiceOption) {
    const key = `${lang}:${v.id}`;
    if (playing === key) { stop(); return; }
    stop();
    setLoadingSample(key);
    setStatus(null);
    try {
      const blob = await voiceApi.preview(lang, v.id);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => stop();
      setPlaying(key);
      await audio.play();
    } catch (e) {
      stop();
      setStatus({ variant: 'error', message: getErrorMessage(e, t('Could not play this sample. Try again.')) });
    } finally {
      setLoadingSample(null);
    }
  }

  async function choose(lang: VoiceLang, id: string | null) {
    setSaving(`${lang}:${id ?? 'default'}`);
    setStatus(null);
    try {
      await voiceApi.save({ [lang]: id });
      setLanguages((cur) => cur && cur.map((l) => (l.code === lang ? { ...l, selected: id } : l)));
      setStatus({ variant: 'success', message: t('Voice saved. Your teacher will use it from the next reply.') });
    } catch (e) {
      setStatus({ variant: 'error', message: getErrorMessage(e, t('Could not save your voice. Try again.')) });
    } finally {
      setSaving(null);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!languages) return <DetailSkeleton />;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <PageTitleBar title={t('Teacher voice')} fallback="/settings" />
      <p className="m-0 text-base text-ink-muted">{t('Choose how your AI Teacher sounds. Listen to a sample, then pick the voice you like. Choose a man or a woman, in English and in Arabic.')}</p>
      {status && <Banner variant={status.variant}>{status.message}</Banner>}

      {languages.map((lang) => {
        const filter = filters[lang.code] ?? 'all';
        const shown = lang.voices.filter((v) => filter === 'all' || v.gender === filter);
        return (
          <section key={lang.code} className="flex flex-col gap-3" aria-label={lang.code === 'en' ? t('English voice') : t('Arabic voice')}>
            <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{lang.code === 'en' ? t('English voice') : t('Arabic voice')}</h2>
            {!lang.available ? (
              <Banner variant="info">{t('The Arabic voice is not available yet.')}</Banner>
            ) : (
              <>
                <FilterPills<GenderFilter>
                  label={t('Filter voices')}
                  value={filter}
                  onChange={(k) => setFilters((f) => ({ ...f, [lang.code]: k }))}
                  options={[{ key: 'all', label: t('All') }, { key: 'female', label: t('Woman') }, { key: 'male', label: t('Man') }] as const}
                />
                <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
                  {shown.map((v) => {
                    const key = `${lang.code}:${v.id}`;
                    const selected = lang.selected === v.id;
                    return (
                      <li key={v.id}>
                        <Card className={selected ? '!ring-2 !ring-brand' : ''}>
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-base font-semibold text-ink">{voiceLabel(v, arabicUi)}</p>
                              <p className="m-0 text-sm text-ink-muted">{v.gender === 'female' ? t('Woman') : t('Man')}</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => void play(lang.code, v)} loading={loadingSample === key} aria-label={t('Listen to {name}', { name: voiceLabel(v, arabicUi) })}>
                              {playing === key ? t('Stop') : t('Listen')}
                            </Button>
                            <Button size="sm" variant={selected ? 'primary' : 'secondary'} onClick={() => void choose(lang.code, v.id)} disabled={selected || saving !== null} aria-pressed={selected}>
                              {selected ? <span className="inline-flex items-center gap-1.5"><CheckIcon className="size-3.5" />{t('Selected')}</span> : t('Choose')}
                            </Button>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
                {lang.selected && (
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => void choose(lang.code, null)} disabled={saving !== null}>{t('Use the default voice')}</Button>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

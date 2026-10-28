// Admin mobile app versions UI.
// One card per platform: minimum supported version (older apps are blocked
// with an "Update required" screen), latest version (older apps see an
// "Update available" banner), and the store link the update button opens.
// Backend is the final authority for the version policy.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../core/api/client-api-helpers';

import {
  OperationsLoadingSpinner,
  OperationsErrorCard,
} from '../../../../shared/components/operations';

type AppPlatform = 'android' | 'ios';

type AppVersionPolicy = {
  readonly platform: AppPlatform;
  readonly minSupportedVersion: string;
  readonly latestVersion: string;
  readonly storeUrl: string | null;
};

type PolicyDraft = {
  minSupportedVersion: string;
  latestVersion: string;
  storeUrl: string;
};

const PLATFORM_LABELS: Record<AppPlatform, string> = {
  android: 'Android',
  ios: 'iOS',
};

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

function toDraft(policy: AppVersionPolicy): PolicyDraft {
  return {
    minSupportedVersion: policy.minSupportedVersion,
    latestVersion: policy.latestVersion,
    storeUrl: policy.storeUrl ?? '',
  };
}

function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function validateDraft(draft: PolicyDraft): string | null {
  if (!VERSION_PATTERN.test(draft.minSupportedVersion) || !VERSION_PATTERN.test(draft.latestVersion)) {
    return 'Versions must look like 1.2.3.';
  }
  if (compareVersions(draft.minSupportedVersion, draft.latestVersion) > 0) {
    return 'Minimum supported version cannot be higher than the latest version.';
  }
  if (draft.storeUrl.trim() && !draft.storeUrl.trim().startsWith('https://')) {
    return 'Store link must start with https://';
  }
  return null;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    const message = json?.error?.message ?? json?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
  } catch {
    // Non-JSON error body.
  }
  return `${fallback} (${res.status})`;
}

export default function AppVersionsPage() {
  const [policies, setPolicies] = useState<readonly AppVersionPolicy[]>([]);
  const [drafts, setDrafts] = useState<Partial<Record<AppPlatform, PolicyDraft>>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<AppPlatform | null>(null);
  const [errors, setErrors] = useState<Partial<Record<AppPlatform, string>>>({});
  const [saved, setSaved] = useState<AppPlatform | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await backendFetch('/admin/app-versions');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: AppVersionPolicy[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setPolicies(items);
      setDrafts(Object.fromEntries(items.map((p) => [p.platform, toDraft(p)])));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load app versions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  function updateDraft(platform: AppPlatform, field: keyof PolicyDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [platform]: { ...(prev[platform] as PolicyDraft), [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [platform]: undefined }));
    setSaved(null);
  }

  async function handleSave(e: React.FormEvent, platform: AppPlatform) {
    e.preventDefault();
    const draft = drafts[platform];
    if (!draft) return;

    const validationError = validateDraft(draft);
    if (validationError) {
      setErrors((prev) => ({ ...prev, [platform]: validationError }));
      return;
    }

    setSaving(platform);
    setSaved(null);
    try {
      const res = await backendFetch(`/admin/app-versions/${platform}`, {
        method: 'PATCH',
        body: JSON.stringify({
          minSupportedVersion: draft.minSupportedVersion,
          latestVersion: draft.latestVersion,
          storeUrl: draft.storeUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to save'));
      const json = await res.json();
      const updated: AppVersionPolicy = json?.data ?? json;
      setPolicies((prev) => prev.map((p) => (p.platform === platform ? updated : p)));
      setDrafts((prev) => ({ ...prev, [platform]: toDraft(updated) }));
      setSaved(platform);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [platform]: err instanceof Error ? err.message : 'Failed to save app version.',
      }));
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading app versions..." />;
  }

  if (loadError) {
    return <OperationsErrorCard message={loadError} onRetry={fetchPolicies} />;
  }

  return (
    <div className="ops-versions">
      <header className="ops-versions-header">
        <p className="ops-eyebrow">Operations</p>
        <h1 className="ops-page-title">App Versions</h1>
        <p className="ops-page-meta">
          Control when mobile users are asked to update. Changes apply the next time users open the app.
        </p>
      </header>

      <div className="ops-versions-grid">
        {policies.map((policy) => {
          const platform = policy.platform;
          const draft = drafts[platform] ?? toDraft(policy);
          const isSaving = saving === platform;
          const error = errors[platform];

          return (
            <form
              key={platform}
              className="ops-version-card"
              onSubmit={(e) => handleSave(e, platform)}
              aria-label={`${PLATFORM_LABELS[platform]} app version`}
            >
              <h2 className="ops-version-card-title">{PLATFORM_LABELS[platform]}</h2>

              <div className="ops-form-field">
                <label htmlFor={`${platform}-latest`} className="ops-form-label">Latest version</label>
                <input
                  id={`${platform}-latest`}
                  className="ops-form-input ops-form-input--mono"
                  type="text"
                  inputMode="decimal"
                  value={draft.latestVersion}
                  onChange={(e) => updateDraft(platform, 'latestVersion', e.target.value)}
                  placeholder="1.2.0"
                  disabled={isSaving}
                />
                <p className="ops-form-hint">Older apps see a dismissible &quot;Update available&quot; banner.</p>
              </div>

              <div className="ops-form-field">
                <label htmlFor={`${platform}-min`} className="ops-form-label">Minimum supported version</label>
                <input
                  id={`${platform}-min`}
                  className="ops-form-input ops-form-input--mono"
                  type="text"
                  inputMode="decimal"
                  value={draft.minSupportedVersion}
                  onChange={(e) => updateDraft(platform, 'minSupportedVersion', e.target.value)}
                  placeholder="1.0.0"
                  disabled={isSaving}
                />
                <p className="ops-form-hint">Older apps are blocked until the user updates.</p>
              </div>

              <div className="ops-form-field">
                <label htmlFor={`${platform}-store`} className="ops-form-label">Store link</label>
                <input
                  id={`${platform}-store`}
                  className="ops-form-input"
                  type="url"
                  value={draft.storeUrl}
                  onChange={(e) => updateDraft(platform, 'storeUrl', e.target.value)}
                  placeholder={platform === 'android'
                    ? 'https://play.google.com/store/apps/details?id=...'
                    : 'https://apps.apple.com/app/id...'}
                  disabled={isSaving}
                />
              </div>

              {error && <div className="ops-inline-error" role="alert">{error}</div>}
              {saved === platform && !error && (
                <div className="ops-inline-success" role="status">Saved.</div>
              )}

              <div className="ops-version-card-actions">
                <button className="ops-submit-btn" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          );
        })}
      </div>

      <style>{`
        .ops-versions { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-versions-header { display: flex; flex-direction: column; gap: var(--space-4); }

        .ops-eyebrow {
          margin: 0; font-size: 12px; font-weight: var(--weight-semibold);
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
        }
        .ops-page-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }
        .ops-page-meta { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .ops-versions-grid {
          display: grid; gap: var(--space-16);
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .ops-version-card {
          padding: var(--space-20); border: 1px solid var(--border);
          border-radius: var(--radius-lg); background: var(--surface);
          display: flex; flex-direction: column; gap: var(--space-16);
        }
        .ops-version-card-title { margin: 0; font-size: 17px; font-weight: var(--weight-semibold); color: var(--text-primary); }
        .ops-version-card-actions { display: flex; gap: var(--space-8); }

        .ops-form-field { display: flex; flex-direction: column; gap: var(--space-4); }
        .ops-form-label { font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); }
        .ops-form-hint { margin: 0; font-size: 12px; color: var(--text-muted); }
        .ops-form-input {
          height: var(--size-btn-md); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 14px; font-family: inherit;
          background: var(--surface); color: var(--text-primary);
        }
        .ops-form-input--mono { font-family: monospace; }
        .ops-form-input:focus { outline: none; box-shadow: var(--shadow-focus); }

        .ops-inline-error {
          padding: var(--space-12) var(--space-16); background: var(--error-soft);
          border: 1px solid var(--color-error-200); border-radius: var(--radius-md);
          font-size: 13px; color: var(--color-error-700);
        }
        .ops-inline-success {
          padding: var(--space-12) var(--space-16); background: var(--success-soft);
          border: 1px solid var(--color-success-200); border-radius: var(--radius-md);
          font-size: 13px; color: var(--color-success-700);
        }

        .ops-submit-btn {
          height: var(--size-btn-md); padding: 0 var(--space-20); border: none;
          border-radius: var(--radius-md); background: var(--color-primary-500);
          color: var(--text-on-primary); font-size: 14px; font-weight: var(--weight-semibold);
          font-family: inherit; cursor: pointer;
        }
        .ops-submit-btn:hover:not(:disabled) { background: var(--color-primary-600); }
        .ops-submit-btn:disabled { background: var(--disabled-bg); color: var(--disabled-fg); cursor: not-allowed; }
        .ops-submit-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </div>
  );
}

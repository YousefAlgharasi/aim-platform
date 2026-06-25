'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { backendFetch } from '../../../lib/api/client-api-helpers';

type PlatformInfo = {
  appName: string;
  environment: string;
  backendUrl: string;
  version: string;
};

type SettingsSection = 'general' | 'security' | 'notifications' | 'system';

function SvgIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  cog: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  server: 'M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  key: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
  db: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
  globe: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
};

function SettingRow({ label, value, description, type = 'text' }: {
  label: string; value: string; description?: string; type?: 'text' | 'badge-ok' | 'badge-warn' | 'mono';
}) {
  return (
    <div className="sett-row">
      <div className="sett-row-left">
        <span className="sett-row-label">{label}</span>
        {description && <span className="sett-row-desc">{description}</span>}
      </div>
      <div className="sett-row-right">
        {type === 'badge-ok' && <span className="sett-badge sett-badge--ok">{value}</span>}
        {type === 'badge-warn' && <span className="sett-badge sett-badge--warn">{value}</span>}
        {type === 'mono' && <code className="sett-mono">{value}</code>}
        {type === 'text' && <span className="sett-value">{value}</span>}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onToggle }: {
  label: string; description?: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="sett-row sett-row--toggle">
      <div className="sett-row-left">
        <span className="sett-row-label">{label}</span>
        {description && <span className="sett-row-desc">{description}</span>}
      </div>
      <button type="button" className={`sett-toggle ${enabled ? 'sett-toggle--on' : ''}`} onClick={onToggle} aria-label={`Toggle ${label}`}>
        <span className="sett-toggle-knob" />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [section, setSection] = useState<SettingsSection>('general');
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    appName: 'AIM Platform',
    environment: process.env.NODE_ENV || 'production',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:3000',
    version: '1.0.0',
  });
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Notification prefs (local UI state for demo)
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    systemNotifications: true,
    weeklyDigest: false,
    incidentAlerts: true,
    newUserAlerts: true,
    billingAlerts: true,
  });

  // Security settings (local UI state)
  const [securityPrefs, setSecurityPrefs] = useState({
    enforceRoleGuard: true,
    auditLogging: true,
    rateLimiting: true,
  });

  const checkHealth = useCallback(async () => {
    try {
      const res = await backendFetch('/admin/stats');
      setDbStatus(res.ok ? 'connected' : 'error');
    } catch {
      setDbStatus('error');
    }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);

  const tabs: { key: SettingsSection; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: ICONS.cog },
    { key: 'security', label: 'Security', icon: ICONS.shield },
    { key: 'notifications', label: 'Notifications', icon: ICONS.bell },
    { key: 'system', label: 'System', icon: ICONS.server },
  ];

  return (
    <div className="sett-page">
      <header className="sett-header">
        <h1 className="sett-title">Settings</h1>
        <p className="sett-subtitle">Platform configuration and system preferences</p>
      </header>

      {/* Tabs */}
      <div className="sett-tabs">
        {tabs.map(tab => (
          <button key={tab.key} type="button"
            className={`sett-tab ${section === tab.key ? 'sett-tab--active' : ''}`}
            onClick={() => setSection(tab.key)}>
            <SvgIcon d={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {section === 'general' && (
        <div className="sett-content">
          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.globe} />
              <h2>Platform Information</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Application Name" value={platformInfo.appName} />
              <SettingRow label="Environment" value={platformInfo.environment} type={platformInfo.environment === 'production' ? 'badge-ok' : 'badge-warn'} />
              <SettingRow label="Version" value={platformInfo.version} type="mono" />
              <SettingRow label="Backend URL" value={platformInfo.backendUrl} type="mono" description="API base URL used by the admin dashboard" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.db} />
              <h2>Database</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Provider" value="PostgreSQL (Supabase)" />
              <div className="sett-row">
                <div className="sett-row-left">
                  <span className="sett-row-label">Connection Status</span>
                </div>
                <div className="sett-row-right">
                  {dbStatus === 'checking' && <span className="sett-badge sett-badge--neutral">Checking...</span>}
                  {dbStatus === 'connected' && <span className="sett-badge sett-badge--ok">Connected</span>}
                  {dbStatus === 'error' && <span className="sett-badge sett-badge--error">Unreachable</span>}
                </div>
              </div>
              <SettingRow label="Auth Provider" value="Supabase JWT" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.info} />
              <h2>Frontend Configuration</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Framework" value="Next.js 16" />
              <SettingRow label="Runtime" value="Edge / Node.js" />
              <SettingRow label="Auth Cookie" value="aim_admin_access_token" type="mono" description="HTTP-only cookie used for session management" />
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {section === 'security' && (
        <div className="sett-content">
          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.shield} />
              <h2>Authentication & Authorization</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Auth Method" value="Supabase JWT + Backend Verification" />
              <SettingRow label="Token Type" value="Bearer (access_token)" type="mono" />
              <SettingRow label="Guard Chain" value="SupabaseJwtAuthGuard + RoleGuard" type="mono" description="Every admin endpoint requires both JWT validation and role verification" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.key} />
              <h2>Security Controls</h2>
            </div>
            <div className="sett-card-body">
              <ToggleRow label="Role-Based Access Control" description="Enforce backend role guard on all admin endpoints" enabled={securityPrefs.enforceRoleGuard} onToggle={() => setSecurityPrefs(p => ({ ...p, enforceRoleGuard: !p.enforceRoleGuard }))} />
              <ToggleRow label="Audit Logging" description="Log all admin actions for compliance tracking" enabled={securityPrefs.auditLogging} onToggle={() => setSecurityPrefs(p => ({ ...p, auditLogging: !p.auditLogging }))} />
              <ToggleRow label="API Rate Limiting" description="Protect endpoints from excessive requests" enabled={securityPrefs.rateLimiting} onToggle={() => setSecurityPrefs(p => ({ ...p, rateLimiting: !p.rateLimiting }))} />
            </div>
          </div>

          <div className="sett-info-banner">
            <SvgIcon d={ICONS.shield} size={16} />
            <p>Security settings are enforced by the backend. Toggles here reflect the current configuration state. Changes require backend redeployment.</p>
          </div>
        </div>
      )}

      {/* Notifications */}
      {section === 'notifications' && (
        <div className="sett-content">
          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.bell} />
              <h2>Admin Notification Preferences</h2>
            </div>
            <div className="sett-card-body">
              <ToggleRow label="Email Alerts" description="Receive email notifications for critical events" enabled={notifPrefs.emailAlerts} onToggle={() => setNotifPrefs(p => ({ ...p, emailAlerts: !p.emailAlerts }))} />
              <ToggleRow label="System Notifications" description="In-app notifications for platform events" enabled={notifPrefs.systemNotifications} onToggle={() => setNotifPrefs(p => ({ ...p, systemNotifications: !p.systemNotifications }))} />
              <ToggleRow label="Weekly Digest" description="Weekly summary of platform activity and metrics" enabled={notifPrefs.weeklyDigest} onToggle={() => setNotifPrefs(p => ({ ...p, weeklyDigest: !p.weeklyDigest }))} />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.bell} />
              <h2>Alert Triggers</h2>
            </div>
            <div className="sett-card-body">
              <ToggleRow label="Incident Alerts" description="Notify when new incidents are created or escalated" enabled={notifPrefs.incidentAlerts} onToggle={() => setNotifPrefs(p => ({ ...p, incidentAlerts: !p.incidentAlerts }))} />
              <ToggleRow label="New User Registration" description="Alert when new users sign up on the platform" enabled={notifPrefs.newUserAlerts} onToggle={() => setNotifPrefs(p => ({ ...p, newUserAlerts: !p.newUserAlerts }))} />
              <ToggleRow label="Billing Events" description="Notify for failed payments, overdue invoices, and subscription changes" enabled={notifPrefs.billingAlerts} onToggle={() => setNotifPrefs(p => ({ ...p, billingAlerts: !p.billingAlerts }))} />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.info} />
              <h2>Notification Channels</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="In-App" value="Enabled" type="badge-ok" description="Real-time notifications within the admin dashboard" />
              <SettingRow label="Email" value="Enabled" type="badge-ok" description="Delivered via configured email provider" />
              <SettingRow label="Push" value="Configured" type="badge-ok" description="Push notifications to registered devices" />
            </div>
          </div>
        </div>
      )}

      {/* System */}
      {section === 'system' && (
        <div className="sett-content">
          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.server} />
              <h2>System Health</h2>
            </div>
            <div className="sett-card-body">
              <div className="sett-row">
                <div className="sett-row-left">
                  <span className="sett-row-label">Backend API</span>
                </div>
                <div className="sett-row-right">
                  {dbStatus === 'connected' ? (
                    <span className="sett-badge sett-badge--ok">Operational</span>
                  ) : dbStatus === 'error' ? (
                    <span className="sett-badge sett-badge--error">Down</span>
                  ) : (
                    <span className="sett-badge sett-badge--neutral">Checking</span>
                  )}
                </div>
              </div>
              <SettingRow label="Database" value={dbStatus === 'connected' ? 'Operational' : dbStatus === 'error' ? 'Unreachable' : 'Checking...'} type={dbStatus === 'connected' ? 'badge-ok' : dbStatus === 'error' ? 'badge-warn' : 'text'} />
              <SettingRow label="Auth Service" value="Supabase (External)" type="badge-ok" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.db} />
              <h2>Data & Storage</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Primary Database" value="PostgreSQL via Supabase" />
              <SettingRow label="File Storage" value="Supabase Storage" />
              <SettingRow label="Cache" value="Not configured" type="badge-warn" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.cog} />
              <h2>Backend Stack</h2>
            </div>
            <div className="sett-card-body">
              <SettingRow label="Framework" value="NestJS" />
              <SettingRow label="ORM" value="Raw SQL (node-postgres)" />
              <SettingRow label="Validation" value="class-validator + ValidationPipe" />
              <SettingRow label="API Style" value="REST with envelope responses" />
              <SettingRow label="Global Interceptor" value="ApiResponseInterceptor" type="mono" />
            </div>
          </div>

          <div className="sett-card">
            <div className="sett-card-header">
              <SvgIcon d={ICONS.check} />
              <h2>Maintenance</h2>
            </div>
            <div className="sett-card-body">
              <button type="button" className="sett-action-btn" onClick={() => { setDbStatus('checking'); checkHealth(); }}>
                <SvgIcon d={ICONS.server} size={16} />
                Re-check System Health
              </button>
              <button type="button" className="sett-action-btn sett-action-btn--secondary" onClick={() => { if (typeof window !== 'undefined') { window.location.reload(); } }}>
                <SvgIcon d={ICONS.cog} size={16} />
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sett-page { display: flex; flex-direction: column; gap: 24px; }
        .sett-header {}
        .sett-title { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-primary, #111); letter-spacing: -0.02em; }
        .sett-subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-muted, #999); }

        /* Tabs */
        .sett-tabs {
          display: flex; gap: 4px; padding: 4px;
          background: var(--surface-sunken, #f5f5f5); border-radius: 10px;
          overflow-x: auto;
        }
        .sett-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: none; border-radius: 8px;
          background: transparent; font-size: 13px; font-weight: 600;
          color: var(--text-secondary, #666); cursor: pointer;
          font-family: inherit; white-space: nowrap;
          transition: all 0.15s ease;
        }
        .sett-tab:hover { color: var(--text-primary); }
        .sett-tab--active {
          background: var(--surface, #fff);
          color: var(--text-primary, #111);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* Content */
        .sett-content { display: flex; flex-direction: column; gap: 16px; }

        /* Cards */
        .sett-card {
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 14px; background: var(--surface, #fff);
          overflow: hidden;
        }
        .sett-card-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #e5e5e5);
          color: var(--text-secondary, #555);
        }
        .sett-card-header h2 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary, #111); }
        .sett-card-body { display: flex; flex-direction: column; }

        /* Setting rows */
        .sett-row {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--divider, #f0f0f0);
        }
        .sett-row:last-child { border-bottom: none; }
        .sett-row-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .sett-row-label { font-size: 14px; font-weight: 500; color: var(--text-primary, #111); }
        .sett-row-desc { font-size: 12px; color: var(--text-muted, #999); }
        .sett-row-right { flex-shrink: 0; }
        .sett-value { font-size: 14px; color: var(--text-secondary, #666); }
        .sett-mono { font-size: 12px; font-family: monospace; padding: 3px 8px; border-radius: 5px; background: var(--surface-sunken, #f5f5f5); color: var(--text-primary, #111); }

        /* Badges */
        .sett-badge {
          font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .sett-badge--ok { background: #dcfce7; color: #166534; }
        .sett-badge--warn { background: #fef3c7; color: #92400e; }
        .sett-badge--error { background: #fee2e2; color: #991b1b; }
        .sett-badge--neutral { background: #f1f5f9; color: #475569; }

        /* Toggle */
        .sett-toggle {
          position: relative; width: 44px; height: 24px;
          border: none; border-radius: 12px; cursor: pointer;
          background: var(--color-neutral-300, #d1d5db);
          transition: background 0.2s ease;
          padding: 0;
        }
        .sett-toggle--on { background: var(--color-primary-500, #6366f1); }
        .sett-toggle-knob {
          position: absolute; top: 2px; left: 2px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }
        .sett-toggle--on .sett-toggle-knob { transform: translateX(20px); }

        /* Action buttons */
        .sett-action-btn {
          display: flex; align-items: center; gap: 8px;
          margin: 4px 20px; padding: 10px 16px;
          border: 1px solid var(--color-primary-200, #c7d2fe);
          border-radius: 8px; background: var(--color-primary-50, #eef2ff);
          color: var(--color-primary-700, #4338ca);
          font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s ease;
        }
        .sett-action-btn:first-child { margin-top: 8px; }
        .sett-action-btn:last-child { margin-bottom: 12px; }
        .sett-action-btn:hover { background: var(--color-primary-100, #e0e7ff); }
        .sett-action-btn--secondary {
          border-color: var(--border, #e5e5e5);
          background: var(--surface, #fff);
          color: var(--text-secondary, #666);
        }
        .sett-action-btn--secondary:hover { background: var(--state-hover, #f5f5f5); }

        /* Info banner */
        .sett-info-banner {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px 18px; border-radius: 10px;
          background: var(--color-primary-50, #eef2ff);
          border: 1px solid var(--color-primary-100, #e0e7ff);
          color: var(--color-primary-700, #4338ca);
        }
        .sett-info-banner svg { flex-shrink: 0; margin-top: 1px; }
        .sett-info-banner p { margin: 0; font-size: 13px; line-height: 1.5; }

        @media (max-width: 600px) {
          .sett-tabs { gap: 2px; }
          .sett-tab { padding: 6px 12px; font-size: 12px; }
          .sett-title { font-size: 20px; }
          .sett-row { flex-direction: column; align-items: flex-start; gap: 6px; }
        }
      `}</style>
    </div>
  );
}

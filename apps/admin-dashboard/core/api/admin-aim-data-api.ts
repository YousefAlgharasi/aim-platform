// P11-010: Admin skill states, weaknesses, and recommendations API clients (read-only)
// Mastery, weakness, and recommendations are backend/AIM-Engine outputs.
// UI displays only — never computes these values.
import { adminApiClient } from './admin-api-client';

/* ---- Skill States ---- */

export type AdminSkillStateItem = {
  readonly skillId: string;
  readonly skillKey: string;
  readonly masteryLevel: number;   // backend-computed — never recalculated here
  readonly state: string;          // backend-computed — never recalculated here
  readonly lastUpdatedAt: string;
};

function decodeSkillState(v: unknown): AdminSkillStateItem {
  const o = v as Record<string, unknown>;
  return {
    skillId:       String(o.skillId ?? ''),
    skillKey:      String(o.skillKey ?? ''),
    masteryLevel:  typeof o.masteryLevel === 'number' ? o.masteryLevel : 0,
    state:         String(o.state ?? 'not_started'),
    lastUpdatedAt: String(o.lastUpdatedAt ?? ''),
  };
}

export async function fetchAdminStudentSkillStates(
  token: string,
  studentId: string,
): Promise<AdminSkillStateItem[]> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/skill-states`,
    (v) => {
      const o = v as Record<string, unknown>;
      return Array.isArray(o.data) ? o.data.map(decodeSkillState) : [];
    },
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

/* ---- Weaknesses ---- */

export type AdminWeaknessItem = {
  readonly skillId: string;
  readonly skillKey: string;
  readonly severity: string;   // backend-computed — never recalculated here
  readonly detectedAt: string;
};

function decodeWeakness(v: unknown): AdminWeaknessItem {
  const o = v as Record<string, unknown>;
  return {
    skillId:    String(o.skillId ?? ''),
    skillKey:   String(o.skillKey ?? ''),
    severity:   String(o.severity ?? 'low'),
    detectedAt: String(o.detectedAt ?? ''),
  };
}

export async function fetchAdminStudentWeaknesses(
  token: string,
  studentId: string,
): Promise<AdminWeaknessItem[]> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/weaknesses`,
    (v) => {
      const o = v as Record<string, unknown>;
      return Array.isArray(o.data) ? o.data.map(decodeWeakness) : [];
    },
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

/* ---- Recommendations ---- */

export type AdminRecommendationItem = {
  readonly type: string;
  readonly entityId: string;
  readonly reason: string;     // AIM Engine output — never recalculated here
  readonly generatedAt: string;
};

function decodeRecommendation(v: unknown): AdminRecommendationItem {
  const o = v as Record<string, unknown>;
  return {
    type:        String(o.type ?? ''),
    entityId:    String(o.entityId ?? ''),
    reason:      String(o.reason ?? ''),
    generatedAt: String(o.generatedAt ?? ''),
  };
}

export async function fetchAdminStudentRecommendations(
  token: string,
  studentId: string,
): Promise<AdminRecommendationItem[]> {
  const envelope = await adminApiClient.get(
    `/admin/students/${studentId}/recommendations`,
    (v) => {
      const o = v as Record<string, unknown>;
      return Array.isArray(o.data) ? o.data.map(decodeRecommendation) : [];
    },
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

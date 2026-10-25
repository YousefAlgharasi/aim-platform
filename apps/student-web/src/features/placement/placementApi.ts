// Placement Test API — mirrors the Flutter PlacementRemoteDatasourceImpl and the
// backend PlacementController (services/backend-api/src/features/placement).
// All scoring / level / mastery values are backend-computed and displayed as-is.

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import type { ApiError } from '../../types';

// ---------------------------------------------------------------------------
// Types (exact backend JSON keys)
// ---------------------------------------------------------------------------

export type PlacementDecision = 'take_placement' | 'start_from_scratch';

/** GET/POST /placement/decision */
export interface PlacementGateStatus {
  should_show_gate: boolean;
  decision: PlacementDecision | null;
}

/** GET /placement/active */
export interface PlacementTest {
  id: string;
  title: string;
  status: 'published';
  total_sections: number;
  estimated_minutes: number;
}

/** GET /placement/active/sections */
export interface PlacementSection {
  id: string;
  title: string;
  skill_code: string;
  order_index: number;
  total_questions: number;
}

/** GET /placement/questions?sectionId= */
export interface PlacementQuestion {
  id: string;
  section_id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  /** multiple_choice | listening_choice | true_false | fill_blank | writing | speaking | reading */
  type: string;
  media_url: string | null;
  has_listening_audio: boolean;
  ordinal: number;
}

/** POST /placement/attempts */
export interface PlacementAttemptStart {
  id: string;
  placement_test_id: string;
  status: 'active';
  started_at: string;
  submitted_at: null;
  completed_at: null;
  expires_at: string;
  duration_seconds: number;
}

/** POST /placement/attempts/:id/answers */
export interface PlacementAnswer {
  id: string;
  placement_attempt_id: string;
  placement_question_id: string;
  answer_value: string;
  created_at: string;
}

/** POST /placement/attempts/:id/answers/speaking */
export interface PlacementSpeakingAnswer {
  id: string;
  placement_attempt_id: string;
  placement_question_id: string;
  transcript: string;
  created_at: string;
}

/** POST /placement/attempts/:id/complete */
export interface PlacementAttemptComplete {
  id: string;
  placement_test_id: string;
  status: 'submitted';
  started_at: string;
  submitted_at: string;
  completed_at: null;
}

/** GET /placement/attempts/:id/result */
export interface PlacementResult {
  id: string;
  placement_attempt_id: string;
  estimated_level: string;
  skill_mastery_map: Record<
    string,
    { total_questions: number; correct_answers: number; mastery_score: number; signal: string }
  >;
  weakness_map: {
    weaknesses: Array<{ skill_code: string; mastery_score: number; priority: number; signal: string }>;
  };
  initial_path_id: string | null;
  created_at: string;
  recommended_course_id: string | null;
  unlocked_course_ids: string[];
  note: string | null;
  additional_signals?: {
    writing: { score: number; feedback: string } | null;
    speaking: { score: number; feedback: string; transcript: string } | null;
  };
}

/** GET /placement/attempts/latest */
export interface PlacementLatestStatus {
  status: 'none' | 'active' | 'submitted' | 'completed';
  attemptId: string | null;
  result: PlacementResult | null;
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export function fetchPlacementGate(): Promise<PlacementGateStatus> {
  return apiClient.get<PlacementGateStatus>('/placement/decision');
}

export function setPlacementDecision(decision: PlacementDecision): Promise<PlacementGateStatus> {
  return apiClient.post<PlacementGateStatus>('/placement/decision', { decision });
}

export function fetchActivePlacementTest(): Promise<PlacementTest> {
  return apiClient.get<PlacementTest>('/placement/active');
}

export async function fetchPlacementSections(): Promise<PlacementSection[]> {
  const sections = await apiClient.get<PlacementSection[]>('/placement/active/sections');
  return [...(sections ?? [])].sort((a, b) => a.order_index - b.order_index);
}

export async function fetchPlacementQuestions(sectionId: string): Promise<PlacementQuestion[]> {
  const questions = await apiClient.get<PlacementQuestion[]>(
    `/placement/questions?sectionId=${encodeURIComponent(sectionId)}`,
  );
  return [...(questions ?? [])].sort((a, b) => a.ordinal - b.ordinal);
}

export function fetchLatestPlacementStatus(): Promise<PlacementLatestStatus> {
  return apiClient.get<PlacementLatestStatus>('/placement/attempts/latest');
}

/** Starts a new attempt. The backend abandons any existing active/submitted attempt. */
export function startPlacementAttempt(): Promise<PlacementAttemptStart> {
  return apiClient.post<PlacementAttemptStart>('/placement/attempts');
}

export function submitPlacementAnswer(
  attemptId: string,
  placementQuestionId: string,
  answerValue: string,
): Promise<PlacementAnswer> {
  return apiClient.post<PlacementAnswer>(`/placement/attempts/${attemptId}/answers`, {
    placement_question_id: placementQuestionId,
    answer_value: answerValue,
  });
}

export const SPEAKING_AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4'];
export const SPEAKING_MAX_BYTES = 15 * 1024 * 1024;

const AUDIO_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
};

/** Multipart upload — field `audio` + `placement_question_id` (see controller FileInterceptor('audio')). */
export function submitPlacementSpeakingAnswer(
  attemptId: string,
  placementQuestionId: string,
  audio: Blob,
): Promise<PlacementSpeakingAnswer> {
  // The backend matches the part's exact mimetype, so strip codec parameters.
  const baseType = (audio.type || 'audio/webm').split(';')[0].trim();
  const file = baseType === audio.type ? audio : new Blob([audio], { type: baseType });
  const form = new FormData();
  form.append('placement_question_id', placementQuestionId);
  form.append('audio', file, `answer.${AUDIO_EXTENSIONS[baseType] ?? 'webm'}`);
  return apiClient.postForm<PlacementSpeakingAnswer>(
    `/placement/attempts/${attemptId}/answers/speaking`,
    form,
  );
}

/** Returns null when the backend answers 204 (no listening script authored yet). */
export async function fetchPlacementQuestionAudio(questionId: string): Promise<Blob | null> {
  const blob = await apiClient.getBlob(`/placement/questions/${questionId}/audio`);
  return blob.size > 0 ? blob : null;
}

export function completePlacementAttempt(attemptId: string): Promise<PlacementAttemptComplete> {
  return apiClient.post<PlacementAttemptComplete>(`/placement/attempts/${attemptId}/complete`);
}

export function fetchPlacementResult(attemptId: string): Promise<PlacementResult> {
  return apiClient.get<PlacementResult>(`/placement/attempts/${attemptId}/result`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function errorCode(err: unknown): string | undefined {
  return (err as Partial<ApiError> | null)?.code;
}

const CEFR_CODES: Record<string, string> = {
  beginner: 'A1',
  elementary: 'A2',
  intermediate: 'B1',
  upper_intermediate: 'B2',
  advanced: 'C1',
};

export function formatPlacementLevel(level: string): { label: string; code: string | null } {
  const code = CEFR_CODES[level.toLowerCase()] ?? null;
  return { label: humanize(level), code };
}

export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Local per-attempt progress so a reload can resume where the student was.
// Only UI position + the server-issued expires_at are stored; never answers' correctness.
export interface PlacementProgress {
  expiresAt: string | null;
  sectionIndex: number;
  questionIndex: number;
  answered: number;
  skipped: number;
}

const progressKey = (attemptId: string) => `aim_placement_progress_${attemptId}`;

export function loadPlacementProgress(attemptId: string): PlacementProgress | null {
  try {
    const raw = localStorage.getItem(progressKey(attemptId));
    return raw ? (JSON.parse(raw) as PlacementProgress) : null;
  } catch {
    return null;
  }
}

export function savePlacementProgress(attemptId: string, progress: PlacementProgress) {
  try {
    localStorage.setItem(progressKey(attemptId), JSON.stringify(progress));
  } catch {
    // Storage unavailable — progress lasts for this page only.
  }
}

export function clearPlacementProgress(attemptId: string) {
  try {
    localStorage.removeItem(progressKey(attemptId));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// First-login gate hook (for the app shell / dashboard redirect)
// ---------------------------------------------------------------------------

export interface PlacementGateState {
  loading: boolean;
  /** True only when the backend says the gate should be shown. False on error (fail open). */
  shouldShowGate: boolean;
  decision: PlacementDecision | null;
  error: string | null;
  refresh: () => void;
}

/**
 * Checks GET /placement/decision. When `shouldShowGate` is true, redirect the
 * signed-in student to `/placement/gate`. Pass `enabled=false` to skip the call
 * (e.g. for non-student users).
 */
export function usePlacementGate(enabled = true): PlacementGateState {
  const [state, setState] = useState<Omit<PlacementGateState, 'refresh'>>({
    loading: enabled,
    shouldShowGate: false,
    decision: null,
    error: null,
  });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState({ loading: false, shouldShowGate: false, decision: null, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchPlacementGate()
      .then((gate) => {
        if (!cancelled) {
          setState({
            loading: false,
            shouldShowGate: !!gate?.should_show_gate,
            decision: gate?.decision ?? null,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            loading: false,
            shouldShowGate: false,
            decision: null,
            error: (err as { message?: string })?.message || 'Failed to check placement status',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  return { ...state, refresh };
}

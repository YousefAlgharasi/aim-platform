import { apiClient } from '../../api/client';
import { formatDate } from '../../i18n';

// services/backend-api/src/features/certificates/certificate.types.ts

export interface CertificateScoreSnapshotEntry {
  assessmentId: string;
  title: string;
  type: 'quiz' | 'exam' | string;
  isFinalExam?: boolean;
  score: number;
  maxScore: number;
  scorePercent: number;
  passed: boolean;
}

export interface CertificateScoreBreakdown {
  practicePoints: number;
  practiceMaxPoints: number;
  practiceAccuracyPercent?: number;
  quizPoints: number;
  quizMaxPoints: number;
  quizAveragePercent?: number;
  chapterExamPoints: number;
  chapterExamMaxPoints: number;
  chapterExamAveragePercent?: number;
  finalExamPoints: number;
  finalExamMaxPoints: number;
  finalExamPercent?: number;
  totalPoints: number;
  maxPoints: number;
  overallPercent: number;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  studentName: string | null;
  issuedAt: string;
  scoreSnapshot: CertificateScoreSnapshotEntry[];
  breakdown: CertificateScoreBreakdown | null;
  /** Out of 1000. */
  totalPoints: number | null;
  /** Out of 100. */
  overallScorePercent: number | null;
  verificationUrl?: string;
}

/** GET /certificates/my — returns a bare array (Flutter also tolerates `{certificates}`). */
export async function fetchMyCertificates(): Promise<Certificate[]> {
  const data = await apiClient.get<Certificate[] | { certificates?: Certificate[] } | null>('/certificates/my');
  if (Array.isArray(data)) return data;
  return data?.certificates ?? [];
}

export function fetchCertificate(id: string): Promise<Certificate> {
  return apiClient.get<Certificate>(`/certificates/${encodeURIComponent(id)}`);
}

/** Overall %: backend value, falling back to breakdown / totalPoints (same order as Flutter CertificateModel). */
export function overallPercent(c: Certificate): number | null {
  if (c.overallScorePercent != null) return Math.round(c.overallScorePercent);
  if (c.breakdown) return Math.round(c.breakdown.overallPercent);
  if (c.totalPoints != null) return Math.round(c.totalPoints / 10);
  return null;
}

export function totalPoints(c: Certificate): number | null {
  if (c.totalPoints != null) return Math.round(c.totalPoints);
  if (c.breakdown) return Math.round(c.breakdown.totalPoints);
  return null;
}

export function formatIssued(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : formatDate(d, { year: 'numeric', month: 'long', day: 'numeric' });
}

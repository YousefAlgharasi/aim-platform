export type LessonAssetType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'vocabulary'
  | 'exercise'
  | 'external_reference';

export const LESSON_ASSET_TYPES: readonly LessonAssetType[] = [
  'text',
  'image',
  'audio',
  'video',
  'document',
  'vocabulary',
  'exercise',
  'external_reference',
];

export type LessonAssetStatus = 'draft' | 'published' | 'archived';

export const LESSON_ASSET_STATUSES: readonly LessonAssetStatus[] = [
  'draft',
  'published',
  'archived',
];

export interface LessonAssetRow {
  id: string;
  lesson_id: string;
  type: LessonAssetType;
  title: string;
  description: string | null;
  url: string | null;
  mime_type: string | null;
  size_bytes: string | null; // bigint returned as string from pg
  duration_seconds: number | null;
  alt_text: string | null;
  thumbnail_url: string | null;
  order: number;
  status: LessonAssetStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LessonAssetSummary {
  id: string;
  lessonId: string;
  type: LessonAssetType;
  title: string;
  description: string | null;
  url: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
  altText: string | null;
  thumbnailUrl: string | null;
  order: number;
  status: LessonAssetStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonAssetListResponse {
  assets: LessonAssetSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLessonAssetInput {
  lessonId: string;
  type: LessonAssetType;
  title: string;
  description?: string | null;
  url?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
  order: number;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateLessonAssetInput {
  title?: string;
  description?: string | null;
  url?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  durationSeconds?: number | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
  order?: number;
  metadata?: Record<string, unknown> | null;
}

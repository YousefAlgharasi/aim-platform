'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminAssessments,
  fetchAdminAssessmentDetail,
  publishAdminAssessment,
  unpublishAdminAssessment,
  type AdminAssessmentListItem,
  type AdminAssessmentDetail,
  type AdminAssessmentType,
} from '../admin-assessments-api';

export type FetchAdminAssessmentsParams = {
  token?: string;
  page?: number;
  limit?: number;
  type?: AdminAssessmentType;
};

export const ASSESSMENT_QUERY_KEYS = {
  all: ['assessments'] as const,
  list: (params: FetchAdminAssessmentsParams) => [...ASSESSMENT_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...ASSESSMENT_QUERY_KEYS.all, 'detail', id] as const,
};

export function useAdminAssessmentsQuery(params: FetchAdminAssessmentsParams = {}) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.list(params),
    queryFn: () => fetchAdminAssessments(params.token ?? '', params.page ?? 1, params.limit ?? 20, params.type),
  });
}

export function useAdminAssessmentDetailQuery(tokenOrId: string, maybeId?: string) {
  const token = maybeId ? tokenOrId : '';
  const id = maybeId ?? tokenOrId;
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id),
    queryFn: () => fetchAdminAssessmentDetail(token, id),
    enabled: Boolean(id),
  });
}

export function usePublishAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (target: string | { token?: string; id: string }) => {
      const token = typeof target === 'string' ? '' : target.token ?? '';
      const id = typeof target === 'string' ? target : target.id;
      return publishAdminAssessment(token, id);
    },
    onSuccess: (_, target) => {
      const id = typeof target === 'string' ? target : target.id;
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.all });
    },
  });
}

export function useUnpublishAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (target: string | { token?: string; id: string }) => {
      const token = typeof target === 'string' ? '' : target.token ?? '';
      const id = typeof target === 'string' ? target : target.id;
      return unpublishAdminAssessment(token, id);
    },
    onSuccess: (_, target) => {
      const id = typeof target === 'string' ? target : target.id;
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.all });
    },
  });
}

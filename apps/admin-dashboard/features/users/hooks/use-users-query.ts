'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  changeAdminUserRole,
  updateAdminUserStatus,
  type FetchAdminUsersParams,
  type AdminUserListData,
  type AdminUserStatus,
} from '../admin-users-api';

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: (params: FetchAdminUsersParams) => [...USER_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.all, 'detail', id] as const,
};

export function useAdminUsersQuery(
  params: FetchAdminUsersParams = {},
  options?: Omit<UseQueryOptions<AdminUserListData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AdminUserListData>({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => fetchAdminUsers(params),
    ...options,
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, userId, roleKey, reason }: { token: string; userId: string; roleKey: string; reason?: string }) =>
      changeAdminUserRole(token, userId, roleKey, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, userId, status }: { token: string; userId: string; status: 'active' | 'disabled' }) =>
      updateAdminUserStatus(token, userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
}

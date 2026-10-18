'use client';

import { useQuery } from '@tanstack/react-query';
import type { User } from '@expense-tracker/shared';
import { apiFetch } from '@/shared/api';

export const currentUserQueryKey = ['user', 'me'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => apiFetch<User>('/auth/me'),
    // 401 не лечится повтором: apiFetch уже сбросил токен.
    retry: false,
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, LoginInput } from '@expense-tracker/shared';
import { startSession } from '@/entities/session';
import { currentUserQueryKey } from '@/entities/user';
import { apiFetch } from '@/shared/api';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: ({ accessToken, user }) => {
      queryClient.setQueryData(currentUserQueryKey, user);
      // Навигацию делает RequireGuest на странице: он увидит токен и уведёт на /.
      startSession(accessToken);
    },
  });
}

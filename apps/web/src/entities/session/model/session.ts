'use client';

import { useSyncExternalStore } from 'react';
import { tokenStorage } from '@/shared/api';

/**
 * undefined — ещё не знаем (SSR и первый рендер при гидрации, localStorage недоступен),
 * null — гость, string — залогинен.
 */
export type SessionToken = string | null | undefined;

export function useSessionToken(): SessionToken {
  return useSyncExternalStore(tokenStorage.subscribe, tokenStorage.get, () => undefined);
}

export function startSession(accessToken: string) {
  tokenStorage.set(accessToken);
}

export function endSession() {
  tokenStorage.clear();
}

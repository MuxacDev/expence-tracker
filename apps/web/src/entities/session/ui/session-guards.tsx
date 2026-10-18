'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSessionToken } from '../model/session';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Загрузка…
    </div>
  );
}

/** Пускает только залогиненных, гостя уводит на /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useSessionToken();
  const router = useRouter();

  useEffect(() => {
    if (token === null) router.replace('/login');
  }, [token, router]);

  return token ? children : <FullScreenLoader />;
}

/** Пускает только гостей. Сюда же сводится редирект после успешного логина/регистрации. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const token = useSessionToken();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace('/');
  }, [token, router]);

  return token === null ? children : <FullScreenLoader />;
}

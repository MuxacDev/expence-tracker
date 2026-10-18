'use client';

import { useCurrentUser } from '@/entities/user';

export function Greeting() {
  const { data: user, isError } = useCurrentUser();

  if (isError) return <p className="text-sm text-destructive">Не удалось загрузить профиль</p>;
  if (!user) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  return <h1 className="text-3xl font-semibold">Привет, {user.name}!</h1>;
}

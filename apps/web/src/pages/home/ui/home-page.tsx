import { RequireAuth } from '@/entities/session';
import { LogoutButton } from '@/features/auth/logout';
import { Greeting } from './greeting';

export function HomePage() {
  return (
    <RequireAuth>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <Greeting />
        <LogoutButton />
      </main>
    </RequireAuth>
  );
}

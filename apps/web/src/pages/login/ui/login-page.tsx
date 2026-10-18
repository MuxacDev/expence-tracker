import Link from 'next/link';
import { RequireGuest } from '@/entities/session';
import { LoginForm } from '@/features/auth/login';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export function LoginPage() {
  return (
    <RequireGuest>
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Вход</CardTitle>
            <CardDescription>Войдите, чтобы продолжить учёт расходов</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Нет аккаунта?&nbsp;
            <Link href="/register" className="text-foreground underline underline-offset-4">
              Зарегистрироваться
            </Link>
          </CardFooter>
        </Card>
      </main>
    </RequireGuest>
  );
}

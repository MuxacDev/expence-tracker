import Link from 'next/link';
import { RequireGuest } from '@/entities/session';
import { RegisterForm } from '@/features/auth/register';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export function RegisterPage() {
  return (
    <RequireGuest>
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт, чтобы вести учёт расходов</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Уже есть аккаунт?&nbsp;
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Войти
            </Link>
          </CardFooter>
        </Card>
      </main>
    </RequireGuest>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export function TermsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Пользовательское соглашение</CardTitle>
          <CardDescription>Документ в разработке</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Текст пользовательского соглашения появится здесь позже.
        </CardContent>
      </Card>
    </main>
  );
}

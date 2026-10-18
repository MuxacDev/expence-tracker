'use client';

import { useQueryClient } from '@tanstack/react-query';
import { endSession } from '@/entities/session';
import { Button } from '@/shared/ui/button';

export function LogoutButton() {
  const queryClient = useQueryClient();
  return (
    <Button
      variant="outline"
      onClick={() => {
        endSession();
        // Данные прошлого пользователя не должны пережить смену аккаунта.
        queryClient.clear();
      }}
    >
      Выйти
    </Button>
  );
}

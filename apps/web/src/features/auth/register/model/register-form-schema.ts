import { registerSchema } from '@expense-tracker/shared';
import { z } from 'zod';

// Повтор пароля — чисто UI-проверка, в API уходит registerSchema без него.
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

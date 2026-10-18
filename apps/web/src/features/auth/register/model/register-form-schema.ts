import { registerSchema } from '@expense-tracker/shared';
import { z } from 'zod';

// Повтор пароля и согласие с документами — чисто UI-проверки, в API уходит registerSchema без них.
export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms and the privacy policy',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

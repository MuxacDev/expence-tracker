'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import type { z } from 'zod';
import { ApiError } from '@/shared/api';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { useRegister } from '../api/register';
import { registerFormSchema } from '../model/register-form-schema';

type RegisterFormValues = z.input<typeof registerFormSchema>;

// В новой вкладке, чтобы не потерять заполненную форму.
const docLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
  className: 'text-foreground underline underline-offset-4',
};

const fields: Array<{
  name: Exclude<FieldPath<RegisterFormValues>, 'acceptTerms'>;
  label: string;
  type: string;
  autoComplete: string;
}> = [
  { name: 'name', label: 'Имя', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Пароль', type: 'password', autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Повторите пароль',
    type: 'password',
    autoComplete: 'new-password',
  },
];

export function RegisterForm() {
  const register = useRegister();
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = form.handleSubmit(({ confirmPassword, acceptTerms, ...input }) =>
    register.mutateAsync(input).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        form.setError('email', { message: 'Этот email уже зарегистрирован' });
        return;
      }
      form.setError('root', { message: 'Не удалось зарегистрироваться. Попробуйте ещё раз' });
    }),
  );

  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {fields.map(({ name, label, type, autoComplete }) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`register-${name}`}>{label}</FieldLabel>
                <Input
                  {...field}
                  id={`register-${name}`}
                  type={type}
                  autoComplete={autoComplete}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}
        <Controller
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="register-acceptTerms"
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="register-acceptTerms" className="block font-normal">
                  Согласен с{' '}
                  <Link href="/terms" {...docLinkProps}>
                    пользовательским соглашением
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" {...docLinkProps}>
                    политикой обработки данных
                  </Link>
                </FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
        {rootError && (
          <Alert variant="destructive">
            <AlertDescription>{rootError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </FieldGroup>
    </form>
  );
}

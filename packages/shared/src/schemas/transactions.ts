import { z } from 'zod';

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

// Деньги ходят строкой: в БД Decimal(12,2), float теряет копейки при суммировании.
const amountSchema = z
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, {
    message: 'Amount must be a positive decimal with up to 2 fraction digits, e.g. "1234.50"',
  })
  .refine((value) => /[1-9]/.test(value), { message: 'Amount must be greater than 0' });

// Только дата: в БД колонка DATE, часовые пояса не участвуют.
const dateSchema = z.iso.date();

// Пустая строка после trim сохраняется как null.
const descriptionSchema = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value === '' ? null : value))
  .nullable();

export const createTransactionSchema = z.object({
  amount: amountSchema,
  type: transactionTypeSchema,
  description: descriptionSchema.optional(),
  date: dateSchema,
  categoryId: z.uuid(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'At least one field must be provided',
  });

export const transactionQuerySchema = z
  .object({
    dateFrom: dateSchema.optional(),
    dateTo: dateSchema.optional(),
    type: transactionTypeSchema.optional(),
    categoryId: z.uuid().optional(),
  })
  // YYYY-MM-DD сравнивается как строка.
  .refine(({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo, {
    message: 'dateFrom must not be after dateTo',
    path: ['dateFrom'],
  });

export const transactionSummaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const transactionSchema = z.object({
  id: z.uuid(),
  amount: z.string(),
  type: transactionTypeSchema,
  description: z.string().nullable(),
  date: z.iso.date(),
  categoryId: z.uuid(),
  createdAt: z.iso.datetime(),
});

export const transactionSummarySchema = z.object({
  month: z.number().int(),
  year: z.number().int(),
  income: z.string(),
  expense: z.string(),
  balance: z.string(),
  byCategory: z.array(
    z.object({
      categoryId: z.uuid(),
      type: transactionTypeSchema,
      total: z.string(),
    }),
  ),
});

export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
export type TransactionSummaryQuery = z.infer<typeof transactionSummaryQuerySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionSummary = z.infer<typeof transactionSummarySchema>;

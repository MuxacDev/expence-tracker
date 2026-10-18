import { z } from 'zod';

const categoryNameSchema = z.string().trim().min(1).max(50);

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { message: 'Color must be a hex value like #a1b2c3' })
  .toLowerCase();

// Имя иконки lucide: kebab-case, например "shopping-cart".
const iconSchema = z
  .string()
  .max(50)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'Icon must be a kebab-case icon name' });

export const createCategorySchema = z.object({
  name: categoryNameSchema,
  color: colorSchema,
  icon: iconSchema,
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'At least one field must be provided',
  });

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type Category = z.infer<typeof categorySchema>;

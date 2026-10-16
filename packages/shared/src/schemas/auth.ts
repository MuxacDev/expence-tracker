import { z } from 'zod';

// bcrypt молча обрезает пароль после 72 байт.
const BCRYPT_MAX_BYTES = 72;

// shared собирается без DOM/node типов, поэтому TextEncoder/Buffer недоступны.
function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const char of value) {
    const code = char.codePointAt(0)!;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: z
    .string()
    .min(8)
    .max(BCRYPT_MAX_BYTES)
    .refine((value) => utf8ByteLength(value) <= BCRYPT_MAX_BYTES, {
      message: `Password must be at most ${BCRYPT_MAX_BYTES} bytes`,
    }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(1024),
});

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

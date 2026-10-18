import { API_URL } from '../config';
import { tokenStorage } from './token-storage';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Nest отдаёт { statusCode, message, error }, где message — строка или массив строк.
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: unknown };
    if (typeof body.message === 'string') return body.message;
    if (Array.isArray(body.message)) return body.message.join(', ');
  } catch {
    // тело не JSON
  }
  return res.statusText;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStorage.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    // Токен протух или отозван: сбрасываем сессию, guard'ы сами уведут на /login.
    if (res.status === 401 && token) tokenStorage.clear();
    throw new ApiError(res.status, await readErrorMessage(res));
  }
  return (await res.json()) as T;
}

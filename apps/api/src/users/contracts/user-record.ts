/**
 * Внутреннее представление пользователя (с хэшем пароля).
 * Нужно auth-модулю для проверки пароля; наружу из API не отдаётся.
 */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

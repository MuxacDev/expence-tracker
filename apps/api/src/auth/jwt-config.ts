import type { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

const JWT_ALGORITHM = 'HS256';
const MIN_SECRET_LENGTH = 32;
const EXAMPLE_SECRET = 'change-me-to-long-random-string';
// Без единицы ("3600") библиотека ms трактует значение как миллисекунды — требуем её явно.
const EXPIRES_IN_PATTERN = /^\d+[smhd]$/;

/** Валидирует JWT-настройки при старте: слабый секрет или кривой срок жизни валят приложение сразу. */
export function createJwtOptions(config: ConfigService): JwtModuleOptions {
  const secret = config.getOrThrow<string>('JWT_SECRET');
  if (secret.length < MIN_SECRET_LENGTH || secret === EXAMPLE_SECRET) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters and not the .env.example value`,
    );
  }

  const expiresIn = config.getOrThrow<string>('JWT_EXPIRES_IN');
  if (!EXPIRES_IN_PATTERN.test(expiresIn)) {
    throw new Error(
      `JWT_EXPIRES_IN must be a number with a unit (s, m, h, d), e.g. "1d"; got "${expiresIn}"`,
    );
  }

  return {
    secret,
    signOptions: {
      algorithm: JWT_ALGORITHM,
      expiresIn: expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
    },
    verifyOptions: { algorithms: [JWT_ALGORITHM] },
  };
}

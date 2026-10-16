import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Отключает глобальный JwtAuthGuard для контроллера или хендлера. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

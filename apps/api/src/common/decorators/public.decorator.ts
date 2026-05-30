import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opens a route past the global JwtAuthGuard (e.g. /auth/login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

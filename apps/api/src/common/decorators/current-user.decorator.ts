import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  tenantId: string;
  role: 'ADMIN' | 'SALE_LEAD' | 'SALE';
  branchId: string | null;
}

/** Injects the authenticated user (populated by JwtStrategy) into a handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);

/** Convenience: injects just the authenticated user's tenantId. */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user.tenantId;
  },
);

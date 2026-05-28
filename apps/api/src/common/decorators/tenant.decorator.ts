import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId as string;
  },
);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

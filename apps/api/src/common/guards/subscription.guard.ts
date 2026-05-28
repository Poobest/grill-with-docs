import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) return true; // platform routes ไม่ต้องเช็ค

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { isActive: true, subscriptionExpiresAt: true },
    });

    if (!tenant?.isActive) {
      throw new ForbiddenException('Subscription expired. Please renew to continue.');
    }

    if (tenant.subscriptionExpiresAt && tenant.subscriptionExpiresAt < new Date()) {
      // auto-lock เมื่อหมดอายุ
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: false },
      });
      throw new ForbiddenException('Subscription expired. Please renew to continue.');
    }

    request.tenantId = tenantId;
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { addMonths } from 'date-fns';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, ExtendSubscriptionDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  findAll() {
    return this.prisma.tenant.findMany({
      include: {
        plan: { select: { id: true, name: true, pricePerMonth: true } },
        _count: { select: { users: true, branches: true, contracts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        _count: {
          select: {
            users: true,
            branches: true,
            contracts: true,
            payments: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const hashedPassword = await this.authService.hashPassword(dto.adminPassword);
    const expiresAt = addMonths(new Date(), dto.subscriptionMonths ?? 1);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          planId: dto.planId,
          subscriptionExpiresAt: expiresAt,
          isActive: true,
        },
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          role: UserRole.TENANT_ADMIN,
          name: dto.adminName,
          email: dto.adminEmail,
          password: hashedPassword,
        },
      });

      return tx.tenant.findUnique({
        where: { id: tenant.id },
        include: { plan: { select: { id: true, name: true } } },
      });
    });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: { isActive } });
  }

  async extendSubscription(id: string, dto: ExtendSubscriptionDto) {
    const tenant = await this.findOne(id);
    const base = tenant.subscriptionExpiresAt ?? new Date();
    const newExpiry = addMonths(base, dto.months);
    return this.prisma.tenant.update({
      where: { id },
      data: { subscriptionExpiresAt: newExpiry, isActive: true },
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(tenantId: string, role?: UserRole) {
    return this.prisma.user.findMany({
      where: { tenantId, isActive: true, ...(role && { role }) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        commissionRateCash: true,
        commissionRateInstallment: true,
        branch: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        commissionRateCash: true,
        commissionRateInstallment: true,
        branch: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    await this.enforcePlanLimit(tenantId);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const password = await this.authService.hashPassword(dto.password);
    return this.prisma.user.create({
      data: { ...dto, tenantId, password },
      select: { id: true, name: true, email: true, role: true, branchId: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        commissionRateCash: true,
        commissionRateInstallment: true,
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async enforcePlanLimit(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const count = await this.prisma.user.count({
      where: { tenantId, isActive: true },
    });

    if (count >= tenant.plan.maxUsers) {
      throw new BadRequestException(
        `Plan limit reached: maximum ${tenant.plan.maxUsers} users allowed`,
      );
    }
  }
}

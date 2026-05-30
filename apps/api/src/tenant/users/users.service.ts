import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  installmentRate: number;
  cashRate: number;
  overrideRate: number;
  isActive: boolean;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: string;
  installmentRate?: number;
  cashRate?: number;
  overrideRate?: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<UserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      include: { branch: { select: { name: true } } },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      branchId: u.branchId,
      branchName: u.branch?.name ?? null,
      installmentRate: Number(u.installmentRate),
      cashRate: Number(u.cashRate),
      overrideRate: Number(u.overrideRate),
      isActive: u.isActive,
    }));
  }

  /** Creates a user, enforcing the plan's user limit and a unique email per tenant. */
  async create(tenantId: string, input: CreateUserInput): Promise<UserListItem> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      include: { plan: true },
    });
    const count = await this.prisma.user.count({ where: { tenantId } });
    if (count >= tenant.plan.maxUsers) {
      throw new BadRequestException(
        `เกินจำนวนผู้ใช้สูงสุดของแพ็กเกจ (${tenant.plan.maxUsers} คน)`,
      );
    }

    const duplicate = await this.prisma.user.findFirst({
      where: { tenantId, email: input.email },
    });
    if (duplicate) {
      throw new BadRequestException('อีเมลนี้ถูกใช้แล้วในร้าน');
    }

    const password = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: input.name,
        email: input.email,
        password,
        role: input.role,
        branchId: input.branchId,
        installmentRate: input.installmentRate ?? 0,
        cashRate: input.cashRate ?? 0,
        overrideRate: input.overrideRate ?? 0,
      },
      include: { branch: { select: { name: true } } },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branch?.name ?? null,
      installmentRate: Number(user.installmentRate),
      cashRate: Number(user.cashRate),
      overrideRate: Number(user.overrideRate),
      isActive: user.isActive,
    };
  }
}

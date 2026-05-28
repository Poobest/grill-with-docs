import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { users: true, stocks: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId, isActive: true },
      include: { stocks: { include: { product: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async create(tenantId: string, dto: CreateBranchDto) {
    await this.enforcePlanLimit(tenantId);
    return this.prisma.branch.create({
      data: { ...dto, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({
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

    const count = await this.prisma.branch.count({
      where: { tenantId, isActive: true },
    });

    if (count >= tenant.plan.maxBranches) {
      throw new BadRequestException(
        `Plan limit reached: maximum ${tenant.plan.maxBranches} branches allowed`,
      );
    }
  }
}

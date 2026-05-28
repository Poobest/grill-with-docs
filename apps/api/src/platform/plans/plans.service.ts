import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { tenants: true } } },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { _count: { select: { tenants: true } } },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  create(dto: CreatePlanDto) {
    return this.prisma.subscriptionPlan.create({ data: dto });
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);
    return this.prisma.subscriptionPlan.update({ where: { id }, data: dto });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface BranchListItem {
  id: string;
  name: string;
  address: string | null;
}

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<BranchListItem[]> {
    const branches = await this.prisma.branch.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return branches.map((b) => ({ id: b.id, name: b.name, address: b.address }));
  }

  /** Creates a branch, enforcing the subscription plan's branch limit. */
  async create(
    tenantId: string,
    data: { name: string; address?: string },
  ): Promise<BranchListItem> {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      include: { plan: true },
    });
    const count = await this.prisma.branch.count({ where: { tenantId } });
    if (count >= tenant.plan.maxBranches) {
      throw new BadRequestException(
        `เกินจำนวนสาขาสูงสุดของแพ็กเกจ (${tenant.plan.maxBranches} สาขา)`,
      );
    }
    const branch = await this.prisma.branch.create({
      data: { tenantId, name: data.name, address: data.address },
    });
    return { id: branch.id, name: branch.name, address: branch.address };
  }
}

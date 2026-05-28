import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ClaimCustomerDto,
  CreateCustomerDto,
  SetContractLimitDto,
  UpdateCustomerDto,
} from './dto/customer.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }),
      },
      include: {
        _count: { select: { contracts: { where: { status: { in: ['PENDING', 'ACTIVE'] } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' },
          include: { product: { select: { name: true } } },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    const claimCode = randomBytes(4).toString('hex').toUpperCase();
    return this.prisma.customer.create({
      data: { ...dto, tenantId, claimCode },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async setContractLimit(tenantId: string, id: string, dto: SetContractLimitDto) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { contractLimit: dto.contractLimit },
    });
  }

  // LINE LIFF: ลูกค้า claim account ด้วย claimCode
  async claim(dto: ClaimCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { claimCode: dto.claimCode },
    });

    if (!customer) throw new NotFoundException('Invalid claim code');
    if (customer.lineUserId) throw new BadRequestException('Account already claimed');

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: { lineUserId: dto.lineUserId, claimCode: null },
      select: { id: true, name: true, tenantId: true },
    });
  }

  async suspend(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: { isSuspended: true } });
  }

  async unsuspend(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: { isSuspended: false } });
  }

  async validateCanContract(tenantId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.isSuspended) {
      throw new BadRequestException('Customer account is suspended due to overdue payments');
    }

    const activeCount = await this.prisma.contract.count({
      where: { customerId, tenantId, status: { in: ['PENDING', 'ACTIVE'] } },
    });
    if (activeCount >= customer.contractLimit) {
      throw new BadRequestException(
        `Customer has reached the contract limit of ${customer.contractLimit}`,
      );
    }
  }
}

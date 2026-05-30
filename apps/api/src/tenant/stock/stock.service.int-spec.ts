import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from './stock.service';

/** Integration tests — real PostgreSQL (installment_saas_test), no mocks. */
describe('StockService (integration)', () => {
  const prisma = new PrismaService();
  let service: StockService;

  const ids = { plan: '', tenant: '', branch: '', product: '' };

  async function resetDb() {
    await prisma.branchStock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
  }

  function key() {
    return { tenantId: ids.tenant, branchId: ids.branch, productId: ids.product };
  }

  beforeAll(async () => {
    await prisma.$connect();
    await resetDb();
    service = new StockService(prisma);

    const plan = await prisma.subscriptionPlan.create({
      data: { name: 'P', maxBranches: 5, maxUsers: 20, pricePerMonth: 990 },
    });
    ids.plan = plan.id;
    const tenant = await prisma.tenant.create({
      data: { name: 'ร้าน', planId: plan.id },
    });
    ids.tenant = tenant.id;
    const branch = await prisma.branch.create({
      data: { tenantId: tenant.id, name: 'สาขา' },
    });
    ids.branch = branch.id;
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: 'สินค้า',
        cashPrice: 9000,
        downPayment: 1000,
        dailyPrice: 100,
        weeklyPrice: 500,
        monthlyPrice: 2000,
      },
    });
    ids.product = product.id;
  });

  afterEach(async () => {
    await prisma.branchStock.deleteMany();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it('sets an absolute quantity (upsert)', async () => {
    const row = await service.set(key(), 10);
    expect(row.quantity).toBe(10);
    const updated = await service.set(key(), 3);
    expect(updated.quantity).toBe(3);
  });

  it('decrements by one on down-payment approval', async () => {
    await service.set(key(), 5);
    const row = await service.decrementOnDownPayment(key());
    expect(row.quantity).toBe(4);
  });

  it('blocks decrement when stock is zero', async () => {
    await service.set(key(), 0);
    await expect(service.decrementOnDownPayment(key())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('increments by one on contract cancellation', async () => {
    await service.set(key(), 2);
    const row = await service.incrementOnCancel(key());
    expect(row.quantity).toBe(3);
  });

  it('never lets adjust drive stock below zero', async () => {
    await service.set(key(), 1);
    await expect(service.adjust(key(), -5)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

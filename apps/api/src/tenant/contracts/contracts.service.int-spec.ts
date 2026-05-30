import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContractsService } from './contracts.service';

/**
 * Integration tests — real PostgreSQL (installment_saas_test), no mocks.
 * Verifies ContractsService.create persists a contract and its full schedule,
 * and enforces the documented guard rails (suspended customer, no stock).
 */
describe('ContractsService.create (integration)', () => {
  const prisma = new PrismaService();
  let service: ContractsService;

  // Seeded ids, reused across tests.
  const ids = {
    plan: '',
    tenant: '',
    branch: '',
    sale: '',
    product: '',
    customer: '',
  };

  async function resetDb() {
    // FK-safe delete order.
    await prisma.commission.deleteMany();
    await prisma.lateFee.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.branchStock.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
  }

  beforeAll(async () => {
    await prisma.$connect();
    await resetDb();
    service = new ContractsService(prisma);

    const plan = await prisma.subscriptionPlan.create({
      data: { name: 'Test Plan', maxBranches: 5, maxUsers: 20, pricePerMonth: 990 },
    });
    ids.plan = plan.id;

    const tenant = await prisma.tenant.create({
      data: { name: 'ร้านทดสอบ', planId: plan.id },
    });
    ids.tenant = tenant.id;

    const branch = await prisma.branch.create({
      data: { tenantId: tenant.id, name: 'สาขาหลัก' },
    });
    ids.branch = branch.id;

    const sale = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'พนักงานขาย',
        email: 'sale@test.local',
        password: 'x',
        role: 'SALE',
        installmentRate: 0.05,
        cashRate: 0.02,
      },
    });
    ids.sale = sale.id;

    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: 'ทีวี 55 นิ้ว',
        cashPrice: 9000,
        downPayment: 1000,
        dailyPrice: 100,
        weeklyPrice: 500,
        monthlyPrice: 2000,
      },
    });
    ids.product = product.id;

    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'ลูกค้าทดสอบ',
        phone: '0800000000',
        contractLimit: 1,
      },
    });
    ids.customer = customer.id;

    await prisma.branchStock.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        productId: product.id,
        quantity: 5,
      },
    });
  });

  afterEach(async () => {
    // Each test starts with no contracts/payments and a non-suspended customer.
    await prisma.payment.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.customer.update({
      where: { id: ids.customer },
      data: { isSuspended: false },
    });
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it('persists a DAILY contract with its full 31-row schedule', async () => {
    const contract = await service.create({
      tenantId: ids.tenant,
      customerId: ids.customer,
      productId: ids.product,
      branchId: ids.branch,
      saleId: ids.sale,
      paymentType: 'DAILY',
    });

    expect(contract.status).toBe('PENDING_DOWN_PAYMENT');
    expect(contract.installmentCount).toBe(30);
    expect(Number(contract.totalAmount)).toBe(1000 + 30 * 100);

    const payments = await prisma.payment.findMany({
      where: { contractId: contract.id },
    });
    expect(payments).toHaveLength(31);
    expect(payments.filter((p) => p.isDownPayment)).toHaveLength(1);
  });

  it('rejects a suspended customer with a 400', async () => {
    await prisma.customer.update({
      where: { id: ids.customer },
      data: { isSuspended: true },
    });

    await expect(
      service.create({
        tenantId: ids.tenant,
        customerId: ids.customer,
        productId: ids.product,
        branchId: ids.branch,
        saleId: ids.sale,
        paymentType: 'DAILY',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(await prisma.contract.count()).toBe(0);
  });

  it('rejects creation when the branch has no stock', async () => {
    await prisma.branchStock.update({
      where: {
        branchId_productId: { branchId: ids.branch, productId: ids.product },
      },
      data: { quantity: 0 },
    });

    await expect(
      service.create({
        tenantId: ids.tenant,
        customerId: ids.customer,
        productId: ids.product,
        branchId: ids.branch,
        saleId: ids.sale,
        paymentType: 'DAILY',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    // restore stock for any later tests
    await prisma.branchStock.update({
      where: {
        branchId_productId: { branchId: ids.branch, productId: ids.product },
      },
      data: { quantity: 5 },
    });
  });
});

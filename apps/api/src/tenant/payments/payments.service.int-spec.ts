import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContractsService } from '../contracts/contracts.service';
import { PaymentsService } from './payments.service';

/** Integration tests — real PostgreSQL (installment_saas_test), no mocks. */
describe('PaymentsService.approve (integration)', () => {
  const prisma = new PrismaService();
  let contracts: ContractsService;
  let payments: PaymentsService;

  const ids = {
    plan: '',
    tenant: '',
    branch: '',
    sale: '',
    lead: '',
    product: '',
    customer: '',
  };

  async function resetTables() {
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

  function createDaily() {
    return contracts.create({
      tenantId: ids.tenant,
      customerId: ids.customer,
      productId: ids.product,
      branchId: ids.branch,
      saleId: ids.sale,
      paymentType: 'DAILY',
    });
  }

  function downPaymentOf(contractId: string) {
    return prisma.payment.findFirstOrThrow({
      where: { contractId, isDownPayment: true },
    });
  }

  async function setStock(quantity: number) {
    await prisma.branchStock.update({
      where: {
        branchId_productId: { branchId: ids.branch, productId: ids.product },
      },
      data: { quantity },
    });
  }

  beforeAll(async () => {
    await prisma.$connect();
    await resetTables();
    contracts = new ContractsService(prisma);
    payments = new PaymentsService(prisma);

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

    const sale = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'เซล',
        email: 'sale@test.local',
        password: 'x',
        role: 'SALE',
        installmentRate: 0.05,
        cashRate: 0.02,
      },
    });
    ids.sale = sale.id;

    const lead = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        name: 'หัวหน้าเซล',
        email: 'lead@test.local',
        password: 'x',
        role: 'SALE_LEAD',
        overrideRate: 0.01,
      },
    });
    ids.lead = lead.id;

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

    const customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'ลูกค้า',
        phone: '0800000000',
        contractLimit: 99,
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
    await prisma.commission.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.contract.deleteMany();
    await setStock(5);
  });

  afterAll(async () => {
    await resetTables();
    await prisma.$disconnect();
  });

  it('approving the down payment activates the contract and decrements stock', async () => {
    const contract = await createDaily();
    const down = await downPaymentOf(contract.id);

    const approved = await payments.approve(down.id, ids.sale);
    expect(approved.status).toBe('APPROVED');

    const refreshed = await prisma.contract.findUniqueOrThrow({
      where: { id: contract.id },
    });
    expect(refreshed.status).toBe('ACTIVE');
    expect(refreshed.downPaymentPaid).toBe(true);

    const stock = await prisma.branchStock.findUniqueOrThrow({
      where: {
        branchId_productId: { branchId: ids.branch, productId: ids.product },
      },
    });
    expect(stock.quantity).toBe(4);
  });

  it('records a Sale commission and a Sale-Lead override on approval', async () => {
    const contract = await createDaily();
    const down = await downPaymentOf(contract.id);
    await payments.approve(down.id, ids.sale);

    const commissions = await prisma.commission.findMany({
      where: { paymentId: down.id },
    });
    const byType = Object.fromEntries(
      commissions.map((c) => [c.type, Number(c.amount)]),
    );
    // down payment 1000 → SALE 1000×0.05=50, SALE_LEAD 1000×0.01=10
    expect(byType.SALE).toBe(50);
    expect(byType.SALE_LEAD).toBe(10);
  });

  it('completes the contract when the final payment is approved (CASH)', async () => {
    const contract = await contracts.create({
      tenantId: ids.tenant,
      customerId: ids.customer,
      productId: ids.product,
      branchId: ids.branch,
      saleId: ids.sale,
      paymentType: 'CASH',
    });
    const only = await downPaymentOf(contract.id);

    await payments.recordCash(only.id, ids.sale);

    const refreshed = await prisma.contract.findUniqueOrThrow({
      where: { id: contract.id },
    });
    expect(refreshed.status).toBe('COMPLETED');
    expect(refreshed.warrantyActive).toBe(true);

    const paid = await prisma.payment.findUniqueOrThrow({
      where: { id: only.id },
    });
    expect(paid.method).toBe('CASH');
  });

  it('rejects approving an already-approved payment', async () => {
    const contract = await createDaily();
    const down = await downPaymentOf(contract.id);
    await payments.approve(down.id, ids.sale);

    await expect(payments.approve(down.id, ids.sale)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

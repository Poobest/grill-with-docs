import { PrismaService } from '../../prisma/prisma.service';
import { ContractsService } from '../contracts/contracts.service';
import { PaymentsService } from '../payments/payments.service';
import { DashboardService } from './dashboard.service';

/** Integration tests — real PostgreSQL (installment_saas_test), no mocks. */
describe('DashboardService.getKpi (integration)', () => {
  const prisma = new PrismaService();
  let contracts: ContractsService;
  let payments: PaymentsService;
  let dashboard: DashboardService;

  const ids = { tenant: '', branch: '', sale: '', product: '', customer: '' };

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

  beforeAll(async () => {
    await prisma.$connect();
    await resetTables();
    contracts = new ContractsService(prisma);
    payments = new PaymentsService(prisma);
    dashboard = new DashboardService(prisma);

    const plan = await prisma.subscriptionPlan.create({
      data: { name: 'P', maxBranches: 5, maxUsers: 20, pricePerMonth: 990 },
    });
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
      data: { tenantId: tenant.id, name: 'ลูกค้า', phone: '08', contractLimit: 99 },
    });
    ids.customer = customer.id;
    await prisma.branchStock.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        productId: product.id,
        quantity: 7,
      },
    });
  });

  afterAll(async () => {
    await resetTables();
    await prisma.$disconnect();
  });

  it('aggregates collected, commission, stock and overdue contracts', async () => {
    // A DAILY contract whose down payment we approve (collects 1000, stock 7→6).
    const contract = await contracts.create({
      tenantId: ids.tenant,
      customerId: ids.customer,
      productId: ids.product,
      branchId: ids.branch,
      saleId: ids.sale,
      // backdate so its installments are already overdue
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      paymentType: 'DAILY',
    });
    const down = await prisma.payment.findFirstOrThrow({
      where: { contractId: contract.id, isDownPayment: true },
    });
    await payments.approve(down.id, ids.sale);

    const kpi = await dashboard.getKpi(ids.tenant, new Date('2026-06-01'));

    expect(kpi.totalCollected).toBe(1000); // the approved down payment
    expect(kpi.totalCommission).toBe(50); // 1000 × 0.05 (no lead seeded)
    expect(kpi.totalStock).toBe(6); // 7 − 1 on down-payment approval
    // contract is ACTIVE and has past-due PENDING installments (Jan start)
    expect(kpi.overdueContracts).toBe(1);
  });
});

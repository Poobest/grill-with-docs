import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Seeding database...');

  // ── Platform Admin ──────────────────────────────────────────────────────────
  const platformAdmin = await prisma.platformAdmin.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      password: await bcrypt.hash('password123', 10),
    },
  });
  console.log('✅ Platform admin:', platformAdmin.email);

  // ── Subscription Plans ──────────────────────────────────────────────────────
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-basic' },
    update: {},
    create: {
      id: 'plan-basic',
      name: 'Basic',
      maxBranches: 2,
      maxUsers: 5,
      pricePerMonth: 990,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Pro',
      maxBranches: 10,
      maxUsers: 30,
      pricePerMonth: 2990,
    },
  });
  console.log('✅ Plans:', basicPlan.name, '/', proPlan.name);

  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-demo' },
    update: {},
    create: {
      id: 'tenant-demo',
      name: 'Demo Shop',
      isActive: true,
      planId: proPlan.id,
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      defaultThreshold: 3,
    },
  });
  console.log('✅ Tenant:', tenant.name);

  // ── Branches ────────────────────────────────────────────────────────────────
  const branch1 = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: {
      id: 'branch-1',
      tenantId: tenant.id,
      name: 'สาขาลาดพร้าว',
      address: '123 ถ.ลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพฯ 10900',
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-2' },
    update: {},
    create: {
      id: 'branch-2',
      tenantId: tenant.id,
      name: 'สาขาบางนา',
      address: '456 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
    },
  });
  console.log('✅ Branches:', branch1.name, '/', branch2.name);

  // ── Users ───────────────────────────────────────────────────────────────────
  const userAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      role: 'TENANT_ADMIN',
      name: 'สมชาย แอดมิน',
      email: 'admin@demo.com',
      password: await bcrypt.hash('password123', 10),
      commissionRateCash: 1.5,
      commissionRateInstallment: 2.0,
    },
  });

  const userLead = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'lead@demo.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: branch1.id,
      role: 'SALE_LEAD',
      name: 'สมหญิง หัวหน้าทีม',
      email: 'lead@demo.com',
      password: await bcrypt.hash('password123', 10),
      commissionRateCash: 1.0,
      commissionRateInstallment: 1.5,
    },
  });

  const userSale = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'sale@demo.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: branch1.id,
      role: 'SALE',
      name: 'มานี เซลล์',
      email: 'sale@demo.com',
      password: await bcrypt.hash('password123', 10),
      commissionRateCash: 0.5,
      commissionRateInstallment: 1.0,
    },
  });
  console.log(
    '✅ Users:',
    userAdmin.name,
    '/',
    userLead.name,
    '/',
    userSale.name,
  );

  // ── Products ─────────────────────────────────────────────────────────────────
  const product1 = await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: {
      id: 'prod-1',
      tenantId: tenant.id,
      name: 'iPhone 16 Pro 256GB',
      description: 'สมาร์ทโฟน Apple รุ่นล่าสุด',
      cashPrice: 42900,
      downPayment: 5000,
      dailyPrice: 165,
      weeklyPrice: 1100,
      monthlyPrice: 4200,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: {
      id: 'prod-2',
      tenantId: tenant.id,
      name: 'Samsung Galaxy S25 128GB',
      description: 'สมาร์ทโฟน Samsung รุ่นพรีเมียม',
      cashPrice: 29900,
      downPayment: 3000,
      dailyPrice: 115,
      weeklyPrice: 770,
      monthlyPrice: 2990,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: 'prod-3' },
    update: {},
    create: {
      id: 'prod-3',
      tenantId: tenant.id,
      name: 'iPad Air 11" M3 64GB',
      description: 'แท็บเล็ต Apple สำหรับงานสร้างสรรค์',
      cashPrice: 22900,
      downPayment: 2000,
      dailyPrice: 88,
      weeklyPrice: 590,
      monthlyPrice: 2290,
    },
  });
  console.log('✅ Products: 3 items');

  // ── Stock ───────────────────────────────────────────────────────────────────
  const stocks = [
    { branchId: branch1.id, productId: product1.id, quantity: 5 },
    { branchId: branch1.id, productId: product2.id, quantity: 8 },
    { branchId: branch1.id, productId: product3.id, quantity: 3 },
    { branchId: branch2.id, productId: product1.id, quantity: 2 },
    { branchId: branch2.id, productId: product2.id, quantity: 6 },
    { branchId: branch2.id, productId: product3.id, quantity: 4 },
  ];

  for (const s of stocks) {
    await prisma.branchStock.upsert({
      where: {
        branchId_productId: { branchId: s.branchId, productId: s.productId },
      },
      update: { quantity: s.quantity },
      create: { tenantId: tenant.id, ...s },
    });
  }
  console.log('✅ Stock: 6 records');

  // ── Customers ────────────────────────────────────────────────────────────────
  const customer1 = await prisma.customer.upsert({
    where: { id: 'cust-1' },
    update: {},
    create: {
      id: 'cust-1',
      tenantId: tenant.id,
      name: 'วิชัย ลูกค้าดี',
      phone: '0812345678',
      contractLimit: 2,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 'cust-2' },
    update: {},
    create: {
      id: 'cust-2',
      tenantId: tenant.id,
      name: 'นภา ซื้อบ่อย',
      phone: '0823456789',
      contractLimit: 1,
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { id: 'cust-3' },
    update: {},
    create: {
      id: 'cust-3',
      tenantId: tenant.id,
      name: 'ประสิทธิ์ ค้างชำระ',
      phone: '0834567890',
      contractLimit: 1,
      isSuspended: true,
    },
  });
  console.log(
    '✅ Customers:',
    customer1.name,
    '/',
    customer2.name,
    '/',
    customer3.name,
  );

  // ── Contracts ────────────────────────────────────────────────────────────────
  const now = new Date();

  const contract1 = await prisma.contract.upsert({
    where: { id: 'contract-1' },
    update: {},
    create: {
      id: 'contract-1',
      tenantId: tenant.id,
      customerId: customer1.id,
      productId: product1.id,
      branchId: branch1.id,
      saleId: userSale.id,
      paymentType: 'MONTHLY',
      status: 'ACTIVE',
      totalAmount: 50400,
      installmentCount: 12,
      downPaymentPaid: true,
      warrantyActive: true,
    },
  });

  const contract2 = await prisma.contract.upsert({
    where: { id: 'contract-2' },
    update: {},
    create: {
      id: 'contract-2',
      tenantId: tenant.id,
      customerId: customer2.id,
      productId: product2.id,
      branchId: branch1.id,
      saleId: userSale.id,
      paymentType: 'WEEKLY',
      status: 'ACTIVE',
      totalAmount: 35880,
      installmentCount: 24,
      downPaymentPaid: true,
      warrantyActive: false,
    },
  });
  console.log('✅ Contracts: 2 active');

  // ── Payments ─────────────────────────────────────────────────────────────────
  const payment1 = await prisma.payment.upsert({
    where: { id: 'pay-1' },
    update: {},
    create: {
      id: 'pay-1',
      tenantId: tenant.id,
      contractId: contract1.id,
      amount: 4200,
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      status: 'APPROVED',
      method: 'CASH',
      approvedById: userLead.id,
      approvedAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    },
  });

  const payment2 = await prisma.payment.upsert({
    where: { id: 'pay-2' },
    update: {},
    create: {
      id: 'pay-2',
      tenantId: tenant.id,
      contractId: contract1.id,
      amount: 4200,
      dueDate: new Date(now.getFullYear(), now.getMonth(), 1),
      status: 'PENDING',
    },
  });

  const payment3 = await prisma.payment.upsert({
    where: { id: 'pay-3' },
    update: {},
    create: {
      id: 'pay-3',
      tenantId: tenant.id,
      contractId: contract2.id,
      amount: 1495,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      status: 'APPROVED',
      method: 'TRANSFER_SLIP',
      slipImageUrl: 'https://example.com/slip/pay-3.jpg',
      approvedById: userAdmin.id,
      approvedAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6,
      ),
    },
  });
  console.log('✅ Payments: 3 records (2 approved, 1 pending)');

  // ── Commissions ──────────────────────────────────────────────────────────────
  await prisma.commission.upsert({
    where: { id: 'comm-1' },
    update: {},
    create: {
      id: 'comm-1',
      tenantId: tenant.id,
      paymentId: payment1.id,
      userId: userSale.id,
      amount: 42,
      type: 'SALE_COMMISSION',
    },
  });

  await prisma.commission.upsert({
    where: { id: 'comm-2' },
    update: {},
    create: {
      id: 'comm-2',
      tenantId: tenant.id,
      paymentId: payment1.id,
      userId: userLead.id,
      amount: 21,
      type: 'OVERRIDE_COMMISSION',
    },
  });

  await prisma.commission.upsert({
    where: { id: 'comm-3' },
    update: {},
    create: {
      id: 'comm-3',
      tenantId: tenant.id,
      paymentId: payment3.id,
      userId: userSale.id,
      amount: 63,
      type: 'SALE_COMMISSION',
    },
  });
  console.log('✅ Commissions: 3 records');

  console.log('\n🎉 Seed complete!\n');
  console.log('── Login Credentials ───────────────────────────');
  console.log('Platform Admin : admin@platform.com / password123');
  console.log('Tenant Admin   : admin@demo.com     / password123');
  console.log('Sale Lead      : lead@demo.com      / password123');
  console.log('Sale           : sale@demo.com      / password123');
  console.log('────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

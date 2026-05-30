import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { ContractsService } from '../src/tenant/contracts/contracts.service';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PASSWORD = 'password123';

async function clean() {
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

async function main() {
  await clean();
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const plan = await prisma.subscriptionPlan.create({
    data: { name: 'Standard', maxBranches: 5, maxUsers: 20, pricePerMonth: 1500 },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: 'ร้านผ่อนตัวอย่าง',
      planId: plan.id,
      subscriptionExpiresAt: new Date('2027-01-01'),
    },
  });

  const branch = await prisma.branch.create({
    data: { tenantId: tenant.id, name: 'สาขาสีลม', address: 'ถนนสีลม กรุงเทพฯ' },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'ผู้ดูแลร้าน',
      email: 'admin@demo.local',
      password,
      role: 'ADMIN',
    },
  });

  const sale = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'สมชาย ใจดี',
      email: 'sale@demo.local',
      password,
      role: 'SALE',
      installmentRate: 0.05,
      cashRate: 0.02,
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'หัวหน้าทีมขาย',
      email: 'lead@demo.local',
      password,
      role: 'SALE_LEAD',
      overrideRate: 0.01,
    },
  });

  const productsData = [
    { name: 'ทีวี 55 นิ้ว', cashPrice: 18000, downPayment: 2000, dailyPrice: 200, weeklyPrice: 1200, monthlyPrice: 4500 },
    { name: 'ตู้เย็น 2 ประตู', cashPrice: 12000, downPayment: 1500, dailyPrice: 150, weeklyPrice: 900, monthlyPrice: 3200 },
    { name: 'เครื่องซักผ้า', cashPrice: 9000, downPayment: 1000, dailyPrice: 100, weeklyPrice: 600, monthlyPrice: 2200 },
  ];
  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: { tenantId: tenant.id, ...p },
    });
    products.push(product);
    await prisma.branchStock.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        productId: product.id,
        quantity: 10,
      },
    });
  }

  const customersData = [
    { name: 'ปิยะ มั่งมี', phone: '0810000001', contractLimit: 2 },
    { name: 'อรทัย ดวงดี', phone: '0810000002', contractLimit: 2 },
  ];
  const customers = [];
  for (const c of customersData) {
    customers.push(
      await prisma.customer.create({ data: { tenantId: tenant.id, ...c } }),
    );
  }

  // One sample DAILY contract so the contracts list is not empty.
  const product = products[0];
  const schedule = ContractsService.buildSchedule({
    paymentType: 'DAILY',
    startDate: new Date(),
    downPayment: Number(product.downPayment),
    dailyPrice: Number(product.dailyPrice),
    weeklyPrice: Number(product.weeklyPrice),
    monthlyPrice: Number(product.monthlyPrice),
    cashPrice: Number(product.cashPrice),
  });
  await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      customerId: customers[0].id,
      productId: product.id,
      branchId: branch.id,
      saleId: sale.id,
      paymentType: 'DAILY',
      totalAmount: schedule.reduce((s, i) => s + i.amount, 0),
      installmentCount: schedule.filter((i) => !i.isDownPayment).length,
      payments: {
        create: schedule.map((i) => ({
          tenantId: tenant.id,
          amount: i.amount,
          dueDate: i.dueDate,
          isDownPayment: i.isDownPayment,
        })),
      },
    },
  });

  console.log('Seed complete.');
  console.log('Demo login (tenant app):');
  console.log('  admin@demo.local / ' + DEMO_PASSWORD + ' (ADMIN)');
  console.log('  sale@demo.local  / ' + DEMO_PASSWORD + ' (SALE)');
  console.log('  lead@demo.local  / ' + DEMO_PASSWORD + ' (SALE_LEAD)');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

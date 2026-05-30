import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';
import {
  ContractsService,
  type ScheduleType,
} from '../src/tenant/contracts/contracts.service';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_PASSWORD = 'password123';
const SALE_INSTALLMENT_RATE = 0.05;
const SALE_CASH_RATE = 0.02;
const LEAD_OVERRIDE_RATE = 0.01;

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

const round2 = (n: number) => Math.round(n * 100) / 100;

async function main() {
  await clean();
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Standard',
      maxBranches: 5,
      maxUsers: 20,
      pricePerMonth: 1500,
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      name: 'ร้านผ่อนตัวอย่าง',
      planId: plan.id,
      subscriptionExpiresAt: new Date('2027-01-01'),
    },
  });
  const branch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'สาขาสีลม',
      address: 'ถนนสีลม กรุงเทพฯ',
    },
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
      installmentRate: SALE_INSTALLMENT_RATE,
      cashRate: SALE_CASH_RATE,
    },
  });
  const lead = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'หัวหน้าทีมขาย',
      email: 'lead@demo.local',
      password,
      role: 'SALE_LEAD',
      overrideRate: LEAD_OVERRIDE_RATE,
    },
  });

  const productsData = [
    {
      name: 'ทีวี 55 นิ้ว',
      cashPrice: 18000,
      downPayment: 2000,
      dailyPrice: 200,
      weeklyPrice: 1200,
      monthlyPrice: 4500,
    },
    {
      name: 'ตู้เย็น 2 ประตู',
      cashPrice: 12000,
      downPayment: 1500,
      dailyPrice: 150,
      weeklyPrice: 900,
      monthlyPrice: 3200,
    },
    {
      name: 'เครื่องซักผ้า',
      cashPrice: 9000,
      downPayment: 1000,
      dailyPrice: 100,
      weeklyPrice: 600,
      monthlyPrice: 2200,
    },
    {
      name: 'แอร์ 12000 BTU',
      cashPrice: 16000,
      downPayment: 1800,
      dailyPrice: 180,
      weeklyPrice: 1100,
      monthlyPrice: 4000,
    },
    {
      name: 'ไมโครเวฟ',
      cashPrice: 4500,
      downPayment: 500,
      dailyPrice: 60,
      weeklyPrice: 350,
      monthlyPrice: 1200,
    },
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
        quantity: 12,
      },
    });
  }

  const customersData = [
    {
      name: 'ปิยะ มั่งมี',
      phone: '0810000001',
      contractLimit: 3,
      isSuspended: false,
    },
    {
      name: 'อรทัย ดวงดี',
      phone: '0810000002',
      contractLimit: 3,
      isSuspended: false,
    },
    {
      name: 'สมพงษ์ ทองคำ',
      phone: '0810000003',
      contractLimit: 2,
      isSuspended: false,
    },
    {
      name: 'มาลี ศรีนวล',
      phone: '0810000004',
      contractLimit: 2,
      isSuspended: false,
    },
    {
      name: 'ชัยวัฒน์ พูลทรัพย์',
      phone: '0810000005',
      contractLimit: 2,
      isSuspended: false,
    },
    {
      name: 'วันดี สุขใจ',
      phone: '0810000006',
      contractLimit: 2,
      isSuspended: false,
    },
    {
      name: 'ก้อง ศรีสุข',
      phone: '0810000007',
      contractLimit: 2,
      isSuspended: true,
    },
    {
      name: 'นภา จันทร์เพ็ญ',
      phone: '0810000008',
      contractLimit: 2,
      isSuspended: false,
    },
  ];
  const customers = [];
  for (const c of customersData) {
    customers.push(
      await prisma.customer.create({ data: { tenantId: tenant.id, ...c } }),
    );
  }

  type ApproveMode = 'none' | 'down' | 'partial' | 'all';
  interface Spec {
    customer: number;
    product: number;
    paymentType: ScheduleType;
    startOffsetDays: number;
    approve: ApproveMode;
    defaulted?: boolean;
  }

  const specs: Spec[] = [
    {
      customer: 0,
      product: 0,
      paymentType: 'DAILY',
      startOffsetDays: 12,
      approve: 'down',
    },
    {
      customer: 1,
      product: 1,
      paymentType: 'WEEKLY',
      startOffsetDays: 28,
      approve: 'partial',
    },
    {
      customer: 2,
      product: 2,
      paymentType: 'MONTHLY',
      startOffsetDays: 3,
      approve: 'none',
    },
    {
      customer: 3,
      product: 3,
      paymentType: 'MONTHLY',
      startOffsetDays: 400,
      approve: 'all',
    },
    {
      customer: 4,
      product: 4,
      paymentType: 'CASH',
      startOffsetDays: 2,
      approve: 'all',
    },
    {
      customer: 5,
      product: 0,
      paymentType: 'DAILY',
      startOffsetDays: 45,
      approve: 'down',
      defaulted: true,
    },
    {
      customer: 6,
      product: 1,
      paymentType: 'WEEKLY',
      startOffsetDays: 70,
      approve: 'down',
      defaulted: true,
    },
    {
      customer: 7,
      product: 2,
      paymentType: 'MONTHLY',
      startOffsetDays: 1,
      approve: 'none',
    },
    {
      customer: 1,
      product: 4,
      paymentType: 'CASH',
      startOffsetDays: 6,
      approve: 'all',
    },
  ];

  const soldByProduct: Record<string, number> = {};
  for (const spec of specs) {
    const product = products[spec.product];
    const customer = customers[spec.customer];
    const startDate = subDays(new Date(), spec.startOffsetDays);

    const schedule = ContractsService.buildSchedule({
      paymentType: spec.paymentType,
      startDate,
      downPayment: Number(product.downPayment),
      dailyPrice: Number(product.dailyPrice),
      weeklyPrice: Number(product.weeklyPrice),
      monthlyPrice: Number(product.monthlyPrice),
      cashPrice: Number(product.cashPrice),
    });
    const installmentCount =
      spec.paymentType === 'CASH'
        ? 1
        : schedule.filter((i) => !i.isDownPayment).length;

    const approveCount =
      spec.approve === 'none'
        ? 0
        : spec.approve === 'down'
          ? 1
          : spec.approve === 'all'
            ? schedule.length
            : 1 + Math.floor((schedule.length - 1) * 0.4);

    const status = spec.defaulted
      ? 'DEFAULTED'
      : approveCount === 0
        ? 'PENDING_DOWN_PAYMENT'
        : approveCount >= schedule.length
          ? 'COMPLETED'
          : 'ACTIVE';

    const contract = await prisma.contract.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        productId: product.id,
        branchId: branch.id,
        saleId: sale.id,
        paymentType: spec.paymentType,
        totalAmount: schedule.reduce((s, i) => s + i.amount, 0),
        installmentCount,
        status,
        downPaymentPaid: approveCount >= 1,
        warrantyActive: status === 'COMPLETED',
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

    if (approveCount >= 1) {
      soldByProduct[product.id] = (soldByProduct[product.id] ?? 0) + 1;
    }

    const payments = await prisma.payment.findMany({
      where: { contractId: contract.id },
      orderBy: { dueDate: 'asc' },
    });
    const rate =
      spec.paymentType === 'CASH' ? SALE_CASH_RATE : SALE_INSTALLMENT_RATE;

    for (
      let index = 0;
      index < approveCount && index < payments.length;
      index++
    ) {
      const payment = payments[index];
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'APPROVED',
          method: 'CASH',
          paidAt: payment.dueDate,
          approvedById: sale.id,
          approvedAt: payment.dueDate,
        },
      });
      const amount = Number(payment.amount);
      await prisma.commission.create({
        data: {
          tenantId: tenant.id,
          paymentId: payment.id,
          userId: sale.id,
          amount: round2(amount * rate),
          type: 'SALE',
        },
      });
      await prisma.commission.create({
        data: {
          tenantId: tenant.id,
          paymentId: payment.id,
          userId: lead.id,
          amount: round2(amount * LEAD_OVERRIDE_RATE),
          type: 'SALE_LEAD',
        },
      });
    }
  }

  // Reflect goods that left the store: one unit per contract whose down payment
  // was approved, subtracted from that product's branch stock.
  for (const product of products) {
    const sold = soldByProduct[product.id] ?? 0;
    await prisma.branchStock.update({
      where: {
        branchId_productId: { branchId: branch.id, productId: product.id },
      },
      data: { quantity: 12 - sold },
    });
  }

  const counts = {
    customers: customers.length,
    products: products.length,
    contracts: specs.length,
  };
  console.log('Seed complete:', counts);
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

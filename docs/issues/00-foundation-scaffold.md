# #00 — Foundation: Monorepo Scaffold + Database Schema

**Type:** AFK
**Blocked by:** None — can start immediately

---

## What to build

สร้าง monorepo skeleton ทั้งหมดตั้งแต่ต้น รวมถึง pnpm workspace, NestJS API app, Vue 3 frontend apps (platform + tenant), Prisma schema ครบ, และ Docker Compose สำหรับ infrastructure

ทุก slice ถัดไปต้องรอ slice นี้เสร็จก่อน

## Acceptance criteria

- [ ] `pnpm install` สำเร็จ ไม่มี error
- [ ] `docker compose up -d` เริ่ม PostgreSQL และ Redis ได้
- [ ] `npx prisma db push` apply schema สำเร็จ — มี tables ครบใน database
- [ ] `pnpm dev:api` เริ่ม NestJS บน port 3000 ได้
- [ ] `pnpm dev:platform` เริ่ม Vue 3 บน port 5174 ได้
- [ ] `pnpm dev:tenant` เริ่ม Vue 3 บน port 5175 ได้
- [ ] Prisma schema มี models: PlatformAdmin, SubscriptionPlan, Tenant, Branch, User, Product, BranchStock, Customer, Contract, Payment, Commission, LateFee
- [ ] ทุก model ยกเว้น PlatformAdmin และ SubscriptionPlan มี `tenantId` field
- [ ] Contract มี status enum: PENDING_DOWN_PAYMENT, ACTIVE, COMPLETED, CANCELLED, DEFAULTED
- [ ] Payment มี status enum: PENDING, APPROVED, REJECTED และ method enum: CASH, TRANSFER_SLIP
- [ ] Seed script สร้าง demo data ได้: Platform Admin, 2 Plans, 1 Tenant, 2 Branches, 4 Users

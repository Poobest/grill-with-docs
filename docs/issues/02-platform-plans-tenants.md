# #02 — Platform: Subscription Plans + Tenant Management

**Type:** AFK
**Blocked by:** #01

---

## What to build

Platform Admin สามารถจัดการ Subscription Plan และ Tenant ผ่าน Platform app ได้ครบ รวมถึงการ extend subscription ด้วยตัวเองหลังยืนยันการโอนเงิน (manual payment flow ตาม ADR-0004)

## Acceptance criteria

- [ ] `GET/POST/PATCH/DELETE /api/platform/plans` — CRUD สำหรับ Subscription Plan (maxBranches, maxUsers, pricePerMonth)
- [ ] `GET /api/platform/tenants` — ดูรายการ Tenant ทั้งหมดพร้อมสถานะ subscription
- [ ] `POST /api/platform/tenants` — สร้าง Tenant ใหม่พร้อมกำหนด plan
- [ ] `PATCH /api/platform/tenants/:id` — extend subscription (อัปเดต `subscriptionExpiresAt`) และ toggle `isActive`
- [ ] Platform app (port 5174) มีหน้า: Login, Plans CRUD, Tenants list, Tenant detail + extend form
- [ ] การสร้าง Tenant ตรวจว่า plan ที่เลือกมีอยู่จริง
- [ ] Tenant ที่ถูก lock (`isActive = false`) ไม่สามารถ login ผ่าน Tenant app ได้

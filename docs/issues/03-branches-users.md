# #03 — Tenant: Branches + Users

**Type:** AFK
**Blocked by:** #01

---

## What to build

Tenant Admin จัดการสาขาและ User ได้ภายในขีดจำกัดของ Subscription Plan ระบบต้องตรวจ hard limit จาก plan ก่อนสร้าง Branch หรือ User ใหม่

## Acceptance criteria

- [ ] `GET/POST/PATCH/DELETE /api/branches` — CRUD สาขา
- [ ] การสร้างสาขาตรวจ `plan.maxBranches` — ถ้าเกินคืน 400
- [ ] `GET/POST/PATCH/DELETE /api/users` — CRUD User ภายใน tenant
- [ ] การสร้าง User ตรวจ `plan.maxUsers` — ถ้าเกินคืน 400
- [ ] User มี role: ADMIN, SALE_LEAD, SALE
- [ ] Sale สังกัดสาขาเดียว (branchId required สำหรับ role SALE)
- [ ] Sale Lead ไม่ผูกกับสาขาเดียว (สามารถดูหลายสาขาได้)
- [ ] Tenant app มีหน้า: Branches list/form, Users list/form
- [ ] ทุก query inject `tenantId` อัตโนมัติจาก JWT — ไม่สามารถเข้าถึงข้อมูล tenant อื่นได้

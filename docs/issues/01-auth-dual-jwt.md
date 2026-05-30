# #01 — Auth: Dual JWT (Platform + Tenant)

**Type:** AFK
**Blocked by:** #00

---

## What to build

ระบบ authentication แบบ dual JWT โดยแยก secret สำหรับ Platform Admin และ Tenant User อย่างชัดเจน พร้อม Global JwtAuthGuard ที่ปิดทุก route โดย default และ @Public() decorator สำหรับเปิดเฉพาะ endpoint ที่ต้องการ

## Acceptance criteria

- [ ] `POST /api/auth/login` คืน JWT token สำหรับ Tenant User ได้
- [ ] `POST /api/auth/platform/login` คืน JWT token สำหรับ Platform Admin ได้
- [ ] `POST /api/auth/platform/setup` สร้าง Platform Admin คนแรกได้ (เรียกครั้งเดียว)
- [ ] JWT payload มี: `sub` (userId), `tenantId`, `role`
- [ ] Global JwtAuthGuard ติดทุก route — route ที่ไม่มี token คืน 401
- [ ] Route ที่ mark `@Public()` ผ่านได้โดยไม่ต้องมี token
- [ ] Platform Admin token ใช้กับ Tenant endpoint ไม่ได้ (ถูก reject)
- [ ] Tenant User token ใช้กับ Platform endpoint ไม่ได้ (ถูก reject)
- [ ] SubscriptionGuard block Tenant ที่ `isActive = false` หรือ `subscriptionExpiresAt` หมดอายุ คืน 403

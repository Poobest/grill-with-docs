# PRD: ระบบบริหารจัดการสินเชื่อผ่อนชำระ (Installment SaaS) — v1

> สร้างเมื่อ: 2026-05-29

---

## Problem Statement

ร้านค้าขายสินค้าทนทาน (เช่น อิเล็กทรอนิกส์) ที่ให้ลูกค้าผ่อนชำระรายวัน/รายสัปดาห์/รายเดือน ยังไม่มีระบบดิจิทัลที่รองรับกระบวนการทั้งหมด ตั้งแต่การสร้างสัญญาผ่อน การติดตามการชำระเงิน การคำนวณ commission ให้ Sale และการแจ้งเตือนลูกค้า ร้านส่วนใหญ่ยังใช้ Excel หรือกระดาษบันทึก ทำให้เกิดข้อผิดพลาด ข้อมูลสูญหาย และไม่สามารถขยายสาขาได้อย่างมีประสิทธิภาพ

---

## Solution

สร้าง SaaS platform แบบ Multi-tenant สำหรับร้านค้าที่ขายสินค้าผ่อนชำระ โดยแต่ละร้าน (Tenant) จ่าย subscription รายเดือน แล้วได้รับระบบจัดการครบวงจร:

- **Platform Admin**: จัดการ Tenant และ Subscription plan ทั้งหมด
- **Tenant Admin**: จัดการร้านของตัวเอง ทั้ง Branch, User, Product, Stock
- **Sale Lead / Sale**: สร้างสัญญา เก็บเงิน รับ commission
- **Customer**: ดูสัญญาผ่อนและชำระผ่าน LINE LIFF โดยไม่ต้องโหลด app

---

## User Stories

### Platform Admin (ทีมผู้พัฒนา)

1. ในฐานะ Platform Admin ฉันต้องการสร้าง Subscription Plan ที่กำหนดจำนวนสาขาสูงสุดและจำนวน user สูงสุดได้ เพื่อให้ Tenant เลือก plan ที่เหมาะสมกับขนาดธุรกิจ
2. ในฐานะ Platform Admin ฉันต้องการสร้าง Tenant ใหม่พร้อมกำหนด plan ได้ เพื่อ onboard ร้านค้าใหม่เข้าสู่ระบบ
3. ในฐานะ Platform Admin ฉันต้องการดูรายการ Tenant ทั้งหมด พร้อมสถานะ subscription และวันหมดอายุ เพื่อติดตาม account ที่ใกล้หมดอายุ
4. ในฐานะ Platform Admin ฉันต้องการ extend subscription ของ Tenant ด้วยตัวเองหลังยืนยันการโอนเงิน เพื่อเปิดการใช้งานต่อ
5. ในฐานะ Platform Admin ฉันต้องการ lock Tenant ที่ subscription หมดอายุโดยอัตโนมัติ เพื่อไม่ให้ใช้งานโดยไม่ชำระค่าบริการ
6. ในฐานะ Platform Admin ฉันต้องการ login ผ่าน Platform app แยกต่างหากจาก Tenant app เพื่อแยก session และ permission อย่างชัดเจน

### Tenant Admin (เจ้าของร้าน)

7. ในฐานะ Tenant Admin ฉันต้องการสร้างสาขาใหม่ได้ภายในขีดจำกัดของ plan เพื่อขยายธุรกิจ
8. ในฐานะ Tenant Admin ฉันต้องการสร้าง User ใหม่ในระบบ พร้อมกำหนด role (Sale Lead / Sale) และสาขาที่สังกัด เพื่อให้พนักงานเข้าถึงระบบได้
9. ในฐานะ Tenant Admin ฉันต้องการเพิ่มสินค้าพร้อมกำหนดราคาแยกตามประเภท (เงินสด / รายวัน / รายสัปดาห์ / รายเดือน) และกำหนดเงินดาวน์ เพื่อให้ Sale สร้างสัญญาได้ถูกต้อง
10. ในฐานะ Tenant Admin ฉันต้องการกำหนด commission rate ให้ Sale แต่ละคนแยกระหว่างยอดผ่อนและยอดเงินสด เพื่อให้ Sale มี incentive ติดตามหนี้
11. ในฐานะ Tenant Admin ฉันต้องการกำหนด commission rate สำหรับ Sale Lead แบบ override commission เพื่อให้ Sale Lead ดูแลทีมอย่างมีประสิทธิภาพ
12. ในฐานะ Tenant Admin ฉันต้องการตั้ง stock สินค้าแต่ละสาขาได้ เพื่อควบคุมปริมาณสินค้าคงเหลือ
13. ในฐานะ Tenant Admin ฉันต้องการกำหนด contract limit ให้ลูกค้าแต่ละคน เพื่อควบคุมความเสี่ยงในการให้สินเชื่อ
14. ในฐานะ Tenant Admin ฉันต้องการ suspend ลูกค้าที่ค้างชำระ เพื่อป้องกันการสร้างสัญญาใหม่จนกว่าจะชำระหนี้ครบ
15. ในฐานะ Tenant Admin ฉันต้องการยกเลิกสัญญาผ่อนได้ พร้อมให้ระบบคืน stock อัตโนมัติ เพื่อจัดการกรณีพิเศษที่ Sale ทำไม่ได้
16. ในฐานะ Tenant Admin ฉันต้องการดู dashboard ยอดขายรวมทุกสาขา commission ทั้งหมด stock ทุกสาขา และรายการลูกค้าค้างชำระ เพื่อตัดสินใจเชิงธุรกิจได้รวดเร็ว
17. ในฐานะ Tenant Admin ฉันต้องการดูรายงานแยกประเภทผ่อน daily/weekly/monthly เพื่อวิเคราะห์ portfolio สินเชื่อ

### Sale Lead

18. ในฐานะ Sale Lead ฉันต้องการดูยอดขายของทีมทั้งหมดในสาขาที่รับผิดชอบ เพื่อติดตามผลงาน
19. ในฐานะ Sale Lead ฉันต้องการดู commission ของตัวเองและของ Sale ในทีม เพื่อตรวจสอบค่าตอบแทน
20. ในฐานะ Sale Lead ฉันต้องการดูรายการลูกค้าที่ค้างชำระในสาขา เพื่อสั่งการให้ Sale ติดตาม

### Sale

21. ในฐานะ Sale ฉันต้องการสร้างข้อมูลลูกค้าใหม่ในระบบ เพื่อเริ่มกระบวนการสร้างสัญญา
22. ในฐานะ Sale ฉันต้องการสร้างสัญญาผ่อนให้ลูกค้า โดยเลือกสินค้า ประเภทการผ่อน และให้ระบบคำนวณตารางชำระให้อัตโนมัติ เพื่อลดข้อผิดพลาดในการคำนวณ
23. ในฐานะ Sale ฉันต้องการพิมพ์เอกสารสัญญาผ่อนชำระพร้อมตารางงวดทั้งหมดหลังสร้างสัญญา เพื่อให้ลูกค้าเซ็นรับทราบเงื่อนไขก่อนรับสินค้า
24. ในฐานะ Sale ฉันต้องการบันทึกการรับเงินสดจากลูกค้าสำหรับงวดที่ระบุ เพื่อให้ระบบ approve payment และคำนวณ commission ให้ทันที
25. ในฐานะ Sale ฉันต้องการออกใบเสร็จรับเงินให้ลูกค้าทันทีหลัง approve การชำระเงินสดที่สาขา เพื่อให้ลูกค้ามีหลักฐานการชำระที่ถูกต้อง
25. ในฐานะ Sale ฉันต้องการ approve หรือ reject สลิปโอนเงินที่ลูกค้าส่งมาผ่าน LINE เพื่อยืนยันการชำระเงิน
26. ในฐานะ Sale ฉันต้องการดูรายการลูกค้าที่ต้องเก็บเงินวันนี้ เพื่อวางแผนการทำงานประจำวัน
27. ในฐานะ Sale ฉันต้องการดู commission ของตัวเองทั้งหมด เพื่อตรวจสอบค่าตอบแทนที่ได้รับ
28. ในฐานะ Sale ฉันต้องการดูสัญญาที่สร้างเองทั้งหมด พร้อมสถานะ เพื่อติดตามลูกค้าในมือ

### Customer (ลูกค้า)

29. ในฐานะ Customer ฉันต้องการดูสัญญาผ่อนทั้งหมดของฉันผ่าน LINE LIFF โดยไม่ต้องติดตั้ง app เพื่อตรวจสอบยอดหนี้ได้สะดวก
30. ในฐานะ Customer ฉันต้องการดูงวดที่ยังไม่ได้ชำระและวันครบกำหนด เพื่อไม่ให้เกินกำหนดจนเสียค่าปรับ
31. ในฐานะ Customer ฉันต้องการส่งสลิปโอนเงินผ่าน LINE LIFF เพื่อรายงานการชำระเงินโดยไม่ต้องมาที่ร้าน
32. ในฐานะ Customer ฉันต้องการรับสำเนาสัญญาผ่อนชำระพร้อมตารางงวดทั้งหมด เพื่อทราบภาระผูกพันและวันครบกำหนดแต่ละงวด
33. ในฐานะ Customer ฉันต้องการจ่ายเงินสดที่สาขาและรับใบเสร็จรับเงินทันที เพื่อมีหลักฐานการชำระเงินที่ตรวจสอบได้
33. ในฐานะ Customer ฉันต้องการดูประวัติการชำระเงินทั้งหมดของสัญญา เพื่อตรวจสอบยอดที่จ่ายไปแล้ว
34. ในฐานะ Customer ฉันต้องการรับการแจ้งเตือนผ่าน LINE เมื่อใกล้ถึงวันครบกำหนดชำระ เพื่อเตรียมเงินได้ทันเวลา
35. ในฐานะ Customer ฉันต้องการรับใบปิดหนี้ผ่าน LINE เมื่อชำระครบทุกงวด เพื่อเป็นหลักฐานว่าสัญญาเสร็จสิ้น

### ระบบอัตโนมัติ

34. ในฐานะระบบ ฉันต้องการคำนวณค่าปรับ (Late Fee) อัตโนมัติเมื่อลูกค้าค้างชำระเกิน threshold ที่ Admin กำหนด เพื่อลดภาระ manual ของ Sale
35. ในฐานะระบบ ฉันต้องการ mark สัญญาเป็น Defaulted อัตโนมัติเมื่อค้างชำระเกิน threshold เพื่อระงับการสร้างสัญญาใหม่
36. ในฐานะระบบ ฉันต้องการ mark สัญญาเป็น Completed อัตโนมัติเมื่อ payment งวดสุดท้ายถูก approve เพื่อไม่ต้องให้ Admin ปิดสัญญาด้วยตัวเอง
37. ในฐานะระบบ ฉันต้องการลด stock อัตโนมัติเมื่อ approve เงินดาวน์ และคืน stock อัตโนมัติเมื่อยกเลิกสัญญา เพื่อให้ stock ตรงกับความเป็นจริงเสมอ
38. ในฐานะระบบ ฉันต้องการ lock Tenant ที่ subscription หมดอายุผ่าน middleware เพื่อป้องกันการใช้งานโดยไม่ชำระค่าบริการ

---

## Implementation Decisions

### Architecture

- **Multi-tenancy**: Row-level isolation ด้วย `tenant_id` ใน every table — NestJS decorator inject `tenantId` อัตโนมัติทุก query (ADR-0003)
- **Dual JWT**: แยก secret สำหรับ Platform Admin และ Tenant User — ป้องกันการปนกันระหว่าง 2 ระบบ
- **Global JwtAuthGuard + @Public() decorator**: Guard ปิดทุก route โดย default; เฉพาะ `/auth/*` เปิดด้วย @Public()
- **Subscription gate**: SubscriptionGuard ตรวจ `tenant.isActive` และ `subscriptionExpiresAt` ทุก request ของ Tenant

### Backend Modules (NestJS)

| Module | สถานะ | หมายเหตุ |
|--------|--------|----------|
| Auth (Tenant + Platform) | สมบูรณ์ | JWT dual-secret |
| Platform Plans | สมบูรณ์ | CRUD |
| Platform Tenants | สมบูรณ์ | CRUD + subscription extend |
| Branches | สมบูรณ์ | CRUD |
| Users | สมบูรณ์ | CRUD + role management |
| Products | สมบูรณ์ | 5 price fields: cashPrice, downPayment, dailyPrice, weeklyPrice, monthlyPrice |
| Stock | สมบูรณ์ | set / adjust / decrement-on-down-payment / increment-on-cancel |
| Customers | สมบูรณ์ | suspend / unsuspend / set contract limit |
| Contracts | สมบูรณ์ | create ด้วย transaction (contract + schedule), cancel |
| Payments | สมบูรณ์ | cash record, slip submit, approve, reject |
| Commissions | สมบูรณ์ | คำนวณจากยอดเก็บจริง (ADR-0002) |
| Jobs (Late Fee + Notification) | ร่างแล้ว | Processor มีอยู่ แต่ logic ยังไม่สมบูรณ์ |

### Frontend — Tenant App (Vue 3 + Pinia)

**Field mismatches ที่ต้องแก้ไข:**

| หน้า | ปัญหา | การแก้ไข |
|------|--------|----------|
| ProductsPage.vue | Form ใช้ `price` field เดียว | เปลี่ยนเป็น 5 fields: cashPrice, downPayment, dailyPrice, weeklyPrice, monthlyPrice |
| PaymentsPage.vue | Cash form ส่ง `contractId + amount` | แก้เป็น `paymentId` ตาม RecordCashDto; ต้องเลือก Payment จาก list ไม่ใช่ Contract |
| PaymentsPage.vue | Slip form ส่ง `contractId + amount + slipUrl` | แก้เป็น `paymentId + slipImageUrl` ตาม SubmitSlipDto |

**Dashboard:** ปัจจุบันแสดงแค่ shortcut link — ต้องเพิ่ม KPI cards จาก API:
- Admin: ยอดขายรวม, commission รวม, สัญญาค้างชำระ, stock รวม
- Sale Lead: ยอดทีม, commission ทีม
- Sale: สัญญาของตัวเอง, งวดที่ต้องเก็บวันนี้

### การคำนวณ Commission (ADR-0002)

Commission คำนวณเมื่อ Payment ถูก approve เท่านั้น (ไม่ใช่วันสร้างสัญญา):
- **Sale**: `payment.amount × sale.commissionRate`
- **Sale Lead**: `payment.amount × saleLead.overrideCommissionRate` (คำนวณจาก Sale ทุกคนในทีม)
- Rate แยกระหว่าง `installmentRate` และ `cashRate` ตาม `paymentType`

### Schedule ที่ระบบสร้างอัตโนมัติ

```
DAILY:   30 งวด × dailyPrice  + downPayment
WEEKLY:  12 งวด × weeklyPrice + downPayment
MONTHLY: 12 งวด × monthlyPrice + downPayment
CASH:     1 งวด × cashPrice (ไม่มี downPayment แยก)
```

### LINE LIFF Integration

- Customer activate account ผ่าน LINE LIFF ด้วย LINE userId
- ส่งสลิปผ่าน LIFF — `slipImageUrl` เก็บใน Payment record
- Notification ส่งผ่าน LINE Messaging API เมื่อใกล้ครบกำหนดและเมื่อปิดสัญญา
- ตัว LIFF app แยกออกจาก Tenant app (channel ลูกค้าเท่านั้น)

### Subscription Manual Payment (ADR-0004)

Platform Admin approve และ extend subscription ด้วยตัวเองหลัง Tenant โอนเงิน — ไม่ใช้ payment gateway ใน v1 เพราะจำนวน Tenant ยังน้อย

### Database Schema

- ทุก table มี `tenantId` ยกเว้น `PlatformAdmin` และ `SubscriptionPlan`
- `Contract` มี status enum: `PENDING_DOWN_PAYMENT → ACTIVE → COMPLETED / CANCELLED / DEFAULTED`
- `Payment` มี status enum: `PENDING → APPROVED / REJECTED` และ method enum: `CASH / TRANSFER_SLIP` และ field `receiptNumber` (nullable, set เมื่อ approve)
- `Commission` link ไปยัง `Payment` และ `User` — ไม่ได้ link กับ Contract โดยตรง
- `receiptNumber` format: `REC-{YYYYMMDD}-{5 หลัก}` — unique ต่อ Tenant, สร้างอัตโนมัติเมื่อ approve

---

## Testing Decisions

### หลักการทดสอบที่ดี

ทดสอบ **external behavior** เท่านั้น ไม่ใช่ implementation details:
- ทดสอบผลลัพธ์ของ service method (return value, side effects บน database)
- ไม่ทดสอบว่า private method ถูกเรียกหรือไม่
- ใช้ actual database (test DB) สำหรับ integration test ไม่ใช่ mock Prisma

### โมดูลที่ต้องมี Unit Tests

| Module | สิ่งที่ทดสอบ |
|--------|-------------|
| ContractsService.buildSchedule | ตารางชำระถูกต้องสำหรับ DAILY/WEEKLY/MONTHLY/CASH |
| CommissionsService.calculateAndInsert | commission ของ Sale และ Sale Lead ถูกต้องตาม rate |
| PaymentsService.recordCash | approve → stock ลด → commission สร้าง → contract เป็น ACTIVE |
| PaymentsService.approve (slip) | approve → ถ้างวดสุดท้าย contract เป็น COMPLETED |
| CustomersService.validateCanContract | ปฏิเสธถ้า suspend หรือเกิน contract limit |
| StockService | ลดเมื่อ approve down payment, คืนเมื่อ cancel |

### Integration Tests (API Endpoints)

| Scenario | สิ่งที่ตรวจ |
|----------|------------|
| POST /auth/login | ได้ JWT token กลับมา |
| POST /contracts (no stock) | 400 Bad Request |
| POST /contracts (customer suspended) | 400 Bad Request |
| POST /payments/cash → GET /contracts/:id | status เปลี่ยนเป็น ACTIVE หลัง approve down payment |
| Approve payment งวดสุดท้าย | contract status เป็น COMPLETED |
| Tenant ที่ subscription หมดอายุ | 403 Forbidden ทุก endpoint |

### E2E Tests (Playwright)

Critical user flows:
1. Login → สร้าง Product → สร้าง Contract → บันทึกเงินสด → ตรวจ Commission
2. Login → ส่ง slip → approve slip → ตรวจ stock ลด
3. Platform Admin: สร้าง Tenant → extend subscription → login เป็น Tenant

---

## Out of Scope (v1)

- **Payment Gateway**: Tenant ชำระ subscription ผ่านโอนเงิน ไม่ใช่ Stripe/Omise
- **Refund**: การยกเลิกสัญญาไม่มีการคืนเงินในระยะแรก
- **Auto Trial Expiry**: Trial ไม่มี auto-expire — Platform Admin extend ด้วยตัวเอง
- **Mobile App**: Customer channel ใช้ LINE LIFF เท่านั้น ไม่มี native app
- **Multi-currency**: รองรับเฉพาะ THB
- **Export/Import**: ไม่มี Excel export ใน v1
- **Advanced Reporting**: BI dashboard และ custom report อยู่นอกขอบเขต v1

---

## Further Notes

- **ADR-0001**: Vue + NestJS + PostgreSQL — เลือกเพราะ team มีประสบการณ์ NestJS และ PostgreSQL รองรับ complex report query
- **ADR-0002**: Commission คำนวณจากยอดเก็บจริง ไม่ใช่ยอดขาย — ทำให้ Sale มี incentive ติดตามหนี้
- **ADR-0003**: Row-level multi-tenancy ด้วย tenant_id — ง่ายกว่า schema-per-tenant และ Prisma support ดีกว่า
- **ADR-0004**: Manual subscription payment — คุ้มกว่า payment gateway สำหรับจำนวน Tenant น้อย
- **Stock timing**: Stock ลดตอน approve **เงินดาวน์** (ไม่ใช่ตอนสร้างสัญญา) เพราะสินค้าออกจากร้านเมื่อลูกค้าชำระเงินดาวน์แล้วเท่านั้น
- **Warranty**: activate อัตโนมัติเมื่อ Contract เป็น COMPLETED ไม่มีค่าใช้จ่ายเพิ่มให้ลูกค้า
- **Defaulted threshold**: กำหนดใน `tenant.defaultThreshold` เป็นจำนวนวันค้างชำระ — Admin ปรับได้ต่อ Tenant

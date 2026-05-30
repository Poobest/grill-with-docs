# #06 — Payments + Commission Calculation

**Type:** AFK
**Blocked by:** #05

---

## What to build

Sale บันทึกการรับเงินสดหรือ approve สลิปโอนเงิน เมื่อ approve payment ระบบทำ side effects อัตโนมัติ: ลด stock (กรณีเงินดาวน์), คำนวณ commission ให้ Sale และ Sale Lead, mark contract เป็น ACTIVE หรือ COMPLETED และ **ออกใบเสร็จรับเงินทุกครั้งที่ชำระ**

Commission คำนวณจากยอดเก็บจริงเท่านั้น ไม่ใช่ยอดสัญญา (ADR-0002):
- Sale: `payment.amount × sale.installmentRate` (หรือ cashRate ถ้า CASH)
- Sale Lead: `payment.amount × saleLead.overrideRate` (จากทุก Sale ในทีม)

### Receipt (ใบเสร็จรับเงิน)

ทุกการชำระเงินที่ approved ต้องออกใบเสร็จได้เสมอ ไม่ว่าจะชำระสด (ที่สาขา) หรือโอนเงิน:

| Field | ค่า |
|-------|-----|
| เลขที่ใบเสร็จ | `REC-{YYYYMMDD}-{5 หลัก}` (unique ต่อ Tenant) |
| วันที่ออก | approvedAt |
| ชื่อลูกค้า | customer.name |
| เลขสัญญา | contract.contractNumber |
| งวดที่ | payment.installmentNo |
| จำนวนเงิน | payment.amount |
| วิธีชำระ | CASH / TRANSFER |
| ชื่อ Sale | user.name |
| ชื่อสาขา | branch.name |

## Acceptance criteria

- [ ] `GET /api/payments` — ดูรายการ payment พร้อม filter (contractId, status)
- [ ] `POST /api/payments/cash` — รับ `paymentId` เดียว → approve ทันที (Sale/Admin)
- [ ] `POST /api/payments/slip` — รับ `paymentId` + `slipImageUrl` → สถานะรอ approve
- [ ] `PATCH /api/payments/:id/approve` — approve สลิป (Sale/Admin)
- [ ] `PATCH /api/payments/:id/reject` — reject สลิป (Sale/Admin)
- [ ] เมื่อ approve เงินดาวน์: stock ลด 1, contract status → ACTIVE, downPaymentPaid = true
- [ ] เมื่อ approve payment งวดสุดท้าย: contract status → COMPLETED, warrantyActive = true
- [ ] Commission สร้างทันทีเมื่อ approve — ทั้ง Sale และ Sale Lead ใน 1 transaction
- [ ] `GET /api/payments/:id/receipt` — ดึงข้อมูลใบเสร็จของ payment ที่ approved (Sale/Admin)
- [ ] ระบบสร้าง `receiptNumber` อัตโนมัติรูปแบบ `REC-{YYYYMMDD}-{5 หลัก}` เมื่อ payment ถูก approve
- [ ] Receipt มีข้อมูลครบ: เลขที่ใบเสร็จ, วันที่, ชื่อลูกค้า, เลขสัญญา, งวดที่, จำนวนเงิน, วิธีชำระ, ชื่อ Sale, ชื่อสาขา
- [ ] `GET /api/commissions` — ดู commission ตาม role (Sale เห็นของตัวเอง, Admin เห็นทั้งหมด)
- [ ] Tenant app หน้า Payments: แสดง pending payments ทั้งหมด, ปุ่ม "รับเงินสด" (เลือก payment จาก list), ปุ่ม approve/reject สลิป
- [ ] Tenant app หน้า Payments: หลัง approve สำเร็จ — แสดงใบเสร็จและมีปุ่ม "พิมพ์ใบเสร็จ" (browser print)
- [ ] Tenant app หน้า Commissions: แสดงรายการ commission พร้อมยอดรวม

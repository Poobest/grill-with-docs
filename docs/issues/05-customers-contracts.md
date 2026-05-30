# #05 — Customers + Contracts (Installment Contracts)

**Type:** AFK
**Blocked by:** #04

---

## What to build

Sale สร้างลูกค้าและสัญญาผ่อนชำระ ระบบคำนวณตารางงวดชำระอัตโนมัติตามประเภท (DAILY/WEEKLY/MONTHLY/CASH) และสร้าง Payment records ทั้งหมดใน transaction เดียว หลังสร้างสัญญา Sale **พิมพ์เอกสารสัญญา** ให้ลูกค้าเซ็น

ตาราง schedule อัตโนมัติ:
- DAILY: 30 งวด × dailyPrice + downPayment
- WEEKLY: 12 งวด × weeklyPrice + downPayment
- MONTHLY: 12 งวด × monthlyPrice + downPayment
- CASH: 1 งวด × cashPrice (ไม่มี downPayment แยก)

### เอกสารสัญญาผ่อนชำระ (Contract Document)

| Section | ข้อมูล |
|---------|--------|
| หัวเรื่อง | ชื่อ Tenant, ชื่อสาขา, เลขสัญญา, วันที่ทำสัญญา |
| ข้อมูลลูกค้า | ชื่อ-นามสกุล, เบอร์โทร |
| รายละเอียดสินค้า | ชื่อสินค้า, ราคา, เงินดาวน์ |
| เงื่อนไขผ่อน | ประเภท (รายวัน/สัปดาห์/เดือน), จำนวนงวด, ยอดต่องวด |
| ยอดรวม | ราคารวมทั้งสัญญา (downPayment + งวด × จำนวนงวด) |
| ตารางงวด | งวดที่, วันครบกำหนด, ยอดที่ต้องชำระ (ทุกงวด) |
| ผู้รับรอง | ชื่อ Sale, ช่องเซ็นชื่อลูกค้า, ช่องเซ็นชื่อพยาน |

## Acceptance criteria

- [ ] `GET/POST/PATCH /api/customers` — CRUD ลูกค้า
- [ ] `POST /api/customers/:id/suspend` และ `unsuspend` — ระงับ/คืนสิทธิ์ลูกค้า
- [ ] `PATCH /api/customers/:id/limit` — กำหนด contractLimit รายลูกค้า
- [ ] `GET/POST /api/contracts` — ดูรายการและสร้างสัญญา
- [ ] CreateContractDto รับเพียง: `customerId`, `productId`, `branchId`, `paymentType`
- [ ] การสร้างสัญญาตรวจ: ลูกค้าไม่ถูก suspend, ไม่เกิน contractLimit, stock > 0
- [ ] สร้างสัญญา → สร้าง Payment งวดดาวน์ (dueDate = วันนี้) + Payment งวดถัดไปทั้งหมดใน 1 transaction
- [ ] `GET /api/contracts/:id/document` — ดึงข้อมูลสัญญาพร้อมตารางงวดครบทุกงวด (Sale/Admin)
- [ ] Contract document มีข้อมูลครบ: ข้อมูลลูกค้า, สินค้า, เงื่อนไขผ่อน, ยอดรวม, ตารางงวดทุกงวด
- [ ] `DELETE /api/contracts/:id/cancel` — ยกเลิกสัญญา (Admin เท่านั้น)
- [ ] Tenant app หน้า Customers: list, สร้าง, suspend, กำหนด limit
- [ ] Tenant app หน้า Contracts: list พร้อม filter status, สร้างสัญญา (เลือก customer/product/branch/paymentType)
- [ ] Tenant app หน้า Contracts: หลังสร้างสัญญาสำเร็จ — แสดงเอกสารสัญญาและมีปุ่ม "พิมพ์สัญญา" (browser print) ทันที
- [ ] Tenant app หน้า Contract detail: ปุ่ม "พิมพ์สัญญา" เปิดใช้งานได้ตลอดอายุสัญญา

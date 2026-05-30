# #04 — Products + Stock

**Type:** AFK
**Blocked by:** #03

---

## What to build

Admin จัดการสินค้าพร้อมราคา 5 ประเภทและจัดการ stock แต่ละสาขา Stock ลดอัตโนมัติเมื่อ approve เงินดาวน์ และคืนอัตโนมัติเมื่อยกเลิกสัญญา (side effects อยู่ใน Payment และ Contract slice)

## Acceptance criteria

- [ ] `GET/POST/PATCH/DELETE /api/products` — CRUD สินค้า
- [ ] Product มีฟิลด์: `name`, `description`, `cashPrice`, `downPayment`, `dailyPrice`, `weeklyPrice`, `monthlyPrice`, `isActive`
- [ ] ทุก price field เป็น Decimal (ไม่ใช่ Float) ใน Prisma schema
- [ ] `GET /api/branches/:id/stock` — ดู stock ทุกสินค้าของสาขา
- [ ] `POST /api/branches/:id/stock/set` — ตั้ง stock (Admin/Sale Lead)
- [ ] `PATCH /api/branches/:id/stock/adjust` — ปรับ stock +/- (Admin/Sale Lead)
- [ ] Tenant app หน้า Products: แสดงและแก้ไขสินค้าพร้อม **ราคาทั้ง 5 ประเภท** และเงินดาวน์
- [ ] Tenant app หน้า Stock: ดูและปรับ stock แยกต่อสาขา
- [ ] Product ที่ `isActive = false` ไม่ปรากฏในหน้าสร้างสัญญา

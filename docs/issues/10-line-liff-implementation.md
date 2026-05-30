# #10 — LINE LIFF: Customer Channel Implementation

**Type:** AFK
**Blocked by:** #09 (architecture decision), #06 (payments flow)

---

## What to build

LIFF app สำหรับลูกค้า เปิดใน LINE app ได้โดยตรง ไม่ต้องติดตั้ง app เพิ่ม ลูกค้าดูสัญญา งวดชำระ ประวัติ และส่งสลิปได้

## Acceptance criteria

- [ ] ลูกค้าเปิด LIFF link ใน LINE → login ด้วย LINE account อัตโนมัติ (LIFF SDK handle)
- [ ] หน้า "สัญญาของฉัน" — แสดงสัญญาผ่อนทั้งหมดของลูกค้า พร้อมสถานะ
- [ ] หน้า "งวดชำระ" — แสดงงวดที่ยังไม่ได้ชำระ วันครบกำหนด และงวดที่ชำระแล้ว
- [ ] หน้า "ส่งสลิป" — อัปโหลดรูปสลิป → call `POST /api/payments/slip` ด้วย paymentId + slipImageUrl
- [ ] API endpoint `POST /api/auth/liff` รับ `lineUserId` → คืน JWT สำหรับ customer
- [ ] Customer record มี `lineUserId` field สำหรับ link กับ LINE account
- [ ] ลูกค้าที่ยังไม่ activate (ไม่มี lineUserId) เห็นหน้า onboarding พร้อมคำแนะนำ
- [ ] UI รองรับ mobile screen (375px) เป็นหลัก

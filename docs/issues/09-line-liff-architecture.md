# #09 — LINE LIFF: Architecture Decision (HITL)

**Type:** HITL — ต้องการการตัดสินใจจากทีม
**Blocked by:** None — สามารถเริ่มพิจารณาได้ทันที

---

## What to decide

ก่อน implement LINE LIFF customer channel ต้องตัดสินใจประเด็นต่อไปนี้:

### ประเด็นที่ 1: LIFF app อยู่ที่ไหน?

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---------|-------|---------|
| แยก repo | ขนาดเล็ก deploy ง่าย | ต้อง share type กันยาก |
| อยู่ใน monorepo เป็น `apps/liff` | share type กับ api ได้ | monorepo ใหญ่ขึ้น |

### ประเด็นที่ 2: Customer auth flow

- ลูกค้าเข้า LIFF ผ่าน LINE app → ได้ `liff.getProfile()` → lineUserId
- ระบบ link lineUserId กับ Customer record อย่างไร?
  - Option A: Sale สร้าง customer แล้วให้ลูกค้า activate เองผ่าน LIFF (link by phone?)
  - Option B: ส่ง invite link ให้ลูกค้าผ่าน LINE → activate ด้วย OTP

### ประเด็นที่ 3: Slip upload

- ลูกค้าส่งรูปสลิปผ่าน LIFF → เก็บที่ไหน?
  - Option A: Upload ไปยัง LINE Content API แล้วเก็บ URL
  - Option B: Upload ไปยัง storage (S3/GCS) แล้วเก็บ URL ใน `payment.slipImageUrl`

## Acceptance criteria

- [ ] ทีมตัดสินใจ LIFF app structure (separate หรือ monorepo)
- [ ] ทีมตัดสินใจ customer activation flow
- [ ] ทีมตัดสินใจ slip image storage
- [ ] สร้าง LINE LIFF app ใน LINE Developers Console และมี `LIFF_ID`
- [ ] มี `LINE_CHANNEL_ACCESS_TOKEN` และ `LINE_CHANNEL_SECRET` พร้อมใช้

## Blocked by

None - can start immediately

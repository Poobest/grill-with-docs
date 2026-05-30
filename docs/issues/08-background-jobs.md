# #08 — Background Jobs: Late Fee + LINE Notification

**Type:** AFK
**Blocked by:** #06

---

## What to build

Background jobs ที่ทำงานอัตโนมัติผ่าน Bull + Redis:
1. **Late Fee job**: คิดค่าปรับและ mark สัญญาเป็น DEFAULTED เมื่อค้างชำระเกิน threshold
2. **Notification job**: ส่งแจ้งเตือนผ่าน LINE Messaging API เมื่อใกล้ครบกำหนดและเมื่อปิดสัญญา

## Acceptance criteria

- [ ] Late Fee job ทำงานทุกวัน (cron: `0 8 * * *`)
- [ ] Late Fee job หา payment ที่ `status = PENDING` และ `dueDate < today - threshold`
- [ ] Late Fee job สร้าง LateFee record สำหรับแต่ละ payment ที่เกินกำหนด
- [ ] Late Fee job mark contract เป็น `DEFAULTED` และ suspend customer อัตโนมัติเมื่อค้างเกิน `tenant.defaultThreshold` วัน
- [ ] Notification job ส่งแจ้งเตือนล่วงหน้า 1 วันก่อนครบกำหนดชำระ (ถ้ามี LINE userId)
- [ ] Notification job ส่งใบปิดหนี้ผ่าน LINE เมื่อ contract status เปลี่ยนเป็น COMPLETED
- [ ] Job ทั้งสองมี error handling — ถ้า LINE API ล้มเหลว ไม่ affect database transaction
- [ ] ถ้าไม่มี `LINE_CHANNEL_ACCESS_TOKEN` ใน env → notification job log warning แล้วข้ามโดยไม่ throw

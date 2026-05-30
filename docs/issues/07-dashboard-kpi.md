# #07 — Dashboard KPI (Role-based)

**Type:** AFK
**Blocked by:** #06

---

## What to build

Dashboard หน้าแรกแสดงตัวเลขจริงตาม role ของผู้ใช้ ไม่ใช่แค่ shortcut links

| Role | KPI ที่เห็น |
|------|------------|
| Admin | ยอดขายรวมทุกสาขา, commission รวม, สัญญาค้างชำระ, stock ต่ำ |
| Sale Lead | ยอดทีม, commission ตัวเองและ Sale ในทีม, ลูกค้าค้างชำระของสาขา |
| Sale | สัญญาของตัวเอง, commission ตัวเอง, งวดที่ต้องเก็บวันนี้ |

## Acceptance criteria

- [ ] `GET /api/dashboard` — คืน KPI object ตาม role ของ JWT
- [ ] Admin KPI: totalRevenue (30 วันล่าสุด), totalCommission, overdueContracts count, lowStockBranches
- [ ] Sale Lead KPI: teamRevenue, ownCommission, teamCommission, overdueCustomers ในสาขาที่ดูแล
- [ ] Sale KPI: myContracts count, myCommission, paymentsCollectToday count
- [ ] Tenant app DashboardPage แสดง KPI cards จาก API จริง (ไม่ใช่ placeholder)
- [ ] KPI cards แสดงยอดเงินเป็น locale format (฿1,234,567)
- [ ] Loading state ระหว่างดึงข้อมูล

# Issues Index — Installment SaaS (Grill-with-Docs)

รายการ issue ทั้งหมดสำหรับ rebuild จากต้น อ้างอิงจาก PRD: `docs/prd/installment-saas-v1.md`

## ลำดับการ implement

```
สัปดาห์ 1
  #00 Foundation Scaffold + Schema    ← เสร็จแล้ว (skeleton พร้อม)
  #01 Auth Dual JWT
  #03 Branches + Users                ← ทำคู่กับ #02 ได้
  #02 Platform Plans + Tenants        ← ทำคู่กับ #03 ได้

สัปดาห์ 2
  #04 Products + Stock
  #05 Customers + Contracts
  #11 Tests                           ← เริ่มได้จาก #05

สัปดาห์ 3
  #06 Payments + Commissions
  #07 Dashboard KPI

สัปดาห์ 4
  #08 Background Jobs (Late Fee + Notification)

สัปดาห์ 5+
  #09 LINE LIFF Architecture (HITL)
  #10 LINE LIFF Implementation
```

## รายการ Issues

| # | ชื่อ | Type | Blocked by | Status |
|---|------|------|-----------|--------|
| [#00](./00-foundation-scaffold.md) | Foundation: Monorepo Scaffold + Schema | AFK | — | ✅ Done |
| [#01](./01-auth-dual-jwt.md) | Auth: Dual JWT | AFK | #00 | 🟡 Tenant JWT done; platform JWT + guards pending |
| [#02](./02-platform-plans-tenants.md) | Platform: Plans + Tenants | AFK | #01 | 🔲 Todo |
| [#03](./03-branches-users.md) | Tenant: Branches + Users | AFK | #01 | ✅ Done (API + UI) |
| [#04](./04-products-stock.md) | Products + Stock | AFK | #03 | ✅ Done (API + UI) |
| [#05](./05-customers-contracts.md) | Customers + Contracts | AFK | #04 | ✅ Done (API + UI + detail) |
| [#06](./06-payments-commissions.md) | Payments + Commissions | AFK | #05 | ✅ Done (collect-today + receipts) |
| [#07](./07-dashboard-kpi.md) | Dashboard KPI | AFK | #06 | ✅ Done |
| [#08](./08-background-jobs.md) | Background Jobs | AFK | #06 | 🔲 Todo |
| [#09](./09-line-liff-architecture.md) | LINE LIFF Architecture | HITL | — | 🔲 Todo |
| [#10](./10-line-liff-implementation.md) | LINE LIFF Implementation | AFK | #09, #06 | 🔲 Todo |
| [#11](./11-tests.md) | Unit + Integration Tests | AFK | #05 | 🟡 40 tests (23 unit + 17 integration) |

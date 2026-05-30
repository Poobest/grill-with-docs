# #11 — Unit + Integration Tests (Business Logic)

**Type:** AFK
**Blocked by:** #05 (ต้องมี contracts/payments logic ก่อน)
**ทำคู่กับ:** #05, #06, #07 ได้เลย

---

## What to build

Test suite สำหรับ business logic ที่ซับซ้อนที่สุดในระบบ ทดสอบ external behavior เท่านั้น ไม่ใช่ implementation details

### Unit Tests (Jest)

| Module | สิ่งที่ทดสอบ |
|--------|-------------|
| ContractsService | buildSchedule คืน schedule ถูกต้องสำหรับ DAILY/WEEKLY/MONTHLY/CASH |
| ContractsService | สร้างสัญญาล้มเหลวถ้า stock = 0 |
| ContractsService | สร้างสัญญาล้มเหลวถ้า customer ถูก suspend |
| ContractsService | สร้างสัญญาล้มเหลวถ้า customer เกิน contractLimit |
| CommissionsService | commission Sale คำนวณถูกต้องตาม installmentRate |
| CommissionsService | commission Sale Lead คำนวณถูกต้องตาม overrideRate |
| PaymentsService | approve เงินดาวน์ → stock ลด, contract เป็น ACTIVE |
| PaymentsService | approve งวดสุดท้าย → contract เป็น COMPLETED, warrantyActive = true |
| StockService | decrementOnDownPayment และ incrementOnCancellation |

### Integration Tests (Supertest + Test DB)

| Scenario | ผลที่คาดหวัง |
|----------|-------------|
| POST /api/auth/login (valid) | 200 + JWT token |
| POST /api/auth/login (wrong password) | 401 |
| POST /api/contracts (no stock) | 400 Bad Request |
| POST /api/payments/cash → GET /api/contracts/:id | contract status = ACTIVE |
| Tenant ที่ subscription หมดอายุ ทุก endpoint | 403 Forbidden |
| Platform token ใช้กับ Tenant endpoint | 401 |

## Acceptance criteria

- [ ] `pnpm test` รัน unit tests ทั้งหมดผ่าน
- [ ] `pnpm test:e2e` รัน integration tests ผ่าน (ต้องใช้ test database แยก)
- [ ] Coverage ≥ 80% สำหรับ ContractsService, PaymentsService, CommissionsService
- [ ] ไม่มี test ที่ทดสอบ private method โดยตรง — ทดสอบผ่าน public interface เท่านั้น
- [ ] Integration tests ใช้ transaction rollback หรือ truncate table ระหว่าง test cases

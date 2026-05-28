# Multi-tenancy ใช้ Row-level Isolation ด้วย tenant_id

ระบบเป็น SaaS ที่มีหลาย tenant (ร้านค้า) ทุก tenant อยู่ใน database เดียวกัน แยกด้วย `tenant_id` ในทุก table เลือก row-level เพราะ early-stage SaaS ยังไม่มี tenant จำนวนมาก, NestJS middleware inject `tenant_id` อัตโนมัติทุก query ได้, และ operational cost ต่ำกว่า schema-per-tenant หรือ database-per-tenant ทางเลือกที่ reject คือ schema-per-tenant ซึ่ง migration ซับซ้อนและ Prisma support ยังไม่ mature, และ database-per-tenant ซึ่ง infrastructure cost สูงเกินไปสำหรับระยะแรก

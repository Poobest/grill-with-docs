# Tech Stack: Vue + NestJS + PostgreSQL + Prisma + LINE LIFF

ระบบขายผ่อนชำระต้องการ relational data ที่ซับซ้อน (Contract → Payment → Commission → Sale → Branch), role-based access 4 ระดับ, background jobs (late fee, LINE notification), และ LINE LIFF integration สำหรับ customer channel เลือก Vue (Vite) + NestJS + PostgreSQL เพราะ team มีประสบการณ์ NestJS อยู่แล้ว, PostgreSQL รองรับ complex report query (daily/weekly/monthly installment), และ Vue เป็น stack ที่ตั้งใจใช้ตั้งแต่ต้น ไม่ได้เลือก MySQL เพราะ PostgreSQL มี window functions และ JSON support ที่ดีกว่าสำหรับ reporting

# Installment Sales System

SaaS platform สำหรับร้านค้าที่ขายสินค้าแบบผ่อนชำระและเงินสด มีหลายสาขาต่อร้าน แต่ละร้านคือ tenant แยกกัน จ่าย subscription รายเดือน

## Language

### Platform Layer

**Platform Admin**:
ทีมผู้พัฒนาระบบ ดูแล tenant ทั้งหมด จัดการ subscription และ billing ใช้งานผ่าน app แยกต่างหาก
_Avoid_: super admin, system admin

**Tenant**:
ร้านค้า 1 แห่งที่ subscribe ใช้ระบบ มี data แยกจาก tenant อื่นด้วย `tenant_id` subscription รายเดือน ถ้าไม่ต่อ tenant ถูก lock ไม่สามารถใช้งานได้
_Avoid_: organization, company, client

**Subscription**:
การสมัครใช้บริการรายเดือนของ tenant แบ่งเป็นหลาย plan โดย plan ต่างกันด้วยจำนวนสาขาและจำนวน user สูงสุด tenant โอนเงินแล้ว Platform Admin approve และ extend ด้วยตัวเอง ถ้าหมดอายุและไม่ต่อ ระบบ lock tenant อัตโนมัติ (database flag + API middleware)
_Avoid_: license, plan, membership

**Subscription Plan**:
ระดับการใช้งานที่กำหนด hard limit จำนวนสาขาสูงสุดและจำนวน user สูงสุดใน tenant นั้น Platform Admin กำหนด plan และราคา
_Avoid_: tier, package, pricing

**Trial**:
ช่วงทดลองใช้ที่ Platform Admin เปิดให้ tenant เป็นรายกรณี ไม่มี auto-expire logic แยก Platform Admin extend subscription ให้ด้วยตัวเอง
_Avoid_: free trial, demo period

### Tenant Layer

**Branch (สาขา)**:
หน่วยธุรกิจที่มีที่ตั้งเฉพาะภายใน tenant แต่ละสาขาบริหารโดย Sale Lead และมี Sale สังกัดอยู่
_Avoid_: ร้าน, outlet, location

**Tenant Admin (Admin)**:
เจ้าของร้าน/ผู้บริหาร tenant มีสิทธิ์ดูแลระบบทั้งหมดภายใน tenant ของตัวเอง กำหนดอัตรา commission ให้ Sale และ Sale Lead แต่ละคน
_Avoid_: superuser, manager, owner

**Sale Lead**:
ผู้บริหารทีมขาย คุมหลายสาขา รับ override commission จากยอดเก็บเงินจริงของ Sale ทุกคนในทีม
_Avoid_: branch manager, supervisor

**Sale**:
พนักงานขายประจำสาขาเดียว รับ commission จากยอดเก็บเงินจริงของตัวเอง อัตรา commission กำหนดโดย Admin เป็นรายบุคคล
_Avoid_: salesperson, agent, staff

**Commission**:
ค่าตอบแทนที่คำนวณจากยอดเงินที่เก็บได้จริง อัตราแยกระหว่างการขายผ่อนและการขายเงินสด กำหนดโดย Admin เป็นรายบุคคล
_Avoid_: bonus, incentive, ค่านาย

**Override Commission**:
Commission ที่ Sale Lead ได้รับจากยอดเก็บของ Sale ในทีม คำนวณแยกจาก commission ของ Sale
_Avoid_: team commission, group commission

**Installment Contract (สัญญาผ่อน)**:
ข้อตกลงระหว่างร้านและลูกค้า ระบุสินค้า เงินดาวน์ งวดชำระ (รายวัน/รายสัปดาห์/รายเดือน) และราคาต่องวด ราคาต่องวดตั้งโดย Admin ต่อสินค้า เงินดาวน์ตั้งโดย Admin ต่อสินค้าเช่นกัน
_Avoid_: order, agreement, hire purchase

**Down Payment (เงินดาวน์)**:
เงินที่ลูกค้าต้องชำระก่อนรับสินค้า กำหนดโดย Admin เป็นจำนวนคงที่ต่อสินค้า ไม่ใช่ % ของราคา
_Avoid_: deposit, เงินมัดจำ

**Payment (งวดชำระ)**:
การชำระเงิน 1 ครั้งตามสัญญาผ่อน ลูกค้าชำระได้ที่ร้านหรือโอนเงินแล้วส่งสลิปผ่าน LINE LIFF โดย Sale ต้อง approve สลิปก่อนระบบนับว่าชำระแล้ว Commission คำนวณเมื่อ Payment ได้รับการ approve
_Avoid_: installment, transaction, receipt

**Late Fee (ค่าปรับ)**:
ค่าธรรมเนียมที่ระบบคิดอัตโนมัติเมื่อลูกค้าค้างชำระเกินกำหนด
_Avoid_: penalty, fine, surcharge

**Customer (ลูกค้า)**:
บุคคลที่ซื้อสินค้าจากร้าน Sale สร้างข้อมูลเบื้องต้น ลูกค้า activate account ผ่าน LINE LIFF เอง ลูกค้า 1 คนมีสัญญาผ่อนพร้อมกันได้ตาม limit ที่ Admin กำหนด
_Avoid_: member, user, buyer

**Contract Limit**:
จำนวนสัญญาผ่อนที่ลูกค้า 1 คนมีได้พร้อมกัน กำหนดโดย Admin เป็นรายลูกค้า
_Avoid_: credit limit, quota

**Stock**:
จำนวนสินค้าที่มีในแต่ละสาขา จัดการโดย Admin และ Sale Lead ลดอัตโนมัติเมื่อ approve เงินดาวน์ (กรณีผ่อน) หรือเมื่อชำระเงินสด
_Avoid_: inventory, quantity

**Product (สินค้า)**:
สินค้าคงทน (electronics) ที่ขายในร้าน Admin กำหนดราคาต่องวดแยกตาม daily/weekly/monthly ราคาเงินสด เงินดาวน์ และ commission rate ต่อ product
_Avoid_: item, SKU, goods

**Warranty (ประกันสินค้า)**:
ประกันจาก third-party ที่แถมฟรีเมื่อซื้อสินค้า บังคับทุกสัญญาผ่อน ร้านบันทึกสถานะ active/inactive ต่อสัญญา ไม่มีค่าใช้จ่ายเพิ่มให้ลูกค้า
_Avoid_: insurance policy, guarantee

**Completed Contract (สัญญาปิด)**:
สัญญาที่ลูกค้าผ่อนครบทุกงวด ระบบ mark completed อัตโนมัติเมื่อ approve payment งวดสุดท้าย และส่งใบปิดหนี้ให้ลูกค้าผ่าน LINE
_Avoid_: closed, finished, paid off

**Cancelled Contract (สัญญายกเลิก)**:
สัญญาที่ถูกยกเลิกกลางคัน ทำได้โดย Admin เท่านั้น ระบบปรับ stock คืนอัตโนมัติ ไม่มี refund calculation ใน v1
_Avoid_: terminated, voided, returned

**Defaulted Contract (สัญญาผิดนัด)**:
สัญญาที่ลูกค้าค้างชำระเกิน threshold ที่ Admin กำหนด ระบบ mark สถานะอัตโนมัติและระงับ account ลูกค้า ลูกค้าไม่สามารถสร้างสัญญาใหม่ได้จนกว่าจะชำระหนี้ครบ
_Avoid_: bad debt, NPL, overdue contract

## Dashboards

| Role | ข้อมูลที่เห็น |
|------|--------------|
| Admin | ยอดขายรวมทุกสาขา, commission ทั้งหมด, stock ทุกสาขา, ลูกค้าค้างชำระ, รายงานผ่อนแยก daily/weekly/monthly |
| Sale Lead | ยอดขายทีม, commission ตัวเองและ Sale ในทีม, ลูกค้าค้างชำระของสาขา |
| Sale | สัญญาของตัวเอง, commission ตัวเอง, ลูกค้าที่ต้องเก็บเงินวันนี้ |
| Customer | สัญญาผ่อนของตัวเอง, งวดที่เหลือ, ประวัติการจ่าย (ผ่าน LINE LIFF) |

# Subscription ใช้ Manual Payment ไม่ใช่ Payment Gateway

Tenant จ่าย subscription โดยโอนเงินและแจ้ง Platform Admin ซึ่ง approve และ extend subscription ด้วยตัวเอง เลือก manual เพราะ B2B SaaS ที่จำนวน tenant ยังน้อยไม่คุ้มกับ complexity และ cost ของ payment gateway integration ทางเลือกที่ reject คือ Omise/Stripe ซึ่งเพิ่ม integration effort สูงและมี transaction fee ทุกเดือน ถ้าจำนวน tenant เติบโตถึงจุดที่ manual approve กลายเป็น bottleneck ค่อย migrate ไป payment gateway

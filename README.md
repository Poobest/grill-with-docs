# Installment SaaS — GrillWithDocs

ระบบบริหารจัดการสินเชื่อผ่อนชำระแบบ Multi-tenant SaaS สร้างด้วย NestJS + Vue 3 + PostgreSQL

## โครงสร้าง Project

```
grill-with-docs/
├── apps/
│   ├── api/          # NestJS REST API (port 3000)
│   ├── platform/     # Vue 3 Admin สำหรับ Platform Owner (port 5174)
│   └── tenant/       # Vue 3 App สำหรับ Tenant User (port 5175)
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

## เริ่มต้นใช้งาน

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d
```

### 3. Setup environment

```bash
cp apps/api/.env.example apps/api/.env
```

ค่า default ใน `.env` ใช้งานได้กับ Docker Compose โดยตรง:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/installment_saas?schema=public"
JWT_SECRET="change-me-in-production"
JWT_PLATFORM_SECRET="platform-change-me-in-production"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
LINE_CHANNEL_ACCESS_TOKEN=""
LINE_CHANNEL_SECRET=""
```

### 4. Run database migration

```bash
pnpm db:migrate
```

### 5. Seed demo data (optional)

```bash
pnpm db:seed
```

| Account | Email | Password |
|---------|-------|----------|
| Platform Admin | admin@platform.com | password123 |
| Tenant Admin | admin@demo.com | password123 |
| Sale Lead | lead@demo.com | password123 |
| Sale | sale@demo.com | password123 |

### 6. Start development servers

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Platform Admin
pnpm dev:platform

# Terminal 3 — Tenant App
pnpm dev:tenant
```

| App | URL |
|-----|-----|
| API | http://localhost:3000 |
| Platform Admin | http://localhost:5174 |
| Tenant App | http://localhost:5175 |

### 6. สร้าง Platform Admin ครั้งแรก

```bash
curl -X POST http://localhost:3000/auth/platform/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

จากนั้น login ที่ http://localhost:5174 ด้วย email/password นั้น

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:api` | Start API dev server (watch mode) |
| `pnpm dev:platform` | Start Platform Admin frontend |
| `pnpm dev:tenant` | Start Tenant frontend |
| `pnpm build:api` | Build API for production |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes (no migration file) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed demo data |

---

## API Overview

Base URL: `http://localhost:3000`

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Tenant user login |
| POST | `/auth/platform/login` | Platform admin login |
| POST | `/auth/platform/setup` | Create first platform admin |

### Platform Admin (JWT: platform secret)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PATCH/DELETE | `/platform/plans` | Manage subscription plans |
| GET/POST/PATCH | `/platform/tenants` | Manage tenants |

### Tenant (JWT: tenant secret)

| Resource | Endpoints |
|----------|-----------|
| Branches | `GET/POST/PATCH/DELETE /branches` |
| Users | `GET/POST/PATCH/DELETE /users` |
| Products | `GET/POST/PATCH/DELETE /products` |
| Stock | `GET /branches/:id/stock`, `POST .../set`, `PATCH .../adjust` |
| Customers | `GET/POST/PATCH /customers`, suspend/unsuspend/limit |
| Contracts | `GET/POST /contracts`, `DELETE /:id/cancel` |
| Payments | `GET/POST /payments/cash`, `/payments/slip`, approve/reject |
| Commissions | `GET /commissions` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | NestJS 11, Prisma 7, PostgreSQL 16 |
| Auth | JWT (dual secret: tenant / platform) |
| Queue | Bull + Redis 7 |
| Frontend | Vue 3, Vite, Pinia, Vue Router, Tailwind CSS v4 |
| Package manager | pnpm workspaces |

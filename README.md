# 💸 Simple Expense Tracker

A clean and modern personal expense tracking web application built with **Next.js 15**, **Prisma**, and **PostgreSQL**. Track your daily spending, visualize trends with interactive charts, and manage expenses by category — all in one place.

---

## ✨ Features

- 📊 **Dashboard** — KPI cards showing monthly total, today's total, and top spending category
- 📈 **Bar Chart** — Daily expense trends over time
- 🍩 **Donut Chart** — Expense breakdown by category
- 📋 **Expense List** — Paginated table with month/year filtering
- ➕ **Add Expense** — Modal form with category selection and date picker
- ✏️ **Edit / Delete** — Inline actions on every expense row
- 📁 **Category Management** — Organize expenses into custom categories

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | [Prisma 6](https://www.prisma.io/) |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Charts | [Recharts](https://recharts.org/) |
| Table | TanStack Table v8 |
| Icons | Lucide React |
| Container | Docker / Docker Compose |

---

## 📂 Project Structure

```
simple-expense-tracker/
├── app/
│   ├── page.tsx              # Dashboard page (Server Component)
│   ├── summary/
│   │   └── page.tsx          # Expense summary page (Client Component)
│   ├── categories/           # Category management
│   ├── [id]/                 # Dynamic expense detail routes
│   └── api/
│       ├── expenses/         # GET (with pagination & filters) / POST
│       └── categories/       # Category CRUD endpoints
├── components/
│   └── ui/                   # Reusable UI components (shadcn/ui based)
│       ├── add-expense-modal.tsx
│       ├── data-table.tsx
│       ├── chart-bar-interactive.tsx
│       ├── pie-chart-donut.tsx
│       ├── app-sidebar.tsx
│       └── ...
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Prisma migration history
├── lib/
│   └── prisma.ts             # Prisma client singleton
├── hooks/                    # Custom React hooks
├── docker-compose.yml        # PostgreSQL container setup
├── dockerfile                # App container definition
└── .env.example              # Environment variable template
```

---

## 🗄️ Database Schema

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String
  expenses Expense[]
}

model Expense {
  id          Int      @id @default(autoincrement())
  amount      Float
  description String
  date        DateTime @default(now())
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
}
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/simple-expense-tracker.git
cd simple-expense-tracker
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Default values in `.env`:

```env
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_db"
API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Start the PostgreSQL database

```bash
docker-compose up -d
```

This will spin up a PostgreSQL 16 container named `simple-expense-tracker-db` on port `5432`.

### 4. Install dependencies

```bash
npm install
```

> `postinstall` will automatically run `prisma generate` to create the Prisma client.

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 API Endpoints

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | List expenses with optional filters & pagination |
| `POST` | `/api/expenses` | Create a new expense |

#### GET `/api/expenses` — Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page (default: `10`) |
| `month` | number | Filter by month (1–12) |
| `year` | number | Filter by year (e.g. `2025`) |
| `date` | string | Filter by specific date (`YYYY-MM-DD`) |

#### POST `/api/expenses` — Request Body

```json
{
  "categoryId": 1,
  "amount": 150,
  "description": "ข้าวกลางวัน"
}
```

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List all categories |
| `POST` | `/api/categories` | Create a new category |

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## 🐳 Docker Deployment

A `dockerfile` is included for containerizing the Next.js app alongside the `docker-compose.yml` for PostgreSQL.

```bash
# Build and run everything
docker-compose up --build
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

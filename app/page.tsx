import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Tag, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { DashboardBarChart } from "@/components/ui/chart-bar-interactive";
import { DashboardDonutChart } from "@/components/ui/pie-chart-donut";
import { RecentTransactionsTable } from "@/components/ui/data-table";

// ─── Types ───────────────────────────────────────────────────────────────────
type PieChartData = { categoryName: string; visitors: number; fill: string };
type BarChartData = { amount: number; date: string };
type RecentExpense = {
  id: number;
  description: string;
  amount: number;
  date: Date;
  categoryId: number;
  category: { id: number; name: string };
};

// ─── Data Fetching (direct Prisma) ───────────────────────────────────────────
async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const [allExpenses, todayExpenses, categories, recentExpenses] = await Promise.all([
    // Total this month
    prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Today's total
    prisma.expense.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { amount: true },
    }),
    // Categories with expenses for charts
    prisma.category.findMany({
      include: { expenses: true },
    }),
    // 5 most recent
    prisma.expense.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { category: {
        select: {
          id: true,
          name: true,
        }
      } },
    }),
  ]);

  // Top category by expense count this month
  const categoryExpenseMap: Record<string, number> = {};
  for (const cat of categories) {
    const monthlyExpenses = cat.expenses.filter((e) => e.date >= startOfMonth);
    if (monthlyExpenses.length > 0) {
      categoryExpenseMap[cat.name] = monthlyExpenses.reduce(
        (s, e) => s + e.amount,
        0
      );
    }
  }
  const topCategory =
    Object.entries(categoryExpenseMap).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    "—";

  // Pie chart data
  const pieData: PieChartData[] = categories
    .filter((c) => c.expenses.length > 0)
    .map((c, i) => ({
      categoryName: c.name,
      visitors: c.expenses.length,
      fill: `var(--chart-${(i % 5) + 1})`,
    }));

  // Bar chart data — aggregate by day
  const allExpensesForBar = await prisma.expense.findMany({
    select: { date: true, amount: true },
    orderBy: { date: "asc" },
  });
  const dailyMap: Record<string, number> = {};
  for (const exp of allExpensesForBar) {
    const key = new Date(exp.date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Bangkok",
    });
    dailyMap[key] = (dailyMap[key] || 0) + exp.amount;
  }
  const barData: BarChartData[] = Object.entries(dailyMap).map(
    ([date, amount]) => ({ date, amount })
  );

  // Total amount in donut center
  const totalAmount = categories.reduce(
    (sum, c) => sum + c.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );

  return {
    monthlyTotal: allExpenses._sum.amount ?? 0,
    todayTotal: todayExpenses._sum.amount ?? 0,
    topCategory,
    pieData,
    barData,
    totalAmount,
    recentExpenses,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const {
    monthlyTotal,
    todayTotal,
    topCategory,
    pieData,
    barData,
    totalAmount,
    recentExpenses,
  } = await getDashboardData();

  const kpiCards = [
    {
      label: "รายจ่ายเดือนนี้",
      value: formatCurrency(monthlyTotal),
      icon: TrendingDown,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      sub: "ยอดรวมตั้งแต่ต้นเดือน",
    },
    {
      label: "รายจ่ายวันนี้",
      value: formatCurrency(todayTotal),
      icon: TrendingUp,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      sub: "วันนี้",
    },
    {
      label: "ประเภทที่ใช้มากสุด",
      value: topCategory,
      icon: Tag,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
      sub: "เดือนนี้",
    },
  ];

  return (
    <div className="flex-1 min-h-screen w-full min-w-0 bg-[#F9FAFB]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">ภาพรวมรายจ่ายของคุณ</p>
          </div>
          
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight truncate">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400">{card.sub}</p>
                </div>
                <div className={`${card.iconBg} rounded-lg p-2.5 shrink-0 ml-4`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                รายจ่ายรายวัน
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                ยอดรวมรายจ่ายแต่ละวัน
              </p>
            </div>
            <div className="p-6">
              <DashboardBarChart chartData={barData} />
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">
                สัดส่วนตามประเภท
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">แบ่งตามหมวดหมู่</p>
            </div>
            <div className="p-4">
              <DashboardDonutChart
                chartData={pieData}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        </div>

        {/* ── Recent Transactions ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">
                รายการล่าสุด
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">5 รายการล่าสุด</p>
            </div>
            <div className="flex w-5/6 justify-end">
              <Link
            href="/add-expense"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            เพิ่มรายจ่าย
          </Link>
            </div>
            <Link
              href="/?limit=50"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ดูทั้งหมด
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <RecentTransactionsTable expenses={recentExpenses as RecentExpense[]} />
        </div>
      </div>
    </div>
  );
}

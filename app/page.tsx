import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/ui/columns";
import { ChartPieDonutText } from "@/components/ui/pie-chart-donut";
import { ChartBarInteractive } from "@/components/ui/chart-bar-interactive";
import { DatePickerWithFilter } from "@/components/ui/date-picker";
import { Pagination } from "@/components/ui/pagination";
import prisma from "@/lib/prisma";

// Type definition for an expense item
type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: { name: string };
};

type PieChartData = {
  categoryName: string;
  visitors: number;
  fill: string;
};

// date คือ string รูปแบบ "YYYY-MM-DD" ที่ได้จาก API
type BarChartData = {
  amount: number;
  date: string;
};

type ExpenseResponse = {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ✅ Data fetching directly via Prisma (no self-referencing HTTP fetch)
async function fetchExpenses(
  sortBy: string = "date",
  dateFilter?: string,
  page: number = 1,
  limit: number = 10
): Promise<ExpenseResponse> {
  try {
    const where: any = {};
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching expenses", error);
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
}

// ✅ Data fetching directly via Prisma
async function fetchPieChartData(): Promise<PieChartData[]> {
  try {
    const categories = await prisma.category.findMany({
      include: { expenses: true },
    });

    return categories.map((category, index) => ({
      categoryName: category.name,
      visitors: category.expenses.length,
      fill: `var(--chart-${index + 1})`,
    }));
  } catch (error) {
    console.error("Error fetching pie chart data", error);
    return [];
  }
}

// ✅ Data fetching directly via Prisma
async function fetchBarChartData(): Promise<BarChartData[]> {
  try {
    const expenses = await prisma.expense.findMany({
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    });

    const expenseSummary = expenses.reduce((acc, expense) => {
      const dateKey = new Date(expense.date).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Bangkok",
      });
      acc[dateKey] = (acc[dateKey] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(expenseSummary).map(([date, amount]) => ({
      date,
      amount,
    }));
  } catch (error) {
    console.error("Error fetching bar chart data", error);
    return [];
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    sortBy: string;
    date: string;
    page: string | any;
    limit: string | any;
  }>;
}) {
  const { sortBy, date, page, limit } = await searchParams;

  const dateFilter = (date as string) || undefined;

  // ✅ validate และ parse page/limit ให้ถูกต้อง พร้อม fallback เป็น default value
  const parsedPage = Math.max(1, parseInt(page as string) || 1);
  const parsedLimit = Math.max(1, parseInt(limit as string) || 10);

  const expenseData = await fetchExpenses(sortBy, dateFilter, parsedPage, parsedLimit);
  const pieChartData: PieChartData[] = await fetchPieChartData();
  const barChartData: BarChartData[] = await fetchBarChartData();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard แสดงรายจ่าย
            </h1>
            <p className="text-gray-600 mt-1">ภาพรวมรายจ่ายของคุณ</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/add-expense">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                + เพิ่มรายจ่าย
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <ChartPieDonutText chartData={pieChartData} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <ChartBarInteractive chartData={barChartData} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                รายจ่ายล่าสุด
              </h3>
              <div className="flex items-center space-x-3">
                <DatePickerWithFilter />
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={expenseData.data} />
          <div className="py-4 flex justify-center">
            <Pagination
              currentPage={expenseData.page}
              totalPages={expenseData.totalPages}
              totalItems={expenseData.total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/ui/columns";
import { ChartPieDonutText } from "@/components/ui/pie-chart-donut";
import { ChartBarInteractive } from "@/components/ui/chart-bar-interactive";
import { DatePickerWithFilter } from "@/components/ui/date-picker";
import { Pagination } from "@/components/ui/pagination";

// Type definition for an expense item
type Expense = {
  description: string;
  amount: number;
  date: Date;
  category: string;
};

type PieChartData = {
  categoryName: string;
  visitors: number;
  fill: string;
};

type Category = {
  name: String;
  expenses: Expense[];
};

type ExpenseResponse = {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Data fetching function for the server component
async function fetchExpenses(
  sortBy: string = "date",
  dateFilter?: string,
  page: number = 1,
  limit: number = 10
): Promise<ExpenseResponse> {
  try {
    const url = new URL(`${process.env.API_URL}/expenses`);
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    if (dateFilter) {
      url.searchParams.append("date", dateFilter);
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }

    const data: ExpenseResponse = await response.json();
    const expensesWithFormattedDate = data.data.map((expense: Expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));

    return {
      ...data,
      data: expensesWithFormattedDate,
    };
  } catch (error) {
    console.error("Error fetching expenses", error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
}

// Data fetching function for the pie chart
async function fetchPieChartData(): Promise<PieChartData[]> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/categories/pie-chart-summary`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pie chart data: ${response.statusText}`);
    }

    const data = await response.json();
    const pieChartData: PieChartData[] = data.data.map(
      (category: Category, index: number) => ({
        categoryName: category.name,
        visitors: category.expenses.length,
        fill: `var(--chart-${index + 1})`,
      })
    );

    return pieChartData;
  } catch (error) {
    console.error("Error fetching pie chart data", error);
    return [];
  }
}

export default async function DashboardPage({ searchParams }: any) {
  const sortBy = (searchParams?.sortBy as string) || "date";
  const dateFilter = (searchParams?.date as string) || undefined;
  const page = parseInt(searchParams?.page as string) || 1;
  const limit = parseInt(searchParams?.limit as string) || 10;

  const expenseData = await fetchExpenses(sortBy, dateFilter, page, limit);
  const pieChartData: PieChartData[] = await fetchPieChartData();

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
            <ChartBarInteractive />
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

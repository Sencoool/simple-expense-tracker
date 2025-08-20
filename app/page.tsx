// DashboardPage.tsx

import Link from "next/link"; // Use Link for navigation
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/ui/columns";
import { ChartPieDonutText } from "@/components/ui/pie-chart-donut";
import { ChartBarInteractive } from "@/components/ui/chart-bar-interactive";
import { DatePickerWithFilter } from "@/components/ui/date-picker";

// Type definition for an expense item
type Expense = {
  description: string;
  amount: number;
  date: Date;
  category: string; // api returns category name
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

// Data fetching function for the server component
// แก้ไขให้รับ sortBy และ dateFilter
async function fetchExpenses(
  sortBy: string = "date",
  dateFilter?: string
): Promise<Expense[]> {
  try {
    // สร้าง URL object เพื่อจัดการพารามิเตอร์ได้อย่างง่ายดาย
    const url = new URL(`${process.env.API_URL}/expenses`);
    url.searchParams.append("sortBy", sortBy);
    if (dateFilter) {
      url.searchParams.append("date", dateFilter);
    }

    const response = await fetch(url.toString(), {
      cache: "no-store", // Ensures data is always fresh on each request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }

    const data = await response.json();
    const expenses = data.data;

    const expensesWithFormattedDate = expenses.map((expense: Expense) => ({
      ...expense,
      date: new Date(expense.date), // Converts the date string from the API into a JavaScript Date object
    }));

    return expensesWithFormattedDate;
  } catch (error) {
    console.error("Error fetching expenses", error);
    return [];
  }
}

// Data fetching function for the pie chart
async function fetchPieChartData(): Promise<PieChartData[]> {
  try {
    const response = await fetch(
      // Your API endpoint that returns the data with expenses array
      `${process.env.API_URL}/categories/pie-chart-summary`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pie chart data: ${response.statusText}`);
    }

    const data = await response.json();

    // The data transformation logic
    const pieChartData: PieChartData[] = data.data.map(
      (category: Category, index: number) => ({
        categoryName: category.name, // The name of the category
        visitors: category.expenses.length, // The count of expenses
        fill: `var(--chart-${index + 1})`, // The color of each category
      })
    );

    return pieChartData;
  } catch (error) {
    console.error("Error fetching pie chart data", error);
    return [];
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const sortBy = (searchParams?.sortBy as string) || "date";
  // ดึงค่า 'date' จาก URL parameter และเก็บไว้ในตัวแปร dateFilter
  const dateFilter = (searchParams?.date as string) || undefined;

  // ส่งทั้ง sortBy และ dateFilter ไปให้ fetchExpenses
  const expenses: Expense[] = await fetchExpenses(sortBy, dateFilter);
  const pieChartData: PieChartData[] = await fetchPieChartData();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
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
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart 1 - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <ChartPieDonutText chartData={pieChartData} />
          </div>

          {/* Chart 2 - Trend Line */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <ChartBarInteractive />
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                รายจ่ายล่าสุด
              </h3>
              <div className="flex items-center space-x-3">
                {/* Datepicker component handle params change */}
                <DatePickerWithFilter />
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={expenses} />
        </div>
      </div>
    </div>
  );
}

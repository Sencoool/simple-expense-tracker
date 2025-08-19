import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import Link from "next/link"; // Use Link for navigation

// Assuming these are your components
import { DataTable } from "./data-table"; // Your table component
import { columns } from "./columns"; // Your table column definitions

// Type definition for an expense item
type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string; // Assuming the API returns the category name
};

// Data fetching function for the server component
async function fetchExpenses(): Promise<Expense[]> {
  try {
    const response = await fetch(`${process.env.API_URL}/expenses`, {
      cache: "no-store", // Ensures data is always fresh on each request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching expenses", error);
    return [];
  }
}

export default async function DashboardPage() {
  const expenses: Expense[] = await fetchExpenses();

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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + เพิ่มรายจ่าย
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart 1 - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                รายจ่ายตามหมวดหมู่
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            {/* Dynamic Bar Chart based on fetched data */}
            <div className="space-y-4">
              {/* You would replace this with a real charting library like Recharts or a custom component */}
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <BarChart3 className="w-12 h-12 mb-2" />
                <p>กราฟจะแสดงที่นี่</p>
              </div>
            </div>
          </div>

          {/* Chart 2 - Trend Line */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                แนวโน้มรายจ่าย (7 วัน)
              </h3>
              <select className="text-sm border rounded-lg px-3 py-1">
                <option>7 วัน</option>
                <option>30 วัน</option>
                <option>90 วัน</option>
              </select>
            </div>
            {/* Dynamic Line Chart based on fetched data */}
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <TrendingUp className="w-12 h-12 mb-2" />
              <p>แนวโน้มรายจ่ายจะแสดงที่นี่</p>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                รายการรายจ่ายล่าสุด
              </h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Use DataTable component to display expenses */}
          <DataTable columns={columns} data={expenses} />
        </div>
      </div>
    </div>
  );
}

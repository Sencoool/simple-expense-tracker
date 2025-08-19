import { columns, Payment } from "./columns";
import { DataTable } from "./data-table";

async function fetchExpenses() {
  try {
    const response = await fetch(`${process.env.API_URL}/expenses`);
    const data = await response.json(); // parse JSON response into object

    if (!response.ok) {
      throw new Error("Failed to fetch expenses");
    }

    return data.data; // return the array of expenses
  } catch (error) {
    console.error("Error fetching expenses", error);
    return [];
  }
}

export default async function DashboardPage() {
  const expenses = await fetchExpenses();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={expenses} />
    </div>
  );
}

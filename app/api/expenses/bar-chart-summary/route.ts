import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define the type for the data retrieved from the database
interface Expense {
  date: Date;
  amount: number;
}

// Define the type for the daily expense summary
interface DailyExpenseSummary {
  date: string;
  amount: number;
}

export async function GET() {
  try {
    const expenses: Expense[] = await prisma.expense.findMany({
      select: {
        date: true,
        amount: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Use 'reduce' to group and sum expenses for the same day
    // The accumulator 'acc' is an object where keys are dates and values are total amounts
    const expenseSummary = expenses.reduce((acc, expense) => {
      // Convert the Date object to a string based on local time zone
      const dateKey = new Date(expense.date).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // If the date key doesn't exist, it defaults to 0 before adding the current amount.
      acc[dateKey] = (acc[dateKey] || 0) + expense.amount;

      return acc;
    }, {} as Record<string, number>);

    // Convert the summary object into an array of objects
    const data: DailyExpenseSummary[] = Object.entries(expenseSummary).map(
      ([date, amount]) => ({
        date,
        amount,
      })
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily expense summary:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

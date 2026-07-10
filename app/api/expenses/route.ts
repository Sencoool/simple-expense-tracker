import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // get Filter from params
    const targetDate = searchParams.get("date");
    const month = searchParams.get("month"); // 1–12
    const year = searchParams.get("year");   // e.g. 2025

    // object for where condition
    const where: any = {};
    if (targetDate) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    } else if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      // new Date(year, month-1, 1) = first day of month (month is 0-indexed)
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      // new Date(year, month, 0) = last day of current month (day 0 of next month)
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      where.date = { gte: startOfMonth, lte: endOfMonth };
    }


    // Get Pagination parameters
    const page = parseInt(searchParams.get("page") || "1"); // Default to page 1
    const limit = parseInt(searchParams.get("limit") || "10"); // Default to 10 items per page

    // Calculate the number of items to skip
    const skip = (page - 1) * limit;

    const data = await prisma.expense.findMany({
      where: where, // filter condition
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: skip, // skip each 10 records
      take: limit,
    });

    // Get the total count of filtered items for pagination info
    const totalCount = await prisma.expense.count({ where });

    return NextResponse.json(
      {
        data,
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { categoryId, amount, description } = await request.json();
    const expense = await prisma.expense.create({
      data: {
        categoryId,
        amount,
        description,
      },
    });
    revalidatePath("/"); // ✅ #8: revalidatePath ต้องรับ relative pathname ไม่ใช่ full URL
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // get Filter from params
    const targetDate = searchParams.get("date");

    // object for where condition
    const where: any = {};
    if (targetDate) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0); // set to 00:00:00.000Z

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999); // set to 23:59:59.999Z

      where.date = {
        gte: startOfDay, // 00:00
        lte: endOfDay, // 23:59
      };
    }

    const data = await prisma.expense.findMany({
      where: where, // filter condition
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ data }, { status: 200 });
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
    revalidatePath(`${process.env.API_URL}/`);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

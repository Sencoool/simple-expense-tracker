import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const data = await prisma.expense.findMany({
      include: {
        category: true, // Include category table
      },
    });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
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

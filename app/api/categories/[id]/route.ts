import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    const data = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        expenses: true, // Include expenses table
      },
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    const { name } = await request.json();
    const updatedData = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ updatedData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    // ✅ Guard: ตรวจสอบว่ามี Expense ผูกอยู่กับ Category นี้หรือไม่
    const expenseCount = await prisma.expense.count({
      where: { categoryId },
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        {
          error: `ไม่สามารถลบได้ เนื่องจากยังมีรายการค่าใช้จ่าย ${expenseCount} รายการที่ผูกกับประเภทนี้อยู่`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

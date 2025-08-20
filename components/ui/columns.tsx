"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link"; // ✅ Import Link from Next.js

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This type is used to define the shape of our data.
export type Payment = {
  id: string;
  amount: number;
  category: { name: string };
  description: string;
  date: Date;
};

// Add column here
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "category.name",
    header: "ประเภทการใช้จ่าย",
  },
  {
    accessorKey: "amount",
    header: "จำนวนเงิน",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "รายละเอียด",
  },
  {
    accessorKey: "date",
    header: "วันที่",

    cell: ({ row }) => {
      const date = row.original.date;
      return (
        <span>
          {date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">การจัดการ</div>,
    cell: ({ row }) => {
      const expense = row.original;

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
              {/* ✅ แก้ไขปุ่ม "แก้ไข" ให้เป็น Link */}
              <Link href={`/edit-expense/${expense.id}`}>
                <DropdownMenuItem>แก้ไข</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              {/* ✅ แก้ไขปุ่ม "ลบ" ให้เป็น Link */}
              <Link href={`/delete-expense/${expense.id}`}>
                <DropdownMenuItem>ลบ</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

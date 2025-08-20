"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
export type Payment = {
  amount: number;
  category: string;
  description: string;
  date: Date;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "category.name",
    header: "ประเภทการใช้จ่าย",
  },
  {
    accessorKey: "amount",
    header: "จำนวนเงิน",
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
      // ใช้ toLocaleDateString() เพื่อ format เฉพาะตอนแสดงผล
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
];

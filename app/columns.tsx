"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
export type Payment = {
  amount: number;
  category: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

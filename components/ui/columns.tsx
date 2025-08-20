"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type Payment = {
  id: string;
  amount: number;
  category: { name: string };
  description: string;
  date: Date;
};

export const columns: ColumnDef<Payment>[] = [
  // ... (existing columns)
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

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "รายละเอียด",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          วันที่
        </Button>
      );
    },
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
      const router = useRouter();
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);

      const handleDelete = async () => {
        try {
          const response = await fetch(`/api/expenses/${expense.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            console.log("Expense deleted successfully!");
            router.refresh();
          } else {
            console.error("Failed to delete expense");
          }
        } catch (error) {
          console.error("Error deleting expense:", error);
        } finally {
          setShowDeleteDialog(false);
        }
      };
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
              <Link href={`/${expense.id}`}>
                <DropdownMenuItem>แก้ไข</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
                  การกระทำนี้ไม่สามารถยกเลิกได้.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  ยืนยัน
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

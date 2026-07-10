"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddExpenseModal } from "@/components/ui/add-expense-modal";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Generic DataTable (used by other pages) ─────────────────────────────────
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ReceiptText className="h-10 w-10 opacity-30" />
                  <p className="text-sm">ยังไม่มีรายการค่าใช้จ่าย</p>
                  <p className="text-xs">
                    เริ่มต้นโดยกดปุ่ม &ldquo;+ เพิ่มรายจ่าย&rdquo; ด้านบน
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Recent Transactions Table (Dashboard) ───────────────────────────────────
export type Expense = {
  id: number;
  description: string;
  amount: number;
  date: Date;
  categoryId: number;
  category: { id: number; name: string };
};

export function ActionCell({
  expense,
  onSuccess,
}: {
  expense: Expense;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setShowEditModal(true)}>
              แก้ไข
            </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <AddExpenseModal
        expenseId={expense.id}
        initialCategory={String(expense.category.id)}
        initialAmount={String(expense.amount)}
        initialDescription={expense.description ?? ""}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={onSuccess}
      />
    </>
  );
}

export function RecentTransactionsTable({
  expenses,
}: {
  expenses: Expense[];
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-40 text-gray-300">
        <ReceiptText className="h-10 w-10" />
        <p className="text-sm text-gray-400">ยังไม่มีรายการค่าใช้จ่าย</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
          <th className="px-6 py-3 text-left font-medium">ประเภท</th>
          <th className="px-6 py-3 text-left font-medium">รายละเอียด</th>
          <th className="px-6 py-3 text-left font-medium">วันที่</th>
          <th className="px-6 py-3 text-right font-medium">จำนวนเงิน</th>
          <th className="px-6 py-3 text-center font-medium">จัดการ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {expenses.map((expense) => (
          <tr
            key={expense.id}
            className="hover:bg-gray-50/60 transition-colors group"
          >
            <td className="px-6 py-3.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {expense.category.name}
              </span>
            </td>
            <td className="px-6 py-3.5 text-gray-700 max-w-[220px] truncate">
              {expense.description || (
                <span className="text-gray-300 italic">ไม่มีรายละเอียด</span>
              )}
            </td>
            <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap">
              {expense.date.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td className="px-6 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap">
              {new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
                minimumFractionDigits: 0,
              }).format(expense.amount)}
            </td>
            <td className="px-6 py-3.5 text-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionCell expense={expense} />
              </div>
            </td>
          </tr>
        ))}
        {/* Filler rows — keep table height fixed at 5 rows */}
        {Array.from({ length: Math.max(0, 5 - expenses.length) }).map((_, i) => (
          <tr key={`filler-${i}`} className="!border-t-transparent">
            <td colSpan={5} className="py-3.5" aria-hidden="true" />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

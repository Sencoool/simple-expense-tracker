"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { ActionCell, Expense } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Constants ───────────────────────────────────────────────────────────────
const MONTHS = [
  { value: "1",  label: "มกราคม" },
  { value: "2",  label: "กุมภาพันธ์" },
  { value: "3",  label: "มีนาคม" },
  { value: "4",  label: "เมษายน" },
  { value: "5",  label: "พฤษภาคม" },
  { value: "6",  label: "มิถุนายน" },
  { value: "7",  label: "กรกฎาคม" },
  { value: "8",  label: "สิงหาคม" },
  { value: "9",  label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentPage  = parseInt(searchParams.get("page")  || "1");
  const selectedMonth = searchParams.get("month") || String(now.getMonth() + 1);
  const selectedYear  = searchParams.get("year")  || String(now.getFullYear());

  const [expenses,    setExpenses]    = useState<Expense[]>([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [refreshKey,  setRefreshKey]  = useState(0);

  // ── Update URL params ───────────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    // Reset to page 1 whenever a filter changes
    if (!("page" in updates)) params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ── Fetch expenses ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page:  String(currentPage),
          limit: "10",
          month: selectedMonth,
          year:  selectedYear,
        });
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses?${params}`);
        const json = await res.json();
        if (!cancelled) {
          setExpenses(
            (json.data ?? []).map((e: any) => ({ ...e, date: new Date(e.date) }))
          );
          setTotalPages(json.totalPages ?? 1);
          setTotalItems(json.total ?? 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [currentPage, selectedMonth, selectedYear, refreshKey]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleActionComplete = () => setRefreshKey((k) => k + 1);

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

  const monthLabel =
    MONTHS.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">สรุปรายจ่าย</h1>
            <p className="text-gray-600 mt-1">ภาพรวมรายจ่ายแยกตามประเภท</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden">

          {/* ── Toolbar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">รายการค่าใช้จ่าย</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLoading
                  ? "กำลังโหลด..."
                  : `${totalItems} รายการ · ${monthLabel} ${selectedYear}`}
              </p>
            </div>
            {/* Month + Year selectors */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedMonth}
                onValueChange={(v) => updateParams({ month: v })}
              >
                <SelectTrigger className="w-36 cursor-pointer">
                  <SelectValue placeholder="เดือน" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="cursor-pointer">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear}
                onValueChange={(v) => updateParams({ year: v })}
              >
                <SelectTrigger className="w-24 cursor-pointer">
                  <SelectValue placeholder="ปี" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="cursor-pointer">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              กำลังโหลด...
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-48 text-gray-300">
              <ReceiptText className="h-10 w-10" />
              <p className="text-sm text-gray-400">
                ไม่มีรายการค่าใช้จ่ายใน{monthLabel} {selectedYear}
              </p>
            </div>
          ) : (
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
                    <td className="px-6 py-3.5 text-gray-700 max-w-[200px] truncate">
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
                        <ActionCell
                          expense={expense}
                          onSuccess={handleActionComplete}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Filler rows — keep table height fixed at 10 rows */}
                {Array.from({ length: Math.max(0, 10 - expenses.length) }).map((_, i) => (
                  <tr key={`filler-${i}`} className="!border-t-transparent">
                    <td colSpan={5} className="py-3.5" aria-hidden="true" />
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
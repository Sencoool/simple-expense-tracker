"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Tag, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Category {
  id: number;
  name: string;
  _count: { expenses: number };
}

type DialogMode = "create" | "edit";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function fetchCategories() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      const json = await res.json();
      setCategories(json.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // ── Dialog handlers ─────────────────────────────────────
  function openCreateDialog() {
    setDialogMode("create");
    setNameInput("");
    setSelectedCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setDialogMode("edit");
    setNameInput(category.name);
    setSelectedCategory(category);
    setDialogOpen(true);
  }

  async function handleDialogSubmit() {
    if (!nameInput.trim()) return;
    setIsSubmitting(true);
    try {
      if (dialogMode === "create") {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameInput.trim() }),
        });
      } else if (dialogMode === "edit" && selectedCategory) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${selectedCategory.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameInput.trim() }),
          }
        );
      }
      setDialogOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete handlers ──────────────────────────────────────
  function openDeleteDialog(category: Category) {
    setCategoryToDelete(category);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();

      if (!res.ok) {
        // 409 Conflict — มี expense ผูกอยู่
        setDeleteError(json.error);
        return;
      }

      setDeleteDialogOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              จัดการประเภทค่าใช้จ่าย
            </h1>
            <p className="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบประเภทค่าใช้จ่าย</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] overflow-hidden">

          {/* ── Toolbar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">ประเภทค่าใช้จ่าย</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLoading ? "กำลังโหลด..." : `${categories.length} ประเภท`}
              </p>
            </div>
            <Button onClick={openCreateDialog} size="sm" className="gap-1.5 cursor-pointer">
              <PlusCircle className="h-3.5 w-3.5" />
              เพิ่มประเภท
            </Button>
          </div>

          {/* ── Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              กำลังโหลด...
            </div>
          ) : categories.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center gap-3 h-48 text-gray-300">
              <Tag className="h-10 w-10" />
              <p className="text-sm text-gray-400">ยังไม่มีประเภทค่าใช้จ่าย</p>
              <Button variant="outline" size="sm" onClick={openCreateDialog} className="cursor-pointer">
                + เพิ่มประเภทแรก
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-medium">ชื่อประเภท</th>
                  <th className="px-6 py-3 text-center font-medium">จำนวนรายจ่าย</th>
                  <th className="px-6 py-3 text-center font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="text-gray-400">{cat._count.expenses} รายการ</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700 cursor-pointer"
                          onClick={() => openEditDialog(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-rose-600 cursor-pointer"
                          onClick={() => openDeleteDialog(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Filler rows — keep table height fixed at 10 rows */}
                {Array.from({ length: Math.max(0, 10 - categories.length) }).map((_, i) => (
                  <tr key={`filler-${i}`} className="!border-t-transparent">
                    <td colSpan={3} className="py-3.5" aria-hidden="true" />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "เพิ่มประเภทค่าใช้จ่าย" : "แก้ไขประเภทค่าใช้จ่าย"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="category-name">ชื่อประเภท</Label>
            <Input
              id="category-name"
              placeholder="เช่น อาหาร, เดินทาง, สุขภาพ..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDialogSubmit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleDialogSubmit} disabled={isSubmitting || !nameInput.trim()}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setDeleteError(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบประเภท &ldquo;{categoryToDelete?.name}&rdquo; ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Error message จาก 409 guard */}
          {deleteError && (
            <p className="text-sm text-destructive px-1 -mt-2">{deleteError}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Button onClick={openCreateDialog} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            เพิ่มประเภท
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              กำลังโหลด...
            </div>
          ) : categories.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground">
              <Tag className="h-10 w-10 opacity-30" />
              <p className="text-sm">ยังไม่มีประเภทค่าใช้จ่าย</p>
              <Button variant="outline" size="sm" onClick={openCreateDialog}>
                + เพิ่มประเภทแรก
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อประเภท</TableHead>
                  <TableHead className="text-center">จำนวนรายจ่าย</TableHead>
                  <TableHead className="text-center">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {cat._count.expenses} รายการ
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

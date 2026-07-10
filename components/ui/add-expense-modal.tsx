"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
}

const emptyPayload = { category: "", amount: "", description: "" };

interface AddExpenseModalProps {
  category?: string;
  amount?: string;
  description?: string;
  expenseId?: number;
  initialCategory?: string;
  initialAmount?: string;
  initialDescription?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddExpenseModal({
  category,
  amount,
  description,
  expenseId,
  initialCategory,
  initialAmount,
  initialDescription,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: AddExpenseModalProps) {
  const router = useRouter();
  // Controlled vs. uncontrolled open state
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) controlledOnOpenChange?.(v);
    else setInternalOpen(v);
  };

  const isEditMode = expenseId !== undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState(emptyPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── New Category inline state ──────────────────────────────────────────────
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Fetch categories when modal opens
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      const data = await res.json();
      setCategories(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open && categories.length === 0) fetchCategories();
  }, [open, categories.length]);

  // Populate form with initial values when used in edit mode
  useEffect(() => {
    if (open && isEditMode) {
      setPayload({
        category: initialCategory ?? "",
        amount: initialAmount ?? "",
        description: initialDescription ?? "",
      });
    }
  }, [open, isEditMode, initialCategory, initialAmount, initialDescription]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPayload((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setPayload(emptyPayload);
    setShowNewCat(false);
    setNewCatName("");
  };

  // ── Create new category inline ─────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setIsCreatingCat(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const created: Category = data.category;
        // Append to list and auto-select the new category
        setCategories((prev) => [...prev, created]);
        setShowNewCat(false);
        setNewCatName("");
        
        // Use setTimeout to allow React to render the new category option in the DOM first
        setTimeout(() => {
          setPayload((prev) => ({ ...prev, category: String(created.id) }));
        }, 50);
      }
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setIsCreatingCat(false);
    }
  };

  // ── Submit expense (POST for add, PUT for edit) ────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.category || !payload.amount) return;

    setIsSubmitting(true);
    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/expenses/${expenseId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/expenses`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          amount: parseFloat(payload.amount),
          categoryId: Number(payload.category),
        }),
      });

      if (res.ok) {
        handleReset();
        setOpen(false);
        router.refresh();
        onSuccess?.();
      } else {
        console.error("Failed to save expense:", res.statusText);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = payload.category !== "" && payload.amount !== "";

  return (
    <>
      {/* Trigger Button — only shown in uncontrolled (add) mode */}
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายจ่าย
        </button>
      )}

      {/* Modal */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) handleReset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEditMode ? "แก้ไขรายการค่าใช้จ่าย" : "เพิ่มรายการค่าใช้จ่าย"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-1">
            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-600">ประเภทค่าใช้จ่าย</Label>
                {!showNewCat && (
                  <button
                    type="button"
                    onClick={() => setShowNewCat(true)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    ประเภทใหม่
                  </button>
                )}
              </div>

              <Select
                onValueChange={(v) => setPayload((p) => ({ ...p, category: v }))}
                value={payload.category}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกประเภท..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>ประเภทค่าใช้จ่าย</SelectLabel>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Inline New Category Form */}
              {showNewCat && (
                <div className="flex items-center gap-2 mt-2 animate-in slide-in-from-top-1 duration-150">
                  <Input
                    autoFocus
                    placeholder="ชื่อประเภทใหม่..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                      if (e.key === "Escape") {
                        setShowNewCat(false);
                        setNewCatName("");
                      }
                    }}
                    className="h-8 text-sm"
                    disabled={isCreatingCat}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatName.trim() || isCreatingCat}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {isCreatingCat ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCat(false); setNewCatName(""); }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm text-gray-600">
                จำนวนเงิน (บาท)
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="10.00"
                placeholder="0.00"
                value={payload.amount}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm text-gray-600">
                รายละเอียด{" "}
                <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="เช่น ค่าอาหารกลางวัน..."
                value={payload.description}
                onChange={handleInputChange}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setOpen(false); handleReset(); }}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting
                  ? "กำลังบันทึก..."
                  : isEditMode
                  ? "บันทึกการแก้ไข"
                  : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

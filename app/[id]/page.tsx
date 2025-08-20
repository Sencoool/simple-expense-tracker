"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import { useRouter, useParams, redirect } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
}

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState({
    category: "",
    amount: "",
    description: "",
  });

  async function fetchExpense(id: number) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch expense data");
      }
      const data = await response.json();

      console.log(data);

      setPayload({
        category: data.data.category.id.toString(), // Convert ID to string for Select component
        amount: data.data.amount.toString(),
        description: data.data.description,
      });
    } catch (error) {
      console.error("Error fetching expense data:", error);
    }
  }

  // Fetch categories and expense data on component mount
  useEffect(() => {
    fetchCategories();
    fetchExpense(Number(expenseId));
  }, []);

  async function fetchCategories() {
    // ... (Your existing fetchCategories function)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPayload((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setPayload((prevData) => ({
      ...prevData,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitPayload = {
      ...payload,
      amount: parseFloat(payload.amount),
      categoryId: Number(payload.category),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/expenses/${expenseId}`,
        {
          method: "PUT", //
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitPayload),
        }
      );
      router.push("/");
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          แก้ไขรายการค่าใช้จ่าย
        </h2>
        <div>
          <Select onValueChange={handleSelectChange} value={payload.category}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกประเภทค่าใช้จ่าย" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>ประเภทค่าใช้จ่าย</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">จำนวนเงิน</Label>
          <Input
            type="number"
            id="amount"
            placeholder="จำนวนเงิน . . ."
            className="mt-2"
            value={payload.amount}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="description">รายละเอียด</Label>
          <Input
            type="text"
            id="description"
            placeholder="ค่าอาหารกลางวัน . . ."
            className="mt-2"
            value={payload.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            type="button"
            onClick={() => router.back()}
          >
            ยกเลิก
          </Button>
          <Button type="submit">บันทึกการแก้ไข</Button>
        </div>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useState, useRef } from "react";
import * as React from "react";

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
  id: number; //
  name: string;
}

export default function AddExpensePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState({
    category: "", // category need to be string because we will use it in select option
    amount: "",
    description: "",
  });

  // Fetch categories from the API
  async function fetchCategories() {
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

  // Fetch data when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle changes for text and number inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPayload((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle changes for the Select component
  const handleSelectChange = (value: string) => {
    setPayload((prevData) => ({
      ...prevData,
      category: value, // Store the ID received from SelectItem
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submitted with data:", payload);

    const submitPayload = {
      ...payload,
      amount: parseFloat(payload.amount),
      categoryId: Number(payload.category), // Parse (category ID) from to a number
    };

    console.log("Payload to be sent to server:", submitPayload);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
      method: "POST",
      body: JSON.stringify(submitPayload),
    });
  };

  const handleReset = () => {
    setPayload({
      category: "",
      amount: "",
      description: "",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          เพิ่มรายการค่าใช้จ่ายใหม่
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
          <Button variant="secondary" type="button" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="destructive" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

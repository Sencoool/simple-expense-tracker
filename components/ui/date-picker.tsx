"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [date, setDate] = React.useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );

  // useEffect for detect date change
  React.useEffect(() => {
    // create new URLSearchParams to handle params search
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      newSearchParams.set("date", formattedDate);
    } else {
      newSearchParams.delete("date");
    }
    router.push(`/?${newSearchParams.toString()}`);
  }, [date, router, searchParams]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP")
          ) : (
            <span>เลือกวันที่ต้องการดูรายจ่าย</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

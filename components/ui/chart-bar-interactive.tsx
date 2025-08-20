"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function ChartBarInteractive({
  chartData,
}: {
  chartData: { date: string; amount: number }[];
}) {
  const chartConfig = {
    amount: {
      label: "รายจ่าย",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>กราฟแสดงรายจ่ายรายวัน</CardTitle>
          <CardDescription>แสดงภาพรวมรายจ่ายในแต่ละวัน</CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">ยอดรวม</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {total.toLocaleString()} บาท
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value: string) => {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value;
                    return date.toLocaleDateString("th-TH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  // ✅ Type-safe formatter
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return `${value.toLocaleString()} บาท`;
                    }
                    return String(value);
                  }}
                />
              }
            />
            <Bar dataKey="amount" fill={`var(--color-amount)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

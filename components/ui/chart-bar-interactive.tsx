"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { BarChart2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "รายจ่าย",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function DashboardBarChart({
  chartData,
}: {
  chartData: { date: string; amount: number }[];
}) {
  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-3 text-gray-300">
        <BarChart2 className="h-10 w-10" />
        <p className="text-sm text-gray-400">ยังไม่มีข้อมูลรายจ่าย</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart
        data={chartData}
        margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
        barSize={chartData.length > 20 ? 8 : 18}
      >
        <CartesianGrid vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          minTickGap={28}
          tickFormatter={(value: string) => {
            const date = new Date(value);
            return date.toLocaleDateString("th-TH", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(59,130,246,0.06)", radius: 4 }}
          content={
            <ChartTooltipContent
              className="w-[160px] text-xs"
              labelFormatter={(value: string) => {
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                return date.toLocaleDateString("th-TH", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
              }}
              formatter={(value) => {
                if (typeof value === "number") {
                  return new Intl.NumberFormat("th-TH", {
                    style: "currency",
                    currency: "THB",
                    minimumFractionDigits: 0,
                  }).format(value);
                }
                return String(value);
              }}
            />
          }
        />
        <Bar
          dataKey="amount"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

// ── Legacy export kept for backward compat ──────────────────────────────────
export { DashboardBarChart as ChartBarInteractive };

"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ChartDataPoint = {
  categoryName: string;
  visitors: number;
  fill: string;
};

type DashboardDonutChartProps = {
  chartData: ChartDataPoint[];
  totalAmount: number;
};

export function DashboardDonutChart({
  chartData,
  totalAmount,
}: DashboardDonutChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = { visitors: { label: "รายการ" } };
    chartData.forEach((item) => {
      cfg[item.categoryName] = { label: item.categoryName };
    });
    return cfg;
  }, [chartData]);

  const formattedTotal = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalAmount);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center gap-3 text-gray-300">
        <PieChartIcon className="h-10 w-10" />
        <p className="text-sm text-gray-400">ยังไม่มีข้อมูลประเภทรายจ่าย</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-[240px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel className="text-xs" />}
        />
        <Pie
          data={chartData}
          dataKey="visitors"
          nameKey="categoryName"
          innerRadius={64}
          outerRadius={90}
          strokeWidth={2}
          stroke="#fff"
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 8}
                      fontSize="13"
                      fontWeight="700"
                      fill="#111827"
                    >
                      {formattedTotal}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 10}
                      fontSize="10"
                      fill="#9ca3af"
                    >
                      รายจ่ายรวม
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="categoryName" />}
          className="flex-wrap gap-x-4 gap-y-1 text-xs *:basis-auto"
        />
      </PieChart>
    </ChartContainer>
  );
}

// ── Legacy export ────────────────────────────────────────────────────────────
export { DashboardDonutChart as ChartPieDonutText };

"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

// Define the type for a single data point
// The fill property is added here
type ChartDataPoint = {
  categoryName: string;
  visitors: number;
  fill: string;
};

// The type here is an array of ChartDataPoint
type ChartProps = {
  chartData: ChartDataPoint[];
};

export function ChartPieDonutText({ chartData }: ChartProps) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [chartData]);

  // Dynamically create the chartConfig based on the incoming data.
  const chartConfig = React.useMemo(() => {
    const dynamicConfig: ChartConfig = {
      visitors: {
        label: "Category",
      },
    };

    chartData.forEach((item) => {
      // The key for the config is the categoryName itself.
      dynamicConfig[item.categoryName] = {
        label: item.categoryName,
      };
    });

    return dynamicConfig;
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - แสดงจำนวนรายจ่ายแต่ละประเภท</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="categoryName"
              innerRadius={60}
              strokeWidth={5}
            />
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
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        รายการ
                      </tspan>
                    </text>
                  );
                }
              }}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="categoryName" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          แสดงรายจ่ายแต่ละประเภท
        </div>
      </CardFooter>
    </Card>
  );
}

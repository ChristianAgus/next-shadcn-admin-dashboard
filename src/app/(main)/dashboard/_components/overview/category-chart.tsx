"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CategorySales } from "@/types/dashboard";

const chartConfig = {
  sold: {
    label: "Units sold",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CategoryChart({ data }: { readonly data: CategorySales[] }) {
  const chartData = [...data].sort((left, right) => right.sold - left.sold).slice(0, 6);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Sales by category</CardTitle>
        <CardDescription>Units sold per catalog category.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={92}
              tickMargin={6}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 13)}…` : value)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="sold" fill="var(--color-sold)" radius={4} barSize={16} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

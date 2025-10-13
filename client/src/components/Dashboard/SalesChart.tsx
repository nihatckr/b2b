"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface SalesChartProps {
  data: Array<{
    date: string;
    orders: number;
    samples: number;
    revenue?: number;
  }>;
  type?: "line" | "area";
}

export function SalesChart({ data, type = "area" }: SalesChartProps) {
  const ChartComponent = type === "line" ? LineChart : AreaChart;
  const DataComponent: typeof Line | typeof Area =
    type === "line" ? Line : Area;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales & Production Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

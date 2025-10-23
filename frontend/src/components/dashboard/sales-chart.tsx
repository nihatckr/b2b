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

interface ChartDataPoint {
  date: string;
  orders: number;
  samples: number;
  revenue?: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  type?: "line" | "area";
  title?: string;
  loading?: boolean;
}

export function SalesChart({
  data,
  type = "area",
  title = "Satış & Üretim Trendi",
  loading = false,
}: SalesChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = type === "line" ? LineChart : AreaChart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Veri bulunamadı
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              {type === "line" ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="samples"
                    stroke="#10b981"
                    dot={false}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="rgba(59,130,246,0.2)"
                  />
                  <Area
                    type="monotone"
                    dataKey="samples"
                    stroke="#10b981"
                    fill="rgba(16,185,129,0.2)"
                  />
                </>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useAuth } from "../../../../context/AuthProvider";

export default function QualityDashboardPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("month");

  // Mock data - replace with real GraphQL query
  const qualityReports = [
    {
      id: 1,
      orderNumber: "ORD-2025-001",
      sampleNumber: null,
      checkDate: "2025-10-12",
      result: "PASSED",
      score: 95,
      inspector: { firstName: "Ahmet", lastName: "Çelik" },
      fabricDefects: 1,
      sewingDefects: 0,
      measureDefects: 0,
      finishingDefects: 0,
      notes: "Excellent quality, minimal defects",
    },
    {
      id: 2,
      orderNumber: "ORD-2025-002",
      sampleNumber: null,
      checkDate: "2025-10-11",
      result: "CONDITIONAL_PASS",
      score: 78,
      inspector: { firstName: "Mehmet", lastName: "Yılmaz" },
      fabricDefects: 2,
      sewingDefects: 2,
      measureDefects: 0,
      finishingDefects: 0,
      notes: "Minor sewing issues, acceptable",
    },
    {
      id: 3,
      orderNumber: null,
      sampleNumber: "SMP-2025-001",
      checkDate: "2025-10-10",
      result: "FAILED",
      score: 45,
      inspector: { firstName: "Ayşe", lastName: "Kaya" },
      fabricDefects: 5,
      sewingDefects: 4,
      measureDefects: 2,
      finishingDefects: 0,
      notes: "Multiple quality issues, requires revision",
    },
  ];

  // Calculate statistics
  const totalReports = qualityReports.length;
  const passedReports = qualityReports.filter(
    (r) => r.result === "PASSED"
  ).length;
  const failedReports = qualityReports.filter(
    (r) => r.result === "FAILED"
  ).length;
  const conditionalReports = qualityReports.filter(
    (r) => r.result === "CONDITIONAL_PASS"
  ).length;
  const averageScore =
    qualityReports.reduce((sum, r) => sum + r.score, 0) / totalReports;

  const passRate = ((passedReports / totalReports) * 100).toFixed(1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quality Control Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage quality inspections
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passRate}%</div>
            <Progress value={parseFloat(passRate)} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {passedReports} of {totalReports} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            {averageScore >= 90 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : averageScore >= 70 ? (
              <Minus className="h-4 w-4 text-amber-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageScore.toFixed(1)}/100
            </div>
            <Progress value={averageScore} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Quality metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedReports}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requires revision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conditional</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {conditionalReports}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minor issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order/Sample
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {qualityReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {report.orderNumber || report.sampleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(report.checkDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.inspector.firstName} {report.inspector.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Progress value={report.score} className="h-2 w-20" />
                        <span className="font-medium">{report.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        <div className="text-xs">
                          F:{report.fabricDefects} S:{report.sewingDefects} M:
                          {report.measureDefects} F:{report.finishingDefects}
                        </div>
                        <div className="text-xs font-medium">
                          Total:{" "}
                          {report.fabricDefects +
                            report.sewingDefects +
                            report.measureDefects +
                            report.finishingDefects}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          report.result === "PASSED"
                            ? "bg-green-100 text-green-700"
                            : report.result === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {report.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {qualityReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No quality reports yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

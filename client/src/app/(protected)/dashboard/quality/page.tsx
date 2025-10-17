"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthProvider";
import { format } from "date-fns";
import {
    AlertCircle,
    CheckCircle2,
    Minus,
    ShieldX,
    TrendingDown,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QualityDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("month");

  // Check if user is manufacturer
  const isManufacturer =
    (user?.role === "MANUFACTURE" ||
      user?.role === "COMPANY_OWNER" ||
      user?.role === "COMPANY_EMPLOYEE") &&
    user?.company?.type === "MANUFACTURER";

  // Redirect non-manufacturers
  useEffect(() => {
    if (user && !isManufacturer && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isManufacturer, router]);

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

  // Show access denied for non-manufacturers
  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Kalite kontrol sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalite Kontrol</h1>
          <p className="text-gray-500 mt-1">
            Kalite denetimlerini izleyin ve yönetin
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Bu Hafta</SelectItem>
            <SelectItem value="month">Bu Ay</SelectItem>
            <SelectItem value="quarter">Bu Çeyrek</SelectItem>
            <SelectItem value="year">Bu Yıl</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passRate}%</div>
            <Progress value={parseFloat(passRate)} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {passedReports} / {totalReports} başarılı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Skor</CardTitle>
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
            <p className="text-xs text-muted-foreground mt-2">Kalite metriği</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedReports}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Revizyon gerekli
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koşullu Geçti</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {conditionalReports}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minör hatalar</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kalite Kontrol Raporları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş/Numune
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontrol Eden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hatalar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sonuç
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
                          K:{report.fabricDefects} D:{report.sewingDefects} Ö:
                          {report.measureDefects} B:{report.finishingDefects}
                        </div>
                        <div className="text-xs font-medium">
                          Toplam:{" "}
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
                        {report.result === "PASSED"
                          ? "Başarılı"
                          : report.result === "FAILED"
                          ? "Başarısız"
                          : "Koşullu Geçti"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {qualityReports.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz kalite kontrol raporu yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

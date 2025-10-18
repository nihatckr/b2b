"use client";

import { PendingStageApprovals } from "@/components/dashboard/PendingStageApprovals";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DASHBOARD_STATS_QUERY,
  MANUFACTURER_ORDERS_QUERY,
  USER_STATS_QUERY,
} from "@/lib/graphql-queries";
import {
  Clock,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { useQuery } from "urql";

interface MonthlyData {
  month: string;
  orders: number;
  samples: number;
  revenue?: number;
}

interface RecentOrder {
  id: string;
  orderNumber?: string;
  status: string;
  createdAt: string;
}

interface RecentSample {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalCollections: number;
  totalSamples: number;
  totalOrders: number;
  totalProductions: number;
  pendingSamples: number;
  activeSamples: number;
  completedSamples: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
  passedQC: number;
  failedQC: number;
  qcPassRate: number;
  monthlyStats: MonthlyData[];
  recentSamples: RecentSample[];
  recentOrders: RecentOrder[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalCollections: number;
  totalOrders: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();

  // Dashboard Stats Query
  const [{ data: dashboardData, fetching: dashboardFetching }] = useQuery({
    query: DASHBOARD_STATS_QUERY,
    variables: { period: "month" },
  });

  // User Stats Query (Admin only)
  const [{ data: userStatsData, fetching: userStatsFetching }] = useQuery({
    query: USER_STATS_QUERY,
    variables: { period: "month" },
    pause:
      !session?.user ||
      (session.user as unknown as { role?: string }).role !== "ADMIN",
  });

  // Manufacturer Orders Query
  const [{ data: manufacturerOrdersData, fetching: ordersFetching }] = useQuery(
    {
      query: MANUFACTURER_ORDERS_QUERY,
      variables: { limit: 10, offset: 0 },
      pause:
        !session?.user ||
        !["MANUFACTURE", "COMPANY_OWNER", "COMPANY_EMPLOYEE"].includes(
          (session.user as unknown as { role?: string }).role || ""
        ),
    }
  );

  const stats = dashboardData?.dashboardStats as DashboardStats | undefined;
  const userStats = userStatsData?.userStats as UserStats | undefined;

  // Process chart data
  const salesChartData = useMemo(() => {
    if (!stats?.monthlyStats) return [];
    return stats.monthlyStats.map((month: MonthlyData) => ({
      date: month.month,
      orders: month.orders,
      samples: month.samples,
      revenue: month.revenue || 0,
    }));
  }, [stats?.monthlyStats]);

  // Process sample status data
  const sampleStatusData = useMemo(() => {
    if (!stats) return [];

    const colorMap: { [key: string]: string } = {
      REQUESTED: "#3b82f6",
      RECEIVED: "#8b5cf6",
      IN_DESIGN: "#ec4899",
      PATTERN_READY: "#f59e0b",
      IN_PRODUCTION: "#10b981",
      QUALITY_CHECK: "#06b6d4",
      COMPLETED: "#22c55e",
      REJECTED: "#ef4444",
      SHIPPED: "#14b8a6",
    };

    return [
      {
        name: "Beklemede",
        value: stats.pendingSamples,
        color: colorMap.REQUESTED,
      },
      {
        name: "Aktif",
        value: stats.activeSamples,
        color: colorMap.IN_PRODUCTION,
      },
      {
        name: "Tamamlanan",
        value: stats.completedSamples,
        color: colorMap.COMPLETED,
      },
    ];
  }, [stats]);

  // Process order status data
  const orderStatusData = useMemo(() => {
    if (!stats) return [];

    const colorMap: { [key: string]: string } = {
      PENDING: "#f59e0b",
      REVIEWED: "#8b5cf6",
      QUOTE_SENT: "#3b82f6",
      CONFIRMED: "#22c55e",
      IN_PRODUCTION: "#10b981",
      COMPLETED: "#059669",
      SHIPPED: "#14b8a6",
      DELIVERED: "#22c55e",
      REJECTED: "#ef4444",
      CANCELLED: "#9ca3af",
    };

    return [
      {
        name: "Beklemede",
        value: stats.pendingOrders,
        color: colorMap.PENDING,
      },
      {
        name: "Aktif",
        value: stats.activeOrders,
        color: colorMap.IN_PRODUCTION,
      },
      {
        name: "Tamamlanan",
        value: stats.completedOrders,
        color: colorMap.COMPLETED,
      },
    ];
  }, [stats]);

  // Recent activities
  const recentActivities = useMemo(() => {
    if (!stats) return [];

    const activities: Array<{
      id: string;
      type: "order" | "sample";
      title: string;
      description: string;
      timestamp: string;
      status: string;
    }> = [];

    stats.recentOrders?.forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        title: `Sipariş #${order.orderNumber || order.id}`,
        description: "Yeni sipariş oluşturuldu",
        timestamp: order.createdAt,
        status: order.status,
      });
    });

    stats.recentSamples?.forEach((sample) => {
      activities.push({
        id: `sample-${sample.id}`,
        type: "sample",
        title: `Örnek: ${sample.name}`,
        description: "Yeni örnek istendi",
        timestamp: sample.createdAt,
        status: sample.status,
      });
    });

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 8);
  }, [stats]);

  if (dashboardFetching || userStatsFetching) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = userRole === "ADMIN";
  const isManufacturer = [
    "MANUFACTURE",
    "COMPANY_OWNER",
    "COMPANY_EMPLOYEE",
  ].includes(userRole || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin
            ? "🎯 Admin Panosu"
            : isManufacturer
            ? "🏭 Üretici Panosu"
            : "👤 Müşteri Panosu"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Hoş geldiniz, {session?.user?.name}
        </p>
      </div>

      {/* Admin Dashboard */}
      {isAdmin && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Kullanıcı"
              value={userStats?.totalUsers || 0}
              icon={Users}
              description="Kayıtlı kullanıcılar"
              loading={userStatsFetching}
            />
            <StatCard
              title="Toplam Koleksiyon"
              value={stats?.totalCollections || 0}
              icon={Package}
              description="Yayınlanan koleksiyonlar"
              loading={dashboardFetching}
            />
            <StatCard
              title="Toplam Sipariş"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              description="Tüm siparişler"
              loading={dashboardFetching}
            />
            <StatCard
              title="QC Geçme Oranı"
              value={`${(stats?.qcPassRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              description="Kalite kontrol"
              loading={dashboardFetching}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart
              data={salesChartData}
              type="area"
              title="Aylık Satış Trendi"
              loading={dashboardFetching}
            />
            <StatusPieChart
              data={sampleStatusData}
              title="Örnek Durumu Dağılımı"
              loading={dashboardFetching}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatusPieChart
              data={orderStatusData}
              title="Sipariş Durumu Dağılımı"
              loading={dashboardFetching}
            />
            <RecentActivity
              activities={recentActivities}
              loading={dashboardFetching}
            />
          </div>
        </>
      )}

      {/* Manufacturer Dashboard */}
      {isManufacturer && (
        <>
          {/* Pending Approvals */}
          <PendingStageApprovals trackings={[]} loading={false} />

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Örnek"
              value={stats?.totalSamples || 0}
              icon={FileText}
              description="İstenen örnekler"
              loading={dashboardFetching}
            />
            <StatCard
              title="Toplam Sipariş"
              value={manufacturerOrdersData?.manufacturerOrders?.length || 0}
              icon={ShoppingCart}
              description="Aktif siparişler"
              loading={ordersFetching}
            />
            <StatCard
              title="Bekleyen Örnek"
              value={stats?.pendingSamples || 0}
              icon={Clock}
              description="İşlem gerektiren"
              loading={dashboardFetching}
            />
            <StatCard
              title="QC Geçme Oranı"
              value={`${(stats?.qcPassRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              description="Kalite kontrol"
              loading={dashboardFetching}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart
              data={salesChartData}
              type="area"
              title="Aylık Üretim Trendi"
              loading={dashboardFetching}
            />
            <StatusPieChart
              data={sampleStatusData}
              title="Örnek Durumu"
              loading={dashboardFetching}
            />
          </div>
        </>
      )}

      {/* Customer Dashboard */}
      {!isAdmin && !isManufacturer && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Siparişlerim"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              description="Toplam siparişler"
              loading={dashboardFetching}
            />
            <StatCard
              title="Bekleyen Örnek"
              value={stats?.pendingSamples || 0}
              icon={Clock}
              description="İşlem devam ediyor"
              loading={dashboardFetching}
            />
            <StatCard
              title="Tamamlanan Örnek"
              value={stats?.completedSamples || 0}
              icon={FileText}
              description="Hazır örnekler"
              loading={dashboardFetching}
            />
            <StatCard
              title="Toplam Harcama"
              value={`₺${(stats?.totalOrders || 0) * 1000}`}
              icon={TrendingUp}
              description="Tüm siparişler"
              loading={dashboardFetching}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <StatusPieChart
              data={sampleStatusData}
              title="Örnek İlerlemesi"
              loading={dashboardFetching}
            />
            <StatusPieChart
              data={orderStatusData}
              title="Sipariş Durumu"
              loading={dashboardFetching}
            />
          </div>
        </>
      )}
    </div>
  );
}

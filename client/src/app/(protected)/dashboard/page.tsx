"use client";

import {
    Clock,
    FileText,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "urql";
import {
    useDashboardStatsQuery,
    useMyStatsQuery,
    useUserStatsQuery,
} from "../../../__generated__/graphql";
import { PendingStageApprovals } from "../../../components/Dashboard/PendingStageApprovals";
import { RecentActivity } from "../../../components/Dashboard/RecentActivity";
import { SalesChart } from "../../../components/Dashboard/SalesChart";
import { StatCard } from "../../../components/Dashboard/StatCard";
import { StatusPieChart } from "../../../components/Dashboard/StatusPieChart";
import { Skeleton } from "../../../components/ui/skeleton";
import { useAuth } from "../../../context/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  // Queries based on role
  const [{ data: dashboardQueryData, fetching: dashboardFetching }] =
    useDashboardStatsQuery({
      pause: user?.role !== "ADMIN",
      requestPolicy: "cache-and-network",
    });

  // Extract dashboard stats for easier access
  const dashboardData = dashboardQueryData?.dashboardStats;

  const [{ data: userStatsData }] = useUserStatsQuery({
    pause: user?.role !== "ADMIN",
    requestPolicy: "cache-and-network",
  });

  const [{ data: myStatsData, fetching: myStatsFetching }] = useMyStatsQuery({
    pause: user?.role === "ADMIN",
    requestPolicy: "cache-and-network",
  });

  // Get manufacturer orders for manufacturer users
  const [{ data: manufacturerOrdersData }] = useQuery({
    query: `
      query ManufacturerOrders {
        manufacturerOrders {
          id
          orderNumber
          status
          totalPrice
        }
      }
    `,
    pause: !user || (user.role !== "MANUFACTURE" && user.role !== "COMPANY_OWNER" && user.role !== "COMPANY_EMPLOYEE"),
    requestPolicy: "cache-and-network",
  });

  // Calculate totals BEFORE any conditional returns
  const totalRevenue = useMemo(() => {
    return (
      dashboardData?.recentOrders?.reduce(
        (sum: number, order: any) => sum + (order.totalPrice || 0),
        0
      ) || 0
    );
  }, [dashboardData]);

  const myTotalRevenue = useMemo(() => {
    return (
      myStatsData?.myOrders?.reduce(
        (sum: number, order: any) => sum + (order.totalPrice || 0),
        0
      ) || 0
    );
  }, [myStatsData]);

  // Process data for charts
  const salesChartData = useMemo(() => {
    if (!dashboardData?.recentOrders || !dashboardData?.recentSamples) return [];

    // Group by month
    const monthlyData: { [key: string]: { orders: number; samples: number } } =
      {};

    dashboardData.recentOrders.forEach((order: any) => {
      const month = new Date(order.createdAt).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) monthlyData[month] = { orders: 0, samples: 0 };
      monthlyData[month].orders += order.totalPrice || 0;
    });

    dashboardData.recentSamples.forEach((sample: any) => {
      const month = new Date(sample.createdAt).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) monthlyData[month] = { orders: 0, samples: 0 };
      monthlyData[month].samples += 1;
    });

    return Object.entries(monthlyData)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .slice(-6); // Last 6 months
  }, [dashboardData]);

  const sampleStatusData = useMemo(() => {
    if (!dashboardData?.recentSamples) return [];

    const statusCount: { [key: string]: number } = {};
    dashboardData.recentSamples.forEach((sample: any) => {
      statusCount[sample.status] = (statusCount[sample.status] || 0) + 1;
    });

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

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || "#6b7280",
    }));
  }, [dashboardData]);

  const orderStatusData = useMemo(() => {
    if (!dashboardData?.recentOrders) return [];

    const statusCount: { [key: string]: number } = {};
    dashboardData.recentOrders.forEach((order: any) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

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

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || "#6b7280",
    }));
  }, [dashboardData]);

  const recentActivities = useMemo(() => {
    if (!dashboardData) return [];

    const activities: any[] = [];

    // Add recent orders
    dashboardData.recentOrders?.slice(0, 3).forEach((order: any) => {
      activities.push({
        id: `order-${order.id}`,
        type: "order",
        title: `Order ${order.id}`,
        description: `New order placed`,
        timestamp: order.createdAt,
        status: order.status,
      });
    });

    // Add recent samples
    dashboardData.recentSamples?.slice(0, 3).forEach((sample: any) => {
      activities.push({
        id: `sample-${sample.id}`,
        type: "sample",
        title: `Sample ${sample.id}`,
        description: `Sample requested`,
        timestamp: sample.createdAt,
        status: sample.status,
      });
    });

    // Add recent users (if available in future)
    // dashboardData.recentUsers?.slice(0, 2).forEach((user: any) => {
    //   activities.push({
    //     id: `user-${user.id}`,
    //     type: "user",
    //     title: "New user registered",
    //     description: `${user.role} user joined`,
    //     timestamp: user.createdAt,
    //   });
    // });

    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [dashboardData]);

  if (dashboardFetching || myStatsFetching) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === "ADMIN"
            ? "🎯 Admin Dashboard"
            : user?.role === "MANUFACTURE"
            ? "🏭 Manufacturer Dashboard"
            : user?.role === "COMPANY_OWNER"
            ? "👨‍💼 Company Owner Dashboard"
            : "👤 Customer Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {user?.company?.name
            ? `Welcome back, ${user.firstName || user.name} - ${
                user.company.name
              }`
            : `Welcome back, ${user?.firstName || user?.name}`}
        </p>
      </div>

      {/* Admin Dashboard */}
      {user?.role === "ADMIN" && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={userStatsData?.userStats?.totalUsers || 0}
              icon={Users}
              description="Registered users"
            />
            <StatCard
              title="Active Collections"
              value={dashboardData?.totalCollections || 0}
              icon={Package}
              description="Published collections"
            />
            <StatCard
              title="Total Orders"
              value={dashboardData?.totalOrders || 0}
              icon={ShoppingCart}
              description="All time orders"
            />
            <StatCard
              title="Total Revenue"
              value={`₺${totalRevenue.toLocaleString("tr-TR")}`}
              icon={TrendingUp}
              description="Gross revenue"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart data={salesChartData} type="area" />
            <StatusPieChart
              data={sampleStatusData}
              title="Sample Status Distribution"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatusPieChart
              data={orderStatusData}
              title="Order Status Distribution"
            />
            <RecentActivity activities={recentActivities.slice(0, 8)} />
          </div>
        </>
      )}

      {/* Manufacturer Dashboard */}
      {(user?.role === "MANUFACTURE" ||
        user?.role === "COMPANY_OWNER" ||
        user?.role === "COMPANY_EMPLOYEE") &&
        user?.company?.type !== "BUYER" && (
          <>
            {/* Pending Stage Approvals */}
            <PendingStageApprovals />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="My Samples"
                value={myStatsData?.mySamples?.length || 0}
                icon={FileText}
                description="Requested samples"
              />
              <StatCard
                title="My Orders"
                value={
                  user?.role === "MANUFACTURE" || user?.role === "COMPANY_OWNER" || user?.role === "COMPANY_EMPLOYEE"
                    ? manufacturerOrdersData?.manufacturerOrders?.length || 0
                    : myStatsData?.myOrders?.length || 0
                }
                icon={ShoppingCart}
                description="Active orders"
              />
              <StatCard
                title="Pending Samples"
                value={
                  myStatsData?.mySamples?.filter(
                    (s: any) =>
                      s.status === "REQUESTED" || s.status === "RECEIVED"
                  ).length || 0
                }
                icon={Clock}
                description="Waiting for action"
              />
              <StatCard
                title="Revenue"
                value={`₺${myTotalRevenue.toLocaleString("tr-TR")}`}
                icon={TrendingUp}
                description="From my orders"
              />
            </div>

            {myStatsData && (
              <div className="grid gap-4 md:grid-cols-2">
                <StatusPieChart
                  data={
                    myStatsData.mySamples
                      ? Object.entries(
                          myStatsData.mySamples.reduce((acc: any, s: any) => {
                            acc[s.status] = (acc[s.status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([name, value]) => ({
                          name,
                          value: value as number,
                          color:
                            {
                              REQUESTED: "#3b82f6",
                              IN_PRODUCTION: "#10b981",
                              COMPLETED: "#22c55e",
                            }[name] || "#6b7280",
                        }))
                      : []
                  }
                  title="My Sample Status"
                />
                <StatusPieChart
                  data={
                    myStatsData.myOrders
                      ? Object.entries(
                          myStatsData.myOrders.reduce((acc: any, o: any) => {
                            acc[o.status] = (acc[o.status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([name, value]) => ({
                          name,
                          value: value as number,
                          color:
                            {
                              PENDING: "#f59e0b",
                              CONFIRMED: "#22c55e",
                              IN_PRODUCTION: "#10b981",
                              DELIVERED: "#059669",
                            }[name] || "#6b7280",
                        }))
                      : []
                  }
                  title="My Order Status"
                />
              </div>
            )}
          </>
        )}

      {/* Customer/Buyer Dashboard */}
      {(user?.role === "CUSTOMER" ||
        user?.role === "INDIVIDUAL_CUSTOMER" ||
        (user?.company?.type === "BUYER" && user?.role !== "ADMIN")) && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="My Orders"
              value={myStatsData?.myOrders?.length || 0}
              icon={ShoppingCart}
              description="Total orders"
            />
            <StatCard
              title="Pending Samples"
              value={
                myStatsData?.mySamples?.filter(
                  (s: any) =>
                    s.status === "REQUESTED" ||
                    s.status === "IN_DESIGN" ||
                    s.status === "IN_PRODUCTION"
                ).length || 0
              }
              icon={Clock}
              description="In progress"
            />
            <StatCard
              title="Completed Samples"
              value={
                myStatsData?.mySamples?.filter(
                  (s: any) => s.status === "COMPLETED"
                ).length || 0
              }
              icon={FileText}
              description="Ready samples"
            />
            <StatCard
              title="Total Spent"
              value={`₺${myTotalRevenue.toLocaleString("tr-TR")}`}
              icon={TrendingUp}
              description="All orders"
            />
          </div>

          {myStatsData && (
            <div className="grid gap-4 md:grid-cols-2">
              <StatusPieChart
                data={
                  myStatsData.mySamples
                    ? Object.entries(
                        myStatsData.mySamples.reduce((acc: any, s: any) => {
                          acc[s.status] = (acc[s.status] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({
                        name,
                        value: value as number,
                        color:
                          {
                            REQUESTED: "#3b82f6",
                            IN_DESIGN: "#8b5cf6",
                            IN_PRODUCTION: "#10b981",
                            COMPLETED: "#22c55e",
                            SHIPPED: "#14b8a6",
                          }[name] || "#6b7280",
                      }))
                    : []
                }
                title="My Sample Progress"
              />
              <StatusPieChart
                data={
                  myStatsData.myOrders
                    ? Object.entries(
                        myStatsData.myOrders.reduce((acc: any, o: any) => {
                          acc[o.status] = (acc[o.status] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({
                        name,
                        value: value as number,
                        color:
                          {
                            PENDING: "#f59e0b",
                            CONFIRMED: "#22c55e",
                            IN_PRODUCTION: "#10b981",
                            DELIVERED: "#059669",
                          }[name] || "#6b7280",
                      }))
                    : []
                }
                title="My Order Status"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

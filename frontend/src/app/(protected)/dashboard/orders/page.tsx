"use client";

import { BuyerOrdersDocument } from "@/__generated__/graphql";
import {
  DataCard,
  DataTable,
  EmptyState,
  FilterBar,
  LoadingState,
  PageHeader,
  Pagination,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toRelativeTime } from "@/lib/date-utils";
import { Eye, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "urql";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REVIEWED: "bg-blue-100 text-blue-800 border-blue-200",
  QUOTE_SENT: "bg-purple-100 text-purple-800 border-purple-200",
  CUSTOMER_QUOTE_SENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  IN_PRODUCTION: "bg-orange-100 text-orange-800 border-orange-200",
  SHIPPED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const statusLabels = {
  PENDING: "Beklemede",
  REVIEWED: "İncelendi",
  QUOTE_SENT: "Teklif Gönderildi",
  CUSTOMER_QUOTE_SENT: "Müşteri Teklifi",
  CONFIRMED: "Onaylandı",
  IN_PRODUCTION: "Üretimde",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  REJECTED: "Reddedildi",
  CANCELLED: "İptal Edildi",
} as const;

export default function OrdersPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const take = 20;
  const skip = (currentPage - 1) * take;

  const [{ data, fetching, error }] = useQuery({
    query: BuyerOrdersDocument,
    variables: {
      skip,
      take,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: search.trim() || undefined,
    },
  });

  const orders = data?.orders || [];
  const isBuyer = session?.user?.companyType === "BUYER";

  const getOrderStatusBadge = (status: string) => {
    const colorClass =
      statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
    const label = statusLabels[status as keyof typeof statusLabels] || status;

    return (
      <Badge variant="outline" className={`${colorClass} text-xs`}>
        {label}
      </Badge>
    );
  };

  const formatCurrency = (
    amount: number | null | undefined,
    currency: string | null | undefined
  ) => {
    if (!amount) return "-";
    const currencySymbol =
      currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$";
    return `${amount.toLocaleString()} ${currencySymbol}`;
  };

  if (fetching) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title={isBuyer ? "Siparişlerim" : "Gelen Siparişler"}
          description={
            isBuyer
              ? "Verdiğiniz siparişleri takip edin"
              : "Gelen siparişleri yönetin"
          }
          icon={<Package className="h-6 w-6" />}
        />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <DataCard
          title="Hata Oluştu"
          description="Siparişler yüklenirken bir hata oluştu"
          icon={<Package className="h-5 w-5 text-red-500" />}
        >
          <div className="text-center py-6">
            <p className="text-red-600">{error.message}</p>
          </div>
        </DataCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title={isBuyer ? "Siparişlerim" : "Gelen Siparişler"}
        description={
          isBuyer
            ? "Verdiğiniz siparişleri takip edin"
            : "Gelen siparişleri yönetin"
        }
        icon={<Package className="h-6 w-6" />}
      />

      {/* Filters */}
      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Sipariş no, koleksiyon veya firma ara...",
        }}
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "Tüm Durumlar" },
              { value: "PENDING", label: "Beklemede" },
              { value: "REVIEWED", label: "İncelendi" },
              { value: "QUOTE_SENT", label: "Teklif Gönderildi" },
              { value: "CONFIRMED", label: "Onaylandı" },
              { value: "IN_PRODUCTION", label: "Üretimde" },
              { value: "SHIPPED", label: "Kargoda" },
              { value: "DELIVERED", label: "Teslim Edildi" },
            ],
            placeholder: "Durum",
          },
        ]}
      />
      {/* Orders Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Siparişler ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState
              icon={<Package className="h-12 w-12" />}
              title={
                search || statusFilter !== "ALL"
                  ? "Arama kriterlerinize uygun sipariş bulunamadı"
                  : isBuyer
                  ? "Henüz sipariş vermediniz"
                  : "Henüz sipariş almadınız"
              }
              description={
                isBuyer
                  ? "Koleksiyonlara göz atıp sipariş oluşturabilirsiniz"
                  : "Müşteriler sizden sipariş talep ettiğinde burada görünecek"
              }
              action={
                isBuyer ? (
                  <Link href="/dashboard/collections">
                    <Button>Koleksiyonları İncele</Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <DataTable
              data={orders}
              columns={[
                {
                  header: "Sipariş No",
                  className: "w-[120px]",
                  cell: (order) => (
                    <span className="font-medium">{order.orderNumber}</span>
                  ),
                },
                {
                  header: "Koleksiyon",
                  cell: (order) => (
                    <div className="flex items-center gap-3">
                      {order.collection?.images &&
                        JSON.parse(order.collection.images)[0] && (
                          <Image
                            src={JSON.parse(order.collection.images)[0]}
                            alt={order.collection.name || "Koleksiyon"}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {order.collection?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.collection?.modelCode}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Durum",
                  className: "w-[100px]",
                  cell: (order) =>
                    getOrderStatusBadge(order.status || "PENDING"),
                },
                {
                  header: "Miktar",
                  className: "w-[80px]",
                  align: "right",
                  cell: (order) => order.quantity?.toLocaleString(),
                },
                {
                  header: "Hedef Fiyat",
                  className: "w-[120px]",
                  align: "right",
                  cell: (order) =>
                    order.targetPrice
                      ? formatCurrency(order.targetPrice, order.currency)
                      : "-",
                },
                {
                  header: isBuyer ? "Üretici" : "Müşteri",
                  className: "w-[120px]",
                  cell: (order) => (
                    <div className="text-sm truncate">
                      {isBuyer
                        ? order.collection?.company?.name
                        : order.customer?.name}
                    </div>
                  ),
                },
                {
                  header: "Tarih",
                  className: "w-[100px]",
                  cell: (order) => (
                    <div className="text-sm">
                      {toRelativeTime(order.createdAt)}
                    </div>
                  ),
                },
                {
                  header: "İşlemler",
                  className: "w-[80px]",
                  align: "center",
                  cell: (order) => (
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  ),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {orders.length >= take && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((orders.length || 0) / take)}
          onPageChange={setCurrentPage}
          hasNextPage={orders.length === take}
        />
      )}
    </div>
  );
}

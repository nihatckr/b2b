"use client";

import { useState } from "react";
import { useQuery } from "urql";
import { BuyerOrdersDocument } from "@/__generated__/graphql";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";

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
  const [skip, setSkip] = useState(0);
  const take = 20;

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
  const isBuyer = session?.user?.company?.type === "BUYER";

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Bir hata oluştu
            </h3>
            <p className="text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isBuyer ? "Siparişlerim" : "Gelen Siparişler"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isBuyer
            ? "Verdiğiniz siparişleri takip edin"
            : "Gelen siparişleri yönetin"}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Sipariş no, koleksiyon ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="REVIEWED">İncelendi</SelectItem>
                <SelectItem value="QUOTE_SENT">Teklif Gönderildi</SelectItem>
                <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                <SelectItem value="IN_PRODUCTION">Üretimde</SelectItem>
                <SelectItem value="SHIPPED">Kargoda</SelectItem>
                <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Siparişler ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 py-4 border-b">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search || statusFilter !== "ALL"
                  ? "Arama kriterlerinize uygun sipariş bulunamadı"
                  : isBuyer
                  ? "Henüz sipariş vermediniz"
                  : "Henüz sipariş almadınız"}
              </h3>
              <p className="text-gray-500 mb-4">
                {isBuyer
                  ? "Koleksiyonlara göz atıp sipariş oluşturabilirsiniz"
                  : "Müşteriler sizden sipariş talep ettiğinde burada görünecek"}
              </p>
              {isBuyer && (
                <Link href="/dashboard/collections">
                  <Button>Koleksiyonları İncele</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Sipariş No</TableHead>
                    <TableHead>Koleksiyon</TableHead>
                    <TableHead className="w-[100px]">Durum</TableHead>
                    <TableHead className="w-[80px] text-right">Miktar</TableHead>
                    <TableHead className="w-[120px] text-right">Hedef Fiyat</TableHead>
                    <TableHead className="w-[120px]">{isBuyer ? "Üretici" : "Müşteri"}</TableHead>
                    <TableHead className="w-[100px]">Tarih</TableHead>
                    <TableHead className="w-[80px] text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {order.collection?.images &&
                            JSON.parse(order.collection.images)[0] && (
                              <Image
                                src={JSON.parse(order.collection.images)[0]}
                                alt={order.collection.name}
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
                      </TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.quantity?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.targetPrice
                          ? formatCurrency(order.targetPrice, order.currency)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate">
                          {isBuyer
                            ? order.collection?.company?.name
                            : order.customer?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(order.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {orders.length >= take && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSkip(Math.max(0, skip - take))}
            disabled={skip === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <Button
            variant="outline"
            onClick={() => setSkip(skip + take)}
            disabled={orders.length < take}
            className="flex items-center gap-2"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
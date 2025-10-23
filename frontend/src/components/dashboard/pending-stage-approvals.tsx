"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

const STAGE_LABELS: { [key: string]: string } = {
  PLANNING: "📋 Planlama",
  FABRIC: "🧵 Kumaş Tedarik",
  CUTTING: "✂️ Kesim",
  SEWING: "🪡 Dikiş",
  QUALITY: "✅ Kalite Kontrol",
  PACKAGING: "📦 Paketleme",
  SHIPPING: "🚚 Sevkiyat",
};

interface StageUpdate {
  id: string;
  stage: string;
  status: string;
  estimatedDays?: number;
  actualStartDate?: string;
}

interface OrderRef {
  id: string;
  orderNumber: string;
}

interface SampleRef {
  id: string;
  sampleNumber: string;
}

interface Tracking {
  id: string;
  currentStage: string;
  overallStatus: string;
  estimatedEndDate?: string;
  order?: OrderRef;
  sample?: SampleRef;
  stageUpdates?: StageUpdate[];
}

interface PendingStageApprovalsProps {
  trackings?: Tracking[];
  loading?: boolean;
}

export function PendingStageApprovals({ 
  trackings = [], 
  loading = false 
}: PendingStageApprovalsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Onay Bekleyen Aşamalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter trackings that need approval
  const pendingApprovals = trackings.filter((tracking) => {
    if (tracking.overallStatus !== "IN_PROGRESS") {
      return false;
    }

    if (!tracking.estimatedEndDate) {
      return false;
    }

    const now = new Date();
    const estimatedEnd = new Date(tracking.estimatedEndDate);
    const hoursUntilEnd = (estimatedEnd.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilEnd <= 6 && hoursUntilEnd > 0;
  });

  if (pendingApprovals.length === 0 && trackings.length === 0) {
    return null;
  }

  if (pendingApprovals.length === 0 && trackings.length > 0) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-5 w-5" />
            Tüm Aşamalar Zamanında İlerliyor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Şu anda onay bekleyen aşama bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <AlertCircle className="h-5 w-5" />
          Onay Bekleyen Aşamalar ({pendingApprovals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingApprovals.map((tracking) => {
            const currentStageUpdate = tracking.stageUpdates?.find(
              (u) => u.stage === tracking.currentStage
            );

            const startDate = currentStageUpdate?.actualStartDate
              ? new Date(currentStageUpdate.actualStartDate)
              : new Date();
            const estimatedEnd = new Date(startDate);
            if (currentStageUpdate?.estimatedDays) {
              estimatedEnd.setDate(estimatedEnd.getDate() + currentStageUpdate.estimatedDays);
            }

            const now = new Date();
            const hoursUntilEnd = Math.max(
              0,
              (estimatedEnd.getTime() - now.getTime()) / (1000 * 60 * 60)
            );

            const referenceNumber = tracking.order?.orderNumber || tracking.sample?.sampleNumber;
            const detailLink = tracking.order
              ? `/dashboard/orders/${tracking.order.id}`
              : `/dashboard/samples/${tracking.sample?.id}`;

            return (
              <div
                key={tracking.id}
                className="p-4 bg-white border-2 border-amber-300 rounded-lg space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(detailLink)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-amber-600 text-white">
                        {STAGE_LABELS[tracking.currentStage] || tracking.currentStage}
                      </Badge>
                      <span className="text-sm text-gray-600">#{referenceNumber}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Kalan Süre: {hoursUntilEnd.toFixed(1)} saat
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tahmini Bitiş</span>
                    <span className="font-medium">
                      {estimatedEnd.toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, ((6 - hoursUntilEnd) / 6) * 100)}
                    className="h-2"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 p-2 rounded">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-medium">
                    Aşama tamamlama onayı gerekiyor
                  </span>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="sm"
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(detailLink);
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    İncele
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

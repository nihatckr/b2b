"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface UsageCardProps {
  label: string;
  current: number;
  max: number;
  percentage: number;
  isNearLimit?: boolean;
  unit?: string;
}

export function UsageCard({
  label,
  current,
  max,
  percentage,
  isNearLimit,
  unit = "items",
}: UsageCardProps) {
  const isUnlimited = max === -1;

  const getColor = () => {
    if (isUnlimited) return "text-blue-600";
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    return "text-green-600";
  };

  const getIcon = () => {
    if (isUnlimited) return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
    if (percentage >= 90)
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (percentage >= 80)
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={cn("text-2xl font-bold", getColor())}>
              {current}
            </span>
            <span className="text-sm text-muted-foreground">
              {isUnlimited ? "Unlimited" : `/ ${max} ${unit}`}
            </span>
          </div>

          {!isUnlimited && (
            <>
              <Progress
                value={percentage}
                className={cn(
                  "h-2",
                  percentage >= 90 && "bg-red-100",
                  percentage >= 80 && percentage < 90 && "bg-orange-100"
                )}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(0)}% kullanıldı</span>
                {isNearLimit && (
                  <Badge variant="destructive" className="h-5 text-xs">
                    Limit yaklaşıyor
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

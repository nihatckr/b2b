"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Info,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

interface SubscriptionWarningProps {
  type: "LIMIT_WARNING" | "EXPIRY_WARNING" | "PAYMENT_WARNING";
  severity: "INFO" | "WARNING" | "ERROR";
  message: string;
  action?: "UPGRADE" | "RENEW" | "UPDATE_PAYMENT";
  onActionClick?: () => void;
}

export function SubscriptionWarningBanner({
  type,
  severity,
  message,
  action,
  onActionClick,
}: SubscriptionWarningProps) {
  const getIcon = () => {
    if (severity === "ERROR") return <AlertCircle className="h-5 w-5" />;
    if (severity === "WARNING") return <AlertTriangle className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };

  const getActionIcon = () => {
    if (action === "UPGRADE") return <TrendingUp className="h-4 w-4 mr-2" />;
    if (action === "RENEW") return <RefreshCcw className="h-4 w-4 mr-2" />;
    if (action === "UPDATE_PAYMENT")
      return <CreditCard className="h-4 w-4 mr-2" />;
    return null;
  };

  const getActionText = () => {
    if (action === "UPGRADE") return "Planı Yükselt";
    if (action === "RENEW") return "Aboneliği Yenile";
    if (action === "UPDATE_PAYMENT") return "Ödeme Güncelle";
    return "İncele";
  };

  const getVariant = (): "default" | "destructive" => {
    if (severity === "ERROR") return "destructive";
    return "default";
  };

  return (
    <Alert
      variant={getVariant()}
      className={cn(
        severity === "WARNING" &&
          "border-orange-500 bg-orange-50 text-orange-900",
        severity === "INFO" && "border-blue-500 bg-blue-50 text-blue-900"
      )}
    >
      {getIcon()}
      <AlertTitle className="font-semibold">
        {type === "LIMIT_WARNING" && "Kullanım Limiti"}
        {type === "EXPIRY_WARNING" && "Abonelik Süresi"}
        {type === "PAYMENT_WARNING" && "Ödeme Uyarısı"}
      </AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{message}</span>
        {action && onActionClick && (
          <Button
            variant={severity === "ERROR" ? "default" : "outline"}
            size="sm"
            onClick={onActionClick}
            className="ml-4"
          >
            {getActionIcon()}
            {getActionText()}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Subscription System Hooks
 *
 * Bu hook'lar subscription (üyelik) sisteminin frontend katmanını yönetir.
 * Backend'deki subscriptionHelper.ts ile paralel çalışır.
 *
 * Kullanım Senaryoları:
 * 1. Kullanıcı bir işlem yapmadan önce (örn: yeni sample oluştur)
 * 2. Dashboard'da kullanım istatistikleri göstermek
 * 3. Limit aşıldığında uyarı mesajları göstermek
 * 4. Feature access kontrolü (RFQ, API, White Label)
 * 5. Upgrade promosyon banner'ları göstermek
 *
 * @module useSubscription
 * @see backend/src/utils/subscriptionHelper.ts
 */

import {
  CancelSubscriptionDocument,
  CanPerformActionDocument,
  CompanySubscriptionDocument,
  HasFeatureAccessDocument,
  ReactivateSubscriptionDocument,
  SubscriptionWarningsDocument,
  UpgradeSubscriptionDocument,
  UsageStatisticsDocument,
} from "@/__generated__/graphql";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "urql";

// ========================================
// Type Definitions
// ========================================

export type SubscriptionPlan =
  | "FREE"
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE"
  | "CUSTOM";
export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";
export type BillingCycle = "MONTHLY" | "YEARLY";

export type ActionType =
  | "create_user"
  | "create_sample"
  | "create_order"
  | "create_collection";
export type FeatureType =
  | "basic_catalog"
  | "sample_management"
  | "production_tracking"
  | "rfq_system"
  | "advanced_analytics"
  | "api_access"
  | "white_label";

export interface ActionCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  maxLimit?: number;
  usagePercentage?: number;
}

export interface UsageStats {
  current: number;
  max: number;
  percentage: number;
  isNearLimit: boolean; // >80%
}

export interface SubscriptionWarning {
  type: "LIMIT_WARNING" | "EXPIRY_WARNING" | "PAYMENT_WARNING";
  severity: "INFO" | "WARNING" | "ERROR";
  message: string;
  action?: "UPGRADE" | "RENEW" | "UPDATE_PAYMENT";
}

// ========================================
// Hook 1: useSubscription
// Temel subscription bilgilerini getirir
// ========================================

/**
 * Get current company's subscription details
 *
 * @example
 * ```tsx
 * const { subscription, loading } = useSubscription();
 *
 * if (subscription?.subscriptionPlan === "FREE") {
 *   return <UpgradeBanner />;
 * }
 * ```
 */
export function useSubscription() {
  const { data: session } = useSession();

  const [{ data, fetching, error }] = useQuery({
    query: CompanySubscriptionDocument,
    pause: !session?.user?.companyId, // No company = no subscription
  });

  return {
    subscription: data?.myCompany,
    loading: fetching,
    error,
    isActive:
      data?.myCompany?.subscriptionStatus === "ACTIVE" ||
      data?.myCompany?.subscriptionStatus === "TRIAL",
    isPastDue: data?.myCompany?.subscriptionStatus === "PAST_DUE",
    isExpired: data?.myCompany?.subscriptionStatus === "EXPIRED",
    isTrial: data?.myCompany?.subscriptionStatus === "TRIAL",
    plan: data?.myCompany?.subscriptionPlan as SubscriptionPlan,
  };
}

// ========================================
// Hook 2: useActionCheck
// Bir işlem yapılmadan önce limit kontrolü
// ========================================

/**
 * Check if action is allowed before performing it
 *
 * @param action - Type of action to check
 * @param enabled - Whether to run the check (default: true)
 *
 * @example
 * ```tsx
 * const { canPerform, reason } = useActionCheck("create_sample");
 *
 * const handleCreate = () => {
 *   if (!canPerform) {
 *     toast.error(reason);
 *     return;
 *   }
 *   // Proceed with creation...
 * };
 * ```
 */
export function useActionCheck(action: ActionType, enabled: boolean = true) {
  const [{ data, fetching }] = useQuery({
    query: CanPerformActionDocument,
    variables: { action },
    pause: !enabled,
  });

  const result = data?.canPerformAction as ActionCheckResult | undefined;

  return {
    canPerform: result?.allowed ?? false,
    reason: result?.reason,
    currentUsage: result?.currentUsage,
    maxLimit: result?.maxLimit,
    usagePercentage: result?.usagePercentage,
    loading: fetching,
  };
}

// ========================================
// Hook 3: useFeatureAccess
// Feature flag kontrolü (RFQ, API, etc.)
// ========================================

/**
 * Check if current subscription plan has access to feature
 *
 * @param feature - Feature name to check
 *
 * @example
 * ```tsx
 * const { hasAccess } = useFeatureAccess("rfq_system");
 *
 * if (!hasAccess) {
 *   return <FeatureLockedCard feature="RFQ System" />;
 * }
 * ```
 */
export function useFeatureAccess(feature: FeatureType) {
  const [{ data, fetching }] = useQuery({
    query: HasFeatureAccessDocument,
    variables: { feature },
  });

  return {
    hasAccess: data?.hasFeatureAccess ?? false,
    loading: fetching,
  };
}

// ========================================
// Hook 4: useUsageStats
// Detaylı kullanım istatistikleri
// ========================================

/**
 * Get detailed usage statistics for all resources
 *
 * @example
 * ```tsx
 * const { stats } = useUsageStats();
 *
 * <UsageCard
 *   label="Samples"
 *   current={stats?.samples.current}
 *   max={stats?.samples.max}
 *   percentage={stats?.samples.percentage}
 * />
 * ```
 */
export function useUsageStats() {
  const [{ data, fetching }] = useQuery({
    query: UsageStatisticsDocument,
  });

  return {
    stats: data?.usageStatistics,
    loading: fetching,
    usersNearLimit: data?.usageStatistics?.users?.isNearLimit ?? false,
    samplesNearLimit: data?.usageStatistics?.samples?.isNearLimit ?? false,
    ordersNearLimit: data?.usageStatistics?.orders?.isNearLimit ?? false,
    collectionsNearLimit:
      data?.usageStatistics?.collections?.isNearLimit ?? false,
    storageNearLimit: data?.usageStatistics?.storage?.isNearLimit ?? false,
  };
}

// ========================================
// Hook 5: useSubscriptionWarnings
// Uyarı mesajlarını getirir
// ========================================

/**
 * Get subscription warnings (limits, expiry, payment issues)
 *
 * @example
 * ```tsx
 * const { warnings } = useSubscriptionWarnings();
 *
 * {warnings.map(warning => (
 *   <Alert key={warning.message} severity={warning.severity}>
 *     {warning.message}
 *   </Alert>
 * ))}
 * ```
 */
export function useSubscriptionWarnings() {
  const [{ data, fetching }] = useQuery({
    query: SubscriptionWarningsDocument,
  });

  const warnings = (data?.subscriptionWarnings ?? []) as SubscriptionWarning[];

  return {
    warnings,
    hasWarnings: warnings.length > 0,
    criticalWarnings: warnings.filter((w) => w.severity === "ERROR"),
    loading: fetching,
  };
}

// ========================================
// Hook 6: useUpgradeSubscription
// Subscription yükseltme mutation'ı
// ========================================

/**
 * Upgrade subscription to a higher plan
 *
 * @example
 * ```tsx
 * const { upgrade, upgrading } = useUpgradeSubscription();
 *
 * const handleUpgrade = async () => {
 *   const result = await upgrade({
 *     plan: "PROFESSIONAL",
 *     billingCycle: "YEARLY"
 *   });
 *
 *   if (result.data?.upgradeSubscription.checkoutUrl) {
 *     window.location.href = result.data.upgradeSubscription.checkoutUrl;
 *   }
 * };
 * ```
 */
export function useUpgradeSubscription() {
  const [{ fetching }, executeMutation] = useMutation(
    UpgradeSubscriptionDocument
  );

  const upgrade = async (variables: {
    plan: SubscriptionPlan;
    billingCycle: BillingCycle;
  }) => {
    return await executeMutation(variables);
  };

  return {
    upgrade,
    upgrading: fetching,
  };
}

// ========================================
// Hook 7: useCancelSubscription
// Subscription iptal mutation'ı
// ========================================

/**
 * Cancel subscription (effective at period end)
 *
 * @example
 * ```tsx
 * const { cancel, cancelling } = useCancelSubscription();
 *
 * const handleCancel = async () => {
 *   const confirmed = await showConfirmDialog();
 *   if (confirmed) {
 *     await cancel({ reason: "Too expensive" });
 *   }
 * };
 * ```
 */
export function useCancelSubscription() {
  const [{ fetching }, executeMutation] = useMutation(
    CancelSubscriptionDocument
  );

  const cancel = async (variables?: { reason?: string }) => {
    return await executeMutation(variables);
  };

  return {
    cancel,
    cancelling: fetching,
  };
}

// ========================================
// Hook 8: useReactivateSubscription
// Subscription yeniden aktifleştirme
// ========================================

/**
 * Reactivate cancelled subscription
 *
 * @example
 * ```tsx
 * const { reactivate, reactivating } = useReactivateSubscription();
 *
 * <Button onClick={reactivate}>
 *   Reactivate Subscription
 * </Button>
 * ```
 */
export function useReactivateSubscription() {
  const [{ fetching }, executeMutation] = useMutation(
    ReactivateSubscriptionDocument
  );

  const reactivate = async () => {
    return await executeMutation({});
  };

  return {
    reactivate,
    reactivating: fetching,
  };
}

// ========================================
// Utility Functions
// ========================================

/**
 * Calculate days until subscription expires
 */
export function getDaysUntilExpiry(
  currentPeriodEnd?: Date | string | null
): number {
  if (!currentPeriodEnd) return 0;

  const endDate = new Date(currentPeriodEnd);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format subscription plan name for display
 */
export function formatPlanName(plan?: SubscriptionPlan): string {
  if (!plan) return "Unknown";

  const names: Record<SubscriptionPlan, string> = {
    FREE: "Free Plan",
    STARTER: "Starter Plan",
    PROFESSIONAL: "Professional Plan",
    ENTERPRISE: "Enterprise Plan",
    CUSTOM: "Custom Plan",
  };

  return names[plan] || plan;
}

/**
 * Get color for usage percentage
 */
export function getUsageColor(
  percentage: number
): "success" | "warning" | "error" {
  if (percentage < 70) return "success";
  if (percentage < 90) return "warning";
  return "error";
}

/**
 * Check if subscription is in grace period (PAST_DUE but still functional)
 */
export function isInGracePeriod(
  status?: SubscriptionStatus,
  daysUntilExpiry?: number
): boolean {
  return status === "PAST_DUE" && (daysUntilExpiry ?? 0) > 0;
}

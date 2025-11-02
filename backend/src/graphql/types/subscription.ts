import builder from "../builder";

// ========================================
// SUBSCRIPTION SYSTEM TYPES
// ========================================

/**
 * ActionCheckResult Type
 * Bir işlemin yapılıp yapılamayacağını kontrol eder
 */
export const ActionCheckResultType = builder
  .objectRef<{
    allowed: boolean;
    reason?: string;
    currentUsage?: number;
    maxLimit?: number;
    usagePercentage?: number;
  }>("ActionCheckResult")
  .implement({
    fields: (t) => ({
      allowed: t.exposeBoolean("allowed"),
      reason: t.exposeString("reason", { nullable: true }),
      currentUsage: t.exposeInt("currentUsage", { nullable: true }),
      maxLimit: t.exposeInt("maxLimit", { nullable: true }),
      usagePercentage: t.exposeFloat("usagePercentage", { nullable: true }),
    }),
  });

/**
 * SubscriptionWarning Type
 * Subscription ile ilgili uyarı mesajları
 */
export const SubscriptionWarningType = builder
  .objectRef<{
    type: "LIMIT_WARNING" | "EXPIRY_WARNING" | "PAYMENT_WARNING";
    severity: "INFO" | "WARNING" | "ERROR";
    message: string;
    action?: "UPGRADE" | "RENEW" | "UPDATE_PAYMENT";
  }>("SubscriptionWarning")
  .implement({
    fields: (t) => ({
      type: t.exposeString("type"),
      severity: t.exposeString("severity"),
      message: t.exposeString("message"),
      action: t.exposeString("action", { nullable: true }),
    }),
  });

/**
 * UsageStats Type
 * Kaynak kullanım istatistikleri (users, samples, orders, collections, storage)
 */
export const UsageStatsItemType = builder
  .objectRef<{
    current: number;
    max: number;
    percentage: number;
    isNearLimit: boolean;
  }>("UsageStatsItem")
  .implement({
    fields: (t) => ({
      current: t.exposeInt("current"),
      max: t.exposeInt("max"),
      percentage: t.exposeFloat("percentage"),
      isNearLimit: t.exposeBoolean("isNearLimit"),
    }),
  });

export const UsageStatisticsType = builder
  .objectRef<{
    users: {
      current: number;
      max: number;
      percentage: number;
      isNearLimit: boolean;
    };
    samples: {
      current: number;
      max: number;
      percentage: number;
      isNearLimit: boolean;
    };
    orders: {
      current: number;
      max: number;
      percentage: number;
      isNearLimit: boolean;
    };
    collections: {
      current: number;
      max: number;
      percentage: number;
      isNearLimit: boolean;
    };
    storage: {
      currentGB: number;
      maxGB: number;
      percentage: number;
      isNearLimit: boolean;
    };
  }>("UsageStatistics")
  .implement({
    fields: (t) => ({
      users: t.field({
        type: UsageStatsItemType,
        resolve: (parent) => parent.users,
      }),
      samples: t.field({
        type: UsageStatsItemType,
        resolve: (parent) => parent.samples,
      }),
      orders: t.field({
        type: UsageStatsItemType,
        resolve: (parent) => parent.orders,
      }),
      collections: t.field({
        type: UsageStatsItemType,
        resolve: (parent) => parent.collections,
      }),
      storage: t.field({
        type: UsageStatsItemType,
        resolve: (parent) => ({
          current: parent.storage.currentGB,
          max: parent.storage.maxGB,
          percentage: parent.storage.percentage,
          isNearLimit: parent.storage.isNearLimit,
        }),
      }),
    }),
  });

/**
 * UpgradeResult Type
 * Subscription upgrade işleminin sonucu
 */
export const UpgradeResultType = builder
  .objectRef<{
    success: boolean;
    message: string;
    checkoutUrl?: string;
  }>("UpgradeResult")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      checkoutUrl: t.exposeString("checkoutUrl", { nullable: true }),
    }),
  });

/**
 * CancelResult Type
 * Subscription iptal işleminin sonucu
 */
export const CancelResultType = builder
  .objectRef<{
    success: boolean;
    message: string;
    effectiveDate?: Date;
  }>("CancelResult")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
      effectiveDate: t.expose("effectiveDate", {
        type: "DateTime",
        nullable: true,
      }),
    }),
  });

/**
 * ReactivateResult Type
 * Subscription yeniden aktifleştirme sonucu
 */
export const ReactivateResultType = builder
  .objectRef<{
    success: boolean;
    message: string;
  }>("ReactivateResult")
  .implement({
    fields: (t) => ({
      success: t.exposeBoolean("success"),
      message: t.exposeString("message"),
    }),
  });

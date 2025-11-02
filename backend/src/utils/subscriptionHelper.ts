import { PrismaClient } from "@prisma/client";

type SubscriptionPlan =
  | "FREE"
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE"
  | "CUSTOM";
type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

/**
 * Subscription Plan Limits
 */
export const PLAN_LIMITS = {
  FREE: {
    maxUsers: 3,
    maxSamples: 10,
    maxOrders: 5,
    maxCollections: 5,
    maxStorageGB: 1,
    features: ["basic_catalog", "basic_orders"],
  },
  STARTER: {
    maxUsers: 10,
    maxSamples: 100,
    maxOrders: 50,
    maxCollections: 20,
    maxStorageGB: 5,
    features: [
      "basic_catalog",
      "basic_orders",
      "sample_management",
      "basic_analytics",
    ],
  },
  PROFESSIONAL: {
    maxUsers: 50,
    maxSamples: 500,
    maxOrders: 200,
    maxCollections: 100,
    maxStorageGB: 20,
    features: [
      "basic_catalog",
      "basic_orders",
      "sample_management",
      "advanced_analytics",
      "production_tracking",
      "quality_management",
      "rfq_system",
    ],
  },
  ENTERPRISE: {
    maxUsers: -1, // unlimited
    maxSamples: -1,
    maxOrders: -1,
    maxCollections: -1,
    maxStorageGB: -1,
    features: [
      "basic_catalog",
      "basic_orders",
      "sample_management",
      "advanced_analytics",
      "production_tracking",
      "quality_management",
      "rfq_system",
      "api_access",
      "white_label",
      "priority_support",
    ],
  },
  CUSTOM: {
    maxUsers: -1,
    maxSamples: -1,
    maxOrders: -1,
    maxCollections: -1,
    maxStorageGB: -1,
    features: ["all"],
  },
} as const;

/**
 * Check if company subscription is active
 */
export function isSubscriptionActive(
  status: SubscriptionStatus,
  currentPeriodEnd?: Date | null
): boolean {
  if (status === "TRIAL" || status === "ACTIVE") {
    // Check if not expired
    if (currentPeriodEnd && new Date() > currentPeriodEnd) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Check if company can perform action based on limits
 */
export async function canPerformAction(
  prisma: PrismaClient,
  companyId: number,
  action: "create_user" | "create_sample" | "create_order" | "create_collection"
): Promise<{ allowed: boolean; reason?: string }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      maxUsers: true,
      maxSamples: true,
      maxOrders: true,
      maxCollections: true,
      currentUsers: true,
      currentSamples: true,
      currentOrders: true,
      currentCollections: true,
    },
  });

  if (!company) {
    return { allowed: false, reason: "Company not found" };
  }

  // Check subscription status
  if (
    !isSubscriptionActive(company.subscriptionStatus, company.currentPeriodEnd)
  ) {
    return {
      allowed: false,
      reason: "Subscription is not active. Please renew your subscription.",
    };
  }

  // Get plan limits
  const limits = PLAN_LIMITS[company.subscriptionPlan];

  // Check specific action limits
  switch (action) {
    case "create_user":
      if (limits.maxUsers !== -1 && company.currentUsers >= company.maxUsers) {
        return {
          allowed: false,
          reason: `User limit reached (${company.maxUsers}). Upgrade your plan to add more users.`,
        };
      }
      break;

    case "create_sample":
      if (
        limits.maxSamples !== -1 &&
        company.currentSamples >= company.maxSamples
      ) {
        return {
          allowed: false,
          reason: `Sample limit reached (${company.maxSamples}). Upgrade your plan to create more samples.`,
        };
      }
      break;

    case "create_order":
      if (
        limits.maxOrders !== -1 &&
        company.currentOrders >= company.maxOrders
      ) {
        return {
          allowed: false,
          reason: `Order limit reached (${company.maxOrders}). Upgrade your plan to create more orders.`,
        };
      }
      break;

    case "create_collection":
      if (
        limits.maxCollections !== -1 &&
        company.currentCollections >= company.maxCollections
      ) {
        return {
          allowed: false,
          reason: `Collection limit reached (${company.maxCollections}). Upgrade your plan to create more collections.`,
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Check if company has access to feature
 */
export function hasFeatureAccess(
  plan: SubscriptionPlan,
  feature: string
): boolean {
  const limits = PLAN_LIMITS[plan];

  if ((limits.features as readonly string[]).includes("all")) {
    return true;
  }

  return (limits.features as readonly string[]).includes(feature);
}
/**
 * Get usage percentage for a resource
 */
export function getUsagePercentage(current: number, max: number): number {
  if (max === -1) return 0; // unlimited
  return Math.min(100, Math.round((current / max) * 100));
}

/**
 * Check if usage is near limit (>80%)
 */
export function isNearLimit(current: number, max: number): boolean {
  if (max === -1) return false; // unlimited
  return getUsagePercentage(current, max) >= 80;
}

/**
 * Get subscription warning messages
 */
export async function getSubscriptionWarnings(
  prisma: PrismaClient,
  companyId: number
): Promise<string[]> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      maxUsers: true,
      maxSamples: true,
      maxOrders: true,
      maxCollections: true,
      currentUsers: true,
      currentSamples: true,
      currentOrders: true,
      currentCollections: true,
    },
  });

  if (!company) return [];

  const warnings: string[] = [];

  // Check subscription expiry
  if (company.currentPeriodEnd) {
    const daysUntilExpiry = Math.ceil(
      (company.currentPeriodEnd.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      warnings.push(`Your subscription expires in ${daysUntilExpiry} days.`);
    }
  }

  // Check near limits
  if (isNearLimit(company.currentUsers, company.maxUsers)) {
    warnings.push(
      `You're using ${company.currentUsers}/${
        company.maxUsers
      } users (${getUsagePercentage(company.currentUsers, company.maxUsers)}%).`
    );
  }

  if (isNearLimit(company.currentSamples, company.maxSamples)) {
    warnings.push(
      `You're using ${company.currentSamples}/${
        company.maxSamples
      } samples (${getUsagePercentage(
        company.currentSamples,
        company.maxSamples
      )}%).`
    );
  }

  if (isNearLimit(company.currentOrders, company.maxOrders)) {
    warnings.push(
      `You're using ${company.currentOrders}/${
        company.maxOrders
      } orders (${getUsagePercentage(
        company.currentOrders,
        company.maxOrders
      )}%).`
    );
  }

  if (isNearLimit(company.currentCollections, company.maxCollections)) {
    warnings.push(
      `You're using ${company.currentCollections}/${
        company.maxCollections
      } collections (${getUsagePercentage(
        company.currentCollections,
        company.maxCollections
      )}%).`
    );
  }

  return warnings;
}

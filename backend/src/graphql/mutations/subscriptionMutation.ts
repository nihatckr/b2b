/**
 * ============================================================================
 * SUBSCRIPTION MUTATIONS
 * ============================================================================
 * Dosya: subscriptionMutation.ts
 * Amaç: Abonelik yönetimi (yükseltme, iptal, reaktivasyon)
 * Versiyon: 2.0.0
 * Standart: GRAPHQL_STANDARDS_TR.md v2.0.0
 *
 * Mutasyonlar:
 * - upgradeSubscription: Abonelik planını yükselt
 * - cancelSubscription: Aboneliği iptal et (dönem sonunda geçerli)
 * - reactivateSubscription: İptal edilmiş aboneliği aktifleştir
 *
 * Güvenlik:
 * - Tüm mutasyonlar companyOwner yetkisi gerektirir
 * - Sadece firma sahipleri abonelik değişiklikleri yapabilir
 * - Validasyon: SubscriptionPlan, BillingCycle enumları
 *
 * Özellikler:
 * - Plan limitleri otomatik uygulanır (users, samples, orders, collections, storage)
 * - Bildirimler otomatik gönderilir
 * - İptal işlemleri dönem sonunda geçerli olur
 * - Reaktivasyon için süre uzatma desteği
 * ============================================================================
 */

// Imports - Errors & Logger
import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";

// Imports - Utils
import { publishNotification } from "../../utils/publishHelpers";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";

// Imports - GraphQL
import builder from "../builder";
import {
  CancelResultType,
  ReactivateResultType,
  UpgradeResultType,
} from "../types/subscription";

// ========================================
// CONSTANTS - SCHEMA ENUMS
// ========================================

/**
 * Geçerli Abonelik Planları (schema.prisma SubscriptionPlan enum)
 * Bu değerler %100 schema ile eşleşmelidir!
 */
const ValidSubscriptionPlans: string[] = [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
  "CUSTOM",
];

/**
 * Geçerli Fatura Döngüleri (schema.prisma BillingCycle enum)
 * Bu değerler %100 schema ile eşleşmelidir!
 */
const ValidBillingCycles: string[] = ["MONTHLY", "YEARLY"];

// ========================================
// INPUT TYPES
// ========================================

/**
 * Subscription plan yükseltme input
 */
const UpgradeSubscriptionInput = builder.inputType("UpgradeSubscriptionInput", {
  fields: (t) => ({
    /** Yeni plan (FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM) */
    plan: t.string({ required: true }),
    /** Fatura döngüsü (MONTHLY, YEARLY) */
    billingCycle: t.string({ required: true }),
  }),
});

/**
 * Subscription iptal input
 */
const CancelSubscriptionInput = builder.inputType("CancelSubscriptionInput", {
  fields: (t) => ({
    /** İptal sebebi (opsiyonel, 10-500 karakter) */
    reason: t.string(),
  }),
});

// ========================================
// SUBSCRIPTION MUTATIONS
// ========================================

/**
 * MUTATION: upgradeSubscription
 *
 * Açıklama: Firma sahibi abonelik planını yükseltir
 * Güvenlik: companyOwner (sadece firma sahipleri)
 * Döner: UpgradeResultType
 *
 * Input:
 * - plan: SubscriptionPlan (FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM)
 * - billingCycle: BillingCycle (MONTHLY, YEARLY)
 *
 * Özellikler:
 * - Plan limitleri otomatik uygulanır
 * - Bildirim otomatik gönderilir
 * - Stripe entegrasyonu için hazır (TODO)
 */
builder.mutationField("upgradeSubscription", (t) =>
  t.field({
    type: UpgradeResultType,
    args: {
      input: t.arg({ type: UpgradeSubscriptionInput, required: true }),
    },
    authScopes: { companyOwner: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("upgradeSubscription");

      try {
        requireAuth(ctx.user?.id);
        const userId = ctx.user!.id;
        const companyId = sanitizeInt(ctx.user?.companyId);
        const plan = sanitizeString(args.input.plan);
        const billingCycle = sanitizeString(args.input.billingCycle);

        if (!companyId) {
          throw new ValidationError("Kullanıcı bir firmaya bağlı değil");
        }

        validateRequired(plan, "Plan");
        validateRequired(billingCycle, "Fatura döngüsü");

        // Enum validasyonu - schema.prisma SubscriptionPlan
        validateEnum(plan, "Plan", ValidSubscriptionPlans);

        // Enum validasyonu - schema.prisma BillingCycle
        validateEnum(billingCycle, "Fatura döngüsü", ValidBillingCycles);

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: { name: true, subscriptionPlan: true, ownerId: true },
        });

        if (!company) {
          throw new ValidationError("Firma bulunamadı");
        }

        if (!company.ownerId || company.ownerId !== userId) {
          throw new ValidationError(
            "Sadece firma sahibi aboneliği yükseltebilir"
          );
        }

        // Calculate period end
        const periodDays = billingCycle === "YEARLY" ? 365 : 30;
        const currentPeriodEnd = new Date(
          Date.now() + periodDays * 24 * 60 * 60 * 1000
        );

        // Plan limits
        let planLimits = {};
        if (plan === "STARTER") {
          planLimits = {
            maxUsers: 10,
            maxSamples: 100,
            maxOrders: 50,
            maxCollections: 20,
            maxStorageGB: 10,
          };
        } else if (plan === "PROFESSIONAL") {
          planLimits = {
            maxUsers: 50,
            maxSamples: 500,
            maxOrders: 200,
            maxCollections: 100,
            maxStorageGB: 100,
          };
        } else if (plan === "ENTERPRISE") {
          planLimits = {
            maxUsers: -1,
            maxSamples: -1,
            maxOrders: -1,
            maxCollections: -1,
            maxStorageGB: -1,
          };
        }

        // Update subscription
        await ctx.prisma.company.update({
          where: { id: companyId },
          data: {
            subscriptionPlan: plan as any,
            subscriptionStatus: "ACTIVE",
            billingCycle: billingCycle as any,
            currentPeriodStart: new Date(),
            currentPeriodEnd,
            subscriptionStartedAt: new Date(),
            ...planLimits,
          },
        });

        // Notification (firma sahibine)
        const notification = await ctx.prisma.notification.create({
          data: {
            userId,
            type: "SYSTEM",
            title: "Abonelik Yükseltildi",
            message: `${plan} planına başarıyla yükseldiniz. ${
              billingCycle === "YEARLY" ? "Yıllık" : "Aylık"
            } fatura döngüsü aktif.`,
          },
        });
        await publishNotification(notification);

        logInfo("Subscription upgraded successfully", {
          metadata: timer.end(),
          companyId,
          userId,
          newPlan: plan,
          billingCycle,
          oldPlan: company.subscriptionPlan,
        });

        // TODO: Stripe entegrasyonu burada yapılacak
        // const session = await stripe.checkout.sessions.create({...});

        return {
          success: true,
          message: `${plan} planına başarıyla yükseltildi`,
        } as { success: boolean; message: string; checkoutUrl?: string };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: cancelSubscription
 *
 * Açıklama: Aboneliği iptal et (dönem sonunda geçerli)
 * Güvenlik: companyOwner (sadece firma sahipleri)
 * Döner: CancelResultType
 *
 * Input:
 * - reason: string (opsiyonel, 10-500 karakter)
 *
 * Özellikler:
 * - İptal dönem sonunda geçerli olur
 * - cancelAtPeriodEnd flag'i set edilir
 * - Bildirim otomatik gönderilir
 * - effectiveDate döndürülür
 */
builder.mutationField("cancelSubscription", (t) =>
  t.field({
    type: CancelResultType,
    args: {
      input: t.arg({ type: CancelSubscriptionInput, required: true }),
    },
    authScopes: { companyOwner: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("cancelSubscription");

      try {
        requireAuth(ctx.user?.id);
        const userId = ctx.user!.id;
        const companyId = sanitizeInt(ctx.user?.companyId);
        const reason = args.input.reason
          ? sanitizeString(args.input.reason)
          : undefined;

        if (!companyId) {
          throw new ValidationError("Kullanıcı bir firmaya bağlı değil");
        }

        if (reason) {
          validateStringLength(reason, "İptal sebebi", 10, 500);
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: {
            name: true,
            currentPeriodEnd: true,
            subscriptionStatus: true,
            ownerId: true,
          },
        });

        if (!company) {
          throw new ValidationError("Firma bulunamadı");
        }

        if (!company.ownerId || company.ownerId !== userId) {
          throw new ValidationError(
            "Sadece firma sahibi aboneliği iptal edebilir"
          );
        }

        if (company.subscriptionStatus === "CANCELLED") {
          throw new ValidationError("Abonelik zaten iptal edilmiş");
        }

        // Cancel at period end
        await ctx.prisma.company.update({
          where: { id: companyId },
          data: {
            cancelAtPeriodEnd: true,
            cancelledAt: new Date(),
          },
        });

        // Notification
        const notification = await ctx.prisma.notification.create({
          data: {
            userId,
            type: "SYSTEM",
            title: "Abonelik İptal Edildi",
            message: `Aboneliğiniz ${
              company.currentPeriodEnd?.toLocaleDateString("tr-TR") ||
              "dönem sonu"
            } tarihinde sona erecek.`,
          },
        });
        await publishNotification(notification);

        logInfo("Subscription cancellation requested", {
          metadata: timer.end(),
          companyId,
          userId,
          reason: reason || "Belirtilmedi",
          effectiveDate: company.currentPeriodEnd,
        });

        return {
          success: true,
          message: `Abonelik dönem sonunda iptal edilecek (${
            company.currentPeriodEnd?.toLocaleDateString("tr-TR") || "N/A"
          })`,
          ...(company.currentPeriodEnd && {
            effectiveDate: company.currentPeriodEnd,
          }),
        };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: reactivateSubscription
 *
 * Açıklama: İptal edilmiş aboneliği yeniden aktifleştir
 * Güvenlik: companyOwner (sadece firma sahipleri)
 * Döner: ReactivateResultType
 *
 * Özellikler:
 * - cancelAtPeriodEnd flag'ini kaldırır
 * - Süresi dolmuş abonelikleri uzatır (30 gün)
 * - subscriptionStatus → ACTIVE
 * - Bildirim otomatik gönderilir
 */
builder.mutationField("reactivateSubscription", (t) =>
  t.field({
    type: ReactivateResultType,
    authScopes: { companyOwner: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("reactivateSubscription");

      try {
        requireAuth(ctx.user?.id);
        const userId = ctx.user!.id;
        const companyId = sanitizeInt(ctx.user?.companyId);

        if (!companyId) {
          throw new ValidationError("Kullanıcı bir firmaya bağlı değil");
        }

        const company = await ctx.prisma.company.findUnique({
          where: { id: companyId },
          select: {
            name: true,
            subscriptionStatus: true,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
            ownerId: true,
          },
        });

        if (!company) {
          throw new ValidationError("Firma bulunamadı");
        }

        if (!company.ownerId || company.ownerId !== userId) {
          throw new ValidationError(
            "Sadece firma sahibi aboneliği yeniden aktifleştirebilir"
          );
        }

        if (
          !company.cancelAtPeriodEnd &&
          company.subscriptionStatus !== "CANCELLED"
        ) {
          throw new ValidationError("Abonelik iptal edilmemiş");
        }

        // Extend period if already expired
        const newPeriodEnd =
          company.currentPeriodEnd && company.currentPeriodEnd < new Date()
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : company.currentPeriodEnd;

        // Reactivate subscription
        await ctx.prisma.company.update({
          where: { id: companyId },
          data: {
            cancelAtPeriodEnd: false,
            cancelledAt: null,
            subscriptionStatus: "ACTIVE",
            ...(newPeriodEnd !== company.currentPeriodEnd && {
              currentPeriodEnd: newPeriodEnd,
            }),
          },
        });

        // Notification
        const notification = await ctx.prisma.notification.create({
          data: {
            userId,
            type: "SYSTEM",
            title: "Abonelik Yeniden Aktifleştirildi",
            message: "Aboneliğiniz başarıyla yeniden aktifleştirildi.",
          },
        });
        await publishNotification(notification);

        logInfo("Subscription reactivated successfully", {
          metadata: timer.end(),
          companyId,
          userId,
        });

        return {
          success: true,
          message: "Abonelik başarıyla yeniden aktifleştirildi",
        };
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

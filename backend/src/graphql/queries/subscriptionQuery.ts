/**
 * Subscription Queries - ABONELİK YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Abonelik planları, kullanım limitleri ve özellik erişim kontrolü
 *
 * 📋 Mevcut Query'ler:
 *
 * STANDART QUERY'LER:
 * - canPerformAction: İşlem yapılabilir mi kontrolü
 * - hasFeatureAccess: Özellik erişim kontrolü
 * - subscriptionWarnings: Abonelik uyarıları
 * - usageStatistics: Detaylı kullanım istatistikleri
 *
 * 🔒 Güvenlik:
 * - Sadece şirket üyeleri kendi şirket verilerini görür
 * - Şirket sahibi tüm abonelik bilgilerine erişir
 * - Admin tümünü görür
 *
 * 💡 Özellikler:
 * - 5 abonelik planı (FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM)
 * - Kullanım limiti takibi (users, samples, orders, collections, storage)
 * - Özellik bazlı erişim kontrolü
 * - Otomatik uyarı sistemi (%80 kullanım, süre dolumu)
 */

import builder from "../builder";

// Hata yönetimi
import { handleError, requireAuth } from "../../utils/errors";

// Loglama
import { createTimer, logInfo } from "../../utils/logger";

// Temizleme (Sanitization)
import { sanitizeString } from "../../utils/sanitize";

// Doğrulama (Validation)
import { validateRequired } from "../../utils/validation";

// Subscription helper fonksiyonları
import {
  canPerformAction,
  getSubscriptionWarnings,
  hasFeatureAccess,
} from "../../utils/subscriptionHelper";

// Subscription types
import {
  ActionCheckResultType,
  SubscriptionWarningType,
  UsageStatisticsType,
} from "../types/subscription";

// ========================================
// SUBSCRIPTION QUERIES
// ========================================

/**
 * QUERY: canPerformAction
 *
 * Açıklama: Bir işlemin yapılıp yapılamayacağını kontrol eder (limit kontrolü)
 * Güvenlik: Doğrulanmış kullanıcı (şirket üyesi)
 * Döner: ActionCheckResultType (allowed, reason, currentUsage, maxLimit, usagePercentage)
 */
builder.queryField("canPerformAction", (t) =>
  t.field({
    type: ActionCheckResultType,
    args: {
      action: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("canPerformAction");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const action = sanitizeString(args.action)!;
        validateRequired(action, "İşlem");

        // Şirket kontrolü
        if (!ctx.user?.companyId) {
          return {
            allowed: false,
            reason: "Kullanıcı bir şirkete bağlı değil",
          };
        }

        // İşlem haritası
        const actionMap: Record<
          string,
          "create_user" | "create_sample" | "create_order" | "create_collection"
        > = {
          create_user: "create_user",
          create_sample: "create_sample",
          create_order: "create_order",
          create_collection: "create_collection",
        };

        const mappedAction = actionMap[action];
        if (!mappedAction) {
          return {
            allowed: false,
            reason: "Geçersiz işlem tipi",
          };
        }

        // İşlem kontrolü
        const result = await canPerformAction(
          ctx.prisma,
          ctx.user.companyId,
          mappedAction
        );

        // Başarıyı logla
        logInfo("İşlem izin kontrolü yapıldı", {
          userId: ctx.user.id,
          companyId: ctx.user.companyId,
          action: mappedAction,
          allowed: result.allowed,
          metadata: timer.end(),
        });

        return result;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: hasFeatureAccess
 *
 * Açıklama: Özellik erişim kontrolü yapar (plan bazlı)
 * Güvenlik: Doğrulanmış kullanıcı (şirket üyesi)
 * Döner: Boolean (erişim var mı?)
 */
builder.queryField("hasFeatureAccess", (t) =>
  t.boolean({
    args: {
      feature: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("hasFeatureAccess");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const feature = sanitizeString(args.feature)!;
        validateRequired(feature, "Özellik");

        // Şirket kontrolü
        if (!ctx.user?.companyId) {
          return false;
        }

        // Şirketi getir
        const company = await ctx.prisma.company.findUnique({
          where: { id: ctx.user.companyId },
          select: { subscriptionPlan: true },
        });

        if (!company) {
          return false;
        }

        // Özellik erişim kontrolü
        const hasAccess = hasFeatureAccess(company.subscriptionPlan, feature);

        // Başarıyı logla
        logInfo("Özellik erişim kontrolü yapıldı", {
          userId: ctx.user.id,
          companyId: ctx.user.companyId,
          feature,
          hasAccess,
          plan: company.subscriptionPlan,
          metadata: timer.end(),
        });

        return hasAccess;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: subscriptionWarnings
 *
 * Açıklama: Abonelik ile ilgili uyarı mesajlarını döndürür
 * Güvenlik: Doğrulanmış kullanıcı (şirket üyesi)
 * Döner: SubscriptionWarningType dizisi
 */
builder.queryField("subscriptionWarnings", (t) =>
  t.field({
    type: [SubscriptionWarningType],
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("subscriptionWarnings");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Şirket kontrolü
        if (!ctx.user?.companyId) {
          return [];
        }

        // Uyarıları getir
        const warnings = await getSubscriptionWarnings(
          ctx.prisma,
          ctx.user.companyId
        );

        // Uyarıları parse et
        const parsedWarnings = warnings.map((message) => {
          // Mesaja göre tip ve aksiyon belirle
          let type: "LIMIT_WARNING" | "EXPIRY_WARNING" | "PAYMENT_WARNING" =
            "LIMIT_WARNING";
          let severity: "INFO" | "WARNING" | "ERROR" = "WARNING";
          let action: "UPGRADE" | "RENEW" | "UPDATE_PAYMENT" | undefined =
            "UPGRADE";

          if (message.includes("ulaştı") || message.includes("limit")) {
            type = "LIMIT_WARNING";
            severity = "ERROR";
            action = "UPGRADE";
          } else if (message.includes("80%") || message.includes("yakın")) {
            type = "LIMIT_WARNING";
            severity = "WARNING";
            action = "UPGRADE";
          } else if (
            message.includes("dolacak") ||
            message.includes("deneme")
          ) {
            type = "EXPIRY_WARNING";
            severity = "WARNING";
            action = "RENEW";
          } else if (message.includes("ödeme")) {
            type = "PAYMENT_WARNING";
            severity = "ERROR";
            action = "UPDATE_PAYMENT";
          }

          return {
            type,
            severity,
            message,
            action,
          };
        });

        // Başarıyı logla
        logInfo("Abonelik uyarıları alındı", {
          userId: ctx.user.id,
          companyId: ctx.user.companyId,
          warningCount: parsedWarnings.length,
          metadata: timer.end(),
        });

        return parsedWarnings;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: usageStatistics
 *
 * Açıklama: Abonelik kullanım istatistiklerini döndürür
 * Güvenlik: Doğrulanmış kullanıcı (şirket üyesi)
 * Döner: UsageStatisticsType
 */
builder.queryField("usageStatistics", (t) =>
  t.field({
    type: UsageStatisticsType,
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("usageStatistics");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Şirket kontrolü
        if (!ctx.user?.companyId) {
          throw new Error("Kullanıcı bir şirkete bağlı değil");
        }

        // Şirket bilgilerini getir
        const company = await ctx.prisma.company.findUnique({
          where: { id: ctx.user.companyId },
          select: {
            maxUsers: true,
            maxSamples: true,
            maxOrders: true,
            maxCollections: true,
            maxStorageGB: true,
            currentUsers: true,
            currentSamples: true,
            currentOrders: true,
            currentCollections: true,
            currentStorageGB: true,
          },
        });

        if (!company) {
          throw new Error("Şirket bulunamadı");
        }

        // Kullanım yüzdelerini hesapla
        const calculatePercentage = (current: number, max: number): number => {
          if (max === -1) return 0; // sınırsız
          return Math.min(100, Math.round((current / max) * 100));
        };

        const isNearLimit = (percentage: number): boolean => percentage >= 80;

        // İstatistikleri oluştur
        const stats = {
          users: {
            current: company.currentUsers,
            max: company.maxUsers,
            percentage: calculatePercentage(
              company.currentUsers,
              company.maxUsers
            ),
            isNearLimit: isNearLimit(
              calculatePercentage(company.currentUsers, company.maxUsers)
            ),
          },
          samples: {
            current: company.currentSamples,
            max: company.maxSamples,
            percentage: calculatePercentage(
              company.currentSamples,
              company.maxSamples
            ),
            isNearLimit: isNearLimit(
              calculatePercentage(company.currentSamples, company.maxSamples)
            ),
          },
          orders: {
            current: company.currentOrders,
            max: company.maxOrders,
            percentage: calculatePercentage(
              company.currentOrders,
              company.maxOrders
            ),
            isNearLimit: isNearLimit(
              calculatePercentage(company.currentOrders, company.maxOrders)
            ),
          },
          collections: {
            current: company.currentCollections,
            max: company.maxCollections,
            percentage: calculatePercentage(
              company.currentCollections,
              company.maxCollections
            ),
            isNearLimit: isNearLimit(
              calculatePercentage(
                company.currentCollections,
                company.maxCollections
              )
            ),
          },
          storage: {
            currentGB: company.currentStorageGB,
            maxGB: company.maxStorageGB,
            percentage: calculatePercentage(
              company.currentStorageGB,
              company.maxStorageGB
            ),
            isNearLimit: isNearLimit(
              calculatePercentage(
                company.currentStorageGB,
                company.maxStorageGB
              )
            ),
          },
        };

        // Başarıyı logla
        logInfo("Kullanım istatistikleri alındı", {
          userId: ctx.user.id,
          companyId: ctx.user.companyId,
          users: `${stats.users.current}/${stats.users.max}`,
          samples: `${stats.samples.current}/${stats.samples.max}`,
          orders: `${stats.orders.current}/${stats.orders.max}`,
          collections: `${stats.collections.current}/${stats.collections.max}`,
          storage: `${stats.storage.currentGB}/${stats.storage.maxGB}GB`,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * Sample Queries - NUMUNE YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Numune talepleri, üretim takibi ve teslimat yönetimi
 *
 * 📋 Mevcut Query'ler:
 *
 * STANDART QUERY'LER:
 * - samples: Numune listesi (filtreleme ve arama ile)
 * - sample: Tekil numune detayı
 * - mySamples: Kullanıcının numuneleri (müşteri veya üretici)
 * - samplesByStatus: Duruma göre numune listesi
 *
 * 🔒 Güvenlik:
 * - Müşteriler kendi numunelerini görür
 * - Üreticiler kendilerine gelen numuneleri görür
 * - Admin tümünü görür
 *
 * 💡 Özellikler:
 * - Durum bazlı filtreleme (28 farklı durum)
 * - Tam metin arama (numune numarası, isim)
 * - AI tasarım desteği
 * - Dinamik görev oluşturma
 * - Gerçek zamanlı bildirimler
 */

import builder from "../builder";

// Hata yönetimi
import {
  ForbiddenError,
  handleError,
  NotFoundError,
  requireAuth,
} from "../../utils/errors";

// Loglama
import { createTimer, logInfo } from "../../utils/logger";

// Temizleme (Sanitization)
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";

// Doğrulama (Validation)
import { validateEnum, validateRequired } from "../../utils/validation";

// ========================================
// INPUT TYPES
// ========================================

/**
 * Numune filtreleme input'u
 * Durum ve arama bazlı filtreleme
 */
const SampleFilterInput = builder.inputType("SampleFilterInput", {
  fields: (t) => ({
    status: t.string(), // SampleStatus enum
    search: t.string(), // Numune numarası veya isim
    customerId: t.int(), // Müşteri ID
    manufacturerId: t.int(), // Üretici ID
    collectionId: t.int(), // Koleksiyon ID
  }),
});

/**
 * Sayfalama input'u
 * skip: Kaç kayıt atlanacak
 * take: Kaç kayıt getirilecek (max: 100)
 */
const SamplePaginationInput = builder.inputType("SamplePaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

// ========================================
// SAMPLE QUERIES
// ========================================

/**
 * QUERY: samples
 *
 * Açıklama: Numune listesini filtreler ve döner
 * Güvenlik: Rol bazlı filtreleme (kullanıcı kendi numunelerini görür)
 * Döner: Sample dizisi
 */
builder.queryField("samples", (t) =>
  t.prismaField({
    type: ["Sample"],
    args: {
      filter: t.arg({ type: SampleFilterInput, required: false }),
      pagination: t.arg({ type: SamplePaginationInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("samples");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;
        const search = args.filter?.search
          ? sanitizeString(args.filter.search)
          : undefined;
        const customerId = args.filter?.customerId
          ? sanitizeInt(args.filter.customerId)
          : undefined;
        const manufacturerId = args.filter?.manufacturerId
          ? sanitizeInt(args.filter.manufacturerId)
          : undefined;
        const collectionId = args.filter?.collectionId
          ? sanitizeInt(args.filter.collectionId)
          : undefined;

        // Enum doğrulama - Schema'daki tüm SampleStatus değerleri
        const validStatuses = [
          // İlk aşamalar
          "AI_DESIGN",
          "PENDING_APPROVAL",
          "PENDING",
          // İnceleme ve teklif
          "REVIEWED",
          "QUOTE_SENT",
          "CUSTOMER_QUOTE_SENT",
          "MANUFACTURER_REVIEWING_QUOTE",
          // Onay/Red
          "CONFIRMED",
          "REJECTED",
          "REJECTED_BY_CUSTOMER",
          "REJECTED_BY_MANUFACTURER",
          // Üretim aşamaları
          "IN_DESIGN",
          "PATTERN_READY",
          "IN_PRODUCTION",
          "PRODUCTION_COMPLETE",
          // Kalite ve teslimat
          "QUALITY_CHECK",
          "SHIPPED",
          "DELIVERED",
          // Diğer durumlar
          "ON_HOLD",
          "CANCELLED",
          // Eski flow
          "REQUESTED",
          "RECEIVED",
          "COMPLETED",
        ];
        if (status) validateEnum(status, "Numune Durumu", validStatuses);

        // Where koşullarını oluştur
        const where: any = {};

        // Rol bazlı filtreleme
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        // Filtreleri uygula
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;
        if (manufacturerId) where.manufactureId = manufacturerId;
        if (collectionId) where.collectionId = collectionId;

        // Arama filtresi
        if (search) {
          where.OR = [
            { sampleNumber: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ];
        }

        // Pagination ayarla (max 100)
        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        // Query'yi çalıştır
        const samples = await ctx.prisma.sample.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        // Başarıyı logla
        logInfo("Numuneler listelendi", {
          userId: ctx.user!.id,
          count: samples.length,
          filters: { status, search, customerId, manufacturerId, collectionId },
          metadata: timer.end(),
        });

        return samples;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: sample
 *
 * Açıklama: ID'ye göre tekil numune getirir
 * Güvenlik: Yetki kontrolü (sahip veya ilgili taraf)
 * Döner: Tekil Sample
 */
builder.queryField("sample", (t) =>
  t.prismaField({
    type: "Sample",
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("sample");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const id = sanitizeInt(args.id)!;
        validateRequired(id, "Numune ID");

        // Numune'yi bul
        const sample = await ctx.prisma.sample.findUnique({
          where: { id },
          select: {
            id: true,
            customerId: true,
            manufactureId: true,
          },
        });

        if (!sample) {
          throw new NotFoundError("Numune", id);
        }

        // Yetki kontrolü
        const isCustomer = ctx.user!.id === sample.customerId;
        const isManufacturer = ctx.user!.id === sample.manufactureId;
        const isAdmin = ctx.user!.role === "ADMIN";

        if (!isCustomer && !isManufacturer && !isAdmin) {
          throw new ForbiddenError("Bu numuneyi görüntüleme yetkiniz yok");
        }

        // Numune'yi getir
        const result = await ctx.prisma.sample.findUnique({
          ...query,
          where: { id },
        });

        // Başarıyı logla
        logInfo("Numune detayı getirildi", {
          sampleId: id,
          userId: ctx.user!.id,
          isCustomer,
          isManufacturer,
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
 * QUERY: mySamples
 *
 * Açıklama: Kullanıcının numunelerini listeler (müşteri veya üretici olarak)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: Sample dizisi
 */
builder.queryField("mySamples", (t) =>
  t.prismaField({
    type: ["Sample"],
    args: {
      filter: t.arg({ type: SampleFilterInput, required: false }),
      pagination: t.arg({ type: SamplePaginationInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("mySamples");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;

        // Enum doğrulama
        const validStatuses = [
          "AI_DESIGN",
          "PENDING_APPROVAL",
          "PENDING",
          "REVIEWED",
          "QUOTE_SENT",
          "CUSTOMER_QUOTE_SENT",
          "MANUFACTURER_REVIEWING_QUOTE",
          "CONFIRMED",
          "REJECTED",
          "REJECTED_BY_CUSTOMER",
          "REJECTED_BY_MANUFACTURER",
          "IN_DESIGN",
          "PATTERN_READY",
          "IN_PRODUCTION",
          "PRODUCTION_COMPLETE",
          "QUALITY_CHECK",
          "SHIPPED",
          "DELIVERED",
          "ON_HOLD",
          "CANCELLED",
          "REQUESTED",
          "RECEIVED",
          "COMPLETED",
        ];
        if (status) validateEnum(status, "Numune Durumu", validStatuses);

        // Where koşullarını oluştur
        const where: any = {
          OR: [{ customerId: ctx.user!.id }, { manufactureId: ctx.user!.id }],
        };

        // Filtreleri uygula
        if (status) where.status = status;

        // Pagination ayarla
        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        // Query'yi çalıştır
        const samples = await ctx.prisma.sample.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        // Başarıyı logla
        logInfo("Kendi numuneler listelendi", {
          userId: ctx.user!.id,
          count: samples.length,
          filters: { status },
          metadata: timer.end(),
        });

        return samples;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: samplesByStatus
 *
 * Açıklama: Duruma göre numune sayılarını döner (analytics)
 * Güvenlik: Doğrulanmış kullanıcı (kendi numuneleri için)
 * Döner: JSON istatistik objesi
 */
builder.queryField("samplesByStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("samplesByStatus");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Where koşulu (rol bazlı)
        const where: any = {};
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        // Tüm numuneleri getir (sadece status alanı)
        const samples = await ctx.prisma.sample.findMany({
          where,
          select: { status: true },
        });

        // Duruma göre grupla
        const statusCounts: Record<string, number> = {};
        samples.forEach((sample) => {
          statusCounts[sample.status] = (statusCounts[sample.status] || 0) + 1;
        });

        // Başarıyı logla
        logInfo("Numune durum istatistikleri alındı", {
          userId: ctx.user!.id,
          totalSamples: samples.length,
          statusCounts,
          metadata: timer.end(),
        });

        return {
          total: samples.length,
          byStatus: statusCounts,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

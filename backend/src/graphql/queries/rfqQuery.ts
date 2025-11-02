/**
 * RFQ Queries - TEKLİF TALEBİ YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Müşteri teklif talepleri (RFQ) ve üretici teklifleri
 *
 * 📋 Mevcut Query'ler:
 *
 * STANDART QUERY'LER:
 * - rfqMarketplace: RFQ pazaryeri (üreticiler için)
 * - myRFQs: Kullanıcının oluşturduğu RFQ'lar (müşteri)
 * - rfqDetail: Tekil RFQ detayı
 * - rfqQuotes: RFQ için gelen teklifler
 * - myQuotes: Üreticinin gönderdiği teklifler
 *
 * 🔒 Güvenlik:
 * - Üreticiler PUBLIC ve INVITED RFQ'ları görür
 * - Müşteriler kendi RFQ'larını görür
 * - RFQ sahibi tüm teklifleri görür
 * - Üreticiler kendi tekliflerini görür
 * - Admin tümünü görür
 *
 * 💡 Özellikler:
 * - Görünürlük kontrolleri (PRIVATE, INVITED, PUBLIC)
 * - Durum bazlı filtreleme (OPEN, QUOTES_RECEIVED, vb.)
 * - Teklif gönderme ve yönetim
 * - Kazanan seçimi
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
 * RFQ filtreleme input'u
 * Durum, kategori ve cinsiyet bazlı filtreleme
 */
const RFQFilterInput = builder.inputType("RFQFilterInput", {
  fields: (t) => ({
    status: t.string(), // RFQStatus enum
    category: t.int(),
    gender: t.string(), // Gender enum
  }),
});

/**
 * Sayfalama input'u
 * skip: Kaç kayıt atlanacak
 * take: Kaç kayıt getirilecek (max: 100)
 */
const RFQPaginationInput = builder.inputType("RFQPaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

/**
 * Teklif filtreleme input'u
 * Durum bazlı teklif filtreleme
 */
const QuoteFilterInput = builder.inputType("QuoteFilterInput", {
  fields: (t) => ({
    status: t.string(), // QuoteStatus enum
  }),
});

// ========================================
// RFQ QUERIES
// ========================================

/**
 * QUERY: rfqMarketplace
 *
 * Açıklama: Üreticiler için RFQ pazaryerini listeler
 * Güvenlik: Doğrulanmış kullanıcı (üreticiler)
 * Döner: Collection dizisi (RFQ'lar)
 */
builder.queryField("rfqMarketplace", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      filter: t.arg({ type: RFQFilterInput, required: false }),
      pagination: t.arg({ type: RFQPaginationInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("rfqMarketplace");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;
        const gender = args.filter?.gender
          ? sanitizeString(args.filter.gender)
          : undefined;
        const categoryId = args.filter?.category
          ? sanitizeInt(args.filter.category)
          : undefined;

        // Enum doğrulama
        const validStatuses = [
          "OPEN",
          "QUOTES_RECEIVED",
          "UNDER_REVIEW",
          "WINNER_SELECTED",
          "CLOSED",
        ];
        if (status) validateEnum(status, "RFQ Durumu", validStatuses);

        const validGenders = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"];
        if (gender) validateEnum(gender, "Cinsiyet", validGenders);

        // Where koşullarını oluştur
        const where: any = {
          isRFQ: true,
          rfqStatus: { in: ["OPEN", "QUOTES_RECEIVED"] },
          OR: [
            { visibility: "PUBLIC" },
            {
              visibility: "INVITED",
              invitedManufacturers: {
                path: "$",
                array_contains: ctx.user!.id,
              },
            },
          ],
          isActive: true,
        };

        // Filtreleri uygula
        if (status) where.rfqStatus = status;
        if (gender) where.gender = gender;
        if (categoryId) where.categoryId = categoryId;

        // Pagination ayarla (max 100)
        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 20, 100);

        // Query'yi çalıştır
        const rfqs = await ctx.prisma.collection.findMany({
          ...query,
          where,
          orderBy: { rfqDeadline: "asc" },
          skip,
          take,
        });

        // Başarıyı logla
        logInfo("RFQ pazaryeri listelendi", {
          userId: ctx.user!.id,
          count: rfqs.length,
          filters: { status, gender, categoryId },
          metadata: timer.end(),
        });

        return rfqs;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: myRFQs
 *
 * Açıklama: Kullanıcının oluşturduğu RFQ'ları listeler (müşteri)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: Collection dizisi (kendi RFQ'ları)
 */
builder.queryField("myRFQs", (t) =>
  t.prismaField({
    type: ["Collection"],
    args: {
      filter: t.arg({ type: RFQFilterInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("myRFQs");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;

        // Enum doğrulama
        const validStatuses = [
          "OPEN",
          "QUOTES_RECEIVED",
          "UNDER_REVIEW",
          "WINNER_SELECTED",
          "CLOSED",
        ];
        if (status) validateEnum(status, "RFQ Durumu", validStatuses);

        // Where koşullarını oluştur
        const where: any = {
          isRFQ: true,
          authorId: ctx.user!.id,
        };

        // Filtreleri uygula
        if (status) where.rfqStatus = status;

        // Query'yi çalıştır
        const rfqs = await ctx.prisma.collection.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("Kendi RFQ'ları listelendi", {
          userId: ctx.user!.id,
          count: rfqs.length,
          filters: { status },
          metadata: timer.end(),
        });

        return rfqs;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: rfqDetail
 *
 * Açıklama: RFQ detaylarını getirir
 * Güvenlik: Yetki kontrolü (sahip, public, davetli veya admin)
 * Döner: Tekil Collection (RFQ)
 */
builder.queryField("rfqDetail", (t) =>
  t.prismaField({
    type: "Collection",
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("rfqDetail");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const id = sanitizeInt(args.id)!;
        validateRequired(id, "RFQ ID");

        // RFQ'yu bul
        const rfq = await ctx.prisma.collection.findUnique({
          where: { id },
          select: {
            authorId: true,
            visibility: true,
            invitedManufacturers: true,
          },
        });

        if (!rfq) {
          throw new NotFoundError("RFQ", id);
        }

        // Yetki kontrolü
        const isAuthor = ctx.user!.id === rfq.authorId;
        const isPublic = rfq.visibility === "PUBLIC";
        const isInvited =
          rfq.invitedManufacturers &&
          (rfq.invitedManufacturers as any).includes(ctx.user!.id);
        const isAdmin = ctx.user!.role === "ADMIN";

        if (!isAuthor && !isPublic && !isInvited && !isAdmin) {
          throw new ForbiddenError("Bu RFQ'yu görüntüleme yetkiniz yok");
        }

        // RFQ'yu getir
        const result = await ctx.prisma.collection.findUnique({
          ...query,
          where: { id },
        });

        // Başarıyı logla
        logInfo("RFQ detayı getirildi", {
          rfqId: id,
          userId: ctx.user!.id,
          isAuthor,
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
 * QUERY: rfqQuotes
 *
 * Açıklama: RFQ için gelen teklifleri listeler
 * Güvenlik: Sadece RFQ sahibi veya admin
 * Döner: CollectionQuote dizisi
 */
builder.queryField("rfqQuotes", (t) =>
  t.prismaField({
    type: ["CollectionQuote"],
    args: {
      collectionId: t.arg.int({ required: true }),
      filter: t.arg({ type: QuoteFilterInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("rfqQuotes");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const collectionId = sanitizeInt(args.collectionId)!;
        validateRequired(collectionId, "Koleksiyon ID");

        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;

        // Enum doğrulama
        const validStatuses = [
          "PENDING",
          "REVIEWED",
          "SHORTLISTED",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
          "WITHDRAWN",
        ];
        if (status) validateEnum(status, "Teklif Durumu", validStatuses);

        // RFQ'yu kontrol et
        const collection = await ctx.prisma.collection.findUnique({
          where: { id: collectionId },
          select: { authorId: true },
        });

        if (!collection) {
          throw new NotFoundError("RFQ", collectionId);
        }

        // Yetki kontrolü (sadece RFQ sahibi veya admin)
        if (
          ctx.user!.id !== collection.authorId &&
          ctx.user!.role !== "ADMIN"
        ) {
          throw new ForbiddenError(
            "Sadece RFQ sahibi teklifleri görüntüleyebilir"
          );
        }

        // Where koşullarını oluştur
        const where: any = { collectionId };
        if (status) where.status = status;

        // Query'yi çalıştır
        const quotes = await ctx.prisma.collectionQuote.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("RFQ teklifleri listelendi", {
          collectionId,
          userId: ctx.user!.id,
          count: quotes.length,
          filters: { status },
          metadata: timer.end(),
        });

        return quotes;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: myQuotes
 *
 * Açıklama: Üreticinin gönderdiği teklifleri listeler
 * Güvenlik: Doğrulanmış kullanıcı (üreticiler)
 * Döner: CollectionQuote dizisi (kendi teklifleri)
 */
builder.queryField("myQuotes", (t) =>
  t.prismaField({
    type: ["CollectionQuote"],
    args: {
      filter: t.arg({ type: QuoteFilterInput, required: false }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("myQuotes");
      try {
        // Kimlik doğrulama
        requireAuth(ctx.user?.id);

        // Girdileri temizle
        const status = args.filter?.status
          ? sanitizeString(args.filter.status)
          : undefined;

        // Enum doğrulama
        const validStatuses = [
          "PENDING",
          "REVIEWED",
          "SHORTLISTED",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
          "WITHDRAWN",
        ];
        if (status) validateEnum(status, "Teklif Durumu", validStatuses);

        // Where koşullarını oluştur
        const where: any = { manufactureId: ctx.user!.id };
        if (status) where.status = status;

        // Query'yi çalıştır
        const quotes = await ctx.prisma.collectionQuote.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("Kendi teklifler listelendi", {
          userId: ctx.user!.id,
          count: quotes.length,
          filters: { status },
          metadata: timer.end(),
        });

        return quotes;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * RFQ Mutations - TEKLİF TALEBİ YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: RFQ oluşturma, teklif gönderme ve kazanan seçimi
 *
 * 📋 Mevcut Mutation'lar:
 *
 * MÜŞTERİ İŞLEMLERİ:
 * - createRFQ: Yeni RFQ oluştur
 * - selectWinner: Kazanan teklifi seç
 * - reviewQuote: Teklifi değerlendir
 *
 * ÜRETİCİ İŞLEMLERİ:
 * - submitQuote: RFQ için teklif gönder
 * - withdrawQuote: Gönderilen teklifi geri çek
 *
 * 🔒 Güvenlik:
 * - Müşteriler kendi RFQ'larını yönetir
 * - Üreticiler açık RFQ'lara teklif gönderir
 * - Sadece RFQ sahibi kazanan seçebilir
 * - Admin tüm işlemleri yapabilir
 *
 * 💡 Özellikler:
 * - Görünürlük kontrolleri (PRIVATE, INVITED, PUBLIC)
 * - Otomatik bildirimler
 * - Teklif durumu takibi
 * - Validasyon (fiyat, miktar, süre kontrolleri)
 */

import builder from "../builder";

// Hata yönetimi
import { handleError, requireAuth, ValidationError } from "../../utils/errors";

// Loglama
import { createTimer, logInfo } from "../../utils/logger";

// Temizleme (Sanitization)
import {
  sanitizeFloat,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";

// Doğrulama (Validation)
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";

// Bildirimler
import { publishNotification } from "../../utils/publishHelpers";

// ========================================
// INPUT TYPES
// ========================================

/**
 * Input for creating a new RFQ (Request for Quotation)
 * - Customer creates RFQ to request quotes from manufacturers
 * - Visibility controls who can see and quote
 */
const CreateRFQInput = builder.inputType("CreateRFQInput", {
  fields: (t) => ({
    name: t.string({ required: true }), // Min 3, Max 200 characters
    description: t.string({ required: false }),
    customerBrief: t.string({ required: true }), // Min 20, Max 2000 characters
    referenceImages: t.string({ required: false }), // JSON array
    sketchUrl: t.string({ required: false }),
    targetBudget: t.float({ required: false }),
    targetQuantity: t.int({ required: false }),
    targetDeliveryDays: t.int({ required: false }),
    gender: t.string({ required: false }), // Gender enum
    categoryId: t.int({ required: false }),
    rfqDeadline: t.string({ required: false }), // ISO date string
    visibility: t.string({ required: true }), // CollectionVisibility enum
    invitedManufacturers: t.string({ required: false }), // JSON array of user IDs
  }),
});

/**
 * Input for submitting a quote to an RFQ
 * - Manufacturer submits their offer
 * - Includes pricing, MOQ, and production details
 */
const SubmitQuoteInput = builder.inputType("SubmitQuoteInput", {
  fields: (t) => ({
    collectionId: t.int({ required: true }),
    unitPrice: t.float({ required: true }),
    moq: t.int({ required: true }),
    productionDays: t.int({ required: true }),
    currency: t.string({ required: false }), // Default: USD
    sampleDays: t.int({ required: false }), // Default: 7
    samplePrice: t.float({ required: false }), // Default: 0
    notes: t.string({ required: false }), // Max 1000 characters
    technicalNotes: t.string({ required: false }), // Max 2000 characters
    suggestedFabric: t.string({ required: false }), // Max 500 characters
    certifications: t.string({ required: false }), // JSON array
    portfolioImages: t.string({ required: false }), // JSON array
  }),
});

/**
 * Input for selecting winning quote
 * - Customer selects the best quote
 * - All other quotes are automatically rejected
 */
const SelectWinnerInput = builder.inputType("SelectWinnerInput", {
  fields: (t) => ({
    collectionId: t.int({ required: true }),
    quoteId: t.int({ required: true }),
  }),
});

/**
 * Input for reviewing a quote
 * - Customer reviews and rates manufacturer quotes
 * - Can shortlist, reject, or accept quotes
 */
const ReviewQuoteInput = builder.inputType("ReviewQuoteInput", {
  fields: (t) => ({
    quoteId: t.int({ required: true }),
    status: t.string({ required: true }), // QuoteStatus enum
    customerNote: t.string({ required: false }), // Max 1000 characters
    customerRating: t.int({ required: false }), // 1-5 stars
  }),
});

/**
 * Input for withdrawing a quote
 * - Manufacturer withdraws their submitted quote
 * - Cannot withdraw accepted quotes
 */
const WithdrawQuoteInput = builder.inputType("WithdrawQuoteInput", {
  fields: (t) => ({
    quoteId: t.int({ required: true }),
  }),
});

// ========================================
// RFQ / COLLECTION QUOTE MUTATIONS
// ========================================

/**
 * CREATE RFQ MUTATION
 *
 * Allows customers to create a new RFQ (Request for Quotation).
 *
 * Flow:
 * 1. Validate inputs (name, customerBrief, visibility)
 * 2. Generate unique RFQ model code
 * 3. Parse JSON fields (referenceImages, invitedManufacturers)
 * 4. Create RFQ with OPEN status
 * 5. Send notifications to invited manufacturers
 *
 * Permissions: Any authenticated user
 * Visibility: PRIVATE (owner only) | INVITED (specific manufacturers) | PUBLIC (all manufacturers)
 */
builder.mutationField("createRFQ", (t) =>
  t.prismaField({
    type: "Collection",
    description: "Create a new RFQ (Request for Quotation)",
    args: {
      input: t.arg({ type: CreateRFQInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("createRFQ");
      try {
        requireAuth(ctx.user?.id);

        // Sanitize inputs
        const name = sanitizeString(input.name)!;
        const description = input.description
          ? sanitizeString(input.description)
          : undefined;
        const customerBrief = sanitizeString(input.customerBrief)!;
        const referenceImages = input.referenceImages
          ? sanitizeString(input.referenceImages)
          : undefined;
        const sketchUrl = input.sketchUrl
          ? sanitizeString(input.sketchUrl)
          : undefined;
        const targetBudget = input.targetBudget
          ? sanitizeFloat(input.targetBudget)
          : undefined;
        const targetQuantity = input.targetQuantity
          ? sanitizeInt(input.targetQuantity)
          : undefined;
        const targetDeliveryDays = input.targetDeliveryDays
          ? sanitizeInt(input.targetDeliveryDays)
          : undefined;
        const gender = input.gender ? sanitizeString(input.gender) : undefined;
        const categoryId = input.categoryId
          ? sanitizeInt(input.categoryId)
          : undefined;
        const visibility = sanitizeString(input.visibility)!;
        const invitedManufacturers = input.invitedManufacturers
          ? sanitizeString(input.invitedManufacturers)
          : undefined;

        // Validate inputs
        validateRequired(name, "RFQ adı");
        validateStringLength(name, "RFQ adı", 3, 200);
        validateRequired(customerBrief, "Müşteri açıklaması");
        validateStringLength(customerBrief, "Müşteri açıklaması", 20, 2000);
        if (description) validateStringLength(description, "Açıklama", 0, 1000);

        const validVisibility = ["PRIVATE", "INVITED", "PUBLIC"];
        validateEnum(visibility, "Görünürlük", validVisibility);

        const validGenders = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"];
        if (gender) validateEnum(gender, "Cinsiyet", validGenders);

        // Parse JSON fields
        let parsedReferenceImages: any = null;
        if (referenceImages) {
          try {
            parsedReferenceImages = JSON.parse(referenceImages);
          } catch {
            throw new ValidationError(
              "Geçersiz referans görseller JSON formatı"
            );
          }
        }

        let parsedInvitedManufacturers: number[] | null = null;
        if (invitedManufacturers) {
          try {
            const parsed = JSON.parse(invitedManufacturers);
            if (Array.isArray(parsed)) {
              parsedInvitedManufacturers = parsed;
            } else {
              throw new ValidationError(
                "Davetli üreticiler bir dizi olmalıdır"
              );
            }
          } catch (err) {
            if (err instanceof ValidationError) throw err;
            throw new ValidationError(
              "Geçersiz davetli üreticiler JSON formatı"
            );
          }
        }

        // Validate visibility + invitedManufacturers combination
        if (visibility === "INVITED" && !parsedInvitedManufacturers) {
          throw new ValidationError(
            "INVITED görünürlük için davetli üreticiler gereklidir"
          );
        }

        // Generate unique model code
        const year = new Date().getFullYear();
        const count = await ctx.prisma.collection.count({
          where: { authorId: ctx.user!.id, isRFQ: true },
        });
        const modelCode = `RFQ-${year}-${String(count + 1).padStart(4, "0")}`;

        // Parse deadline
        let deadline: Date | null = null;
        if (input.rfqDeadline) {
          try {
            const parsedDate = new Date(input.rfqDeadline);
            if (parsedDate < new Date()) {
              throw new ValidationError("RFQ son tarihi geçmiş olamaz");
            }
            deadline = parsedDate;
          } catch (err) {
            if (err instanceof ValidationError) throw err;
            throw new ValidationError("Geçersiz tarih formatı");
          }
        }

        const rfq = await ctx.prisma.collection.create({
          ...query,
          data: {
            name,
            description: description || null,
            modelCode,
            authorId: ctx.user!.id,
            companyId: ctx.user!.companyId || null,
            ownerType: "CUSTOMER",
            isRFQ: true,
            rfqStatus: "OPEN",
            visibility: visibility as any,
            customerBrief,
            referenceImages: parsedReferenceImages,
            sketchUrl: sketchUrl || null,
            targetBudget: targetBudget || null,
            targetQuantity: targetQuantity || null,
            targetDeliveryDays: targetDeliveryDays || null,
            gender: gender as any,
            categoryId: categoryId || null,
            rfqDeadline: deadline,
            invitedManufacturers: parsedInvitedManufacturers as any,
          },
        });

        logInfo("RFQ oluşturuldu", {
          rfqId: rfq.id,
          modelCode,
          visibility,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        // Send notifications to invited manufacturers
        if (
          visibility === "INVITED" &&
          parsedInvitedManufacturers &&
          Array.isArray(parsedInvitedManufacturers)
        ) {
          for (const manufacturerId of parsedInvitedManufacturers) {
            try {
              const notif = await ctx.prisma.notification.create({
                data: {
                  userId: manufacturerId,
                  type: "ORDER",
                  title: "Yeni RFQ Daveti",
                  message: `"${name}" için teklif vermeye davet edildiniz`,
                  link: `/rfq/${rfq.id}`,
                  data: {
                    rfqId: rfq.id,
                    modelCode,
                    deadline: input.rfqDeadline,
                  } as any,
                },
              });
              await publishNotification(notif);
            } catch (err) {
              logInfo("RFQ davet bildirimi gönderilemedi", {
                error: String(err),
                manufacturerId,
                rfqId: rfq.id,
              });
            }
          }
        }

        return rfq;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * SUBMIT QUOTE MUTATION
 *
 * Allows manufacturers to submit their quotation for an RFQ.
 *
 * Flow:
 * 1. Validate inputs (prices, quantities, notes)
 * 2. Check RFQ status (OPEN or QUOTES_RECEIVED only)
 * 3. Check deadline hasn't passed
 * 4. Prevent duplicate quotes
 * 5. Create quote with PENDING status
 * 6. Update RFQ status to QUOTES_RECEIVED
 * 7. Notify RFQ owner (customer)
 *
 * Permissions: Any authenticated manufacturer
 * Default values: currency (USD), sampleDays (7), samplePrice (0)
 */
builder.mutationField("submitQuote", (t) =>
  t.prismaField({
    type: "CollectionQuote",
    description: "Submit a quote for an RFQ (manufacturer)",
    args: {
      input: t.arg({ type: SubmitQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("submitQuote");
      try {
        requireAuth(ctx.user?.id);

        // Sanitize inputs
        const collectionId = sanitizeInt(input.collectionId)!;
        const unitPrice = sanitizeFloat(input.unitPrice)!;
        const moq = sanitizeInt(input.moq)!;
        const productionDays = sanitizeInt(input.productionDays)!;
        const currency =
          (input.currency ? sanitizeString(input.currency) : "USD") || "USD";
        const sampleDays = input.sampleDays ? sanitizeInt(input.sampleDays) : 7;
        const samplePrice = input.samplePrice
          ? sanitizeFloat(input.samplePrice)
          : 0;
        const notes = input.notes ? sanitizeString(input.notes) : undefined;
        const technicalNotes = input.technicalNotes
          ? sanitizeString(input.technicalNotes)
          : undefined;
        const suggestedFabric = input.suggestedFabric
          ? sanitizeString(input.suggestedFabric)
          : undefined;
        const certifications = input.certifications
          ? sanitizeString(input.certifications)
          : undefined;
        const portfolioImages = input.portfolioImages
          ? sanitizeString(input.portfolioImages)
          : undefined;

        // Validate inputs
        validateRequired(collectionId, "Koleksiyon ID");
        validateRequired(unitPrice, "Birim fiyat");
        validateRequired(moq, "Minimum sipariş miktarı");
        validateRequired(productionDays, "Üretim süresi");

        if (unitPrice <= 0)
          throw new ValidationError("Birim fiyat 0'dan büyük olmalıdır");
        if (moq <= 0)
          throw new ValidationError(
            "Minimum sipariş miktarı 0'dan büyük olmalıdır"
          );
        if (productionDays <= 0)
          throw new ValidationError("Üretim süresi 0'dan büyük olmalıdır");
        if (sampleDays && sampleDays < 0)
          throw new ValidationError("Numune süresi negatif olamaz");
        if (samplePrice && samplePrice < 0)
          throw new ValidationError("Numune fiyatı negatif olamaz");

        if (notes) validateStringLength(notes, "Notlar", 0, 2000);
        if (technicalNotes)
          validateStringLength(technicalNotes, "Teknik notlar", 0, 2000);
        if (suggestedFabric)
          validateStringLength(suggestedFabric, "Önerilen kumaş", 0, 500);

        // Parse JSON fields
        let parsedCertifications: any = null;
        if (certifications) {
          try {
            parsedCertifications = JSON.parse(certifications);
          } catch {
            throw new ValidationError("Geçersiz sertifikalar JSON formatı");
          }
        }

        let parsedPortfolioImages: any = null;
        if (portfolioImages) {
          try {
            parsedPortfolioImages = JSON.parse(portfolioImages);
          } catch {
            throw new ValidationError(
              "Geçersiz portföy görselleri JSON formatı"
            );
          }
        }

        // Check RFQ validity
        const rfq = await ctx.prisma.collection.findUnique({
          where: { id: collectionId },
          select: {
            id: true,
            name: true,
            isRFQ: true,
            rfqStatus: true,
            rfqDeadline: true,
            authorId: true,
          },
        });

        if (!rfq) {
          throw new ValidationError("RFQ bulunamadı");
        }

        if (!rfq.authorId) {
          throw new ValidationError("RFQ sahibi bulunamadı");
        }
        if (!rfq || !rfq.isRFQ) {
          throw new ValidationError("Geçerli bir RFQ bulunamadı");
        }

        if (rfq.rfqStatus !== "OPEN" && rfq.rfqStatus !== "QUOTES_RECEIVED") {
          throw new ValidationError("RFQ artık teklif kabul etmiyor");
        }

        if (rfq.rfqDeadline && new Date() > rfq.rfqDeadline) {
          throw new ValidationError("RFQ son tarihi geçmiş");
        }

        // Check for duplicate quotes
        const existing = await ctx.prisma.collectionQuote.findUnique({
          where: {
            collectionId_manufactureId: {
              collectionId,
              manufactureId: ctx.user!.id,
            },
          },
        });

        if (existing) {
          throw new ValidationError("Bu RFQ için zaten bir teklif gönderdiniz");
        }

        // Create quote
        const quote = await ctx.prisma.collectionQuote.create({
          ...query,
          data: {
            collectionId,
            manufactureId: ctx.user!.id,
            unitPrice,
            moq,
            productionDays,
            currency,
            sampleDays,
            samplePrice,
            notes: notes || null,
            technicalNotes: technicalNotes || null,
            suggestedFabric: suggestedFabric || null,
            certifications: parsedCertifications,
            portfolioImages: parsedPortfolioImages,
            status: "PENDING",
          },
        });

        // Update RFQ status
        await ctx.prisma.collection.update({
          where: { id: collectionId },
          data: { rfqStatus: "QUOTES_RECEIVED" },
        });

        logInfo("Teklif gönderildi", {
          quoteId: quote.id,
          rfqId: collectionId,
          manufacturerId: ctx.user!.id,
          unitPrice,
          moq,
          metadata: timer.end(),
        });

        // Notify RFQ owner
        try {
          const notif = await ctx.prisma.notification.create({
            data: {
              userId: rfq.authorId,
              type: "ORDER",
              title: "Yeni Teklif Alındı",
              message: `"${rfq.name}" RFQ'nuz için yeni bir teklif alındı`,
              link: `/rfq/${rfq.id}/quotes`,
              data: {
                rfqId: rfq.id,
                quoteId: quote.id,
                manufacturerId: ctx.user!.id,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Teklif bildirimi gönderilemedi", {
            error: String(err),
            quoteId: quote.id,
          });
        }

        return quote;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * SELECT WINNER MUTATION
 *
 * Allows RFQ owner (customer) to select the winning quote.
 *
 * Flow:
 * 1. Validate permission (only RFQ author or admin)
 * 2. Verify quote exists
 * 3. Mark selected quote as ACCEPTED (isWinner: true)
 * 4. Reject all other quotes
 * 5. Update RFQ status to WINNER_SELECTED
 * 6. Notify winner manufacturer
 * 7. Notify rejected manufacturers
 *
 * Permissions: RFQ author or ADMIN
 * Side effects: All other quotes marked as REJECTED
 */
builder.mutationField("selectWinner", (t) =>
  t.prismaField({
    type: "Collection",
    description: "Select winning quote for RFQ (customer)",
    args: {
      input: t.arg({ type: SelectWinnerInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("selectWinner");
      try {
        requireAuth(ctx.user?.id);

        // Sanitize inputs
        const collectionId = sanitizeInt(input.collectionId)!;
        const quoteId = sanitizeInt(input.quoteId)!;

        // Validate inputs
        validateRequired(collectionId, "Koleksiyon ID");
        validateRequired(quoteId, "Teklif ID");

        // Check RFQ ownership
        const rfq = await ctx.prisma.collection.findUnique({
          where: { id: collectionId },
          select: {
            id: true,
            name: true,
            authorId: true,
            rfqStatus: true,
          },
        });

        if (!rfq) {
          throw new ValidationError("RFQ bulunamadı");
        }

        if (ctx.user!.id !== rfq.authorId && ctx.user!.role !== "ADMIN") {
          throw new ValidationError("Sadece RFQ sahibi kazanan seçebilir");
        }

        // Check quote exists
        const quote = await ctx.prisma.collectionQuote.findUnique({
          where: { id: quoteId },
          select: {
            id: true,
            manufactureId: true,
            collectionId: true,
          },
        });

        if (!quote) {
          throw new ValidationError("Teklif bulunamadı");
        }

        if (quote.collectionId !== collectionId) {
          throw new ValidationError("Teklif bu RFQ'ya ait değil");
        }

        // Get all quotes for notifications
        const allQuotes = await ctx.prisma.collectionQuote.findMany({
          where: { collectionId },
          select: { id: true, manufactureId: true },
        });

        // Mark all other quotes as rejected
        await ctx.prisma.collectionQuote.updateMany({
          where: {
            collectionId,
            id: { not: quoteId },
          },
          data: { status: "REJECTED" },
        });

        // Mark winner
        await ctx.prisma.collectionQuote.update({
          where: { id: quoteId },
          data: { status: "ACCEPTED", isWinner: true },
        });

        // Update RFQ
        const updatedRfq = await ctx.prisma.collection.update({
          ...query,
          where: { id: collectionId },
          data: {
            rfqStatus: "WINNER_SELECTED",
            rfqWinnerId: quote.manufactureId,
          },
        });

        logInfo("Kazanan teklif seçildi", {
          rfqId: collectionId,
          quoteId,
          winnerId: quote.manufactureId,
          rejectedCount: allQuotes.length - 1,
          metadata: timer.end(),
        });

        // Notify winner
        try {
          const winnerNotif = await ctx.prisma.notification.create({
            data: {
              userId: quote.manufactureId,
              type: "ORDER",
              title: "Tebrikler! Teklifiniz Kazandı",
              message: `"${rfq.name}" RFQ için teklifiniz seçildi`,
              link: `/rfq/${rfq.id}`,
              data: {
                rfqId: rfq.id,
                quoteId,
              } as any,
            },
          });
          await publishNotification(winnerNotif);
        } catch (err) {
          logInfo("Kazanan bildirimi gönderilemedi", {
            error: String(err),
            quoteId,
          });
        }

        // Notify rejected manufacturers
        for (const otherQuote of allQuotes) {
          if (otherQuote.id !== quoteId) {
            try {
              const rejectNotif = await ctx.prisma.notification.create({
                data: {
                  userId: otherQuote.manufactureId,
                  type: "ORDER",
                  title: "Teklif Sonucu",
                  message: `"${rfq.name}" RFQ için başka bir teklif seçildi`,
                  link: `/rfq/${rfq.id}`,
                  data: {
                    rfqId: rfq.id,
                    quoteId: otherQuote.id,
                  } as any,
                },
              });
              await publishNotification(rejectNotif);
            } catch (err) {
              logInfo("Red bildirimi gönderilemedi", {
                error: String(err),
                quoteId: otherQuote.id,
              });
            }
          }
        }

        return updatedRfq;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * REVIEW QUOTE MUTATION
 *
 * Allows RFQ owner (customer) to review and rate quotes.
 *
 * Flow:
 * 1. Validate permission (only RFQ author or admin)
 * 2. Verify quote exists
 * 3. Update quote status (REVIEWED, SHORTLISTED, etc.)
 * 4. Add customer note and rating (1-5 stars)
 * 5. Notify manufacturer about review
 *
 * Permissions: RFQ author or ADMIN
 * Rating: 1-5 stars (optional)
 */
builder.mutationField("reviewQuote", (t) =>
  t.prismaField({
    type: "CollectionQuote",
    description: "Review/rate a quote (customer)",
    args: {
      input: t.arg({ type: ReviewQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("reviewQuote");
      try {
        requireAuth(ctx.user?.id);

        // Sanitize inputs
        const quoteId = sanitizeInt(input.quoteId)!;
        const status = sanitizeString(input.status)!;
        const customerNote = input.customerNote
          ? sanitizeString(input.customerNote)
          : undefined;
        const customerRating = input.customerRating
          ? sanitizeInt(input.customerRating)
          : undefined;

        // Validate inputs
        validateRequired(quoteId, "Teklif ID");
        validateRequired(status, "Durum");

        const validStatuses = [
          "PENDING",
          "REVIEWED",
          "SHORTLISTED",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
          "WITHDRAWN",
        ];
        validateEnum(status, "Durum", validStatuses);

        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 1000);

        if (customerRating !== undefined && customerRating !== null) {
          if (customerRating < 1 || customerRating > 5) {
            throw new ValidationError(
              "Müşteri değerlendirmesi 1-5 arasında olmalıdır"
            );
          }
        }

        // Check quote ownership
        const quote = await ctx.prisma.collectionQuote.findUnique({
          where: { id: quoteId },
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                authorId: true,
              },
            },
          },
        });

        if (!quote) {
          throw new ValidationError("Teklif bulunamadı");
        }

        if (
          ctx.user!.id !== quote.collection.authorId &&
          ctx.user!.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "Sadece RFQ sahibi teklifleri değerlendirebilir"
          );
        }

        // Update quote
        const updatedQuote = await ctx.prisma.collectionQuote.update({
          ...query,
          where: { id: quoteId },
          data: {
            status: status as any,
            customerNote: customerNote || null,
            customerRating: customerRating || null,
          },
        });

        logInfo("Teklif değerlendirildi", {
          quoteId,
          status,
          rating: customerRating,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        // Notify manufacturer
        try {
          const notif = await ctx.prisma.notification.create({
            data: {
              userId: quote.manufactureId,
              type: "ORDER",
              title: "Teklifiniz Değerlendirildi",
              message: `"${
                quote.collection.name
              }" için teklifiniz değerlendirildi${
                customerRating ? ` (${customerRating}/5 yıldız)` : ""
              }`,
              link: `/rfq/${quote.collectionId}`,
              data: {
                rfqId: quote.collectionId,
                quoteId,
                status,
                rating: customerRating,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Değerlendirme bildirimi gönderilemedi", {
            error: String(err),
            quoteId,
          });
        }

        return updatedQuote;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * WITHDRAW QUOTE MUTATION
 *
 * Allows manufacturers to withdraw their submitted quote.
 *
 * Flow:
 * 1. Validate permission (only quote owner or admin)
 * 2. Verify quote exists
 * 3. Check quote is not ACCEPTED (cannot withdraw accepted quotes)
 * 4. Update quote status to WITHDRAWN
 * 5. Notify RFQ owner (customer)
 *
 * Permissions: Quote owner or ADMIN
 * Restriction: Cannot withdraw ACCEPTED quotes
 */
builder.mutationField("withdrawQuote", (t) =>
  t.prismaField({
    type: "CollectionQuote",
    description: "Withdraw a submitted quote (manufacturer)",
    args: {
      input: t.arg({ type: WithdrawQuoteInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, ctx) => {
      const timer = createTimer("withdrawQuote");
      try {
        requireAuth(ctx.user?.id);

        // Sanitize input
        const quoteId = sanitizeInt(input.quoteId)!;

        // Validate input
        validateRequired(quoteId, "Teklif ID");

        // Check quote ownership
        const quote = await ctx.prisma.collectionQuote.findUnique({
          where: { id: quoteId },
          select: {
            id: true,
            manufactureId: true,
            status: true,
            collectionId: true,
            collection: {
              select: {
                name: true,
                authorId: true,
              },
            },
          },
        });

        if (!quote) {
          throw new ValidationError("Teklif bulunamadı");
        }

        if (
          ctx.user!.id !== quote.manufactureId &&
          ctx.user!.role !== "ADMIN"
        ) {
          throw new ValidationError("Sadece teklif sahibi geri çekebilir");
        }

        if (quote.status === "ACCEPTED") {
          throw new ValidationError("Kabul edilmiş teklif geri çekilemez");
        }

        // Update quote status
        const updatedQuote = await ctx.prisma.collectionQuote.update({
          ...query,
          where: { id: quoteId },
          data: { status: "WITHDRAWN" },
        });

        logInfo("Teklif geri çekildi", {
          quoteId,
          manufacturerId: ctx.user!.id,
          metadata: timer.end(),
        });

        // Notify RFQ owner
        try {
          const notif = await ctx.prisma.notification.create({
            data: {
              userId: quote.collection.authorId!,
              type: "ORDER",
              title: "Teklif Geri Çekildi",
              message: `"${quote.collection.name}" için bir teklif geri çekildi`,
              link: `/rfq/${quote.collectionId}`,
              data: {
                rfqId: quote.collectionId,
                quoteId,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Geri çekme bildirimi gönderilemedi", {
            error: String(err),
            quoteId,
          });
        }

        return updatedQuote;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

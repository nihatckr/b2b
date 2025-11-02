import { handleError, NotFoundError, requireAuth } from "../../utils/errors";
import { createTimer, logError, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeFloat,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import { generateSlug } from "../../utils/stringUtils";
import {
  validateEnum,
  validateIdArray,
  validateRange,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// Valid enums
const ValidGenders = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"] as const;
const ValidVisibilities = ["PRIVATE", "INVITED", "PUBLIC"] as const;
const ValidRFQStatuses = [
  "OPEN",
  "QUOTES_RECEIVED",
  "UNDER_REVIEW",
  "WINNER_SELECTED",
  "CLOSED",
] as const;

// ========================================
// INPUT TYPE: Müşteri RFQ Oluşturma - 100% Schema Uyumlu
// ========================================
const SimpleCustomerRFQInput = builder.inputType("SimpleCustomerRFQInput", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER (Required)
    // ========================================
    name: t.string({ required: true }), // Schema: String (required)
    description: t.string(), // Schema: String? @db.Text

    // ========================================
    // GÖRSELLER (Media)
    // ========================================
    images: t.stringList(), // Schema: String? @db.Text - JSON array
    referenceImages: t.stringList(), // Schema: String? @db.Text - JSON array
    sketchUrl: t.string(), // Schema: String? - Müşteri taslak tasarımı

    // ========================================
    // MÜŞTERİ AÇIKLAMASI
    // ========================================
    customerBrief: t.string(), // Schema: String? @db.Text - Basit açıklama

    // ========================================
    // KATEGORİ VE CİNSİYET
    // ========================================
    categoryId: t.int(), // Schema: Int? - Admin managed category
    gender: t.string(), // Schema: Gender? enum - WOMEN, MEN, GIRLS, BOYS, UNISEX

    // ========================================
    // TİCARİ HEDEFLER (Customer Target Info)
    // ========================================
    targetQuantity: t.int(), // Schema: Int? - Hedef sipariş miktarı
    targetBudget: t.float(), // Schema: Float? - Hedef birim fiyat
    targetDeliveryDays: t.int(), // Schema: Int? - Hedef termin süresi

    // ========================================
    // RFQ AYARLARI (RFQ Management)
    // ========================================
    visibility: t.string({ required: true }), // Schema: CollectionVisibility @default(PRIVATE)
    invitedManufacturers: t.intList(), // Schema: Json? - Davet edilen üretici ID'leri
    rfqDeadline: t.field({ type: "DateTime" }), // Schema: DateTime? - Teklif son tarihi

    // ========================================
    // EK NOTLAR
    // ========================================
    notes: t.string(), // Schema: String? @db.Text
  }),
});

// ========================================
// MUTATION: Müşteri RFQ Oluştur - Production Ready
// ========================================
builder.mutationField("createSimpleCustomerRFQ", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      input: t.arg({ type: SimpleCustomerRFQInput, required: true }),
    },
    authScopes: { user: true }, // All logged-in users can create RFQ
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("CreateSimpleCustomerRFQ");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Sanitize inputs
        const name = sanitizeString(args.input.name);
        const description = args.input.description
          ? sanitizeString(args.input.description)
          : undefined;
        const customerBrief = args.input.customerBrief
          ? sanitizeString(args.input.customerBrief)
          : undefined;
        const sketchUrl = args.input.sketchUrl
          ? sanitizeString(args.input.sketchUrl)
          : undefined;
        const notes = args.input.notes
          ? sanitizeString(args.input.notes)
          : undefined;
        const visibility = sanitizeString(args.input.visibility);

        // ✅ Validate required inputs
        validateRequired(name, "RFQ adı");
        validateStringLength(name!, "RFQ adı", 2, 200);
        validateRequired(visibility, "Görünürlük");

        if (description) {
          validateStringLength(description, "Açıklama", 0, 5000);
        }

        if (customerBrief) {
          validateStringLength(customerBrief, "Müşteri açıklaması", 0, 5000);
        }

        if (notes) {
          validateStringLength(notes, "Notlar", 0, 2000);
        }

        // ✅ Validate enum values
        validateEnum(visibility, "Görünürlük", [...ValidVisibilities]);

        if (args.input.gender) {
          const gender = sanitizeString(args.input.gender);
          validateEnum(gender, "Cinsiyet", [...ValidGenders]);
        }

        // ✅ Get user with company info
        const user = await context.prisma.user.findUnique({
          where: { id: context.user!.id },
          include: { company: true },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        logInfo("Müşteri RFQ oluşturuluyor", {
          userId: context.user!.id,
          name,
          visibility,
        });

        // ✅ Sanitize numeric inputs
        const categoryId = args.input.categoryId
          ? sanitizeInt(args.input.categoryId)
          : undefined;
        const targetQuantity = args.input.targetQuantity
          ? sanitizeInt(args.input.targetQuantity)
          : undefined;
        const targetBudget = args.input.targetBudget
          ? sanitizeFloat(args.input.targetBudget)
          : undefined;
        const targetDeliveryDays = args.input.targetDeliveryDays
          ? sanitizeInt(args.input.targetDeliveryDays)
          : undefined;

        // ✅ Validate numeric ranges
        if (targetQuantity !== undefined && targetQuantity !== null) {
          validateRange(targetQuantity, "Hedef miktar", 1, 1000000);
        }

        if (targetBudget !== undefined && targetBudget !== null) {
          validateRange(targetBudget, "Hedef bütçe", 0.01, 1000000);
        }

        if (targetDeliveryDays !== undefined && targetDeliveryDays !== null) {
          validateRange(targetDeliveryDays, "Hedef teslimat süresi", 1, 365);
        }

        // ✅ Validate ID arrays
        validateIdArray(
          args.input.invitedManufacturers,
          "Davet edilen üreticiler",
          100
        );

        // ✅ Generate unique model code
        const timestamp = Date.now();
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase();
        const modelCode = `RFQ-${timestamp}-${randomSuffix}`;
        const slug = generateSlug(name!);

        // ✅ RFQ deadline: default 14 days from now
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 14);
        const rfqDeadline = args.input.rfqDeadline || defaultDeadline;

        // ✅ Prepare data object
        const data: any = {
          name,
          slug,
          modelCode,

          // Temel bilgiler
          description: description || null,
          customerBrief: customerBrief || null,
          notes: notes || null,

          // Görseller (JSON array)
          images: args.input.images ? JSON.stringify(args.input.images) : null,
          referenceImages: args.input.referenceImages
            ? JSON.stringify(args.input.referenceImages)
            : null,
          sketchUrl: sketchUrl || null,

          // Kategori ve cinsiyet
          categoryId: categoryId || null,
          gender: args.input.gender || null,

          // Ticari hedefler
          targetQuantity: targetQuantity || null,
          targetBudget: targetBudget || null,
          targetDeliveryDays: targetDeliveryDays || null,

          // RFQ sistem alanları
          ownerType: "CUSTOMER",
          isRFQ: true,
          rfqStatus: "OPEN",
          visibility: visibility,
          rfqDeadline: rfqDeadline,
          invitedManufacturers: args.input.invitedManufacturers
            ? args.input.invitedManufacturers
            : null,

          // Relations
          author: {
            connect: { id: context.user!.id },
          },
          companyId: user.companyId || null,

          // Varsayılan değerler
          isActive: true,
          currency: "USD",
          viewCount: 0,
          shareCount: 0,
        };

        const collection = await context.prisma.collection.create({
          ...query,
          data,
        });

        // ✅ Davet edilen üreticilere bildirim gönder
        if (
          args.input.invitedManufacturers &&
          args.input.invitedManufacturers.length > 0
        ) {
          try {
            for (const manufacturerId of args.input.invitedManufacturers) {
              const notification = await context.prisma.notification.create({
                data: {
                  userId: manufacturerId,
                  type: "SYSTEM",
                  title: "Yeni RFQ Daveti",
                  message: `"${name}" için teklif vermeye davet edildiniz.`,
                  data: JSON.stringify({
                    collectionId: collection.id,
                    customerName: user.name || user.email,
                    type: "RFQ_INVITATION",
                  }),
                  isRead: false,
                },
              });
              await publishNotification(notification);
            }

            logInfo("RFQ davet bildirimleri gönderildi", {
              collectionId: collection.id,
              invitedCount: args.input.invitedManufacturers.length,
            });
          } catch (notifError) {
            logError(
              "RFQ bildirim gönderimi başarısız (işlem devam ediyor)",
              notifError instanceof Error ? notifError : undefined,
              { collectionId: collection.id }
            );
          }
        }

        logInfo("Müşteri RFQ oluşturuldu", {
          userId: context.user!.id,
          collectionId: collection.id,
          modelCode: collection.modelCode,
          visibility,
        });
        timer.end({ userId: context.user!.id, success: true });

        return collection;
      } catch (error) {
        logError("Müşteri RFQ oluşturma hatası", error as Error, {
          name: args.input.name,
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

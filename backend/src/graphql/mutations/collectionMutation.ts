import {
  ForbiddenError,
  handleError,
  NotFoundError,
  requireAuth,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logError, logInfo } from "../../utils/logger";
import {
  PermissionGuide,
  requirePermission,
} from "../../utils/permissionHelpers";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeFloat,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import { generateSlug } from "../../utils/stringUtils";
import { canPerformAction } from "../../utils/subscriptionHelper";
import {
  validateIdArray,
  validateRange,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// INPUT TYPES (Clean & Organized)
// ========================================

// Create Collection Input - 100% Schema Uyumlu
const CreateCollectionInput = builder.inputType("CreateCollectionInput", {
  fields: (t) => ({
    // ========================================
    // TEMEL BİLGİLER (Basic Info)
    // ========================================
    name: t.string({ required: true }), // Schema: String (required)
    description: t.string(), // Schema: String? @db.Text
    modelCode: t.string(), // Schema: String @unique - Auto-generated if not provided

    // ========================================
    // KATEGORİ (Category Integration)
    // ========================================
    categoryId: t.int(), // Schema: Int? - Admin managed category

    // ========================================
    // SEZON, CİNSİYET, FIT, TREND (Library Relations)
    // ========================================
    seasonId: t.int(), // Schema: Int? - LibraryItem relation
    gender: t.string(), // Schema: Gender? enum - WOMEN, MEN, GIRLS, BOYS, UNISEX
    fitId: t.int(), // Schema: Int? - LibraryItem relation
    trendId: t.int(), // Schema: Int? - LibraryItem relation

    // ========================================
    // VARYANTLAR (Variants - Many-to-Many)
    // ========================================
    colorIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionColors")
    sizeGroupIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionSizeGroups")

    // ========================================
    // TEKNİK DETAYLAR (Technical Details)
    // ========================================
    fabricIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionFabrics")
    accessoryIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionAccessories")
    techPack: t.string(), // Schema: String? - File path

    // ========================================
    // TİCARİ BİLGİLER (Commercial Info)
    // ========================================
    moq: t.int(), // Schema: Int? - Minimum Order Quantity
    targetPrice: t.float(), // Schema: Float? - Will also set price field
    currency: t.string(), // Schema: String? @default("USD")
    targetLeadTime: t.int(), // Schema: Int? - Days
    deadline: t.field({ type: "DateTime" }), // Schema: DateTime?
    deadlineDays: t.int(), // Schema: Int? - Days
    notes: t.string(), // Schema: String? @db.Text

    // ========================================
    // KADEME FİYATLANDIRMA (Tier Pricing)
    // ========================================
    priceBreaks: t.string(), // Schema: Json? - JSON string

    // ========================================
    // PAKETLEME & ETİKETLEME (Packaging & Labeling)
    // ========================================
    packagingTypeId: t.int(), // Schema: Int? - LibraryItem relation
    packagingDetails: t.string(), // Schema: String? @db.Text
    labelingTypeId: t.int(), // Schema: Int? - LibraryItem relation
    labelingDetails: t.string(), // Schema: String? @db.Text

    // ========================================
    // ÖDEME KOŞULLARI (Payment Terms)
    // ========================================
    paymentTermsId: t.int(), // Schema: Int? - LibraryItem relation
    depositRequired: t.boolean(), // Schema: Boolean @default(false)
    depositPercentage: t.float(), // Schema: Float?

    // ========================================
    // KALİTE STANDARTLARI (Quality Standards)
    // ========================================
    qualityStandardId: t.int(), // Schema: Int? - LibraryItem relation
    defectTolerance: t.float(), // Schema: Float?

    // ========================================
    // ACİL SİPARİŞ (Rush Order)
    // ========================================
    rushOrderAvailable: t.boolean(), // Schema: Boolean @default(false)
    rushOrderExtraCost: t.float(), // Schema: Float? - Percentage
    rushOrderMinDays: t.int(), // Schema: Int?

    // ========================================
    // SERTİFİKALAR (Certifications)
    // ========================================
    certificationIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionCertifications")

    // ========================================
    // KAPASİTE & NUMUNE POLİTİKASI
    // ========================================
    monthlyCapacity: t.int(), // Schema: Int?
    maxOrderQuantity: t.int(), // Schema: Int?
    allowDirectOrder: t.boolean(), // Schema: Boolean @default(true)
    requireSample: t.boolean(), // Schema: Boolean @default(false)
    samplePolicy: t.string(), // Schema: String? @default("OPTIONAL")
    sampleLeadTime: t.int(), // Schema: Int? @default(7)
    samplePrice: t.float(), // Schema: Float? @default(0)

    // ========================================
    // YENİ LİBRARY RELATIONS
    // ========================================
    defaultSizeBreakdownId: t.int(), // Schema: Int? - LibraryItem relation
    printIds: t.intList(), // Schema: LibraryItem[] @relation("CollectionPrints")
    washEffectId: t.int(), // Schema: Int? - LibraryItem relation

    // ========================================
    // MEDYA (Media)
    // ========================================
    images: t.string(), // Schema: String? @db.Text - JSON array

    // ========================================
    // ÜRETİM PROGRAMI (Production Schedule)
    // ========================================
    productionSchedule: t.string(), // Schema: Json? - JSON string

    // ========================================
    // RFQ SİSTEMİ (Customer Request for Quotation)
    // ========================================
    ownerType: t.string(), // Schema: CollectionOwnerType @default(MANUFACTURER)
    customerBrief: t.string(), // Schema: String? @db.Text
    referenceImages: t.string(), // Schema: String? @db.Text - JSON array
    sketchUrl: t.string(), // Schema: String?
    targetBudget: t.float(), // Schema: Float?
    targetQuantity: t.int(), // Schema: Int?
    targetDeliveryDays: t.int(), // Schema: Int?
    isRFQ: t.boolean(), // Schema: Boolean @default(false)
    rfqStatus: t.string(), // Schema: RFQStatus?
    rfqDeadline: t.field({ type: "DateTime" }), // Schema: DateTime?
    visibility: t.string(), // Schema: CollectionVisibility @default(PRIVATE)
    invitedManufacturers: t.string(), // Schema: Json? - JSON array of IDs
  }),
});

// Update Collection Input - 100% Schema Uyumlu
const UpdateCollectionInput = builder.inputType("UpdateCollectionInput", {
  fields: (t) => ({
    // ID (required for update)
    id: t.int({ required: true }),

    // ========================================
    // TEMEL BİLGİLER (Basic Info)
    // ========================================
    name: t.string(),
    description: t.string(),
    modelCode: t.string(),
    isFeatured: t.boolean(), // Schema: Boolean @default(false)
    isActive: t.boolean(), // Schema: Boolean @default(true)

    // ========================================
    // KATEGORİ
    // ========================================
    categoryId: t.int(),

    // ========================================
    // SEZON, CİNSİYET, FIT, TREND
    // ========================================
    seasonId: t.int(),
    gender: t.string(),
    fitId: t.int(),
    trendId: t.int(),

    // ========================================
    // VARYANTLAR (Many-to-Many)
    // ========================================
    colorIds: t.intList(),
    sizeGroupIds: t.intList(),

    // ========================================
    // TEKNİK DETAYLAR
    // ========================================
    fabricIds: t.intList(),
    accessoryIds: t.intList(),
    techPack: t.string(),

    // ========================================
    // TİCARİ BİLGİLER
    // ========================================
    moq: t.int(),
    targetPrice: t.float(),
    currency: t.string(),
    targetLeadTime: t.int(),
    deadline: t.field({ type: "DateTime" }),
    deadlineDays: t.int(),
    notes: t.string(),

    // ========================================
    // KADEME FİYATLANDIRMA
    // ========================================
    priceBreaks: t.string(),

    // ========================================
    // PAKETLEME & ETİKETLEME
    // ========================================
    packagingTypeId: t.int(),
    packagingDetails: t.string(),
    labelingTypeId: t.int(),
    labelingDetails: t.string(),

    // ========================================
    // ÖDEME KOŞULLARI
    // ========================================
    paymentTermsId: t.int(),
    depositRequired: t.boolean(),
    depositPercentage: t.float(),

    // ========================================
    // KALİTE STANDARTLARI
    // ========================================
    qualityStandardId: t.int(),
    defectTolerance: t.float(),

    // ========================================
    // ACİL SİPARİŞ
    // ========================================
    rushOrderAvailable: t.boolean(),
    rushOrderExtraCost: t.float(),
    rushOrderMinDays: t.int(),

    // ========================================
    // SERTİFİKALAR
    // ========================================
    certificationIds: t.intList(),

    // ========================================
    // KAPASİTE & NUMUNE POLİTİKASI
    // ========================================
    monthlyCapacity: t.int(),
    maxOrderQuantity: t.int(),
    allowDirectOrder: t.boolean(),
    requireSample: t.boolean(),
    samplePolicy: t.string(),
    sampleLeadTime: t.int(),
    samplePrice: t.float(),

    // ========================================
    // YENİ LİBRARY RELATIONS
    // ========================================
    defaultSizeBreakdownId: t.int(),
    printIds: t.intList(),
    washEffectId: t.int(),

    // ========================================
    // MEDYA
    // ========================================
    images: t.string(),

    // ========================================
    // ÜRETİM PROGRAMI
    // ========================================
    productionSchedule: t.string(),

    // ========================================
    // ANALİTİK (Analytics)
    // ========================================
    viewCount: t.int(), // Schema: Int @default(0)
    shareCount: t.int(), // Schema: Int @default(0)

    // ========================================
    // RFQ SİSTEMİ
    // ========================================
    ownerType: t.string(),
    customerBrief: t.string(),
    referenceImages: t.string(),
    sketchUrl: t.string(),
    targetBudget: t.float(),
    targetQuantity: t.int(),
    targetDeliveryDays: t.int(),
    isRFQ: t.boolean(),
    rfqStatus: t.string(),
    rfqDeadline: t.field({ type: "DateTime" }),
    rfqWinnerId: t.int(), // Schema: Int? - Selected winner manufacturer
    visibility: t.string(),
    invitedManufacturers: t.string(),
  }),
});

// ========================================
// MUTATIONS (Using InputTypes)
// ========================================

// Create collection (manufacturer companies only) - WITH LIBRARY INTEGRATION
// Only MANUFACTURER or BOTH type companies can create collections
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      input: t.arg({ type: CreateCollectionInput, required: true }),
    },
    authScopes: { user: true }, // ✅ Allow all logged-in users (will check company type inside)
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("CreateCollection");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COLLECTION_CREATE
        requirePermission(context, PermissionGuide.CREATE_COLLECTIONS);

        // ========================================
        // SUBSCRIPTION LIMIT CHECK
        // ========================================
        if (context.user?.companyId) {
          const limitCheck = await canPerformAction(
            context.prisma,
            context.user.companyId,
            "create_collection"
          );

          if (!limitCheck.allowed) {
            throw new ValidationError(
              limitCheck.reason || "Koleksiyon oluşturma limiti aşıldı"
            );
          }
        }

        // ✅ Sanitize inputs
        const name = sanitizeString(args.input.name);
        const description = args.input.description
          ? sanitizeString(args.input.description)
          : undefined;
        const modelCode = args.input.modelCode
          ? sanitizeString(args.input.modelCode)
          : undefined;
        const techPack = args.input.techPack
          ? sanitizeString(args.input.techPack)
          : undefined;
        const notes = args.input.notes
          ? sanitizeString(args.input.notes)
          : undefined;
        const images = args.input.images
          ? sanitizeString(args.input.images)
          : undefined;

        // ✅ Validate sanitized inputs
        validateRequired(name, "Koleksiyon adı");
        validateStringLength(name, "Koleksiyon adı", 2, 200);

        if (description) {
          validateStringLength(description, "Açıklama", 0, 5000);
        }

        if (modelCode) {
          validateStringLength(modelCode, "Model kodu", 2, 100);
        }

        // ✅ Check if user has a company
        if (!context.user?.companyId) {
          throw new ValidationError(
            "Koleksiyon oluşturmak için bir şirkete bağlı olmalısınız"
          );
        }

        // ✅ Get user's company to check type
        const userCompany = await context.prisma.company.findUnique({
          where: { id: context.user.companyId },
          select: { id: true, type: true, name: true },
        });

        if (!userCompany) {
          throw new NotFoundError("Şirket bulunamadı");
        }

        // ✅ Only MANUFACTURER or BOTH type companies can create collections
        if (userCompany.type === "BUYER") {
          throw new ForbiddenError(
            "Sadece üretici şirketler koleksiyon oluşturabilir. " +
              "Şirketiniz ALICI olarak kayıtlı. " +
              "Şirket tipini değiştirmek için destek ekibiyle iletişime geçin."
          );
        }

        logInfo("Koleksiyon oluşturuluyor", {
          userId: context.user.id,
          companyId: userCompany.id,
          name,
        });

        const slug = generateSlug(name!);

        // ✅ Sanitize numeric/ID inputs
        const categoryId = args.input.categoryId
          ? sanitizeInt(args.input.categoryId)
          : undefined;
        const seasonId = args.input.seasonId
          ? sanitizeInt(args.input.seasonId)
          : undefined;
        const fitId = args.input.fitId
          ? sanitizeInt(args.input.fitId)
          : undefined;
        const trendId = args.input.trendId
          ? sanitizeInt(args.input.trendId)
          : undefined;
        const moq = args.input.moq ? sanitizeInt(args.input.moq) : undefined;
        const targetPrice = args.input.targetPrice
          ? sanitizeFloat(args.input.targetPrice)
          : undefined;
        const targetLeadTime = args.input.targetLeadTime
          ? sanitizeInt(args.input.targetLeadTime)
          : undefined;
        const deadlineDays = args.input.deadlineDays
          ? sanitizeInt(args.input.deadlineDays)
          : undefined;

        // ✅ Validate numeric inputs
        if (moq !== undefined && moq !== null) {
          validateRange(moq, "Minimum sipariş miktarı (MOQ)", 0, 1000000);
        }

        if (targetPrice !== undefined && targetPrice !== null) {
          validateRange(targetPrice, "Hedef fiyat", 0, 1000000);
        }

        if (targetLeadTime !== undefined && targetLeadTime !== null) {
          validateRange(targetLeadTime, "Hedef teslim süresi", 0, 365);
        }

        if (deadlineDays !== undefined && deadlineDays !== null) {
          validateRange(deadlineDays, "Son teslim günü", 0, 365);
        }

        // ✅ Validate ID arrays
        validateIdArray(args.input.colorIds, "Renk ID'leri", 50);
        validateIdArray(args.input.sizeGroupIds, "Beden grubu ID'leri", 20);
        validateIdArray(args.input.fabricIds, "Kumaş ID'leri", 50);
        validateIdArray(args.input.accessoryIds, "Aksesuar ID'leri", 100);
        validateIdArray(args.input.certificationIds, "Sertifika ID'leri", 20);

        const data: any = {
          name,
          slug,
          modelCode: modelCode || `MODEL-${Date.now()}`,
          company: {
            connect: { id: context.user.companyId },
          },
          author: {
            connect: { id: context.user.id },
          },
          isActive: true,
          viewCount: 0,
          shareCount: 0,
          likesCount: 0,
        };

        // Basic fields
        if (description !== undefined) data.description = description;

        // Category Integration
        if (categoryId !== undefined) data.categoryId = categoryId;

        // Season & Gender & Fit (LibraryItem relations)
        if (seasonId !== undefined) data.seasonId = seasonId;
        if (args.input.gender !== undefined) data.gender = args.input.gender;
        if (fitId !== undefined) data.fitId = fitId;
        if (trendId !== undefined) data.trendId = trendId;
        if (techPack !== undefined) data.techPack = techPack;

        // Commercial Info
        if (moq !== undefined) data.moq = moq;
        if (targetPrice !== undefined) {
          data.targetPrice = targetPrice;
          data.price = targetPrice;
        }
        if (args.input.currency !== undefined)
          data.currency = args.input.currency;
        if (targetLeadTime !== undefined) data.targetLeadTime = targetLeadTime;
        if (args.input.deadline !== undefined)
          data.deadline = args.input.deadline;
        if (deadlineDays !== undefined) data.deadlineDays = deadlineDays;
        if (notes !== undefined) data.notes = notes;

        // Media
        if (images !== undefined) data.images = images;

        // Production Schedule
        if (args.input.productionSchedule !== undefined)
          data.productionSchedule = args.input.productionSchedule;

        // Handle Many-to-Many LibraryItem relations
        if (args.input.colorIds && args.input.colorIds.length > 0) {
          data.colors = {
            connect: args.input.colorIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (args.input.sizeGroupIds && args.input.sizeGroupIds.length > 0) {
          data.sizeGroups = {
            connect: args.input.sizeGroupIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (args.input.fabricIds && args.input.fabricIds.length > 0) {
          data.fabrics = {
            connect: args.input.fabricIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (args.input.accessoryIds && args.input.accessoryIds.length > 0) {
          data.accessories = {
            connect: args.input.accessoryIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (
          args.input.certificationIds &&
          args.input.certificationIds.length > 0
        ) {
          data.certifications = {
            connect: args.input.certificationIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }

        const collection = await context.prisma.collection.create({
          ...query,
          data,
        });

        // ✅ Notification: Owner'a yeni koleksiyon bildirimi
        try {
          const notification = await context.prisma.notification.create({
            data: {
              type: "SYSTEM",
              title: "📚 Yeni Koleksiyon Oluşturuldu",
              message: `"${collection.name}" koleksiyonu başarıyla oluşturuldu.`,
              userId: context.user.id,
              link: `/dashboard/collections/${collection.id}`,
              isRead: false,
            },
          });
          await publishNotification(notification);
        } catch (notifError) {
          // Don't fail if notification fails
        }

        logInfo("Koleksiyon oluşturuldu", {
          metadata: timer.end(),
          userId: context.user.id,
          companyId: userCompany.id,
          collectionId: collection.id,
          name: collection.name,
        });

        return collection;
      } catch (error) {
        logError("Koleksiyon oluşturma hatası", error as Error, {
          metadata: timer.end(),
          name: args.input.name,
          companyId: context.user?.companyId,
        });
        throw handleError(error);
      }
    },
  })
);

// Update collection (owner or admin) - WITH LIBRARY INTEGRATION
builder.mutationField("updateCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      input: t.arg({ type: UpdateCollectionInput, required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateCollection");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COLLECTION_UPDATE
        requirePermission(context, PermissionGuide.UPDATE_COLLECTIONS);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.input.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir koleksiyon ID'si gerekli");
        }

        logInfo("Koleksiyon güncelleniyor", {
          userId: context.user!.id,
          collectionId: id,
        });

        const collection = await context.prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon bulunamadı");
        }

        if (
          collection.companyId !== context.user?.companyId &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ForbiddenError("Bu koleksiyonu güncelleme yetkiniz yok");
        }

        const updateData: any = {};

        // ✅ Sanitize and validate fields
        if (args.input.name !== null && args.input.name !== undefined) {
          const name = sanitizeString(args.input.name);
          validateRequired(name, "Koleksiyon adı");
          validateStringLength(name!, "Koleksiyon adı", 2, 200);
          updateData.name = name;
          updateData.slug = generateSlug(name!);
        }

        if (
          args.input.description !== null &&
          args.input.description !== undefined
        ) {
          const description = sanitizeString(args.input.description);
          if (description) {
            validateStringLength(description, "Açıklama", 0, 5000);
          }
          updateData.description = description;
        }

        if (
          args.input.modelCode !== null &&
          args.input.modelCode !== undefined
        ) {
          const modelCode = sanitizeString(args.input.modelCode);
          if (modelCode) {
            validateStringLength(modelCode, "Model kodu", 2, 100);
          }
          updateData.modelCode = modelCode;
        }
        if (
          args.input.isFeatured !== null &&
          args.input.isFeatured !== undefined
        )
          updateData.isFeatured = args.input.isFeatured;
        if (args.input.isActive !== null && args.input.isActive !== undefined)
          updateData.isActive = args.input.isActive;

        // Category Integration
        if (
          args.input.categoryId !== null &&
          args.input.categoryId !== undefined
        ) {
          const categoryId = sanitizeInt(args.input.categoryId);
          if (categoryId && categoryId > 0) updateData.categoryId = categoryId;
        }

        // Season & Gender & Fit
        if (args.input.seasonId !== null && args.input.seasonId !== undefined) {
          const seasonId = sanitizeInt(args.input.seasonId);
          if (seasonId && seasonId > 0) updateData.seasonId = seasonId;
        }
        if (args.input.gender !== null && args.input.gender !== undefined)
          updateData.gender = args.input.gender;
        if (args.input.fitId !== null && args.input.fitId !== undefined) {
          const fitId = sanitizeInt(args.input.fitId);
          if (fitId && fitId > 0) updateData.fitId = fitId;
        }
        if (args.input.trendId !== null && args.input.trendId !== undefined) {
          const trendId = sanitizeInt(args.input.trendId);
          if (trendId && trendId > 0) updateData.trendId = trendId;
        }

        if (args.input.techPack !== null && args.input.techPack !== undefined)
          updateData.techPack = sanitizeString(args.input.techPack);

        // Commercial Info
        if (args.input.moq !== null && args.input.moq !== undefined) {
          const moq = sanitizeInt(args.input.moq);
          if (moq !== null) {
            validateRange(moq, "Minimum sipariş miktarı (MOQ)", 0, 1000000);
          }
          updateData.moq = moq;
        }
        if (
          args.input.targetPrice !== null &&
          args.input.targetPrice !== undefined
        ) {
          const targetPrice = sanitizeFloat(args.input.targetPrice);
          if (targetPrice !== null) {
            validateRange(targetPrice, "Hedef fiyat", 0, 1000000);
          }
          updateData.targetPrice = targetPrice;
          updateData.price = targetPrice;
        }
        if (args.input.currency !== null && args.input.currency !== undefined)
          updateData.currency = args.input.currency;
        if (
          args.input.targetLeadTime !== null &&
          args.input.targetLeadTime !== undefined
        ) {
          const targetLeadTime = sanitizeInt(args.input.targetLeadTime);
          if (targetLeadTime !== null) {
            validateRange(targetLeadTime, "Hedef teslim süresi", 0, 365);
          }
          updateData.targetLeadTime = targetLeadTime;
        }
        if (args.input.deadline !== null && args.input.deadline !== undefined)
          updateData.deadline = args.input.deadline;
        if (
          args.input.deadlineDays !== null &&
          args.input.deadlineDays !== undefined
        ) {
          const deadlineDays = sanitizeInt(args.input.deadlineDays);
          if (deadlineDays !== null) {
            validateRange(deadlineDays, "Son teslim günü", 0, 365);
          }
          updateData.deadlineDays = deadlineDays;
        }
        if (args.input.notes !== null && args.input.notes !== undefined) {
          const notes = sanitizeString(args.input.notes);
          if (notes) {
            validateStringLength(notes, "Notlar", 0, 2000);
          }
          updateData.notes = notes;
        }

        // Media
        if (args.input.images !== null && args.input.images !== undefined)
          updateData.images = sanitizeString(args.input.images);

        // Production Schedule
        if (
          args.input.productionSchedule !== null &&
          args.input.productionSchedule !== undefined
        )
          updateData.productionSchedule = args.input.productionSchedule;

        // Handle Many-to-Many LibraryItem relation updates
        if (args.input.colorIds !== null && args.input.colorIds !== undefined) {
          validateIdArray(args.input.colorIds, "Renk ID'leri", 50);
          updateData.colors = {
            set: args.input.colorIds.map((id) => ({ id: sanitizeInt(id)! })),
          };
        }
        if (
          args.input.sizeGroupIds !== null &&
          args.input.sizeGroupIds !== undefined
        ) {
          validateIdArray(args.input.sizeGroupIds, "Beden grubu ID'leri", 20);
          updateData.sizeGroups = {
            set: args.input.sizeGroupIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (
          args.input.fabricIds !== null &&
          args.input.fabricIds !== undefined
        ) {
          validateIdArray(args.input.fabricIds, "Kumaş ID'leri", 50);
          updateData.fabrics = {
            set: args.input.fabricIds.map((id) => ({ id: sanitizeInt(id)! })),
          };
        }
        if (
          args.input.accessoryIds !== null &&
          args.input.accessoryIds !== undefined
        ) {
          validateIdArray(args.input.accessoryIds, "Aksesuar ID'leri", 100);
          updateData.accessories = {
            set: args.input.accessoryIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }
        if (
          args.input.certificationIds !== null &&
          args.input.certificationIds !== undefined
        ) {
          validateIdArray(args.input.certificationIds, "Sertifika ID'leri", 20);
          updateData.certifications = {
            set: args.input.certificationIds.map((id) => ({
              id: sanitizeInt(id)!,
            })),
          };
        }

        const updatedCollection = await context.prisma.collection.update({
          ...query,
          where: { id },
          data: updateData,
        });

        logInfo("Koleksiyon güncellendi", {
          metadata: timer.end(),
          userId: context.user!.id,
          collectionId: updatedCollection.id,
          updatedFields: Object.keys(updateData),
        });

        return updatedCollection;
      } catch (error) {
        logError("Koleksiyon güncelleme hatası", error as Error, {
          metadata: timer.end(),
          collectionId: args.input.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Publish collection (owner or admin)
builder.mutationField("publishCollection", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("PublishCollection");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COLLECTION_UPDATE (publish is an update operation)
        requirePermission(context, PermissionGuide.UPDATE_COLLECTIONS);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir koleksiyon ID'si gerekli");
        }

        logInfo("Koleksiyon yayınlanıyor", {
          userId: context.user!.id,
          collectionId: id,
        });

        const collection = await context.prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon bulunamadı");
        }

        if (
          collection.companyId !== context.user?.companyId &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ForbiddenError("Bu koleksiyonu yayınlama yetkiniz yok");
        }

        await context.prisma.collection.update({
          where: { id },
          data: { isActive: true },
        });

        // ✅ Notification: Owner'a yayınlanma bildirimi
        try {
          const notification = await context.prisma.notification.create({
            data: {
              type: "SYSTEM",
              title: "🚀 Koleksiyon Yayınlandı",
              message: `"${collection.name}" koleksiyonu başarıyla yayınlandı ve artık müşteriler tarafından görüntülenebilir.`,
              userId: context.user!.id,
              link: `/dashboard/collections/${id}`,
              isRead: false,
            },
          });
          await publishNotification(notification);
        } catch (notifError) {
          // Don't fail if notification fails
        }

        logInfo("Koleksiyon yayınlandı", {
          metadata: timer.end(),
          userId: context.user!.id,
          collectionId: id,
          collectionName: collection.name,
        });

        return true;
      } catch (error) {
        logError("Koleksiyon yayınlama hatası", error as Error, {
          metadata: timer.end(),
          collectionId: args.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Toggle featured status (owner or admin)
builder.mutationField("toggleFeaturedCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("ToggleFeaturedCollection");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COLLECTION_UPDATE (featured toggle is an update)
        requirePermission(context, PermissionGuide.UPDATE_COLLECTIONS);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir koleksiyon ID'si gerekli");
        }

        logInfo("Koleksiyon öne çıkarma durumu değiştiriliyor", {
          userId: context.user!.id,
          collectionId: id,
        });

        const collection = await context.prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon bulunamadı");
        }

        if (
          collection.companyId !== context.user?.companyId &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ForbiddenError(
            "Bu koleksiyonun öne çıkarma durumunu değiştirme yetkiniz yok"
          );
        }

        const newFeaturedStatus = !collection.isFeatured;

        const result = await context.prisma.collection.update({
          ...query,
          where: { id },
          data: { isFeatured: newFeaturedStatus },
        });

        logInfo("Koleksiyon öne çıkarma durumu değiştirildi", {
          metadata: timer.end(),
          userId: context.user!.id,
          collectionId: id,
          oldStatus: collection.isFeatured,
          newStatus: newFeaturedStatus,
        });

        return result;
      } catch (error) {
        logError(
          "Koleksiyon öne çıkarma durumu değiştirme hatası",
          error as Error,
          {
            metadata: timer.end(),
            collectionId: args.id,
          }
        );
        throw handleError(error);
      }
    },
  })
);

// Delete collection (owner or admin)
builder.mutationField("deleteCollection", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("DeleteCollection");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COLLECTION_DELETE
        requirePermission(context, PermissionGuide.DELETE_COLLECTIONS);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir koleksiyon ID'si gerekli");
        }

        logInfo("Koleksiyon siliniyor", {
          userId: context.user!.id,
          collectionId: id,
        });

        const collection = await context.prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon bulunamadı");
        }

        if (
          collection.companyId !== context.user?.companyId &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ForbiddenError("Bu koleksiyonu silme yetkiniz yok");
        }

        await context.prisma.collection.delete({
          where: { id },
        });

        // ✅ Notification: Owner'a silme bildirimi
        try {
          const notification = await context.prisma.notification.create({
            data: {
              type: "SYSTEM",
              title: "🗑️ Koleksiyon Silindi",
              message: `"${collection.name}" koleksiyonu başarıyla silindi.`,
              userId: context.user!.id,
              link: `/dashboard/collections`,
              isRead: false,
            },
          });
          await publishNotification(notification);
        } catch (notifError) {
          // Don't fail if notification fails
        }

        logInfo("Koleksiyon silindi", {
          metadata: timer.end(),
          userId: context.user!.id,
          collectionId: id,
          collectionName: collection.name,
        });

        return true;
      } catch (error) {
        logError("Koleksiyon silme hatası", error as Error, {
          metadata: timer.end(),
          collectionId: args.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Increment view count for collection (logged-in users)
// ✅ No permission required - Analytics tracking only
builder.mutationField("incrementCollectionView", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("IncrementCollectionView");

      try {
        // ✅ Auth check (no permission required)
        requireAuth(context.user?.id);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir koleksiyon ID'si gerekli");
        }

        const collection = await context.prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          throw new NotFoundError("Koleksiyon bulunamadı");
        }

        // Update view count and lastViewedAt
        const result = await context.prisma.collection.update({
          ...query,
          where: { id },
          data: {
            viewCount: collection.viewCount + 1,
            lastViewedAt: new Date(),
          },
        });

        logInfo("Koleksiyon görüntüleme sayısı artırıldı", {
          metadata: timer.end(),
          userId: context.user!.id,
          collectionId: id,
          newViewCount: result.viewCount,
        });

        return result;
      } catch (error) {
        logError(
          "Koleksiyon görüntüleme sayısı artırma hatası",
          error as Error,
          {
            metadata: timer.end(),
            collectionId: args.id,
          }
        );
        throw handleError(error);
      }
    },
  })
);

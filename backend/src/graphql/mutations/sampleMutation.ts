/**
 * Sample Mutations - NUMUNE YÖNETİM SİSTEMİ
 *
 * 🎯 Amaç: Numune oluşturma, güncelleme ve silme işlemleri
 *
 * 📋 Mevcut Mutation'lar:
 *
 * MÜŞTERİ İŞLEMLERİ:
 * - createSample: Yeni numune talebi oluştur
 * - updateSample: Numune güncelle (durum değişikliği)
 * - deleteSample: Numune sil
 *
 * 🔒 Güvenlik:
 * - Müşteriler numune talebi oluşturabilir
 * - Sahip veya izinli kullanıcı güncelleyebilir
 * - Admin tüm işlemleri yapabilir
 * - Şirket bazlı izin kontrolleri
 *
 * 💡 Özellikler:
 * - AI tasarım desteği (AI_DESIGN durumu)
 * - 28 farklı durum yönetimi
 * - Dinamik görev oluşturma (status değişiminde)
 * - Gerçek zamanlı bildirimler
 * - Validasyon (fiyat, süre, not uzunlukları)
 * - İzin tabanlı erişim kontrolü
 */

import builder from "../builder";

// Hata yönetimi
import { handleError, requireAuth, ValidationError } from "../../utils/errors";

// Loglama
import { createTimer, logInfo } from "../../utils/logger";

// Temizleme (Sanitization)
import {
  sanitizeBoolean,
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

// İzin kontrolleri
import {
  PermissionGuide,
  requirePermission,
  requireSameCompanyOrPermission,
} from "../../utils/permissionHelpers";

// Bildirimler ve subscriptions
import {
  publishNotification,
  publishSampleStatusChanged,
  publishSampleUserUpdate,
} from "../../utils/publishHelpers";

// Subscription enforcement
import { canPerformAction } from "../../utils/subscriptionHelper";

// ========================================
// CONSTANTS - Schema'daki SampleStatus enum değerleri
// ========================================

const ValidSampleStatuses = [
  // İlk aşamalar (AI ve Talep)
  "AI_DESIGN", // AI ile oluşturulmuş tasarım
  "PENDING_APPROVAL", // Üretici onayı bekleniyor
  "PENDING", // Beklemede - Yeni talep

  // İnceleme ve Teklif Aşaması
  "REVIEWED", // Üretici tarafından inceleniyor
  "QUOTE_SENT", // Üretici süre ve fiyat teklifi gönderdi
  "CUSTOMER_QUOTE_SENT", // Müşteri teklif gönderdi
  "MANUFACTURER_REVIEWING_QUOTE", // Üretici müşteri teklifini inceliyor

  // Onay/Red Durumlar
  "CONFIRMED", // Müşteri onayladı, üretim başlayabilir
  "REJECTED", // Genel red
  "REJECTED_BY_CUSTOMER", // Müşteri tarafından reddedildi
  "REJECTED_BY_MANUFACTURER", // Üretici tarafından reddedildi

  // Üretim Aşamaları
  "IN_DESIGN", // Tasarım aşamasında
  "PATTERN_READY", // Kalıp hazır
  "IN_PRODUCTION", // Üretim aşamasında
  "PRODUCTION_COMPLETE", // Üretim tamamlandı

  // Kalite ve Teslimat
  "QUALITY_CHECK", // Kalite kontrolde
  "SHIPPED", // Kargoya verildi
  "DELIVERED", // Müşteriye teslim edildi

  // Diğer Durumlar
  "ON_HOLD", // Durduruldu
  "CANCELLED", // İptal edildi

  // Eski Flow (Geriye dönük uyumluluk)
  "REQUESTED", // Müşteri tarafından talep edildi
  "RECEIVED", // Üretici talebi aldı
  "COMPLETED", // Tamamlandı
];

// ========================================
// INPUT TYPES
// ========================================

/**
 * Input for creating a new sample
 * - Customer requests sample from manufacturer
 * - Can be AI-generated design or custom design
 */
const CreateSampleInput = builder.inputType("CreateSampleInput", {
  fields: (t) => ({
    name: t.string({ required: true }), // Min 3, Max 200 characters
    description: t.string({ required: false }),
    collectionId: t.int({ required: false }),
    sampleType: t.string({ required: false }), // SampleType enum
    manufacturerId: t.int({ required: true }), // Required: must specify manufacturer

    // AI Design fields
    aiGenerated: t.boolean({ required: false }),
    aiPrompt: t.string({ required: false }), // AI prompt text
    aiSketchUrl: t.string({ required: false }), // AI sketch URL

    // Images
    images: t.string({ required: false }), // JSON array
    customDesignImages: t.string({ required: false }), // JSON array

    // Customer notes
    customerNote: t.string({ required: false }), // Max 2000 characters
  }),
});

/**
 * Input for updating an existing sample
 * - Owner or admin can update
 * - Status changes trigger dynamic tasks
 */
const UpdateSampleInput = builder.inputType("UpdateSampleInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    name: t.string({ required: false }), // Min 3, Max 200 characters
    description: t.string({ required: false }),
    status: t.string({ required: false }), // SampleStatus enum validation

    // AI Design fields
    aiPrompt: t.string({ required: false }),
    aiSketchUrl: t.string({ required: false }),

    // Images
    images: t.string({ required: false }), // JSON array
    customDesignImages: t.string({ required: false }), // JSON array

    // Production fields
    unitPrice: t.float({ required: false }), // Must be > 0
    productionDays: t.int({ required: false }), // Must be > 0

    // Customer Quote fields
    customerQuotedPrice: t.float({ required: false }), // Must be > 0
    customerQuoteDays: t.int({ required: false }), // Must be > 0
    customerQuoteNote: t.string({ required: false }), // Max 2000 characters

    // Notes
    customerNote: t.string({ required: false }), // Max 2000 characters
    manufacturerResponse: t.string({ required: false }), // Max 2000 characters
  }),
});

/**
 * Input for deleting a sample
 * - Owner or admin only
 */
const DeleteSampleInput = builder.inputType("DeleteSampleInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
  }),
});

/**
 * CREATE SAMPLE MUTATION
 *
 * Allows customers to create a new sample request.
 *
 * Flow:
 * 1. Validate inputs (name, manufacturerId)
 * 2. Parse JSON fields (images, customDesignImages)
 * 3. Determine initial status (AI_DESIGN or PENDING)
 * 4. Generate unique sample number
 * 5. Create sample with analytics initialization
 * 6. Create dynamic tasks for initial status
 * 7. Notify manufacturer
 *
 * Permissions: Any authenticated user
 * Initial Status: AI_DESIGN (if AI-generated) or PENDING
 */
builder.mutationField("createSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: CreateSampleInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("createSample");
      try {
        requireAuth(context.user?.id);
        // ✅ Permission check: SAMPLE_CREATE
        requirePermission(context, PermissionGuide.CREATE_SAMPLES);

        // ========================================
        // SUBSCRIPTION LIMIT CHECK
        // ========================================
        if (context.user?.companyId) {
          const limitCheck = await canPerformAction(
            context.prisma,
            context.user.companyId,
            "create_sample"
          );

          if (!limitCheck.allowed) {
            throw new ValidationError(
              limitCheck.reason || "Numune oluşturma limiti aşıldı"
            );
          }
        }

        // Sanitize inputs
        const name = sanitizeString(input.name)!;
        const description = input.description
          ? sanitizeString(input.description)
          : undefined;
        const collectionId = input.collectionId
          ? sanitizeInt(input.collectionId)
          : undefined;
        const sampleType = input.sampleType
          ? sanitizeString(input.sampleType)
          : undefined;
        const manufacturerId = sanitizeInt(input.manufacturerId)!;
        const aiGenerated =
          input.aiGenerated !== undefined
            ? sanitizeBoolean(input.aiGenerated)
            : false;
        const aiPrompt = input.aiPrompt
          ? sanitizeString(input.aiPrompt)
          : undefined;
        const aiSketchUrl = input.aiSketchUrl
          ? sanitizeString(input.aiSketchUrl)
          : undefined;
        const images = input.images ? sanitizeString(input.images) : undefined;
        const customDesignImages = input.customDesignImages
          ? sanitizeString(input.customDesignImages)
          : undefined;
        const customerNote = input.customerNote
          ? sanitizeString(input.customerNote)
          : undefined;

        // Validate inputs
        validateRequired(name, "Numune adı");
        validateStringLength(name, "Numune adı", 3, 200);
        validateRequired(manufacturerId, "Üretici ID");

        if (description) validateStringLength(description, "Açıklama", 0, 1000);
        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 2000);
        if (aiPrompt) validateStringLength(aiPrompt, "AI prompt", 0, 2000);

        // Validate sample type if provided
        const validSampleTypes = [
          "STANDARD",
          "REVISION",
          "PROTOTYPE",
          "PRODUCTION",
        ];
        if (sampleType)
          validateEnum(sampleType, "Numune tipi", validSampleTypes);

        // Parse JSON fields
        let parsedImages: any = null;
        if (images) {
          try {
            parsedImages = JSON.parse(images);
          } catch {
            throw new ValidationError("Geçersiz görseller JSON formatı");
          }
        }

        let parsedCustomDesignImages: any = null;
        if (customDesignImages) {
          try {
            parsedCustomDesignImages = JSON.parse(customDesignImages);
          } catch {
            throw new ValidationError(
              "Geçersiz özel tasarım görselleri JSON formatı"
            );
          }
        }

        // Verify manufacturer exists
        const manufacturer = await context.prisma.user.findUnique({
          where: { id: manufacturerId },
          select: { id: true, name: true, email: true },
        });

        if (!manufacturer) {
          throw new ValidationError("Üretici bulunamadı");
        }

        // Determine initial status
        const initialStatus = aiGenerated ? "AI_DESIGN" : "PENDING";

        // Generate unique sample number
        const sampleNumber = `SAMPLE-${Date.now()}`;

        // Create sample
        const sample = await context.prisma.sample.create({
          ...query,
          data: {
            sampleNumber,
            name,
            description: description || null,
            customerId: context.user!.id,
            manufactureId: manufacturerId,
            collectionId: collectionId || null,
            sampleType: sampleType as any,
            status: initialStatus,
            aiGenerated: aiGenerated || false,
            aiPrompt: aiPrompt || null,
            aiSketchUrl: aiSketchUrl || null,
            images: parsedImages,
            customDesignImages: parsedCustomDesignImages,
            customerNote: customerNote || null,
          },
        });

        logInfo("Numune oluşturuldu", {
          sampleId: sample.id,
          sampleNumber,
          status: initialStatus,
          customerId: context.user!.id,
          manufacturerId,
          aiGenerated,
          metadata: timer.end(),
        });

        // Notify manufacturer
        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: manufacturerId,
              type: "SAMPLE",
              title: "Yeni Numune Talebi",
              message: `"${name}" için yeni numune talebi aldınız`,
              link: `/samples/${sample.id}`,
              data: {
                sampleId: sample.id,
                sampleNumber,
                customerId: context.user!.id,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Numune bildirimi gönderilemedi", {
            error: String(err),
            sampleId: sample.id,
          });
        }

        return sample;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * UPDATE SAMPLE MUTATION
 *
 * Allows sample owner or admin to update sample details.
 *
 * Flow:
 * 1. Validate permission (owner or admin)
 * 2. Sanitize and validate inputs
 * 3. Parse JSON fields
 * 4. Update sample
 * 5. Create dynamic tasks if status changed
 * 6. Notify relevant parties on status change
 *
 * Permissions: Sample owner or ADMIN
 * Status changes trigger dynamic task creation
 */
builder.mutationField("updateSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      input: t.arg({ type: UpdateSampleInput, required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("updateSample");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const id = sanitizeInt(input.id)!;
        const name = input.name ? sanitizeString(input.name) : undefined;
        const description = input.description
          ? sanitizeString(input.description)
          : undefined;
        const status = input.status ? sanitizeString(input.status) : undefined;
        const aiPrompt = input.aiPrompt
          ? sanitizeString(input.aiPrompt)
          : undefined;
        const aiSketchUrl = input.aiSketchUrl
          ? sanitizeString(input.aiSketchUrl)
          : undefined;
        const images = input.images ? sanitizeString(input.images) : undefined;
        const customDesignImages = input.customDesignImages
          ? sanitizeString(input.customDesignImages)
          : undefined;
        const unitPrice = input.unitPrice
          ? sanitizeFloat(input.unitPrice)
          : undefined;
        const productionDays = input.productionDays
          ? sanitizeInt(input.productionDays)
          : undefined;
        const customerQuotedPrice = input.customerQuotedPrice
          ? sanitizeFloat(input.customerQuotedPrice)
          : undefined;
        const customerQuoteDays = input.customerQuoteDays
          ? sanitizeInt(input.customerQuoteDays)
          : undefined;
        const customerQuoteNote = input.customerQuoteNote
          ? sanitizeString(input.customerQuoteNote)
          : undefined;
        const customerNote = input.customerNote
          ? sanitizeString(input.customerNote)
          : undefined;
        const manufacturerResponse = input.manufacturerResponse
          ? sanitizeString(input.manufacturerResponse)
          : undefined;

        // Validate inputs
        validateRequired(id, "Numune ID");
        if (name) validateStringLength(name, "Numune adı", 3, 200);
        if (description) validateStringLength(description, "Açıklama", 0, 1000);
        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 2000);
        if (customerQuoteNote)
          validateStringLength(
            customerQuoteNote,
            "Müşteri teklif notu",
            0,
            2000
          );
        if (manufacturerResponse)
          validateStringLength(manufacturerResponse, "Üretici cevabı", 0, 2000);
        if (aiPrompt) validateStringLength(aiPrompt, "AI prompt", 0, 2000);

        // Validate status
        if (status) validateEnum(status, "Durum", ValidSampleStatuses);

        // Validate prices and days
        if (unitPrice !== undefined && unitPrice !== null && unitPrice <= 0) {
          throw new ValidationError("Birim fiyat 0'dan büyük olmalıdır");
        }
        if (
          productionDays !== undefined &&
          productionDays !== null &&
          productionDays <= 0
        ) {
          throw new ValidationError("Üretim süresi 0'dan büyük olmalıdır");
        }
        if (
          customerQuotedPrice !== undefined &&
          customerQuotedPrice !== null &&
          customerQuotedPrice <= 0
        ) {
          throw new ValidationError(
            "Müşteri teklif fiyatı 0'dan büyük olmalıdır"
          );
        }
        if (
          customerQuoteDays !== undefined &&
          customerQuoteDays !== null &&
          customerQuoteDays <= 0
        ) {
          throw new ValidationError(
            "Müşteri teklif süresi 0'dan büyük olmalıdır"
          );
        }

        // Check ownership
        const sample = await context.prisma.sample.findUnique({
          where: { id },
          select: {
            id: true,
            customerId: true,
            manufactureId: true,
            status: true,
            name: true,
          },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        // ✅ Permission check: Owner OR UPDATE_SAMPLES permission
        // Get the company the sample belongs to (customer or manufacturer)
        const sampleCompany = await context.prisma.user.findUnique({
          where: { id: sample.customerId },
          select: { companyId: true },
        });

        if (sampleCompany?.companyId) {
          requireSameCompanyOrPermission(
            context,
            sampleCompany.companyId,
            PermissionGuide.UPDATE_SAMPLES,
            "Bu numune güncellenemez"
          );
        } else {
          // Fallback: Owner check if no company
          if (
            sample.customerId !== context.user!.id &&
            context.user!.role !== "ADMIN"
          ) {
            throw new ValidationError("Bu numune güncellenemez");
          }
        }

        // Parse JSON fields
        let parsedImages: any = undefined;
        if (images) {
          try {
            parsedImages = JSON.parse(images);
          } catch {
            throw new ValidationError("Geçersiz görseller JSON formatı");
          }
        }

        let parsedCustomDesignImages: any = undefined;
        if (customDesignImages) {
          try {
            parsedCustomDesignImages = JSON.parse(customDesignImages);
          } catch {
            throw new ValidationError(
              "Geçersiz özel tasarım görselleri JSON formatı"
            );
          }
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (aiPrompt !== undefined) updateData.aiPrompt = aiPrompt;
        if (aiSketchUrl !== undefined) updateData.aiSketchUrl = aiSketchUrl;
        if (parsedImages !== undefined) updateData.images = parsedImages;
        if (parsedCustomDesignImages !== undefined)
          updateData.customDesignImages = parsedCustomDesignImages;
        if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
        if (productionDays !== undefined)
          updateData.productionDays = productionDays;
        if (customerQuotedPrice !== undefined)
          updateData.customerQuotedPrice = customerQuotedPrice;
        if (customerQuoteDays !== undefined)
          updateData.customerQuoteDays = customerQuoteDays;
        if (customerQuoteNote !== undefined)
          updateData.customerQuoteNote = customerQuoteNote;
        if (customerNote !== undefined) updateData.customerNote = customerNote;
        if (manufacturerResponse !== undefined)
          updateData.manufacturerResponse = manufacturerResponse;

        // Update sample
        const updatedSample = await context.prisma.sample.update({
          ...query,
          where: { id },
          data: updateData,
        });

        const statusChanged = status !== undefined && status !== sample.status;

        logInfo("Numune güncellendi", {
          sampleId: id,
          statusChanged,
          oldStatus: sample.status,
          newStatus: status,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        if (statusChanged) {
          // ========================================
          // REAL-TIME SUBSCRIPTIONS
          // ========================================
          try {
            const samplePayload = {
              sampleId: updatedSample.id,
              status: status!,
              previousStatus: sample.status,
              sampleNumber: updatedSample.sampleNumber,
              updatedAt: updatedSample.updatedAt,
              updatedBy: context.user!.id,
            };

            // Publish to sample-specific channel
            await publishSampleStatusChanged(updatedSample.id, samplePayload);

            // Publish to customer's personal channel
            await publishSampleUserUpdate(
              updatedSample.customerId,
              samplePayload
            );

            // Publish to manufacturer's personal channel
            await publishSampleUserUpdate(
              updatedSample.manufactureId,
              samplePayload
            );
          } catch (err) {
            logInfo("Sample status subscription yayınlanamadı", {
              error: String(err),
              sampleId: id,
            });
          }

          // Notify manufacturer on status change
          if (sample.customerId === context.user!.id) {
            try {
              const notif = await context.prisma.notification.create({
                data: {
                  userId: sample.manufactureId,
                  type: "SAMPLE",
                  title: "Numune Durumu Değişti",
                  message: `"${sample.name}" numunesinin durumu güncellendi: ${status}`,
                  link: `/samples/${id}`,
                  data: {
                    sampleId: id,
                    oldStatus: sample.status,
                    newStatus: status,
                  } as any,
                },
              });
              await publishNotification(notif);
            } catch (err) {
              logInfo("Durum değişikliği bildirimi gönderilemedi", {
                error: String(err),
                sampleId: id,
              });
            }
          }
        }

        return updatedSample;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * DELETE SAMPLE MUTATION
 *
 * Allows sample owner or admin to delete a sample.
 *
 * Flow:
 * 1. Validate permission (owner or admin)
 * 2. Verify sample exists
 * 3. Delete sample
 * 4. Notify manufacturer
 *
 * Permissions: Sample owner or ADMIN
 */
builder.mutationField("deleteSample", (t) =>
  t.field({
    type: "Boolean",
    args: {
      input: t.arg({ type: DeleteSampleInput, required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (_root, { input }, context) => {
      const timer = createTimer("deleteSample");
      try {
        requireAuth(context.user?.id);
        // ✅ Permission check: SAMPLE_DELETE
        requirePermission(context, PermissionGuide.DELETE_SAMPLES);

        // Sanitize input
        const id = sanitizeInt(input.id)!;

        // Validate input
        validateRequired(id, "Numune ID");

        // Check ownership
        const sample = await context.prisma.sample.findUnique({
          where: { id },
          select: {
            id: true,
            customerId: true,
            manufactureId: true,
            name: true,
            sampleNumber: true,
          },
        });

        if (!sample) {
          throw new ValidationError("Numune bulunamadı");
        }

        // ✅ Permission check: Same company OR DELETE permission
        const sampleCompany = await context.prisma.user.findUnique({
          where: { id: sample.customerId },
          select: { companyId: true },
        });

        if (sampleCompany?.companyId) {
          requireSameCompanyOrPermission(
            context,
            sampleCompany.companyId,
            PermissionGuide.DELETE_SAMPLES,
            "Bu numune silinemez"
          );
        } else {
          // Fallback: Owner check if no company
          if (
            sample.customerId !== context.user!.id &&
            context.user!.role !== "ADMIN"
          ) {
            throw new ValidationError("Bu numune silinemez");
          }
        }

        // Delete sample
        await context.prisma.sample.delete({
          where: { id },
        });

        logInfo("Numune silindi", {
          sampleId: id,
          sampleNumber: sample.sampleNumber,
          userId: context.user!.id,
          metadata: timer.end(),
        });

        // Notify manufacturer
        try {
          const notif = await context.prisma.notification.create({
            data: {
              userId: sample.manufactureId,
              type: "SAMPLE",
              title: "Numune Silindi",
              message: `"${sample.name}" numunesi müşteri tarafından silindi`,
              link: "/samples",
              data: {
                sampleId: id,
                sampleNumber: sample.sampleNumber,
              } as any,
            },
          });
          await publishNotification(notif);
        } catch (err) {
          logInfo("Silme bildirimi gönderilemedi", {
            error: String(err),
            sampleId: id,
          });
        }

        return true;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

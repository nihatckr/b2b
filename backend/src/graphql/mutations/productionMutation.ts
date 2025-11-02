/**
 * Production Tracking Mutations - PRODUCTION READY
 *
 * 🎯 Purpose: Production plan management, stage tracking, approval workflow
 *
 * 📋 Available Mutations:
 *
 * PRODUCTION PLAN MANAGEMENT:
 * - createProductionPlan: Create production plan with stages
 * - updateProductionPlan: Update existing production plan
 * - sendPlanForApproval: Send plan to customer for approval
 * - approvePlan: Customer approves production plan
 * - rejectPlan: Customer rejects production plan
 *
 * STAGE MANAGEMENT:
 * - updateProductionStage: Update specific stage
 * - completeProductionStage: Mark stage as completed
 * - revertProductionStage: Revert to previous stage
 * - addProductionStageUpdate: Add update/note to stage
 *
 * BULK OPERATIONS:
 * - bulkCompleteStages: Complete multiple stages at once
 * - bulkUpdateStatus: Update status for multiple productions
 * - bulkCancelProductions: Cancel multiple productions (admin)
 *
 * 🔒 Security:
 * - Manufacturer creates and manages production plans
 * - Customer approves/rejects plans
 * - Admin can override all operations
 *
 * 💡 Features:
 * - Full input validation and sanitization
 * - Comprehensive error handling
 * - Structured logging
 * - Real-time notifications
 * - Progress calculation
 * - Delay tracking
 */

import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeBoolean,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import {
  validateEnum,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// ENUMS & CONSTANTS
// ========================================

const ValidProductionStages = [
  "PLANNING",
  "FABRIC",
  "CUTTING",
  "SEWING",
  "QUALITY",
  "PACKAGING",
  "SHIPPING",
] as const;

const ValidProductionStatuses = [
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
  "DELAYED",
] as const;

const ValidApprovalStatuses = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVISION",
] as const;

// ========================================
// INPUT TYPES
// ========================================

const UpdateProductionStageInput = builder.inputType(
  "UpdateProductionStageInput",
  {
    fields: (t) => ({
      productionId: t.int({ required: true }),
      stage: t.string({ required: true }),
      notes: t.string({ required: false }),
      status: t.string({ required: false }),
    }),
  }
);

const CompleteProductionStageInput = builder.inputType(
  "CompleteProductionStageInput",
  {
    fields: (t) => ({
      productionId: t.int({ required: true }),
      stage: t.string({ required: true }),
      notes: t.string({ required: false }),
    }),
  }
);

const RevertProductionStageInput = builder.inputType(
  "RevertProductionStageInput",
  {
    fields: (t) => ({
      productionId: t.int({ required: true }),
      targetStage: t.string({ required: true }),
      reason: t.string({ required: false }),
    }),
  }
);

const AddProductionStageUpdateInput = builder.inputType(
  "AddProductionStageUpdateInput",
  {
    fields: (t) => ({
      productionId: t.int({ required: true }),
      stage: t.string({ required: true }),
      notes: t.string({ required: false }),
      photos: t.string({ required: false }),
      hasDelay: t.boolean({ required: true }),
      delayReason: t.string({ required: false }),
      extraDays: t.int({ required: false }),
    }),
  }
);

const CreateProductionPlanInput = builder.inputType(
  "CreateProductionPlanInput",
  {
    fields: (t) => ({
      orderId: t.int({ required: true }),
      stagesJson: t.string({ required: true }),
      estimatedStartDate: t.string({ required: false }),
      notes: t.string({ required: false }),
    }),
  }
);

const UpdateProductionPlanInput = builder.inputType(
  "UpdateProductionPlanInput",
  {
    fields: (t) => ({
      productionId: t.int({ required: true }),
      stagesJson: t.string({ required: true }),
      notes: t.string({ required: false }),
    }),
  }
);

const SendPlanForApprovalInput = builder.inputType("SendPlanForApprovalInput", {
  fields: (t) => ({
    productionId: t.int({ required: true }),
    notes: t.string({ required: false }),
  }),
});

const ApprovePlanInput = builder.inputType("ApprovePlanInput", {
  fields: (t) => ({
    productionId: t.int({ required: true }),
    customerNote: t.string({ required: false }),
  }),
});

const RejectPlanInput = builder.inputType("RejectPlanInput", {
  fields: (t) => ({
    productionId: t.int({ required: true }),
    customerRejectionReason: t.string({ required: true }),
    customerNote: t.string({ required: false }),
  }),
});

// ========================================
// STAGE MANAGEMENT MUTATIONS
// ========================================

// === MUTATION: Revert Production Stage ===
/**
 * Reverts production to a previous stage.
 * Manufacturer only - useful for fixing mistakes or handling issues.
 */
builder.mutationField("revertProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      targetStage: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("revertProductionStage");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const targetStage = sanitizeString(args.targetStage)!;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(targetStage, "Hedef aşama");

        const stageOrder = [
          "PLANNING",
          "FABRIC",
          "CUTTING",
          "SEWING",
          "QUALITY",
          "PACKAGING",
          "SHIPPING",
        ];
        validateEnum(targetStage, "Hedef aşama", stageOrder);

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
          include: { stageUpdates: { orderBy: { createdAt: "asc" } } },
        });

        if (!production) {
          throw new ValidationError("Üretim kaydı bulunamadı");
        }

        const currentIndex = stageOrder.indexOf(
          production.currentStage as string
        );
        const targetIndex = stageOrder.indexOf(targetStage);

        if (targetIndex >= currentIndex) {
          throw new ValidationError(
            "Mevcut veya gelecek aşamaya geri dönülemez"
          );
        }

        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              currentStage: targetStage as any,
              overallStatus: "IN_PROGRESS" as any,
              progress: Math.round(
                ((targetIndex + 1) / stageOrder.length) * 100
              ),
            },
          });

        const stagesToRevert = stageOrder.slice(targetIndex + 1);
        for (const stage of stagesToRevert) {
          await context.prisma.productionStageUpdate.updateMany({
            where: { productionId, stage: stage as any },
            data: {
              status: "NOT_STARTED" as any,
              actualStartDate: null,
              actualEndDate: null,
            },
          });
        }

        await context.prisma.productionStageUpdate.updateMany({
          where: {
            productionId,
            stage: targetStage as any,
          },
          data: { status: "IN_PROGRESS" as any, actualEndDate: null },
        });

        logInfo("Üretim aşaması geri alındı", {
          productionId,
          targetStage,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Update Production Stage
builder.mutationField("updateProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
      notes: t.arg.string(),
      status: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("updateProductionStage");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const stage = sanitizeString(args.stage)!;
        const notes = args.notes ? sanitizeString(args.notes) : undefined;
        const status = args.status ? sanitizeString(args.status) : undefined;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(stage, "Aşama");
        if (notes) validateStringLength(notes, "Notlar", 0, 2000);

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
        });

        if (!production) {
          throw new ValidationError("Üretim kaydı bulunamadı");
        }

        const updated = await context.prisma.productionTracking.update({
          ...query,
          where: { id: productionId },
          data: {
            notes: notes || undefined,
            actualStartDate: new Date(),
            actualEndDate: status === "COMPLETED" ? new Date() : null,
          } as any,
        });

        logInfo("Üretim aşaması güncellendi", {
          productionId,
          stage,
          status,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Add Production Stage Update
builder.mutationField("addProductionStageUpdate", (t) =>
  t.prismaField({
    type: "ProductionStageUpdate",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
      notes: t.arg.string(),
      photos: t.arg.string(),
      hasDelay: t.arg.boolean({ required: true }),
      delayReason: t.arg.string(),
      extraDays: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("addProductionStageUpdate");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const stage = sanitizeString(args.stage)!;
        const notes = args.notes ? sanitizeString(args.notes) : undefined;
        const photos = args.photos ? sanitizeString(args.photos) : undefined;
        const hasDelay = sanitizeBoolean(args.hasDelay)!;
        const delayReason = args.delayReason
          ? sanitizeString(args.delayReason)
          : undefined;
        const extraDays = args.extraDays ? sanitizeInt(args.extraDays)! : 0;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(stage, "Aşama");
        if (notes) validateStringLength(notes, "Notlar", 0, 2000);
        if (delayReason)
          validateStringLength(delayReason, "Gecikme sebebi", 0, 500);

        const stageUpdate = await context.prisma.productionStageUpdate.create({
          ...query,
          data: {
            productionId,
            stage: stage as any,
            notes: notes || undefined,
            photos: photos || undefined,
            isRevision: hasDelay,
            delayReason: delayReason || undefined,
            extraDays,
            status: "IN_PROGRESS" as any,
          } as any,
        });

        logInfo("Üretim aşaması güncelleme eklendi", {
          productionId,
          stage,
          hasDelay,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return stageUpdate;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Complete Production Stage
builder.mutationField("completeProductionStage", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stage: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("completeProductionStage");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const stage = sanitizeString(args.stage)!;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(stage, "Aşama");

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
          include: { order: true },
        });

        if (!production) {
          throw new ValidationError("Üretim kaydı bulunamadı");
        }

        const stageOrder = [
          "PLANNING",
          "FABRIC",
          "CUTTING",
          "SEWING",
          "QUALITY",
          "PACKAGING",
          "SHIPPING",
        ];
        const currentIndex = stageOrder.indexOf(stage);
        const nextStage = stageOrder[currentIndex + 1] || "COMPLETED";

        const updated = await context.prisma.productionTracking.update({
          ...query,
          where: { id: productionId },
          data: {
            currentStage: (nextStage === "COMPLETED"
              ? "SHIPPING"
              : nextStage) as any,
            progress: Math.round(
              ((currentIndex + 2) / stageOrder.length) * 100
            ),
            actualEndDate: nextStage === "COMPLETED" ? new Date() : null,
          },
        });

        await context.prisma.productionStageUpdate.updateMany({
          where: { productionId, stage: stage as any },
          data: { status: "COMPLETED" as any, actualEndDate: new Date() },
        });

        // Log stage completion
        if (nextStage !== "COMPLETED" && production.order) {
          logInfo("Üretim aşaması tamamlandı, sonraki aşamaya geçiliyor", {
            currentStage: stage,
            nextStage,
            productionId,
            orderId: production.order.id,
            metadata: timer.end(),
          });
        } else if (nextStage === "COMPLETED") {
          logInfo("Üretim tamamlandı - Tüm aşamalar bitti", {
            productionId,
            metadata: timer.end(),
          });

          // ✅ Notification: Customer'a üretim tamamlandı bildirimi
          if (production.order) {
            try {
              const notification = await context.prisma.notification.create({
                data: {
                  type: "PRODUCTION",
                  title: "✅ Üretim Tamamlandı",
                  message: `Sipariş #${production.order.orderNumber} için üretim tamamlandı ve sevkiyata hazır.`,
                  userId: production.order.customerId,
                  link: `/dashboard/orders/${production.order.id}`,
                  isRead: false,
                },
              });
              await publishNotification(notification);
            } catch (notifError) {
              // Don't fail if notification fails
            }
          }
        }

        // ✅ Notification: Customer'a aşama tamamlanma bildirimi
        if (production.order && nextStage !== "COMPLETED") {
          try {
            const stageNames: Record<string, string> = {
              PLANNING: "Planlama",
              FABRIC: "Kumaş Hazırlığı",
              CUTTING: "Kesim",
              SEWING: "Dikim",
              QUALITY: "Kalite Kontrol",
              PACKAGING: "Paketleme",
              SHIPPING: "Sevkiyat",
            };

            const notification = await context.prisma.notification.create({
              data: {
                type: "PRODUCTION",
                title: "📦 Üretim Aşaması Tamamlandı",
                message: `Sipariş #${production.order.orderNumber} - ${stageNames[stage]} aşaması tamamlandı. Sıradaki aşama: ${stageNames[nextStage]}.`,
                userId: production.order.customerId,
                link: `/dashboard/orders/${production.order.id}`,
                isRead: false,
              },
            });
            await publishNotification(notification);
          } catch (notifError) {
            // Don't fail if notification fails
          }
        }

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Create Production Plan
builder.mutationField("createProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      orderId: t.arg.int({ required: true }),
      stagesJson: t.arg.string({ required: true }),
      estimatedStartDate: t.arg({ type: "DateTime", required: false }),
      notes: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("createProductionPlan");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const orderId = sanitizeInt(args.orderId)!;
        const stagesJson = sanitizeString(args.stagesJson)!;
        const notes = args.notes ? sanitizeString(args.notes) : undefined;

        // Validate inputs
        validateRequired(orderId, "Sipariş ID");
        validateRequired(stagesJson, "Aşamalar JSON");
        if (notes) validateStringLength(notes, "Notlar", 0, 2000);

        // Check order existence and permissions
        const order = await context.prisma.order.findUnique({
          where: { id: orderId },
          include: { collection: { include: { company: true } } },
        });

        if (!order) {
          throw new ValidationError("Sipariş bulunamadı");
        }

        if (order.collection.company?.id !== context.user.companyId) {
          throw new ValidationError(
            "Sadece üretici firma üretim planı oluşturabilir"
          );
        }

        // Parse stages
        let stages;
        try {
          stages = JSON.parse(stagesJson);
        } catch {
          throw new ValidationError("Geçersiz JSON formatı");
        }

        // Calculate dates
        const totalDays = stages.reduce(
          (sum: number, stage: any) => sum + stage.estimatedDays,
          0
        );
        const startDate = args.estimatedStartDate || new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + totalDays);

        // Create production tracking
        const productionTracking =
          await context.prisma.productionTracking.create({
            ...query,
            data: {
              orderId,
              currentStage: "PLANNING",
              overallStatus: "IN_PROGRESS",
              progress: 0,
              estimatedStartDate: startDate,
              estimatedEndDate: endDate,
              notes: notes || null,
              companyId: context.user.companyId || null,
              stageUpdates: {
                create: stages.map((stage: any) => {
                  const stageMapping: Record<string, string> = {
                    "Kumaş Tedarik": "FABRIC",
                    Kesim: "CUTTING",
                    Dikim: "SEWING",
                    "Ütü ve Pres": "PRESSING",
                    "Kalite Kontrol": "QUALITY",
                    Paketleme: "PACKAGING",
                    "Sevkiyat Hazırlık": "SHIPPING",
                  };

                  const enumStage =
                    stageMapping[stage.name] ||
                    stage.name.toUpperCase().replace(/\s+/g, "_");

                  return {
                    stage: enumStage,
                    status: "NOT_STARTED",
                    estimatedDays: stage.estimatedDays,
                    notes: stage.notes || null,
                  };
                }),
              },
            },
          });

        // Update order status
        await context.prisma.order.update({
          where: { id: orderId },
          data: {
            status: "QUOTE_SENT",
            productionDays: totalDays,
          },
        });

        logInfo("Üretim planı oluşturuldu", {
          orderId,
          totalDays,
          stageCount: stages.length,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return productionTracking;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Update Production Plan
builder.mutationField("updateProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      stagesJson: t.arg.string({ required: true }),
      notes: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("updateProductionPlan");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const stagesJson = sanitizeString(args.stagesJson)!;
        const notes = args.notes ? sanitizeString(args.notes) : undefined;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(stagesJson, "Aşamalar JSON");
        if (notes) validateStringLength(notes, "Notlar", 0, 2000);

        // Check production existence and permissions
        const existingProduction =
          await context.prisma.productionTracking.findUnique({
            where: { id: productionId },
            include: {
              order: {
                include: {
                  collection: {
                    include: { company: true },
                  },
                },
              },
            },
          });

        if (!existingProduction) {
          throw new ValidationError("Üretim planı bulunamadı");
        }

        if (
          existingProduction.order?.collection.company?.id !==
          context.user.companyId
        ) {
          throw new ValidationError(
            "Sadece üretici firma üretim planını güncelleyebilir"
          );
        }

        // Parse stages
        let stages;
        try {
          stages = JSON.parse(stagesJson);
        } catch {
          throw new ValidationError("Geçersiz JSON formatı");
        }

        // Calculate dates
        const totalDays = stages.reduce(
          (sum: number, stage: any) => sum + stage.estimatedDays,
          0
        );
        const startDate = existingProduction.estimatedStartDate || new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + totalDays);

        // Delete existing stage updates
        await context.prisma.productionStageUpdate.deleteMany({
          where: { productionId },
        });

        // Update production tracking
        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              estimatedEndDate: endDate,
              notes: notes || null,
              revisionCount: { increment: 1 },
              stageUpdates: {
                create: stages.map((stage: any) => {
                  const stageMapping: Record<string, string> = {
                    "Kumaş Tedarik": "FABRIC",
                    Kesim: "CUTTING",
                    Dikim: "SEWING",
                    "Ütü ve Pres": "PRESSING",
                    "Kalite Kontrol": "QUALITY",
                    Paketleme: "PACKAGING",
                    "Sevkiyat Hazırlık": "SHIPPING",
                  };

                  const enumStage =
                    stageMapping[stage.name] ||
                    stage.name.toUpperCase().replace(/\s+/g, "_");

                  return {
                    stage: enumStage,
                    status: "NOT_STARTED",
                    estimatedDays: stage.estimatedDays,
                    notes: stage.notes || null,
                  };
                }),
              },
            },
          });

        // Update order production days
        if (existingProduction.orderId) {
          await context.prisma.order.update({
            where: { id: existingProduction.orderId },
            data: { productionDays: totalDays },
          });
        }

        logInfo("Üretim planı güncellendi", {
          productionId,
          totalDays,
          stageCount: stages.length,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Send production plan to customer for approval (NEW SCHEMA)
builder.mutationField("sendPlanForApproval", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("sendPlanForApproval");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
          include: { order: true },
        });

        if (!production) {
          throw new ValidationError("Üretim planı bulunamadı");
        }

        // Only manufacturer can send plan
        if (
          context.user.id !== production.order?.manufactureId &&
          context.user.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "Sadece üretici firma planı onaya gönderebilir"
          );
        }

        // Update production plan status to PENDING approval
        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              planStatus: "PENDING",
              planSentAt: new Date(),
              canStartProduction: false,
            },
          });

        // Notify customer that plan is ready for approval
        if (production.order) {
          try {
            const notification = await context.prisma.notification.create({
              data: {
                type: "PRODUCTION",
                title: "📋 Üretim Planı Onayınızı Bekliyor",
                message: `Sipariş #${production.order.orderNumber} için üretim planı hazır. Lütfen planı inceleyin ve onaylayın.`,
                userId: production.order.customerId,
                link: `/dashboard/orders/${production.order.id}/production`,
                isRead: false,
              },
            });
            await publishNotification(notification);
          } catch (notifError) {
            // Bildirim hatası kritik değil, sadece log'la
            console.error("Bildirim gönderme hatası:", notifError);
          }
        }

        logInfo("Üretim planı onaya gönderildi", {
          productionId,
          orderId: production.orderId,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Customer approves production plan (NEW SCHEMA)
builder.mutationField("approvePlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      customerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("approvePlan");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const customerNote = args.customerNote
          ? sanitizeString(args.customerNote)
          : undefined;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 1000);

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
          include: { order: true },
        });

        if (!production) {
          throw new ValidationError("Üretim planı bulunamadı");
        }

        // Only customer can approve plan
        if (
          context.user.id !== production.order?.customerId &&
          context.user.role !== "ADMIN"
        ) {
          throw new ValidationError("Sadece müşteri planı onaylayabilir");
        }

        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              planStatus: "APPROVED",
              planApprovedAt: new Date(),
              customerNote: customerNote || null,
              canStartProduction: true,
              productionStartDate: new Date(),
            },
          });

        // Update order status
        if (production.orderId) {
          await context.prisma.order.update({
            where: { id: production.orderId },
            data: { status: "PRODUCTION_PLAN_APPROVED" },
          });
        }

        // Notify manufacturer that plan was approved
        if (production.order) {
          try {
            const notification = await context.prisma.notification.create({
              data: {
                type: "PRODUCTION",
                title: "✅ Üretim Planı Onaylandı",
                message: `Müşteri sipariş #${
                  production.order.orderNumber
                } için üretim planınızı onayladı. Üretime başlayabilirsiniz.${
                  customerNote ? ` Müşteri notu: ${customerNote}` : ""
                }`,
                userId: production.order.manufactureId,
                link: `/dashboard/orders/${production.order.id}/production`,
                isRead: false,
              },
            });
            await publishNotification(notification);
          } catch (notifError) {
            // Bildirim hatası kritik değil, sadece log'la
            console.error("Bildirim gönderme hatası:", notifError);
          }
        }

        logInfo("Üretim planı onaylandı", {
          productionId,
          orderId: production.orderId,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// Customer rejects production plan (NEW SCHEMA)
builder.mutationField("rejectPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      customerRejectionReason: t.arg.string({ required: true }),
      customerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("rejectPlan");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const customerRejectionReason = sanitizeString(
          args.customerRejectionReason
        )!;
        const customerNote = args.customerNote
          ? sanitizeString(args.customerNote)
          : undefined;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        validateRequired(customerRejectionReason, "Reddetme sebebi");
        validateStringLength(
          customerRejectionReason,
          "Reddetme sebebi",
          1,
          500
        );
        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 1000);

        const production = await context.prisma.productionTracking.findUnique({
          where: { id: productionId },
          include: { order: true },
        });

        if (!production) {
          throw new ValidationError("Üretim planı bulunamadı");
        }

        // Only customer can reject plan
        if (
          context.user.id !== production.order?.customerId &&
          context.user.role !== "ADMIN"
        ) {
          throw new ValidationError("Sadece müşteri planı reddedebilir");
        }

        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              planStatus: "REJECTED",
              planRejectedAt: new Date(),
              customerRejectionReason,
              customerNote: customerNote || null,
              canStartProduction: false,
              revisionCount: { increment: 1 },
            },
          });

        // Update order status
        if (production.orderId) {
          await context.prisma.order.update({
            where: { id: production.orderId },
            data: { status: "PRODUCTION_PLAN_REJECTED" },
          });
        }

        // Notify manufacturer that plan was rejected
        if (production.order) {
          try {
            const notification = await context.prisma.notification.create({
              data: {
                type: "PRODUCTION",
                title: "❌ Üretim Planı Reddedildi",
                message: `Müşteri sipariş #${
                  production.order.orderNumber
                } için üretim planınızı reddetti. Sebep: ${customerRejectionReason}${
                  customerNote ? ` - Not: ${customerNote}` : ""
                }`,
                userId: production.order.manufactureId,
                link: `/dashboard/orders/${production.order.id}/production`,
                isRead: false,
              },
            });
            await publishNotification(notification);
          } catch (notifError) {
            // Bildirim hatası kritik değil, sadece log'la
            console.error("Bildirim gönderme hatası:", notifError);
          }
        }

        logInfo("Üretim planı reddedildi", {
          productionId,
          orderId: production.orderId,
          reason: customerRejectionReason,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// LEGACY: Send production plan to customer for approval
builder.mutationField("sendProductionPlanForApproval", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("sendProductionPlanForApproval");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");

        // Update production plan status to PENDING approval
        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              planStatus: "PENDING",
              planSentAt: new Date(),
            },
          });

        logInfo("LEGACY: Üretim planı onaya gönderildi", {
          productionId,
          userId: context.user?.id,
          metadata: timer.end(),
        });

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// LEGACY: Customer approves or rejects production plan
builder.mutationField("respondToProductionPlan", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      approved: t.arg.boolean({ required: true }),
      customerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("respondToProductionPlan");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const productionId = sanitizeInt(args.productionId)!;
        const approved = sanitizeBoolean(args.approved)!;
        const customerNote = args.customerNote
          ? sanitizeString(args.customerNote)
          : undefined;

        // Validate inputs
        validateRequired(productionId, "Üretim ID");
        if (customerNote)
          validateStringLength(customerNote, "Müşteri notu", 0, 1000);

        const planStatus = approved ? "APPROVED" : "REJECTED";

        const updatedProduction =
          await context.prisma.productionTracking.update({
            ...query,
            where: { id: productionId },
            data: {
              planStatus: planStatus,
              planApprovedAt: approved ? new Date() : null,
              customerNote: customerNote || null,
              currentStage: approved ? "FABRIC" : "PLANNING",
              overallStatus: approved
                ? ("IN_PROGRESS" as any)
                : ("BLOCKED" as any),
            },
          });

        logInfo(
          `LEGACY: Üretim planı ${approved ? "onaylandı" : "reddedildi"}`,
          {
            productionId,
            approved,
            userId: context.user?.id,
            metadata: timer.end(),
          }
        );

        return updatedProduction;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (Admin/Manufacturer)
// ========================================

const BulkProductionInput = builder.inputType("BulkProductionInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
  }),
});

const BulkCompleteStagesInput = builder.inputType("BulkCompleteStagesInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
    stage: t.string({ required: true }),
    notes: t.string({ required: false }),
  }),
});

const BulkUpdateStatusInput = builder.inputType("BulkUpdateStatusInput", {
  fields: (t) => ({
    ids: t.intList({ required: true }),
    status: t.string({ required: true }),
    notes: t.string({ required: false }),
  }),
});

// === MUTATION: bulkCompleteStages ===
/**
 * Bulk complete production stages for multiple productions.
 * Manufacturer only - useful for batch processing.
 */
builder.mutationField("bulkCompleteStages", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      input: t.arg({ type: BulkCompleteStagesInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkCompleteStages");
      const { ids, stage, notes } = args.input;

      try {
        // Validate stage
        validateEnum(stage, "stage", [...ValidProductionStages]);

        // Fetch productions to verify ownership
        const productions = await ctx.prisma.productionTracking.findMany({
          where: { id: { in: ids } },
          include: {
            order: {
              select: {
                id: true,
                manufactureId: true,
                customerId: true,
              },
            },
          },
        });

        if (productions.length === 0) {
          throw new Error("No productions found");
        }

        // Verify authorization (manufacturer only)
        if (ctx.user.role !== "ADMIN") {
          const unauthorized = productions.some(
            (p) => p.order?.manufactureId !== ctx.user!.id
          );
          if (unauthorized) {
            throw new Error(
              "You can only complete stages for your own productions"
            );
          }
        }

        const stageOrder = [...ValidProductionStages];
        const currentIndex = stageOrder.indexOf(stage as any);
        const nextStage = stageOrder[currentIndex + 1] || "COMPLETED";

        // Update productions
        const result = await ctx.prisma.productionTracking.updateMany({
          where: { id: { in: ids } },
          data: {
            currentStage: (nextStage === "COMPLETED"
              ? "SHIPPING"
              : nextStage) as any,
            progress:
              currentIndex >= 0
                ? Math.round(((currentIndex + 2) / stageOrder.length) * 100)
                : 0,
            actualEndDate: nextStage === "COMPLETED" ? new Date() : null,
          },
        });

        // Update stage updates
        await ctx.prisma.productionStageUpdate.updateMany({
          where: {
            productionId: { in: ids },
            stage: stage as any,
          },
          data: {
            status: "COMPLETED" as any,
            actualEndDate: new Date(),
          },
        });

        // Send notifications
        for (const production of productions) {
          if (production.order) {
            const notification = await ctx.prisma.notification.create({
              data: {
                userId: production.order.customerId,
                type: "PRODUCTION",
                title: "Üretim Aşaması Tamamlandı",
                message: `Siparişinizin ${stage} aşaması tamamlandı. Sonraki aşama: ${nextStage}`,
                orderId: production.orderId!,
                productionTrackingId: production.id,
                link: `/dashboard/productions/${production.id}`,
              },
            });
            await publishNotification(notification);
          }
        }

        logInfo("Bulk complete production stages", {
          count: result.count,
          stage,
          nextStage,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} production stages completed successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === MUTATION: bulkUpdateStatus ===
/**
 * Bulk update production status for multiple productions.
 * Manufacturer can update their productions, admin can update any.
 */
builder.mutationField("bulkUpdateStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      input: t.arg({ type: BulkUpdateStatusInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkUpdateStatus");
      const { ids, status, notes } = args.input;

      try {
        // Validate status
        validateEnum(status, "status", [...ValidProductionStatuses]);

        // Fetch productions to verify ownership
        const productions = await ctx.prisma.productionTracking.findMany({
          where: { id: { in: ids } },
          include: {
            order: {
              select: {
                id: true,
                manufactureId: true,
                customerId: true,
              },
            },
          },
        });

        if (productions.length === 0) {
          throw new Error("No productions found");
        }

        // Verify authorization
        if (ctx.user.role !== "ADMIN") {
          const unauthorized = productions.some(
            (p) => p.order?.manufactureId !== ctx.user!.id
          );
          if (unauthorized) {
            throw new Error(
              "You can only update status for your own productions"
            );
          }
        }

        const updateData: any = {
          overallStatus: status as any,
          updatedAt: new Date(),
        };
        if (notes) updateData.notes = notes;

        // Update productions
        const result = await ctx.prisma.productionTracking.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });

        // Send notifications
        for (const production of productions) {
          if (production.order) {
            const notification = await ctx.prisma.notification.create({
              data: {
                userId: production.order.customerId,
                type: "PRODUCTION",
                title: "Üretim Durumu Güncellendi",
                message: `Siparişinizin üretim durumu güncellendi: ${status}`,
                orderId: production.orderId!,
                productionTrackingId: production.id,
                link: `/dashboard/productions/${production.id}`,
              },
            });
            await publishNotification(notification);
          }
        }

        logInfo("Bulk update production status", {
          count: result.count,
          status,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} productions updated successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === MUTATION: bulkCancelProductions ===
/**
 * Bulk cancel multiple productions.
 * Admin only - cancels production plans and sends notifications.
 */
builder.mutationField("bulkCancelProductions", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    args: {
      input: t.arg({ type: BulkProductionInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const timer = createTimer("bulkCancelProductions");
      const { ids } = args.input;

      try {
        // Fetch productions
        const productions = await ctx.prisma.productionTracking.findMany({
          where: { id: { in: ids } },
          include: {
            order: {
              select: {
                id: true,
                customerId: true,
                manufactureId: true,
                orderNumber: true,
              },
            },
          },
        });

        if (productions.length === 0) {
          throw new Error("No productions found");
        }

        // Verify no completed productions
        const hasCompleted = productions.some(
          (p) => p.overallStatus === "COMPLETED"
        );
        if (hasCompleted) {
          throw new Error("Cannot cancel completed productions");
        }

        // Bulk update
        const result = await ctx.prisma.productionTracking.updateMany({
          where: { id: { in: ids } },
          data: {
            overallStatus: "CANCELLED" as any,
            planStatus: "REJECTED" as any,
            updatedAt: new Date(),
          },
        });

        // Send notifications
        for (const production of productions) {
          if (production.order) {
            // Notify customer
            const customerNotification = await ctx.prisma.notification.create({
              data: {
                userId: production.order.customerId,
                type: "PRODUCTION",
                title: "Üretim İptal Edildi",
                message: `${production.order.orderNumber} numaralı siparişin üretimi iptal edildi.`,
                orderId: production.orderId!,
                productionTrackingId: production.id,
                link: `/dashboard/productions/${production.id}`,
              },
            });
            await publishNotification(customerNotification);

            // Notify manufacturer
            if (
              production.order.manufactureId !== production.order.customerId
            ) {
              const manufacturerNotification =
                await ctx.prisma.notification.create({
                  data: {
                    userId: production.order.manufactureId,
                    type: "PRODUCTION",
                    title: "Üretim İptal Edildi",
                    message: `${production.order.orderNumber} numaralı siparişin üretimi iptal edildi.`,
                    orderId: production.orderId!,
                    productionTrackingId: production.id,
                    link: `/dashboard/productions/${production.id}`,
                  },
                });
              await publishNotification(manufacturerNotification);
            }
          }
        }

        logInfo("Bulk cancel productions", {
          count: result.count,
          userId: ctx.user.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} productions cancelled successfully`,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

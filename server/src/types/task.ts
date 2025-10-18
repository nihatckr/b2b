import { enumType, objectType } from "nexus";

// Enums
export const TaskStatus = enumType({
  name: "TaskStatus",
  members: {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  },
});

export const TaskPriority = enumType({
  name: "TaskPriority",
  members: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
  },
});

export const TaskType = enumType({
  name: "TaskType",
  members: {
    // === STATUS BAZLI GÖREVLER (Dinamik) ===
    STATUS_CHANGE: "STATUS_CHANGE", // Status değişikliği gerektiren görev

    // === ÖZEL GÖREV TİPLERİ ===
    QUOTATION: "QUOTATION", // Fiyat teklifi hazırla/gönder
    REVIEW_QUOTE: "REVIEW_QUOTE", // Teklifi incele (müşteri veya üretici)
    APPROVE_REJECT: "APPROVE_REJECT", // Onay/Red aksiyonu gerekli
    PAYMENT: "PAYMENT", // Ödeme işlemi
    DOCUMENT: "DOCUMENT", // Belge/Doküman işlemi

    // === ÜRETİM SÜRECİ GÖREVLER ===
    PRODUCTION_STAGE: "PRODUCTION_STAGE", // Üretim aşama görevleri
    QUALITY_CHECK: "QUALITY_CHECK", // Kalite kontrol görevi
    SHIPMENT: "SHIPMENT", // Kargo/Sevkiyat işlemi
    MATERIAL: "MATERIAL", // Malzeme tedarik/kontrol

    // === GENEL GÖREVLER ===
    MEETING: "MEETING", // Toplantı
    REVISION: "REVISION", // Revize talebi
    NOTIFICATION: "NOTIFICATION", // Bilgilendirme (aksiyon gerektirmeyen)
    DEADLINE_WARNING: "DEADLINE_WARNING", // Termin uyarısı
    OTHER: "OTHER", // Diğer
  },
});

// Task Type
export const Task = objectType({
  name: "Task",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("title");
    t.string("description");
    t.nonNull.field("status", { type: TaskStatus });
    t.nonNull.field("priority", { type: TaskPriority });
    t.nonNull.field("type", { type: TaskType });

    // Status İlişkisi
    t.string("relatedStatus"); // Hangi status için bu task oluşturuldu
    t.string("targetStatus"); // Hedef status
    t.string("entityType"); // "ORDER", "SAMPLE", "PRODUCTION"

    // Üretim Aşaması İlişkisi
    t.string("productionStage"); // "PLANNING", "FABRIC", "CUTTING", vb.

    // User Relations
    t.nonNull.field("user", {
      type: "User",
      resolve: (parent: any, _args, ctx) =>
        ctx.prisma.user.findUnique({
          where: { id: parent.userId },
        }),
    });

    t.field("assignedTo", {
      type: "User",
      resolve: (parent: any, _args, ctx) =>
        parent.assignedToId
          ? ctx.prisma.user.findUnique({
              where: { id: parent.assignedToId },
            })
          : null,
    });

    // Relations
    t.field("collection", {
      type: "Collection",
      resolve: (parent: any, _args, ctx) =>
        parent.collectionId
          ? ctx.prisma.collection.findUnique({
              where: { id: parent.collectionId },
            })
          : null,
    });

    t.field("sample", {
      type: "Sample",
      resolve: (parent: any, _args, ctx) =>
        parent.sampleId
          ? ctx.prisma.sample.findUnique({
              where: { id: parent.sampleId },
            })
          : null,
    });

    t.field("order", {
      type: "Order",
      resolve: (parent: any, _args, ctx) =>
        parent.orderId
          ? ctx.prisma.order.findUnique({
              where: { id: parent.orderId },
            })
          : null,
    });

    t.field("productionTracking", {
      type: "ProductionTracking",
      resolve: (parent: any, _args, ctx) =>
        parent.productionTrackingId
          ? ctx.prisma.productionTracking.findUnique({
              where: { id: parent.productionTrackingId },
            })
          : null,
    });

    // Dates
    t.field("dueDate", { type: "DateTime" });
    t.field("completedAt", { type: "DateTime" });
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    // Metadata
    t.string("notes");
    t.field("actionData", { type: "JSON" }); // Aksiyon metadata
  },
});

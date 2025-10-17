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
    // Müşteri taskleri
    SAMPLE_REQUEST: "SAMPLE_REQUEST",
    PURCHASE_ORDER: "PURCHASE_ORDER",
    APPROVE_SAMPLE: "APPROVE_SAMPLE",
    PAYMENT_PENDING: "PAYMENT_PENDING",
    DOCUMENT_SUBMIT: "DOCUMENT_SUBMIT",
    REVIEW_PRODUCTION: "REVIEW_PRODUCTION",
    // Üretici taskleri
    SAMPLE_PRODUCTION: "SAMPLE_PRODUCTION",
    SAMPLE_RESPONSE: "SAMPLE_RESPONSE",
    QUOTATION: "QUOTATION",
    PRODUCTION_START: "PRODUCTION_START",
    PRODUCTION_QUALITY_CHECK: "PRODUCTION_QUALITY_CHECK",
    PRODUCTION_SHIPMENT: "PRODUCTION_SHIPMENT",
    MATERIAL_PROCUREMENT: "MATERIAL_PROCUREMENT",
    REVISION_REQUEST: "REVISION_REQUEST",
    // Genel
    MEETING: "MEETING",
    DOCUMENT_REVIEW: "DOCUMENT_REVIEW",
    OTHER: "OTHER",
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
  },
});

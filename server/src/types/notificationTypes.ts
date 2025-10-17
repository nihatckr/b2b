import { enumType, objectType } from "nexus";

// Notification Type Enum
export const NotificationTypeEnum = enumType({
  name: "NotificationType",
  members: ["ORDER", "SAMPLE", "MESSAGE", "PRODUCTION", "QUALITY", "SYSTEM"],
  description: "Type of notification",
});

// Notification Object Type
export const Notification = objectType({
  name: "Notification",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("type", { type: "NotificationType" });
    t.nonNull.string("title");
    t.nonNull.string("message");
    t.string("link");
    t.nonNull.boolean("isRead");
    t.nonNull.int("userId");
    t.int("orderId");
    t.int("sampleId");
    t.int("productionTrackingId");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    // Relations
    t.field("user", {
      type: "User",
      resolve: (parent, _args, context) => {
        return context.prisma.notification
          .findUnique({ where: { id: parent.id } })
          .user();
      },
    });

    t.field("order", {
      type: "Order",
      resolve: (parent, _args, context) => {
        if (!parent.orderId) return null;
        return context.prisma.notification
          .findUnique({ where: { id: parent.id } })
          .order();
      },
    });

    t.field("sample", {
      type: "Sample",
      resolve: (parent, _args, context) => {
        if (!parent.sampleId) return null;
        return context.prisma.notification
          .findUnique({ where: { id: parent.id } })
          .sample();
      },
    });

    t.field("productionTracking", {
      type: "ProductionTracking",
      resolve: (parent, _args, context) => {
        if (!parent.productionTrackingId) return null;
        return context.prisma.notification
          .findUnique({ where: { id: parent.id } })
          .productionTracking();
      },
    });
  },
});

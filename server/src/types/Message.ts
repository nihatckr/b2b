import { inputObjectType, objectType } from "nexus";

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("content");
    t.nonNull.int("senderId");
    t.int("receiverId"); // Alıcı kullanıcı ID
    t.nonNull.boolean("isRead");
    t.nonNull.string("type"); // "order", "sample", "general"
    t.int("orderId"); // Sipariş ID
    t.int("sampleId"); // Numune ID
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Relations
    t.field("sender", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.senderId },
        });
      },
    });

    t.field("receiver", {
      type: "User",
      resolve: async (parent, _args, context) => {
        if (!parent.receiverId) return null;
        return context.prisma.user.findUnique({
          where: { id: parent.receiverId },
        });
      },
    });

    t.field("order", {
      type: "Order",
      resolve: async (parent, _args, context) => {
        if (!parent.orderId) return null;
        return context.prisma.order.findUnique({
          where: { id: parent.orderId },
        });
      },
    });

    t.field("sample", {
      type: "Sample",
      resolve: async (parent, _args, context) => {
        if (!parent.sampleId) return null;
        return context.prisma.sample.findUnique({
          where: { id: parent.sampleId },
        });
      },
    });

    t.field("company", {
      type: "Company",
      resolve: async (parent, _args, context) => {
        if (!parent.companyId) return null;
        return context.prisma.company.findUnique({
          where: { id: parent.companyId },
        });
      },
    });
  },
});

export const CreateMessageInput = inputObjectType({
  name: "CreateMessageInput",
  definition(t) {
    t.nonNull.string("content");
    t.int("receiverId"); // Alıcı kullanıcı ID
    t.string("type"); // "order", "sample", "general"
    t.int("orderId"); // Sipariş ID (ürün bazlı mesaj için)
    t.int("sampleId"); // Numune ID (ürün bazlı mesaj için)
    t.int("companyId"); // Şirket ID
  },
});

export const MessageFilterInput = inputObjectType({
  name: "MessageFilterInput",
  definition(t) {
    t.boolean("unreadOnly");
    t.string("type");
    t.int("orderId"); // Belirli bir siparişin mesajlarını filtrele
    t.int("sampleId"); // Belirli bir numunenin mesajlarını filtrele
    t.int("companyId");
  },
});

import { inputObjectType, objectType } from "nexus";

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("content");
    t.nonNull.int("senderId");
    t.string("receiver");
    t.nonNull.boolean("isRead");
    t.nonNull.string("type");
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
    t.string("receiver"); // User ID or "all" for company-wide
    t.string("type"); // "direct", "company", "system"
    t.int("companyId"); // Target company for cross-company messages
  },
});

export const MessageFilterInput = inputObjectType({
  name: "MessageFilterInput",
  definition(t) {
    t.boolean("unreadOnly");
    t.string("type");
    t.int("companyId");
  },
});

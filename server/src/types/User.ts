import { objectType } from "nexus";
import { Context } from "../context";

export const User = objectType({
  name: "User",
  definition(t) {
    // Basic fields from Prisma schema
    t.nonNull.int("id");
    t.nonNull.string("email");
    t.nonNull.field("role", { type: "Role" });
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.nonNull.boolean("isActive");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Company relation - will be added later when Company type is ready
    // t.field("company", {
    //   type: "Company",
    //   resolve: async (parent, _args, context: Context) => {
    //     if (!parent.companyId) return null;
    //     return context.prisma.company.findUnique({
    //       where: { id: parent.companyId },
    //     });
    //   },
    // });

    // t.int("companyId"); // Uncomment when Company type is available    // Customer relations
    t.list.field("customerSamples", {
      type: "Sample",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.sample.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerOrders", {
      type: "Order",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.order.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerQuestions", {
      type: "Question",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.question.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerReviews", {
      type: "Review",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.review.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Manufacture relations
    t.list.field("manufactureSamples", {
      type: "Sample",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.sample.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("manufactureOrders", {
      type: "Order",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.order.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("manufactureQuestions", {
      type: "Question",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.question.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Categories and Collections (for MANUFACTURE role)
    t.list.field("categories", {
      type: "Category",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.category.findMany({
          where: { authorId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("collections", {
      type: "Collection",
      resolve: (parent, _args, context: Context) => {
        return context.prisma.collection.findMany({
          where: { authorId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Messages - will be added later when Message type is ready
    // t.list.field("sentMessages", {
    //   type: "Message",
    //   resolve: (parent, _args, context: Context) => {
    //     return context.prisma.message.findMany({
    //       where: { senderId: parent.id },
    //       orderBy: { createdAt: "desc" },
    //     });
    //   },
    // });
  },
});

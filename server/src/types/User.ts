import { objectType } from "nexus";

import { Context } from '../context';
import { canAccessUserData } from '../utils/user-role-helper';


export const User = objectType({
  name: "User",
  definition(t) {
    // Basic fields from Prisma schema - matching exactly
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

    // Company relation
    t.field("company", {
      type: "Company",
      resolve: async (parent, _args, context: Context) => {
        if (!parent.companyId) return null;
        return context.prisma.company.findUnique({
          where: { id: parent.companyId },
        });
      },
    });

    t.int("companyId");

    // Sent messages relation
    t.list.field("sentMessages", {
      type: "Message",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.message.findMany({
          where: { senderId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Customer relations - role-based access control
    t.list.field("customerSamples", {
      type: "Sample",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.sample.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerOrders", {
      type: "Order",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.order.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerQuestions", {
      type: "Question",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.question.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("customerReviews", {
      type: "Review",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.review.findMany({
          where: { customerId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Manufacture relations - role-based access control
    t.list.field("manufactureSamples", {
      type: "Sample",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.sample.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("manufactureOrders", {
      type: "Order",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.order.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("manufactureQuestions", {
      type: "Question",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.question.findMany({
          where: { manufactureId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Categories and Collections (for MANUFACTURE role only)
    t.list.field("categories", {
      type: "Category",
      resolve: async (parent, _args, context: Context) => {
        const hasAccess = await canAccessUserData(parent, context);
        if (!hasAccess || !["MANUFACTURE", "ADMIN"].includes(parent.role)) return [];

        return context.prisma.category.findMany({
          where: { authorId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("collections", {
      type: "Collection",
      resolve: async (parent, _args, context: Context) => {
        const hasAccess = await canAccessUserData(parent, context);
        if (!hasAccess || !["MANUFACTURE", "ADMIN"].includes(parent.role)) return [];

        return context.prisma.collection.findMany({
          where: { authorId: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    // Production tracking relations - for tracking updates
    t.list.field("sampleProductionUpdates", {
      type: "SampleProduction",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.sampleProduction.findMany({
          where: { updatedById: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });

    t.list.field("orderProductionUpdates", {
      type: "OrderProduction",
      resolve: async (parent, _args, context: Context) => {
        if (!(await canAccessUserData(parent, context))) return [];
        return context.prisma.orderProduction.findMany({
          where: { updatedById: parent.id },
          orderBy: { createdAt: "desc" },
        });
      },
    });
  },
});

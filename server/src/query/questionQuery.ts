import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const questionQueries = (t: any) => {
  // Get Collection Questions
  t.list.field("collectionQuestions", {
    type: "Question",
    args: {
      collectionId: "Int",
      includePrivate: "Boolean",
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const where: any = {
        collectionId: args.collectionId,
      };

      // Public questions for everyone
      // Private questions only for customer who asked, manufacturer, or admin
      if (!args.includePrivate || userRole === "CUSTOMER") {
        where.OR = [
          { isPublic: true },
          { customerId: userId }, // Own questions
        ];
      }

      const questions = await context.prisma.question.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return questions;
    },
  });

  // Get My Questions
  t.list.field("myQuestions", {
    type: "Question",
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const where: any = {};

      if (userRole === "CUSTOMER") {
        where.customerId = userId;
      } else if (userRole === "MANUFACTURE") {
        where.manufactureId = userId;
      } else if (userRole !== "ADMIN") {
        return []; // No questions for other roles
      }

      const questions = await context.prisma.question.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return questions;
    },
  });

  // Get Unanswered Questions (for manufacturers)
  t.list.field("unansweredQuestions", {
    type: "Question",
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Only manufacturers and admins can see unanswered questions
      if (userRole !== "MANUFACTURE" && userRole !== "ADMIN") {
        throw new Error("Only manufacturers can view unanswered questions");
      }

      const where: any = {
        isAnswered: false,
      };

      if (userRole === "MANUFACTURE") {
        where.manufactureId = userId;
      }

      const questions = await context.prisma.question.findMany({
        where,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return questions;
    },
  });
};

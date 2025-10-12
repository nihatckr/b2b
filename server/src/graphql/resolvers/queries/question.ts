import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const questionQueries = (t: any) => {
  t.list.field("questions", {
    type: "Question",
    args: {
      search: stringArg(),
      collectionId: intArg(),
      customerId: intArg(),
      manufactureId: intArg(),
      isAnswered: booleanArg(),
      isPublic: booleanArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      // Build where clause
      const where: any = {};

      if (args.search) {
        where.OR = [
          { question: { contains: args.search, mode: "insensitive" } },
          { answer: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.customerId) {
        where.customerId = args.customerId;
      }

      if (args.manufactureId) {
        where.manufactureId = args.manufactureId;
      }

      if (args.isAnswered !== undefined) {
        where.isAnswered = args.isAnswered;
      }

      if (args.isPublic !== undefined) {
        where.isPublic = args.isPublic;
      }

      // Non-admin users can only see public questions or their own questions
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      if (userId && currentUser?.role !== "ADMIN") {
        const accessFilter = {
          OR: [
            { isPublic: true },
            { customerId: userId },
            { manufactureId: userId },
          ],
        };

        if (where.OR) {
          where.AND = [{ OR: where.OR }, accessFilter];
          delete where.OR;
        } else {
          where.OR = accessFilter.OR;
        }
      }

      return context.prisma.question.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 50,
        skip: args.skip || 0,
      });
    },
  });

  t.field("question", {
    type: "Question",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!question) {
        throw new Error("Question not found.");
      }

      // Check access permissions
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      // Admin can see all, users can see public questions or their own questions
      if (
        userId &&
        currentUser?.role !== "ADMIN" &&
        !question.isPublic &&
        question.customerId !== userId &&
        question.manufactureId !== userId
      ) {
        throw new Error("Access denied.");
      }

      return question;
    },
  });

  t.list.field("myQuestions", {
    type: "Question",
    args: {
      collectionId: intArg(),
      isAnswered: booleanArg(),
      asCustomer: booleanArg(), // true: müşteri olarak sorduklarım, false: üretici olarak aldıklarım
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const where: any = {};

      // Kullanıcı müşteri veya üretici olarak questions'ları alabilir
      if (args.asCustomer !== undefined) {
        where[args.asCustomer ? "customerId" : "manufactureId"] = userId;
      } else {
        // Varsayılan: hem müşteri hem üretici olarak olan questions
        where.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.isAnswered !== undefined) {
        where.isAnswered = args.isAnswered;
      }

      return context.prisma.question.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 20,
        skip: args.skip || 0,
      });
    },
  });

  t.field("questionStats", {
    type: "QuestionStats",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // Build base filter for non-admin users
      let baseFilter: any = {};
      if (currentUser?.role !== "ADMIN") {
        baseFilter.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      const [
        totalQuestions,
        answeredQuestions,
        unansweredQuestions,
        publicQuestions,
        myAskedQuestions,
        myReceivedQuestions,
      ] = await Promise.all([
        context.prisma.question.count({ where: baseFilter }),
        context.prisma.question.count({
          where: { ...baseFilter, isAnswered: true },
        }),
        context.prisma.question.count({
          where: { ...baseFilter, isAnswered: false },
        }),
        context.prisma.question.count({
          where: { ...baseFilter, isPublic: true },
        }),
        context.prisma.question.count({ where: { customerId: userId } }),
        context.prisma.question.count({ where: { manufactureId: userId } }),
      ]);

      return {
        totalQuestions,
        answeredQuestions,
        unansweredQuestions,
        publicQuestions,
        myAskedQuestions,
        myReceivedQuestions,
      };
    },
  });
};

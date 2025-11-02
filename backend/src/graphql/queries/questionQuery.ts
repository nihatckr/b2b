/**
 * Question Queries - Q&A MANAGEMENT SYSTEM
 *
 * 🎯 Purpose: Customer questions and manufacturer answers
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - questions: Questions for a collection (public view)
 * - question: Single question by ID
 * - myQuestions: User's questions (customer perspective)
 * - questionsForManufacturer: Questions to answer (manufacturer perspective)
 *
 * ANALYTICS (User/Admin):
 * - questionStats: Question statistics (total, answered, pending)
 * - questionsByCollection: Distribution by collection
 * - questionsByStatus: Answered vs unanswered breakdown
 * - unansweredQuestions: Questions awaiting answers
 *
 * SEARCH & FILTER:
 * - searchQuestions: Search in questions and answers
 * - getQuestionsByDateRange: Questions within specific date range
 * - getQuestionsByUser: All questions from specific user
 *
 * 🔒 Security:
 * - Public queries show only public questions
 * - Users see their own questions (including private)
 * - Manufacturers see questions about their collections
 * - Admin sees all questions
 *
 * 💡 Features:
 * - Public/private questions
 * - Answered/unanswered filtering
 * - Real-time notifications
 * - Collection-based organization
 */

import { handleError, requireAuth } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import { validateDateRange, validateRequired } from "../../utils/validation";
import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const QuestionFilterInput = builder.inputType("QuestionFilterInput", {
  fields: (t) => ({
    collectionId: t.int(),
    customerId: t.int(),
    manufactureId: t.int(),
    isAnswered: t.boolean(),
    isPublic: t.boolean(),
    startDate: t.string(),
    endDate: t.string(),
  }),
});

const QuestionPaginationInput = builder.inputType("QuestionPaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

const QuestionSearchInput = builder.inputType("QuestionSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    isAnswered: t.boolean(),
    collectionId: t.int(),
    limit: t.int(),
  }),
});

const QuestionDateRangeInput = builder.inputType("QuestionDateRangeInput", {
  fields: (t) => ({
    startDate: t.string({ required: true }),
    endDate: t.string({ required: true }),
  }),
});

// ========================================
// STANDARD QUESTION QUERIES
// ========================================

// === QUERY: questions ===
/**
 * Get questions for a collection.
 * Public endpoint - shows only public questions.
 */
builder.queryField("questions", (t) =>
  t.prismaField({
    type: ["Question"],
    args: {
      collectionId: t.arg.int({ required: true }),
      filter: t.arg({ type: QuestionFilterInput, required: false }),
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("questions");
      try {
        // Sanitize inputs
        const collectionId = sanitizeInt(args.collectionId)!;
        validateRequired(collectionId, "Koleksiyon ID");

        const where: any = {
          collectionId,
          isPublic: true,
        };

        // Apply filters
        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }

        if (args.filter?.startDate || args.filter?.endDate) {
          where.createdAt = {};
          if (args.filter.startDate) {
            where.createdAt.gte = new Date(args.filter.startDate);
          }
          if (args.filter.endDate) {
            where.createdAt.lte = new Date(args.filter.endDate);
          }

          // Validate date range
          if (args.filter.startDate && args.filter.endDate) {
            validateDateRange(
              new Date(args.filter.startDate),
              new Date(args.filter.endDate),
              "Tarih aralığı"
            );
          }
        }

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await context.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        logInfo("Sorular listelendi", {
          collectionId,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: question ===
/**
 * Get single question by ID.
 * Returns null if not found or not accessible.
 */
builder.queryField("question", (t) =>
  t.prismaField({
    type: "Question",
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("question");
      try {
        // Sanitize input
        const id = sanitizeInt(args.id)!;
        validateRequired(id, "Soru ID");

        const question = await context.prisma.question.findUnique({
          ...query,
          where: { id },
        });

        if (!question) {
          logInfo("Soru bulunamadı", { questionId: id, metadata: timer.end() });
          return null;
        }

        // Check visibility
        if (!question.isPublic && !context.user) {
          logInfo("Private soru için kimlik doğrulama gerekli", {
            questionId: id,
            metadata: timer.end(),
          });
          return null; // Private questions require authentication
        }

        // Private questions visible only to customer, manufacturer, or admin
        if (!question.isPublic && context.user) {
          const canView =
            context.user.id === question.customerId ||
            context.user.id === question.manufactureId ||
            context.user.role === "ADMIN";

          if (!canView) {
            logInfo("Soru görüntüleme yetkisi yok", {
              questionId: id,
              userId: context.user.id,
              metadata: timer.end(),
            });
            return null;
          }
        }

        logInfo("Soru görüntülendi", { questionId: id, metadata: timer.end() });
        return question;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: myQuestions ===
/**
 * Get current user's questions (customer perspective).
 * Includes both public and private questions.
 */
builder.queryField("myQuestions", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("myQuestions");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {
          customerId: ctx.user!.id,
        };

        // Apply filters with sanitization
        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }
        if (args.filter?.collectionId) {
          const collectionId = sanitizeInt(args.filter.collectionId)!;
          where.collectionId = collectionId;
        }

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        logInfo("Kullanıcı soruları listelendi", {
          userId: ctx.user!.id,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: questionsForManufacturer ===
/**
 * Get questions for manufacturer to answer.
 * Shows questions about manufacturer's collections.
 */
builder.queryField("questionsForManufacturer", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("questionsForManufacturer");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {
          manufactureId: ctx.user!.id,
        };

        // Apply filters with sanitization
        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }
        if (args.filter?.collectionId) {
          const collectionId = sanitizeInt(args.filter.collectionId)!;
          where.collectionId = collectionId;
        }

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        logInfo("Üretici soruları listelendi", {
          manufactureId: ctx.user!.id,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================================
// === ANALYTICS QUERIES (Admin/User insights) ===
// ========================================================

// === QUERY: questionStats ===
/**
 * Returns comprehensive question statistics.
 * User sees their own stats, admin sees all.
 */
builder.queryField("questionStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("questionStats");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        // Apply filters with sanitization
        if (args.filter?.collectionId) {
          const collectionId = sanitizeInt(args.filter.collectionId)!;
          where.collectionId = collectionId;
        }
        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }
        if (args.filter?.startDate || args.filter?.endDate) {
          where.createdAt = {};
          if (args.filter.startDate) {
            where.createdAt.gte = new Date(args.filter.startDate);
          }
          if (args.filter.endDate) {
            where.createdAt.lte = new Date(args.filter.endDate);
          }

          // Validate date range
          if (args.filter.startDate && args.filter.endDate) {
            validateDateRange(
              new Date(args.filter.startDate),
              new Date(args.filter.endDate),
              "Tarih aralığı"
            );
          }
        }

        const [total, answered, unanswered, publicQuestions, privateQuestions] =
          await Promise.all([
            ctx.prisma.question.count({ where }),
            ctx.prisma.question.count({
              where: { ...where, isAnswered: true },
            }),
            ctx.prisma.question.count({
              where: { ...where, isAnswered: false },
            }),
            ctx.prisma.question.count({ where: { ...where, isPublic: true } }),
            ctx.prisma.question.count({ where: { ...where, isPublic: false } }),
          ]);

        const stats = {
          total,
          answered,
          unanswered,
          answerRate: total > 0 ? ((answered / total) * 100).toFixed(2) : "0",
          publicQuestions,
          privateQuestions,
        };

        logInfo("Soru istatistikleri alındı", {
          userId: ctx.user!.id,
          stats,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: questionsByCollection ===
/**
 * Returns question count grouped by collection.
 */
builder.queryField("questionsByCollection", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("questionsByCollection");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        if (
          args.filter?.isAnswered !== null &&
          args.filter?.isAnswered !== undefined
        ) {
          where.isAnswered = args.filter.isAnswered;
        }

        const result = await ctx.prisma.question.groupBy({
          by: ["collectionId"],
          where,
          _count: true,
        });

        const data = result.map((r) => ({
          collectionId: r.collectionId,
          count: r._count,
        }));

        logInfo("Koleksiyona göre soru dağılımı alındı", {
          userId: ctx.user!.id,
          collectionCount: data.length,
          metadata: timer.end(),
        });

        return data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: questionsByStatus ===
/**
 * Returns question count by answered status.
 */
builder.queryField("questionsByStatus", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    args: {
      filter: t.arg({ type: QuestionFilterInput, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("questionsByStatus");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
          ];
        }

        if (args.filter?.collectionId) {
          const collectionId = sanitizeInt(args.filter.collectionId)!;
          where.collectionId = collectionId;
        }

        const result = await ctx.prisma.question.groupBy({
          by: ["isAnswered"],
          where,
          _count: true,
        });

        const data = result.map((r) => ({
          status: r.isAnswered ? "answered" : "unanswered",
          count: r._count,
        }));

        logInfo("Duruma göre soru dağılımı alındı", {
          userId: ctx.user!.id,
          data,
          metadata: timer.end(),
        });

        return data;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: unansweredQuestions ===
/**
 * Returns questions awaiting answers.
 * Manufacturer sees their unanswered questions.
 */
builder.queryField("unansweredQuestions", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("unansweredQuestions");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {
          isAnswered: false,
        };

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.manufactureId = ctx.user!.id;
        }

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "asc" }, // Oldest first
          skip,
          take,
        });

        logInfo("Cevaplanmamış sorular listelendi", {
          userId: ctx.user!.id,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================================
// === SEARCH & FILTER QUERIES ===
// ========================================================

// === QUERY: searchQuestions ===
/**
 * Searches questions by question text or answer.
 */
builder.queryField("searchQuestions", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      search: t.arg({ type: QuestionSearchInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("searchQuestions");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Sanitize and search in question and answer
        const searchQuery = sanitizeString(args.search.query);
        if (searchQuery) {
          where.OR = [
            { question: { contains: searchQuery, mode: "insensitive" } },
            { answer: { contains: searchQuery, mode: "insensitive" } },
          ];
        }

        // Apply filters with sanitization
        if (
          args.search.isAnswered !== null &&
          args.search.isAnswered !== undefined
        ) {
          where.isAnswered = args.search.isAnswered;
        }
        if (args.search.collectionId) {
          const collectionId = sanitizeInt(args.search.collectionId)!;
          where.collectionId = collectionId;
        }

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.AND = {
            OR: [
              { customerId: ctx.user!.id },
              { manufactureId: ctx.user!.id },
              { isPublic: true },
            ],
          };
        }

        const limit = Math.min(sanitizeInt(args.search.limit) || 20, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
        });

        logInfo("Soru araması yapıldı", {
          userId: ctx.user!.id,
          query: searchQuery,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: getQuestionsByDateRange ===
/**
 * Returns questions within a specific date range.
 */
builder.queryField("getQuestionsByDateRange", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      dateRange: t.arg({ type: QuestionDateRangeInput, required: true }),
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("getQuestionsByDateRange");
      try {
        requireAuth(ctx.user?.id);

        const startDate = new Date(args.dateRange.startDate);
        const endDate = new Date(args.dateRange.endDate);

        // Validate date range
        validateDateRange(startDate, endDate, "Tarih aralığı");

        const where: any = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        };

        // Role-based filtering
        if (ctx.user!.role !== "ADMIN") {
          where.OR = [
            { customerId: ctx.user!.id },
            { manufactureId: ctx.user!.id },
            { isPublic: true },
          ];
        }

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        logInfo("Tarih aralığına göre sorular listelendi", {
          userId: ctx.user!.id,
          startDate: args.dateRange.startDate,
          endDate: args.dateRange.endDate,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// === QUERY: getQuestionsByUser ===
/**
 * Returns all questions from a specific user.
 * Admin only or user viewing their own questions.
 */
builder.queryField("getQuestionsByUser", (t) =>
  t.prismaField({
    type: ["Question"],
    authScopes: { user: true },
    args: {
      userId: t.arg.int({ required: true }),
      pagination: t.arg({ type: QuestionPaginationInput, required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("getQuestionsByUser");
      try {
        requireAuth(ctx.user?.id);

        const userId = sanitizeInt(args.userId)!;
        validateRequired(userId, "Kullanıcı ID");

        // Only admin or the user themselves can view
        if (ctx.user!.role !== "ADMIN" && ctx.user!.id !== userId) {
          throw new Error("Bu soruları görüntüleme yetkiniz yok");
        }

        const where: any = {
          customerId: userId,
        };

        const skip = sanitizeInt(args.pagination?.skip) || 0;
        const take = Math.min(sanitizeInt(args.pagination?.take) || 50, 100);

        const questions = await ctx.prisma.question.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        });

        logInfo("Kullanıcıya göre sorular listelendi", {
          requesterId: ctx.user!.id,
          targetUserId: userId,
          count: questions.length,
          metadata: timer.end(),
        });

        return questions;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

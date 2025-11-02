/**
 * Question Mutations - Q&A MANAGEMENT SYSTEM
 *
 * 🎯 Purpose: Question asking, answering, and management
 *
 * 📋 Available Mutations:
 *
 * CUSTOMER ACTIONS:
 * - askQuestion: Ask a question about a collection
 * - updateQuestion: Update question text (before answer)
 * - deleteQuestion: Delete own question (before answer)
 *
 * MANUFACTURER ACTIONS:
 * - answerQuestion: Answer a question
 * - updateAnswer: Update existing answer
 * - bulkAnswerQuestions: Answer multiple questions at once
 *
 * ADMIN ACTIONS:
 * - toggleQuestionVisibility: Change public/private status
 * - bulkDeleteQuestions: Delete multiple questions
 *
 * 🔒 Security:
 * - Customers can only manage their own questions
 * - Manufacturers can answer questions about their collections
 * - Admin can manage any question
 *
 * 💡 Features:
 * - Public/private questions
 * - Real-time notifications
 * - Validation (10-1000 chars for questions, 10-2000 for answers)
 * - Bulk operations for efficiency
 */

import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeBoolean,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import { validateRequired, validateStringLength } from "../../utils/validation";
import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

/**
 * Input for asking a question about a collection
 * - Customer asks questions to manufacturer about product details
 * - Questions can be public (visible to all) or private
 */
const AskQuestionInput = builder.inputType("AskQuestionInput", {
  fields: (t) => ({
    collectionId: t.int({ required: true }),
    question: t.string({ required: true }), // Min 10, Max 1000 characters
    isPublic: t.boolean({ required: false }), // Default: true
  }),
});

/**
 * Input for answering a question
 * - Only manufacturer can answer their own product questions
 * - Admin can answer any question
 */
const AnswerQuestionInput = builder.inputType("AnswerQuestionInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    answer: t.string({ required: true }), // Min 10, Max 2000 characters
  }),
});

/**
 * Input for updating a question (before it's answered)
 */
const UpdateQuestionInput = builder.inputType("UpdateQuestionInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    question: t.string({ required: true }),
    isPublic: t.boolean(),
  }),
});

/**
 * Input for updating an answer
 */
const UpdateAnswerInput = builder.inputType("UpdateAnswerInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    answer: t.string({ required: true }),
  }),
});

/**
 * Input for bulk answering questions
 */
const BulkAnswerItemInput = builder.inputType("BulkAnswerItemInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    answer: t.string({ required: true }),
  }),
});

const BulkAnswerQuestionsInput = builder.inputType("BulkAnswerQuestionsInput", {
  fields: (t) => ({
    answers: t.field({
      type: [BulkAnswerItemInput],
      required: true,
    }),
  }),
});

/**
 * Input for toggling question visibility
 */
const ToggleQuestionVisibilityInput = builder.inputType(
  "ToggleQuestionVisibilityInput",
  {
    fields: (t) => ({
      id: t.int({ required: true }),
      isPublic: t.boolean({ required: true }),
    }),
  }
);

// ========================================
// MUTATIONS
// ========================================

/**
 * ASK QUESTION MUTATION
 *
 * Allows customers to ask questions about collections/products.
 *
 * Flow:
 * 1. Validate inputs (question length: 10-1000 chars)
 * 2. Find collection and manufacturer
 * 3. Create question record
 * 4. Send real-time notification to manufacturer
 *
 * Permissions: Any authenticated user
 * Notification: Sent to collection author (manufacturer)
 */
builder.mutationField("askQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: AskQuestionInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("askQuestion");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const collectionId = sanitizeInt(input.collectionId)!;
        const question = sanitizeString(input.question)!;
        const isPublic =
          input.isPublic !== undefined
            ? sanitizeBoolean(input.isPublic)!
            : true;

        // Validate inputs
        validateRequired(collectionId, "Koleksiyon ID");
        validateRequired(question, "Soru");
        validateStringLength(question, "Soru", 10, 1000);

        // Get collection to find manufacturer
        const collection = await context.prisma.collection.findUnique({
          where: { id: collectionId },
        });

        if (!collection) {
          throw new ValidationError("Koleksiyon bulunamadı");
        }

        const data: any = {
          question,
          collectionId,
          customerId: context.user?.id || 0,
          manufactureId: collection.authorId || 0,
          isPublic,
          isAnswered: false,
        };

        const newQuestion = await context.prisma.question.create({
          ...query,
          data,
        });

        logInfo("Soru soruldu", {
          questionId: newQuestion.id,
          collectionId,
          customerId: context.user?.id,
          metadata: timer.end(),
        });

        // Send notification to manufacturer
        if (collection.authorId) {
          try {
            const notif = await context.prisma.notification.create({
              data: {
                userId: collection.authorId,
                type: "MESSAGE",
                title: "Yeni Soru",
                message: `Koleksiyonunuz hakkında yeni bir soru soruldu: ${question.substring(
                  0,
                  50
                )}...`,
                link: `/collections/${collectionId}/questions`,
                data: {
                  questionId: newQuestion.id,
                  collectionId,
                  question: question.substring(0, 100),
                } as any,
              },
            });
            await publishNotification(notif);
          } catch (err) {
            logInfo("Soru bildirimi gönderilemedi", {
              error: String(err),
              questionId: newQuestion.id,
            });
          }
        }

        return newQuestion;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * ANSWER QUESTION MUTATION
 *
 * Allows manufacturers to answer customer questions about their products.
 *
 * Flow:
 * 1. Validate inputs (answer length: 10-2000 chars)
 * 2. Check question exists
 * 3. Verify permission (only manufacturer or admin)
 * 4. Update question with answer
 * 5. Send real-time notification to customer
 *
 * Permissions:
 * - Manufacturer who owns the collection
 * - Admin (can answer any question)
 *
 * Notification: Sent to customer who asked the question
 */
builder.mutationField("answerQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: AnswerQuestionInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("answerQuestion");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const id = sanitizeInt(input.id)!;
        const answer = sanitizeString(input.answer)!;

        // Validate inputs
        validateRequired(id, "Soru ID");
        validateRequired(answer, "Cevap");
        validateStringLength(answer, "Cevap", 10, 2000);

        const question = await context.prisma.question.findUnique({
          where: { id },
        });

        if (!question) {
          throw new ValidationError("Soru bulunamadı");
        }

        // Permission check: Only manufacturer or admin can answer
        if (
          question.manufactureId !== context.user?.id &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ValidationError("Sadece üretici cevap verebilir");
        }

        const updatedQuestion = await context.prisma.question.update({
          ...query,
          where: { id },
          data: {
            answer,
            isAnswered: true,
          },
        });

        logInfo("Soru cevaplandı", {
          questionId: id,
          manufactureId: context.user?.id,
          metadata: timer.end(),
        });

        // Send notification to customer
        if (question.customerId) {
          try {
            const notif = await context.prisma.notification.create({
              data: {
                userId: question.customerId,
                type: "MESSAGE",
                title: "Sorunuz Cevaplandı",
                message: `Sorduğunuz soru cevaplandı: ${answer.substring(
                  0,
                  50
                )}...`,
                link: `/collections/${question.collectionId}/questions`,
                data: {
                  questionId: id,
                  collectionId: question.collectionId,
                  answer: answer.substring(0, 100),
                } as any,
              },
            });
            await publishNotification(notif);
          } catch (err) {
            logInfo("Cevap bildirimi gönderilemedi", {
              error: String(err),
              questionId: id,
            });
          }
        }

        return updatedQuestion;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// UPDATE OPERATIONS
// ========================================

/**
 * UPDATE QUESTION MUTATION
 *
 * Allows customers to update their questions before they are answered.
 *
 * Flow:
 * 1. Validate inputs (question length: 10-1000 chars)
 * 2. Check question exists and not yet answered
 * 3. Verify permission (only question author or admin)
 * 4. Update question
 *
 * Permissions:
 * - Customer who asked the question (if not answered)
 * - Admin (can update any unanswered question)
 *
 * Restrictions: Cannot update after question is answered
 */
builder.mutationField("updateQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: UpdateQuestionInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("updateQuestion");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const id = sanitizeInt(input.id)!;
        const question = sanitizeString(input.question)!;
        const isPublic =
          input.isPublic !== undefined
            ? sanitizeBoolean(input.isPublic)!
            : undefined;

        // Validate inputs
        validateRequired(id, "Soru ID");
        validateRequired(question, "Soru");
        validateStringLength(question, "Soru", 10, 1000);

        const existingQuestion = await context.prisma.question.findUnique({
          where: { id },
        });

        if (!existingQuestion) {
          throw new ValidationError("Soru bulunamadı");
        }

        // Cannot update after answered
        if (existingQuestion.isAnswered) {
          throw new ValidationError("Cevaplandıktan sonra soru düzenlenemez");
        }

        // Permission check: Only customer or admin
        if (
          existingQuestion.customerId !== context.user?.id &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "Sadece kendi sorunuzu düzenleyebilirsiniz"
          );
        }

        const updateData: any = { question };
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        const updated = await context.prisma.question.update({
          ...query,
          where: { id },
          data: updateData,
        });

        logInfo("Soru güncellendi", {
          questionId: id,
          customerId: context.user?.id,
          metadata: timer.end(),
        });

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * UPDATE ANSWER MUTATION
 *
 * Allows manufacturers to update their answers to questions.
 *
 * Flow:
 * 1. Validate inputs (answer length: 10-2000 chars)
 * 2. Check question exists and is answered
 * 3. Verify permission (only manufacturer or admin)
 * 4. Update answer
 * 5. Send notification to customer
 *
 * Permissions:
 * - Manufacturer who answered the question
 * - Admin
 *
 * Notification: Sent to customer about answer update
 */
builder.mutationField("updateAnswer", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: UpdateAnswerInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("updateAnswer");
      try {
        requireAuth(context.user?.id);

        // Sanitize inputs
        const id = sanitizeInt(input.id)!;
        const answer = sanitizeString(input.answer)!;

        // Validate inputs
        validateRequired(id, "Soru ID");
        validateRequired(answer, "Cevap");
        validateStringLength(answer, "Cevap", 10, 2000);

        const question = await context.prisma.question.findUnique({
          where: { id },
        });

        if (!question) {
          throw new ValidationError("Soru bulunamadı");
        }

        if (!question.isAnswered || !question.answer) {
          throw new ValidationError("Henüz cevaplanmamış soru düzenlenemez");
        }

        // Permission check: Only manufacturer or admin
        if (
          question.manufactureId !== context.user?.id &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ValidationError(
            "Sadece kendi cevabınızı düzenleyebilirsiniz"
          );
        }

        const updated = await context.prisma.question.update({
          ...query,
          where: { id },
          data: { answer },
        });

        logInfo("Cevap güncellendi", {
          questionId: id,
          manufactureId: context.user?.id,
          metadata: timer.end(),
        });

        // Notify customer
        if (question.customerId) {
          try {
            const notif = await context.prisma.notification.create({
              data: {
                userId: question.customerId,
                type: "MESSAGE",
                title: "Cevap Güncellendi",
                message: `Sorunuza verilen cevap güncellendi: ${answer.substring(
                  0,
                  50
                )}...`,
                link: `/collections/${question.collectionId}/questions`,
                data: {
                  questionId: id,
                  collectionId: question.collectionId,
                } as any,
              },
            });
            await publishNotification(notif);
          } catch (err) {
            logInfo("Cevap güncelleme bildirimi gönderilemedi", {
              error: String(err),
              questionId: id,
            });
          }
        }

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * DELETE QUESTION MUTATION
 *
 * Allows customers to delete their questions before they are answered.
 *
 * Flow:
 * 1. Check question exists and not yet answered
 * 2. Verify permission (only question author or admin)
 * 3. Delete question
 *
 * Permissions:
 * - Customer who asked the question (if not answered)
 * - Admin (can delete any unanswered question)
 *
 * Restrictions: Cannot delete after question is answered
 */
builder.mutationField("deleteQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, { id }, context) => {
      const timer = createTimer("deleteQuestion");
      try {
        requireAuth(context.user?.id);

        const sanitizedId = sanitizeInt(id)!;
        validateRequired(sanitizedId, "Soru ID");

        const question = await context.prisma.question.findUnique({
          where: { id: sanitizedId },
        });

        if (!question) {
          throw new ValidationError("Soru bulunamadı");
        }

        // Cannot delete after answered
        if (question.isAnswered) {
          throw new ValidationError("Cevaplandıktan sonra soru silinemez");
        }

        // Permission check: Only customer or admin
        if (
          question.customerId !== context.user?.id &&
          context.user?.role !== "ADMIN"
        ) {
          throw new ValidationError("Sadece kendi sorunuzu silebilirsiniz");
        }

        const deleted = await context.prisma.question.delete({
          ...query,
          where: { id: sanitizedId },
        });

        logInfo("Soru silindi", {
          questionId: sanitizedId,
          customerId: context.user?.id,
          metadata: timer.end(),
        });

        return deleted;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// BULK OPERATIONS
// ========================================

/**
 * BULK ANSWER QUESTIONS MUTATION
 *
 * Allows manufacturers to answer multiple questions at once.
 *
 * Flow:
 * 1. Validate all answers (10-2000 chars each)
 * 2. Check all questions exist
 * 3. Verify manufacturer owns all collections
 * 4. Update all questions
 * 5. Send notifications to all customers
 *
 * Permissions:
 * - Manufacturer who owns the collections
 * - Admin
 *
 * Features:
 * - Validates all questions before processing
 * - Sends individual notifications to each customer
 * - Returns count of successfully answered questions
 */
builder.mutationField("bulkAnswerQuestions", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkAnswerQuestionsInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, { input }, context) => {
      const timer = createTimer("bulkAnswerQuestions");
      try {
        requireAuth(context.user?.id);

        const answers = input.answers || [];

        if (answers.length === 0) {
          throw new ValidationError("En az bir cevap gerekli");
        }

        // Validate all inputs first
        for (const item of answers) {
          const id = sanitizeInt(item.id)!;
          const answer = sanitizeString(item.answer)!;
          validateRequired(id, "Soru ID");
          validateRequired(answer, "Cevap");
          validateStringLength(answer, "Cevap", 10, 2000);
        }

        // Fetch all questions
        const questionIds = answers.map((a) => sanitizeInt(a.id)!);
        const questions = await context.prisma.question.findMany({
          where: { id: { in: questionIds } },
        });

        if (questions.length !== questionIds.length) {
          throw new ValidationError("Bir veya daha fazla soru bulunamadı");
        }

        // Verify permission (manufacturer or admin)
        for (const question of questions) {
          if (
            question.manufactureId !== context.user?.id &&
            context.user?.role !== "ADMIN"
          ) {
            throw new ValidationError(
              `Soru #${question.id} için cevaplama yetkiniz yok`
            );
          }
        }

        // Update all questions
        let answeredCount = 0;
        const notifications: any[] = [];

        for (const item of answers) {
          const id = sanitizeInt(item.id)!;
          const answer = sanitizeString(item.answer)!;
          const question = questions.find((q) => q.id === id);

          if (!question) continue;

          await context.prisma.question.update({
            where: { id },
            data: {
              answer,
              isAnswered: true,
            },
          });

          answeredCount++;

          // Prepare notification
          if (question.customerId) {
            notifications.push({
              userId: question.customerId,
              type: "MESSAGE",
              title: "Sorunuz Cevaplandı",
              message: `Sorduğunuz soru cevaplandı: ${answer.substring(
                0,
                50
              )}...`,
              link: `/collections/${question.collectionId}/questions`,
              data: {
                questionId: id,
                collectionId: question.collectionId,
              } as any,
            });
          }
        }

        // Send all notifications
        if (notifications.length > 0) {
          try {
            const createdNotifs = await context.prisma.notification.createMany({
              data: notifications,
            });

            // Publish each notification (for real-time)
            for (const notifData of notifications) {
              const notif = await context.prisma.notification.findFirst({
                where: {
                  userId: notifData.userId,
                  title: notifData.title,
                },
                orderBy: { createdAt: "desc" },
              });
              if (notif) await publishNotification(notif);
            }
          } catch (err) {
            logInfo("Toplu cevap bildirimleri gönderilemedi", {
              error: String(err),
              count: notifications.length,
            });
          }
        }

        logInfo("Sorular toplu cevaplandı", {
          answeredCount,
          manufactureId: context.user?.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          answeredCount,
          totalQuestions: answers.length,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

// ========================================
// ADMIN OPERATIONS
// ========================================

/**
 * TOGGLE QUESTION VISIBILITY MUTATION
 *
 * Allows admin to change question visibility (public/private).
 *
 * Flow:
 * 1. Check question exists
 * 2. Verify admin permission
 * 3. Update visibility
 *
 * Permissions: Admin only
 *
 * Use case: Moderate inappropriate questions
 */
builder.mutationField("toggleQuestionVisibility", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      input: t.arg({ type: ToggleQuestionVisibilityInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, { input }, context) => {
      const timer = createTimer("toggleQuestionVisibility");
      try {
        requireAuth(context.user?.id);

        const id = sanitizeInt(input.id)!;
        const isPublic = sanitizeBoolean(input.isPublic)!;

        validateRequired(id, "Soru ID");

        const question = await context.prisma.question.findUnique({
          where: { id },
        });

        if (!question) {
          throw new ValidationError("Soru bulunamadı");
        }

        const updated = await context.prisma.question.update({
          ...query,
          where: { id },
          data: { isPublic },
        });

        logInfo("Soru görünürlüğü değiştirildi", {
          questionId: id,
          isPublic,
          adminId: context.user?.id,
          metadata: timer.end(),
        });

        return updated;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * BULK DELETE QUESTIONS MUTATION
 *
 * Allows admin to delete multiple questions at once.
 *
 * Flow:
 * 1. Verify admin permission
 * 2. Delete all questions
 * 3. Return count of deleted questions
 *
 * Permissions: Admin only
 *
 * Use case: Moderate spam or inappropriate content
 */
builder.mutationField("bulkDeleteQuestions", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, { ids }, context) => {
      const timer = createTimer("bulkDeleteQuestions");
      try {
        requireAuth(context.user?.id);

        if (!ids || ids.length === 0) {
          throw new ValidationError("En az bir soru ID'si gerekli");
        }

        const sanitizedIds = ids.map((id) => sanitizeInt(id)!);

        const result = await context.prisma.question.deleteMany({
          where: { id: { in: sanitizedIds } },
        });

        logInfo("Sorular toplu silindi", {
          deletedCount: result.count,
          adminId: context.user?.id,
          metadata: timer.end(),
        });

        return {
          success: true,
          deletedCount: result.count,
          requestedCount: sanitizedIds.length,
        };
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

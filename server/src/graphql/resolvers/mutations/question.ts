import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const questionMutations = (t: any) => {
  t.field("createQuestion", {
    type: "Question",
    args: {
      collectionId: nonNull(intArg()),
      question: nonNull(stringArg()),
      isPublic: booleanArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Validate collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        include: { author: true },
      });

      if (!collection || !collection.isActive) {
        throw new Error("Collection not found or not active.");
      }

      if (!collection.author) {
        throw new Error("Collection has no manufacturer assigned.");
      }

      return context.prisma.question.create({
        data: {
          question: args.question,
          isPublic: args.isPublic !== undefined ? args.isPublic : true,
          collectionId: args.collectionId,
          customerId: userId,
          manufactureId: collection.authorId!,
        },
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
    },
  });

  t.field("answerQuestion", {
    type: "Question",
    args: {
      id: nonNull(intArg()),
      answer: nonNull(stringArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get question with permissions check
      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!question) {
        throw new Error("Question not found.");
      }

      // Only the manufacturer can answer questions
      if (question.manufactureId !== userId) {
        throw new Error("Only the manufacturer can answer this question.");
      }

      if (question.isAnswered) {
        throw new Error("Question has already been answered.");
      }

      return context.prisma.question.update({
        where: { id: args.id },
        data: {
          answer: args.answer,
          isAnswered: true,
          updatedAt: new Date(),
        },
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
    },
  });

  t.field("updateQuestion", {
    type: "Question",
    args: {
      id: nonNull(intArg()),
      question: stringArg(),
      answer: stringArg(),
      isPublic: booleanArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get question with permissions check
      const existingQuestion = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!existingQuestion) {
        throw new Error("Question not found.");
      }

      // Check permissions
      const canUpdateQuestion =
        existingQuestion.customerId === userId && !existingQuestion.isAnswered;
      const canUpdateAnswer = existingQuestion.manufactureId === userId;

      if (!canUpdateQuestion && !canUpdateAnswer) {
        throw new Error("You don't have permission to update this question.");
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Customer can update question text and visibility (only if not answered)
      if (canUpdateQuestion && args.question !== undefined) {
        updateData.question = args.question;
      }

      if (canUpdateQuestion && args.isPublic !== undefined) {
        updateData.isPublic = args.isPublic;
      }

      // Manufacturer can update answer
      if (canUpdateAnswer && args.answer !== undefined) {
        updateData.answer = args.answer;
        updateData.isAnswered = true;
      }

      return context.prisma.question.update({
        where: { id: args.id },
        data: updateData,
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
    },
  });

  t.field("deleteQuestion", {
    type: "Boolean",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get question with permissions check
      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!question) {
        throw new Error("Question not found.");
      }

      // Only the customer who asked the question can delete it (and only if not answered)
      if (question.customerId !== userId) {
        throw new Error("You can only delete your own questions.");
      }

      if (question.isAnswered) {
        throw new Error("Cannot delete answered questions.");
      }

      await context.prisma.question.delete({
        where: { id: args.id },
      });

      return true;
    },
  });

  t.field("toggleQuestionVisibility", {
    type: "Question",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get question with permissions check
      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!question) {
        throw new Error("Question not found.");
      }

      // Only the customer who asked the question can toggle visibility
      if (question.customerId !== userId) {
        throw new Error(
          "You can only change visibility of your own questions."
        );
      }

      return context.prisma.question.update({
        where: { id: args.id },
        data: {
          isPublic: !question.isPublic,
          updatedAt: new Date(),
        },
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
    },
  });
};

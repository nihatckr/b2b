import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const questionMutations = (t: any) => {
  // Ask Question
  t.field("askQuestion", {
    type: "Question",
    args: {
      input: nonNull("CreateQuestionInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Get manufacturer
      const manufactureId = collection.authorId;
      if (!manufactureId) {
        throw new Error("Collection has no manufacturer");
      }

      // Create question
      const question = await context.prisma.question.create({
        data: {
          question: input.question,
          collectionId: input.collectionId,
          customerId: userId,
          manufactureId,
          isPublic: input.isPublic ?? true,
          isAnswered: false,
        },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
      });

      return question;
    },
  });

  // Answer Question
  t.field("answerQuestion", {
    type: "Question",
    args: {
      input: nonNull("AnswerQuestionInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const question = await context.prisma.question.findUnique({
        where: { id: input.id },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // Only manufacturer or admin can answer
      if (question.manufactureId !== userId && userRole !== "ADMIN") {
        throw new Error("Only manufacturer can answer this question");
      }

      const updatedQuestion = await context.prisma.question.update({
        where: { id: input.id },
        data: {
          answer: input.answer,
          isAnswered: true,
        },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
      });

      return updatedQuestion;
    },
  });

  // Delete Question
  t.field("deleteQuestion", {
    type: "Question",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const question = await context.prisma.question.findUnique({
        where: { id },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // Only question asker or admin can delete
      if (question.customerId !== userId && userRole !== "ADMIN") {
        throw new Error("Not authorized to delete this question");
      }

      const deletedQuestion = await context.prisma.question.delete({
        where: { id },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
        },
      });

      return deletedQuestion;
    },
  });
};

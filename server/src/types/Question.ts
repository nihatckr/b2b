import { inputObjectType, objectType } from "nexus";

export const Question = objectType({
  name: "Question",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("question");
    t.string("answer");
    t.nonNull.boolean("isAnswered");
    t.nonNull.boolean("isPublic");
    t.nonNull.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.int("manufactureId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Relations
    t.field("collection", {
      type: "Collection",
      resolve: async (parent, _args, context) => {
        return context.prisma.collection.findUnique({
          where: { id: parent.collectionId },
        });
      },
    });

    t.field("customer", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.customerId },
        });
      },
    });

    t.field("manufacture", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.manufactureId },
        });
      },
    });
  },
});

export const CreateQuestionInput = inputObjectType({
  name: "CreateQuestionInput",
  definition(t) {
    t.nonNull.string("question");
    t.nonNull.int("collectionId");
    t.boolean("isPublic");
  },
});

export const AnswerQuestionInput = inputObjectType({
  name: "AnswerQuestionInput",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("answer");
  },
});

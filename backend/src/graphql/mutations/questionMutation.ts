import builder from "../builder";

// Ask question
builder.mutationField("askQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      collectionId: t.arg.int({ required: true }),
      question: t.arg.string({ required: true }),
      isPublic: t.arg.boolean(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      // Get collection to find manufacturer
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
      });

      if (!collection) throw new Error("Collection not found");

      const data: any = {
        question: args.question,
        collectionId: args.collectionId,
        customerId: context.user?.id || 0,
        manufactureId: collection.authorId || 0,
        isPublic: args.isPublic ?? true,
        isAnswered: false,
      };

      return context.prisma.question.create({
        ...query,
        data,
      });
    },
  })
);

// Answer question
builder.mutationField("answerQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      id: t.arg.int({ required: true }),
      answer: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!question) throw new Error("Question not found");
      if (
        question.manufactureId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Only manufacturer can answer");
      }

      return context.prisma.question.update({
        ...query,
        where: { id: args.id },
        data: {
          answer: args.answer,
          isAnswered: true,
        },
      });
    },
  })
);

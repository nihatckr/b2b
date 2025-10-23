import builder from "../builder";

// Get questions for collection
builder.queryField("questions", (t) =>
  t.prismaField({
    type: ["Question"],
    args: {
      collectionId: t.arg.int({ required: true }),
      isAnswered: t.arg.boolean(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        collectionId: args.collectionId,
        isPublic: true,
      };

      if (args.isAnswered !== null && args.isAnswered !== undefined)
        where.isAnswered = args.isAnswered;

      return context.prisma.question.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
      });
    },
  })
);

// Get question by ID
builder.queryField("question", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.question.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

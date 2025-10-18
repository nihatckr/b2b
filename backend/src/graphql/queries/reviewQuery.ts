import builder from "../builder";

// Get reviews for collection
builder.queryField("reviews", (t) =>
  t.prismaField({
    type: ["Review"],
    args: {
      collectionId: t.arg.int({ required: true }),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.review.findMany({
        ...query,
        where: {
          collectionId: args.collectionId,
          isApproved: true,
        },
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

// Get review by ID
builder.queryField("review", (t) =>
  t.prismaField({
    type: "Review",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.review.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

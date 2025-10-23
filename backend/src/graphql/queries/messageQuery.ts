import builder from "../builder";

// Get messages (filtered by user)
builder.queryField("messages", (t) =>
  t.prismaField({
    type: ["Message"],
    args: {
      orderId: t.arg.int(),
      sampleId: t.arg.int(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.orderId) where.orderId = args.orderId;
      if (args.sampleId) where.sampleId = args.sampleId;

      return context.prisma.message.findMany({
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

// Get message by ID
builder.queryField("message", (t) =>
  t.prismaField({
    type: "Message",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.message.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

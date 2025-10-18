import builder from "../builder";

// Get all samples
builder.queryField("samples", (t) =>
  t.prismaField({
    type: ["Sample"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      status: t.arg.string(),
      search: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.status) {
        where.status = args.status;
      }

      if (args.search) {
        where.OR = [
          { sampleNumber: { contains: args.search, mode: "insensitive" } },
          { name: { contains: args.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.sample.findMany({
        ...query,
        where,
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get sample by ID
builder.queryField("sample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.sample.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

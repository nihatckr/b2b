import builder from "../builder";

// Get all orders
builder.queryField("orders", (t) =>
  t.prismaField({
    type: ["Order"],
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
        where.orderNumber = { contains: args.search, mode: "insensitive" };
      }

      return context.prisma.order.findMany({
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

// Get order by ID
builder.queryField("order", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.order.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

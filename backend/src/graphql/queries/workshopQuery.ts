import builder from "../builder";

// All Workshops
builder.queryField("workshops", (t) =>
  t.prismaField({
    type: ["Workshop"],
    args: {
      isActive: t.arg.boolean(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.isActive !== undefined && args.isActive !== null) {
        where.isActive = args.isActive;
      }

      return context.prisma.workshop.findMany({
        ...query,
        where,
        orderBy: { name: "asc" },
      });
    },
  })
);

// Get Single Workshop
builder.queryField("workshop", (t) =>
  t.prismaField({
    type: "Workshop",
    args: { id: t.arg.int({ required: true }) },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const workshop = await context.prisma.workshop.findUnique({
        ...query,
        where: { id: args.id },
      });

      if (!workshop) {
        throw new Error("Workshop not found");
      }

      return workshop;
    },
  })
);

// My Workshops - Owner's workshops
builder.queryField("myWorkshops", (t) =>
  t.prismaField({
    type: ["Workshop"],
    authScopes: { companyOwner: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      return context.prisma.workshop.findMany({
        ...query,
        where: { ownerId: context.user.id },
        orderBy: { name: "asc" },
      });
    },
  })
);

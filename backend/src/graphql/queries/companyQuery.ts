import builder from "../builder";

// Get all companies (public, paginated)
builder.queryField("companies", (t) =>
  t.prismaField({
    type: ["Company"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      search: t.arg.string(),
      type: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { isActive: true };

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { email: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.type) {
        where.type = args.type;
      }

      return context.prisma.company.findMany({
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

// Get company by ID
builder.queryField("company", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.company.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get my company (for company owner/employee)
builder.queryField("myCompany", (t) =>
  t.prismaField({
    type: "Company",
    authScopes: { employee: true, companyOwner: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("User is not part of a company");
      }
      return context.prisma.company.findUniqueOrThrow({
        ...query,
        where: { id: context.user.companyId },
      });
    },
  })
);

// Alias for companies
builder.queryField("allCompanies", (t) =>
  t.prismaField({
    type: ["Company"],
    args: {
      skip: t.arg.int(),
      take: t.arg.int(),
      search: t.arg.string(),
      type: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      const where: any = { isActive: true };

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { email: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.type) {
        where.type = args.type;
      }

      return context.prisma.company.findMany({
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

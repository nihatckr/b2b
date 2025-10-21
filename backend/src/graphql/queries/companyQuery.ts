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
      includeInactive: t.arg.boolean({ defaultValue: false }), // Admin can see inactive companies
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context) => {
      console.log("📊 Companies query called with args:", {
        skip: args.skip,
        take: args.take,
        search: args.search,
        type: args.type,
        includeInactive: args.includeInactive,
        userRole: context.user?.role,
      });

      const where: any = {};

      // Only admins can see inactive companies
      if (!args.includeInactive || context.user?.role !== "ADMIN") {
        where.isActive = true;
      }

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: "insensitive" } },
          { email: { contains: args.search, mode: "insensitive" } },
        ];
      }

      if (args.type) {
        where.type = args.type;
      }

      const companies = await context.prisma.company.findMany({
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

      console.log(`✅ Found ${companies.length} companies (includeInactive: ${args.includeInactive})`);
      console.log("📋 Companies status breakdown:",
        companies.map(c => ({ id: c.id, name: c.name, isActive: c.isActive }))
      );

      return companies;
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
    nullable: true, // Company yoksa null dön
    authScopes: { employee: true, companyOwner: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        console.log("⚠️  User has no companyId:", context.user?.email);
        return null; // Throw yerine null dön
      }

      // Company var mı kontrol et
      const company = await context.prisma.company.findUnique({
        ...query,
        where: { id: context.user.companyId },
      });

      if (!company) {
        console.log("⚠️  Company not found for ID:", context.user.companyId);
        return null; // Throw yerine null dön
      }

      return company;
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

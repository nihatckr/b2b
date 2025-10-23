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
      const user = context.user;
      if (!user) throw new Error("Unauthorized");

      const where: any = {};

      // Get user's company info if they have one
      let userCompanyType: string | null = null;
      if (user.companyId) {
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });
        userCompanyType = company?.type || null;
      }

      // Filter by user role and company type
      if (user.role === "INDIVIDUAL_CUSTOMER") {
        // Individual customers see only their own orders
        where.customerId = user.id;
      } else if (userCompanyType === "BUYER") {
        // Buyer company users see their company's orders
        where.customer = {
          companyId: user.companyId,
        };
      } else if (userCompanyType === "MANUFACTURER") {
        // Manufacturer sees orders for their collections
        where.collection = {
          companyId: user.companyId,
        };
      } else if (user.role === "ADMIN") {
        // Admin sees all orders (no filter)
      } else {
        // Default: user's own orders
        where.customerId = user.id;
      }

      if (args.status) {
        where.status = args.status;
      }

      if (args.search) {
        where.OR = [
          { orderNumber: { contains: args.search, mode: "insensitive" } },
          {
            collection: {
              name: { contains: args.search, mode: "insensitive" },
            },
          },
        ];
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
      const user = context.user;
      if (!user) throw new Error("Unauthorized");

      // First, get the order
      const order = await context.prisma.order.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
        include: {
          customer: true,
          collection: {
            include: {
              company: true,
            },
          },
        },
      });

      // Check if user has permission to view this order
      let hasAccess = false;

      if (user.role === "ADMIN") {
        // Admin can see all orders
        hasAccess = true;
      } else if (user.role === "INDIVIDUAL_CUSTOMER") {
        // Individual customer can only see their own orders
        hasAccess = order.customerId === user.id;
      } else if (user.companyId) {
        // Get user's company info
        const company = await context.prisma.company.findUnique({
          where: { id: user.companyId },
          select: { type: true },
        });

        if (company?.type === "BUYER") {
          // Buyer company users can see orders from their company
          hasAccess = order.customer?.companyId === user.companyId;
        } else if (company?.type === "MANUFACTURER") {
          // Manufacturer can see orders for their collections
          hasAccess = order.collection?.companyId === user.companyId;
        }
      }

      if (!hasAccess) {
        throw new Error("You don't have permission to view this order");
      }

      return order;
    },
  })
);

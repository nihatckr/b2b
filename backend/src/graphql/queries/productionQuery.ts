import builder from "../builder";

// All Production Tracking
builder.queryField("allProductionTracking", (t) =>
  t.prismaField({
    type: ["ProductionTracking"],
    authScopes: { user: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      // Admin sees all, others see only their productions
      const where: any =
        context.user.role === "ADMIN"
          ? {}
          : {
              OR: [
                { order: { customerId: context.user.id } },
                { order: { manufactureId: context.user.id } },
                { sample: { customerId: context.user.id } },
                { sample: { manufactureId: context.user.id } },
              ],
            };

      return context.prisma.productionTracking.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Get Single Production Tracking
builder.queryField("productionTracking", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: { id: t.arg.int({ required: true }) },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const production = await context.prisma.productionTracking.findUnique({
        ...query,
        where: { id: args.id },
      });

      if (!production) {
        throw new Error("Production not found");
      }

      // Check authorization
      if (context.user?.role !== "ADMIN") {
        const order = production.orderId
          ? await context.prisma.order.findUnique({
              where: { id: production.orderId },
            })
          : null;
        const sample = production.sampleId
          ? await context.prisma.sample.findUnique({
              where: { id: production.sampleId },
            })
          : null;

        const hasAccess =
          (order &&
            (order.customerId === context.user?.id ||
              order.manufactureId === context.user?.id)) ||
          (sample &&
            (sample.customerId === context.user?.id ||
              sample.manufactureId === context.user?.id));

        if (!hasAccess) {
          throw new Error("Not authorized to view this production");
        }
      }

      return production;
    },
  })
);

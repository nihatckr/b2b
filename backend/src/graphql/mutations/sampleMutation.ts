import builder from "../builder";

const ValidSampleStatuses = [
  "AI_DESIGN",
  "PENDING_APPROVAL",
  "PENDING",
  "REVIEWED",
  "QUOTE_SENT",
  "CUSTOMER_QUOTE_SENT",
  "MANUFACTURER_REVIEWING_QUOTE",
  "CONFIRMED",
  "REJECTED",
  "REJECTED_BY_CUSTOMER",
  "REJECTED_BY_MANUFACTURER",
  "IN_DESIGN",
  "PATTERN_READY",
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "QUALITY_CHECK",
  "SHIPPED",
  "DELIVERED",
  "ON_HOLD",
  "CANCELLED",
  "REQUESTED",
  "RECEIVED",
  "COMPLETED",
];

// Create sample (user only)
builder.mutationField("createSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      collectionId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.sample.create({
        ...query,
        data: {
          sampleNumber: `SAMPLE-${Date.now()}`,
          name: args.name,
          ...(args.description !== null && args.description !== undefined
            ? { description: args.description }
            : {}),
          ...(args.collectionId !== null && args.collectionId !== undefined
            ? { collectionId: args.collectionId }
            : {}),
          customerId: context.user?.id || 0,
          manufactureId: context.user?.id || 0,
          status: "PENDING" as any,
        },
      });
    },
  })
);

// Update sample (owner or admin)
builder.mutationField("updateSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
      status: t.arg.string(),
    },
    authScopes: { user: true, admin: true },
    resolve: async (query, _root, args, context) => {
      // Check ownership
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;
      if (args.status !== null && args.status !== undefined) {
        if (!ValidSampleStatuses.includes(args.status)) {
          throw new Error(
            `Invalid status. Must be one of: ${ValidSampleStatuses.join(", ")}`
          );
        }
        updateData.status = args.status;
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Delete sample (owner or admin)
builder.mutationField("deleteSample", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (_root, args, context) => {
      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.sample.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

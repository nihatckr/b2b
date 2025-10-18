import builder from "../builder";

// Create Workshop
builder.mutationField("createWorkshop", (t) =>
  t.prismaField({
    type: "Workshop",
    args: {
      name: t.arg.string({ required: true }),
      type: t.arg.string({ required: true }),
      capacity: t.arg.int(),
      location: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });

      if (
        !user ||
        !["ADMIN", "COMPANY_OWNER", "COMPANY_EMPLOYEE"].includes(user.role)
      ) {
        throw new Error("Not authorized to create workshop");
      }

      const workshop = await context.prisma.workshop.create({
        ...query,
        data: {
          name: args.name,
          type: args.type as any,
          capacity: args.capacity || undefined,
          location: args.location || undefined,
          ownerId: context.user.id,
        } as any,
      });

      return workshop;
    },
  })
);

// Update Workshop
builder.mutationField("updateWorkshop", (t) =>
  t.prismaField({
    type: "Workshop",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      type: t.arg.string(),
      capacity: t.arg.int(),
      location: t.arg.string(),
      isActive: t.arg.boolean(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const workshop = await context.prisma.workshop.findUnique({
        where: { id: args.id },
      });

      if (!workshop) {
        throw new Error("Workshop not found");
      }

      if (
        workshop.ownerId !== context.user.id &&
        context.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized to update this workshop");
      }

      const updated = await context.prisma.workshop.update({
        ...query,
        where: { id: args.id },
        data: {
          name: args.name || undefined,
          type: args.type ? (args.type as any) : undefined,
          capacity: args.capacity || undefined,
          location: args.location || undefined,
          isActive: args.isActive !== undefined ? args.isActive : undefined,
        } as any,
      });

      return updated;
    },
  })
);

// Delete Workshop
builder.mutationField("deleteWorkshop", (t) =>
  t.prismaField({
    type: "Workshop",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const workshop = await context.prisma.workshop.findUnique({
        where: { id: args.id },
      });

      if (!workshop) {
        throw new Error("Workshop not found");
      }

      if (
        workshop.ownerId !== context.user.id &&
        context.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized to delete this workshop");
      }

      // Check if workshop has active productions
      const activeProductions = await context.prisma.productionTracking.count({
        where: {
          OR: [{ sewingWorkshopId: args.id }, { packagingWorkshopId: args.id }],
        },
      });

      if (activeProductions > 0) {
        throw new Error("Workshop has active productions");
      }

      const deleted = await context.prisma.workshop.delete({
        ...query,
        where: { id: args.id },
      });

      return deleted;
    },
  })
);

// Assign Workshop to Production
builder.mutationField("assignWorkshopToProduction", (t) =>
  t.prismaField({
    type: "ProductionTracking",
    args: {
      productionId: t.arg.int({ required: true }),
      sewingWorkshopId: t.arg.int(),
      packagingWorkshopId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const production = await context.prisma.productionTracking.findUnique({
        where: { id: args.productionId },
      });

      if (!production) {
        throw new Error("Production not found");
      }

      const updated = await context.prisma.productionTracking.update({
        ...query,
        where: { id: args.productionId },
        data: {
          sewingWorkshopId: args.sewingWorkshopId || undefined,
          packagingWorkshopId: args.packagingWorkshopId || undefined,
        } as any,
      });

      return updated;
    },
  })
);

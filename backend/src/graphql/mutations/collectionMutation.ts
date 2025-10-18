import builder from "../builder";

// Create collection (company owner or admin)
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      season: t.arg.string(),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const data: any = {
        name: args.name,
        modelCode: `MODEL-${Date.now()}`,
        companyId: context.user?.companyId || 0,
        authorId: context.user?.id || 0,
        isActive: true,
      };

      if (args.description !== null && args.description !== undefined)
        data.description = args.description;
      if (args.season !== null && args.season !== undefined) data.season = args.season;

      return context.prisma.collection.create({
        ...query,
        data,
      });
    },
  })
);

// Update collection (owner or admin)
builder.mutationField("updateCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
      isFeatured: t.arg.boolean(),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.id },
      });

      if (!collection) throw new Error("Collection not found");
      if (
        collection.companyId !== context.user?.companyId &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};
      if (args.name !== null && args.name !== undefined) updateData.name = args.name;
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;
      if (args.isFeatured !== null && args.isFeatured !== undefined)
        updateData.isFeatured = args.isFeatured;

      return context.prisma.collection.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Publish collection (owner or admin)
builder.mutationField("publishCollection", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (_root, args, context) => {
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.id },
      });

      if (!collection) throw new Error("Collection not found");
      if (
        collection.companyId !== context.user?.companyId &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.collection.update({
        where: { id: args.id },
        data: { isActive: true },
      });
      return true;
    },
  })
);

// Delete collection (owner or admin)
builder.mutationField("deleteCollection", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (_root, args, context) => {
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.id },
      });

      if (!collection) throw new Error("Collection not found");
      if (
        collection.companyId !== context.user?.companyId &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.collection.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

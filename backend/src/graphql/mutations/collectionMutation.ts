import builder from "../builder";

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Create collection (company owner or admin)
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      season: t.arg.string(),
      gender: t.arg.string(),
      fit: t.arg.string(),
      images: t.arg.string(),
      mainImage: t.arg.string(),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const slug = generateSlug(args.name);

      const data: any = {
        name: args.name,
        slug: slug,
        modelCode: `MODEL-${Date.now()}`,
        companyId: context.user?.companyId || 0,
        authorId: context.user?.id || 0,
        isActive: true,
        viewCount: 0,
        shareCount: 0,
        likesCount: 0,
      };

      if (args.description !== null && args.description !== undefined)
        data.description = args.description;
      if (args.season !== null && args.season !== undefined)
        data.season = args.season;
      if (args.gender !== null && args.gender !== undefined)
        data.gender = args.gender;
      if (args.fit !== null && args.fit !== undefined)
        data.fit = args.fit;
      if (args.images !== null && args.images !== undefined)
        data.images = args.images;
      if (args.mainImage !== null && args.mainImage !== undefined)
        data.mainImage = args.mainImage;

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

      // Season & Gender & Fit
      season: t.arg.string(),
      gender: t.arg.string(),
      fit: t.arg.string(),
      trend: t.arg.string(),

      // Variants
      colors: t.arg.string(), // JSON array
      sizeGroups: t.arg.string(), // JSON array
      sizeRange: t.arg.string(),
      measurementChart: t.arg.string(),

      // Technical Details
      fabricComposition: t.arg.string(),
      accessories: t.arg.string(), // JSON
      techPack: t.arg.string(),

      // Commercial Info
      moq: t.arg.int(),
      targetPrice: t.arg.float(),
      targetLeadTime: t.arg.int(),
      notes: t.arg.string(),

      // Media
      images: t.arg.string(), // JSON array
      mainImage: t.arg.string(),

      // Production Schedule
      productionSchedule: t.arg.string(), // JSON
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

      // Basic fields
      if (args.name !== null && args.name !== undefined) {
        updateData.name = args.name;
        updateData.slug = generateSlug(args.name);
      }
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;
      if (args.isFeatured !== null && args.isFeatured !== undefined)
        updateData.isFeatured = args.isFeatured;

      // Season & Gender & Fit
      if (args.season !== null && args.season !== undefined)
        updateData.season = args.season;
      if (args.gender !== null && args.gender !== undefined)
        updateData.gender = args.gender;
      if (args.fit !== null && args.fit !== undefined)
        updateData.fit = args.fit;
      if (args.trend !== null && args.trend !== undefined)
        updateData.trend = args.trend;

      // Variants
      if (args.colors !== null && args.colors !== undefined)
        updateData.colors = args.colors;
      if (args.sizeGroups !== null && args.sizeGroups !== undefined)
        updateData.sizeGroups = args.sizeGroups;
      if (args.sizeRange !== null && args.sizeRange !== undefined)
        updateData.sizeRange = args.sizeRange;
      if (args.measurementChart !== null && args.measurementChart !== undefined)
        updateData.measurementChart = args.measurementChart;

      // Technical Details
      if (args.fabricComposition !== null && args.fabricComposition !== undefined)
        updateData.fabricComposition = args.fabricComposition;
      if (args.accessories !== null && args.accessories !== undefined)
        updateData.accessories = args.accessories;
      if (args.techPack !== null && args.techPack !== undefined)
        updateData.techPack = args.techPack;

      // Commercial Info
      if (args.moq !== null && args.moq !== undefined)
        updateData.moq = args.moq;
      if (args.targetPrice !== null && args.targetPrice !== undefined)
        updateData.targetPrice = args.targetPrice;
      if (args.targetLeadTime !== null && args.targetLeadTime !== undefined)
        updateData.targetLeadTime = args.targetLeadTime;
      if (args.notes !== null && args.notes !== undefined)
        updateData.notes = args.notes;

      // Media
      if (args.images !== null && args.images !== undefined)
        updateData.images = args.images;
      if (args.mainImage !== null && args.mainImage !== undefined)
        updateData.mainImage = args.mainImage;

      // Production Schedule
      if (args.productionSchedule !== null && args.productionSchedule !== undefined)
        updateData.productionSchedule = args.productionSchedule;

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

import builder from "../builder";

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Create collection (manufacturer companies only) - WITH LIBRARY INTEGRATION
// Only MANUFACTURER or BOTH type companies can create collections
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      // Basic Info
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      modelCode: t.arg.string(),

      // Category Integration
      categoryId: t.arg.int(),
      companyCategoryId: t.arg.int(),

      // Season & Gender & Fit (from Library)
      season: t.arg.string(),
      gender: t.arg.string(),
      fit: t.arg.string(),
      trend: t.arg.string(),

      // Variants (from Library)
      colors: t.arg.string(), // JSON array from Color Library
      sizeGroups: t.arg.string(), // JSON array from Size Library
      sizeRange: t.arg.string(),
      measurementChart: t.arg.string(),

      // Technical Details
      fabricComposition: t.arg.string(),
      accessories: t.arg.string(), // JSON from Accessory Library
      techPack: t.arg.string(),

      // Commercial Info
      moq: t.arg.int(),
      targetPrice: t.arg.float(),
      currency: t.arg.string(),
      targetLeadTime: t.arg.int(),
      notes: t.arg.string(),

      // Media
      images: t.arg.string(), // JSON array

      // Production Schedule
      productionSchedule: t.arg.string(), // JSON

      // Certification Integration (from Library)
      certificationIds: t.arg.intList(), // Array of LibraryItem IDs for certifications
    },
    authScopes: { user: true }, // ✅ Allow all logged-in users (will check company type inside)
    resolve: async (query, _root, args, context) => {
      // ✅ Check if user has a company
      if (!context.user?.companyId) {
        throw new Error("You must be part of a company to create collections");
      }

      // ✅ Get user's company to check type
      const userCompany = await context.prisma.company.findUnique({
        where: { id: context.user.companyId },
        select: { id: true, type: true, name: true },
      });

      if (!userCompany) {
        throw new Error("Company not found");
      }

      // ✅ Only MANUFACTURER or BOTH type companies can create collections
      if (userCompany.type === "BUYER") {
        throw new Error(
          "Only manufacturer companies can create product collections. " +
            "Your company is registered as BUYER type. " +
            "Please contact support to change company type if needed."
        );
      }

      console.log(
        `✅ Collection creation allowed for ${userCompany.name} (Type: ${userCompany.type})`
      );

      const slug = generateSlug(args.name);

      const data: any = {
        name: args.name,
        slug: slug,
        modelCode: args.modelCode || `MODEL-${Date.now()}`,
        company: {
          connect: { id: context.user?.companyId || 0 },
        },
        author: {
          connect: { id: context.user?.id || 0 },
        },
        isActive: true,
        viewCount: 0,
        shareCount: 0,
        likesCount: 0,
      };

      // Basic fields
      if (args.description !== null && args.description !== undefined)
        data.description = args.description;

      // Category Integration
      if (args.categoryId !== null && args.categoryId !== undefined)
        data.categoryId = args.categoryId;
      if (
        args.companyCategoryId !== null &&
        args.companyCategoryId !== undefined
      )
        data.companyCategoryId = args.companyCategoryId;

      // Season & Gender & Fit (from Library)
      if (args.season !== null && args.season !== undefined)
        data.season = args.season;
      if (args.gender !== null && args.gender !== undefined)
        data.gender = args.gender;
      if (args.fit !== null && args.fit !== undefined) data.fit = args.fit;
      if (args.trend !== null && args.trend !== undefined)
        data.trend = args.trend;

      // Variants (from Library)
      if (args.colors !== null && args.colors !== undefined)
        data.colors = args.colors;
      if (args.sizeGroups !== null && args.sizeGroups !== undefined)
        data.sizeGroups = args.sizeGroups;
      if (args.sizeRange !== null && args.sizeRange !== undefined)
        data.sizeRange = args.sizeRange;
      if (args.measurementChart !== null && args.measurementChart !== undefined)
        data.measurementChart = args.measurementChart;

      // Technical Details
      if (
        args.fabricComposition !== null &&
        args.fabricComposition !== undefined
      )
        data.fabricComposition = args.fabricComposition;
      if (args.accessories !== null && args.accessories !== undefined)
        data.accessories = args.accessories;
      if (args.techPack !== null && args.techPack !== undefined)
        data.techPack = args.techPack;

      // Commercial Info
      if (args.moq !== null && args.moq !== undefined) data.moq = args.moq;
      if (args.targetPrice !== null && args.targetPrice !== undefined)
        data.targetPrice = args.targetPrice;
      if (args.currency !== null && args.currency !== undefined)
        data.currency = args.currency;
      if (args.targetLeadTime !== null && args.targetLeadTime !== undefined)
        data.targetLeadTime = args.targetLeadTime;
      if (args.notes !== null && args.notes !== undefined)
        data.notes = args.notes;

      // Media
      if (args.images !== null && args.images !== undefined)
        data.images = args.images;

      // Production Schedule
      if (
        args.productionSchedule !== null &&
        args.productionSchedule !== undefined
      )
        data.productionSchedule = args.productionSchedule;

      const collection = await context.prisma.collection.create({
        ...query,
        data,
      });

      // Handle certification connections (from Library)
      if (args.certificationIds && args.certificationIds.length > 0) {
        // Connect certifications from LibraryItem
        await context.prisma.collection.update({
          where: { id: collection.id },
          data: {
            certifications: {
              connect: args.certificationIds.map((id) => ({ id })),
            },
          },
        });
      }

      console.log(
        `✅ Collection created: ${collection.name} (ID: ${collection.id}) by ${userCompany.name}`
      );

      return collection;
    },
  })
);

// Update collection (owner or admin) - WITH LIBRARY INTEGRATION
builder.mutationField("updateCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),

      // Basic Info
      name: t.arg.string(),
      description: t.arg.string(),
      modelCode: t.arg.string(),
      isFeatured: t.arg.boolean(),
      isActive: t.arg.boolean(),

      // Category Integration
      categoryId: t.arg.int(),
      companyCategoryId: t.arg.int(),

      // Season & Gender & Fit (from Library)
      season: t.arg.string(),
      gender: t.arg.string(),
      fit: t.arg.string(),
      trend: t.arg.string(),

      // Variants (from Library)
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
      currency: t.arg.string(),
      targetLeadTime: t.arg.int(),
      notes: t.arg.string(),

      // Media
      images: t.arg.string(), // JSON array

      // Production Schedule
      productionSchedule: t.arg.string(), // JSON

      // Certification Integration (from Library)
      certificationIds: t.arg.intList(), // Array of LibraryItem IDs for certifications
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
      if (args.modelCode !== null && args.modelCode !== undefined)
        updateData.modelCode = args.modelCode;
      if (args.isFeatured !== null && args.isFeatured !== undefined)
        updateData.isFeatured = args.isFeatured;
      if (args.isActive !== null && args.isActive !== undefined)
        updateData.isActive = args.isActive;

      // Category Integration
      if (args.categoryId !== null && args.categoryId !== undefined)
        updateData.categoryId = args.categoryId;
      if (
        args.companyCategoryId !== null &&
        args.companyCategoryId !== undefined
      )
        updateData.companyCategoryId = args.companyCategoryId;

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
      if (
        args.fabricComposition !== null &&
        args.fabricComposition !== undefined
      )
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
      if (args.currency !== null && args.currency !== undefined)
        updateData.currency = args.currency;
      if (args.targetLeadTime !== null && args.targetLeadTime !== undefined)
        updateData.targetLeadTime = args.targetLeadTime;
      if (args.notes !== null && args.notes !== undefined)
        updateData.notes = args.notes;

      // Media
      if (args.images !== null && args.images !== undefined)
        updateData.images = args.images;

      // Production Schedule
      if (
        args.productionSchedule !== null &&
        args.productionSchedule !== undefined
      )
        updateData.productionSchedule = args.productionSchedule;

      const updatedCollection = await context.prisma.collection.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // Handle certification connections (from Library)
      if (
        args.certificationIds !== null &&
        args.certificationIds !== undefined
      ) {
        // First disconnect all existing certifications, then connect new ones
        await context.prisma.collection.update({
          where: { id: args.id },
          data: {
            certifications: {
              set: [], // Clear existing connections
              connect: args.certificationIds.map((id) => ({ id })), // Add new connections
            },
          },
        });
      }

      return updatedCollection;
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

// Toggle featured status (owner or admin)
builder.mutationField("toggleFeaturedCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      id: t.arg.int({ required: true }),
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

      return context.prisma.collection.update({
        ...query,
        where: { id: args.id },
        data: { isFeatured: !collection.isFeatured },
      });
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

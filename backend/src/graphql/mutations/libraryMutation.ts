import builder from "../builder";

// ========================================
// UNIFIED LIBRARY MUTATIONS
// ========================================

// Input for creating library items
const CreateLibraryItemInput = builder.inputType("CreateLibraryItemInput", {
  fields: (t) => ({
    category: t.field({ type: "String", required: true }),
    scope: t.field({ type: "String", required: true }),
    code: t.string({ required: false }),
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    imageUrl: t.string({ required: false }),
    data: t.string({ required: false }),
    tags: t.string({ required: false }),
    internalCode: t.string({ required: false }),
    notes: t.string({ required: false }),
    isActive: t.boolean({ required: false }),
    isPopular: t.boolean({ required: false }),
    companyId: t.int({ required: false }),
    standardItemId: t.int({ required: false }),
    // 🔗 Certification IDs
    certificationIds: t.intList({ required: false }),
  }),
});

// Input for updating library items
const UpdateLibraryItemInput = builder.inputType("UpdateLibraryItemInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    description: t.string({ required: false }),
    imageUrl: t.string({ required: false }),
    data: t.string({ required: false }),
    tags: t.string({ required: false }),
    internalCode: t.string({ required: false }),
    notes: t.string({ required: false }),
    isActive: t.boolean({ required: false }),
    isPopular: t.boolean({ required: false }),
  }),
});

// Create Library Item
builder.mutationField("createLibraryItem", (t) =>
  t.prismaField({
    type: "LibraryItem",
    args: {
      input: t.arg({ type: CreateLibraryItemInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const input = args.input;

      let dataJson = null;
      let tagsJson = null;

      if (input.data) {
        try {
          dataJson = JSON.parse(input.data);
        } catch (e) {
          throw new Error("Invalid JSON in data field");
        }
      }

      if (input.tags) {
        try {
          tagsJson = JSON.parse(input.tags);
        } catch (e) {
          throw new Error("Invalid JSON in tags field");
        }
      }

      // Check if code already exists (skip for SEASON)
      if (input.code && input.category !== "SEASON") {
        const existingItem = await context.prisma.libraryItem.findUnique({
          where: { code: input.code },
        });

        if (existingItem) {
          throw new Error(
            `Bu kod zaten mevcut: "${input.code}". ` +
              `Mevcut item: "${existingItem.name}" (${existingItem.category}). ` +
              `Lütfen farklı bir kod kullanın veya mevcut item'ı düzenleyin.`
          );
        }
      }

      // Check if similar item already exists (same name + category + company)
      const companyId = input.companyId || context.user.companyId || null;

      // Special check for SEASON category - check by type + year combination
      if (input.category === "SEASON" && input.data) {
        try {
          const seasonData =
            typeof input.data === "string"
              ? JSON.parse(input.data)
              : input.data;
          if (seasonData.type && seasonData.year) {
            // Get all seasons and check in JavaScript since JSON path queries are complex
            const existingSeasons = await context.prisma.libraryItem.findMany({
              where: {
                category: "SEASON",
                companyId: companyId,
                isActive: true,
              },
            });

            // Check if any existing season has the same type and year
            for (const existingSeason of existingSeasons) {
              const existingData = existingSeason.data as any;
              if (
                existingData &&
                existingData.type === seasonData.type &&
                existingData.year === seasonData.year
              ) {
                const seasonTypeName =
                  seasonData.type === "SS" ? "Spring/Summer" : "Fall/Winter";
                throw new Error(
                  `${seasonTypeName} ${seasonData.year} sezonu zaten mevcut! ` +
                    `Aynı yılın aynı sezonunu tekrar kaydedemezsiniz. ` +
                    `Mevcut sezonu düzenlemek isterseniz library sayfasından düzenleyebilirsiniz.`
                );
              }
            }
          }
        } catch (e) {
          // If JSON parsing fails, continue with regular name check
        }
      }

      const existingSimilar = await context.prisma.libraryItem.findFirst({
        where: {
          name: input.name,
          category: input.category as any,
          companyId: companyId,
          isActive: true,
        },
      });

      if (existingSimilar) {
        // Special message for SEASON category
        if (input.category === "SEASON") {
          throw new Error(
            `Bu sezon zaten mevcut: "${input.name}". ` +
              `Aynı sezonu tekrar kaydedemezsiniz. ` +
              `Mevcut sezonu düzenlemek isterseniz library sayfasından düzenleyebilirsiniz.`
          );
        } else {
          throw new Error(
            `Bu isimde bir ${input.category.toLowerCase()} zaten mevcut: "${
              input.name
            }". ` +
              `Kod: ${existingSimilar.code || "Yok"}. ` +
              `Lütfen farklı bir isim kullanın veya mevcut item'ı düzenleyin.`
          );
        }
      }
      try {
        return await context.prisma.libraryItem.create({
          ...query,
          data: {
            category: input.category as any,
            scope: input.scope as any,
            code:
              input.category === "SEASON"
                ? `SEASON-${Date.now()}` // Always unique for SEASON
                : input.code && input.code.trim() !== ""
                ? input.code
                : null,
            name: input.name,
            description: input.description ?? null,
            imageUrl: input.imageUrl ?? null,
            ...(dataJson !== null && { data: dataJson }),
            ...(tagsJson !== null && { tags: tagsJson }),
            internalCode: input.internalCode ?? null,
            notes: input.notes ?? null,
            isActive: input.isActive ?? true,
            isPopular: input.isPopular ?? false,
            companyId: input.companyId ?? context.user.companyId ?? null,
            standardItemId: input.standardItemId ?? null,
            createdById: context.user.id,
            // 🔗 Connect certifications
            ...(input.certificationIds &&
              input.certificationIds.length > 0 && {
                certifications: {
                  connect: input.certificationIds.map((id) => ({ id })),
                },
              }),
          },
        });
      } catch (error: any) {
        // Handle unique constraint error for SEASON category
        if (
          input.category === "SEASON" &&
          error.code === "P2002" &&
          error.meta?.target?.includes("code")
        ) {
          // Generate a unique code with timestamp for SEASON
          const timestamp = Date.now().toString();
          return await context.prisma.libraryItem.create({
            ...query,
            data: {
              category: input.category as any,
              scope: input.scope as any,
              code: `SEASON-${timestamp}`, // Unique code with timestamp
              name: input.name,
              description: input.description ?? null,
              imageUrl: input.imageUrl ?? null,
              ...(dataJson !== null && { data: dataJson }),
              ...(tagsJson !== null && { tags: tagsJson }),
              internalCode: input.internalCode ?? null,
              notes: input.notes ?? null,
              isActive: input.isActive ?? true,
              isPopular: input.isPopular ?? false,
              companyId: input.companyId ?? context.user.companyId ?? null,
              standardItemId: input.standardItemId ?? null,
              createdById: context.user.id,
              // 🔗 Connect certifications
              ...(input.certificationIds &&
                input.certificationIds.length > 0 && {
                  certifications: {
                    connect: input.certificationIds.map((id) => ({ id })),
                  },
                }),
            },
          });
        }

        // Re-throw other errors
        throw error;
      }
    },
  })
);

// Update Library Item
builder.mutationField("updateLibraryItem", (t) =>
  t.prismaField({
    type: "LibraryItem",
    args: {
      id: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateLibraryItemInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const existing = await context.prisma.libraryItem.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new Error("Library item not found");
      }

      if (existing.scope === "COMPANY_CUSTOM") {
        if (existing.companyId !== context.user.companyId) {
          throw new Error("Not authorized to update this item");
        }
      } else if (existing.scope === "PLATFORM_STANDARD") {
        if (context.user.role !== "ADMIN") {
          throw new Error("Only admins can update platform standards");
        }
      }

      const input = args.input;

      let dataJson = undefined;
      let tagsJson = undefined;

      if (input.data) {
        try {
          dataJson = JSON.parse(input.data);
        } catch (e) {
          throw new Error("Invalid JSON in data field");
        }
      }

      if (input.tags) {
        try {
          tagsJson = JSON.parse(input.tags);
        } catch (e) {
          throw new Error("Invalid JSON in tags field");
        }
      }

      return context.prisma.libraryItem.update({
        ...query,
        where: { id: args.id },
        data: {
          ...(input.name !== undefined &&
            input.name !== null && { name: input.name }),
          ...(input.description !== undefined &&
            input.description !== null && { description: input.description }),
          ...(input.imageUrl !== undefined &&
            input.imageUrl !== null && { imageUrl: input.imageUrl }),
          ...(dataJson !== undefined && { data: dataJson }),
          ...(tagsJson !== undefined && { tags: tagsJson }),
          ...(input.internalCode !== undefined &&
            input.internalCode !== null && {
              internalCode: input.internalCode,
            }),
          ...(input.notes !== undefined &&
            input.notes !== null && { notes: input.notes }),
          ...(input.isActive !== undefined &&
            input.isActive !== null && { isActive: input.isActive }),
          ...(input.isPopular !== undefined &&
            input.isPopular !== null && { isPopular: input.isPopular }),
        },
      });
    },
  })
);

// Delete Library Item (soft delete)
builder.mutationField("deleteLibraryItem", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const existing = await context.prisma.libraryItem.findUnique({
        where: { id: args.id },
      });

      if (!existing) {
        throw new Error("Library item not found");
      }

      if (existing.scope === "COMPANY_CUSTOM") {
        if (existing.companyId !== context.user.companyId) {
          throw new Error("Not authorized to delete this item");
        }
      } else if (existing.scope === "PLATFORM_STANDARD") {
        if (context.user.role !== "ADMIN") {
          throw new Error("Only admins can delete platform standards");
        }
      }

      await context.prisma.libraryItem.update({
        where: { id: args.id },
        data: { isActive: false },
      });

      return true;
    },
  })
);

// ========================================
// CATEGORY MUTATIONS
// ========================================

// Create Standard Category (admin only)
const CreateStandardCategoryInput = builder.inputType(
  "CreateStandardCategoryInput",
  {
    fields: (t) => ({
      code: t.string({ required: true }),
      name: t.string({ required: true }),
      description: t.string({ required: false }),
      level: t.string({ required: true }),
      order: t.int({ required: false }),
      icon: t.string({ required: false }),
      image: t.string({ required: false }),
      parentId: t.int({ required: false }),
      keywords: t.string({ required: false }),
      tags: t.string({ required: false }),
      isActive: t.boolean({ required: false }),
      isPublic: t.boolean({ required: false }),
    }),
  }
);

builder.mutationField("createStandardCategory", (t) =>
  t.prismaField({
    type: "StandardCategory",
    args: {
      input: t.arg({ type: CreateStandardCategoryInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const input = args.input;

      // Handle keywords JSON field with validation
      let keywordsJson = null;
      if (input.keywords) {
        const trimmedKeywords = input.keywords.trim();
        if (trimmedKeywords !== "") {
          try {
            keywordsJson = JSON.parse(trimmedKeywords);
          } catch (e) {
            throw new Error("Invalid JSON in keywords field");
          }
        }
      }

      return context.prisma.standardCategory.create({
        ...query,
        data: {
          code: input.code,
          name: input.name,
          ...(input.description !== undefined && {
            description: input.description,
          }),
          level: input.level as any,
          order: input.order ?? 0,
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.image !== undefined && { image: input.image }),
          ...(input.parentId !== undefined && { parentId: input.parentId }),
          ...(keywordsJson !== null && { keywords: keywordsJson }),
          ...(input.tags !== undefined && { tags: input.tags }),
          isActive: input.isActive ?? true,
          isPublic: input.isPublic ?? true,
          createdById: context.user!.id,
        },
      });
    },
  })
);

// Create Company Category
const CreateCompanyCategoryInput = builder.inputType(
  "CreateCompanyCategoryInput",
  {
    fields: (t) => ({
      name: t.string({ required: true }),
      description: t.string({ required: false }),
      type: t.string({ required: true }),
      standardCategoryId: t.int({ required: false }),
      internalCode: t.string({ required: false }),
      order: t.int({ required: false }),
      customFields: t.string({ required: false }),
    }),
  }
);

builder.mutationField("createCompanyCategory", (t) =>
  t.prismaField({
    type: "CompanyCategory",
    args: {
      input: t.arg({ type: CreateCompanyCategoryInput, required: true }),
    },
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      const input = args.input;

      let customFieldsJson = null;
      if (input.customFields) {
        try {
          customFieldsJson = JSON.parse(input.customFields);
        } catch (e) {
          throw new Error("Invalid JSON in customFields");
        }
      }

      return context.prisma.companyCategory.create({
        ...query,
        data: {
          name: input.name,
          description: input.description ?? null,
          type: input.type as any,
          companyId: context.user.companyId,
          standardCategoryId: input.standardCategoryId ?? null,
          internalCode: input.internalCode ?? null,
          order: input.order ?? 0,
          ...(customFieldsJson !== null && { customFields: customFieldsJson }),
          isActive: true,
          authorId: context.user.id,
        },
      });
    },
  })
);

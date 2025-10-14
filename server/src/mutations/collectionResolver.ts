import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { isManufacturer, requirePermission } from "../utils/permissions";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const collectionMutations = (t: any) => {
  // Create Collection
  t.field("createCollection", {
    type: "Collection",
    args: {
      input: nonNull("CreateCollectionInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Permission check: Admin or user with collections.create permission
      if (userRole !== "ADMIN") {
        requirePermission(user, "collections", "create");
      }

      // Must be from a manufacturer company or admin
      if (userRole !== "ADMIN" && !isManufacturer(user)) {
        throw new Error("Only manufacturers can create collections");
      }

      // For manufacturers, must use their own company
      let companyId = input.companyId;
      if (userRole !== "ADMIN") {
        if (!user.companyId) {
          throw new Error("Must be associated with a company");
        }
        companyId = user.companyId;
      }

      // Validate category if provided
      if (input.categoryId) {
        const category = await context.prisma.category.findUnique({
          where: { id: input.categoryId },
        });

        if (!category) {
          throw new Error("Category not found");
        }

        // Check category permissions for manufacturers
        if (
          userRole === "MANUFACTURER" &&
          category.companyId &&
          category.companyId !== user.companyId
        ) {
          throw new Error("Cannot use category from different company");
        }
      }

      // Generate SKU automatically
      const timestamp = Date.now().toString().slice(-6);
      const companyPrefix = companyId ? `C${companyId}` : "GL";
      const sku = `${companyPrefix}-${timestamp}`;

      // Generate slug from name automatically
      const slug =
        input.name
          .toLowerCase()
          .replace(/ı/g, "i")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") + `-${timestamp}`;

      // Generate Model Code if not provided (Auto mode)
      let modelCode = input.modelCode;
      if (!modelCode || modelCode.trim() === "") {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        modelCode = `COL-${year}-${randomNum}`;
      }

      // Parse and validate production schedule if provided
      let productionSchedule = null;
      if (input.productionSchedule) {
        try {
          const schedule = JSON.parse(input.productionSchedule);
          // Validate schedule has valid stages and numeric values
          const validStages = [
            "PLANNING",
            "FABRIC",
            "CUTTING",
            "SEWING",
            "QUALITY",
            "PACKAGING",
            "SHIPPING",
          ];
          for (const stage of Object.keys(schedule)) {
            if (!validStages.includes(stage)) {
              throw new Error(`Invalid stage: ${stage}`);
            }
            if (typeof schedule[stage] !== "number" || schedule[stage] < 0) {
              throw new Error(
                `Invalid days for ${stage}: must be a positive number`
              );
            }
          }
          productionSchedule = schedule;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Invalid production schedule: ${error.message}`);
          }
          throw new Error("Invalid production schedule format");
        }
      }

      // Create collection
      const collection = await context.prisma.collection.create({
        data: {
          name: input.name,
          description: input.description || null,

          // ADIM 1: Temel Bilgiler
          modelCode: modelCode,
          season: input.season || null,
          gender: input.gender || null,
          fit: input.fit || null,

          // ADIM 2: Varyantlar ve Ölçüler
          colors: input.colors ? JSON.stringify(input.colors) : null,
          sizeGroups: input.sizeGroupIds
            ? JSON.stringify(input.sizeGroupIds)
            : null,
          sizeRange: input.sizeRange || null,
          measurementChart: input.measurementChart || null,

          // ADIM 3: Teknik Detaylar
          fabricComposition: input.fabricComposition || null,
          accessories: input.accessories || null,
          images: input.images ? JSON.stringify(input.images) : null,
          techPack: input.techPack || null,

          // ADIM 4: Ticari Bilgiler
          moq: input.moq || null,
          targetPrice: input.targetPrice || null,
          targetLeadTime: input.targetLeadTime || null,
          notes: input.notes || null,

          // Legacy
          price: input.price || input.targetPrice || 0,
          sku,
          slug,
          stock: input.stock || 0,
          isActive: input.isActive !== undefined ? input.isActive : true,
          isFeatured: input.isFeatured || false,
          productionSchedule: productionSchedule,
          categoryId: input.categoryId || null,
          companyId: companyId || null,
          authorId: userId,
        },
      });

      return collection;
    },
  });

  // Update Collection
  t.field("updateCollection", {
    type: "Collection",
    args: {
      input: nonNull("UpdateCollectionInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Find existing collection
      const existingCollection = await context.prisma.collection.findUnique({
        where: { id: input.id },
      });

      if (!existingCollection) {
        throw new Error("Collection not found");
      }

      // Permission check: Admin or user with collections.edit permission
      if (userRole !== "ADMIN") {
        requirePermission(user, "collections", "edit");

        // Manufacturers can only edit their own collections or their company's collections
        if (
          existingCollection.authorId !== userId &&
          existingCollection.companyId !== user.companyId
        ) {
          throw new Error("Not authorized to update this collection");
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.price !== undefined) updateData.price = input.price;
      if (input.sku !== undefined) updateData.sku = input.sku;
      if (input.stock !== undefined) updateData.stock = input.stock;
      if (input.images !== undefined) {
        updateData.images = input.images ? JSON.stringify(input.images) : null;
      }
      if (input.sizeGroupIds !== undefined) {
        updateData.sizeGroups = input.sizeGroupIds
          ? JSON.stringify(input.sizeGroupIds)
          : null;
      }
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.isFeatured !== undefined)
        updateData.isFeatured = input.isFeatured;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.categoryId !== undefined)
        updateData.categoryId = input.categoryId;
      if (input.companyId !== undefined) updateData.companyId = input.companyId;

      // Handle production schedule update
      if (input.productionSchedule !== undefined) {
        if (input.productionSchedule) {
          try {
            const schedule = JSON.parse(input.productionSchedule);
            const validStages = [
              "PLANNING",
              "FABRIC",
              "CUTTING",
              "SEWING",
              "QUALITY",
              "PACKAGING",
              "SHIPPING",
            ];
            for (const stage of Object.keys(schedule)) {
              if (!validStages.includes(stage)) {
                throw new Error(`Invalid stage: ${stage}`);
              }
              if (typeof schedule[stage] !== "number" || schedule[stage] < 0) {
                throw new Error(`Invalid days for ${stage}`);
              }
            }
            updateData.productionSchedule = schedule;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(`Invalid production schedule: ${error.message}`);
            }
            throw new Error("Invalid production schedule format");
          }
        } else {
          updateData.productionSchedule = null;
        }
      }

      // Update collection
      const collection = await context.prisma.collection.update({
        where: { id: input.id },
        data: updateData,
      });

      return collection;
    },
  });

  // Delete Collection
  t.field("deleteCollection", {
    type: "Collection",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Find existing collection
      const existingCollection = await context.prisma.collection.findUnique({
        where: { id },
        include: {
          samples: true,
          orders: true,
        },
      });

      if (!existingCollection) {
        throw new Error("Collection not found");
      }

      // Permission check: Admin or user with collections.delete permission
      if (userRole !== "ADMIN") {
        requirePermission(user, "collections", "delete");

        // Manufacturers can only delete their own collections or their company's collections
        if (
          existingCollection.authorId !== userId &&
          existingCollection.companyId !== user.companyId
        ) {
          throw new Error("Not authorized to delete this collection");
        }
      }

      // Check if collection has orders (cannot delete if orders exist)
      if (existingCollection.orders.length > 0) {
        throw new Error(
          "Cannot delete collection with associated orders. Please cancel or delete orders first."
        );
      }

      // Delete associated samples first (cascade delete)
      if (existingCollection.samples.length > 0) {
        await context.prisma.sample.deleteMany({
          where: { collectionId: id },
        });
      }

      // Delete collection
      const deletedCollection = await context.prisma.collection.delete({
        where: { id },
      });

      return deletedCollection;
    },
  });
};

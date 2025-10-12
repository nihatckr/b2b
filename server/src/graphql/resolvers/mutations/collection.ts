import { booleanArg, floatArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const collectionMutations = (t: any) => {
  t.field("createCollection", {
    type: "Collection",
    args: {
      name: nonNull(stringArg()),
      description: stringArg(),
      price: nonNull(floatArg()),
      sku: nonNull(stringArg()),
      stock: intArg(),
      categoryId: intArg(),
      images: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Check if SKU already exists
      const existingSku = await context.prisma.collection.findUnique({
        where: { sku: args.sku },
      });

      if (existingSku) {
        throw new Error("SKU already exists. Please choose a different SKU.");
      }

      return context.prisma.collection.create({
        data: {
          name: args.name,
          description: args.description,
          price: args.price,
          sku: args.sku,
          stock: args.stock || 0,
          categoryId: args.categoryId,
          images: args.images,
          authorId: userId,
          isActive: true,
        },
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    },
  });

  t.field("updateCollection", {
    type: "Collection",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      description: stringArg(),
      price: floatArg(),
      sku: stringArg(),
      stock: intArg(),
      categoryId: intArg(),
      images: stringArg(),
      isActive: booleanArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Check if collection exists and user owns it
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.id },
      });

      if (!collection) {
        throw new Error("Collection not found.");
      }

      // Check ownership (non-admin users can only update their own collections)
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (currentUser?.role !== "ADMIN" && collection.authorId !== userId) {
        throw new Error("You can only update your own collections.");
      }

      // Check SKU uniqueness if being updated
      if (args.sku && args.sku !== collection.sku) {
        const existingSku = await context.prisma.collection.findUnique({
          where: { sku: args.sku },
        });

        if (existingSku) {
          throw new Error("SKU already exists. Please choose a different SKU.");
        }
      }

      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.description !== undefined)
        updateData.description = args.description;
      if (args.price !== undefined) updateData.price = args.price;
      if (args.sku !== undefined) updateData.sku = args.sku;
      if (args.stock !== undefined) updateData.stock = args.stock;
      if (args.categoryId !== undefined)
        updateData.categoryId = args.categoryId;
      if (args.images !== undefined) updateData.images = args.images;
      if (args.isActive !== undefined) updateData.isActive = args.isActive;

      return context.prisma.collection.update({
        where: { id: args.id },
        data: updateData,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    },
  });

  t.field("deleteCollection", {
    type: "Boolean",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Check if collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.id },
        include: {
          samples: true,
          orders: true,
        },
      });

      if (!collection) {
        throw new Error("Collection not found.");
      }

      // Check ownership (non-admin users can only delete their own collections)
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (currentUser?.role !== "ADMIN" && collection.authorId !== userId) {
        throw new Error("You can only delete your own collections.");
      }

      // Check if collection has active samples or orders
      if (collection.samples.length > 0) {
        throw new Error(
          "Cannot delete collection with existing samples. Complete or cancel samples first."
        );
      }

      if (collection.orders.length > 0) {
        throw new Error(
          "Cannot delete collection with existing orders. Complete or cancel orders first."
        );
      }

      await context.prisma.collection.delete({
        where: { id: args.id },
      });

      return true;
    },
  });
};

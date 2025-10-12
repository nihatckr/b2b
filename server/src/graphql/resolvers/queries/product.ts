import { arg, intArg, list, nonNull, queryField, stringArg } from "nexus";
import type { Context } from "../../../context";

// ================================
// ProductVariant Queries
// ================================

export const productVariants = queryField("productVariants", {
  type: nonNull(list(nonNull("ProductVariant"))),
  args: {
    collectionId: nonNull(intArg()),
  },
  resolve: async (_, { collectionId }, context: Context) => {
    return context.prisma.productVariant.findMany({
      where: {
        collectionId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
});

export const productVariant = queryField("productVariant", {
  type: "ProductVariant",
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    return context.prisma.productVariant.findUnique({
      where: { id },
    });
  },
});

export const productVariantsByFilters = queryField("productVariantsByFilters", {
  type: nonNull("ProductVariantConnection"),
  args: {
    filters: arg({ type: "ProductVariantFiltersInput" }),
    first: intArg(),
    after: stringArg(),
  },
  resolve: async (_, { filters, first = 20, after }, context: Context) => {
    const where: any = { isActive: true };

    if (filters?.collectionId) {
      where.collectionId = filters.collectionId;
    }
    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }
    if (filters?.size) {
      where.size = { contains: filters.size };
    }
    if (filters?.color) {
      where.color = { contains: filters.color };
    }
    if (filters?.material) {
      where.material = { contains: filters.material };
    }
    if (filters?.minPrice && filters?.maxPrice) {
      where.price = {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }
    if (filters?.inStock) {
      where.stockQuantity = { gt: 0 };
    }

    const variants = await context.prisma.productVariant.findMany({
      where,
      take: first + 1,
      cursor: after ? { id: parseInt(after) } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const hasNextPage = variants.length > first;
    const nodes = hasNextPage ? variants.slice(0, -1) : variants;

    return {
      edges: nodes.map((variant) => ({
        cursor: variant.id.toString(),
        node: variant,
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!after,
        startCursor: nodes[0]?.id.toString(),
        endCursor: nodes[nodes.length - 1]?.id.toString(),
      },
      totalCount: await context.prisma.productVariant.count({ where }),
    };
  },
});

// ================================
// OrderItem Queries
// ================================

export const orderItems = queryField("orderItems", {
  type: nonNull(list(nonNull("OrderItem"))),
  args: {
    orderId: nonNull(intArg()),
  },
  resolve: async (_, { orderId }, context: Context) => {
    return context.prisma.orderItem.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  },
});

export const orderItem = queryField("orderItem", {
  type: "OrderItem",
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    return context.prisma.orderItem.findUnique({
      where: { id },
    });
  },
});

// ================================
// SampleVariant Queries
// ================================

export const sampleVariants = queryField("sampleVariants", {
  type: nonNull(list(nonNull("SampleVariant"))),
  args: {
    sampleId: nonNull(intArg()),
  },
  resolve: async (_, { sampleId }, context: Context) => {
    return context.prisma.sampleVariant.findMany({
      where: { sampleId },
      orderBy: { createdAt: "desc" },
    });
  },
});

export const sampleVariant = queryField("sampleVariant", {
  type: "SampleVariant",
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    return context.prisma.sampleVariant.findUnique({
      where: { id },
    });
  },
});

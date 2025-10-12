import { arg, floatArg, intArg, mutationField, nonNull } from "nexus";
import type { Context } from "../../../context";

// ================================
// ProductVariant Mutations
// ================================

export const createProductVariant = mutationField("createProductVariant", {
  type: nonNull("ProductVariant"),
  args: {
    input: nonNull(arg({ type: "CreateProductVariantInput" })),
  },
  resolve: async (_, { input }, context: Context) => {
    // Get user's company ID
    const user = await context.prisma.user.findUnique({
      where: { id: context.userId },
      include: { company: true },
    });

    if (!user?.company) {
      throw new Error(
        "User must belong to a company to create product variants"
      );
    }

    // Validate collection belongs to same company
    const collection = await context.prisma.collection.findUnique({
      where: { id: input.collectionId },
    });

    if (collection?.companyId !== user.company.id) {
      throw new Error("Collection does not belong to your company");
    }

    return context.prisma.productVariant.create({
      data: {
        ...input,
        companyId: user.company.id,
        stockQuantity: input.stockQuantity || 0,
        reservedQuantity: 0,
        minOrderQuantity: input.minOrderQuantity || 1,
        isActive: input.isActive !== false,
        isAvailable: input.isAvailable !== false,
      },
    });
  },
});

export const updateProductVariant = mutationField("updateProductVariant", {
  type: nonNull("ProductVariant"),
  args: {
    id: nonNull(intArg()),
    input: nonNull(arg({ type: "UpdateProductVariantInput" })),
  },
  resolve: async (_, { id, input }, context: Context) => {
    // Verify ownership
    const variant = await context.prisma.productVariant.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    const user = await context.prisma.user.findUnique({
      where: { id: context.userId },
    });

    if (variant.companyId !== user?.companyId) {
      throw new Error(
        "Unauthorized: You can only update your own company's variants"
      );
    }

    return context.prisma.productVariant.update({
      where: { id },
      data: input,
    });
  },
});

export const deleteProductVariant = mutationField("deleteProductVariant", {
  type: nonNull("Boolean"),
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    // Verify ownership
    const variant = await context.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    const user = await context.prisma.user.findUnique({
      where: { id: context.userId },
    });

    if (variant.companyId !== user?.companyId) {
      throw new Error("Unauthorized");
    }

    // Check if variant has orders
    const orderItemCount = await context.prisma.orderItem.count({
      where: { productVariantId: id },
    });

    if (orderItemCount > 0) {
      // Soft delete - just mark as inactive
      await context.prisma.productVariant.update({
        where: { id },
        data: {
          isActive: false,
          isAvailable: false,
          discontinuedAt: new Date(),
        },
      });
    } else {
      // Hard delete if no orders
      await context.prisma.productVariant.delete({
        where: { id },
      });
    }

    return true;
  },
});

export const updateVariantStock = mutationField("updateVariantStock", {
  type: nonNull("ProductVariant"),
  args: {
    id: nonNull(intArg()),
    quantity: nonNull(intArg()),
  },
  resolve: async (_, { id, quantity }, context: Context) => {
    return context.prisma.productVariant.update({
      where: { id },
      data: { stockQuantity: quantity },
    });
  },
});

export const updateVariantPrice = mutationField("updateVariantPrice", {
  type: nonNull("ProductVariant"),
  args: {
    id: nonNull(intArg()),
    price: nonNull(floatArg()),
  },
  resolve: async (_, { id, price }, context: Context) => {
    return context.prisma.productVariant.update({
      where: { id },
      data: { price },
    });
  },
});

// ================================
// OrderItem Mutations
// ================================

export const addOrderItem = mutationField("addOrderItem", {
  type: nonNull("OrderItem"),
  args: {
    input: nonNull(arg({ type: "AddOrderItemInput" })),
  },
  resolve: async (_, { input }, context: Context) => {
    // Validate order ownership
    const order = await context.prisma.order.findUnique({
      where: { id: input.orderId },
      include: { customer: true, manufacture: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Check authorization
    const user = await context.prisma.user.findUnique({
      where: { id: context.userId },
    });

    if (order.customerId !== user?.id && order.manufactureId !== user?.id) {
      throw new Error("Unauthorized: You can only modify your own orders");
    }

    // Calculate totals
    const totalPrice = input.quantity * input.unitPrice;
    const discountAmount =
      input.discountAmount ||
      (input.discountPercent ? (totalPrice * input.discountPercent) / 100 : 0);
    const finalPrice = totalPrice - discountAmount;

    const orderItem = await context.prisma.orderItem.create({
      data: {
        orderId: input.orderId,
        productVariantId: input.productVariantId,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        totalPrice,
        discountPercent: input.discountPercent,
        discountAmount,
        finalPrice,
        itemNote: input.itemNote,
        companyId: order.companyId,
      },
    });

    // Update order total
    await updateOrderTotals(context, input.orderId);

    return orderItem;
  },
});

export const updateOrderItem = mutationField("updateOrderItem", {
  type: nonNull("OrderItem"),
  args: {
    id: nonNull(intArg()),
    input: nonNull(arg({ type: "UpdateOrderItemInput" })),
  },
  resolve: async (_, { id, input }, context: Context) => {
    const orderItem = await context.prisma.orderItem.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    // Calculate new totals if quantity or price changed
    const quantity = input.quantity || orderItem.quantity;
    const unitPrice = input.unitPrice || orderItem.unitPrice;
    const totalPrice = quantity * unitPrice;
    const discountAmount =
      input.discountAmount ||
      (input.discountPercent
        ? (totalPrice * input.discountPercent) / 100
        : orderItem.discountAmount);
    const finalPrice = totalPrice - (discountAmount || 0);

    const updated = await context.prisma.orderItem.update({
      where: { id },
      data: {
        ...input,
        totalPrice,
        finalPrice,
        discountAmount,
      },
    });

    // Update order total
    await updateOrderTotals(context, orderItem.orderId);

    return updated;
  },
});

export const removeOrderItem = mutationField("removeOrderItem", {
  type: nonNull("Boolean"),
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    const orderItem = await context.prisma.orderItem.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    await context.prisma.orderItem.delete({
      where: { id },
    });

    // Update order total
    await updateOrderTotals(context, orderItem.orderId);

    return true;
  },
});

// ================================
// SampleVariant Mutations
// ================================

export const createSampleVariant = mutationField("createSampleVariant", {
  type: nonNull("SampleVariant"),
  args: {
    input: nonNull(arg({ type: "CreateSampleVariantInput" })),
  },
  resolve: async (_, { input }, context: Context) => {
    // Validate sample ownership
    const sample = await context.prisma.sample.findUnique({
      where: { id: input.sampleId },
    });

    if (!sample) {
      throw new Error("Sample not found");
    }

    const user = await context.prisma.user.findUnique({
      where: { id: context.userId },
    });

    if (sample.customerId !== user?.id && sample.manufactureId !== user?.id) {
      throw new Error("Unauthorized");
    }

    const totalPrice = input.unitPrice
      ? (input.quantity || 1) * input.unitPrice
      : undefined;

    return context.prisma.sampleVariant.create({
      data: {
        sampleId: input.sampleId,
        productVariantId: input.productVariantId,
        quantity: input.quantity || 1,
        requestedColor: input.requestedColor,
        requestedSize: input.requestedSize,
        specialRequest: input.specialRequest,
        unitPrice: input.unitPrice,
        totalPrice,
        companyId: sample.companyId,
        status: "REQUESTED",
      },
    });
  },
});

export const updateSampleVariant = mutationField("updateSampleVariant", {
  type: nonNull("SampleVariant"),
  args: {
    id: nonNull(intArg()),
    input: nonNull(arg({ type: "UpdateSampleVariantInput" })),
  },
  resolve: async (_, { id, input }, context: Context) => {
    const sampleVariant = await context.prisma.sampleVariant.findUnique({
      where: { id },
      include: { sample: true },
    });

    if (!sampleVariant) {
      throw new Error("Sample variant not found");
    }

    // Calculate total price if needed
    const quantity = input.quantity || sampleVariant.quantity;
    const unitPrice = input.unitPrice || sampleVariant.unitPrice;
    const totalPrice = unitPrice ? quantity * unitPrice : undefined;

    return context.prisma.sampleVariant.update({
      where: { id },
      data: {
        ...input,
        totalPrice: totalPrice || input.totalPrice,
      },
    });
  },
});

export const deleteSampleVariant = mutationField("deleteSampleVariant", {
  type: nonNull("Boolean"),
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, context: Context) => {
    await context.prisma.sampleVariant.delete({
      where: { id },
    });
    return true;
  },
});

// ================================
// Utility Functions
// ================================

async function updateOrderTotals(context: Context, orderId: number) {
  const orderItems = await context.prisma.orderItem.findMany({
    where: { orderId },
  });

  const totalPrice = orderItems.reduce((sum, item) => sum + item.finalPrice, 0);

  await context.prisma.order.update({
    where: { id: orderId },
    data: { totalPrice },
  });
}

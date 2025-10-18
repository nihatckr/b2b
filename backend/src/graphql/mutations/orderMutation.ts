import builder from "../builder";

const ValidOrderStatuses = [
  "PENDING",
  "REVIEWED",
  "QUOTE_SENT",
  "CUSTOMER_QUOTE_SENT",
  "MANUFACTURER_REVIEWING_QUOTE",
  "CONFIRMED",
  "REJECTED",
  "REJECTED_BY_CUSTOMER",
  "REJECTED_BY_MANUFACTURER",
  "IN_PRODUCTION",
  "PRODUCTION_COMPLETE",
  "QUALITY_CHECK",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

// Create order (user only)
builder.mutationField("createOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      collectionId: t.arg.int({ required: true }),
      quantity: t.arg.int({ required: true }),
      unitPrice: t.arg.float({ required: true }),
      manufacturerId: t.arg.int({ required: true }),
      note: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const totalPrice = args.quantity * args.unitPrice;
      return context.prisma.order.create({
        ...query,
        data: {
          orderNumber: `ORDER-${Date.now()}`,
          collectionId: args.collectionId,
          quantity: args.quantity,
          unitPrice: args.unitPrice,
          totalPrice,
          ...(args.note !== null && args.note !== undefined
            ? { customerNote: args.note }
            : {}),
          customerId: context.user?.id || 0,
          manufactureId: args.manufacturerId,
          status: "PENDING" as any,
        },
      });
    },
  })
);

// Update order (owner or admin)
builder.mutationField("updateOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      quantity: t.arg.int(),
      unitPrice: t.arg.float(),
      status: t.arg.string(),
    },
    authScopes: { user: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) throw new Error("Order not found");
      if (
        order.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};
      if (args.quantity !== null && args.quantity !== undefined) {
        updateData.quantity = args.quantity;
        if (args.unitPrice !== null && args.unitPrice !== undefined) {
          updateData.unitPrice = args.unitPrice;
          updateData.totalPrice = args.quantity * args.unitPrice;
        }
      } else if (args.unitPrice !== null && args.unitPrice !== undefined) {
        updateData.unitPrice = args.unitPrice;
        updateData.totalPrice = order.quantity * args.unitPrice;
      }
      if (args.status !== null && args.status !== undefined) {
        if (!ValidOrderStatuses.includes(args.status)) {
          throw new Error(
            `Invalid status. Must be one of: ${ValidOrderStatuses.join(", ")}`
          );
        }
        updateData.status = args.status;
      }

      return context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Delete order (owner or admin)
builder.mutationField("deleteOrder", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true, admin: true },
    resolve: async (_root, args, context) => {
      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) throw new Error("Order not found");
      if (
        order.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.order.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

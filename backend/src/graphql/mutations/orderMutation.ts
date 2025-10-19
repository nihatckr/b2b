import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
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
      const order = await context.prisma.order.create({
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

      // ✅ Create tasks for PENDING status
      const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
      await dynamicTaskHelper.createTasksForOrderStatus(
        order.id,
        "PENDING",
        order.customerId,
        order.manufactureId
      );

      console.log(`✅ Order created: ${order.orderNumber} - Tasks created for PENDING status`);

      return order;
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

      // Customer Quote fields
      customerQuotedPrice: t.arg.float(),
      customerQuoteDays: t.arg.int(),
      customerQuoteNote: t.arg.string(),

      // Production fields
      productionDays: t.arg.int(),
      estimatedProductionDate: t.arg.string(), // ISO date string
      actualProductionStart: t.arg.string(),
      actualProductionEnd: t.arg.string(),

      // Shipping fields
      shippingDate: t.arg.string(),
      deliveryAddress: t.arg.string(),
      cargoTrackingNumber: t.arg.string(),

      // Notes
      customerNote: t.arg.string(),
      manufacturerResponse: t.arg.string(),
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

      // Price & Quantity
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

      // Status
      if (args.status !== null && args.status !== undefined) {
        if (!ValidOrderStatuses.includes(args.status)) {
          throw new Error(
            `Invalid status. Must be one of: ${ValidOrderStatuses.join(", ")}`
          );
        }
        updateData.status = args.status;
      }

      // Customer Quote fields
      if (args.customerQuotedPrice !== null && args.customerQuotedPrice !== undefined)
        updateData.customerQuotedPrice = args.customerQuotedPrice;
      if (args.customerQuoteDays !== null && args.customerQuoteDays !== undefined)
        updateData.customerQuoteDays = args.customerQuoteDays;
      if (args.customerQuoteNote !== null && args.customerQuoteNote !== undefined)
        updateData.customerQuoteNote = args.customerQuoteNote;

      // Production fields
      if (args.productionDays !== null && args.productionDays !== undefined)
        updateData.productionDays = args.productionDays;
      if (args.estimatedProductionDate !== null && args.estimatedProductionDate !== undefined)
        updateData.estimatedProductionDate = new Date(args.estimatedProductionDate);
      if (args.actualProductionStart !== null && args.actualProductionStart !== undefined)
        updateData.actualProductionStart = new Date(args.actualProductionStart);
      if (args.actualProductionEnd !== null && args.actualProductionEnd !== undefined)
        updateData.actualProductionEnd = new Date(args.actualProductionEnd);

      // Shipping fields
      if (args.shippingDate !== null && args.shippingDate !== undefined)
        updateData.shippingDate = new Date(args.shippingDate);
      if (args.deliveryAddress !== null && args.deliveryAddress !== undefined)
        updateData.deliveryAddress = args.deliveryAddress;
      if (args.cargoTrackingNumber !== null && args.cargoTrackingNumber !== undefined)
        updateData.cargoTrackingNumber = args.cargoTrackingNumber;

      // Notes
      if (args.customerNote !== null && args.customerNote !== undefined)
        updateData.customerNote = args.customerNote;
      if (args.manufacturerResponse !== null && args.manufacturerResponse !== undefined)
        updateData.manufacturerResponse = args.manufacturerResponse;

      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // ✅ Create tasks if status changed
      if (args.status !== null && args.status !== undefined && args.status !== order.status) {
        console.log(`📋 Order status changed: ${order.status} → ${args.status}`);

        const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);

        // Old tasks are auto-completed in createTasksForOrderStatus
        await dynamicTaskHelper.createTasksForOrderStatus(
          updatedOrder.id,
          args.status,
          updatedOrder.customerId,
          updatedOrder.manufactureId
        );

        console.log(`✅ Tasks created for order ${updatedOrder.orderNumber} - Status: ${args.status}`);
      }

      return updatedOrder;
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

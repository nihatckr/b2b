import { floatArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const orderMutations = (t: any) => {
  t.field("createOrder", {
    type: "Order",
    args: {
      collectionId: nonNull(intArg()),
      quantity: nonNull(intArg()),
      customerNote: stringArg(),
      deliveryAddress: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      if (args.quantity <= 0) {
        throw new Error("Quantity must be greater than 0.");
      }

      // Validate collection exists and is active
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        include: { author: true },
      });

      if (!collection || !collection.isActive) {
        throw new Error("Collection not found or not active.");
      }

      if (!collection.author) {
        throw new Error("Collection has no manufacturer assigned.");
      }

      // Customer cannot order from their own collection
      if (collection.authorId === userId) {
        throw new Error("You cannot order from your own collection.");
      }

      // Calculate prices
      const unitPrice = collection.price;
      const totalPrice = unitPrice * args.quantity;

      // Generate unique order number
      const orderCount = await context.prisma.order.count();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

      return context.prisma.order.create({
        data: {
          orderNumber,
          quantity: args.quantity,
          unitPrice,
          totalPrice,
          status: "PENDING",
          customerNote: args.customerNote,
          deliveryAddress: args.deliveryAddress,
          collectionId: args.collectionId,
          customerId: userId,
          manufactureId: collection.authorId!,
        },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    },
  });

  t.field("updateOrderStatus", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      status: nonNull(stringArg()),
      manufacturerResponse: stringArg(),
      productionDays: intArg(),
      unitPrice: floatArg(), // Manufacturer can adjust price when sending quote
      cargoTrackingNumber: stringArg(),
      note: stringArg(), // Production history note
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get order with permissions check
      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: {
          customer: true,
          manufacture: true,
        },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      // Check permissions: only manufacture can update status (except customer can cancel)
      const canUpdate =
        order.manufactureId === userId ||
        (order.customerId === userId && args.status === "CANCELLED");

      if (!canUpdate) {
        throw new Error("You don't have permission to update this order.");
      }

      // Validate status transition
      const validStatuses = [
        "PENDING",
        "REVIEWED",
        "QUOTE_SENT",
        "CONFIRMED",
        "REJECTED",
        "IN_PRODUCTION",
        "PRODUCTION_COMPLETE",
        "QUALITY_CHECK",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!validStatuses.includes(args.status)) {
        throw new Error("Invalid status.");
      }

      // Update data
      const updateData: any = {
        status: args.status,
        updatedAt: new Date(),
      };

      if (args.manufacturerResponse)
        updateData.manufacturerResponse = args.manufacturerResponse;
      if (args.productionDays) updateData.productionDays = args.productionDays;
      if (args.cargoTrackingNumber)
        updateData.cargoTrackingNumber = args.cargoTrackingNumber;

      // Update unit price and recalculate total price if provided (during QUOTE_SENT)
      if (args.unitPrice && args.status === "QUOTE_SENT") {
        updateData.unitPrice = args.unitPrice;
        updateData.totalPrice = args.unitPrice * order.quantity;
      }

      // Calculate estimated production date if production days provided
      if (args.productionDays && args.status === "QUOTE_SENT") {
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + args.productionDays);
        updateData.estimatedProductionDate = estimatedDate;
      }

      // Set actual dates for specific statuses
      if (args.status === "IN_PRODUCTION") {
        updateData.actualProductionStart = new Date();
      } else if (args.status === "PRODUCTION_COMPLETE") {
        updateData.actualProductionEnd = new Date();
      } else if (args.status === "SHIPPED") {
        updateData.shippingDate = new Date();
      }

      // Update order
      const updatedOrder = await context.prisma.order.update({
        where: { id: args.id },
        data: updateData,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create production history entry
      if (args.note || args.status) {
        await context.prisma.orderProduction.create({
          data: {
            orderId: args.id,
            status: args.status,
            note: args.note,
            estimatedDays: args.productionDays,
            actualDate: [
              "PRODUCTION_COMPLETE",
              "SHIPPED",
              "DELIVERED",
            ].includes(args.status)
              ? new Date()
              : undefined,
            updatedById: userId,
          },
        });
      }

      return updatedOrder;
    },
  });

  t.field("confirmOrder", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.customerId !== userId) {
        throw new Error("You can only confirm your own orders.");
      }

      if (order.status !== "QUOTE_SENT") {
        throw new Error("Order must be in QUOTE_SENT status to confirm.");
      }

      return context.prisma.order.update({
        where: { id: args.id },
        data: {
          status: "CONFIRMED",
          updatedAt: new Date(),
        },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    },
  });

  t.field("cancelOrder", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      reason: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      // Both customer and manufacture can cancel an order
      if (order.customerId !== userId && order.manufactureId !== userId) {
        throw new Error("You don't have permission to cancel this order.");
      }

      // Orders can only be cancelled if not yet in production
      if (
        [
          "IN_PRODUCTION",
          "PRODUCTION_COMPLETE",
          "QUALITY_CHECK",
          "SHIPPED",
          "DELIVERED",
        ].includes(order.status)
      ) {
        throw new Error(
          "Cannot cancel order that is in production or completed."
        );
      }

      const updatedOrder = await context.prisma.order.update({
        where: { id: args.id },
        data: {
          status: "CANCELLED",
          manufacturerResponse: args.reason,
          updatedAt: new Date(),
        },
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create production history entry
      await context.prisma.orderProduction.create({
        data: {
          orderId: args.id,
          status: "CANCELLED",
          note: args.reason || "Order cancelled",
          updatedById: userId,
        },
      });

      return updatedOrder;
    },
  });
};

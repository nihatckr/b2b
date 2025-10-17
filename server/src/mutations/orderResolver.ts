import { floatArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { createNotification } from "../utils/notificationHelper";
import { isBuyer, requirePermission } from "../utils/permissions";
import { TaskHelper } from "../utils/taskHelper";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const orderMutations = (t: any) => {
  // Create Order
  t.field("createOrder", {
    type: "Order",
    args: {
      collectionId: nonNull(intArg()),
      quantity: nonNull(intArg()),
      unitPrice: floatArg(),
      customerNote: "String",
      deliveryAddress: "String",
      estimatedDelivery: "DateTime",
      manufactureId: intArg(),
      companyId: intArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Permission check: Admin, customers/buyers can create orders
      if (userRole !== "ADMIN") {
        // Check if user has permission or is from a buyer company
        if (!isBuyer(user)) {
          requirePermission(user, "orders", "create");
        }
      }

      // Validate collection
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        include: {
          author: true,
          company: true,
          category: true,
        },
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Determine manufacturer
      let manufactureId = args.manufactureId;
      let companyId = args.companyId;

      if (!manufactureId && collection.authorId) {
        manufactureId = collection.authorId;
        companyId = collection.companyId || undefined;
      }

      if (!manufactureId) {
        throw new Error(
          "Manufacturer must be specified or collection must have an author"
        );
      }

      // Generate unique order number
      const timestamp = Date.now();
      const orderNumber = `ORD-${timestamp}`;

      // Calculate total price
      const unitPrice = args.unitPrice || collection.price;
      const totalPrice = unitPrice * args.quantity;

      // Create order
      const order = await context.prisma.order.create({
        data: {
          orderNumber,
          quantity: args.quantity,
          unitPrice,
          totalPrice,
          status: "PENDING",
          customerNote: args.customerNote || null,
          deliveryAddress: args.deliveryAddress || null,
          collectionId: args.collectionId,
          customerId: userId,
          manufactureId,
          companyId: companyId || null,
        },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create initial production history
      await context.prisma.orderProduction.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          note: "Order created",
          updatedById: userId,
        },
      });

      // Send notification to manufacturer
      await createNotification(context.prisma, {
        type: "ORDER",
        title: "🎉 New Order Received",
        message: `You have received a new order #${orderNumber} for ${args.quantity} units of "${collection.name}". Please review and respond.`,
        userId: manufactureId,
        link: `/dashboard/orders/${order.id}`,
        orderId: order.id,
      });

      // Also notify company members if exists
      if (companyId) {
        const companyMembers = await context.prisma.user.findMany({
          where: {
            companyId: companyId,
            role: {
              in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"],
            },
            id: { not: manufactureId }, // Don't send duplicate
          },
          select: { id: true },
        });

        for (const member of companyMembers) {
          await createNotification(context.prisma, {
            type: "ORDER",
            title: "🎉 New Order Received",
            message: `Your company received a new order #${orderNumber} for ${args.quantity} units of "${collection.name}".`,
            userId: member.id,
            link: `/dashboard/orders/${order.id}`,
            orderId: order.id,
          });
        }
      }

      // AUTO-CREATE TASKS for order workflow
      const taskHelper = new TaskHelper(context.prisma);
      await taskHelper.createOrderTasks(
        order.id,
        userId, // customerId
        manufactureId,
        args.collectionId
      );

      return order;
    },
  });

  // Update Order Status
  t.field("updateOrderStatus", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      status: nonNull("OrderStatus"),
      note: "String",
      estimatedDays: intArg(),
      quotedPrice: floatArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const existingOrder = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Permission check
      const isManufacture = existingOrder.manufactureId === userId;
      const isCustomer = existingOrder.customerId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isManufacture && !isCustomer && !isAdmin) {
        throw new Error("Not authorized to update this order");
      }

      // Permission-based checks
      if (!isAdmin) {
        // Manufacturer updates (QUOTE_SENT, IN_PRODUCTION, etc.)
        if (isManufacture) {
          if (args.status === "QUOTE_SENT") {
            requirePermission(user, "orders", "sendQuote");
          } else {
            requirePermission(user, "orders", "updateStatus");
          }
        }

        // Customer can only CONFIRMED or REJECTED from QUOTE_SENT
        if (isCustomer) {
          if (
            existingOrder.status !== "QUOTE_SENT" ||
            (args.status !== "CONFIRMED" && args.status !== "REJECTED")
          ) {
            throw new Error("Customers can only confirm or reject quotes");
          }
          requirePermission(user, "orders", "confirm");
        }
      }

      const updateData: any = {
        status: args.status,
      };

      // Handle QUOTE_SENT status
      if (args.status === "QUOTE_SENT") {
        if (args.estimatedDays) {
          updateData.productionDays = args.estimatedDays;
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + args.estimatedDays);
          updateData.estimatedProductionDate = estimatedDate;
        }
        if (args.quotedPrice) {
          updateData.unitPrice = args.quotedPrice;
          updateData.totalPrice = args.quotedPrice * existingOrder.quantity;
        }
      }

      // Update order
      const order = await context.prisma.order.update({
        where: { id: args.id },
        data: updateData,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history
      await context.prisma.orderProduction.create({
        data: {
          orderId: order.id,
          status: args.status,
          note: args.note || `Status updated to ${args.status}`,
          estimatedDays: args.estimatedDays || null,
          actualDate: new Date(),
          updatedById: userId,
        },
      });

      // Auto-complete related tasks when order status changes to completion statuses
      const taskHelper = new TaskHelper(context.prisma);
      if (
        args.status === "DELIVERED" ||
        args.status === "COMPLETED" ||
        args.status === "CANCELLED"
      ) {
        await taskHelper.completeRelatedTasks(undefined, order.id);
      }

      // Send notifications based on status change
      const statusMessages: Record<
        string,
        { title: string; customerMsg: string; manufacturerMsg?: string }
      > = {
        QUOTE_SENT: {
          title: "💰 Quote Received",
          customerMsg: `Manufacturer has sent a quote for order #${
            order.orderNumber
          }. ${
            args.estimatedDays
              ? `Estimated delivery: ${args.estimatedDays} days.`
              : ""
          } Please review and confirm.`,
          manufacturerMsg: `You sent a quote for order #${order.orderNumber}.`,
        },
        CONFIRMED: {
          title: "✅ Order Confirmed",
          customerMsg: `Your order #${order.orderNumber} has been confirmed and production will begin soon.`,
          manufacturerMsg: `Order #${order.orderNumber} has been confirmed by customer. You can start production.`,
        },
        REJECTED: {
          title: "❌ Order Rejected",
          customerMsg: `Order #${order.orderNumber} has been rejected.`,
          manufacturerMsg: `Customer rejected order #${order.orderNumber}.`,
        },
        IN_PRODUCTION: {
          title: "🏭 Production Started",
          customerMsg: `Your order #${order.orderNumber} is now in production.`,
          manufacturerMsg: `Production started for order #${order.orderNumber}.`,
        },
        QUALITY_CHECK: {
          title: "✔️ Quality Check",
          customerMsg: `Order #${order.orderNumber} is undergoing quality inspection.`,
        },
        SHIPPED: {
          title: "📦 Order Shipped",
          customerMsg: `Your order #${order.orderNumber} has been shipped! ${
            order.cargoTrackingNumber
              ? `Tracking: ${order.cargoTrackingNumber}`
              : ""
          }`,
          manufacturerMsg: `Order #${order.orderNumber} has been shipped.`,
        },
        DELIVERED: {
          title: "🎉 Order Delivered",
          customerMsg: `Order #${order.orderNumber} has been delivered. Thank you!`,
          manufacturerMsg: `Order #${order.orderNumber} delivered successfully.`,
        },
        CANCELLED: {
          title: "🚫 Order Cancelled",
          customerMsg: `Order #${order.orderNumber} has been cancelled.`,
          manufacturerMsg: `Order #${order.orderNumber} was cancelled.`,
        },
      };

      const notificationData = statusMessages[args.status];

      if (notificationData) {
        // Notify customer
        if (isManufacture && notificationData.customerMsg) {
          await createNotification(context.prisma, {
            type: "ORDER",
            title: notificationData.title,
            message: notificationData.customerMsg,
            userId: order.customerId,
            link: `/dashboard/orders/${order.id}`,
            orderId: order.id,
          });
        }

        // Notify manufacturer
        if (isCustomer && notificationData.manufacturerMsg) {
          await createNotification(context.prisma, {
            type: "ORDER",
            title: notificationData.title,
            message: notificationData.manufacturerMsg,
            userId: order.manufactureId,
            link: `/dashboard/orders/${order.id}`,
            orderId: order.id,
          });

          // Also notify company members
          if (order.companyId) {
            const companyMembers = await context.prisma.user.findMany({
              where: {
                companyId: order.companyId,
                role: { in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"] },
                id: { not: order.manufactureId },
              },
              select: { id: true },
            });

            for (const member of companyMembers) {
              await createNotification(context.prisma, {
                type: "ORDER",
                title: notificationData.title,
                message: notificationData.manufacturerMsg,
                userId: member.id,
                link: `/dashboard/orders/${order.id}`,
                orderId: order.id,
              });
            }
          }
        }
      }

      // Auto-create Production Tracking when order is CONFIRMED
      if (args.status === "CONFIRMED") {
        const existingTracking =
          await context.prisma.productionTracking.findFirst({
            where: { orderId: order.id },
          });

        if (!existingTracking) {
          // Get collection for production schedule
          const orderWithCollection = await context.prisma.order.findUnique({
            where: { id: order.id },
            include: { collection: true },
          });

          const productionSchedule =
            orderWithCollection?.collection?.productionSchedule;

          // Calculate total days and dates
          let totalDays = orderWithCollection?.productionDays || 25; // Default 25 days
          if (productionSchedule) {
            const schedule =
              typeof productionSchedule === "string"
                ? JSON.parse(productionSchedule)
                : productionSchedule;
            totalDays = Object.values(
              schedule as Record<string, number>
            ).reduce((sum: number, days: number) => sum + days, 0);
          }

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + totalDays);

          // Create production tracking
          const productionTracking =
            await context.prisma.productionTracking.create({
              data: {
                orderId: order.id,
                currentStage: "PLANNING",
                overallStatus: "IN_PROGRESS",
                progress: 0,
                estimatedStartDate: startDate,
                estimatedEndDate: endDate,
                actualStartDate: startDate,
                notes:
                  "Production tracking auto-created from order confirmation",
                companyId: order.companyId || undefined,
              },
            });

          // Create stage updates from production schedule
          if (productionSchedule) {
            const schedule =
              typeof productionSchedule === "string"
                ? JSON.parse(productionSchedule)
                : productionSchedule;

            const stages = [
              "PLANNING",
              "FABRIC",
              "CUTTING",
              "SEWING",
              "QUALITY",
              "PACKAGING",
              "SHIPPING",
            ];

            for (const stage of stages) {
              const estimatedDays = (schedule as any)[stage] || 0;
              if (estimatedDays > 0) {
                await context.prisma.productionStageUpdate.create({
                  data: {
                    productionId: productionTracking.id,
                    stage: stage as any,
                    status:
                      stage === "PLANNING" ? "IN_PROGRESS" : "NOT_STARTED",
                    estimatedDays,
                    notes:
                      stage === "PLANNING"
                        ? `Production started automatically`
                        : `Estimated: ${estimatedDays} days`,
                  },
                });
              }
            }
          }
        }
      }

      return order;
    },
  });

  // Update Order (Manufacturer Response & Details)
  t.field("updateOrder", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      status: "OrderStatus",
      manufacturerResponse: stringArg(),
      productionDays: intArg(),
      estimatedProductionDate: "DateTime",
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const existingOrder = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: {
          manufacture: true,
        },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Permission check - Only manufacturer can update order details
      const isManufacturer =
        existingOrder.manufactureId === userId ||
        (user.companyId &&
          existingOrder.manufacture?.companyId === user.companyId);
      const isAdmin = userRole === "ADMIN";

      if (!isManufacturer && !isAdmin) {
        throw new Error("Only manufacturer can update order details");
      }

      const updateData: any = {};

      if (args.status) updateData.status = args.status;
      if (args.manufacturerResponse !== undefined)
        updateData.manufacturerResponse = args.manufacturerResponse;
      if (args.productionDays) updateData.productionDays = args.productionDays;
      if (args.estimatedProductionDate)
        updateData.estimatedProductionDate = args.estimatedProductionDate;

      // Update order
      return context.prisma.order.update({
        where: { id: args.id },
        data: updateData,
        include: {
          collection: true,
          customer: true,
          manufacture: {
            include: {
              company: true,
            },
          },
          company: true,
        },
      });
    },
  });

  // Update Customer Order (Before Manufacturer Approval)
  t.field("updateCustomerOrder", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      quantity: intArg(),
      unitPrice: floatArg(),
      customerNote: stringArg(),
      deliveryAddress: stringArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const existingOrder = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Permission check - Only customer can update their own order
      const isCustomer = existingOrder.customerId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isAdmin) {
        throw new Error("Not authorized to update this order");
      }

      // Can only update if in PENDING or REVIEWED status
      if (
        existingOrder.status !== "PENDING" &&
        existingOrder.status !== "REVIEWED"
      ) {
        throw new Error(
          "Can only update orders in PENDING or REVIEWED status (before manufacturer approval)"
        );
      }

      const updateData: any = {};

      if (args.quantity) {
        updateData.quantity = args.quantity;
        // Recalculate total price if quantity changes
        updateData.totalPrice =
          args.quantity * (args.unitPrice || existingOrder.unitPrice);
      }
      if (args.unitPrice) {
        updateData.unitPrice = args.unitPrice;
        updateData.totalPrice =
          (args.quantity || existingOrder.quantity) * args.unitPrice;
      }
      if (args.customerNote !== undefined)
        updateData.customerNote = args.customerNote;
      if (args.deliveryAddress !== undefined)
        updateData.deliveryAddress = args.deliveryAddress;

      // Update order
      const order = await context.prisma.order.update({
        where: { id: args.id },
        data: updateData,
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history
      await context.prisma.orderProduction.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: "Customer updated order details",
          updatedById: userId,
        },
      });

      return order;
    },
  });

  // Cancel Order
  t.field("cancelOrder", {
    type: "Order",
    args: {
      id: nonNull(intArg()),
      reason: stringArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const existingOrder = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Permission check
      const isCustomer = existingOrder.customerId === userId;
      const isManufacturer = existingOrder.manufactureId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isManufacturer && !isAdmin) {
        throw new Error("Not authorized to cancel this order");
      }

      // Customer can cancel before CONFIRMED, Manufacturer can cancel before IN_PRODUCTION
      if (!isAdmin) {
        if (isCustomer) {
          if (
            existingOrder.status !== "PENDING" &&
            existingOrder.status !== "REVIEWED" &&
            existingOrder.status !== "QUOTE_SENT"
          ) {
            throw new Error(
              "Customer can only cancel orders before confirmation (PENDING, REVIEWED, QUOTE_SENT)"
            );
          }
        }

        if (isManufacturer) {
          if (
            existingOrder.status === "IN_PRODUCTION" ||
            existingOrder.status === "PRODUCTION_COMPLETE" ||
            existingOrder.status === "QUALITY_CHECK" ||
            existingOrder.status === "SHIPPED" ||
            existingOrder.status === "DELIVERED"
          ) {
            throw new Error("Cannot cancel order after production has started");
          }
        }
      }

      // Update order status to CANCELLED
      const order = await context.prisma.order.update({
        where: { id: args.id },
        data: { status: "CANCELLED" },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Create production history
      await context.prisma.orderProduction.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          note:
            args.reason ||
            `Order cancelled by ${isCustomer ? "customer" : "manufacturer"}`,
          updatedById: userId,
        },
      });

      return order;
    },
  });

  // Delete Order
  t.field("deleteOrder", {
    type: "Order",
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

      const existingOrder = await context.prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Permission check
      const isCustomer = existingOrder.customerId === userId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isAdmin) {
        throw new Error("Not authorized to delete this order");
      }

      // Can only delete if in PENDING, REVIEWED, or REJECTED status (unless admin)
      if (!isAdmin) {
        if (
          existingOrder.status !== "PENDING" &&
          existingOrder.status !== "REVIEWED" &&
          existingOrder.status !== "REJECTED"
        ) {
          throw new Error(
            "Can only delete orders in PENDING, REVIEWED, or REJECTED status"
          );
        }
      }

      // Delete production history first
      await context.prisma.orderProduction.deleteMany({
        where: { orderId: id },
      });

      // Delete production tracking if exists
      await context.prisma.productionTracking.deleteMany({
        where: { orderId: id },
      });

      // Delete order
      const deletedOrder = await context.prisma.order.delete({
        where: { id },
      });

      return deletedOrder;
    },
  });
};

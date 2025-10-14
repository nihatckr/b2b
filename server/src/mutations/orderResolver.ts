import { floatArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { isBuyer, requirePermission } from "../utils/permissions";
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
        include: { author: true, company: true },
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
          estimatedDelivery: args.estimatedDelivery || null,
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

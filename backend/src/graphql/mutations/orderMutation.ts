import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
import builder from "../builder";

// Create Order input type
const CreateOrderInput = builder.inputType("CreateOrderInput", {
  fields: (t) => ({
    collectionId: t.id({ required: true }),
    quantity: t.int({ required: true }),
    targetDeadline: t.string({ required: false }),
    targetPrice: t.float({ required: false }),
    currency: t.string({ required: false }),
    notes: t.string({ required: false }),
  }),
});

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

// Create order with input type (user only)
builder.mutationField("createOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      input: t.arg({ type: CreateOrderInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _, { input }, { user, prisma }) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      // Get user's company information from database
      const userWithCompany = await prisma.user.findUnique({
        where: { id: user.id },
        include: { company: true },
      });

      if (!userWithCompany) {
        throw new Error("User not found");
      }

      // Debug user and company info
      console.log("User info:", {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
        company: userWithCompany.company,
      });

      // Verify user is a buyer - only check company type
      const isBuyer = userWithCompany.company?.type === "BUYER";

      if (!isBuyer) {
        throw new Error(
          `Only buyers can create orders. Your company type: ${userWithCompany.company?.type} (expected: BUYER)`
        );
      }

      // Get collection details
      const collection = await prisma.collection.findUnique({
        where: { id: Number(input.collectionId) },
        include: {
          company: true,
        },
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Debug collection info
      console.log("Collection info:", {
        id: collection.id,
        name: collection.name,
        companyId: collection.companyId,
        company: collection.company,
        ownerId: collection.company?.ownerId,
      });

      // Find manufacturer (company owner or first employee)
      let manufacturerId = collection.company?.ownerId;

      if (!manufacturerId) {
        // If company has no owner, find the first employee with COMPANY_OWNER role
        const companyOwner = await prisma.user.findFirst({
          where: {
            companyId: collection.companyId,
            role: "COMPANY_OWNER",
            isActive: true,
          },
        });

        if (companyOwner) {
          manufacturerId = companyOwner.id;
        } else {
          // Fallback: use first active employee
          const firstEmployee = await prisma.user.findFirst({
            where: {
              companyId: collection.companyId,
              isActive: true,
            },
          });

          if (!firstEmployee) {
            throw new Error("Collection company has no active users");
          }
          manufacturerId = firstEmployee.id;
        }
      }

      console.log("Manufacturer ID found:", manufacturerId);

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${collection.id}`;

      // Create the order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          collectionId: collection.id,
          customerId: user.id,
          manufactureId: manufacturerId,
          companyId: user.companyId,
          quantity: input.quantity,
          unitPrice: input.targetPrice || 0,
          totalPrice: (input.targetPrice || 0) * input.quantity,
          customerQuotedPrice: input.targetPrice,
          customerQuoteNote: input.notes,
          customerQuoteSentAt: new Date(),
          status: "PENDING",
        },
        include: {
          collection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
      });

      // Initialize Dynamic Task Helper
      const taskHelper = new DynamicTaskHelper(prisma);

      // Create tasks for ORDER status change
      await taskHelper.createTasksForOrderStatus(
        order.id,
        "PENDING",
        user.id, // customer
        collection.company.ownerId // manufacturer
      );

      // Create notification for manufacturer (in addition to dynamic tasks)

      await prisma.notification.create({
        data: {
          userId: manufacturerId!,
          type: "ORDER",
          title: "New Order Created",
          message: `A new order (${order.orderNumber}) has been created for your collection "${collection.name}".`,
          link: `/dashboard/orders/${order.id}`,
        },
      });

      console.log(
        `✅ Notification created for manufacturer (User ID: ${manufacturerId})`
      );

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
      if (
        args.customerQuotedPrice !== null &&
        args.customerQuotedPrice !== undefined
      )
        updateData.customerQuotedPrice = args.customerQuotedPrice;
      if (
        args.customerQuoteDays !== null &&
        args.customerQuoteDays !== undefined
      )
        updateData.customerQuoteDays = args.customerQuoteDays;
      if (
        args.customerQuoteNote !== null &&
        args.customerQuoteNote !== undefined
      )
        updateData.customerQuoteNote = args.customerQuoteNote;

      // Production fields
      if (args.productionDays !== null && args.productionDays !== undefined)
        updateData.productionDays = args.productionDays;
      if (
        args.estimatedProductionDate !== null &&
        args.estimatedProductionDate !== undefined
      )
        updateData.estimatedProductionDate = new Date(
          args.estimatedProductionDate
        );
      if (
        args.actualProductionStart !== null &&
        args.actualProductionStart !== undefined
      )
        updateData.actualProductionStart = new Date(args.actualProductionStart);
      if (
        args.actualProductionEnd !== null &&
        args.actualProductionEnd !== undefined
      )
        updateData.actualProductionEnd = new Date(args.actualProductionEnd);

      // Shipping fields
      if (args.shippingDate !== null && args.shippingDate !== undefined)
        updateData.shippingDate = new Date(args.shippingDate);
      if (args.deliveryAddress !== null && args.deliveryAddress !== undefined)
        updateData.deliveryAddress = args.deliveryAddress;
      if (
        args.cargoTrackingNumber !== null &&
        args.cargoTrackingNumber !== undefined
      )
        updateData.cargoTrackingNumber = args.cargoTrackingNumber;

      // Notes
      if (args.customerNote !== null && args.customerNote !== undefined)
        updateData.customerNote = args.customerNote;
      if (
        args.manufacturerResponse !== null &&
        args.manufacturerResponse !== undefined
      )
        updateData.manufacturerResponse = args.manufacturerResponse;

      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // ✅ Create tasks if status changed
      if (
        args.status !== null &&
        args.status !== undefined &&
        args.status !== order.status
      ) {
        console.log(
          `📋 Order status changed: ${order.status} → ${args.status}`
        );

        const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);

        // Old tasks are auto-completed in createTasksForOrderStatus
        await dynamicTaskHelper.createTasksForOrderStatus(
          updatedOrder.id,
          args.status,
          updatedOrder.customerId,
          updatedOrder.manufactureId
        );

        console.log(
          `✅ Tasks created for order ${updatedOrder.orderNumber} - Status: ${args.status}`
        );
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

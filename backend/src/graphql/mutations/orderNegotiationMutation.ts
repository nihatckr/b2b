import prisma from '../../../lib/prisma';
import { publishNotification } from '../../utils/publishHelpers';
import builder from '../builder';


// Input types
const SendOrderOfferInput = builder.inputType("SendOrderOfferInput", {
  fields: (t) => ({
    orderId: t.int({ required: true }),
    unitPrice: t.float({ required: true }),
    productionDays: t.int({ required: true }),
    quantity: t.int({ required: false }),
    message: t.string({ required: false }),
  }),
});

const RespondToOfferInput = builder.inputType("RespondToOfferInput", {
  fields: (t) => ({
    negotiationId: t.int({ required: true }),
    accepted: t.boolean({ required: true }),
  }),
});

// OrderNegotiation type
builder.prismaObject("OrderNegotiation", {
  fields: (t) => ({
    id: t.exposeID("id"),
    orderId: t.exposeInt("orderId"),
    senderId: t.exposeInt("senderId"),
    senderRole: t.exposeString("senderRole"),
    unitPrice: t.exposeFloat("unitPrice"),
    productionDays: t.exposeInt("productionDays"),
    quantity: t.exposeInt("quantity", { nullable: true }),
    currency: t.exposeString("currency"),
    message: t.exposeString("message", { nullable: true }),
    status: t.exposeString("status"),
    respondedAt: t.expose("respondedAt", { type: "DateTime", nullable: true }),
    respondedBy: t.exposeInt("respondedBy", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    order: t.relation("order"),
    sender: t.relation("sender"),
    responder: t.relation("responder", { nullable: true }),
  }),
});

// Mutations
builder.mutationField("sendOrderOffer", (t) =>
  t.prismaField({
    type: "OrderNegotiation",
    args: {
      input: t.arg({ type: SendOrderOfferInput, required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const { orderId, unitPrice, productionDays, quantity, message } = args.input;

      // Get order to check permissions
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          collection: { include: { company: true } },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Determine sender role
      let senderRole: string = "CUSTOMER"; // Default value
      let hasPermission = false;

      if (order.customerId === ctx.user.id) {
        senderRole = "CUSTOMER";
        hasPermission = true;
      } else if (order.collection?.companyId === ctx.user.companyId) {
        senderRole = "MANUFACTURER";
        hasPermission = true;
      } else if (ctx.user.role === "ADMIN") {
        // Admin can send on behalf of either party
        senderRole = "MANUFACTURER"; // Default to manufacturer
        hasPermission = true;
      }

      if (!hasPermission) {
        throw new Error("You don't have permission to send offers for this order");
      }

      // Mark all previous pending offers as SUPERSEDED
      await prisma.orderNegotiation.updateMany({
        where: {
          orderId,
          status: "PENDING",
        },
        data: {
          status: "SUPERSEDED",
        },
      });

      // Create new offer
      const negotiation = await prisma.orderNegotiation.create({
        ...query,
        data: {
          orderId,
          senderId: ctx.user.id,
          senderRole,
          unitPrice,
          productionDays,
          quantity: quantity || order.quantity,
          message: message ?? null,
          status: "PENDING",
        },
      });

      // Update order status based on sender
      if (senderRole === "MANUFACTURER") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "QUOTE_SENT",
            unitPrice,
            productionDays,
            manufacturerResponse: message ?? null,
          },
        });

        // Notification to customer
        const customerNotif = await prisma.notification.create({
          data: {
            userId: order.customerId,
            title: "🎯 Yeni Teklif Aldınız",
            message: `${order.collection?.company?.name || "Üretici"} siparişiniz için teklif gönderdi. Birim fiyat: $${unitPrice}, Üretim süresi: ${productionDays} gün`,
            type: "ORDER",
            orderId: orderId,
            link: `/dashboard/orders/${orderId}`,
          },
        });
        await publishNotification(customerNotif);
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "CUSTOMER_QUOTE_SENT",
            customerQuotedPrice: unitPrice,
            customerQuoteDays: productionDays,
            customerQuoteNote: message ?? null,
            customerQuoteSentAt: new Date(),
          },
        });

        // Notification to manufacturer company users
        if (order.collection?.companyId) {
          const companyUsers = await prisma.user.findMany({
            where: { companyId: order.collection.companyId },
          });

          for (const user of companyUsers) {
            const notif = await prisma.notification.create({
              data: {
                userId: user.id,
                title: "📦 Sipariş Teklifi Aldınız",
                message: `${order.customer.name} sizden teklif istedi. Sipariş No: ${order.orderNumber}, Adet: ${quantity || order.quantity}`,
                type: "ORDER",
                orderId: orderId,
                link: `/dashboard/orders/${orderId}`,
              },
            });
            await publishNotification(notif);
          }
        }
      }

      return negotiation;
    },
  })
);

builder.mutationField("respondToOrderOffer", (t) =>
  t.prismaField({
    type: "OrderNegotiation",
    args: {
      input: t.arg({ type: RespondToOfferInput, required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      const { negotiationId, accepted } = args.input;

      // Get negotiation with order details
      const negotiation = await prisma.orderNegotiation.findUnique({
        where: { id: negotiationId },
        include: {
          order: {
            include: {
              customer: true,
              collection: { include: { company: true } },
            },
          },
        },
      });

      if (!negotiation) {
        throw new Error("Negotiation not found");
      }

      if (negotiation.status !== "PENDING") {
        throw new Error("This offer has already been responded to");
      }

      // Check if user is the receiver (opposite of sender)
      let hasPermission = false;
      const order = negotiation.order;

      if (negotiation.senderRole === "CUSTOMER") {
        // Manufacturer should respond
        hasPermission = order.collection?.companyId === ctx.user.companyId || ctx.user.role === "ADMIN";
      } else {
        // Customer should respond
        hasPermission = order.customerId === ctx.user.id || ctx.user.role === "ADMIN";
      }

      if (!hasPermission) {
        throw new Error("You don't have permission to respond to this offer");
      }

      // Update negotiation
      const updatedNegotiation = await prisma.orderNegotiation.update({
        ...query,
        where: { id: negotiationId },
        data: {
          status: accepted ? "ACCEPTED" : "REJECTED",
          respondedAt: new Date(),
          respondedBy: ctx.user.id,
        },
      });

      // If accepted, update order with agreed terms
      if (accepted) {
        await prisma.order.update({
          where: { id: negotiation.orderId },
          data: {
            status: "CONFIRMED",
            negotiationStatus: "AGREED",
            agreedPrice: negotiation.unitPrice,
            agreedDays: negotiation.productionDays,
            agreedQuantity: negotiation.quantity,
            agreedAt: new Date(),
            unitPrice: negotiation.unitPrice,
            totalPrice: negotiation.unitPrice * (negotiation.quantity || order.quantity),
            productionDays: negotiation.productionDays,
          },
        });
      } else {
        // If rejected, set status back to allow new offers
        const newStatus = negotiation.senderRole === "CUSTOMER"
          ? "QUOTE_SENT"
          : "CUSTOMER_QUOTE_SENT";

        await prisma.order.update({
          where: { id: negotiation.orderId },
          data: {
            status: newStatus,
          },
        });
      }

      return updatedNegotiation;
    },
  })
);

// Query to get negotiations for an order
builder.queryField("orderNegotiations", (t) =>
  t.prismaField({
    type: ["OrderNegotiation"],
    args: {
      orderId: t.arg.int({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Get order to check permissions
      const order = await prisma.order.findUnique({
        where: { id: args.orderId },
        include: {
          customer: true,
          collection: { include: { company: true } },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check permission
      let hasAccess = false;
      if (ctx.user.role === "ADMIN") {
        hasAccess = true;
      } else if (order.customerId === ctx.user.id) {
        hasAccess = true;
      } else if (order.collection?.companyId === ctx.user.companyId) {
        hasAccess = true;
      }

      if (!hasAccess) {
        throw new Error("You don't have permission to view negotiations for this order");
      }

      // Get all negotiations, ordered by creation date
      return prisma.orderNegotiation.findMany({
        ...query,
        where: {
          orderId: args.orderId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    },
  })
);

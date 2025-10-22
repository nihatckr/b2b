import { DynamicTaskHelper } from "../../utils/dynamicTaskHelper";
import builder from "../builder";

// Manufacturer Order Status Updates
builder.mutationField("manufacturerUpdateOrderStatus", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      status: t.arg.string({ required: true }),
      manufacturerNote: t.arg.string(),
      unitPrice: t.arg.float(),
      productionDays: t.arg.int(),
      estimatedProductionDate: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }

      // Get order with relations
      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: {
          customer: true,
          manufacture: true,
          collection: { include: { company: true } },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if user is the manufacturer
      if (order.manufactureId !== context.user.id) {
        throw new Error("Only the manufacturer can update order status");
      }

      const validStatuses = [
        "PENDING",
        "REVIEWED",
        "QUOTE_SENT",
        "CONFIRMED",
        "IN_PRODUCTION",
        "PRODUCTION_COMPLETE",
        "QUALITY_CHECK",
        "SHIPPED",
        "DELIVERED",
      ];

      if (!validStatuses.includes(args.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      // Prepare update data
      const updateData: any = {
        status: args.status,
      };

      if (args.manufacturerNote) {
        updateData.manufacturerResponse = args.manufacturerNote;
      }

      if (args.unitPrice) {
        updateData.unitPrice = args.unitPrice;
        updateData.totalPrice = args.unitPrice * order.quantity;
      }

      if (args.productionDays) {
        updateData.productionDays = args.productionDays;
      }

      if (args.estimatedProductionDate) {
        updateData.estimatedProductionDate = new Date(
          args.estimatedProductionDate
        );
      }

      // Special handling for specific status transitions
      if (args.status === "IN_PRODUCTION" && !order.actualProductionStart) {
        updateData.actualProductionStart = new Date();
      }

      if (args.status === "PRODUCTION_COMPLETE" && !order.actualProductionEnd) {
        updateData.actualProductionEnd = new Date();
      }

      if (args.status === "SHIPPED" && !order.shippingDate) {
        updateData.shippingDate = new Date();
      }

      // Update the order
      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // Create tasks for status change
      if (args.status !== order.status) {
        console.log(
          `📋 Order status changed: ${order.status} → ${args.status}`
        );

        const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
        await dynamicTaskHelper.createTasksForOrderStatus(
          updatedOrder.id,
          args.status,
          updatedOrder.customerId,
          updatedOrder.manufactureId
        );

        // Create notification for customer
        await context.prisma.notification.create({
          data: {
            userId: order.customerId,
            type: "ORDER_STATUS_UPDATED",
            title: "Sipariş Durumu Güncellendi",
            message: `Siparişiniz (${
              order.orderNumber
            }) yeni duruma geçti: ${getStatusLabel(args.status)}`,
            orderId: order.id,
            link: `/dashboard/orders/${order.id}`,
          },
        });

        console.log(
          `✅ Tasks and notification created for order ${updatedOrder.orderNumber}`
        );
      }

      return updatedOrder;
    },
  })
);

// Send Quote (Manufacturer)
builder.mutationField("sendQuote", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      unitPrice: t.arg.float({ required: true }),
      productionDays: t.arg.int({ required: true }),
      manufacturerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: { customer: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.manufactureId !== context.user.id) {
        throw new Error("Only the manufacturer can send quotes");
      }

      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: {
          status: "QUOTE_SENT",
          unitPrice: args.unitPrice,
          totalPrice: args.unitPrice * order.quantity,
          productionDays: args.productionDays,
          manufacturerResponse: args.manufacturerNote,
          estimatedProductionDate: new Date(
            Date.now() + args.productionDays * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Create tasks and notification
      const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
      await dynamicTaskHelper.createTasksForOrderStatus(
        updatedOrder.id,
        "QUOTE_SENT",
        updatedOrder.customerId,
        updatedOrder.manufactureId
      );

      await context.prisma.notification.create({
        data: {
          userId: order.customerId,
          type: "ORDER",
          title: "Teklif Alındı",
          message: `${
            order.orderNumber
          } siparişiniz için teklif geldi: ${args.unitPrice.toLocaleString()} $/adet`,
          orderId: order.id,
          link: `/dashboard/orders/${order.id}`,
        },
      });

      return updatedOrder;
    },
  })
);

// Accept Order (Customer)
builder.mutationField("acceptOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      customerNote: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: { manufacture: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.customerId !== context.user.id) {
        throw new Error("Only the customer can accept orders");
      }

      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: {
          status: "CONFIRMED",
          customerNote: args.customerNote,
        },
      });

      // Create tasks and notification
      const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
      await dynamicTaskHelper.createTasksForOrderStatus(
        updatedOrder.id,
        "CONFIRMED",
        updatedOrder.customerId,
        updatedOrder.manufactureId
      );

      await context.prisma.notification.create({
        data: {
          userId: order.manufactureId,
          type: "ORDER_CONFIRMED",
          title: "Sipariş Onaylandı",
          message: `${order.orderNumber} siparişi müşteri tarafından onaylandı. Üretime başlayabilirsiniz.`,
          orderId: order.id,
          link: `/dashboard/orders/${order.id}`,
        },
      });

      return updatedOrder;
    },
  })
);

// Reject Order
builder.mutationField("rejectOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      reason: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Authentication required");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
        include: { customer: true, manufacture: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      const isCustomer = order.customerId === context.user.id;
      const isManufacturer = order.manufactureId === context.user.id;

      if (!isCustomer && !isManufacturer) {
        throw new Error("Only customer or manufacturer can reject orders");
      }

      const newStatus = isCustomer
        ? "REJECTED_BY_CUSTOMER"
        : "REJECTED_BY_MANUFACTURER";
      const noteField = isCustomer ? "customerNote" : "manufacturerResponse";

      const updatedOrder = await context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: {
          status: newStatus,
          [noteField]: args.reason,
        },
      });

      // Create notification for the other party
      const notifyUserId = isCustomer ? order.manufactureId : order.customerId;
      const rejectingParty = isCustomer ? "Müşteri" : "Üretici";

      await context.prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: "ORDER_REJECTED",
          title: "Sipariş Reddedildi",
          message: `${
            order.orderNumber
          } siparişi ${rejectingParty.toLowerCase()} tarafından reddedildi: ${
            args.reason
          }`,
          orderId: order.id,
          link: `/dashboard/orders/${order.id}`,
        },
      });

      return updatedOrder;
    },
  })
);

// Helper function to get status labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "İnceleme Bekliyor",
    REVIEWED: "İncelendi",
    QUOTE_SENT: "Teklif Gönderildi",
    CONFIRMED: "Sipariş Onaylandı",
    IN_PRODUCTION: "Üretimde",
    PRODUCTION_COMPLETE: "Üretim Tamamlandı",
    QUALITY_CHECK: "Kalite Kontrolü",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    REJECTED_BY_CUSTOMER: "Müşteri Tarafından Reddedildi",
    REJECTED_BY_MANUFACTURER: "Üretici Tarafından Reddedildi",
  };

  return labels[status] || status;
}

import { inputObjectType, objectType } from "nexus";

export const Order = objectType({
  name: "Order",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("orderNumber");
    t.nonNull.field("status", { type: "OrderStatus" });
    t.nonNull.int("quantity");
    t.nonNull.float("unitPrice");
    t.nonNull.float("totalPrice");
    t.string("customerNote");
    t.string("manufacturerResponse");
    t.string("specifications");
    t.string("deliveryAddress");
    t.string("cargoTrackingNumber");

    // Production dates
    t.int("productionDays");
    t.field("estimatedProductionDate", { type: "DateTime" });
    t.field("actualProductionStart", { type: "DateTime" });
    t.field("actualProductionEnd", { type: "DateTime" });
    t.field("shippingDate", { type: "DateTime" });

    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    // Relations
    t.field("collection", {
      type: "Collection",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order.findUnique({ where: { id: order.id } }).collection(),
    });

    t.field("customer", {
      type: "User",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order.findUnique({ where: { id: order.id } }).customer(),
    });

    t.field("manufacture", {
      type: "User",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order.findUnique({ where: { id: order.id } }).manufacture(),
    });

    t.field("company", {
      type: "Company",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order.findUnique({ where: { id: order.id } }).company(),
    });

    t.list.field("productionHistory", {
      type: "OrderProduction",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order
          .findUnique({ where: { id: order.id } })
          .productionHistory(),
    });

    t.list.field("productionTracking", {
      type: "ProductionTracking",
      resolve: (order, _args, ctx) =>
        ctx.prisma.order
          .findUnique({ where: { id: order.id } })
          .productionTracking(),
    });
  },
});

export const OrderProduction = objectType({
  name: "OrderProduction",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("status", { type: "OrderStatus" });
    t.string("note");
    t.int("estimatedDays");
    t.field("actualDate", { type: "DateTime" });
    t.nonNull.field("createdAt", { type: "DateTime" });

    t.field("order", {
      type: "Order",
      resolve: (production, _args, ctx) =>
        ctx.prisma.orderProduction
          .findUnique({ where: { id: production.id } })
          .order(),
    });

    t.field("updatedBy", {
      type: "User",
      resolve: (production, _args, ctx) =>
        ctx.prisma.orderProduction
          .findUnique({ where: { id: production.id } })
          .updatedBy(),
    });
  },
});

// Input types for Order
export const CreateOrderInput = inputObjectType({
  name: "CreateOrderInput",
  definition(t) {
    t.nonNull.int("collectionId");
    t.nonNull.int("quantity");
    t.nonNull.float("unitPrice");
    t.string("notes");
    t.string("specifications");
    t.field("estimatedDelivery", { type: "DateTime" });
    t.int("companyId");
  },
});

export const UpdateOrderInput = inputObjectType({
  name: "UpdateOrderInput",
  definition(t) {
    t.nonNull.int("id");
    t.field("status", { type: "OrderStatus" });
    t.int("quantity");
    t.float("unitPrice");
    t.string("notes");
    t.string("specifications");
    t.field("estimatedDelivery", { type: "DateTime" });
    t.field("actualDelivery", { type: "DateTime" });
  },
});

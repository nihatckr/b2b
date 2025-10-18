import builder from "../builder";

// Approve Sample
builder.mutationField("approveSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (sample.manufactureId !== context.user.id) {
        throw new Error("Not authorized to approve this sample");
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: { status: "CONFIRMED" as any },
      });
    },
  })
);

// Hold Sample (pause production)
builder.mutationField("holdSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user.id &&
        sample.manufactureId !== context.user.id
      ) {
        throw new Error("Not authorized");
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: { status: "ON_HOLD" as any },
      });
    },
  })
);

// Resume Sample (resume from hold)
builder.mutationField("resumeSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user.id &&
        sample.manufactureId !== context.user.id
      ) {
        throw new Error("Not authorized");
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: { status: "IN_PRODUCTION" as any },
      });
    },
  })
);

// Cancel Sample
builder.mutationField("cancelSample", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user.id &&
        sample.manufactureId !== context.user.id
      ) {
        throw new Error("Not authorized");
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: { status: "CANCELLED" as any },
      });
    },
  })
);

// Update Sample Status
builder.mutationField("updateSampleStatus", (t) =>
  t.prismaField({
    type: "Sample",
    args: {
      id: t.arg.int({ required: true }),
      status: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const ValidStatuses = [
        "PENDING",
        "REVIEWED",
        "QUOTE_SENT",
        "CUSTOMER_QUOTE_SENT",
        "CONFIRMED",
        "REJECTED",
        "IN_PRODUCTION",
        "QUALITY_CHECK",
        "SHIPPED",
        "DELIVERED",
        "ON_HOLD",
        "CANCELLED",
      ];

      if (!ValidStatuses.includes(args.status)) {
        throw new Error("Invalid status");
      }

      const sample = await context.prisma.sample.findUnique({
        where: { id: args.id },
      });

      if (!sample) throw new Error("Sample not found");
      if (
        sample.customerId !== context.user.id &&
        sample.manufactureId !== context.user.id
      ) {
        throw new Error("Not authorized");
      }

      return context.prisma.sample.update({
        ...query,
        where: { id: args.id },
        data: { status: args.status as any },
      });
    },
  })
);

// Cancel Order
builder.mutationField("cancelOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) throw new Error("Order not found");
      if (order.customerId !== context.user.id) {
        throw new Error("Not authorized");
      }

      return context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: { status: "CANCELLED" as any },
      });
    },
  })
);

// Update Order Status (manufacturer)
builder.mutationField("updateOrderStatus", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      status: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const ValidStatuses = [
        "PENDING",
        "REVIEWED",
        "QUOTE_SENT",
        "CUSTOMER_QUOTE_SENT",
        "CONFIRMED",
        "REJECTED",
        "IN_PRODUCTION",
        "PRODUCTION_COMPLETE",
        "QUALITY_CHECK",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!ValidStatuses.includes(args.status)) {
        throw new Error("Invalid status");
      }

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) throw new Error("Order not found");
      if (order.manufactureId !== context.user.id) {
        throw new Error("Not authorized");
      }

      return context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: { status: args.status as any },
      });
    },
  })
);

// Update Customer Order (customer quote)
builder.mutationField("updateCustomerOrder", (t) =>
  t.prismaField({
    type: "Order",
    args: {
      id: t.arg.int({ required: true }),
      quotedPrice: t.arg.float(),
      quoteDays: t.arg.int(),
      quoteNote: t.arg.string(),
      quoteType: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const order = await context.prisma.order.findUnique({
        where: { id: args.id },
      });

      if (!order) throw new Error("Order not found");
      if (order.customerId !== context.user.id) {
        throw new Error("Not authorized");
      }

      return context.prisma.order.update({
        ...query,
        where: { id: args.id },
        data: {
          customerQuotedPrice: args.quotedPrice || undefined,
          customerQuoteDays: args.quoteDays || undefined,
          customerQuoteNote: args.quoteNote || undefined,
          customerQuoteType: args.quoteType || undefined,
          customerQuoteSentAt: new Date(),
          status: "CUSTOMER_QUOTE_SENT" as any,
        } as any,
      });
    },
  })
);

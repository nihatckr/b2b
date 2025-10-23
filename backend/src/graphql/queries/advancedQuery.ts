import builder from "../builder";

// Collection Questions
builder.queryField("collectionQuestions", (t) =>
  t.prismaConnection({
    type: "Question",
    args: {
      collectionId: t.arg.int({ required: true }),
      answered: t.arg.boolean(),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      const where: any = {
        sampleId: {
          in: await context.prisma.sample
            .findMany({
              where: { collectionId: args.collectionId },
              select: { id: true },
            })
            .then((samples: any) => samples.map((s: any) => s.id)),
        },
      };

      if (args.answered !== undefined) {
        where.answer = args.answered ? { not: null } : null;
      }

      return context.prisma.question.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Collection Tasks
builder.queryField("collectionTasks", (t) =>
  t.prismaConnection({
    type: "Task",
    args: {
      collectionId: t.arg.int({ required: true }),
      completed: t.arg.boolean(),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      const where: any = {
        collectionId: args.collectionId,
      };

      if (args.completed !== undefined) {
        where.completed = args.completed;
      }

      return context.prisma.task.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Sample Tasks
builder.queryField("sampleTasks", (t) =>
  t.prismaConnection({
    type: "Task",
    args: {
      sampleId: t.arg.int({ required: true }),
      completed: t.arg.boolean(),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      const where: any = {
        sampleId: args.sampleId,
      };

      if (args.completed !== undefined) {
        where.completed = args.completed;
      }

      return context.prisma.task.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Order Tasks
builder.queryField("orderTasks", (t) =>
  t.prismaConnection({
    type: "Task",
    args: {
      orderId: t.arg.int({ required: true }),
      completed: t.arg.boolean(),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      const where: any = {
        orderId: args.orderId,
      };

      if (args.completed !== undefined) {
        where.completed = args.completed;
      }

      return context.prisma.task.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Manufacturer Orders (for manufacturers to see their orders)
builder.queryField("manufacturerOrders", (t) =>
  t.prismaConnection({
    type: "Order",
    args: {
      status: t.arg.string(),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const where: any = {
        samples: {
          some: {
            manufactureId: context.user.id,
          },
        },
      };

      if (args.status) {
        where.status = args.status;
      }

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Assigned Orders (for users to see their assigned orders)
builder.queryField("assignedOrders", (t) =>
  t.prismaConnection({
    type: "Order",
    args: {
      status: t.arg.string(),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const where: any = {
        assignedToId: context.user.id,
      };

      if (args.status) {
        where.status = args.status;
      }

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Assigned Samples
builder.queryField("assignedSamples", (t) =>
  t.prismaConnection({
    type: "Sample",
    args: {
      status: t.arg.string(),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const where: any = {
        assignedToId: context.user.id,
      };

      if (args.status) {
        where.status = args.status;
      }

      return context.prisma.sample.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// My Reviews
builder.queryField("myReviews", (t) =>
  t.prismaConnection({
    type: "Review",
    args: {
      approved: t.arg.boolean(),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const where: any = {
        userId: context.user.id,
      };

      if (args.approved !== undefined) {
        where.isApproved = args.approved;
      }

      return context.prisma.review.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

// Pending Reviews (for admins to approve)
builder.queryField("pendingReviews", (t) =>
  t.prismaConnection({
    type: "Review",
    cursor: "id",
    authScopes: { admin: true },
    resolve: async (query, _root: any, _args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      return context.prisma.review.findMany({
        ...query,
        where: {
          isApproved: false,
        },
        orderBy: { createdAt: "asc" },
      });
    },
  })
);

// Product Messages (messages for a specific product/sample)
builder.queryField("productMessages", (t) =>
  t.prismaConnection({
    type: "Message",
    args: {
      sampleId: t.arg.int({ required: true }),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      return context.prisma.message.findMany({
        ...query,
        where: {
          sampleId: args.sampleId,
        },
        orderBy: { createdAt: "asc" },
      });
    },
  })
);

// My Categories
builder.queryField("myCategories", (t) =>
  t.prismaConnection({
    type: "Category",
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root: any, _args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      return context.prisma.category.findMany({
        ...query,
        where: {
          createdById: context.user.id,
        },
        orderBy: { name: "asc" },
      });
    },
  })
);

// Categories by Company
builder.queryField("categoriesByCompany", (t) =>
  t.prismaConnection({
    type: "Category",
    args: {
      companyId: t.arg.int({ required: true }),
    },
    cursor: "id",
    resolve: async (query, _root: any, args: any, context: any) => {
      return context.prisma.category.findMany({
        ...query,
        where: {
          createdById: args.companyId,
        },
        orderBy: { name: "asc" },
      });
    },
  })
);

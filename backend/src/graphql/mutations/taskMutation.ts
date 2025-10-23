import builder from "../builder";

// Create Task
builder.mutationField("createTask", (t) =>
  t.prismaField({
    type: "Task",
    args: {
      title: t.arg.string({ required: true }),
      description: t.arg.string(),
      type: t.arg.string({ required: true }),
      priority: t.arg.string(),
      dueDate: t.arg.string(),
      relatedStatus: t.arg.string(),
      targetStatus: t.arg.string(),
      collectionId: t.arg.int(),
      sampleId: t.arg.int(),
      orderId: t.arg.int(),
      productionTrackingId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const task = await context.prisma.task.create({
        ...query,
        data: {
          title: args.title,
          description: args.description || undefined,
          type: args.type as any,
          status: "TODO" as any,
          priority: (args.priority || "MEDIUM") as any,
          dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
          relatedStatus: args.relatedStatus,
          targetStatus: args.targetStatus,
          entityType: args.collectionId
            ? "COLLECTION"
            : args.sampleId
            ? "SAMPLE"
            : args.orderId
            ? "ORDER"
            : undefined,
          collectionId: args.collectionId || undefined,
          sampleId: args.sampleId || undefined,
          orderId: args.orderId || undefined,
          productionTrackingId: args.productionTrackingId || undefined,
          userId: context.user.id,
        } as any,
      });

      return task;
    },
  })
);

// Update Task
builder.mutationField("updateTask", (t) =>
  t.prismaField({
    type: "Task",
    args: {
      id: t.arg.int({ required: true }),
      title: t.arg.string(),
      description: t.arg.string(),
      status: t.arg.string(),
      priority: t.arg.string(),
      dueDate: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task || task.userId !== context.user.id) {
        throw new Error("Task not found or unauthorized");
      }

      const updated = await context.prisma.task.update({
        ...query,
        where: { id: args.id },
        data: {
          title: args.title || undefined,
          description: args.description || undefined,
          status: args.status ? (args.status as any) : undefined,
          priority: args.priority ? (args.priority as any) : undefined,
          dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
        } as any,
      });

      return updated;
    },
  })
);

// Complete Task
builder.mutationField("completeTask", (t) =>
  t.prismaField({
    type: "Task",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task || task.userId !== context.user.id) {
        throw new Error("Task not found or unauthorized");
      }

      const completed = await context.prisma.task.update({
        ...query,
        where: { id: args.id },
        data: {
          status: "COMPLETED" as any,
          completedAt: new Date(),
        },
      });

      return completed;
    },
  })
);

// Delete Task
builder.mutationField("deleteTask", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task || task.userId !== context.user.id) {
        throw new Error("Task not found or unauthorized");
      }

      await context.prisma.task.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

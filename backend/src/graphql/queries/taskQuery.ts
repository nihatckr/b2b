import builder from "../builder";

// My Tasks - Görevlerim
builder.queryField("myTasks", (t) =>
  t.prismaField({
    type: ["Task"],
    args: {
      status: t.arg.string(),
      priority: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      const where: any = {
        OR: [
          { userId: context.user.id }, // Created by user
          { assignedToId: context.user.id }, // Assigned to user
        ],
      };

      if (args.status) {
        where.status = args.status;
      }

      if (args.priority) {
        where.priority = args.priority;
      }

      return context.prisma.task.findMany({
        ...query,
        where,
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      });
    },
  })
);

// Get Single Task
builder.queryField("task", (t) =>
  t.prismaField({
    type: "Task",
    args: { id: t.arg.int({ required: true }) },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const task = await context.prisma.task.findUnique({
        ...query,
        where: { id: args.id },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      // Check authorization
      if (
        task.userId !== context.user?.id &&
        task.assignedToId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Not authorized to view this task");
      }

      return task;
    },
  })
);

// Pending Tasks - Bekleyen görevler
builder.queryField("pendingTasks", (t) =>
  t.prismaField({
    type: ["Task"],
    authScopes: { user: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.id) {
        throw new Error("Not authenticated");
      }

      return context.prisma.task.findMany({
        ...query,
        where: {
          OR: [{ userId: context.user.id }, { assignedToId: context.user.id }],
          status: "TODO",
        },
        orderBy: { dueDate: "asc" },
      });
    },
  })
);

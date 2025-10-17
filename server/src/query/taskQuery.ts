import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const taskQueries = (t: any) => {
  // Get all tasks for current user
  t.list.field("myTasks", {
    type: "Task",
    args: {
      status: stringArg(), // TODO, IN_PROGRESS, COMPLETED, CANCELLED
      type: stringArg(), // Task type filter
      priority: stringArg(), // LOW, MEDIUM, HIGH
    },
    resolve: async (
      _parent: unknown,
      args: {
        status?: string;
        type?: string;
        priority?: string;
      },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const where: any = {
        OR: [
          { userId: userId }, // Görevleri oluşturan
          { assignedToId: userId }, // Kendisine atanan görevler
        ],
      };

      if (args.status) {
        where.status = args.status;
      }

      if (args.type) {
        where.type = args.type;
      }

      if (args.priority) {
        where.priority = args.priority;
      }

      return context.prisma.task.findMany({
        where,
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
        orderBy: [
          { priority: "desc" }, // Öncelik sırasında
          { dueDate: "asc" }, // Son tarih yakın olanlar önce
          { createdAt: "desc" }, // En yeni görevler
        ],
      });
    },
  });

  // Get tasks for a specific collection
  t.list.field("collectionTasks", {
    type: "Task",
    args: {
      collectionId: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      args: {
        collectionId: number;
      },
      context: Context
    ) => {
      requireAuth(context);

      return context.prisma.task.findMany({
        where: {
          collectionId: args.collectionId,
        },
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get tasks for a specific sample
  t.list.field("sampleTasks", {
    type: "Task",
    args: {
      sampleId: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      args: {
        sampleId: number;
      },
      context: Context
    ) => {
      requireAuth(context);

      return context.prisma.task.findMany({
        where: {
          sampleId: args.sampleId,
        },
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get tasks for a specific order
  t.list.field("orderTasks", {
    type: "Task",
    args: {
      orderId: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      args: {
        orderId: number;
      },
      context: Context
    ) => {
      requireAuth(context);

      return context.prisma.task.findMany({
        where: {
          orderId: args.orderId,
        },
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get task by ID
  t.field("task", {
    type: "Task",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      args: {
        id: number;
      },
      context: Context
    ) => {
      requireAuth(context);

      return context.prisma.task.findUnique({
        where: { id: args.id },
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
      });
    },
  });
};

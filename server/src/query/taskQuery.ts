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

      console.log("🔍 MyTasks Query - User ID:", userId);

      const where: any = {
        OR: [
          { userId: userId }, // Görevleri oluşturan
          { assignedToId: userId }, // Kendisine atanan görevler
        ],
      };

      console.log("📋 Where clause:", JSON.stringify(where, null, 2));

      if (args.status) {
        where.status = args.status;
      }

      if (args.type) {
        where.type = args.type;
      }

      if (args.priority) {
        where.priority = args.priority;
      }

      console.log("📋 Where clause:", JSON.stringify(where, null, 2));

      const tasks = await context.prisma.task.findMany({
        where,
        include: {
          user: {
            include: {
              company: true,
            },
          },
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

      console.log(`✅ Found ${tasks.length} tasks for user ${userId}`);
      console.log("📦 Tasks:", JSON.stringify(tasks.map(t => ({
        id: t.id,
        title: t.title,
        userId: t.userId,
        assignedToId: t.assignedToId,
        status: t.status,
        type: t.type
      })), null, 2));

      // Filter out any null/undefined tasks
      return tasks.filter(task => task != null);
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
          user: {
            include: {
              company: true,
            },
          },
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
          user: {
            include: {
              company: true,
            },
          },
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
          user: {
            include: {
              company: true,
            },
          },
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
      const userId = requireAuth(context);

      console.log("🔍 Task Detail Query - User ID:", userId, "Task ID:", args.id);

      try {
        const task = await context.prisma.task.findUnique({
          where: { id: args.id },
          include: {
            user: {
              include: {
                company: true,
              },
            },
            assignedTo: true,
            collection: true,
            sample: true,
            order: true,
            productionTracking: true,
          },
        });

        console.log("✅ Task found:", task ? `ID: ${task.id}, Title: ${task.title}` : "null");

        if (task) {
          console.log("📦 Task details:", {
            userId: task.userId,
            assignedToId: task.assignedToId,
            hasUser: !!task.user,
            hasCompany: !!(task.user as any)?.company,
            collectionId: task.collectionId,
            sampleId: task.sampleId,
            orderId: task.orderId,
            productionTrackingId: task.productionTrackingId,
          });
        }

        return task;
      } catch (error) {
        console.error("❌ Error in task query:", error);
        throw error;
      }
    },
  });
};

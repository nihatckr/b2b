import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const taskMutations = (t: any) => {
  // Create a new task
  t.field("createTask", {
    type: "Task",
    args: {
      title: nonNull(stringArg()),
      description: stringArg(),
      type: nonNull(stringArg()), // TaskType
      priority: stringArg(), // TaskPriority - default MEDIUM
      status: stringArg(), // TaskStatus - default TODO
      dueDate: stringArg(), // ISO Date string
      collectionId: intArg(),
      sampleId: intArg(),
      orderId: intArg(),
      productionTrackingId: intArg(),
      assignedToId: intArg(),
      notes: stringArg(),
    },
    resolve: async (
      _parent: unknown,
      args: {
        title: string;
        description?: string;
        type: string;
        priority?: string;
        status?: string;
        dueDate?: string;
        collectionId?: number;
        sampleId?: number;
        orderId?: number;
        productionTrackingId?: number;
        assignedToId?: number;
        notes?: string;
      },
      context: Context
    ) => {
      const userId = requireAuth(context);

      return context.prisma.task.create({
        data: {
          title: args.title,
          description: args.description,
          type: args.type as any,
          priority: (args.priority || "MEDIUM") as any,
          status: (args.status || "TODO") as any,
          dueDate: args.dueDate ? new Date(args.dueDate) : null,
          collectionId: args.collectionId,
          sampleId: args.sampleId,
          orderId: args.orderId,
          productionTrackingId: args.productionTrackingId,
          userId: userId,
          assignedToId: args.assignedToId,
          notes: args.notes,
        },
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

  // Update task
  t.field("updateTask", {
    type: "Task",
    args: {
      id: nonNull(intArg()),
      title: stringArg(),
      description: stringArg(),
      status: stringArg(),
      priority: stringArg(),
      dueDate: stringArg(),
      completedAt: stringArg(),
      assignedToId: intArg(),
      notes: stringArg(),
    },
    resolve: async (
      _parent: unknown,
      args: {
        id: number;
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        completedAt?: string;
        assignedToId?: number;
        notes?: string;
      },
      context: Context
    ) => {
      requireAuth(context);

      // Verify user has permission to update
      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const data: any = {};

      if (args.title !== undefined) data.title = args.title;
      if (args.description !== undefined) data.description = args.description;
      if (args.status !== undefined) data.status = args.status as any;
      if (args.priority !== undefined) data.priority = args.priority as any;
      if (args.dueDate !== undefined)
        data.dueDate = args.dueDate ? new Date(args.dueDate) : null;
      if (args.completedAt !== undefined)
        data.completedAt = args.completedAt ? new Date(args.completedAt) : null;
      if (args.assignedToId !== undefined)
        data.assignedToId = args.assignedToId;
      if (args.notes !== undefined) data.notes = args.notes;

      return context.prisma.task.update({
        where: { id: args.id },
        data,
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

  // Complete task
  t.field("completeTask", {
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

      const task = await context.prisma.task.findUnique({
        where: { id: args.id },
        include: {
          user: true,
          assignedTo: true,
          order: true,
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const updatedTask = await context.prisma.task.update({
        where: { id: args.id },
        data: {
          status: "COMPLETED" as any,
          completedAt: new Date(),
        },
        include: {
          user: true,
          assignedTo: true,
          collection: true,
          sample: true,
          order: true,
          productionTracking: true,
        },
      });

      // Send notification to the other party
      if (task.order) {
        const isManufacturer = task.assignedToId === userId;
        const notifyUserId = isManufacturer
          ? task.order.customerId
          : task.order.manufactureId;

        if (notifyUserId) {
          const { createNotification } = await import("../utils/notificationHelper");
          await createNotification(context.prisma, {
            type: "SYSTEM",
            title: "✅ Task Completed",
            message: `Task "${task.title}" has been completed for order #${task.order.orderNumber}.`,
            userId: notifyUserId,
            link: `/dashboard/orders/${task.order.id}`,
            orderId: task.order.id,
          });
        }
      }

      return updatedTask;
    },
  });

  // Delete task
  t.field("deleteTask", {
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

      return context.prisma.task.delete({
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

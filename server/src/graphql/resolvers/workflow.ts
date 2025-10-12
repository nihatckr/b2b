import { arg, extendType, intArg, nonNull } from "nexus";
import { Context } from "../../context";
import { getUserId } from "../../utils/userUtils";
import {
  ApprovalFilterInput,
  CreateOrderApprovalInput,
  CreateOrderStageInput,
  NotificationFilterInput,
  OrderWorkflowFilterInput,
  RespondToApprovalInput,
  UpdateOrderStageInput,
} from "../inputs/workflow";
import {
  OrderApproval,
  OrderNotification,
  OrderStageTracking,
  OrderWorkflowSummary,
} from "../types/workflow";

// ===== QUERIES =====
export const OrderWorkflowQueries = extendType({
  type: "Query",
  definition(t) {
    // Get order workflow summary
    t.field("orderWorkflowSummary", {
      type: OrderWorkflowSummary,
      args: {
        orderId: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Verify access to order
        const order = await ctx.prisma.order.findFirst({
          where: {
            id: args.orderId,
            companyId: ctx.user?.companyId,
          },
        });

        if (!order) throw new Error("Order not found");

        // Get stage trackings
        const stages = await ctx.prisma.orderStageTracking.findMany({
          where: { orderId: args.orderId },
          orderBy: { stage: "asc" },
        });

        const completedStages = stages.filter(
          (s) => s.status === "COMPLETED"
        ).length;
        const totalStages = stages.length || 10; // Default 10 stages
        const currentStage =
          stages.find((s) => s.status === "IN_PROGRESS")?.stage || "INQUIRY";
        const currentStageStatus =
          stages.find((s) => s.status === "IN_PROGRESS")?.status ||
          "NOT_STARTED";

        // Get pending approvals
        const pendingApprovals = await ctx.prisma.orderApproval.count({
          where: {
            orderId: args.orderId,
            status: "WAITING_APPROVAL",
          },
        });

        // Get unread notifications
        const unreadNotifications = await ctx.prisma.orderNotification.count({
          where: {
            orderId: args.orderId,
            recipientUserId: userId,
            isRead: false,
          },
        });

        // Get active deadlines
        const activeDeadlines = await ctx.prisma.orderDeadline.count({
          where: {
            orderId: args.orderId,
            isActive: true,
            isCompleted: false,
          },
        });

        // Get next deadline
        const nextDeadline = await ctx.prisma.orderDeadline.findFirst({
          where: {
            orderId: args.orderId,
            isActive: true,
            isCompleted: false,
          },
          orderBy: { deadlineDate: "asc" },
        });

        return {
          orderId: args.orderId,
          currentStage,
          currentStageStatus,
          completedStages,
          totalStages,
          progressPercentage: Math.round((completedStages / totalStages) * 100),
          pendingApprovals,
          unreadNotifications,
          activeDeadlines,
          nextDeadline: nextDeadline
            ? {
                ...nextDeadline,
                createdAt: nextDeadline.createdAt.toISOString(),
                updatedAt: nextDeadline.updatedAt.toISOString(),
                deadlineDate: nextDeadline.deadlineDate.toISOString(),
                completedAt: nextDeadline.completedAt?.toISOString() || null,
                warningTriggeredAt:
                  nextDeadline.warningTriggeredAt?.toISOString() || null,
              }
            : null,
          estimatedCompletion: null, // Will be calculated based on stages
        };
      },
    });

    // Get order stage trackings
    t.list.field("orderStageTrackings", {
      type: OrderStageTracking,
      args: {
        orderId: nonNull(intArg()),
        filter: arg({ type: OrderWorkflowFilterInput }),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        const where: any = {
          orderId: args.orderId,
          companyId: ctx.user?.companyId,
        };

        if (args.filter) {
          if (args.filter.stage) where.stage = args.filter.stage;
          if (args.filter.status) where.status = args.filter.status;
          if (args.filter.assignedToId)
            where.assignedToId = args.filter.assignedToId;
        }

        const stages = await ctx.prisma.orderStageTracking.findMany({
          where,
          orderBy: { stage: "asc" },
        });

        return stages.map((stage) => ({
          ...stage,
          createdAt: stage.createdAt.toISOString(),
          updatedAt: stage.updatedAt.toISOString(),
          plannedStartDate: stage.plannedStartDate?.toISOString() || null,
          plannedEndDate: stage.plannedEndDate?.toISOString() || null,
          actualStartDate: stage.actualStartDate?.toISOString() || null,
          actualEndDate: stage.actualEndDate?.toISOString() || null,
        }));
      },
    });

    // Get order approvals
    t.list.field("orderApprovals", {
      type: OrderApproval,
      args: {
        orderId: intArg(),
        filter: arg({ type: ApprovalFilterInput }),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        const where: any = {
          companyId: ctx.user?.companyId,
        };

        if (args.orderId) where.orderId = args.orderId;

        if (args.filter) {
          if (args.filter.approvalType)
            where.approvalType = args.filter.approvalType;
          if (args.filter.status) where.status = args.filter.status;
          if (args.filter.requesterUserId)
            where.requesterUserId = args.filter.requesterUserId;
          if (args.filter.approverUserId)
            where.approverUserId = args.filter.approverUserId;
        }

        const approvals = await ctx.prisma.orderApproval.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return approvals.map((approval) => ({
          ...approval,
          createdAt: approval.createdAt.toISOString(),
          updatedAt: approval.updatedAt.toISOString(),
          requestedAt: approval.requestedAt.toISOString(),
          respondedAt: approval.respondedAt?.toISOString() || null,
          deadline: approval.deadline?.toISOString() || null,
          metadata: approval.metadata,
        }));
      },
    });

    // Get order notifications
    t.list.field("orderNotifications", {
      type: OrderNotification,
      args: {
        orderId: intArg(),
        filter: arg({ type: NotificationFilterInput }),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        const where: any = {
          recipientUserId: userId,
          companyId: ctx.user?.companyId,
        };

        if (args.orderId) where.orderId = args.orderId;

        if (args.filter) {
          if (args.filter.type) where.type = args.filter.type;
          if (typeof args.filter.isRead === "boolean")
            where.isRead = args.filter.isRead;
          if (args.filter.minPriority)
            where.priority = { gte: args.filter.minPriority };
        }

        const notifications = await ctx.prisma.orderNotification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 50, // Limit for performance
        });

        return notifications.map((notification) => ({
          ...notification,
          createdAt: notification.createdAt.toISOString(),
          readAt: notification.readAt?.toISOString() || null,
          metadata: notification.metadata,
        }));
      },
    });
  },
});

// ===== MUTATIONS =====
export const OrderWorkflowMutations = extendType({
  type: "Mutation",
  definition(t) {
    // Create order stage tracking
    t.field("createOrderStage", {
      type: OrderStageTracking,
      args: {
        input: nonNull(arg({ type: CreateOrderStageInput })),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Verify access to order
        const order = await ctx.prisma.order.findFirst({
          where: {
            id: args.input.orderId,
            companyId: ctx.user?.companyId,
          },
        });

        if (!order) throw new Error("Order not found");

        const stage = await ctx.prisma.orderStageTracking.create({
          data: {
            orderId: args.input.orderId,
            stage: args.input.stage,
            status: args.input.status || "NOT_STARTED",
            plannedStartDate: args.input.plannedStartDate
              ? new Date(args.input.plannedStartDate)
              : null,
            plannedEndDate: args.input.plannedEndDate
              ? new Date(args.input.plannedEndDate)
              : null,
            assignedToId: args.input.assignedToId,
            notes: args.input.notes,
            priority: args.input.priority || 5,
            companyId: ctx.user?.companyId!,
          },
        });

        return {
          ...stage,
          createdAt: stage.createdAt.toISOString(),
          updatedAt: stage.updatedAt.toISOString(),
          plannedStartDate: stage.plannedStartDate?.toISOString() || null,
          plannedEndDate: stage.plannedEndDate?.toISOString() || null,
          actualStartDate: stage.actualStartDate?.toISOString() || null,
          actualEndDate: stage.actualEndDate?.toISOString() || null,
        };
      },
    });

    // Update order stage tracking
    t.field("updateOrderStage", {
      type: OrderStageTracking,
      args: {
        id: nonNull(intArg()),
        input: nonNull(arg({ type: UpdateOrderStageInput })),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Verify access
        const existingStage = await ctx.prisma.orderStageTracking.findFirst({
          where: {
            id: args.id,
            companyId: ctx.user?.companyId,
          },
        });

        if (!existingStage) throw new Error("Stage not found");

        const updateData: any = {};
        if (args.input.status) updateData.status = args.input.status;
        if (args.input.actualStartDate)
          updateData.actualStartDate = new Date(args.input.actualStartDate);
        if (args.input.actualEndDate)
          updateData.actualEndDate = new Date(args.input.actualEndDate);
        if (args.input.assignedToId)
          updateData.assignedToId = args.input.assignedToId;
        if (args.input.notes) updateData.notes = args.input.notes;
        if (args.input.priority) updateData.priority = args.input.priority;

        const stage = await ctx.prisma.orderStageTracking.update({
          where: { id: args.id },
          data: updateData,
        });

        return {
          ...stage,
          createdAt: stage.createdAt.toISOString(),
          updatedAt: stage.updatedAt.toISOString(),
          plannedStartDate: stage.plannedStartDate?.toISOString() || null,
          plannedEndDate: stage.plannedEndDate?.toISOString() || null,
          actualStartDate: stage.actualStartDate?.toISOString() || null,
          actualEndDate: stage.actualEndDate?.toISOString() || null,
        };
      },
    });

    // Create approval request
    t.field("createApprovalRequest", {
      type: OrderApproval,
      args: {
        input: nonNull(arg({ type: CreateOrderApprovalInput })),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Verify access to order
        const order = await ctx.prisma.order.findFirst({
          where: {
            id: args.input.orderId,
            companyId: ctx.user?.companyId,
          },
        });

        if (!order) throw new Error("Order not found");

        const approval = await ctx.prisma.orderApproval.create({
          data: {
            orderId: args.input.orderId,
            stageTrackingId: args.input.stageTrackingId,
            approvalType: args.input.approvalType,
            requesterUserId: userId,
            approverUserId: args.input.approverUserId,
            requestMessage: args.input.requestMessage,
            deadline: args.input.deadline
              ? new Date(args.input.deadline)
              : null,
            metadata: args.input.metadata
              ? JSON.parse(args.input.metadata)
              : null,
            companyId: ctx.user?.companyId!,
          },
        });

        return {
          ...approval,
          createdAt: approval.createdAt.toISOString(),
          updatedAt: approval.updatedAt.toISOString(),
          requestedAt: approval.requestedAt.toISOString(),
          respondedAt: approval.respondedAt?.toISOString() || null,
          deadline: approval.deadline?.toISOString() || null,
          metadata: approval.metadata,
        };
      },
    });

    // Respond to approval
    t.field("respondToApproval", {
      type: OrderApproval,
      args: {
        id: nonNull(intArg()),
        input: nonNull(arg({ type: RespondToApprovalInput })),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Verify approval exists and user is the approver
        const approval = await ctx.prisma.orderApproval.findFirst({
          where: {
            id: args.id,
            approverUserId: userId,
            status: "WAITING_APPROVAL",
            companyId: ctx.user?.companyId,
          },
        });

        if (!approval) throw new Error("Approval not found or not authorized");

        const updatedApproval = await ctx.prisma.orderApproval.update({
          where: { id: args.id },
          data: {
            status: args.input.status,
            responseMessage: args.input.responseMessage,
            respondedAt: new Date(),
          },
        });

        return {
          ...updatedApproval,
          createdAt: updatedApproval.createdAt.toISOString(),
          updatedAt: updatedApproval.updatedAt.toISOString(),
          requestedAt: updatedApproval.requestedAt.toISOString(),
          respondedAt: updatedApproval.respondedAt?.toISOString() || null,
          deadline: updatedApproval.deadline?.toISOString() || null,
          metadata: updatedApproval.metadata,
        };
      },
    });

    // Mark notification as read
    t.field("markNotificationAsRead", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx: Context) {
        const userId = getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        await ctx.prisma.orderNotification.updateMany({
          where: {
            id: args.id,
            recipientUserId: userId,
            companyId: ctx.user?.companyId,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        return true;
      },
    });
  },
});

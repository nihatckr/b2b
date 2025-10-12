import { arg, extendType, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../context";
import { requireAuth } from "../../utils/userUtils";

// Revision Request Queries
export const RevisionQueries = extendType({
  type: "Query",
  definition(t) {
    // Get revision requests with pagination and filtering
    t.field("revisionRequests", {
      type: "RevisionRequestConnection",
      args: {
        first: intArg(),
        after: stringArg(),
        filter: arg({ type: "RevisionRequestFilterInput" }),
        orderBy: arg({ type: "RevisionRequestOrderByInput" }),
      },
      async resolve(_parent, args, ctx: Context) {
        requireAuth(ctx);

        const { first = 10, after, filter, orderBy } = args;
        const { user } = ctx;

        // Build where clause with company scoping
        const where: any = {
          companyId: user!.companyId,
        };

        // Apply filters
        if (filter) {
          if (filter.type) where.type = filter.type;
          if (filter.status) where.status = filter.status;
          if (filter.requestedById) where.requestedById = filter.requestedById;
          if (filter.assignedToId) where.assignedToId = filter.assignedToId;
          if (filter.orderId) where.orderId = filter.orderId;
          if (filter.sampleId) where.sampleId = filter.sampleId;
          if (filter.productionTrackingId)
            where.productionTrackingId = filter.productionTrackingId;
          if (filter.requiredApprovalLevel)
            where.requiredApprovalLevel = filter.requiredApprovalLevel;
          if (filter.currentApprovalLevel)
            where.currentApprovalLevel = filter.currentApprovalLevel;
          if (filter.requiresCustomerApproval !== undefined)
            where.requiresCustomerApproval = filter.requiresCustomerApproval;
          if (filter.requiresManufacturerApproval !== undefined)
            where.requiresManufacturerApproval =
              filter.requiresManufacturerApproval;

          // Date filters
          if (filter.createdAfter || filter.createdBefore) {
            where.createdAt = {};
            if (filter.createdAfter)
              where.createdAt.gte = new Date(filter.createdAfter);
            if (filter.createdBefore)
              where.createdAt.lte = new Date(filter.createdBefore);
          }

          if (filter.deadlineBefore || filter.deadlineAfter) {
            where.requestedDeadline = {};
            if (filter.deadlineAfter)
              where.requestedDeadline.gte = new Date(filter.deadlineAfter);
            if (filter.deadlineBefore)
              where.requestedDeadline.lte = new Date(filter.deadlineBefore);
          }

          // Impact filters
          if (filter.minCostImpact || filter.maxCostImpact) {
            where.estimatedCostImpact = {};
            if (filter.minCostImpact)
              where.estimatedCostImpact.gte = filter.minCostImpact;
            if (filter.maxCostImpact)
              where.estimatedCostImpact.lte = filter.maxCostImpact;
          }

          if (filter.minTimeImpact || filter.maxTimeImpact) {
            where.estimatedTimeImpact = {};
            if (filter.minTimeImpact)
              where.estimatedTimeImpact.gte = filter.minTimeImpact;
            if (filter.maxTimeImpact)
              where.estimatedTimeImpact.lte = filter.maxTimeImpact;
          }

          // Search
          if (filter.search) {
            where.OR = [
              { title: { contains: filter.search, mode: "insensitive" } },
              { description: { contains: filter.search, mode: "insensitive" } },
            ];
          }
        }

        // Build cursor
        const cursor = after ? { id: parseInt(after) } : undefined;

        const safeFirst = first || 20;

        // Get revision requests
        const revisionRequests = await ctx.prisma.revisionRequest.findMany({
          where,
          take: safeFirst + 1,
          cursor,
          skip: cursor ? 1 : 0,
          orderBy: orderBy
            ? { [orderBy.field]: orderBy.direction }
            : { createdAt: "desc" },
        });

        // Get total count for totalCount field
        const totalCount = await ctx.prisma.revisionRequest.count({ where });

        const hasNextPage = revisionRequests.length > safeFirst;
        const edges = revisionRequests.slice(0, safeFirst);

        return {
          edges: edges.map((node) => ({
            node,
            cursor: node.id.toString(),
          })),
          pageInfo: {
            hasNextPage,
            hasPreviousPage: !!after,
            startCursor: edges[0]?.id.toString(),
            endCursor: edges[edges.length - 1]?.id.toString(),
          },
          totalCount,
        };
      },
    });

    // Get single revision request
    t.field("revisionRequest", {
      type: "RevisionRequest",
      args: { id: nonNull(intArg()) },
      async resolve(_parent, { id }, ctx: Context) {
        requireAuth(ctx);

        const revisionRequest = await ctx.prisma.revisionRequest.findFirst({
          where: {
            id,
            companyId: ctx.user!.companyId,
          },
        });

        if (!revisionRequest) {
          throw new Error("Revision request not found");
        }

        return revisionRequest;
      },
    });

    // Get revision statistics
    t.field("revisionStats", {
      type: "RevisionStats",
      async resolve(_parent, _args, ctx: Context) {
        requireAuth(ctx);

        const companyId = ctx.user!.companyId;

        // Get basic counts
        const [
          totalRevisions,
          pendingRevisions,
          approvedRevisions,
          rejectedRevisions,
          implementedRevisions,
        ] = await Promise.all([
          ctx.prisma.revisionRequest.count({ where: { companyId } }),
          ctx.prisma.revisionRequest.count({
            where: { companyId, status: "IN_PROGRESS" },
          }),
          ctx.prisma.revisionRequest.count({
            where: { companyId, status: "COMPLETED" },
          }),
          ctx.prisma.revisionRequest.count({
            where: { companyId, status: "CANCELLED" },
          }),
          ctx.prisma.revisionRequest.count({
            where: { companyId, status: "COMPLETED" },
          }),
        ]);

        // Calculate average approval time (temporarily set to 0)
        const avgApprovalTime = 0;

        // Calculate total impacts
        const impacts = await ctx.prisma.revisionRequest.aggregate({
          where: { companyId },
          _sum: {
            costImpact: true,
            estimatedDays: true,
          },
        });

        // Get revisions by type
        const revisionsByType = await ctx.prisma.revisionRequest.groupBy({
          by: ["revisionType"],
          where: { companyId },
          _count: true,
        });

        // Get revisions by severity (from impacts)
        const revisionsBySeverity = await ctx.prisma.revisionImpact.groupBy({
          by: ["impactLevel"],
          where: { companyId },
          _count: true,
        });

        // Get monthly trends (last 12 months)
        const monthlyTrends = await ctx.prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(createdAt, '%Y-%m') as month,
            COUNT(*) as count,
            AVG(costImpact) as avgCostImpact,
            AVG(estimatedDays) as avgTimeImpact
          FROM RevisionRequest 
          WHERE companyId = ${companyId} 
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
          ORDER BY month DESC
        `;

        return {
          totalRevisions,
          pendingRevisions,
          approvedRevisions,
          rejectedRevisions,
          implementedRevisions,
          avgApprovalTime,
          totalCostImpact: impacts._sum.costImpact || 0,
          totalTimeImpact: impacts._sum.estimatedDays || 0,
          revisionsByType: Object.fromEntries(
            revisionsByType.map((item) => [item.revisionType, item._count])
          ),
          revisionsBySeverity: Object.fromEntries(
            revisionsBySeverity.map((item) => [item.impactLevel, item._count])
          ),
          monthlyTrends,
        };
      },
    });
  },
});

// Revision Request Mutations
export const RevisionMutations = extendType({
  type: "Mutation",
  definition(t) {
    // Create revision request
    t.field("createRevisionRequest", {
      type: "RevisionRequest",
      args: {
        input: nonNull(arg({ type: "CreateRevisionRequestInput" })),
      },
      async resolve(_parent, { input }, ctx: Context) {
        requireAuth(ctx);

        const { user } = ctx;

        // Validate that at least one entity is linked
        if (!input.orderId && !input.sampleId && !input.productionTrackingId) {
          throw new Error(
            "Revision request must be linked to at least one entity (order, sample, or production tracking)"
          );
        }

        // Create revision request
        // Generate unique revision number
        const revisionNumber = `REV-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 3)
          .toUpperCase()}`;

        const revisionRequest = await ctx.prisma.revisionRequest.create({
          data: {
            revisionNumber,
            title: input.title,
            description: input.description,
            revisionType: input.type,
            status: "NOT_STARTED",
            orderId: input.orderId,
            sampleId: input.sampleId,
            productionTrackingId: input.productionTrackingId,
            requestedById: user!.id,
            assignedToId: input.assignedToId,
            companyId: user!.companyId,
          },
        });

        // Create timeline entry
        await ctx.prisma.revisionTimeline.create({
          data: {
            revisionRequestId: revisionRequest.id,
            eventType: "CREATED",
            eventDescription: `Revision request created: ${input.title}`,
            performedById: user!.id,
            companyId: user!.companyId,
          },
        });

        return revisionRequest;
      },
    });

    // Update revision request
    t.field("updateRevisionRequest", {
      type: "RevisionRequest",
      args: {
        id: nonNull(intArg()),
        input: nonNull(arg({ type: "UpdateRevisionRequestInput" })),
      },
      async resolve(_parent, { id, input }, ctx: Context) {
        requireAuth(ctx);

        const { user } = ctx;

        // Check if revision request exists and user has access
        const existingRequest = await ctx.prisma.revisionRequest.findFirst({
          where: {
            id,
            companyId: user!.companyId,
          },
        });

        if (!existingRequest) {
          throw new Error("Revision request not found");
        }

        // Update revision request
        const revisionRequest = await ctx.prisma.revisionRequest.update({
          where: { id },
          data: {
            ...(input.title && { title: input.title }),
            ...(input.description && { description: input.description }),
            ...(input.type && { revisionType: input.type }),
            ...(input.status && { status: input.status }),
            assignedToId:
              input.assignedToId !== undefined ? input.assignedToId : null,
          },
        });

        // Create timeline entry
        await ctx.prisma.revisionTimeline.create({
          data: {
            revisionRequestId: id,
            eventType: "UPDATED",
            eventDescription: "Revision request updated",
            performedById: user!.id,
            companyId: user!.companyId,
          },
        });

        return revisionRequest;
      },
    });

    // Submit revision request for approval
    t.field("submitRevisionRequest", {
      type: "RevisionRequest",
      args: { id: nonNull(intArg()) },
      async resolve(_parent, { id }, ctx: Context) {
        requireAuth(ctx);

        const { user } = ctx;

        const revisionRequest = await ctx.prisma.revisionRequest.update({
          where: {
            id,
            companyId: user!.companyId,
          },
          data: {
            status: "IN_PROGRESS",
            approvalLevel: 1,
          },
        });

        // Create timeline entry
        await ctx.prisma.revisionTimeline.create({
          data: {
            revisionRequestId: id,
            eventType: "SUBMITTED",
            eventDescription: "Revision request submitted for approval",
            performedById: user!.id,
            companyId: user!.companyId,
          },
        });

        return revisionRequest;
      },
    });

    // Approve/Reject revision request
    t.field("processRevisionRequest", {
      type: "RevisionRequest",
      args: {
        id: nonNull(intArg()),
        approve: nonNull("Boolean"),
        comments: stringArg(),
      },
      async resolve(_parent, { id, approve, comments }, ctx: Context) {
        requireAuth(ctx);

        const { user } = ctx;

        const status = approve ? "COMPLETED" : "CANCELLED";
        const eventType = approve ? "APPROVED" : "REJECTED";

        const revisionRequest = await ctx.prisma.revisionRequest.update({
          where: {
            id,
            companyId: user!.companyId,
          },
          data: {
            status,
          },
        });

        // Create timeline entry
        await ctx.prisma.revisionTimeline.create({
          data: {
            revisionRequestId: id,
            eventType,
            eventDescription: `Revision request ${
              approve ? "approved" : "rejected"
            }${comments ? `: ${comments}` : ""}`,
            performedById: user!.id,
            companyId: user!.companyId,
          },
        });

        return revisionRequest;
      },
    });

    // Mark revision as implemented
    t.field("implementRevisionRequest", {
      type: "RevisionRequest",
      args: {
        id: nonNull(intArg()),
        comments: stringArg(),
      },
      async resolve(_parent, { id, comments }, ctx: Context) {
        requireAuth(ctx);

        const { user } = ctx;

        const revisionRequest = await ctx.prisma.revisionRequest.update({
          where: {
            id,
            companyId: user!.companyId,
          },
          data: {
            status: "COMPLETED",
          },
        });

        // Create timeline entry
        await ctx.prisma.revisionTimeline.create({
          data: {
            revisionRequestId: id,
            eventType: "IMPLEMENTED",
            eventDescription: `Revision request implemented${
              comments ? `: ${comments}` : ""
            }`,
            performedById: user!.id,
            companyId: user!.companyId,
          },
        });

        return revisionRequest;
      },
    });
  },
});

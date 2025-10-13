import { intArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const productionQueries = (t: any) => {
  // Get Production Tracking
  t.field("productionTracking", {
    type: "ProductionTracking",
    args: {
      id: intArg(),
      orderId: intArg(),
      sampleId: intArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      requireAuth(context);

      const where: any = {};

      if (args.id) {
        where.id = args.id;
      } else if (args.orderId) {
        where.orderId = args.orderId;
      } else if (args.sampleId) {
        where.sampleId = args.sampleId;
      }

      const production = await context.prisma.productionTracking.findFirst({
        where,
        include: {
          order: true,
          sample: true,
          company: true,
          stageUpdates: {
            orderBy: { createdAt: "asc" },
          },
          qualityControls: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return production;
    },
  });
};

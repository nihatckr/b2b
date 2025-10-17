import { intArg } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const productionQueries = (t: any) => {
  // Get All Production Tracking
  t.list.field("allProductionTracking", {
    type: "ProductionTracking",
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Build where clause based on user role
      const where: any = {};

      if (user.role === "ADMIN") {
        // Admins see all production tracking
      } else {
        // Non-admins only see production related to their orders/samples
        where.OR = [
          // Orders where user is customer
          {
            order: {
              customerId: userId,
            },
          },
          // Orders where user is manufacturer
          {
            order: {
              manufactureId: userId,
            },
          },
          // Orders where user's company is involved
          {
            order: {
              manufacture: {
                companyId: user.companyId,
              },
            },
          },
          // Samples where user is customer
          {
            sample: {
              customerId: userId,
            },
          },
          // Samples where user is manufacturer
          {
            sample: {
              manufactureId: userId,
            },
          },
          // Samples where user's company is involved
          {
            sample: {
              manufacture: {
                companyId: user.companyId,
              },
            },
          },
        ];
      }

      const productions = await context.prisma.productionTracking.findMany({
        where,
        include: {
          order: {
            include: {
              collection: true,
              customer: true,
              manufacture: true,
            },
          },
          sample: {
            include: {
              collection: true,
              customer: true,
              manufacture: true,
            },
          },
          company: true,
          stageUpdates: {
            orderBy: { createdAt: "asc" },
          },
          qualityControls: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return productions;
    },
  });

  // Get Production Tracking
  t.field("productionTracking", {
    type: "ProductionTracking",
    args: {
      id: intArg(),
      orderId: intArg(),
      sampleId: intArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

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
          order: {
            include: {
              collection: true,
              customer: true,
              manufacture: true,
            },
          },
          sample: {
            include: {
              collection: true,
              customer: true,
              manufacture: true,
            },
          },
          company: true,
          stageUpdates: {
            orderBy: { createdAt: "asc" },
          },
          qualityControls: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!production) {
        throw new Error("Production tracking not found");
      }

      // Permission check - only allow access if user is involved
      const isAdmin = user.role === "ADMIN";
      const isOrderCustomer = production.order?.customerId === userId;
      const isOrderManufacturer = production.order?.manufactureId === userId;
      const isOrderCompanyMember = production.order?.manufacture?.companyId === user.companyId;
      const isSampleCustomer = production.sample?.customerId === userId;
      const isSampleManufacturer = production.sample?.manufactureId === userId;
      const isSampleCompanyMember = production.sample?.manufacture?.companyId === user.companyId;

      if (!isAdmin && !isOrderCustomer && !isOrderManufacturer && !isOrderCompanyMember &&
          !isSampleCustomer && !isSampleManufacturer && !isSampleCompanyMember) {
        throw new Error("Not authorized to view this production tracking");
      }

      return production;
    },
  });
};

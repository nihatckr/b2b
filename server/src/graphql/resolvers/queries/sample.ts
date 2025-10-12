import { booleanArg, intArg, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const sampleQueries = (t: any) => {
  t.list.field("samples", {
    type: "Sample",
    args: {
      search: stringArg(),
      status: stringArg(),
      customerId: intArg(),
      collectionId: intArg(),
      manufactureId: intArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      // Build where clause
      const where: any = {};

      if (args.search) {
        where.OR = [
          { sampleNumber: { contains: args.search, mode: "insensitive" } },
          { customerNote: { contains: args.search, mode: "insensitive" } },
          {
            collection: {
              name: { contains: args.search, mode: "insensitive" },
            },
          },
        ];
      }

      if (args.status) {
        where.status = args.status;
      }

      if (args.customerId) {
        where.customerId = args.customerId;
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.manufactureId) {
        where.manufactureId = args.manufactureId;
      }

      // Non-admin users can only see their own samples (as customer or manufacture)
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      if (userId && currentUser?.role !== "ADMIN") {
        where.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      return context.prisma.sample.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 50,
        skip: args.skip || 0,
      });
    },
  });

  t.field("sample", {
    type: "Sample",
    args: {
      id: intArg(),
      sampleNumber: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      if (!args.id && !args.sampleNumber) {
        throw new Error("Either id or sampleNumber must be provided.");
      }

      const where = args.id
        ? { id: args.id }
        : { sampleNumber: args.sampleNumber };

      const sample = await context.prisma.sample.findUnique({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!sample) {
        throw new Error("Sample not found.");
      }

      // Check access permissions
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      // Admin can see all, users can see their own samples (as customer or manufacture)
      if (
        userId &&
        currentUser?.role !== "ADMIN" &&
        sample.customerId !== userId &&
        sample.manufactureId !== userId
      ) {
        throw new Error("Access denied.");
      }

      return sample;
    },
  });

  t.list.field("mySamples", {
    type: "Sample",
    args: {
      status: stringArg(),
      collectionId: intArg(),
      asCustomer: booleanArg(), // true: müşteri olarak talep ettiklerim, false: üretici olarak aldıklarım
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const where: any = {};

      // Kullanıcı müşteri veya üretici olarak samples'ları alabilir
      if (args.asCustomer !== undefined) {
        where[args.asCustomer ? "customerId" : "manufactureId"] = userId;
      } else {
        // Varsayılan: hem müşteri hem üretici olarak olan samples
        where.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      if (args.status) {
        where.status = args.status;
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      return context.prisma.sample.findMany({
        where,
        include: {
          collection: {
            include: {
              category: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          manufacture: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 20,
        skip: args.skip || 0,
      });
    },
  });

  t.field("sampleStats", {
    type: "SampleStats",
    resolve: async (_parent: any, _args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // Build base filter for non-admin users
      let baseFilter: any = {};
      if (currentUser?.role !== "ADMIN") {
        baseFilter.OR = [{ customerId: userId }, { manufactureId: userId }];
      }

      const [
        totalSamples,
        requestedSamples,
        shippedSamples,
        deliveredSamples,
        inProductionSamples,
      ] = await Promise.all([
        context.prisma.sample.count({ where: baseFilter }),
        context.prisma.sample.count({
          where: { ...baseFilter, status: "REQUESTED" },
        }),
        context.prisma.sample.count({
          where: { ...baseFilter, status: "SHIPPED" },
        }),
        context.prisma.sample.count({
          where: { ...baseFilter, status: "DELIVERED" },
        }),
        context.prisma.sample.count({
          where: { ...baseFilter, status: "IN_PRODUCTION" },
        }),
      ]);

      return {
        totalSamples,
        requestedSamples,
        shippedSamples,
        deliveredSamples,
        inProductionSamples,
      };
    },
  });
};

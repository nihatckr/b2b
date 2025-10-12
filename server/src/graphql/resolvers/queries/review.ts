import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const reviewQueries = (t: any) => {
  t.list.field("reviews", {
    type: "Review",
    args: {
      search: stringArg(),
      collectionId: intArg(),
      customerId: intArg(),
      minRating: intArg(),
      maxRating: intArg(),
      isApproved: booleanArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      // Build where clause
      const where: any = {};

      if (args.search) {
        where.comment = { contains: args.search, mode: "insensitive" };
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.customerId) {
        where.customerId = args.customerId;
      }

      if (args.minRating || args.maxRating) {
        where.rating = {};
        if (args.minRating) where.rating.gte = args.minRating;
        if (args.maxRating) where.rating.lte = args.maxRating;
      }

      if (args.isApproved !== undefined) {
        where.isApproved = args.isApproved;
      }

      // Non-admin users can only see approved reviews or their own reviews
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      if (userId && currentUser?.role !== "ADMIN") {
        const accessFilter = {
          OR: [
            { isApproved: true },
            { customerId: userId },
            // Manufacturer can see reviews for their collections
            {
              collection: {
                authorId: userId,
              },
            },
          ],
        };

        where.OR = accessFilter.OR;
      }

      return context.prisma.review.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 50,
        skip: args.skip || 0,
      });
    },
  });

  t.field("review", {
    type: "Review",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
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
        },
      });

      if (!review) {
        throw new Error("Review not found.");
      }

      // Check access permissions
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      // Admin can see all, others can see approved reviews or their own reviews or reviews for their collections
      if (
        userId &&
        currentUser?.role !== "ADMIN" &&
        !review.isApproved &&
        review.customerId !== userId &&
        review.collection.authorId !== userId
      ) {
        throw new Error("Access denied.");
      }

      return review;
    },
  });

  t.list.field("myReviews", {
    type: "Review",
    args: {
      collectionId: intArg(),
      isApproved: booleanArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const where: any = {
        customerId: userId,
      };

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      if (args.isApproved !== undefined) {
        where.isApproved = args.isApproved;
      }

      return context.prisma.review.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 20,
        skip: args.skip || 0,
      });
    },
  });

  t.list.field("collectionReviews", {
    type: "Review",
    args: {
      collectionId: nonNull(intArg()),
      isApproved: booleanArg(),
      take: intArg(),
      skip: intArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);

      const where: any = {
        collectionId: args.collectionId,
      };

      // Check if user is the manufacturer of this collection
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        select: { authorId: true },
      });

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId || 0 },
        select: { role: true },
      });

      // Non-admin users and non-owners can only see approved reviews
      if (
        userId &&
        currentUser?.role !== "ADMIN" &&
        collection?.authorId !== userId
      ) {
        where.isApproved = true;
      } else if (args.isApproved !== undefined) {
        where.isApproved = args.isApproved;
      }

      return context.prisma.review.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        take: args.take || 20,
        skip: args.skip || 0,
      });
    },
  });

  t.field("reviewStats", {
    type: "ReviewStats",
    args: {
      collectionId: intArg(), // Specific collection stats
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // Build base filter
      let baseFilter: any = {};

      if (args.collectionId) {
        baseFilter.collectionId = args.collectionId;
      } else if (currentUser?.role !== "ADMIN") {
        // Non-admin users get stats for their own reviews or collections they own
        baseFilter.OR = [
          { customerId: userId },
          { collection: { authorId: userId } },
        ];
      }

      const [
        totalReviews,
        approvedReviews,
        pendingReviews,
        averageRating,
        ratingDistribution,
      ] = await Promise.all([
        context.prisma.review.count({ where: baseFilter }),
        context.prisma.review.count({
          where: { ...baseFilter, isApproved: true },
        }),
        context.prisma.review.count({
          where: { ...baseFilter, isApproved: false },
        }),
        context.prisma.review.aggregate({
          where: { ...baseFilter, isApproved: true },
          _avg: { rating: true },
        }),
        // Get rating distribution (1-5 stars)
        Promise.all([
          context.prisma.review.count({
            where: { ...baseFilter, isApproved: true, rating: 1 },
          }),
          context.prisma.review.count({
            where: { ...baseFilter, isApproved: true, rating: 2 },
          }),
          context.prisma.review.count({
            where: { ...baseFilter, isApproved: true, rating: 3 },
          }),
          context.prisma.review.count({
            where: { ...baseFilter, isApproved: true, rating: 4 },
          }),
          context.prisma.review.count({
            where: { ...baseFilter, isApproved: true, rating: 5 },
          }),
        ]),
      ]);

      return {
        totalReviews,
        approvedReviews,
        pendingReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: {
          oneStar: ratingDistribution[0],
          twoStar: ratingDistribution[1],
          threeStar: ratingDistribution[2],
          fourStar: ratingDistribution[3],
          fiveStar: ratingDistribution[4],
        },
      };
    },
  });
};

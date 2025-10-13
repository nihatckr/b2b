import { booleanArg, intArg } from "nexus";
import { Context } from "../context";

export const reviewQueries = (t: any) => {
  // Get Collection Reviews
  t.list.field("collectionReviews", {
    type: "Review",
    args: {
      collectionId: "Int",
      approvedOnly: booleanArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const where: any = {
        collectionId: args.collectionId,
      };

      // Default: show only approved reviews for public
      if (args.approvedOnly !== false) {
        where.isApproved = true;
      }

      const reviews = await context.prisma.review.findMany({
        where,
        include: {
          collection: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  });

  // Get Collection Average Rating
  t.float("collectionAverageRating", {
    args: {
      collectionId: intArg(),
    },
    resolve: async (_parent: unknown, args: any, context: Context) => {
      const reviews = await context.prisma.review.findMany({
        where: {
          collectionId: args.collectionId,
          isApproved: true, // Only count approved reviews
        },
      });

      if (reviews.length === 0) return 0;

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / reviews.length;
    },
  });

  // Get My Reviews
  t.list.field("myReviews", {
    type: "Review",
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const reviews = await context.prisma.review.findMany({
        where: { customerId: userId },
        include: {
          collection: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  });

  // Get Pending Reviews (for manufacturers)
  t.list.field("pendingReviews", {
    type: "Review",
    resolve: async (_parent: unknown, _args: any, context: Context) => {
      const userId = context.userId;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get reviews for manufacturer's collections
      const reviews = await context.prisma.review.findMany({
        where: {
          isApproved: false,
          collection: {
            authorId: userId,
          },
        },
        include: {
          collection: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews;
    },
  });
};

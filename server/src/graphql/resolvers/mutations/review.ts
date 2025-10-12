import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { getUserId } from "../../../utils/userUtils";

export const reviewMutations = (t: any) => {
  t.field("createReview", {
    type: "Review",
    args: {
      collectionId: nonNull(intArg()),
      rating: nonNull(intArg()),
      comment: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
      }

      // Validate collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: args.collectionId },
        include: { author: true },
      });

      if (!collection || !collection.isActive) {
        throw new Error("Collection not found or not active.");
      }

      // Customer cannot review their own collection
      if (collection.authorId === userId) {
        throw new Error("You cannot review your own collection.");
      }

      // Check if user has already reviewed this collection
      const existingReview = await context.prisma.review.findFirst({
        where: {
          collectionId: args.collectionId,
          customerId: userId,
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this collection.");
      }

      // Optionally: Check if user has ordered/sampled this collection
      // This adds business logic to ensure only customers who have experience with the product can review
      const hasExperience = await Promise.all([
        context.prisma.order.findFirst({
          where: {
            collectionId: args.collectionId,
            customerId: userId,
            status: "DELIVERED",
          },
        }),
        context.prisma.sample.findFirst({
          where: {
            collectionId: args.collectionId,
            customerId: userId,
            status: "DELIVERED",
          },
        }),
      ]);

      if (!hasExperience[0] && !hasExperience[1]) {
        throw new Error(
          "You can only review collections you have ordered or sampled."
        );
      }

      return context.prisma.review.create({
        data: {
          rating: args.rating,
          comment: args.comment,
          isApproved: false, // Reviews need manufacturer approval
          collectionId: args.collectionId,
          customerId: userId,
        },
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
    },
  });

  t.field("updateReview", {
    type: "Review",
    args: {
      id: nonNull(intArg()),
      rating: intArg(),
      comment: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get review with permissions check
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) {
        throw new Error("Review not found.");
      }

      // Only the customer who wrote the review can update it
      if (review.customerId !== userId) {
        throw new Error("You can only update your own reviews.");
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date(),
        isApproved: false, // Reset approval status when review is updated
      };

      if (args.rating !== undefined) {
        if (args.rating < 1 || args.rating > 5) {
          throw new Error("Rating must be between 1 and 5.");
        }
        updateData.rating = args.rating;
      }

      if (args.comment !== undefined) {
        updateData.comment = args.comment;
      }

      return context.prisma.review.update({
        where: { id: args.id },
        data: updateData,
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
    },
  });

  t.field("approveReview", {
    type: "Review",
    args: {
      id: nonNull(intArg()),
      isApproved: nonNull(booleanArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get review with collection info
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
        include: {
          collection: true,
        },
      });

      if (!review) {
        throw new Error("Review not found.");
      }

      // Only the manufacturer of the collection can approve/reject reviews
      if (review.collection.authorId !== userId) {
        throw new Error(
          "You can only approve reviews for your own collections."
        );
      }

      return context.prisma.review.update({
        where: { id: args.id },
        data: {
          isApproved: args.isApproved,
          updatedAt: new Date(),
        },
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
    },
  });

  t.field("deleteReview", {
    type: "Boolean",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get review with permissions check
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
        include: {
          collection: true,
        },
      });

      if (!review) {
        throw new Error("Review not found.");
      }

      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // Customer who wrote it, collection owner, or admin can delete
      const canDelete =
        review.customerId === userId ||
        review.collection.authorId === userId ||
        currentUser?.role === "ADMIN";

      if (!canDelete) {
        throw new Error("You don't have permission to delete this review.");
      }

      await context.prisma.review.delete({
        where: { id: args.id },
      });

      return true;
    },
  });

  t.field("reportReview", {
    type: "Review",
    args: {
      id: nonNull(intArg()),
      reason: stringArg(),
    },
    resolve: async (_parent: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required.");
      }

      // Get review
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) {
        throw new Error("Review not found.");
      }

      // For now, we'll just mark it as not approved
      // In a full system, you'd create a separate reporting system
      return context.prisma.review.update({
        where: { id: args.id },
        data: {
          isApproved: false,
          updatedAt: new Date(),
        },
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
    },
  });
};

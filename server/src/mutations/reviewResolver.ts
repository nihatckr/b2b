import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const reviewMutations = (t: any) => {
  // Create Review
  t.field("createReview", {
    type: "Review",
    args: {
      input: nonNull("CreateReviewInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Validate rating
      if (input.rating < 1 || input.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Check collection exists
      const collection = await context.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Check if user already reviewed this collection
      const existingReview = await context.prisma.review.findFirst({
        where: {
          collectionId: input.collectionId,
          customerId: userId,
        },
      });

      if (existingReview) {
        throw new Error("You have already reviewed this collection");
      }

      // Create review
      const review = await context.prisma.review.create({
        data: {
          rating: input.rating,
          comment: input.comment || null,
          collectionId: input.collectionId,
          customerId: userId,
          isApproved: false, // Requires manufacturer approval
        },
        include: {
          collection: true,
          customer: true,
        },
      });

      return review;
    },
  });

  // Approve/Reject Review (Manufacturer only)
  t.field("approveReview", {
    type: "Review",
    args: {
      input: nonNull("ApproveReviewInput"),
    },
    resolve: async (
      _parent: unknown,
      { input }: { input: any },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const review = await context.prisma.review.findUnique({
        where: { id: input.id },
        include: { collection: true },
      });

      if (!review) {
        throw new Error("Review not found");
      }

      // Only collection author/manufacturer or admin can approve
      if (review.collection.authorId !== userId && userRole !== "ADMIN") {
        throw new Error("Only manufacturer can approve reviews");
      }

      const updatedReview = await context.prisma.review.update({
        where: { id: input.id },
        data: { isApproved: input.isApproved },
        include: {
          collection: true,
          customer: true,
        },
      });

      return updatedReview;
    },
  });

  // Delete Review
  t.field("deleteReview", {
    type: "Review",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const review = await context.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new Error("Review not found");
      }

      // Only review author or admin can delete
      if (review.customerId !== userId && userRole !== "ADMIN") {
        throw new Error("Not authorized to delete this review");
      }

      const deletedReview = await context.prisma.review.delete({
        where: { id },
        include: {
          collection: true,
          customer: true,
        },
      });

      return deletedReview;
    },
  });
};

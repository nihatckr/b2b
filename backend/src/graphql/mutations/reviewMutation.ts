import builder from "../builder";

// Create review
builder.mutationField("createReview", (t) =>
  t.prismaField({
    type: "Review",
    args: {
      collectionId: t.arg.int({ required: true }),
      rating: t.arg.int({ required: true }),
      comment: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      const data: any = {
        rating: args.rating,
        collectionId: args.collectionId,
        customerId: context.user?.id || 0,
        isApproved: true,
      };

      if (args.comment !== null && args.comment !== undefined)
        data.comment = args.comment;

      return context.prisma.review.create({
        ...query,
        data,
      });
    },
  })
);

// Update review
builder.mutationField("updateReview", (t) =>
  t.prismaField({
    type: "Review",
    args: {
      id: t.arg.int({ required: true }),
      rating: t.arg.int(),
      comment: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) throw new Error("Review not found");
      if (
        review.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};
      if (args.rating !== null && args.rating !== undefined) {
        if (args.rating < 1 || args.rating > 5) {
          throw new Error("Rating must be between 1 and 5");
        }
        updateData.rating = args.rating;
      }
      if (args.comment !== null && args.comment !== undefined)
        updateData.comment = args.comment;

      return context.prisma.review.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Delete review
builder.mutationField("deleteReview", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) throw new Error("Review not found");
      if (
        review.customerId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.review.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

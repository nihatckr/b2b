import builder from "../builder";

// Approve Review (manufacturer)
builder.mutationField("approveReview", (t) =>
  t.prismaField({
    type: "Review",
    args: {
      id: t.arg.int({ required: true }),
      isApproved: t.arg.boolean({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const review = await context.prisma.review.findUnique({
        where: { id: args.id },
        include: { collection: true },
      });

      if (!review) throw new Error("Review not found");
      if (review.collection?.authorId !== context.user.id) {
        throw new Error("Not authorized to approve this review");
      }

      return context.prisma.review.update({
        ...query,
        where: { id: args.id },
        data: { isApproved: args.isApproved },
      });
    },
  })
);

// Delete Question
builder.mutationField("deleteQuestion", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const question = await context.prisma.question.findUnique({
        where: { id: args.id },
      });

      if (!question) throw new Error("Question not found");
      if (
        question.customerId !== context.user.id &&
        question.manufactureId !== context.user.id
      ) {
        throw new Error("Not authorized");
      }

      await context.prisma.question.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

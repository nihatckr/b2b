import { inputObjectType, objectType } from "nexus";

export const Review = objectType({
  name: "Review",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("rating"); // 1-5 stars
    t.string("comment");
    t.nonNull.boolean("isApproved");
    t.nonNull.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Relations
    t.field("collection", {
      type: "Collection",
      resolve: async (parent, _args, context) => {
        return context.prisma.collection.findUnique({
          where: { id: parent.collectionId },
        });
      },
    });

    t.field("customer", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.customerId },
        });
      },
    });
  },
});

export const CreateReviewInput = inputObjectType({
  name: "CreateReviewInput",
  definition(t) {
    t.nonNull.int("collectionId");
    t.nonNull.int("rating"); // 1-5
    t.string("comment");
  },
});

export const ApproveReviewInput = inputObjectType({
  name: "ApproveReviewInput",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.boolean("isApproved");
  },
});

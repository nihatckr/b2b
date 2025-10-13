import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const likeMutations = (t: any) => {
  // Toggle favorite (like/unlike)
  t.field("toggleFavoriteCollection", {
    type: "Collection",
    args: {
      collectionId: nonNull(intArg()),
    },
    resolve: async (
      _root: unknown,
      { collectionId }: { collectionId: number },
      ctx: Context
    ) => {
      const user = await requireAuth(ctx);

      // Check if already favorited
      const existingFavorite =
        await ctx.prisma.userFavoriteCollection.findUnique({
          where: {
            userId_collectionId: {
              userId: user,
              collectionId,
            },
          },
        });

      if (existingFavorite) {
        // Unlike: Remove from favorites and decrease count
        await ctx.prisma.userFavoriteCollection.delete({
          where: { id: existingFavorite.id },
        });

        await ctx.prisma.collection.update({
          where: { id: collectionId },
          data: {
            likesCount: { decrement: 1 },
          },
        });
      } else {
        // Like: Add to favorites and increase count
        await ctx.prisma.userFavoriteCollection.create({
          data: {
            userId: user,
            collectionId,
          },
        });

        await ctx.prisma.collection.update({
          where: { id: collectionId },
          data: {
            likesCount: { increment: 1 },
          },
        });
      }

      // Return updated collection
      return ctx.prisma.collection.findUnique({
        where: { id: collectionId },
      });
    },
  });
};

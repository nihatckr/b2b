import builder from "../builder";

// Like Collection
builder.mutationField("likeCollection", (t) =>
  t.prismaField({
    type: "UserFavoriteCollection",
    args: {
      collectionId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      // Check if already liked
      const existing = await context.prisma.userFavoriteCollection.findUnique({
        where: {
          userId_collectionId: {
            userId: context.user.id,
            collectionId: args.collectionId,
          },
        },
      });

      if (existing) {
        throw new Error("Already liked this collection");
      }

      // Create favorite and increment likesCount
      const like = await context.prisma.userFavoriteCollection.create({
        ...query,
        data: {
          userId: context.user.id,
          collectionId: args.collectionId,
        },
      });

      await context.prisma.collection.update({
        where: { id: args.collectionId },
        data: { likesCount: { increment: 1 } },
      });

      return like;
    },
  })
);

// Unlike Collection
builder.mutationField("unlikeCollection", (t) =>
  t.prismaField({
    type: "UserFavoriteCollection",
    args: {
      collectionId: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const like = await context.prisma.userFavoriteCollection.findUnique({
        where: {
          userId_collectionId: {
            userId: context.user.id,
            collectionId: args.collectionId,
          },
        },
        ...query,
      });

      if (!like) {
        throw new Error("Collection not liked");
      }

      // Delete favorite and decrement likesCount
      await context.prisma.userFavoriteCollection.delete({
        where: {
          userId_collectionId: {
            userId: context.user.id,
            collectionId: args.collectionId,
          },
        },
      });

      await context.prisma.collection.update({
        where: { id: args.collectionId },
        data: { likesCount: { decrement: 1 } },
      });

      return like;
    },
  })
);

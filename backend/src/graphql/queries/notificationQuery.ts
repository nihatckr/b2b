import builder from "../builder";

// Get notifications (user-specific)
builder.queryField("notifications", (t) =>
  t.prismaField({
    type: ["Notification"],
    args: {
      isRead: t.arg.boolean(),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {
        userId: context.user?.id || 0,
      };

      if (args.isRead !== null && args.isRead !== undefined)
        where.isRead = args.isRead;

      return context.prisma.notification.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        ...(args.skip !== null && args.skip !== undefined
          ? { skip: args.skip }
          : {}),
        ...(args.take !== null && args.take !== undefined
          ? { take: args.take }
          : {}),
      });
    },
  })
);

// Get unread notification count
builder.queryField("unreadNotificationCount", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const count = await context.prisma.notification.count({
        where: {
          userId: context.user?.id || 0,
          isRead: false,
        },
      });
      return count;
    },
  })
);

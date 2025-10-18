import builder from "../builder";

// Mark notification as read
builder.mutationField("markNotificationAsRead", (t) =>
  t.prismaField({
    type: "Notification",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const notification = await context.prisma.notification.findUnique({
        where: { id: args.id },
      });

      if (!notification) throw new Error("Notification not found");
      if (
        notification.userId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      return context.prisma.notification.update({
        ...query,
        where: { id: args.id },
        data: { isRead: true },
      });
    },
  })
);

// Mark all notifications as read
builder.mutationField("markAllNotificationsAsRead", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const result = await context.prisma.notification.updateMany({
        where: {
          userId: context.user?.id || 0,
          isRead: false,
        },
        data: { isRead: true },
      });
      return result.count;
    },
  })
);

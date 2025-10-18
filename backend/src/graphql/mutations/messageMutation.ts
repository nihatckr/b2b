import builder from "../builder";

// Send message
builder.mutationField("sendMessage", (t) =>
  t.prismaField({
    type: "Message",
    args: {
      content: t.arg.string({ required: true }),
      orderId: t.arg.int(),
      sampleId: t.arg.int(),
      recipientId: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const data: any = {
        content: args.content,
        senderId: context.user?.id || 0,
      };

      if (args.orderId !== null && args.orderId !== undefined)
        data.orderId = args.orderId;
      if (args.sampleId !== null && args.sampleId !== undefined)
        data.sampleId = args.sampleId;
      if (args.recipientId !== null && args.recipientId !== undefined)
        data.recipientId = args.recipientId;

      return context.prisma.message.create({
        ...query,
        data,
      });
    },
  })
);

// Delete message
builder.mutationField("deleteMessage", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const message = await context.prisma.message.findUnique({
        where: { id: args.id },
      });

      if (!message) throw new Error("Message not found");
      if (
        message.senderId !== context.user?.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      await context.prisma.message.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

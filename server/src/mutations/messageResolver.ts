import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const messageMutations = (t: any) => {
  // Send Message
  t.field("sendMessage", {
    type: "Message",
    args: {
      input: nonNull("CreateMessageInput"),
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

      // Ürün bazlı mesaj için order veya sample kontrolü
      if (input.orderId) {
        const order = await context.prisma.order.findUnique({
          where: { id: input.orderId },
        });
        if (!order) {
          throw new Error("Order not found");
        }
        // Kullanıcı bu siparişin müşterisi veya üreticisi olmalı
        if (
          order.customerId !== userId &&
          order.manufactureId !== userId &&
          user.role !== "ADMIN"
        ) {
          throw new Error("Not authorized to send message for this order");
        }
      }

      if (input.sampleId) {
        const sample = await context.prisma.sample.findUnique({
          where: { id: input.sampleId },
        });
        if (!sample) {
          throw new Error("Sample not found");
        }
        // Kullanıcı bu numunenin müşterisi veya üreticisi olmalı
        if (
          sample.customerId !== userId &&
          sample.manufactureId !== userId &&
          user.role !== "ADMIN"
        ) {
          throw new Error("Not authorized to send message for this sample");
        }
      }

      // Create message
      const message = await context.prisma.message.create({
        data: {
          content: input.content,
          senderId: userId,
          receiverId: input.receiverId || null,
          type: input.type || "general",
          orderId: input.orderId || null,
          sampleId: input.sampleId || null,
          companyId: input.companyId || user.companyId || null,
          isRead: false,
        },
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
      });

      return message;
    },
  });

  // Mark Message as Read
  t.field("markMessageAsRead", {
    type: "Message",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const message = await context.prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        throw new Error("Message not found");
      }

      // Only receiver can mark as read
      if (message.receiverId && message.receiverId !== userId) {
        throw new Error("Not authorized to mark this message as read");
      }

      const updatedMessage = await context.prisma.message.update({
        where: { id },
        data: { isRead: true },
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
      });

      return updatedMessage;
    },
  });

  // Delete Message
  t.field("deleteMessage", {
    type: "Message",
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

      const message = await context.prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        throw new Error("Message not found");
      }

      // Only sender or admin can delete
      if (message.senderId !== userId && user.role !== "ADMIN") {
        throw new Error("Not authorized to delete this message");
      }

      const deletedMessage = await context.prisma.message.delete({
        where: { id },
        include: {
          sender: true,
          receiver: true,
          order: true,
          sample: true,
          company: true,
        },
      });

      return deletedMessage;
    },
  });
};

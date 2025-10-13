import { intArg, nonNull } from "nexus";
import { Context } from "../context";
import { requirePermission } from "../utils/permissions";
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

      // Permission check
      if (user.role !== "ADMIN") {
        requirePermission(user, "messages", "send");
      }

      // Create message
      const message = await context.prisma.message.create({
        data: {
          content: input.content,
          senderId: userId,
          receiver: input.receiver || null,
          type: input.type || "direct",
          companyId: input.companyId || user.companyId || null,
          isRead: false,
        },
        include: {
          sender: true,
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
      if (
        message.receiver &&
        message.receiver !== userId.toString() &&
        message.receiver !== "all"
      ) {
        throw new Error("Not authorized to mark this message as read");
      }

      const updatedMessage = await context.prisma.message.update({
        where: { id },
        data: { isRead: true },
        include: {
          sender: true,
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
          company: true,
        },
      });

      return deletedMessage;
    },
  });
};

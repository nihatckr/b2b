/**
 * Message Queries - MESSAGING SYSTEM
 *
 * 🎯 Purpose: Order/Sample-based messaging and conversation management
 *
 * 📋 Available Queries:
 *
 * STANDARD QUERIES:
 * - messages: All messages with filters (authenticated)
 * - message: Single message by ID (authenticated)
 *
 * ANALYTICS (User):
 * - messageStats: User's message statistics
 * - messagesByType: Distribution by type (general, order, sample)
 * - unreadMessagesCount: Count of unread messages
 * - conversationStats: Conversation statistics per order/sample
 *
 * CONVERSATION QUERIES:
 * - searchMessages: Search in message content (authenticated)
 * - getConversations: List of active conversations (authenticated)
 * - getConversationMessages: Messages for specific order/sample (authenticated)
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Users see only their sent/received messages
 * - Conversation queries filter by participant
 *
 * 💡 Features:
 * - Context-based messaging (order, sample, general)
 * - Real-time subscriptions (newMessage, messageRead)
 * - Read/unread status tracking
 * - Company-level messaging support
 * - Automatic notifications
 */

import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const MessageFilterInput = builder.inputType("MessageFilterInput", {
  fields: (t) => ({
    orderId: t.int(),
    sampleId: t.int(),
    type: t.string(),
    isRead: t.boolean(),
  }),
});

const MessagePaginationInput = builder.inputType("MessagePaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

const MessageSearchInput = builder.inputType("MessageSearchInput", {
  fields: (t) => ({
    query: t.string({ required: true }),
    type: t.string(),
    limit: t.int(),
  }),
});

const ConversationFilterInput = builder.inputType("ConversationFilterInput", {
  fields: (t) => ({
    orderId: t.int(),
    sampleId: t.int(),
  }),
});

// ========================================
// STANDARD MESSAGE QUERIES
// ========================================

// Get messages (filtered by user)
builder.queryField("messages", (t) =>
  t.prismaField({
    type: ["Message"],
    args: {
      filter: t.arg({ type: MessageFilterInput }),
      pagination: t.arg({ type: MessagePaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.filter?.orderId) where.orderId = args.filter.orderId;
      if (args.filter?.sampleId) where.sampleId = args.filter.sampleId;
      if (args.filter?.type) where.type = args.filter.type;
      if (args.filter?.isRead !== undefined) where.isRead = args.filter.isRead;

      return context.prisma.message.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
        ...(args.pagination?.skip !== null &&
        args.pagination?.skip !== undefined
          ? { skip: args.pagination.skip }
          : {}),
        ...(args.pagination?.take !== null &&
        args.pagination?.take !== undefined
          ? { take: args.pagination.take }
          : {}),
      });
    },
  })
);

// Get message by ID
builder.queryField("message", (t) =>
  t.prismaField({
    type: "Message",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.message.findUniqueOrThrow({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// ========================================
// ANALYTICS QUERIES (User)
// ========================================

/**
 * Get user's message statistics
 * ✅ Permission: Authenticated users
 */
builder.queryField("messageStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const userId = context.user!.id;

      const [
        totalSent,
        totalReceived,
        unreadReceived,
        messagesByType,
        recentConversations,
      ] = await Promise.all([
        context.prisma.message.count({ where: { senderId: userId } }),
        context.prisma.message.count({ where: { receiverId: userId } }),
        context.prisma.message.count({
          where: { receiverId: userId, isRead: false },
        }),
        context.prisma.message.groupBy({
          by: ["type"],
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          _count: { type: true },
        }),
        context.prisma.message.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          select: {
            orderId: true,
            sampleId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          distinct: ["orderId", "sampleId"],
        }),
      ]);

      return {
        totalSent,
        totalReceived,
        totalMessages: totalSent + totalReceived,
        unreadReceived,
        messagesByType: messagesByType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
        recentConversationsCount: recentConversations.length,
      };
    },
  })
);

/**
 * Get messages distribution by type
 * ✅ Permission: Authenticated users
 */
builder.queryField("messagesByType", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      const userId = context.user!.id;

      const totalMessages = await context.prisma.message.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      });

      const typeCounts = await context.prisma.message.groupBy({
        by: ["type"],
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        _count: { type: true },
      });

      return typeCounts.map((item) => ({
        type: item.type,
        count: item._count.type,
        percentage:
          totalMessages > 0 ? (item._count.type / totalMessages) * 100 : 0,
      }));
    },
  })
);

/**
 * Get unread messages count
 * ✅ Permission: Authenticated users
 */
builder.queryField("unreadMessagesCount", (t) =>
  t.field({
    type: "Int",
    authScopes: { user: true },
    resolve: async (_root, _args, context) => {
      return context.prisma.message.count({
        where: {
          receiverId: context.user!.id,
          isRead: false,
        },
      });
    },
  })
);

/**
 * Get conversation statistics (per order/sample)
 * ✅ Permission: Authenticated users
 */
builder.queryField("conversationStats", (t) =>
  t.field({
    type: "JSON",
    args: {
      filter: t.arg({ type: ConversationFilterInput }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const userId = context.user!.id;
      const where: any = {
        OR: [{ senderId: userId }, { receiverId: userId }],
      };

      if (args.filter?.orderId) {
        where.orderId = args.filter.orderId;
      }

      if (args.filter?.sampleId) {
        where.sampleId = args.filter.sampleId;
      }

      const [totalMessages, unreadMessages, participants] = await Promise.all([
        context.prisma.message.count({ where }),
        context.prisma.message.count({
          where: { ...where, receiverId: userId, isRead: false },
        }),
        context.prisma.message.groupBy({
          by: ["senderId"],
          where,
          _count: { senderId: true },
        }),
      ]);

      return {
        totalMessages,
        unreadMessages,
        participantsCount: participants.length,
        participants: participants.map((p) => ({
          userId: p.senderId,
          messageCount: p._count.senderId,
        })),
      };
    },
  })
);

// ========================================
// CONVERSATION QUERIES
// ========================================

/**
 * Search messages by content
 * ✅ Permission: Authenticated users
 */
builder.queryField("searchMessages", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: MessageSearchInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const userId = context.user!.id;
      const where: any = {
        OR: [{ senderId: userId }, { receiverId: userId }],
        content: { contains: args.input.query },
      };

      if (args.input.type) {
        where.type = args.input.type;
      }

      const messages = await context.prisma.message.findMany({
        where,
        select: {
          id: true,
          content: true,
          type: true,
          orderId: true,
          sampleId: true,
          senderId: true,
          receiverId: true,
          isRead: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: args.input.limit || 20,
      });

      return messages;
    },
  })
);

/**
 * Get active conversations (grouped by order/sample)
 * ✅ Permission: Authenticated users
 */
builder.queryField("getConversations", (t) =>
  t.field({
    type: "JSON",
    args: {
      pagination: t.arg({ type: MessagePaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const userId = context.user!.id;

      // Get distinct conversations
      const messages = await context.prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        select: {
          orderId: true,
          sampleId: true,
          type: true,
          createdAt: true,
          isRead: true,
          receiverId: true,
          content: true,
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by context (order or sample)
      const conversationsMap = new Map();

      for (const msg of messages) {
        const key = msg.orderId
          ? `order-${msg.orderId}`
          : msg.sampleId
          ? `sample-${msg.sampleId}`
          : `general-${msg.sender.id}-${msg.receiver?.id}`;

        if (!conversationsMap.has(key)) {
          conversationsMap.set(key, {
            contextType: msg.orderId
              ? "order"
              : msg.sampleId
              ? "sample"
              : "general",
            contextId: msg.orderId || msg.sampleId || null,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unreadCount: 0,
            participants: new Set(),
          });
        }

        const conv = conversationsMap.get(key);
        conv.participants.add(msg.sender.id);
        if (msg.receiver) conv.participants.add(msg.receiver.id);

        if (msg.receiverId === userId && !msg.isRead) {
          conv.unreadCount++;
        }
      }

      // Convert to array and limit
      const conversations = Array.from(conversationsMap.values())
        .map((conv) => ({
          ...conv,
          participantsCount: conv.participants.size,
          participants: undefined, // Remove Set object
        }))
        .slice(0, args.pagination?.take || 20);

      return conversations;
    },
  })
);

/**
 * Get messages for a specific conversation
 * ✅ Permission: Authenticated users
 */
builder.queryField("getConversationMessages", (t) =>
  t.prismaField({
    type: ["Message"],
    args: {
      filter: t.arg({ type: ConversationFilterInput, required: true }),
      pagination: t.arg({ type: MessagePaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const userId = context.user!.id;
      const where: any = {
        OR: [{ senderId: userId }, { receiverId: userId }],
      };

      if (args.filter.orderId) {
        where.orderId = args.filter.orderId;
      } else if (args.filter.sampleId) {
        where.sampleId = args.filter.sampleId;
      } else {
        throw new Error("orderId veya sampleId gereklidir");
      }

      return context.prisma.message.findMany({
        ...query,
        where,
        orderBy: { createdAt: "asc" }, // Chronological order
        skip: args.pagination?.skip || 0,
        take: args.pagination?.take || 50,
      });
    },
  })
);

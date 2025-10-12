import { compare, hash } from "bcryptjs";
import { PubSub } from "graphql-subscriptions";
import { arg, booleanArg, intArg, nonNull, objectType, stringArg } from "nexus";
import type { Context } from "../../context";
import { EmailService } from "../../services/EmailService";
import {
  generateAccessToken,
  generateRefreshToken,
  getUserId,
  requireAdmin,
  validateEmail,
  validatePassword,
  verifyRefreshToken,
} from "../../utils/userUtils";

// Create PubSub instance for real-time subscriptions
const pubsub = new PubSub();

// Subscription event constants
export const MESSAGE_SENT = "MESSAGE_SENT";
export const PRODUCTION_UPDATE = "PRODUCTION_UPDATE";
export const ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED";
export const NEW_SAMPLE_REQUEST = "NEW_SAMPLE_REQUEST";

// Export pubsub instance
export { pubsub };

// Error classes
class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class AuthorizationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    // 🔐 Auth Mutations
    t.field("signup", {
      type: "AuthPayload",
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        role: arg({ type: "Role" }),
      },
      resolve: async (_parent, args, context: Context) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("\n📝 SIGNUP ATTEMPT:", args.email);
        }

        if (!args.email || args.email.trim() === "") {
          throw new Error("Email address is required.");
        }

        if (!args.password || args.password.trim() === "") {
          throw new Error("Password is required.");
        }

        try {
          validateEmail(args.email);
        } catch (error) {
          throw new Error(
            "Please enter a valid email address (e.g., user@example.com)."
          );
        }

        try {
          validatePassword(args.password);
        } catch (error) {
          throw error;
        }

        const existingUser = await context.prisma.user.findUnique({
          where: { email: args.email },
        });

        if (existingUser) {
          throw new Error(
            "An account with this email already exists. Please login instead."
          );
        }

        const hashedPassword = await hash(args.password, 10);
        const user = await context.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            password: hashedPassword,
            role: args.role || "CUSTOMER",
            isActive: true, // Set default value
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
            profilePicture: true,
            businessLicense: true,
            taxNumber: true,
            isActive: true,
            tokenVersion: true,
          },
        });

        // Generate both access and refresh tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

        if (process.env.NODE_ENV !== "production") {
          console.log("✅ SIGNUP SUCCESS:", user.email);
        }

        // Send welcome email (async, don't block response)
        // Get full user object with companyId for email service
        const fullUser = await context.prisma.user.findUnique({
          where: { id: user.id },
        });

        if (fullUser) {
          EmailService.sendWelcomeEmail(fullUser).catch((error) => {
            console.error("Failed to send welcome email:", error);
          });
        }

        return {
          token: accessToken,
          refreshToken,
          user,
        };
      },
    });

    t.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("\n🔐 LOGIN ATTEMPT:", args.email);
        }

        const user = await context.prisma.user.findUnique({
          where: { email: args.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
            profilePicture: true,
            businessLicense: true,
            taxNumber: true,
            isActive: true,
            tokenVersion: true,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        const valid = await compare(args.password, user.password);
        if (!valid) {
          throw new Error("Invalid email or password.");
        }

        // Generate both access and refresh tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

        if (process.env.NODE_ENV !== "production") {
          console.log("✅ LOGIN SUCCESS:", user.email);
        }

        return {
          token: accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            profilePicture: user.profilePicture,
            businessLicense: user.businessLicense,
            taxNumber: user.taxNumber,
            isActive: user.isActive,
          },
        };
      },
    });

    // � Refresh Token Mutation
    t.field("refreshToken", {
      type: "AuthPayload",
      args: {
        refreshToken: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        // Verify refresh token
        const payload = verifyRefreshToken(args.refreshToken);
        if (!payload) {
          throw new Error("Invalid refresh token");
        }

        // Get user and check token version
        const user = await context.prisma.user.findUnique({
          where: { id: Number(payload.userId) },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
            profilePicture: true,
            businessLicense: true,
            taxNumber: true,
            isActive: true,
            tokenVersion: true,
          },
        });

        if (!user || !user.isActive) {
          throw new Error("User not found or inactive");
        }

        // Check token version for security
        if (user.tokenVersion !== payload.tokenVersion) {
          throw new Error("Token version mismatch - please login again");
        }

        // Generate new tokens
        const accessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(
          user.id,
          user.tokenVersion
        );

        return {
          token: accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            profilePicture: user.profilePicture,
            businessLicense: user.businessLicense,
            taxNumber: user.taxNumber,
            isActive: user.isActive,
          },
        };
      },
    });

    // 🚪 Logout Mutation (invalidate refresh tokens)
    t.field("logout", {
      type: "Boolean",
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          return true; // Already logged out
        }

        // Increment token version to invalidate all refresh tokens
        await context.prisma.user.update({
          where: { id: userId },
          data: {
            tokenVersion: {
              increment: 1,
            },
          },
        });

        return true;
      },
    });

    // �💬 Message Mutations
    t.field("sendMessage", {
      type: "Message",
      args: {
        receiverId: nonNull(intArg()),
        content: nonNull(stringArg()),
        messageType: arg({ type: "MessageType" }),
        relatedSampleId: intArg(),
        relatedOrderId: intArg(),
        relatedCollectionId: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new AuthorizationError(
            "Authentication required",
            "AUTH_REQUIRED"
          );
        }

        try {
          const receiver = await context.prisma.user.findUnique({
            where: { id: args.receiverId },
            select: { id: true, role: true, email: true },
          });

          if (!receiver) {
            throw new ValidationError(
              "Receiver not found",
              "RECEIVER_NOT_FOUND"
            );
          }

          if (!args.content || args.content.trim() === "") {
            throw new ValidationError(
              "Message content cannot be empty",
              "EMPTY_CONTENT"
            );
          }

          if (args.content.length > 2000) {
            throw new ValidationError(
              "Message content too long (max 2000 characters)",
              "CONTENT_TOO_LONG"
            );
          }

          const message = await context.prisma.message.create({
            data: {
              content: args.content.trim(),
              messageType: args.messageType || "TEXT",
              senderId: userId,
              receiverId: args.receiverId,
              isRead: false,
              relatedSampleId: args.relatedSampleId,
              relatedOrderId: args.relatedOrderId,
              relatedCollectionId: args.relatedCollectionId,
            },
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
              receiver: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });

          if (process.env.NODE_ENV !== "production") {
            console.log(
              `💬 MESSAGE SENT: ${message.sender.name} → ${message.receiver.name}`
            );
          }

          return message;
        } catch (error) {
          console.error("Error sending message:", error);
          if (
            error instanceof ValidationError ||
            error instanceof AuthorizationError
          ) {
            throw error;
          }
          throw new Error("Failed to send message");
        }
      },
    });

    t.field("markMessageAsRead", {
      type: "Message",
      args: {
        messageId: nonNull(intArg()),
      },
      resolve: async (_parent, { messageId }, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new AuthorizationError(
            "Authentication required",
            "AUTH_REQUIRED"
          );
        }

        try {
          const message = await context.prisma.message.findUnique({
            where: { id: messageId },
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
              receiver: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });

          if (!message) {
            throw new ValidationError("Message not found", "MESSAGE_NOT_FOUND");
          }

          if (message.receiverId !== userId) {
            throw new AuthorizationError(
              "You can only mark your own messages as read",
              "INSUFFICIENT_PERMISSIONS"
            );
          }

          const updatedMessage = await context.prisma.message.update({
            where: { id: messageId },
            data: {
              isRead: true,
            },
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
              receiver: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          });

          return updatedMessage;
        } catch (error) {
          console.error("Error marking message as read:", error);
          if (
            error instanceof ValidationError ||
            error instanceof AuthorizationError
          ) {
            throw error;
          }
          throw new Error("Failed to mark message as read");
        }
      },
    });

    // 🏭 Production Mutations
    t.field("updateProductionStage", {
      type: "ProductionStageUpdate",
      args: {
        productionTrackingId: nonNull(intArg()),
        stage: nonNull(arg({ type: "ProductionStage" })),
        status: nonNull(arg({ type: "ProductionStatus" })),
        note: stringArg(),
        actualStartDate: arg({ type: "DateTime" }),
        actualEndDate: arg({ type: "DateTime" }),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new AuthorizationError(
            "Authentication required",
            "AUTH_REQUIRED"
          );
        }

        try {
          const production = await context.prisma.productionTracking.findUnique(
            {
              where: { id: args.productionTrackingId },
              include: {
                order: {
                  select: {
                    customerId: true,
                    manufactureId: true,
                    customer: { select: { name: true, email: true } },
                    manufacture: { select: { name: true, email: true } },
                  },
                },
              },
            }
          );

          if (!production) {
            throw new ValidationError(
              "Production tracking not found",
              "PRODUCTION_NOT_FOUND"
            );
          }

          const user = await context.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });

          if (
            user?.role !== "MANUFACTURE" &&
            production.order &&
            userId !== production.order.manufactureId
          ) {
            throw new AuthorizationError(
              "Only manufacturers can update production stages",
              "INSUFFICIENT_PERMISSIONS"
            );
          }

          const stageUpdate = await context.prisma.productionStageUpdate.create(
            {
              data: {
                productionTrackingId: args.productionTrackingId,
                stage: args.stage,
                status: args.status,
                note: args.note,
                actualStartDate: args.actualStartDate,
                actualEndDate: args.actualEndDate,
                updatedById: userId,
              },
              include: {
                productionTracking: {
                  include: {
                    order: {
                      select: {
                        orderNumber: true,
                        customer: { select: { name: true, email: true } },
                      },
                    },
                  },
                },
              },
            }
          );

          await context.prisma.productionTracking.update({
            where: { id: args.productionTrackingId },
            data: {
              currentStage: args.stage,
              overallStatus:
                args.status === "COMPLETED" ? "IN_PROGRESS" : "IN_PROGRESS",
            },
          });

          if (process.env.NODE_ENV !== "production") {
            console.log(
              `🏭 PRODUCTION UPDATE: Stage ${args.stage} → ${args.status}`
            );
          }

          return stageUpdate;
        } catch (error) {
          console.error("Error updating production stage:", error);
          if (
            error instanceof ValidationError ||
            error instanceof AuthorizationError
          ) {
            throw error;
          }
          throw new Error("Failed to update production stage");
        }
      },
    });

    // 📦 Collection CRUD
    t.field("createCollection", {
      type: "Collection",
      args: {
        name: nonNull(stringArg()),
        description: stringArg(),
        categoryId: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        const collection = await context.prisma.collection.create({
          data: {
            name: args.name,
            description: args.description,
            slug: args.name.toLowerCase().replace(/\s+/g, "-"),
            categoryId: args.categoryId,
            userId: userId,
            companyId: 1, // Default company for now
          },
        });
        return {
          ...collection,
          images: collection.images ? JSON.stringify(collection.images) : null,
          tags: collection.tags ? JSON.stringify(collection.tags) : null,
        };
      },
    });

    // 🧪 Sample CRUD
    t.field("createSample", {
      type: "Sample",
      args: {
        collectionId: nonNull(intArg()),
        customerNote: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Get collection to find manufacturer
        const collection = await context.prisma.collection.findUnique({
          where: { id: args.collectionId },
        });

        if (!collection) {
          throw new Error("Collection not found");
        }

        const sample = await context.prisma.sample.create({
          data: {
            sampleNumber: `SMPL-${Date.now()}`,
            sampleType: "STANDARD", // Using enum value
            status: "REQUESTED",
            customerNote: args.customerNote,
            deliveryMethod: "CARGO",
            collectionId: args.collectionId,
            customerId: userId,
            manufactureId: collection.userId,
            companyId: 1, // Default company for now
          },
        });

        return sample;
      },
    });

    // � Collection Update/Delete
    t.field("updateCollection", {
      type: "Collection",
      args: {
        id: nonNull(intArg()),
        name: stringArg(),
        description: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingCollection = await context.prisma.collection.findUnique({
          where: { id: args.id },
          select: { userId: true },
        });

        if (!existingCollection) {
          throw new Error("Collection not found");
        }

        if (existingCollection.userId !== userId) {
          throw new Error("Not authorized to update this collection");
        }

        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.description !== undefined)
          updateData.description = args.description;
        if (args.isActive !== undefined) updateData.isActive = args.isActive;

        const collection = await context.prisma.collection.update({
          where: { id: args.id },
          data: updateData,
        });

        return {
          ...collection,
          images: collection.images ? JSON.stringify(collection.images) : null,
          tags: collection.tags ? JSON.stringify(collection.tags) : null,
        };
      },
    });

    t.field("deleteCollection", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingCollection = await context.prisma.collection.findUnique({
          where: { id: args.id },
          select: { userId: true },
        });

        if (!existingCollection) {
          throw new Error("Collection not found");
        }

        if (existingCollection.userId !== userId) {
          throw new Error("Not authorized to delete this collection");
        }

        await context.prisma.collection.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // 🧪 SAMPLE STATUS MANAGEMENT (Critical for workflow)
    t.field("updateSample", {
      type: "Sample",
      args: {
        id: nonNull(intArg()),
        manufacturerResponse: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership - only manufacturer can update
        const existingSample = await context.prisma.sample.findUnique({
          where: { id: args.id },
          select: { manufactureId: true },
        });

        if (!existingSample) {
          throw new Error("Sample not found");
        }

        if (existingSample.manufactureId !== userId) {
          throw new Error("Not authorized to update this sample");
        }

        const sample = await context.prisma.sample.update({
          where: { id: args.id },
          data: {
            manufacturerResponse: args.manufacturerResponse,
            updatedAt: new Date(),
          },
        });

        return sample;
      },
    });

    t.field("deleteSample", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership - customer who created or manufacturer
        const existingSample = await context.prisma.sample.findUnique({
          where: { id: args.id },
          select: { customerId: true, manufactureId: true, status: true },
        });

        if (!existingSample) {
          throw new Error("Sample not found");
        }

        if (
          existingSample.customerId !== userId &&
          existingSample.manufactureId !== userId
        ) {
          throw new Error("Not authorized to delete this sample");
        }

        // Can't delete if in production or completed
        if (
          ["IN_PRODUCTION", "COMPLETED", "SHIPPED"].includes(
            existingSample.status
          )
        ) {
          throw new Error("Cannot delete sample in current status");
        }

        await context.prisma.sample.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // 📦 ORDER MANAGEMENT (Critical Business Logic)
    t.field("createOrderFromCollection", {
      type: "Order",
      args: {
        collectionId: nonNull(intArg()),
        quantity: nonNull(intArg()),
        deliveryAddress: nonNull(stringArg()),
        customerNote: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Get collection and manufacturer info
        const collection = await context.prisma.collection.findUnique({
          where: { id: args.collectionId },
          select: { userId: true, name: true },
        });

        if (!collection) {
          throw new Error("Collection not found");
        }

        const order = await context.prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}`,
            quantity: args.quantity,
            unitPrice: 0, // Will be set by manufacturer
            totalPrice: 0, // Will be calculated when price is set
            status: "PENDING",
            deliveryAddress: args.deliveryAddress,
            customerNote: args.customerNote,
            collectionId: args.collectionId,
            customerId: userId,
            manufactureId: collection.userId,
            companyId: 1, // Default company for now
          },
        });

        return order;
      },
    });

    t.field("updateOrderPrice", {
      type: "Order",
      args: {
        id: nonNull(intArg()),
        unitPrice: nonNull(stringArg()), // Use string to avoid float parsing issues
        manufacturerNote: stringArg(),
        productionDays: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check if order exists and user is manufacturer
        const existingOrder = await context.prisma.order.findUnique({
          where: { id: args.id },
          select: { manufactureId: true, quantity: true, status: true },
        });

        if (!existingOrder) {
          throw new Error("Order not found");
        }

        if (existingOrder.manufactureId !== userId) {
          throw new Error("Not authorized to update this order");
        }

        const unitPrice = parseFloat(args.unitPrice);
        const totalPrice = existingOrder.quantity * unitPrice;

        const order = await context.prisma.order.update({
          where: { id: args.id },
          data: {
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            status: "QUOTE_SENT",
            manufacturerNote: args.manufacturerNote,
            productionDays: args.productionDays,
            updatedAt: new Date(),
          },
        });

        return order;
      },
    });

    t.field("confirmOrder", {
      type: "Order",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        const existingOrder = await context.prisma.order.findUnique({
          where: { id: args.id },
          select: { customerId: true, status: true },
        });

        if (!existingOrder) {
          throw new Error("Order not found");
        }

        if (existingOrder.customerId !== userId) {
          throw new Error("Not authorized to confirm this order");
        }

        if (existingOrder.status !== "QUOTE_SENT") {
          throw new Error("Order must have a quote to confirm");
        }

        const order = await context.prisma.order.update({
          where: { id: args.id },
          data: {
            status: "CONFIRMED",
            updatedAt: new Date(),
          },
        });

        return order;
      },
    });

    t.field("cancelOrder", {
      type: "Order",
      args: {
        id: nonNull(intArg()),
        reason: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        const existingOrder = await context.prisma.order.findUnique({
          where: { id: args.id },
          select: { customerId: true, manufactureId: true, status: true },
        });

        if (!existingOrder) {
          throw new Error("Order not found");
        }

        // Both customer and manufacturer can cancel
        if (
          existingOrder.customerId !== userId &&
          existingOrder.manufactureId !== userId
        ) {
          throw new Error("Not authorized to cancel this order");
        }

        // Can't cancel if already in production or shipped
        const nonCancellableStatuses = [
          "IN_PRODUCTION",
          "PRODUCTION_COMPLETE",
          "SHIPPED",
          "DELIVERED",
        ];
        if (nonCancellableStatuses.includes(existingOrder.status)) {
          throw new Error("Cannot cancel order in current status");
        }

        const order = await context.prisma.order.update({
          where: { id: args.id },
          data: {
            status: "CANCELLED",
            manufacturerNote: args.reason || "Order cancelled",
            updatedAt: new Date(),
          },
        });

        return order;
      },
    });

    // ⭐ REVIEW SYSTEM
    t.field("createReview", {
      type: "Review",
      args: {
        rating: nonNull(intArg()),
        comment: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Validate rating
        if (args.rating < 1 || args.rating > 5) {
          throw new Error("Rating must be between 1 and 5");
        }

        const review = await context.prisma.review.create({
          data: {
            rating: args.rating,
            comment: args.comment,
            customerId: userId,
          },
        });

        return review;
      },
    });

    t.field("updateReview", {
      type: "Review",
      args: {
        id: nonNull(intArg()),
        rating: intArg(),
        comment: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingReview = await context.prisma.review.findUnique({
          where: { id: args.id },
          select: { customerId: true },
        });

        if (!existingReview) {
          throw new Error("Review not found");
        }

        if (existingReview.customerId !== userId) {
          throw new Error("Not authorized to update this review");
        }

        const updateData: any = {};

        if (args.rating !== undefined && args.rating !== null) {
          if (args.rating < 1 || args.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
          }
          updateData.rating = args.rating;
        }

        if (args.comment !== undefined) {
          updateData.comment = args.comment;
        }

        const review = await context.prisma.review.update({
          where: { id: args.id },
          data: updateData,
        });

        return review;
      },
    });

    t.field("deleteReview", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingReview = await context.prisma.review.findUnique({
          where: { id: args.id },
          select: { customerId: true },
        });

        if (!existingReview) {
          throw new Error("Review not found");
        }

        if (existingReview.customerId !== userId) {
          throw new Error("Not authorized to delete this review");
        }

        await context.prisma.review.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // ❓ QUESTION SYSTEM
    t.field("askQuestion", {
      type: "Question",
      args: {
        question: nonNull(stringArg()),
        manufactureId: nonNull(intArg()),
        isPublic: booleanArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Verify user is customer (only customers can ask questions)
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "CUSTOMER") {
          throw new Error("Only customers can ask questions");
        }

        // Verify manufacturer exists
        const manufacturer = await context.prisma.user.findUnique({
          where: { id: args.manufactureId },
          select: { id: true, role: true },
        });

        if (!manufacturer || manufacturer.role !== "MANUFACTURE") {
          throw new Error("Invalid manufacturer");
        }

        const question = await context.prisma.question.create({
          data: {
            question: args.question,
            customerId: userId,
            manufactureId: args.manufactureId,
            isPublic: args.isPublic || false,
          },
        });

        return question;
      },
    });

    t.field("answerQuestion", {
      type: "Question",
      args: {
        id: nonNull(intArg()),
        answer: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Find the question
        const existingQuestion = await context.prisma.question.findUnique({
          where: { id: args.id },
          select: {
            manufactureId: true,
            isAnswered: true,
            customerId: true,
          },
        });

        if (!existingQuestion) {
          throw new Error("Question not found");
        }

        // Only the target manufacturer can answer
        if (existingQuestion.manufactureId !== userId) {
          throw new Error("Not authorized to answer this question");
        }

        if (existingQuestion.isAnswered) {
          throw new Error("Question already answered");
        }

        const question = await context.prisma.question.update({
          where: { id: args.id },
          data: {
            answer: args.answer,
            isAnswered: true,
          },
        });

        return question;
      },
    });

    t.field("updateQuestion", {
      type: "Question",
      args: {
        id: nonNull(intArg()),
        question: stringArg(),
        isPublic: booleanArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingQuestion = await context.prisma.question.findUnique({
          where: { id: args.id },
          select: { customerId: true, isAnswered: true },
        });

        if (!existingQuestion) {
          throw new Error("Question not found");
        }

        if (existingQuestion.customerId !== userId) {
          throw new Error("Not authorized to update this question");
        }

        // Cannot update if already answered
        if (existingQuestion.isAnswered) {
          throw new Error("Cannot update answered questions");
        }

        const updateData: any = {};

        if (args.question !== undefined) {
          updateData.question = args.question;
        }

        if (args.isPublic !== undefined) {
          updateData.isPublic = args.isPublic;
        }

        const question = await context.prisma.question.update({
          where: { id: args.id },
          data: updateData,
        });

        return question;
      },
    });

    t.field("deleteQuestion", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership or admin
        const existingQuestion = await context.prisma.question.findUnique({
          where: { id: args.id },
          select: { customerId: true, manufactureId: true },
        });

        if (!existingQuestion) {
          throw new Error("Question not found");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        const isOwner =
          existingQuestion.customerId === userId ||
          existingQuestion.manufactureId === userId;
        const isAdmin = user?.role === "ADMIN";

        if (!isOwner && !isAdmin) {
          throw new Error("Not authorized to delete this question");
        }

        await context.prisma.question.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // 🏭 WORKSHOP MANAGEMENT
    t.field("createWorkshop", {
      type: "Workshop",
      args: {
        name: nonNull(stringArg()),
        location: stringArg(),
        capacity: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Only manufacturers can create workshops
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "MANUFACTURE") {
          throw new Error("Only manufacturers can create workshops");
        }

        const workshop = await context.prisma.workshop.create({
          data: {
            name: args.name,
            location: args.location,
            capacity: args.capacity || 1,
            ownerId: userId,
          },
        });

        return workshop;
      },
    });

    t.field("updateWorkshop", {
      type: "Workshop",
      args: {
        id: nonNull(intArg()),
        name: stringArg(),
        location: stringArg(),
        capacity: intArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership
        const existingWorkshop = await context.prisma.workshop.findUnique({
          where: { id: args.id },
          select: { ownerId: true },
        });

        if (!existingWorkshop) {
          throw new Error("Workshop not found");
        }

        if (existingWorkshop.ownerId !== userId) {
          throw new Error("Not authorized to update this workshop");
        }

        const updateData: any = {};

        if (args.name !== undefined) {
          updateData.name = args.name;
        }

        if (args.location !== undefined) {
          updateData.location = args.location;
        }

        if (args.capacity !== undefined) {
          updateData.capacity = args.capacity;
        }

        if (args.isActive !== undefined) {
          updateData.isActive = args.isActive;
        }

        const workshop = await context.prisma.workshop.update({
          where: { id: args.id },
          data: updateData,
        });

        return workshop;
      },
    });

    t.field("deleteWorkshop", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Check ownership or admin
        const existingWorkshop = await context.prisma.workshop.findUnique({
          where: { id: args.id },
          select: { ownerId: true },
        });

        if (!existingWorkshop) {
          throw new Error("Workshop not found");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        const isOwner = existingWorkshop.ownerId === userId;
        const isAdmin = user?.role === "ADMIN";

        if (!isOwner && !isAdmin) {
          throw new Error("Not authorized to delete this workshop");
        }

        // Check for active productions
        const activeProductions = await context.prisma.productionTracking.count(
          {
            where: {
              workshop: {
                id: args.id,
              },
              overallStatus: "IN_PROGRESS",
            },
          }
        );

        if (activeProductions > 0) {
          throw new Error("Cannot delete workshop with active productions");
        }

        await context.prisma.workshop.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // 🔍 QUALITY CONTROL SYSTEM
    t.field("createQualityControl", {
      type: "QualityControl",
      args: {
        productionTrackingId: nonNull(intArg()),
        testType: nonNull(arg({ type: "QualityTestType" })),
        result: nonNull(arg({ type: "QualityResult" })),
        details: stringArg(),
        testDate: arg({ type: "DateTime" }),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Only manufacturers can create quality controls
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== "MANUFACTURE") {
          throw new Error("Only manufacturers can create quality controls");
        }

        // Verify production tracking exists and ownership
        const productionTracking =
          await context.prisma.productionTracking.findUnique({
            where: { id: args.productionTrackingId },
            include: {
              order: {
                select: { manufactureId: true },
              },
              sample: {
                include: {
                  collection: {
                    select: { userId: true },
                  },
                },
              },
            },
          });

        if (!productionTracking) {
          throw new Error("Production tracking not found");
        }

        // Check ownership
        const manufactureId =
          productionTracking.order?.manufactureId ||
          productionTracking.sample?.collection?.userId;

        if (manufactureId !== userId) {
          throw new Error(
            "Not authorized to create quality control for this production"
          );
        }

        const qualityControl = await context.prisma.qualityControl.create({
          data: {
            productionTrackingId: args.productionTrackingId,
            testType: args.testType,
            result: args.result,
            details: args.details,
            testDate: args.testDate || new Date(),
          },
        });

        return qualityControl;
      },
    });

    t.field("updateQualityControl", {
      type: "QualityControl",
      args: {
        id: nonNull(intArg()),
        result: arg({ type: "QualityResult" }),
        details: stringArg(),
        testDate: arg({ type: "DateTime" }),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Find quality control with ownership check
        const existingQC = await context.prisma.qualityControl.findUnique({
          where: { id: args.id },
          include: {
            productionTracking: {
              select: {
                order: {
                  select: { manufactureId: true },
                },
                sample: {
                  select: {
                    collection: {
                      select: { userId: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!existingQC) {
          throw new Error("Quality control not found");
        }

        // Check ownership
        const manufactureId =
          existingQC.productionTracking.order?.manufactureId ||
          existingQC.productionTracking.sample?.collection?.userId;

        if (manufactureId !== userId) {
          throw new Error("Not authorized to update this quality control");
        }

        const updateData: any = {};

        if (args.result !== undefined) {
          updateData.result = args.result;
        }

        if (args.details !== undefined) {
          updateData.details = args.details;
        }

        if (args.testDate !== undefined) {
          updateData.testDate = args.testDate;
        }

        const qualityControl = await context.prisma.qualityControl.update({
          where: { id: args.id },
          data: updateData,
        });

        return qualityControl;
      },
    });

    t.field("deleteQualityControl", {
      type: "Boolean",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Find quality control with ownership check
        const existingQC = await context.prisma.qualityControl.findUnique({
          where: { id: args.id },
          include: {
            productionTracking: {
              select: {
                order: {
                  select: { manufactureId: true },
                },
                sample: {
                  select: {
                    collection: {
                      select: { userId: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!existingQC) {
          throw new Error("Quality control not found");
        }

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        // Check ownership or admin
        const manufactureId =
          existingQC.productionTracking.order?.manufactureId ||
          existingQC.productionTracking.sample?.collection?.userId;

        const isOwner = manufactureId === userId;
        const isAdmin = user?.role === "ADMIN";

        if (!isOwner && !isAdmin) {
          throw new Error("Not authorized to delete this quality control");
        }

        await context.prisma.qualityControl.delete({
          where: { id: args.id },
        });

        return true;
      },
    });

    // 📁 FILE UPLOAD SYSTEM
    t.field("uploadCollectionImage", {
      type: "String",
      args: {
        collectionId: nonNull(intArg()),
        imageUrl: nonNull(stringArg()),
        description: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Verify collection ownership
        const collection = await context.prisma.collection.findUnique({
          where: { id: args.collectionId },
          select: { userId: true, images: true },
        });

        if (!collection) {
          throw new Error("Collection not found");
        }

        if (collection.userId !== userId) {
          throw new Error("Not authorized to upload images to this collection");
        }

        // Add new image to existing images array
        const currentImages = (collection.images as any[]) || [];
        const newImage = {
          url: args.imageUrl,
          description: args.description,
          uploadedAt: new Date().toISOString(),
        };

        const updatedImages = [...currentImages, newImage];

        await context.prisma.collection.update({
          where: { id: args.collectionId },
          data: { images: updatedImages },
        });

        return args.imageUrl;
      },
    });

    t.field("uploadSampleImage", {
      type: "String",
      args: {
        sampleId: nonNull(intArg()),
        imageUrl: nonNull(stringArg()),
        description: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Verify sample ownership
        const sample = await context.prisma.sample.findUnique({
          where: { id: args.sampleId },
          include: {
            collection: {
              select: { userId: true },
            },
          },
        });

        if (!sample) {
          throw new Error("Sample not found");
        }

        if (sample.collection.userId !== userId) {
          throw new Error("Not authorized to upload images to this sample");
        }

        // Add image to sample images
        const currentImages = (sample.images as any[]) || [];
        const newImage = {
          url: args.imageUrl,
          description: args.description,
          uploadedAt: new Date().toISOString(),
        };

        const updatedImages = [...currentImages, newImage];

        await context.prisma.sample.update({
          where: { id: args.sampleId },
          data: { images: updatedImages },
        });
        return args.imageUrl;
      },
    });

    t.field("uploadMessageAttachment", {
      type: "String",
      args: {
        messageId: nonNull(intArg()),
        attachmentUrl: nonNull(stringArg()),
        fileName: stringArg(),
      },
      resolve: async (
        _parent,
        { messageId, attachmentUrl, fileName },
        context: Context
      ) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        // Verify message ownership
        const message = await context.prisma.message.findUnique({
          where: { id: messageId },
          select: { senderId: true, fileUrl: true },
        });

        if (!message) {
          throw new Error("Message not found");
        }

        if (message.senderId !== userId) {
          throw new Error(
            "Not authorized to upload attachment to this message"
          );
        }

        await context.prisma.message.update({
          where: { id: messageId },
          data: {
            fileUrl: attachmentUrl,
            fileName: fileName,
          },
        });

        return attachmentUrl;
      },
    });

    t.field("removeImage", {
      type: "Boolean",
      args: {
        entityType: nonNull(stringArg()), // "collection" | "sample" | "message"
        entityId: nonNull(intArg()),
        imageUrl: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error("Authentication required");
        }

        if (args.entityType === "collection") {
          const collection = await context.prisma.collection.findUnique({
            where: { id: args.entityId },
            select: { userId: true, images: true },
          });

          if (!collection || collection.userId !== userId) {
            throw new Error("Not authorized");
          }

          const currentImages = (collection.images as any[]) || [];
          const updatedImages = currentImages.filter(
            (img: any) => img.url !== args.imageUrl
          );

          await context.prisma.collection.update({
            where: { id: args.entityId },
            data: { images: updatedImages },
          });
        } else if (args.entityType === "sample") {
          const sample = await context.prisma.sample.findUnique({
            where: { id: args.entityId },
            include: {
              collection: { select: { userId: true } },
            },
          });

          if (!sample || sample.collection.userId !== userId) {
            throw new Error("Not authorized");
          }

          const currentImages = (sample.images as any[]) || [];
          const updatedImages = currentImages.filter(
            (image: any) => image.url !== args.imageUrl
          );

          await context.prisma.sample.update({
            where: { id: args.entityId },
            data: { images: updatedImages },
          });
        }

        return true;
      },
    });

    // 🔔 NOTIFICATION SYSTEM
    t.field("createNotification", {
      type: "String",
      args: {
        userId: nonNull(intArg()),
        title: nonNull(stringArg()),
        message: nonNull(stringArg()),
        type: stringArg(),
        entityId: intArg(),
        entityType: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const adminId = getUserId(context);

        if (!adminId) {
          throw new Error("Authentication required");
        }

        // Only admins or system can create notifications
        const admin = await context.prisma.user.findUnique({
          where: { id: adminId },
          select: { role: true },
        });

        if (admin?.role !== "ADMIN") {
          throw new Error("Only admins can create notifications");
        }

        // Verify target user exists
        const targetUser = await context.prisma.user.findUnique({
          where: { id: args.userId },
          select: { id: true },
        });

        if (!targetUser) {
          throw new Error("Target user not found");
        }

        // For now, we'll use Message model as notification system
        // In production, you'd have a separate Notification model
        const notification = await context.prisma.message.create({
          data: {
            senderId: adminId,
            receiverId: args.userId,
            content: `${args.title}: ${args.message}`,
            messageType: "SYSTEM",
          },
        });

        return `Notification sent to user ${args.userId}`;
      },
    });

    // markNotificationAsRead mutation removed due to TypeScript cache issues

    t.field("sendBulkNotification", {
      type: "String",
      args: {
        userRole: stringArg(), // "MANUFACTURE" | "CUSTOMER" | "ALL"
        title: nonNull(stringArg()),
        message: nonNull(stringArg()),
        type: stringArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        const adminId = getUserId(context);

        if (!adminId) {
          throw new Error("Authentication required");
        }

        // Only admins can send bulk notifications
        await requireAdmin(context);

        // Get target users
        const whereClause: any = {};
        if (args.userRole && args.userRole !== "ALL") {
          whereClause.role = args.userRole;
        }

        const targetUsers = await context.prisma.user.findMany({
          where: whereClause,
          select: { id: true },
        });

        // Create notifications for all target users
        const notifications = targetUsers.map((user) => ({
          senderId: adminId,
          receiverId: user.id,
          content: `${args.title}: ${args.message}`,
          messageType: "SYSTEM" as const,
        }));

        await context.prisma.message.createMany({
          data: notifications,
        });

        return `Bulk notification sent to ${targetUsers.length} users`;
      },
    });

    // 📁 File Upload Mutations
    t.field("uploadProfilePicture", {
      type: "String",
      args: {
        userId: nonNull(intArg()),
        file: nonNull(stringArg()), // Base64 encoded file data
        filename: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        // Check if user is updating their own profile or is admin
        if (userId !== args.userId) {
          requireAdmin(context);
        }

        // Validate file type
        const allowedTypes = ["jpg", "jpeg", "png", "gif"];
        const fileExtension = args.filename.split(".").pop()?.toLowerCase();

        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          throw new Error(
            "Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed."
          );
        }

        // In a real implementation, you would:
        // 1. Save the file to a cloud storage service (AWS S3, Cloudinary, etc.)
        // 2. Return the URL of the uploaded file
        // For now, we'll simulate this and store a placeholder URL

        const filename = `profile_${
          args.userId
        }_${Date.now()}.${fileExtension}`;
        const imageUrl = `/uploads/profiles/${filename}`;

        // Update user's profile picture URL
        await context.prisma.user.update({
          where: { id: args.userId },
          data: { profilePicture: imageUrl },
        });

        return imageUrl;
      },
    });

    t.field("uploadCollectionImages", {
      type: "String",
      args: {
        collectionId: nonNull(intArg()),
        images: nonNull(stringArg()), // JSON string of image data array
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        // Check if user owns the collection or is admin
        const collection = await context.prisma.collection.findUnique({
          where: { id: args.collectionId },
        });

        if (!collection) {
          throw new Error("Collection not found");
        }

        if (collection.userId !== userId) {
          requireAdmin(context);
        }

        // Parse images data
        let imageData;
        try {
          imageData = JSON.parse(args.images);
        } catch {
          throw new Error("Invalid images data format");
        }

        // Validate and process images
        const uploadedUrls = [];
        for (const [index, image] of imageData.entries()) {
          const allowedTypes = ["jpg", "jpeg", "png", "gif"];
          const fileExtension = image.filename.split(".").pop()?.toLowerCase();

          if (!fileExtension || !allowedTypes.includes(fileExtension)) {
            throw new Error(
              `Invalid file type for image ${
                index + 1
              }. Only JPG, JPEG, PNG, and GIF files are allowed.`
            );
          }

          // Simulate file upload
          const filename = `collection_${
            args.collectionId
          }_${index}_${Date.now()}.${fileExtension}`;
          const imageUrl = `/uploads/collections/${filename}`;
          uploadedUrls.push(imageUrl);
        }

        // Update collection with new image URLs
        const currentImages = collection.images
          ? JSON.parse(collection.images as string)
          : [];
        const updatedImages = [...currentImages, ...uploadedUrls];

        await context.prisma.collection.update({
          where: { id: args.collectionId },
          data: { images: JSON.stringify(updatedImages) },
        });

        return `Successfully uploaded ${uploadedUrls.length} images to collection`;
      },
    });

    t.field("uploadBusinessLicense", {
      type: "String",
      args: {
        userId: nonNull(intArg()),
        file: nonNull(stringArg()), // Base64 encoded file data
        filename: nonNull(stringArg()),
      },
      resolve: async (_parent, args, context: Context) => {
        const userId = getUserId(context);

        // Check if user is updating their own license or is admin
        if (userId !== args.userId) {
          requireAdmin(context);
        }

        // Validate file type
        const allowedTypes = ["pdf", "jpg", "jpeg", "png"];
        const fileExtension = args.filename.split(".").pop()?.toLowerCase();

        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          throw new Error(
            "Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed."
          );
        }

        // Simulate file upload
        const filename = `license_${
          args.userId
        }_${Date.now()}.${fileExtension}`;
        const licenseUrl = `/uploads/licenses/${filename}`;

        // Update user's business license URL
        await context.prisma.user.update({
          where: { id: args.userId },
          data: { businessLicense: licenseUrl },
        });

        return licenseUrl;
      },
    });
  },
});

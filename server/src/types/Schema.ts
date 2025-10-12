import { enumType, objectType } from "nexus";

export const Role = enumType({
  name: "Role",
  members: ["ADMIN", "MANUFACTURE", "CUSTOMER"],
  description: "User roles in the system",
});

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.field("user", { type: "User" });
  },
});

export const UserStats = objectType({
  name: "UserStats",
  definition(t) {
    t.nonNull.int("totalUsers");
    t.nonNull.int("adminCount");
    t.nonNull.int("manufactureCount");
    t.nonNull.int("customerCount");
  },
});

// Additional enums from Prisma schema
export const SampleType = enumType({
  name: "SampleType",
  members: ["STANDARD", "REVISION", "CUSTOM", "DEVELOPMENT"],
  description: "Sample types in the system",
});

export const SampleStatus = enumType({
  name: "SampleStatus",
  members: [
    "REQUESTED", "RECEIVED", "REVIEWED", "QUOTE_SENT", "APPROVED",
    "REJECTED", "IN_PRODUCTION", "PRODUCTION_COMPLETE", "SHIPPED", "DELIVERED"
  ],
  description: "Sample status tracking",
});

export const OrderStatus = enumType({
  name: "OrderStatus",
  members: [
    "PENDING", "REVIEWED", "QUOTE_SENT", "CONFIRMED", "REJECTED",
    "IN_PRODUCTION", "PRODUCTION_COMPLETE", "QUALITY_CHECK", "SHIPPED", "DELIVERED", "CANCELLED"
  ],
  description: "Order status tracking",
});

// Sort order enum for pagination and sorting
export const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
  description: "Sort order for queries",
});

// Company type
export const Company = objectType({
  name: "Company",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.nonNull.string("email");
    t.string("phone");
    t.string("address");
    t.string("website");
    t.nonNull.boolean("isActive");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Message type
export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("content");
    t.nonNull.int("senderId");
    t.string("receiver");
    t.nonNull.boolean("isRead");
    t.nonNull.string("type");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Sample type with all fields from Prisma schema
export const Sample = objectType({
  name: "Sample",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("sampleNumber");
    t.nonNull.field("sampleType", { type: "SampleType" });
    t.nonNull.field("status", { type: "SampleStatus" });
    t.string("customerNote");
    t.string("manufacturerResponse");
    t.string("customDesignImages");
    t.string("revisionRequests");
    t.int("originalCollectionId");
    t.int("productionDays");
    t.string("estimatedProductionDate", {
      resolve: (parent: any) => parent.estimatedProductionDate?.toISOString(),
    });
    t.string("actualProductionDate", {
      resolve: (parent: any) => parent.actualProductionDate?.toISOString(),
    });
    t.string("shippingDate", {
      resolve: (parent: any) => parent.shippingDate?.toISOString(),
    });
    t.string("deliveryAddress");
    t.string("cargoTrackingNumber");
    t.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.int("manufactureId");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Order type with all fields from Prisma schema
export const Order = objectType({
  name: "Order",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("orderNumber");
    t.nonNull.int("quantity");
    t.nonNull.float("unitPrice");
    t.nonNull.float("totalPrice");
    t.nonNull.field("status", { type: "OrderStatus" });
    t.string("customerNote");
    t.string("manufacturerResponse");
    t.int("productionDays");
    t.string("estimatedProductionDate", {
      resolve: (parent: any) => parent.estimatedProductionDate?.toISOString(),
    });
    t.string("actualProductionStart", {
      resolve: (parent: any) => parent.actualProductionStart?.toISOString(),
    });
    t.string("actualProductionEnd", {
      resolve: (parent: any) => parent.actualProductionEnd?.toISOString(),
    });
    t.string("shippingDate", {
      resolve: (parent: any) => parent.shippingDate?.toISOString(),
    });
    t.string("deliveryAddress");
    t.string("cargoTrackingNumber");
    t.nonNull.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.int("manufactureId");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Question type
export const Question = objectType({
  name: "Question",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("question");
    t.string("answer");
    t.nonNull.boolean("isAnswered");
    t.nonNull.boolean("isPublic");
    t.nonNull.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.int("manufactureId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Review type
export const Review = objectType({
  name: "Review",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("rating");
    t.string("comment");
    t.nonNull.boolean("isApproved");
    t.nonNull.int("collectionId");
    t.nonNull.int("customerId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Category type
export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("description");
    t.int("authorId");
    t.int("parentCategoryId");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Collection type
export const Collection = objectType({
  name: "Collection",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("description");
    t.nonNull.float("price");
    t.string("sku");
    t.nonNull.int("stock");
    t.string("images");
    t.nonNull.boolean("isActive");
    t.nonNull.boolean("isFeatured");
    t.string("slug");
    t.int("categoryId");
    t.int("authorId");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

// Production tracking types
export const SampleProduction = objectType({
  name: "SampleProduction",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("status", { type: "SampleStatus" });
    t.string("note");
    t.int("estimatedDays");
    t.string("actualDate", {
      resolve: (parent: any) => parent.actualDate?.toISOString(),
    });
    t.nonNull.int("sampleId");
    t.nonNull.int("updatedById");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
  },
});

export const OrderProduction = objectType({
  name: "OrderProduction",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("status", { type: "OrderStatus" });
    t.string("note");
    t.int("estimatedDays");
    t.string("actualDate", {
      resolve: (parent: any) => parent.actualDate?.toISOString(),
    });
    t.nonNull.int("orderId");
    t.nonNull.int("updatedById");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
  },
});

export const ProductionTracking = objectType({
  name: "ProductionTracking",
  definition(t) {
    t.nonNull.int("id");
    t.int("orderId");
    t.int("sampleId");
    t.nonNull.string("status");
    t.nonNull.string("stage");
    t.nonNull.int("progress");
    t.string("estimatedEnd", {
      resolve: (parent: any) => parent.estimatedEnd?.toISOString(),
    });
    t.string("actualEnd", {
      resolve: (parent: any) => parent.actualEnd?.toISOString(),
    });
    t.string("notes");
    t.int("companyId");
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

export const Revision = objectType({
  name: "Revision",
  definition(t) {
    t.nonNull.int("id");
    t.int("orderId");
    t.int("sampleId");
    t.int("productionTrackingId");
    t.nonNull.int("revisionNumber");
    t.string("requestMessage");
    t.string("responseMessage");
    t.nonNull.string("status");
    t.nonNull.string("requestedAt", {
      resolve: (parent: any) => parent.requestedAt?.toISOString() || new Date().toISOString(),
    });
    t.string("completedAt", {
      resolve: (parent: any) => parent.completedAt?.toISOString(),
    });
    t.nonNull.string("createdAt", {
      resolve: (parent: any) => parent.createdAt?.toISOString() || new Date().toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent: any) => parent.updatedAt?.toISOString() || new Date().toISOString(),
    });
  },
});

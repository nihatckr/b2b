import builder from "../builder";

// Import all enums first
import "../enums";

// ========================================
// RELAY NODES (Global ID Support)
// ========================================

// User Node - Supports global ID queries: node(id: "VXNlcjox")
builder.prismaNode("User", {
  id: { field: "id" },
  fields: (t) => ({
    // Sensitive fields - require authentication
    email: t.exposeString("email", {
      authScopes: { user: true }, // Only authenticated users can see email
    }),

    name: t.exposeString("name", { nullable: true }),
    username: t.exposeString("username", { nullable: true }),
    firstName: t.exposeString("firstName", { nullable: true }),
    lastName: t.exposeString("lastName", { nullable: true }),

    phone: t.exposeString("phone", {
      nullable: true,
      authScopes: { user: true }, // Only authenticated users can see phone
    }),

    // Company & Role
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", {
      nullable: true,
      authScopes: { user: true }, // Only authenticated users can see companyId
    }),
    role: t.expose("role", { type: "String" }),

    // Permissions
    isCompanyOwner: t.exposeBoolean("isCompanyOwner"),
    department: t.expose("department", { type: "String", nullable: true }),
    jobTitle: t.exposeString("jobTitle", { nullable: true }),

    // Profile
    avatar: t.exposeString("avatar", { nullable: true }),
    customAvatar: t.exposeString("customAvatar", { nullable: true }),
    bio: t.exposeString("bio", { nullable: true }),
    socialLinks: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.socialLinks) return null;
        return typeof parent.socialLinks === "string"
          ? parent.socialLinks
          : JSON.stringify(parent.socialLinks);
      },
    }),

    // Settings
    emailNotifications: t.exposeBoolean("emailNotifications"),
    pushNotifications: t.exposeBoolean("pushNotifications"),
    language: t.exposeString("language"),
    timezone: t.exposeString("timezone"),

    // Status
    isActive: t.exposeBoolean("isActive"),
    isPendingApproval: t.exposeBoolean("isPendingApproval"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Company Node - Supports global ID queries
builder.prismaNode("Company", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"),

    // Sensitive fields - require authentication
    email: t.exposeString("email", {
      authScopes: { user: true }, // Only authenticated users
    }),

    phone: t.exposeString("phone", {
      nullable: true,
      authScopes: { user: true },
    }),

    address: t.exposeString("address", {
      nullable: true,
    }),

    city: t.exposeString("city", {
      nullable: true,
    }),

    country: t.exposeString("country", {
      nullable: true,
    }),

    location: t.exposeString("location", { nullable: true }),
    website: t.exposeString("website", { nullable: true }),
    type: t.expose("type", { type: "String" }),
    description: t.exposeString("description", { nullable: true }),

    // Owner
    owner: t.relation("owner", { nullable: true }),
    ownerId: t.exposeInt("ownerId", {
      nullable: true,
      authScopes: { user: true }, // Sensitive ownership data
    }),

    // Settings
    settings: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.settings) return null;
        return typeof parent.settings === "string"
          ? parent.settings
          : JSON.stringify(parent.settings);
      },
    }),

    // Subscription System
    subscriptionPlan: t.expose("subscriptionPlan", { type: "String" }),
    subscriptionStatus: t.expose("subscriptionStatus", { type: "String" }),

    // Trial Period
    trialStartedAt: t.expose("trialStartedAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true }, // Only company owners
    }),
    trialEndsAt: t.expose("trialEndsAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    // Subscription Billing - HIGHLY SENSITIVE - Only company owner
    subscriptionStartedAt: t.expose("subscriptionStartedAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    currentPeriodStart: t.expose("currentPeriodStart", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    currentPeriodEnd: t.expose("currentPeriodEnd", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    cancelAtPeriodEnd: t.exposeBoolean("cancelAtPeriodEnd", {
      authScopes: { companyOwner: true },
    }),
    cancelledAt: t.expose("cancelledAt", {
      type: "DateTime",
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    billingCycle: t.expose("billingCycle", {
      type: "String",
      authScopes: { companyOwner: true },
    }),
    billingEmail: t.exposeString("billingEmail", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    billingAddress: t.exposeString("billingAddress", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),
    taxId: t.exposeString("taxId", {
      nullable: true,
      authScopes: { companyOwner: true },
    }),

    // Usage Limits
    maxUsers: t.exposeInt("maxUsers"),
    maxSamples: t.exposeInt("maxSamples"),
    maxOrders: t.exposeInt("maxOrders"),
    maxCollections: t.exposeInt("maxCollections"),
    maxStorageGB: t.exposeFloat("maxStorageGB"),

    // Current Usage
    currentUsers: t.exposeInt("currentUsers"),
    currentSamples: t.exposeInt("currentSamples"),
    currentOrders: t.exposeInt("currentOrders"),
    currentCollections: t.exposeInt("currentCollections"),
    currentStorageGB: t.exposeFloat("currentStorageGB"),

    // Branding & Customization
    logo: t.exposeString("logo", { nullable: true }),
    coverImage: t.exposeString("coverImage", { nullable: true }),
    brandColors: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.brandColors) return null;
        return typeof parent.brandColors === "string"
          ? parent.brandColors
          : JSON.stringify(parent.brandColors);
      },
    }),

    // Public Profile
    profileSlug: t.exposeString("profileSlug", { nullable: true }),
    isPublicProfile: t.exposeBoolean("isPublicProfile"),
    socialLinks: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.socialLinks) return null;
        return typeof parent.socialLinks === "string"
          ? parent.socialLinks
          : JSON.stringify(parent.socialLinks);
      },
    }),

    // Dashboard Preferences
    defaultView: t.exposeString("defaultView", { nullable: true }),
    enabledModules: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.enabledModules) return null;
        return typeof parent.enabledModules === "string"
          ? parent.enabledModules
          : JSON.stringify(parent.enabledModules);
      },
    }),

    // Relations (Simple - for single items or small lists)
    employees: t.relation("employees"),

    // Relations (Connections - for large lists with pagination)
    // Pothos Relay Plugin automatically handles cursor-based pagination
    employeesConnection: t.relatedConnection("employees", {
      cursor: "id",
      totalCount: true, // Enable totalCount field
    }),

    categoriesConnection: t.relatedConnection("categories", {
      cursor: "id",
      totalCount: true,
    }),

    companyCategoriesConnection: t.relatedConnection("companyCategories", {
      cursor: "id",
      totalCount: true,
    }),

    collectionsConnection: t.relatedConnection("collections", {
      cursor: "id",
      totalCount: true,
    }),

    samplesConnection: t.relatedConnection("samples", {
      cursor: "id",
      totalCount: true,
    }),

    ordersConnection: t.relatedConnection("orders", {
      cursor: "id",
      totalCount: true,
    }),

    libraryItemsConnection: t.relatedConnection("libraryItems", {
      cursor: "id",
      totalCount: true,
    }),

    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Sample Node - Supports global ID queries
builder.prismaNode("Sample", {
  id: { field: "id" },
  fields: (t) => ({
    sampleNumber: t.exposeString("sampleNumber"),
    sampleType: t.expose("sampleType", { type: "String" }),
    name: t.exposeString("name", { nullable: true }),
    description: t.exposeString("description", { nullable: true }),
    status: t.expose("status", { type: "String" }),

    // AI Design
    aiGenerated: t.exposeBoolean("aiGenerated", { nullable: true }),
    aiPrompt: t.exposeString("aiPrompt", { nullable: true }),
    aiSketchUrl: t.exposeString("aiSketchUrl", { nullable: true }),

    // Images
    images: t.exposeString("images", { nullable: true }),
    customDesignImages: t.exposeString("customDesignImages", {
      nullable: true,
    }),

    // Pricing & Timeline
    unitPrice: t.exposeFloat("unitPrice", { nullable: true }),
    productionDays: t.exposeInt("productionDays", { nullable: true }),
    estimatedProductionDate: t.expose("estimatedProductionDate", {
      type: "DateTime",
      nullable: true,
    }),
    actualProductionDate: t.expose("actualProductionDate", {
      type: "DateTime",
      nullable: true,
    }),

    // Customer Quote
    customerQuotedPrice: t.exposeFloat("customerQuotedPrice", {
      nullable: true,
    }),
    customerQuoteDays: t.exposeInt("customerQuoteDays", { nullable: true }),
    customerQuoteNote: t.exposeString("customerQuoteNote", { nullable: true }),

    // Notes
    customerNote: t.exposeString("customerNote", { nullable: true }),
    manufacturerResponse: t.exposeString("manufacturerResponse", {
      nullable: true,
    }),

    // Analytics
    viewCount: t.exposeInt("viewCount"),
    shareCount: t.exposeInt("shareCount"),
    lastViewedAt: t.expose("lastViewedAt", {
      type: "DateTime",
      nullable: true,
    }),

    // Relations
    customer: t.relation("customer"),
    customerId: t.exposeInt("customerId"),
    manufacture: t.relation("manufacture"),
    manufactureId: t.exposeInt("manufactureId"),
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),
    collection: t.relation("collection", { nullable: true }),
    collectionId: t.exposeInt("collectionId", { nullable: true }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Order Node - Supports global ID queries
builder.prismaNode("Order", {
  id: { field: "id" },
  fields: (t) => ({
    orderNumber: t.exposeString("orderNumber"),
    quantity: t.exposeInt("quantity"),
    unitPrice: t.exposeFloat("unitPrice"),
    totalPrice: t.exposeFloat("totalPrice"),
    targetPrice: t.exposeFloat("targetPrice", { nullable: true }),
    currency: t.exposeString("currency", { nullable: true }),
    deadline: t.expose("deadline", { type: "DateTime", nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
    status: t.expose("status", { type: "String" }),

    // Customer Quote
    customerQuotedPrice: t.exposeFloat("customerQuotedPrice", {
      nullable: true,
    }),
    customerQuoteDays: t.exposeInt("customerQuoteDays", { nullable: true }),
    customerQuoteNote: t.exposeString("customerQuoteNote", { nullable: true }),

    // Production Timeline
    productionDays: t.exposeInt("productionDays", { nullable: true }),
    estimatedProductionDate: t.expose("estimatedProductionDate", {
      type: "DateTime",
      nullable: true,
    }),
    actualProductionStart: t.expose("actualProductionStart", {
      type: "DateTime",
      nullable: true,
    }),
    actualProductionEnd: t.expose("actualProductionEnd", {
      type: "DateTime",
      nullable: true,
    }),

    // Shipping
    shippingDate: t.expose("shippingDate", {
      type: "DateTime",
      nullable: true,
    }),
    deliveryAddress: t.exposeString("deliveryAddress", { nullable: true }),
    cargoTrackingNumber: t.exposeString("cargoTrackingNumber", {
      nullable: true,
    }),

    // Notes
    customerNote: t.exposeString("customerNote", { nullable: true }),
    manufacturerResponse: t.exposeString("manufacturerResponse", {
      nullable: true,
    }),

    // Relations
    collection: t.relation("collection"),
    collectionId: t.exposeInt("collectionId"),
    customer: t.relation("customer"),
    customerId: t.exposeInt("customerId"),
    manufacture: t.relation("manufacture"),
    manufactureId: t.exposeInt("manufactureId"),
    manufacturer: t.relation("manufacture"), // Alias for manufacturer
    manufacturerId: t.exposeInt("manufactureId"), // Alias for manufacturerId
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Collection Node - Supports global ID queries
builder.prismaNode("Collection", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    modelCode: t.exposeString("modelCode"),
    slug: t.exposeString("slug", { nullable: true }),

    // Season & Gender & Fit
    season: t.expose("season", { type: "String", nullable: true }),
    gender: t.expose("gender", { type: "String", nullable: true }),
    fit: t.exposeString("fit", { nullable: true }),
    trend: t.exposeString("trend", { nullable: true }),

    // Variants
    colors: t.exposeString("colors", { nullable: true }), // JSON array
    sizeGroups: t.exposeString("sizeGroups", { nullable: true }), // JSON array
    sizeRange: t.exposeString("sizeRange", { nullable: true }),
    measurementChart: t.exposeString("measurementChart", { nullable: true }),

    // Technical Details
    fabricComposition: t.exposeString("fabricComposition", { nullable: true }),
    accessories: t.exposeString("accessories", { nullable: true }), // JSON
    images: t.exposeString("images", { nullable: true }), // JSON array

    // Enhanced fabric composition with library details
    fabricDetails: t.field({
      type: ["LibraryItem"],
      nullable: true,
      resolve: async (parent, _args, context) => {
        if (!parent.fabricComposition) return null;

        try {
          // Try to parse as JSON first, if fails treat as simple string
          let fabrics;
          try {
            fabrics = JSON.parse(parent.fabricComposition);
          } catch {
            // If JSON.parse fails, it's a simple string, return empty array
            return [];
          }
          if (!Array.isArray(fabrics)) return [];

          // Extract library item IDs from fabrics
          const libraryItemIds = fabrics
            .filter((fabric) => fabric.libraryItemId)
            .map((fabric) => parseInt(fabric.libraryItemId));

          if (libraryItemIds.length === 0) return null;

          // Fetch library items with their details
          return context.prisma.libraryItem.findMany({
            where: {
              id: { in: libraryItemIds },
              isActive: true,
            },
            include: {
              certifications: {
                where: { isActive: true },
              },
            },
          });
        } catch (error) {
          console.error("Error parsing fabricComposition:", error);
          return null;
        }
      },
    }),

    // Enhanced accessories with library details
    accessoryDetails: t.field({
      type: ["LibraryItem"],
      nullable: true,
      resolve: async (parent, _args, context) => {
        if (!parent.accessories) return null;

        try {
          // Try to parse as JSON first, if fails treat as simple string
          let accessories;
          try {
            accessories = JSON.parse(parent.accessories);
          } catch {
            // If JSON.parse fails, it's a simple string, return empty array
            return [];
          }
          if (!Array.isArray(accessories)) return [];

          // Extract library item IDs from accessories
          const libraryItemIds = accessories
            .filter((accessory) => accessory.libraryItemId)
            .map((accessory) => parseInt(accessory.libraryItemId));

          if (libraryItemIds.length === 0) return null;

          // Fetch library items with their details
          return context.prisma.libraryItem.findMany({
            where: {
              id: { in: libraryItemIds },
              isActive: true,
            },
            include: {
              certifications: {
                where: { isActive: true },
              },
            },
          });
        } catch (error) {
          console.error("Error parsing accessories:", error);
          return null;
        }
      },
    }),
    techPack: t.exposeString("techPack", { nullable: true }),

    // Commercial Info
    moq: t.exposeInt("moq", { nullable: true }),
    targetPrice: t.exposeFloat("targetPrice", { nullable: true }),
    currency: t.exposeString("currency", { nullable: true }),
    targetLeadTime: t.exposeInt("targetLeadTime", { nullable: true }),
    deadline: t.expose("deadline", { type: "DateTime", nullable: true }),
    deadlineDays: t.exposeInt("deadlineDays", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),

    // Media (additional)
    mainImage: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!(parent as any).mainImage) return null;
        return typeof (parent as any).mainImage === "string"
          ? (parent as any).mainImage
          : JSON.stringify((parent as any).mainImage);
      },
    }),

    // Production Schedule
    productionSchedule: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.productionSchedule) return null;
        return typeof parent.productionSchedule === "string"
          ? parent.productionSchedule
          : JSON.stringify(parent.productionSchedule);
      },
    }),

    // Status
    isActive: t.exposeBoolean("isActive"),
    isFeatured: t.exposeBoolean("isFeatured"),

    // Legacy fields
    price: t.exposeFloat("price"),
    sku: t.exposeString("sku", { nullable: true }),
    stock: t.exposeInt("stock"),

    // Analytics
    viewCount: t.exposeInt("viewCount"),
    shareCount: t.exposeInt("shareCount"),
    likesCount: t.exposeInt("likesCount"),
    lastViewedAt: t.expose("lastViewedAt", {
      type: "DateTime",
      nullable: true,
    }),

    // Relations
    author: t.relation("author", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    // Category relations
    category: t.relation("category", { nullable: true }),
    categoryId: t.exposeInt("categoryId", { nullable: true }),
    companyCategory: t.relation("companyCategory", { nullable: true }),
    companyCategoryId: t.exposeInt("companyCategoryId", { nullable: true }),

    // Product relations
    samples: t.relation("samples"),
    orders: t.relation("orders"),
    certifications: t.relation("certifications"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// ========================================
// CATEGORY SYSTEM (New Standardized System)
// ========================================

// StandardCategory Type
builder.prismaObject("StandardCategory", {
  fields: (t) => ({
    id: t.exposeID("id"),
    code: t.exposeString("code"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    level: t.exposeString("level"), // CategoryLevel enum
    order: t.exposeInt("order"),
    icon: t.exposeString("icon", { nullable: true }),
    image: t.exposeString("image", { nullable: true }),

    // Hierarchy
    parentCategory: t.relation("parentCategory", { nullable: true }),
    parentId: t.exposeInt("parentId", { nullable: true }),
    subCategories: t.relation("subCategories"),

    // Metadata
    keywords: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.keywords) return null;
        return typeof parent.keywords === "string"
          ? parent.keywords
          : JSON.stringify(parent.keywords);
      },
    }),
    tags: t.exposeString("tags", { nullable: true }),

    isActive: t.exposeBoolean("isActive"),
    isPublic: t.exposeBoolean("isPublic"),

    createdBy: t.relation("createdBy", { nullable: true }),
    createdById: t.exposeInt("createdById", { nullable: true }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// CompanyCategory Type
builder.prismaObject("CompanyCategory", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    type: t.exposeString("type"), // CategoryType enum

    // Relations
    company: t.relation("company"),
    companyId: t.exposeInt("companyId"),

    standardCategory: t.relation("standardCategory", { nullable: true }),
    standardCategoryId: t.exposeInt("standardCategoryId", { nullable: true }),

    parentCategory: t.relation("parentCategory", { nullable: true }),
    parentId: t.exposeInt("parentId", { nullable: true }),
    subCategories: t.relation("subCategories"),

    internalCode: t.exposeString("internalCode", { nullable: true }),
    order: t.exposeInt("order"),
    isActive: t.exposeBoolean("isActive"),

    // Usage Stats
    productCount: t.exposeInt("productCount"),
    lastUsedAt: t.expose("lastUsedAt", { type: "DateTime", nullable: true }),

    customFields: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.customFields) return null;
        return typeof parent.customFields === "string"
          ? parent.customFields
          : JSON.stringify(parent.customFields);
      },
    }),

    author: t.relation("author", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Legacy Category (for backward compatibility)
builder.prismaObject("Category", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),

    // Relations
    author: t.relation("author", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),

    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    parentCategory: t.relation("parentCategory", { nullable: true }),
    parentCategoryId: t.exposeInt("parentCategoryId", { nullable: true }),

    subCategories: t.relation("subCategories"),
    collections: t.relation("collections"),
  }),
});

builder.prismaObject("Message", {
  fields: (t) => ({
    id: t.exposeID("id"),
    content: t.exposeString("content"),
    senderId: t.exposeInt("senderId"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Notification", {
  fields: (t) => ({
    id: t.exposeID("id"),
    message: t.exposeString("message"),
    isRead: t.exposeBoolean("isRead"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Question", {
  fields: (t) => ({
    id: t.exposeID("id"),
    question: t.exposeString("question"),
    answer: t.exposeString("answer"),
    isAnswered: t.exposeBoolean("isAnswered"),
    isPublic: t.exposeBoolean("isPublic"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Review", {
  fields: (t) => ({
    id: t.exposeID("id"),
    rating: t.exposeInt("rating"),
    comment: t.exposeString("comment"),
    isApproved: t.exposeBoolean("isApproved"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// ========================================
// UNIFIED LIBRARY SYSTEM
// ========================================

// Unified LibraryItem Type
builder.prismaObject("LibraryItem", {
  fields: (t) => ({
    id: t.exposeID("id"),
    scope: t.exposeString("scope"), // LibraryScope enum
    category: t.exposeString("category"), // LibraryCategory enum
    code: t.exposeString("code", { nullable: true }),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    imageUrl: t.exposeString("imageUrl", { nullable: true }),
    iconValue: t.exposeString("iconValue", { nullable: true }),

    // JSON fields - will be parsed in resolvers
    data: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.data) return null;
        return typeof parent.data === "string"
          ? parent.data
          : JSON.stringify(parent.data);
      },
    }),

    tags: t.field({
      type: "String",
      nullable: true,
      resolve: (parent) => {
        if (!parent.tags) return null;
        return typeof parent.tags === "string"
          ? parent.tags
          : JSON.stringify(parent.tags);
      },
    }),

    internalCode: t.exposeString("internalCode", { nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
    isActive: t.exposeBoolean("isActive"),
    isPopular: t.exposeBoolean("isPopular"),

    // Relations
    company: t.relation("company", { nullable: true }),
    companyId: t.exposeInt("companyId", { nullable: true }),

    standardItem: t.relation("standardItem", { nullable: true }),
    standardItemId: t.exposeInt("standardItemId", { nullable: true }),

    // 🔗 Certification Relations
    certifications: t.relation("certifications", {
      nullable: false,
      query: {
        where: {
          category: "CERTIFICATION",
          isActive: true,
        },
      },
    }),
    certifiedItems: t.relation("certifiedItems", {
      nullable: false,
    }),

    createdBy: t.relation("createdBy"),
    createdById: t.exposeInt("createdById"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Workshop", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    type: t.exposeString("type"),
    capacity: t.exposeInt("capacity"),
    location: t.exposeString("location"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("ProductionStageUpdate", {
  fields: (t) => ({
    id: t.exposeID("id"),
    stage: t.exposeString("stage"),
    notes: t.exposeString("notes"),
    status: t.exposeString("status"),
    extraDays: t.exposeInt("extraDays"),
    isRevision: t.exposeBoolean("isRevision"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("QualityControl", {
  fields: (t) => ({
    id: t.exposeID("id"),
    result: t.exposeString("result"),
    score: t.exposeInt("score"),
    notes: t.exposeString("notes"),
    fabricDefects: t.exposeBoolean("fabricDefects"),
    sewingDefects: t.exposeBoolean("sewingDefects"),
    measureDefects: t.exposeBoolean("measureDefects"),
    finishingDefects: t.exposeBoolean("finishingDefects"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("ProductionTracking", {
  fields: (t) => ({
    id: t.exposeID("id"),
    currentStage: t.exposeString("currentStage"),
    overallStatus: t.exposeString("overallStatus"),
    progress: t.exposeInt("progress"),
    notes: t.exposeString("notes"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Task", {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    status: t.exposeString("status"),
    priority: t.exposeString("priority"),
    type: t.exposeString("type"),
    dueDate: t.expose("dueDate", { type: "DateTime" }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("UserFavoriteCollection", {
  fields: (t) => ({
    id: t.exposeID("id"),
    userId: t.exposeInt("userId"),
    collectionId: t.exposeInt("collectionId"),
    user: t.relation("user"),
    collection: t.relation("collection"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("AIAnalysis", {
  fields: (t) => ({
    id: t.exposeID("id"),

    // Basic Analysis Results
    detectedProduct: t.exposeString("detectedProduct", { nullable: true }),
    detectedColor: t.exposeString("detectedColor", { nullable: true }),
    detectedFabric: t.exposeString("detectedFabric", { nullable: true }),
    detectedPattern: t.exposeString("detectedPattern", { nullable: true }),
    detectedGender: t.exposeString("detectedGender", { nullable: true }),
    detectedClassification: t.exposeString("detectedClassification", {
      nullable: true,
    }),
    detectedAccessories: t.exposeString("detectedAccessories", {
      nullable: true,
    }),
    technicalDescription: t.exposeString("technicalDescription", {
      nullable: true,
    }),

    // Quality Analysis
    qualityAnalysis: t.exposeString("qualityAnalysis", { nullable: true }),
    qualityScore: t.exposeFloat("qualityScore", { nullable: true }),

    // Cost Analysis
    costAnalysis: t.exposeString("costAnalysis", { nullable: true }),
    estimatedCostMin: t.exposeFloat("estimatedCostMin", { nullable: true }),
    estimatedCostMax: t.exposeFloat("estimatedCostMax", { nullable: true }),
    suggestedMinOrder: t.exposeInt("suggestedMinOrder", { nullable: true }),

    // Trend Analysis
    trendAnalysis: t.exposeString("trendAnalysis", { nullable: true }),
    trendScore: t.exposeFloat("trendScore", { nullable: true }),
    targetMarket: t.exposeString("targetMarket", { nullable: true }),
    salesPotential: t.exposeString("salesPotential", { nullable: true }),

    // Design Suggestions
    designSuggestions: t.exposeString("designSuggestions", { nullable: true }),
    designStyle: t.exposeString("designStyle", { nullable: true }),
    designFocus: t.exposeString("designFocus", { nullable: true }),

    // Relations
    sample: t.relation("sample"),
    sampleId: t.exposeInt("sampleId"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("SampleProduction", {
  fields: (t) => ({
    id: t.exposeID("id"),
    status: t.exposeString("status"),
    note: t.exposeString("note", { nullable: true }),
    estimatedDays: t.exposeInt("estimatedDays", { nullable: true }),
    actualDate: t.expose("actualDate", { type: "DateTime", nullable: true }),

    sample: t.relation("sample"),
    sampleId: t.exposeInt("sampleId"),
    updatedBy: t.relation("updatedBy"),
    updatedById: t.exposeInt("updatedById"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("OrderProduction", {
  fields: (t) => ({
    id: t.exposeID("id"),
    status: t.exposeString("status"),
    note: t.exposeString("note", { nullable: true }),
    estimatedDays: t.exposeInt("estimatedDays", { nullable: true }),
    actualDate: t.expose("actualDate", { type: "DateTime", nullable: true }),

    order: t.relation("order"),
    orderId: t.exposeInt("orderId"),
    updatedBy: t.relation("updatedBy"),
    updatedById: t.exposeInt("updatedById"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Revision", {
  fields: (t) => ({
    id: t.exposeID("id"),
    revisionNumber: t.exposeInt("revisionNumber"),
    requestMessage: t.exposeString("requestMessage", { nullable: true }),
    responseMessage: t.exposeString("responseMessage", { nullable: true }),
    status: t.exposeString("status"),
    requestedAt: t.expose("requestedAt", { type: "DateTime" }),
    completedAt: t.expose("completedAt", { type: "DateTime", nullable: true }),

    order: t.relation("order", { nullable: true }),
    orderId: t.exposeInt("orderId", { nullable: true }),
    sample: t.relation("sample", { nullable: true }),
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    productionTracking: t.relation("productionTracking", { nullable: true }),
    productionTrackingId: t.exposeInt("productionTrackingId", {
      nullable: true,
    }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("ProductionRevision", {
  fields: (t) => ({
    id: t.exposeID("id"),
    reason: t.exposeString("reason"),
    description: t.exposeString("description", { nullable: true }),
    extraDays: t.exposeInt("extraDays"),
    extraCost: t.exposeFloat("extraCost"),
    isApproved: t.exposeBoolean("isApproved"),

    production: t.relation("production"),
    productionId: t.exposeInt("productionId"),
    requestedBy: t.relation("requestedBy"),
    requestedById: t.exposeInt("requestedById"),

    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// ========================================
// ROOT QUERY TYPE (Boş başlatıyoruz - queries dosyalarında tanımlanıyor)
// ========================================

// Import and register queries
import "../queries/categoryQuery";
import "../queries/collectionQuery";
import "../queries/companyQuery";
import "../queries/libraryQuery"; // NEW - Unified library system
import "../queries/messageQuery";
import "../queries/notificationQuery";
import "../queries/orderQuery";
import "../queries/questionQuery";
import "../queries/reviewQuery";
import "../queries/sampleQuery";
import "../queries/standardCategoryQuery"; // ADMIN - Standard category management
import "../queries/userQuery";

// ========================================
// ROOT MUTATION TYPE (Boş başlatıyoruz - mutations dosyalarında tanımlanıyor)
// ========================================

// Import and register mutations
import "../mutations/categoryMutation"; // LEGACY - kept for backward compatibility
import "../mutations/collectionMutation";
import "../mutations/companyMutation";
import "../mutations/libraryMutation"; // NEW - Unified library system
import "../mutations/messageMutation";
import "../mutations/notificationMutation";
import "../mutations/orderMutation";
import "../mutations/questionMutation";
import "../mutations/reviewMutation";
import "../mutations/sampleMutation";
import "../mutations/standardCategoryMutation"; // ADMIN - Standard category management
import "../mutations/userMutation";

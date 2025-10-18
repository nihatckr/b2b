import builder from "../builder";

// ========================================
// PRISMA OBJECT TYPES
// ========================================

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    role: t.expose("role", { type: "String" }),
    department: t.expose("department", { type: "String" }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Company", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    phone: t.exposeString("phone"),
    type: t.expose("type", { type: "String" }),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Sample", {
  fields: (t) => ({
    id: t.exposeID("id"),
    sampleNumber: t.exposeString("sampleNumber"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    status: t.expose("status", { type: "String" }),
    aiGenerated: t.exposeBoolean("aiGenerated"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Order", {
  fields: (t) => ({
    id: t.exposeID("id"),
    orderNumber: t.exposeString("orderNumber"),
    quantity: t.exposeInt("quantity"),
    unitPrice: t.exposeFloat("unitPrice"),
    totalPrice: t.exposeFloat("totalPrice"),
    status: t.expose("status", { type: "String" }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Collection", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    modelCode: t.exposeString("modelCode"),
    season: t.expose("season", { type: "String" }),
    isActive: t.exposeBoolean("isActive"),
    isFeatured: t.exposeBoolean("isFeatured"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Category", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
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
// LIBRARY TYPES
// ========================================

builder.prismaObject("Color", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    hexCode: t.exposeString("hexCode"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Fabric", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    composition: t.exposeString("composition"),
    weight: t.exposeInt("weight"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("SizeGroup", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    category: t.exposeString("category"),
    sizes: t.exposeString("sizes"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("SeasonItem", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    fullName: t.exposeString("fullName"),
    year: t.exposeInt("year"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("FitItem", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    isActive: t.exposeBoolean("isActive"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.prismaObject("Certification", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    category: t.exposeString("category"),
    isActive: t.exposeBoolean("isActive"),
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
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

// ========================================
// ROOT QUERY TYPE (Boş başlatıyoruz - queries dosyalarında tanımlanıyor)
// ========================================

// Import and register queries
import "../queries/categoryQuery";
import "../queries/collectionQuery";
import "../queries/companyQuery";
import "../queries/messageQuery";
import "../queries/notificationQuery";
import "../queries/orderQuery";
import "../queries/questionQuery";
import "../queries/reviewQuery";
import "../queries/sampleQuery";
import "../queries/userQuery";

// ========================================
// ROOT MUTATION TYPE (Boş başlatıyoruz - mutations dosyalarında tanımlanıyor)
// ========================================

// Import and register mutations
import "../mutations/categoryMutation";
import "../mutations/collectionMutation";
import "../mutations/companyMutation";
import "../mutations/messageMutation";
import "../mutations/notificationMutation";
import "../mutations/orderMutation";
import "../mutations/questionMutation";
import "../mutations/reviewMutation";
import "../mutations/sampleMutation";
import "../mutations/userMutation";

/**
 * Advanced Query Operations
 *
 * 🎯 Purpose: Domain-specific queries for complex business logic
 * - Collection questions with answer filters
 * - Manufacturer/Customer specific orders and samples
 * - Product messages with conversation context
 * - Company-scoped collections and users
 *
 * 🔒 Security:
 * - All queries require authentication
 * - Permission-based access control
 * - Company isolation (users only see their company data)
 * - ADMIN override for cross-company access
 *
 * 📋 Query Categories:
 * 1. Collection Queries: collectionQuestions
 * 2. Order Queries: manufacturerOrders, customerOrders
 * 3. Sample Queries: manufacturerSamples, customerSamples
 * 4. Message Queries: productMessages
 * 5. Company Queries: companyCollections, companyUsers
 *
 * ⚠️ Note: Category queries moved to categoryQuery.ts
 */

import type { OrderStatus, SampleStatus } from "../../../lib/generated";
import { ForbiddenError } from "../../utils/errors";
import { hasPermission, Permission } from "../../utils/permissions";
import builder from "../builder";

// ========================================
// TYPE DEFINITIONS
// ========================================

type QuestionWhereInput = {
  collectionId?: number;
  answer?: { not: null } | null;
};

type OrderWhereInput = {
  manufactureId?: number;
  customerId?: number;
  status?: OrderStatus;
};

type SampleWhereInput = {
  manufactureId?: number;
  customerId?: number;
  status?: SampleStatus;
};

type MessageWhereInput = {
  sampleId?: number;
  orderId?: number;
};

// ========================================
// INPUT TYPES - Type-safe query arguments
// ========================================

// Collection Questions Filter Input
const CollectionQuestionsInput = builder.inputType("CollectionQuestionsInput", {
  fields: (t) => ({
    collectionId: t.int({ required: true }),
    answered: t.boolean({ required: false }),
  }),
});

// Order Status Filter Input
const OrderStatusFilterInput = builder.inputType("OrderStatusFilterInput", {
  fields: (t) => ({
    status: t.string({ required: false }), // OrderStatus enum as string
  }),
});

// Sample Status Filter Input
const SampleStatusFilterInput = builder.inputType("SampleStatusFilterInput", {
  fields: (t) => ({
    status: t.string({ required: false }), // SampleStatus enum as string
  }),
});

// Product Messages Filter Input
const ProductMessagesInput = builder.inputType("ProductMessagesInput", {
  fields: (t) => ({
    sampleId: t.int({ required: false }),
    orderId: t.int({ required: false }),
  }),
});

// Advanced Filter Input (for company-scoped queries with search)
const AdvancedFilterInput = builder.inputType("AdvancedFilterInput", {
  fields: (t) => ({
    search: t.string({ required: false }),
    isActive: t.boolean({ required: false }),
    companyId: t.int({ required: false }),
  }),
});

// ========================================
// QUERY FIELDS
// ========================================

/**
 * Collection Questions Query
 * Koleksiyona ait soruları listeler, cevaplandırılmış/cevapsız filtreleme
 *
 * ✅ Input Type: CollectionQuestionsInput
 * ✅ Public Access: Authentication required but no permission check
 */
builder.queryField("collectionQuestions", (t) =>
  t.prismaConnection({
    type: "Question",
    args: {
      input: t.arg({ type: CollectionQuestionsInput, required: true }),
    },
    cursor: "id",
    resolve: async (query, _root, args, context) => {
      const where: QuestionWhereInput = {
        collectionId: args.input.collectionId,
      };

      // Cevap durumu filtresi
      if (args.input.answered !== undefined) {
        if (args.input.answered) {
          where.answer = { not: null };
        } else {
          where.answer = null;
        }
      }

      return context.prisma.question.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Manufacturer Orders Query
 * Üreticiye (manufacture) ait siparişleri listeler
 *
 * ✅ Input Type: OrderStatusFilterInput
 * ✅ Permission: ORDER_VIEW required
 * ✅ Scope: Current user's manufacture orders only
 */
builder.queryField("manufacturerOrders", (t) =>
  t.prismaConnection({
    type: "Order",
    args: {
      input: t.arg({ type: OrderStatusFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // Permission kontrolü
      if (
        !hasPermission(
          context.user.role as any,
          context.user.department as any,
          Permission.ORDER_VIEW
        )
      ) {
        throw new ForbiddenError("Sipariş görüntüleme yetkiniz yok");
      }

      const where: OrderWhereInput = {
        manufactureId: context.user.id, // Schema'da manufactureId var
      };

      // Durum filtresi
      if (args.input?.status) {
        where.status = args.input.status as OrderStatus;
      }

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Customer Orders Query
 * Müşteriye ait siparişleri listeler
 *
 * ✅ Input Type: OrderStatusFilterInput
 * ✅ Permission: ORDER_VIEW required
 * ✅ Scope: Current user's customer orders only
 */
builder.queryField("customerOrders", (t) =>
  t.prismaConnection({
    type: "Order",
    args: {
      input: t.arg({ type: OrderStatusFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // Permission kontrolü
      if (
        !hasPermission(
          context.user.role as any,
          context.user.department as any,
          Permission.ORDER_VIEW
        )
      ) {
        throw new ForbiddenError("Sipariş görüntüleme yetkiniz yok");
      }

      const where: OrderWhereInput = {
        customerId: context.user.id, // Schema'da customerId var
      };

      // Durum filtresi
      if (args.input?.status) {
        where.status = args.input.status as OrderStatus;
      }

      return context.prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Manufacturer Samples Query
 * Üreticiye (manufacture) ait numuneleri listeler
 *
 * ✅ Input Type: SampleStatusFilterInput
 * ✅ Permission: SAMPLE_VIEW required
 * ✅ Scope: Current user's manufacture samples only
 */
builder.queryField("manufacturerSamples", (t) =>
  t.prismaConnection({
    type: "Sample",
    args: {
      input: t.arg({ type: SampleStatusFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // Permission kontrolü
      if (
        !hasPermission(
          context.user.role as any,
          context.user.department as any,
          Permission.SAMPLE_VIEW
        )
      ) {
        throw new ForbiddenError("Numune görüntüleme yetkiniz yok");
      }

      const where: SampleWhereInput = {
        manufactureId: context.user.id, // Schema'da manufactureId var
      };

      // Durum filtresi
      if (args.input?.status) {
        where.status = args.input.status as SampleStatus;
      }

      return context.prisma.sample.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Customer Samples Query
 * Müşteriye ait numuneleri listeler
 *
 * ✅ Input Type: SampleStatusFilterInput
 * ✅ Permission: SAMPLE_VIEW required
 * ✅ Scope: Current user's customer samples only
 */
builder.queryField("customerSamples", (t) =>
  t.prismaConnection({
    type: "Sample",
    args: {
      input: t.arg({ type: SampleStatusFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // Permission kontrolü
      if (
        !hasPermission(
          context.user.role as any,
          context.user.department as any,
          Permission.SAMPLE_VIEW
        )
      ) {
        throw new ForbiddenError("Numune görüntüleme yetkiniz yok");
      }

      const where: SampleWhereInput = {
        customerId: context.user.id, // Schema'da customerId var
      };

      // Durum filtresi
      if (args.input?.status) {
        where.status = args.input.status as SampleStatus;
      }

      return context.prisma.sample.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Product Messages Query
 * Sipariş veya numune bazlı mesajları listeler (konuşma geçmişi)
 *
 * ✅ Input Type: ProductMessagesInput (sampleId OR orderId required)
 * ✅ Security: User can only see messages they sent or received
 * ✅ Scope: Message isolation by sender/receiver
 */
builder.queryField("productMessages", (t) =>
  t.prismaConnection({
    type: "Message",
    args: {
      input: t.arg({ type: ProductMessagesInput, required: true }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      const where: MessageWhereInput = {};

      // En az biri gerekli
      if (!args.input.sampleId && !args.input.orderId) {
        throw new Error("sampleId veya orderId gerekli");
      }

      if (args.input.sampleId) {
        where.sampleId = args.input.sampleId;
      }

      if (args.input.orderId) {
        where.orderId = args.input.orderId;
      }

      // Güvenlik: Kullanıcı sadece kendi mesajlarını veya kendisine gönderilen mesajları görebilir
      const messages = await context.prisma.message.findMany({
        ...query,
        where: {
          ...where,
          OR: [{ senderId: context.user.id }, { receiverId: context.user.id }],
        },
        orderBy: { createdAt: "asc" },
      });

      return messages;
    },
  })
);

// ========================================
// DEPRECATED QUERIES - Removed for code quality
// Use categoryQuery.ts instead for all category operations
// ========================================
// - myCategories → Use allCategories from categoryQuery.ts
// - categoriesByCompany → Use allCategories from categoryQuery.ts
// - allCategories → Use allCategories from categoryQuery.ts

/**
 * Company Collections Query
 * Firmaya ait koleksiyonları listeler
 *
 * ✅ Permission Check: COLLECTION_VIEW yetkisi kontrolü
 * ✅ Company Isolation: Kullanıcı sadece kendi firmasının koleksiyonlarını görebilir
 * ✅ Input Type: AdvancedFilterInput kullanılıyor
 */
builder.queryField("companyCollections", (t) =>
  t.prismaConnection({
    type: "Collection",
    args: {
      input: t.arg({ type: AdvancedFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // ✅ Permission check
      if (
        !hasPermission(
          context.user.role as any,
          context.user.department as any,
          Permission.COLLECTION_VIEW
        )
      ) {
        throw new ForbiddenError("Koleksiyon görüntüleme yetkiniz yok");
      }

      const companyId = args.input?.companyId || context.user.companyId;

      // ✅ Security: Company isolation (ADMIN can view all)
      if (
        context.user.role !== "ADMIN" &&
        context.user.companyId !== companyId
      ) {
        throw new ForbiddenError(
          "Sadece kendi firmanızın koleksiyonlarını görüntüleyebilirsiniz"
        );
      }

      const where: any = {
        companyId,
      };

      // ✅ Filters from input
      if (args.input?.isActive !== undefined) {
        where.isActive = args.input.isActive;
      } else {
        where.isActive = true; // Default: active only
      }

      if (args.input?.search) {
        where.OR = [
          { name: { contains: args.input.search, mode: "insensitive" } },
          { modelCode: { contains: args.input.search, mode: "insensitive" } },
          { description: { contains: args.input.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.collection.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

/**
 * Company Users Query
 * Firmaya ait kullanıcıları listeler
 *
 * ✅ Permission Check: USER_VIEW OR COMPANY_MANAGE_USERS
 * ✅ Company Isolation: Kullanıcı sadece kendi firmasının kullanıcılarını görebilir
 * ✅ Input Type: AdvancedFilterInput kullanılıyor
 */
builder.queryField("companyUsers", (t) =>
  t.prismaConnection({
    type: "User",
    args: {
      input: t.arg({ type: AdvancedFilterInput, required: false }),
    },
    cursor: "id",
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      if (!context.user?.id) {
        throw new Error("Kimlik doğrulaması gerekli");
      }

      // ✅ Permission check: USER_VIEW OR COMPANY_MANAGE_USERS
      const hasUserViewPermission = hasPermission(
        context.user.role as any,
        context.user.department as any,
        Permission.USER_VIEW
      );
      const hasManageUsersPermission = hasPermission(
        context.user.role as any,
        context.user.department as any,
        Permission.COMPANY_MANAGE_USERS
      );

      if (!hasUserViewPermission && !hasManageUsersPermission) {
        throw new ForbiddenError("Kullanıcı görüntüleme yetkiniz yok");
      }

      const companyId = args.input?.companyId || context.user.companyId;

      // ✅ Security: Company isolation (ADMIN can view all)
      if (
        context.user.role !== "ADMIN" &&
        context.user.companyId !== companyId
      ) {
        throw new ForbiddenError(
          "Sadece kendi firmanızın kullanıcılarını görüntüleyebilirsiniz"
        );
      }

      const where: any = {
        companyId,
      };

      // ✅ Filters from input
      if (args.input?.isActive !== undefined) {
        where.isActive = args.input.isActive;
      } else {
        where.isActive = true; // Default: active only
      }

      if (args.input?.search) {
        where.OR = [
          { name: { contains: args.input.search, mode: "insensitive" } },
          { email: { contains: args.input.search, mode: "insensitive" } },
          { username: { contains: args.input.search, mode: "insensitive" } },
        ];
      }

      return context.prisma.user.findMany({
        ...query,
        where,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

import { arg, queryField } from "nexus";
import { Context } from "../../context";
import { createConnection, PaginationArgs } from "../../utils/pagination";
import { getUserId } from "../../utils/userUtils";

// Users with cursor pagination
export const usersPaginated = queryField("usersPaginated", {
  type: "UserConnection",
  args: {
    pagination: arg({ type: "PaginationInput" }),
    filter: arg({ type: "UserFilterInput" }),
    sort: arg({ type: "SortOrder" }),
  },
  resolve: async (_, args, context: Context) => {
    const userId = getUserId(context);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get current user for company scope filtering
    const currentUser = await context.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    // Build where conditions
    const where: any = {};

    // Company scope filtering
    if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
    }

    // Apply filters
    if (args.filter) {
      if (args.filter.search) {
        where.OR = [
          { email: { contains: args.filter.search, mode: "insensitive" } },
          { name: { contains: args.filter.search, mode: "insensitive" } },
          { username: { contains: args.filter.search, mode: "insensitive" } },
          { firstName: { contains: args.filter.search, mode: "insensitive" } },
          { lastName: { contains: args.filter.search, mode: "insensitive" } },
        ];
      }
      if (args.filter.role) where.role = args.filter.role;
      if (args.filter.isActive !== undefined)
        where.isActive = args.filter.isActive;
      if (args.filter.companyId && currentUser?.role === "ADMIN") {
        where.companyId = args.filter.companyId;
      }
    }

    // Build sort conditions
    const orderBy: any = { createdAt: "desc" }; // Default
    if (args.sort) {
      orderBy[args.sort.field] = args.sort.direction;
    }

    // Get total count
    const totalCount = await context.prisma.user.count({ where });

    // Handle cursor pagination
    const pagination = args.pagination || {};
    const limit = Math.min(pagination.first || 20, 100); // Max 100 items

    let cursorWhere = {};
    if (pagination.after) {
      const afterId = parseInt(
        Buffer.from(pagination.after, "base64").toString("utf8")
      );
      cursorWhere = { id: { gt: afterId } };
    }

    const users = await context.prisma.user.findMany({
      where: { ...where, ...cursorWhere },
      orderBy,
      take: limit + 1, // Take one more to check if there's a next page
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, -1) : users;

    return createConnection(items, pagination as PaginationArgs, totalCount);
  },
});

// Collections with cursor pagination
export const collectionsPaginated = queryField("collectionsPaginated", {
  type: "CollectionConnection",
  args: {
    pagination: arg({ type: "PaginationInput" }),
    filter: arg({ type: "CollectionFilterInput" }),
    sort: arg({ type: "SortOrder" }),
  },
  resolve: async (_, args, context: Context) => {
    const userId = getUserId(context);

    // Build where conditions
    const where: any = {};

    // Company scope filtering for authenticated users
    if (userId) {
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, companyId: true },
      });

      if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
        where.companyId = currentUser.companyId;
      }
    }

    // Apply filters
    if (args.filter) {
      if (args.filter.search) {
        where.OR = [
          { name: { contains: args.filter.search, mode: "insensitive" } },
          {
            description: { contains: args.filter.search, mode: "insensitive" },
          },
        ];
      }
      if (args.filter.categoryId) where.categoryId = args.filter.categoryId;
      if (args.filter.userId) where.userId = args.filter.userId;
      if (args.filter.isActive !== undefined)
        where.isActive = args.filter.isActive;
      if (args.filter.isFeatured !== undefined)
        where.isFeatured = args.filter.isFeatured;
      if (
        args.filter.companyId &&
        (!userId ||
          (
            await context.prisma.user.findUnique({
              where: { id: userId },
              select: { role: true },
            })
          )?.role === "ADMIN")
      ) {
        where.companyId = args.filter.companyId;
      }
    }

    // Build sort conditions
    const orderBy: any = { createdAt: "desc" }; // Default
    if (args.sort) {
      orderBy[args.sort.field] = args.sort.direction;
    }

    // Get total count
    const totalCount = await context.prisma.collection.count({ where });

    // Handle cursor pagination
    const pagination = args.pagination || {};
    const limit = Math.min(pagination.first || 20, 100);

    let cursorWhere = {};
    if (pagination.after) {
      const afterId = parseInt(
        Buffer.from(pagination.after, "base64").toString("utf8")
      );
      cursorWhere = { id: { gt: afterId } };
    }

    const collections = await context.prisma.collection.findMany({
      where: { ...where, ...cursorWhere },
      orderBy,
      take: limit + 1,
    });

    const hasNextPage = collections.length > limit;
    const items = hasNextPage ? collections.slice(0, -1) : collections;

    return createConnection(items, pagination as PaginationArgs, totalCount);
  },
});

// Samples with cursor pagination
export const samplesPaginated = queryField("samplesPaginated", {
  type: "SampleConnection",
  args: {
    pagination: arg({ type: "PaginationInput" }),
    filter: arg({ type: "SampleFilterInput" }),
    sort: arg({ type: "SortOrder" }),
  },
  resolve: async (_, args, context: Context) => {
    const userId = getUserId(context);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Build where conditions
    const where: any = {};

    // Company scope filtering
    const currentUser = await context.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
    }

    // Apply filters
    if (args.filter) {
      if (args.filter.search) {
        where.OR = [
          {
            sampleNumber: { contains: args.filter.search, mode: "insensitive" },
          },
          {
            customerNote: { contains: args.filter.search, mode: "insensitive" },
          },
          {
            manufacturerResponse: {
              contains: args.filter.search,
              mode: "insensitive",
            },
          },
        ];
      }
      if (args.filter.status) where.status = args.filter.status;
      if (args.filter.customerId) where.customerId = args.filter.customerId;
      if (args.filter.manufactureId)
        where.manufactureId = args.filter.manufactureId;
      if (args.filter.collectionId)
        where.collectionId = args.filter.collectionId;
    }

    // User can only see their own samples (customer or manufacturer)
    if (currentUser?.role !== "ADMIN") {
      where.OR = [{ customerId: userId }, { manufactureId: userId }];
    }

    const orderBy: any = { createdAt: "desc" };
    if (args.sort) {
      orderBy[args.sort.field] = args.sort.direction;
    }

    const totalCount = await context.prisma.sample.count({ where });

    const pagination = args.pagination || {};
    const limit = Math.min(pagination.first || 20, 100);

    let cursorWhere = {};
    if (pagination.after) {
      const afterId = parseInt(
        Buffer.from(pagination.after, "base64").toString("utf8")
      );
      cursorWhere = { id: { gt: afterId } };
    }

    const samples = await context.prisma.sample.findMany({
      where: { ...where, ...cursorWhere },
      orderBy,
      take: limit + 1,
    });

    const hasNextPage = samples.length > limit;
    const items = hasNextPage ? samples.slice(0, -1) : samples;

    return createConnection(items, pagination as PaginationArgs, totalCount);
  },
});

// Orders with cursor pagination
export const ordersPaginated = queryField("ordersPaginated", {
  type: "OrderConnection",
  args: {
    pagination: arg({ type: "PaginationInput" }),
    filter: arg({ type: "OrderFilterInput" }),
    sort: arg({ type: "SortOrder" }),
  },
  resolve: async (_, args, context: Context) => {
    const userId = getUserId(context);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Build where conditions
    const where: any = {};

    // Company scope filtering
    const currentUser = await context.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
    }

    // Apply filters
    if (args.filter) {
      if (args.filter.search) {
        where.OR = [
          {
            orderNumber: { contains: args.filter.search, mode: "insensitive" },
          },
          {
            customerNote: { contains: args.filter.search, mode: "insensitive" },
          },
          {
            manufacturerNote: {
              contains: args.filter.search,
              mode: "insensitive",
            },
          },
        ];
      }
      if (args.filter.status) where.status = args.filter.status;
      if (args.filter.customerId) where.customerId = args.filter.customerId;
      if (args.filter.manufactureId)
        where.manufactureId = args.filter.manufactureId;
      if (args.filter.collectionId)
        where.collectionId = args.filter.collectionId;
    }

    // User can only see their own orders (customer or manufacturer)
    if (currentUser?.role !== "ADMIN") {
      where.OR = [{ customerId: userId }, { manufactureId: userId }];
    }

    const orderBy: any = { createdAt: "desc" };
    if (args.sort) {
      orderBy[args.sort.field] = args.sort.direction;
    }

    const totalCount = await context.prisma.order.count({ where });

    const pagination = args.pagination || {};
    const limit = Math.min(pagination.first || 20, 100);

    let cursorWhere = {};
    if (pagination.after) {
      const afterId = parseInt(
        Buffer.from(pagination.after, "base64").toString("utf8")
      );
      cursorWhere = { id: { gt: afterId } };
    }

    const orders = await context.prisma.order.findMany({
      where: { ...where, ...cursorWhere },
      orderBy,
      take: limit + 1,
    });

    const hasNextPage = orders.length > limit;
    const items = hasNextPage ? orders.slice(0, -1) : orders;

    return createConnection(items, pagination as PaginationArgs, totalCount);
  },
});

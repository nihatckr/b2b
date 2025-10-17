import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const collectionQueries = (t: any) => {
  // Get all collections with filtering
  t.list.field("collections", {
    type: "Collection",
    args: {
      categoryId: intArg(),
      companyId: intArg(),
      isActive: booleanArg(),
      isFeatured: booleanArg(),
      search: stringArg(),
      location: stringArg(), // Üretici lokasyonu filtresi
      manufacturerName: stringArg(), // Üretici ismi filtresi
      limit: intArg(),
      offset: intArg(),
    },
    resolve: async (
      _parent: unknown,
      args: {
        categoryId?: number;
        companyId?: number;
        isActive?: boolean;
        isFeatured?: boolean;
        search?: string;
        location?: string;
        manufacturerName?: string;
        limit?: number;
        offset?: number;
      },
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

      const userRole = getUserRole(user);

      // Build where clause based on permissions and filters
      const where: any = {};

      // Role-based filtering
      if (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") {
        // Manufacturers can only see their company's collections
        if (user.company?.type === "MANUFACTURER") {
          where.companyId = user.companyId;
        } else {
          // Buyers see all active collections
          where.isActive = true;
        }
      } else if (userRole === "CUSTOMER" || userRole === "INDIVIDUAL_CUSTOMER") {
        // Customers can only see active collections
        where.isActive = true;
      }
      // Admins see all collections

      // Apply additional filters
      if (args.categoryId) {
        where.categoryId = args.categoryId;
      }

      if (args.companyId) {
        // Only admins can filter by any company
        if (userRole === "ADMIN") {
          where.companyId = args.companyId;
        } else if (
          (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") &&
          args.companyId === user.companyId
        ) {
          where.companyId = args.companyId;
        }
      }

      if (args.isActive !== undefined) {
        where.isActive = args.isActive;
      }

      if (args.isFeatured !== undefined) {
        where.isFeatured = args.isFeatured;
      }

      if (args.search) {
        where.OR = [
          ...(where.OR || []),
          { name: { contains: args.search, mode: "insensitive" } },
          { description: { contains: args.search, mode: "insensitive" } },
          { sku: { contains: args.search, mode: "insensitive" } },
        ];
      }

      // Lokasyon filtresi
      if (args.location) {
        where.company = {
          ...where.company,
          location: { contains: args.location, mode: "insensitive" },
        };
      }

      // Üretici ismi filtresi
      if (args.manufacturerName) {
        where.company = {
          ...where.company,
          name: { contains: args.manufacturerName, mode: "insensitive" },
        };
      }

      return context.prisma.collection.findMany({
        where,
        include: {
          category: true,
          company: true,
          author: true,
          certifications: true, // Sertifikaları dahil et
        },
        orderBy: { createdAt: "desc" },
        take: args.limit || undefined,
        skip: args.offset || undefined,
      });
    },
  });

  // Get collections by category (with hierarchy)
  t.list.field("collectionsByCategory", {
    type: "Collection",
    args: {
      categoryId: nonNull(intArg()),
      includeSubcategories: booleanArg(),
    },
    resolve: async (
      _parent: unknown,
      args: { categoryId: number; includeSubcategories?: boolean },
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

      const userRole = getUserRole(user);

      // Get category and its subcategories if requested
      let categoryIds = [args.categoryId];

      if (args.includeSubcategories) {
        const subcategories = await context.prisma.category.findMany({
          where: { parentCategoryId: args.categoryId },
        });
        categoryIds.push(...subcategories.map((cat) => cat.id));
      }

      // Build where clause
      const where: any = {
        categoryId: { in: categoryIds },
      };

      // Role-based filtering
      if (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") {
        // Manufacturers can only see their company's collections
        if (user.company?.type === "MANUFACTURER") {
          where.companyId = user.companyId;
        } else {
          where.isActive = true;
        }
      } else if (userRole === "CUSTOMER" || userRole === "INDIVIDUAL_CUSTOMER") {
        where.isActive = true;
      }

      return context.prisma.collection.findMany({
        where,
        include: {
          category: true,
          company: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get single collection by ID
  t.field("collection", {
    type: "Collection",
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
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const collection = await context.prisma.collection.findUnique({
        where: { id },
        include: {
          category: true,
          company: true,
          author: true,
        },
      });

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Permission check
      if ((userRole === "CUSTOMER" || userRole === "INDIVIDUAL_CUSTOMER") && !collection.isActive) {
        throw new Error("Collection not accessible");
      }

      if (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") {
        // Manufacturers can only see their company's collections
        if (user.company?.type === "MANUFACTURER" && collection.companyId !== user.companyId) {
          throw new Error("Not authorized to view this collection");
        }
      }

      return collection;
    },
  });

  // Get collections by company
  t.list.field("collectionsByCompany", {
    type: "Collection",
    args: {
      companyId: nonNull(intArg()),
      isActive: booleanArg(),
    },
    resolve: async (
      _parent: unknown,
      args: { companyId: number; isActive?: boolean },
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

      const userRole = getUserRole(user);

      // Permission check
      if ((userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") && args.companyId !== user.companyId) {
        throw new Error(
          "Not authorized to view collections from different company"
        );
      }

      const where: any = {
        companyId: args.companyId,
      };

      if (args.isActive !== undefined) {
        where.isActive = args.isActive;
      } else if (userRole === "CUSTOMER" || userRole === "INDIVIDUAL_CUSTOMER") {
        where.isActive = true;
      }

      return context.prisma.collection.findMany({
        where,
        include: {
          category: true,
          company: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get my collections (for manufacturers)
  t.list.field("myCollections", {
    type: "Collection",
    resolve: async (_parent: unknown, _args: unknown, context: Context) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      if (userRole === "CUSTOMER" || userRole === "INDIVIDUAL_CUSTOMER") {
        throw new Error("Customers cannot access this query");
      }

      const where: any = {};

      if (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") {
        // Manufacturers see only their company's collections
        where.companyId = user.companyId;
      } else if (userRole === "ADMIN") {
        // Admins see all collections
      }

      return context.prisma.collection.findMany({
        where,
        include: {
          category: true,
          company: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get featured collections
  t.list.field("featuredCollections", {
    type: "Collection",
    args: {
      limit: intArg(),
    },
    resolve: async (
      _parent: unknown,
      args: { limit?: number },
      context: Context
    ) => {
      return context.prisma.collection.findMany({
        where: {
          isFeatured: true,
          isActive: true,
        },
        include: {
          category: true,
          company: true,
          author: true,
        },
        orderBy: { createdAt: "desc" },
        take: args.limit || 10,
      });
    },
  });
};

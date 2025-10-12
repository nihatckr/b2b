import { arg, extendType, intArg, nonNull, stringArg } from "nexus";
import type { Context } from "../../context";
import { requireAuth } from "../../utils/userUtils";

export const SearchQuery = extendType({
  type: "Query",
  definition(t) {
    // Global search across all content types
    t.field("globalSearch", {
      type: "String", // SearchResult will be JSON string for now
      args: {
        searchTerm: nonNull(stringArg()),
        filters: arg({ type: "SearchFiltersInput" }),
        sort: arg({ type: "SearchSortInput" }),
        type: arg({ type: "SearchType" }),
        first: intArg(),
        after: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context) => {
        requireAuth(ctx);

        const searchTerm = args.searchTerm?.toLowerCase() || "";
        const first = args.first || 20;
        const searchType = args.type || "ALL";

        const results = {
          collections: [] as any[],
          products: [] as any[],
          orders: [] as any[],
          samples: [] as any[],
          totalCount: 0,
          query: searchTerm,
        };

        // Company scope filtering
        const companyId = args.filters?.companyId;
        const companyFilter = companyId ? { companyId } : {};

        try {
          // Search Collections
          if (searchType === "ALL" || searchType === "COLLECTIONS") {
            const collectionsWhere = {
              ...companyFilter,
              OR: [
                {
                  name: { contains: searchTerm, mode: "insensitive" as const },
                },
                {
                  description: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  slug: { contains: searchTerm, mode: "insensitive" as const },
                },
              ],
              ...(typeof args.filters?.isActive === "boolean" && {
                isActive: args.filters.isActive,
              }),
              ...(typeof args.filters?.isFeatured === "boolean" && {
                isFeatured: args.filters.isFeatured,
              }),
              ...(args.filters?.categoryId &&
                args.filters.categoryId !== null && {
                  categoryId: args.filters.categoryId,
                }),
              ...(args.filters?.manufacturerId &&
                args.filters.manufacturerId !== null && {
                  userId: args.filters.manufacturerId,
                }),
            };

            results.collections = await ctx.prisma.collection.findMany({
              where: collectionsWhere as any,
              take: first,
              include: {
                category: true,
                user: {
                  select: { id: true, name: true, email: true },
                },
                variants: {
                  take: 3,
                  select: { id: true, variantCode: true, price: true },
                },
              },
              orderBy: { createdAt: "desc" },
            });
          }

          // Search Product Variants
          if (searchType === "ALL" || searchType === "PRODUCTS") {
            const productsWhere = {
              ...companyFilter,
              OR: [
                {
                  variantCode: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  collection: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
              ...(args.filters?.priceMin && {
                price: { gte: args.filters.priceMin },
              }),
              ...(args.filters?.priceMax && {
                price: { lte: args.filters.priceMax },
              }),
              ...(args.filters?.manufacturerId && {
                collection: { userId: args.filters.manufacturerId },
              }),
            };

            results.products = await ctx.prisma.productVariant.findMany({
              where: productsWhere,
              take: first,
              include: {
                collection: {
                  select: { id: true, name: true, userId: true },
                },
              },
              orderBy: { createdAt: "desc" },
            });
          }

          // Search Orders
          if (searchType === "ALL" || searchType === "ORDERS") {
            const ordersWhere = {
              ...companyFilter,
              OR: [
                {
                  orderCode: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  collection: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
              ...(args.filters?.statuses &&
                args.filters.statuses.length > 0 &&
                args.filters.statuses.every((s) => s !== null) && {
                  status: {
                    in: args.filters.statuses.filter(
                      (s): s is NonNullable<typeof s> => s !== null
                    ) as any,
                  },
                }),
              ...(args.filters?.customerId && {
                customerId: args.filters.customerId,
              }),
              ...(args.filters?.manufacturerId && {
                manufactureId: args.filters.manufacturerId,
              }),
            };

            results.orders = await ctx.prisma.order.findMany({
              where: ordersWhere as any,
              take: first,
              include: {
                collection: {
                  select: { id: true, name: true },
                },
                customer: {
                  select: { id: true, name: true, email: true },
                },
                manufacture: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: "desc" },
            });
          }

          // Search Samples
          if (searchType === "ALL" || searchType === "SAMPLES") {
            const samplesWhere = {
              ...companyFilter,
              OR: [
                {
                  sampleNumber: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  customerNote: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  collection: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
              ...(args.filters?.statuses &&
                args.filters.statuses.length > 0 &&
                args.filters.statuses.every((s) => s !== null) && {
                  status: {
                    in: args.filters.statuses.filter(
                      (s): s is NonNullable<typeof s> => s !== null
                    ) as any,
                  },
                }),
              ...(args.filters?.customerId && {
                customerId: args.filters.customerId,
              }),
              ...(args.filters?.manufacturerId && {
                manufactureId: args.filters.manufacturerId,
              }),
            };

            results.samples = await ctx.prisma.sample.findMany({
              where: samplesWhere as any,
              take: first,
              include: {
                collection: {
                  select: { id: true, name: true },
                },
                customer: {
                  select: { id: true, name: true, email: true },
                },
                manufacture: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: "desc" },
            });
          }

          // Calculate total count
          results.totalCount =
            results.collections.length +
            results.products.length +
            results.orders.length +
            results.samples.length;

          return JSON.stringify(results);
        } catch (error) {
          console.error("🔍 Search error:", error);
          throw new Error("Search failed. Please try again.");
        }
      },
    });

    // Enhanced collections search
    t.field("searchCollections", {
      type: "CollectionConnection",
      args: {
        filters: arg({ type: "CollectionFiltersInput" }),
        sort: arg({ type: "SearchSortInput" }),
        first: intArg(),
        after: stringArg(),
      },
      resolve: async (_parent, args, ctx: Context): Promise<any> => {
        requireAuth(ctx);

        const first = args.first || 20;
        const filters = args.filters || {};

        // Build complex where clause
        const whereClause: any = {
          // Company scope
          ...(filters.manufacturerId && { userId: filters.manufacturerId }),

          // Text search
          ...(filters.searchTerm && {
            OR: [
              {
                name: {
                  contains: filters.searchTerm,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: filters.searchTerm,
                  mode: "insensitive" as const,
                },
              },
              {
                slug: {
                  contains: filters.searchTerm,
                  mode: "insensitive" as const,
                },
              },
            ],
          }),

          // Category filter
          ...(filters.categoryId &&
            filters.categoryId !== null && { categoryId: filters.categoryId }),

          // Boolean filters
          ...(filters.isActive !== undefined &&
            filters.isActive !== null && { isActive: filters.isActive }),
          ...(filters.isFeatured !== undefined &&
            filters.isFeatured !== null && {
              isFeatured: filters.isFeatured,
            }),

          // Price range filter (through variants)
          ...((filters.priceMin || filters.priceMax) && {
            variants: {
              some: {
                ...(filters.priceMin && {
                  unitPrice: { gte: filters.priceMin },
                }),
                ...(filters.priceMax && {
                  unitPrice: { lte: filters.priceMax },
                }),
              },
            },
          }),

          // Lead time filter (through variants)
          ...((filters.leadTimeMin || filters.leadTimeMax) && {
            variants: {
              some: {
                ...(filters.leadTimeMin && {
                  leadTimeDays: { gte: filters.leadTimeMin },
                }),
                ...(filters.leadTimeMax && {
                  leadTimeDays: { lte: filters.leadTimeMax },
                }),
              },
            },
          }),
        };

        // Build sort clause
        let orderBy: any = { createdAt: "desc" };
        if (args.sort) {
          const direction = args.sort.direction === "ASC" ? "asc" : "desc";
          switch (args.sort.field) {
            case "name":
              orderBy = { name: direction };
              break;
            case "createdAt":
              orderBy = { createdAt: direction };
              break;
            case "updatedAt":
              orderBy = { updatedAt: direction };
              break;
            default:
              orderBy = { createdAt: "desc" };
          }
        }

        const collections = await ctx.prisma.collection.findMany({
          where: whereClause,
          take: first + 1,
          orderBy,
          include: {
            category: true,
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
            variants: {
              take: 5,
              select: {
                id: true,
                variantCode: true,
                price: true,
                leadTimeDays: true,
                color: true,
                size: true,
              },
            },
            _count: {
              select: {
                samples: true,
                orders: true,
              },
            },
          },
        });

        // Pagination logic
        const hasNextPage = collections.length > first;
        const edges = collections.slice(0, first).map((collection) => ({
          node: collection as any,
          cursor: Buffer.from(collection.id.toString()).toString("base64"),
        }));

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: false,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor,
          },
          totalCount: collections.length,
        };
      },
    });
  },
});

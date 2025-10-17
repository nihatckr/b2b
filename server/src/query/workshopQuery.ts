import { extendType, intArg, nonNull } from "nexus";

export const WorkshopQuery = extendType({
  type: "Query",
  definition(t) {
    // Get all workshops
    t.list.field("workshops", {
      type: "Workshop",
      args: {
        type: "WorkshopType",
        isActive: "Boolean",
      },
      resolve: async (_, args, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const where: any = {};

        // Role-based filtering: Only show workshops owned by user or their company
        if (user.role !== "ADMIN") {
          where.OR = [
            { ownerId: userId }, // User's own workshops
            { ownerId: { in: [] } }, // Placeholder for company workshops
          ];

          // Get company members' workshops
          if (user.companyId) {
            const companyMembers = await ctx.prisma.user.findMany({
              where: { companyId: user.companyId },
              select: { id: true },
            });
            where.OR[1].ownerId.in = companyMembers.map((m: any) => m.id);
          }
        }

        if (args.type) {
          where.type = args.type;
        }

        if (args.isActive !== undefined) {
          where.isActive = args.isActive;
        }

        const workshops = await ctx.prisma.workshop.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                sewingProductions: true,
                packagingProductions: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });

        return workshops;
      },
    });

    // Get workshop by ID
    t.field("workshop", {
      type: "Workshop",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const workshop = await ctx.prisma.workshop.findUnique({
          where: { id },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                companyId: true,
              },
            },
            sewingProductions: {
              include: {
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                  },
                },
                sample: {
                  select: {
                    id: true,
                    sampleNumber: true,
                    status: true,
                  },
                },
              },
            },
            packagingProductions: {
              include: {
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                  },
                },
                sample: {
                  select: {
                    id: true,
                    sampleNumber: true,
                    status: true,
                  },
                },
              },
            },
          },
        });

        if (!workshop) {
          throw new Error("Atölye bulunamadı");
        }

        // Permission check: Only admin, owner, or company members can view
        const isAdmin = user.role === "ADMIN";
        const isOwner = workshop.ownerId === userId;
        const isCompanyMember = workshop.owner.companyId === user.companyId;

        if (!isAdmin && !isOwner && !isCompanyMember) {
          throw new Error("Bu atölyeyi görüntüleme yetkiniz yok");
        }

        return workshop;
      },
    });

    // Get my workshops (owned by current user)
    t.list.field("myWorkshops", {
      type: "Workshop",
      resolve: async (_, __, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const workshops = await ctx.prisma.workshop.findMany({
          where: {
            ownerId: userId,
          },
          include: {
            _count: {
              select: {
                sewingProductions: true,
                packagingProductions: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });

        return workshops;
      },
    });

    // Get workshop statistics
    t.field("workshopStats", {
      type: "WorkshopStats",
      args: {
        workshopId: intArg(),
      },
      resolve: async (_, { workshopId }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Build production tracking where clause based on permissions
        let productionWhere: any = workshopId
          ? {
              OR: [
                { sewingWorkshopId: workshopId },
                { packagingWorkshopId: workshopId },
              ],
            }
          : {};

        // Non-admins can only see their company's production stats
        if (user.role !== "ADMIN") {
          const companyFilter = {
            OR: [
              {
                order: {
                  OR: [
                    { manufactureId: userId },
                    { manufacture: { companyId: user.companyId } },
                  ],
                },
              },
              {
                sample: {
                  OR: [
                    { manufactureId: userId },
                    { manufacture: { companyId: user.companyId } },
                  ],
                },
              },
            ],
          };

          if (workshopId) {
            productionWhere = {
              AND: [productionWhere, companyFilter],
            };
          } else {
            productionWhere = companyFilter;
          }
        }

        // Build workshop where clause
        const workshopWhere: any = { isActive: true };
        if (user.role !== "ADMIN" && user.companyId) {
          const companyMembers = await ctx.prisma.user.findMany({
            where: { companyId: user.companyId },
            select: { id: true },
          });
          workshopWhere.ownerId = { in: companyMembers.map((m: any) => m.id) };
        }

        const [
          totalProductions,
          activeProductions,
          completedProductions,
          workshops,
        ] = await Promise.all([
          ctx.prisma.productionTracking.count({ where: productionWhere }),
          ctx.prisma.productionTracking.count({
            where: {
              ...productionWhere,
              overallStatus: "IN_PROGRESS",
            },
          }),
          ctx.prisma.productionTracking.count({
            where: {
              ...productionWhere,
              overallStatus: "COMPLETED",
            },
          }),
          ctx.prisma.workshop.count({ where: workshopWhere }),
        ]);

        return {
          totalWorkshops: workshops,
          totalProductions,
          activeProductions,
          completedProductions,
          utilizationRate:
            totalProductions > 0
              ? Math.round((activeProductions / totalProductions) * 100)
              : 0,
        };
      },
    });
  },
});

import { inputObjectType, objectType } from "nexus";

export const Workshop = objectType({
  name: "Workshop",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.nonNull.field("type", { type: "WorkshopType" });
    t.int("capacity");
    t.string("location");
    t.nonNull.boolean("isActive");
    t.nonNull.int("ownerId");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });

    t.nonNull.field("updatedAt", {
      type: "DateTime",
      resolve: (parent) => parent.updatedAt,
    });

    // Relations
    t.field("owner", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.ownerId },
        });
      },
    });

    t.list.field("sewingProductions", {
      type: "ProductionTracking",
      resolve: (parent, _, ctx) => {
        return ctx.prisma.workshop
          .findUnique({
            where: { id: parent.id },
          })
          .sewingProductions();
      },
    });

    t.list.field("packagingProductions", {
      type: "ProductionTracking",
      resolve: (parent, _, ctx) => {
        return ctx.prisma.workshop
          .findUnique({
            where: { id: parent.id },
          })
          .packagingProductions();
      },
    });

    // Computed fields
    t.int("activeProductionCount", {
      resolve: async (parent, _, ctx) => {
        const count = await ctx.prisma.productionTracking.count({
          where: {
            OR: [
              { sewingWorkshopId: parent.id },
              { packagingWorkshopId: parent.id },
            ],
            overallStatus: "IN_PROGRESS",
          },
        });
        return count;
      },
    });

    t.int("totalProductionCount", {
      resolve: async (parent, _, ctx) => {
        const count = await ctx.prisma.productionTracking.count({
          where: {
            OR: [
              { sewingWorkshopId: parent.id },
              { packagingWorkshopId: parent.id },
            ],
          },
        });
        return count;
      },
    });

    t.float("utilizationRate", {
      resolve: async (parent, _, ctx) => {
        if (!parent.capacity) return 0;

        const activeCount = await ctx.prisma.productionTracking.count({
          where: {
            OR: [
              { sewingWorkshopId: parent.id },
              { packagingWorkshopId: parent.id },
            ],
            overallStatus: "IN_PROGRESS",
          },
        });

        return Math.round((activeCount / parent.capacity) * 100);
      },
    });
  },
});

// Workshop Stats Type
export const WorkshopStats = objectType({
  name: "WorkshopStats",
  definition(t) {
    t.nonNull.int("totalWorkshops");
    t.nonNull.int("totalProductions");
    t.nonNull.int("activeProductions");
    t.nonNull.int("completedProductions");
    t.nonNull.int("utilizationRate");
  },
});

export const CreateWorkshopInput = inputObjectType({
  name: "CreateWorkshopInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.field("type", { type: "WorkshopType" });
    t.int("capacity");
    t.string("location");
  },
});

export const UpdateWorkshopInput = inputObjectType({
  name: "UpdateWorkshopInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.field("type", { type: "WorkshopType" });
    t.int("capacity");
    t.string("location");
    t.boolean("isActive");
  },
});

import { inputObjectType, objectType } from "nexus";

export const QualityControl = objectType({
  name: "QualityControl",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("productionId");
    t.nonNull.int("inspectorId");
    t.nonNull.string("checkDate", {
      resolve: (parent) => parent.checkDate.toISOString(),
    });
    t.nonNull.field("result", { type: "QualityResult" });
    t.int("score"); // 1-100
    t.string("notes");
    t.string("photos"); // JSON
    t.nonNull.boolean("fabricDefects");
    t.nonNull.boolean("sewingDefects");
    t.nonNull.boolean("measureDefects");
    t.nonNull.boolean("finishingDefects");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });

    // Relations
    t.field("inspector", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.inspectorId },
        });
      },
    });
  },
});

export const CreateQualityControlInput = inputObjectType({
  name: "CreateQualityControlInput",
  definition(t) {
    t.nonNull.int("productionId");
    t.nonNull.field("result", { type: "QualityResult" });
    t.int("score");
    t.string("notes");
    t.boolean("fabricDefects");
    t.boolean("sewingDefects");
    t.boolean("measureDefects");
    t.boolean("finishingDefects");
  },
});

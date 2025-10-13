import { inputObjectType, objectType } from "nexus";

export const Fabric = objectType({
  name: "Fabric",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("code");
    t.nonNull.string("composition");
    t.int("weight");
    t.int("width");
    t.string("supplier");
    t.float("price");
    t.int("minOrder");
    t.int("leadTime");
    t.string("imageUrl");
    t.string("description");
    t.nonNull.boolean("isActive");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    t.field("company", {
      type: "Company",
      resolve: (fabric, _args, ctx) =>
        ctx.prisma.fabric.findUnique({ where: { id: fabric.id } }).company(),
    });
  },
});

export const CreateFabricInput = inputObjectType({
  name: "CreateFabricInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("code");
    t.nonNull.string("composition");
    t.int("weight");
    t.int("width");
    t.string("supplier");
    t.float("price");
    t.int("minOrder");
    t.int("leadTime");
    t.string("imageUrl");
    t.string("description");
    t.boolean("isActive");
  },
});

export const UpdateFabricInput = inputObjectType({
  name: "UpdateFabricInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("code");
    t.string("composition");
    t.int("weight");
    t.int("width");
    t.string("supplier");
    t.float("price");
    t.int("minOrder");
    t.int("leadTime");
    t.string("imageUrl");
    t.string("description");
    t.boolean("isActive");
  },
});

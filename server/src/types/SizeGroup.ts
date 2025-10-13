import { inputObjectType, objectType } from "nexus";

export const SizeGroup = objectType({
  name: "SizeGroup",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("category");
    t.list.string("sizes", {
      resolve: (parent) => {
        if (!parent.sizes) return [];
        try {
          return JSON.parse(parent.sizes);
        } catch {
          return [];
        }
      },
    });
    t.string("description");
    t.nonNull.boolean("isActive");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    t.field("company", {
      type: "Company",
      resolve: (sizeGroup, _args, ctx) =>
        ctx.prisma.sizeGroup
          .findUnique({ where: { id: sizeGroup.id } })
          .company(),
    });
  },
});

export const CreateSizeGroupInput = inputObjectType({
  name: "CreateSizeGroupInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("category");
    t.nonNull.list.nonNull.string("sizes");
    t.string("description");
    t.boolean("isActive");
  },
});

export const UpdateSizeGroupInput = inputObjectType({
  name: "UpdateSizeGroupInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("category");
    t.list.nonNull.string("sizes");
    t.string("description");
    t.boolean("isActive");
  },
});

import { inputObjectType, objectType } from "nexus";

export const Color = objectType({
  name: "Color",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("code");
    t.string("hexCode");
    t.string("imageUrl");
    t.nonNull.boolean("isActive");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    t.field("company", {
      type: "Company",
      resolve: (color, _args, ctx) =>
        ctx.prisma.color.findUnique({ where: { id: color.id } }).company(),
    });
  },
});

export const CreateColorInput = inputObjectType({
  name: "CreateColorInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("code");
    t.string("hexCode");
    t.string("imageUrl");
    t.boolean("isActive");
  },
});

export const UpdateColorInput = inputObjectType({
  name: "UpdateColorInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("code");
    t.string("hexCode");
    t.string("imageUrl");
    t.boolean("isActive");
  },
});

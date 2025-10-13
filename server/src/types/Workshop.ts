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

    // Relations
    t.field("owner", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.ownerId },
        });
      },
    });
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

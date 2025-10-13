import { objectType } from "nexus";

export const FitItem = objectType({
  name: "FitItem",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("code");
    t.string("category");
    t.string("description");
    t.nonNull.boolean("isActive");

    t.field("company", {
      type: "Company",
      resolve: (parent: any, _args: any, context: any) => {
        return context.prisma.fitItem
          .findUnique({ where: { id: parent.id } })
          .company();
      },
    });

    t.nonNull.int("companyId");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
  },
});

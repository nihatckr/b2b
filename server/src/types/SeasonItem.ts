import { objectType } from "nexus";

export const SeasonItem = objectType({
  name: "SeasonItem",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.nonNull.string("fullName");
    t.nonNull.int("year");
    t.nonNull.string("type");
    t.field("startDate", { type: "DateTime" });
    t.field("endDate", { type: "DateTime" });
    t.string("description");
    t.nonNull.boolean("isActive");
    
    t.field("company", {
      type: "Company",
      resolve: (parent: any, _args: any, context: any) => {
        return context.prisma.seasonItem
          .findUnique({ where: { id: parent.id } })
          .company();
      },
    });
    
    t.nonNull.int("companyId");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
  },
});


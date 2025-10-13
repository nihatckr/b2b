import { inputObjectType } from "nexus";

export const CompanyCreateInput = inputObjectType({
  name: "CompanyCreateInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.string("email");
    t.string("phone");
    t.string("address");
    t.string("website");
    t.boolean("isActive");
  },
});

export const CompanyUpdateInput = inputObjectType({
  name: "CompanyUpdateInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("email");
    t.string("phone");
    t.string("address");
    t.string("website");
    t.boolean("isActive");
  },
});

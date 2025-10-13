import { inputObjectType } from "nexus";

export const UserUpdateInput = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("email");
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.string("department");
    t.string("jobTitle");
    t.string("permissions"); // JSON string
    t.field("role", { type: "Role" });
    t.boolean("isActive");
    t.boolean("isCompanyOwner");
    t.string("companyId");
  },
});

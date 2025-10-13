import { inputObjectType } from "nexus";

export const SignupInput = inputObjectType({
  name: "SignupInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.field("role", { type: "Role" });
    t.string("companyId"); // Deprecated - use companyFlow
    t.field("companyFlow", { type: "CompanyFlowInput" });
    t.string("department");
    t.string("jobTitle");
    t.string("permissions"); // JSON string: {"collections": {"view": true, ...}}
  },
});

import { enumType, inputObjectType } from "nexus";

export const CompanyAction = enumType({
  name: "CompanyAction",
  members: ["CREATE_NEW", "JOIN_EXISTING"],
  description: "Company signup action",
});

export const CompanyFlowInput = inputObjectType({
  name: "CompanyFlowInput",
  definition(t) {
    t.nonNull.field("action", { type: "CompanyAction" });

    // For CREATE_NEW
    t.string("companyName");
    t.string("companyEmail");
    t.string("companyPhone");
    t.string("companyAddress");
    t.string("companyWebsite");
    t.field("companyType", { type: "CompanyType" });

    // For JOIN_EXISTING
    t.int("companyId");
    t.string("inviteCode");
  },
});


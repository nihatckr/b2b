import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("email");
    t.nonNull.field("role", { type: "Role" });
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.int("companyId");

    // Company & Permissions
    t.nonNull.boolean("isCompanyOwner");
    t.nonNull.boolean("isPendingApproval");
    t.string("department");
    t.string("jobTitle");
    t.string("permissions", {
      resolve: (parent) => {
        if (!parent.permissions) return null;
        return typeof parent.permissions === "string"
          ? parent.permissions
          : JSON.stringify(parent.permissions);
      },
    });

    t.nonNull.boolean("isActive");
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Company relation - optional
    t.field("company", {
      type: "Company",
      resolve: async (parent, _args, context) => {
        if (!parent.companyId) return null;
        return context.prisma.company.findUnique({
          where: { id: parseInt(parent.companyId.toString()) },
        });
      },
    });
  },
});

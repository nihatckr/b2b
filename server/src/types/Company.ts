import { inputObjectType, objectType } from "nexus";

export const Company = objectType({
  name: "Company",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("description");
    t.string("website");
    t.string("address");
    t.string("location"); // Şehir/Bölge
    t.string("phone");
    t.nonNull.string("email");
    t.nonNull.field("type", { type: "CompanyType" });
    t.int("ownerId");
    t.nonNull.boolean("isActive");
    t.string("settings", {
      resolve: (parent) => {
        if (!parent.settings) return null;
        return typeof parent.settings === "string"
          ? parent.settings
          : JSON.stringify(parent.settings);
      },
    });
    t.nonNull.string("createdAt", {
      resolve: (parent) => parent.createdAt.toISOString(),
    });
    t.nonNull.string("updatedAt", {
      resolve: (parent) => parent.updatedAt.toISOString(),
    });

    // Owner relation
    t.field("owner", {
      type: "User",
      resolve: async (parent, _args, context) => {
        if (!parent.ownerId) return null;
        return context.prisma.user.findUnique({
          where: { id: parent.ownerId },
        });
      },
    });

    // Employees relation
    t.list.field("employees", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findMany({
          where: { companyId: parent.id },
        });
      },
    });

    // Legacy: users (for backward compatibility)
    t.list.field("users", {
      type: "User",
      resolve: async (parent, _args, context) => {
        return context.prisma.user.findMany({
          where: { companyId: parent.id },
        });
      },
    });
  },
});

export const CreateCompanyInput = inputObjectType({
  name: "CreateCompanyInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("description");
    t.string("website");
    t.string("address");
    t.string("location"); // Şehir/Bölge
    t.string("phone");
    t.nonNull.string("email");
  },
});

export const UpdateCompanyInput = inputObjectType({
  name: "UpdateCompanyInput",
  definition(t) {
    t.string("name");
    t.string("description");
    t.string("website");
    t.string("address");
    t.string("location"); // Şehir/Bölge
    t.string("phone");
    t.string("email");
    t.boolean("isActive");
  },
});

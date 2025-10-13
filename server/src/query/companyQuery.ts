import { Context } from "../context";
import { requireAuth } from "../utils/user-role-helper";

export const companyQueries = (t: any) => {
  t.list.field("allCompanies", {
    type: "Company",
    resolve: async (_: any, __: any, context: Context) => {
      // All authenticated users can view companies (ADMIN, MANUFACTURER, CUSTOMER)
      requireAuth(context);

      return context.prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          employees: true,
        },
      });
    },
  });

  t.field("company", {
    type: "Company",
    args: {
      id: "Int",
    },
    resolve: async (_: any, args: any, context: Context) => {
      // All authenticated users can view company details
      requireAuth(context);

      return context.prisma.company.findUnique({
        where: { id: args.id },
        include: {
          employees: true,
        },
      });
    },
  });
};

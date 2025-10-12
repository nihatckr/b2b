import { arg, list, mutationField, nonNull, queryField } from "nexus";
import { Context } from "../../context";
import { getUserId } from "../../utils/userUtils";

// Queries
export const companies = queryField("companies", {
  type: list("Company"),
  resolve: async (_, __, context: Context) => {
    const userId = getUserId(context);

    // If authenticated, apply company scope filtering
    if (userId) {
      const currentUser = await context.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, companyId: true },
      });

      // Non-admin users can only see their own company
      if (currentUser?.role !== "ADMIN" && currentUser?.companyId) {
        return context.prisma.company.findMany({
          where: { id: currentUser.companyId },
          orderBy: { name: "asc" },
        });
      }
    }

    return context.prisma.company.findMany({
      orderBy: { name: "asc" },
    });
  },
});

// Mutations
export const createCompany = mutationField("createCompany", {
  type: "Company",
  args: {
    input: nonNull(arg({ type: "CreateCompanyInput" })),
  },
  resolve: async (_, args, context: Context) => {
    const company = await context.prisma.company.create({
      data: args.input,
    });

    return company;
  },
});

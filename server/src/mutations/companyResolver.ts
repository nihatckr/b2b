import { booleanArg, intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import {
  getUserRole,
  requireAdmin,
  requireAuth,
  requireManufacture,
  validateEmail,
} from "../utils/user-role-helper";

export const companyMutations = (t: any) => {
  t.field("createCompany", {
    type: "Company",
    args: {
      name: nonNull(stringArg()),
      email: nonNull(stringArg()),
      phone: stringArg(),
      address: stringArg(),
      website: stringArg(),
      isActive: booleanArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      // Allow both ADMIN and MANUFACTURER to create companies
      await requireManufacture(context);

      // Validate email
      try {
        validateEmail(args.email);
      } catch (error) {
        throw new Error("Please enter a valid email address.");
      }

      // Check if company with email already exists
      const existingCompany = await context.prisma.company.findUnique({
        where: { email: args.email.toLowerCase().trim() },
      });

      if (existingCompany) {
        throw new Error("Company with this email already exists.");
      }

      // Create company
      const company = await context.prisma.company.create({
        data: {
          name: args.name.trim(),
          email: args.email.toLowerCase().trim(),
          phone: args.phone?.trim() || null,
          address: args.address?.trim() || null,
          website: args.website?.trim() || null,
          isActive: args.isActive !== undefined ? args.isActive : true,
        },
      });

      return company;
    },
  });

  t.field("updateCompany", {
    type: "Company",
    args: {
      id: nonNull(intArg()),
      name: stringArg(),
      email: stringArg(),
      phone: stringArg(),
      address: stringArg(),
      website: stringArg(),
      description: stringArg(),
      isActive: booleanArg(),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = requireAuth(context);

      // Get user and check permissions
      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) throw new Error("User not found");

      const userRole = getUserRole(user);

      // Admin can update any company, company owner can update their own
      if (userRole !== "ADMIN") {
        if (!user.companyId || user.companyId !== args.id) {
          throw new Error("Not authorized to update this company");
        }
        if (!user.isCompanyOwner) {
          throw new Error("Only company owner can update company settings");
        }
      }

      const updates: any = {};

      if (args.name !== undefined && args.name !== null) {
        if (args.name.trim() === "") {
          throw new Error("Company name cannot be empty.");
        }
        updates.name = args.name.trim();
      }

      if (args.email !== undefined && args.email !== null) {
        try {
          validateEmail(args.email);
        } catch (error) {
          throw new Error("Please enter a valid email address.");
        }

        // Check if email already exists (but not current company)
        const existingCompany = await context.prisma.company.findUnique({
          where: { email: args.email.toLowerCase().trim() },
        });

        if (existingCompany && existingCompany.id !== args.id) {
          throw new Error("Company with this email already exists.");
        }

        updates.email = args.email.toLowerCase().trim();
      }

      if (args.phone !== undefined) {
        updates.phone = args.phone?.trim() || null;
      }

      if (args.address !== undefined) {
        updates.address = args.address?.trim() || null;
      }

      if (args.website !== undefined) {
        updates.website = args.website?.trim() || null;
      }

      if (args.description !== undefined) {
        updates.description = args.description?.trim() || null;
      }

      if (args.isActive !== undefined && args.isActive !== null) {
        updates.isActive = args.isActive;
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("No updates provided.");
      }

      return context.prisma.company.update({
        where: { id: args.id },
        data: updates,
      });
    },
  });

  t.field("deleteCompany", {
    type: "Company",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      await requireAdmin(context);

      // Check if company exists
      const company = await context.prisma.company.findUnique({
        where: { id: args.id },
        include: {
          employees: true,
        },
      });

      if (!company) {
        throw new Error("Company not found.");
      }

      // Check if company has employees
      if (company.employees.length > 0) {
        throw new Error(
          "Cannot delete company with existing employees. Please reassign or remove employees first."
        );
      }

      // Delete company
      const deletedCompany = await context.prisma.company.delete({
        where: { id: args.id },
      });

      // Success log
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `✅ COMPANY DELETED: ${deletedCompany.name} (ID: ${deletedCompany.id})`
        );
      }

      return deletedCompany;
    },
  });
};

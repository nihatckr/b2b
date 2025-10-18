import builder from "../builder";

const ValidCompanyTypes = ["MANUFACTURER", "BUYER", "BOTH"];

// Create company (admin only)
builder.mutationField("createCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      name: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      phone: t.arg.string(),
      type: t.arg.string({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      if (!ValidCompanyTypes.includes(args.type)) {
        throw new Error(
          `Invalid company type. Must be one of: ${ValidCompanyTypes.join(
            ", "
          )}`
        );
      }
      return context.prisma.company.create({
        ...query,
        data: {
          name: args.name,
          email: args.email,
          ...(args.phone !== null && args.phone !== undefined
            ? { phone: args.phone }
            : {}),
          type: args.type as any,
          isActive: true,
        },
      });
    },
  })
);

// Update company (owner or admin)
builder.mutationField("updateCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      email: t.arg.string(),
      phone: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      // Check if user owns this company
      if (
        context.user?.companyId !== args.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      return context.prisma.company.update({
        ...query,
        where: { id: args.id },
        data: {
          ...(args.name !== null && args.name !== undefined
            ? { name: args.name }
            : {}),
          ...(args.email !== null && args.email !== undefined
            ? { email: args.email }
            : {}),
          ...(args.phone !== null && args.phone !== undefined
            ? { phone: args.phone }
            : {}),
          ...(args.description !== null && args.description !== undefined
            ? { description: args.description }
            : {}),
        },
      });
    },
  })
);

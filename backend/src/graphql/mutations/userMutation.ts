import bcrypt from "bcryptjs";
import builder from "../builder";

const ValidRoles = [
  "ADMIN",
  "COMPANY_OWNER",
  "COMPANY_EMPLOYEE",
  "INDIVIDUAL_CUSTOMER",
];

// Create user (admin only)
builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      if (!ValidRoles.includes(args.role)) {
        throw new Error(
          `Invalid role. Must be one of: ${ValidRoles.join(", ")}`
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10);

      return context.prisma.user.create({
        ...query,
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name,
          role: args.role as any,
        },
      });
    },
  })
);

// Update user
builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      email: t.arg.string(),
      phone: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      // Check if user is updating themselves or is admin
      if (context.user?.id !== args.id && context.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      return context.prisma.user.update({
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
        },
      });
    },
  })
);

// Delete user (admin only)
builder.mutationField("deleteUser", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      await context.prisma.user.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

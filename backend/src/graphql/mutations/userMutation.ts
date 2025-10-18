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

      // Profile fields
      avatar: t.arg.string(),
      bio: t.arg.string(),
      socialLinks: t.arg.string(), // JSON string

      // Settings
      emailNotifications: t.arg.boolean(),
      pushNotifications: t.arg.boolean(),
      language: t.arg.string(),
      timezone: t.arg.string(),

      // Permissions
      department: t.arg.string(),
      jobTitle: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      // Check if user is updating themselves or is admin
      if (context.user?.id !== args.id && context.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const updateData: any = {};

      // Basic fields
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.email !== null && args.email !== undefined)
        updateData.email = args.email;
      if (args.phone !== null && args.phone !== undefined)
        updateData.phone = args.phone;

      // Profile fields
      if (args.avatar !== null && args.avatar !== undefined)
        updateData.avatar = args.avatar;
      if (args.bio !== null && args.bio !== undefined)
        updateData.bio = args.bio;
      if (args.socialLinks !== null && args.socialLinks !== undefined)
        updateData.socialLinks = args.socialLinks;

      // Settings
      if (args.emailNotifications !== null && args.emailNotifications !== undefined)
        updateData.emailNotifications = args.emailNotifications;
      if (args.pushNotifications !== null && args.pushNotifications !== undefined)
        updateData.pushNotifications = args.pushNotifications;
      if (args.language !== null && args.language !== undefined)
        updateData.language = args.language;
      if (args.timezone !== null && args.timezone !== undefined)
        updateData.timezone = args.timezone;

      // Permissions (admin only for these)
      if (context.user?.role === "ADMIN") {
        if (args.department !== null && args.department !== undefined)
          updateData.department = args.department;
        if (args.jobTitle !== null && args.jobTitle !== undefined)
          updateData.jobTitle = args.jobTitle;
      }

      return context.prisma.user.update({
        ...query,
        where: { id: args.id },
        data: updateData,
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

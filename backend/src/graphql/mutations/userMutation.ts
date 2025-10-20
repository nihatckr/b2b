import bcrypt from "bcryptjs";
import builder from "../builder";

const ValidRoles = [
  "ADMIN",
  "COMPANY_OWNER",
  "COMPANY_EMPLOYEE",
  "INDIVIDUAL_CUSTOMER",
];

// Create user (admin only)
builder.mutationField("createUserByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      role: t.arg.string({ required: true }),
      companyId: t.arg.int(), // Optional company ID
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      console.log("🔍 createUser called with args:", {
        email: args.email,
        name: args.name,
        role: args.role,
        companyId: args.companyId,
      });

      if (!ValidRoles.includes(args.role)) {
        throw new Error(
          `Invalid role. Must be one of: ${ValidRoles.join(", ")}`
        );
      }

      // Check if email already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existingUser) {
        throw new Error("Bu e-posta adresi zaten kullanılıyor");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10);

      // Prepare user data
      const userData: any = {
        email: args.email,
        password: hashedPassword,
        name: args.name,
        role: args.role as any,
      };

      // Add company connection if companyId is provided
      if (args.companyId) {
        console.log("✅ Adding company connection:", args.companyId);
        userData.company = {
          connect: { id: args.companyId },
        };
      }

      const user = await context.prisma.user.create({
        ...query,
        data: userData,
      });

      console.log("✅ User created:", {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      // ✅ Notify other admins about new user created by admin
      try {
        const currentUserId = context.user?.id;
        const admins = await context.prisma.user.findMany({
          where: {
            role: "ADMIN",
            ...(currentUserId && { id: { not: currentUserId } }), // Don't notify the admin who created the user
          },
          select: { id: true, name: true },
        });

        for (const admin of admins) {
          const adminNotification = await context.prisma.notification.create({
            data: {
              type: "USER_MANAGEMENT",
              title: "👤 Admin Tarafından Kullanıcı Oluşturuldu",
              message: `Admin tarafından yeni kullanıcı oluşturuldu: ${user.name} (${user.email}). Rol: ${user.role}`,
              userId: admin.id,
              link: "/dashboard/admin/users",
              isRead: false,
            },
          });

          // Import publishNotification here since it's not imported in this file
          const { publishNotification } = await import(
            "../../utils/publishHelpers"
          );
          await publishNotification(adminNotification);
          console.log(
            `📢 Admin user creation notification sent to admin ${admin.id} (${admin.name})`
          );
        }
      } catch (adminNotifError) {
        console.error(
          "⚠️  Admin notification failed (continuing anyway):",
          adminNotifError instanceof Error
            ? adminNotifError.message
            : adminNotifError
        );
      }

      return user;
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
      password: t.arg.string(), // New password (optional)

      // Role and company (admin only)
      role: t.arg.string(),
      companyId: t.arg.int(),

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
      console.log("✏️ updateUser called with:", {
        id: args.id,
        name: args.name,
        email: args.email,
        phone: args.phone,
        role: args.role,
        companyId: args.companyId,
        hasPassword: !!args.password,
        department: args.department,
        jobTitle: args.jobTitle,
      });

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

      // Password (hash if provided)
      if (args.password !== null && args.password !== undefined) {
        updateData.password = await bcrypt.hash(args.password, 10);
      }

      // Profile fields
      if (args.avatar !== null && args.avatar !== undefined)
        updateData.avatar = args.avatar;
      if (args.bio !== null && args.bio !== undefined)
        updateData.bio = args.bio;
      if (args.socialLinks !== null && args.socialLinks !== undefined)
        updateData.socialLinks = args.socialLinks;

      // Settings
      if (
        args.emailNotifications !== null &&
        args.emailNotifications !== undefined
      )
        updateData.emailNotifications = args.emailNotifications;
      if (
        args.pushNotifications !== null &&
        args.pushNotifications !== undefined
      )
        updateData.pushNotifications = args.pushNotifications;
      if (args.language !== null && args.language !== undefined)
        updateData.language = args.language;
      if (args.timezone !== null && args.timezone !== undefined)
        updateData.timezone = args.timezone;

      // Role and Company (admin only)
      if (context.user?.role === "ADMIN") {
        // Role change
        if (args.role !== null && args.role !== undefined) {
          if (!ValidRoles.includes(args.role)) {
            throw new Error(
              `Invalid role. Must be one of: ${ValidRoles.join(", ")}`
            );
          }
          updateData.role = args.role as any;
        }

        // Company change
        if (args.companyId !== null && args.companyId !== undefined) {
          // Verify company exists
          const company = await context.prisma.company.findUnique({
            where: { id: args.companyId },
          });
          if (!company) throw new Error("Company not found");
          updateData.companyId = args.companyId;
        } else if (args.companyId === null) {
          // Explicitly set to null if null is passed
          updateData.companyId = null;
        }

        // Department and Job Title
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
builder.mutationField("deleteUserByAdmin", (t) =>
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

// Admin: Activate/Deactivate user
builder.mutationField("toggleUserStatusByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      userId: t.arg.int({ required: true }),
      isActive: t.arg.boolean({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      return context.prisma.user.update({
        ...query,
        where: { id: args.userId },
        data: { isActive: args.isActive },
      });
    },
  })
);

// Admin: Update user's company
builder.mutationField("updateUserCompanyByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      userId: t.arg.int({ required: true }),
      companyId: t.arg.int(),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const updateData: any = {};

      if (args.companyId !== null && args.companyId !== undefined) {
        // Verify company exists
        const company = await context.prisma.company.findUnique({
          where: { id: args.companyId },
        });

        if (!company) throw new Error("Company not found");
        updateData.companyId = args.companyId;
      } else {
        updateData.companyId = null;
      }

      return context.prisma.user.update({
        ...query,
        where: { id: args.userId },
        data: updateData,
      });
    },
  })
);

// Admin: Bulk activate/deactivate users
builder.mutationField("bulkToggleUserStatus", (t) =>
  t.field({
    type: "JSON",
    args: {
      userIds: t.arg.intList({ required: true }),
      isActive: t.arg.boolean({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const result = await context.prisma.user.updateMany({
        where: {
          id: { in: args.userIds },
        },
        data: { isActive: args.isActive },
      });

      return {
        success: true,
        count: result.count,
        message: `${result.count} users ${
          args.isActive ? "activated" : "deactivated"
        } successfully`,
      };
    },
  })
);

// Admin: Bulk delete users
builder.mutationField("bulkDeleteUsersByAdmin", (t) =>
  t.field({
    type: "JSON",
    args: {
      userIds: t.arg.intList({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      // Prevent deleting admin users
      const adminUsers = await context.prisma.user.findMany({
        where: {
          id: { in: args.userIds },
          role: "ADMIN",
        },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        throw new Error("Cannot delete admin users through bulk action");
      }

      const result = await context.prisma.user.deleteMany({
        where: {
          id: { in: args.userIds },
          role: { not: "ADMIN" }, // Extra safety check
        },
      });

      return {
        success: true,
        count: result.count,
        message: `${result.count} users deleted successfully`,
      };
    },
  })
);

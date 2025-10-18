import bcrypt from "bcryptjs";
import builder from "../builder";

// Login (returns JWT token)
builder.mutationField("login", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (!user) throw new Error("Invalid email or password");

      const isValidPassword = await bcrypt.compare(
        args.password,
        user.password
      );
      if (!isValidPassword) throw new Error("Invalid email or password");

      // In real app, generate JWT token here
      return {
        token: `jwt_token_for_${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },
  })
);

// Signup (creates new user)
builder.mutationField("signup", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string(),
      role: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const existing = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existing) throw new Error("Email already registered");

      const hashedPassword = await bcrypt.hash(args.password, 10);

      const user = await context.prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name || args.email,
          role: (args.role || "INDIVIDUAL_CUSTOMER") as any,
        },
      });

      return {
        token: `jwt_token_for_${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },
  })
);

// Register (alias for signup)
builder.mutationField("register", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string(),
      role: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const existing = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existing) throw new Error("Email already registered");

      const hashedPassword = await bcrypt.hash(args.password, 10);

      const user = await context.prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name || args.email,
          role: (args.role || "INDIVIDUAL_CUSTOMER") as any,
        },
      });

      return {
        token: `jwt_token_for_${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },
  })
);

// SignupOAuth (Google/OAuth - no password required)
builder.mutationField("signupOAuth", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      email: t.arg.string({ required: true }),
      name: t.arg.string({ required: true }),
      role: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      // Email already exists - update name if different
      let user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (user) {
        // User already exists, update name if needed
        if (user.name !== args.name) {
          user = await context.prisma.user.update({
            where: { email: args.email },
            data: { name: args.name },
          });
        }
      } else {
        // Create new OAuth user (with empty password)
        user = await context.prisma.user.create({
          data: {
            email: args.email,
            name: args.name,
            password: "", // OAuth users don't have password
            role: (args.role || "INDIVIDUAL_CUSTOMER") as any,
          },
        });
      }

      return {
        token: `jwt_token_for_${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    },
  })
);

// Logout (client-side only, but here for completeness)
builder.mutationField("logout", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");
      return true;
    },
  })
);

// Change password (authenticated user)
builder.mutationField("changePassword", (t) =>
  t.field({
    type: "Boolean",
    args: {
      oldPassword: t.arg.string({ required: true }),
      newPassword: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });

      if (!user) throw new Error("User not found");

      const isValidPassword = await bcrypt.compare(
        args.oldPassword,
        user.password
      );
      if (!isValidPassword) throw new Error("Old password is incorrect");

      const hashedPassword = await bcrypt.hash(args.newPassword, 10);

      await context.prisma.user.update({
        where: { id: context.user.id },
        data: { password: hashedPassword },
      });

      return true;
    },
  })
);

// Update profile (authenticated user)
builder.mutationField("updateProfile", (t) =>
  t.prismaField({
    type: "User",
    args: {
      name: t.arg.string(),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      phone: t.arg.string(),
      department: t.arg.string(),
      jobTitle: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      return context.prisma.user.update({
        ...query,
        where: { id: context.user.id },
        data: {
          name: args.name || undefined,
          firstName: args.firstName || undefined,
          lastName: args.lastName || undefined,
          phone: args.phone || undefined,
          department: args.department || undefined,
          jobTitle: args.jobTitle || undefined,
        } as any,
      });
    },
  })
);

// Reset user password (admin only)
builder.mutationField("resetUserPassword", (t) =>
  t.prismaField({
    type: "User",
    args: {
      userId: t.arg.int({ required: true }),
      newPassword: t.arg.string({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const user = await context.prisma.user.findUnique({
        where: { id: args.userId },
      });

      if (!user) throw new Error("User not found");

      const hashedPassword = await bcrypt.hash(args.newPassword, 10);

      return context.prisma.user.update({
        ...query,
        where: { id: args.userId },
        data: { password: hashedPassword },
      });
    },
  })
);

// Update user role (admin only)
builder.mutationField("updateUserRole", (t) =>
  t.prismaField({
    type: "User",
    args: {
      userId: t.arg.int({ required: true }),
      role: t.arg.string({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const ValidRoles = [
        "ADMIN",
        "COMPANY_OWNER",
        "COMPANY_EMPLOYEE",
        "INDIVIDUAL_CUSTOMER",
        "MANUFACTURE",
        "CUSTOMER",
      ];

      if (!ValidRoles.includes(args.role)) {
        throw new Error("Invalid role");
      }

      return context.prisma.user.update({
        ...query,
        where: { id: args.userId },
        data: { role: args.role as any },
      });
    },
  })
);

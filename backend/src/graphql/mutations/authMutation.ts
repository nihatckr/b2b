import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import builder from "../builder";

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-only-for-dev';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Helper function to generate JWT token
function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id.toString(),      // Subject (user ID) - standard JWT claim
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
    }
  );
}

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

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

      // Profile fields
      avatar: t.arg.string(),
      bio: t.arg.string(),
      socialLinks: t.arg.string(), // JSON string

      // Settings
      emailNotifications: t.arg.boolean(),
      pushNotifications: t.arg.boolean(),
      language: t.arg.string(),
      timezone: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const updateData: any = {};

      // Basic profile fields
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.firstName !== null && args.firstName !== undefined)
        updateData.firstName = args.firstName;
      if (args.lastName !== null && args.lastName !== undefined)
        updateData.lastName = args.lastName;
      if (args.phone !== null && args.phone !== undefined)
        updateData.phone = args.phone;
      if (args.department !== null && args.department !== undefined)
        updateData.department = args.department;
      if (args.jobTitle !== null && args.jobTitle !== undefined)
        updateData.jobTitle = args.jobTitle;

      // New profile fields
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

      return context.prisma.user.update({
        ...query,
        where: { id: context.user.id },
        data: updateData,
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

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as crypto from "node:crypto";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../utils/emailService";
import { requireAuth } from "../../utils/errors";
import { publishNotification } from "../../utils/publishHelpers";
import builder from "../builder";

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-only-for-dev";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

// Helper function to generate JWT token
function generateToken(user: {
  id: number;
  email: string;
  role: string;
  department?: string | null;
  companyId?: number | null;
}) {
  console.log("🎫 generateToken INPUT:", {
    userId: user.id,
    companyId: user.companyId,
    companyIdType: typeof user.companyId,
    companyIdIsNull: user.companyId === null,
    companyIdIsUndefined: user.companyId === undefined,
  });

  const payload = {
    sub: user.id.toString(), // Subject (user ID) - standard JWT claim
    email: user.email,
    role: user.role,
    department: user.department || null, // Include department for permission checks
    companyId: user.companyId || null, // Include companyId for authorization
  };

  console.log("🎫 generateToken PAYLOAD:", payload);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

// ============================================
// INPUT TYPES FOR SIMPLE SIGNUP
// ============================================

const SignupInput = builder.inputType("SignupInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    accountType: t.string({ required: true }), // "INDIVIDUAL" | "MANUFACTURER" | "BUYER"
  }),
});

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
        include: {
          company: true, // Include company to get type
        },
      });

      if (!user) throw new Error("Invalid email or password");

      const isValidPassword = await bcrypt.compare(
        args.password,
        user.password
      );
      if (!isValidPassword) throw new Error("Invalid email or password");

      // Debug: Log user data before token generation
      console.log("🔐 Login User Data:", {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyIdType: typeof user.companyId,
        companyIdIsNull: user.companyId === null,
        companyIdIsUndefined: user.companyId === undefined,
        department: user.department,
        hasCompanyRelation: !!user.company,
        companyData: user.company
          ? { id: user.company.id, name: user.company.name }
          : null,
      });

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        companyId: user.companyId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyType: user.company?.type || null,
          isCompanyOwner: user.isCompanyOwner || false,
          department: user.department || null,
          jobTitle: user.jobTitle || null,
          permissions: user.permissions || null,
          emailVerified: user.emailVerified || false,
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
      input: t.arg({ type: SignupInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const { name, email, password, accountType } = args.input;

      if (!email || !password || !name) {
        throw new Error("Email, password, and name are required");
      }

      // Check if email already exists
      const existing = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existing) throw new Error("Email already registered");

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationExpiry = new Date(Date.now() + 86400000); // 24 hours

      // Determine user role based on account type
      let role = "INDIVIDUAL_CUSTOMER";

      if (accountType === "MANUFACTURER") {
        role = "COMPANY_OWNER"; // Will set up company later in dashboard
      } else if (accountType === "BUYER") {
        role = "COMPANY_OWNER"; // Will set up company later in dashboard
      }

      // Create user with company if COMPANY_OWNER
      let userData: any = {
        email,
        password: hashedPassword,
        name,
        role: role as any,
        isCompanyOwner: role === "COMPANY_OWNER",
        emailVerificationToken,
        emailVerificationExpiry,
      };

      // If COMPANY_OWNER, create company automatically
      if (role === "COMPANY_OWNER" && accountType) {
        const companyType =
          accountType === "MANUFACTURER"
            ? "MANUFACTURER"
            : accountType === "BUYER"
            ? "BUYER"
            : "BOTH";

        userData.company = {
          create: {
            name: `${name}'s Company`, // Default name, user can update later
            type: companyType as any,
            // Don't set email initially - user will update in settings
            // This prevents unique constraint errors
          },
        };
      }

      // Create user (and company if COMPANY_OWNER)
      const user = await context.prisma.user.create({
        data: userData,
        include: {
          company: true,
        },
      });

      // Send verification email
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await sendEmailVerification(
            user.email,
            emailVerificationToken,
            user.name || undefined
          );
          console.log(`✅ Verification email sent to: ${user.email}`);
        } else {
          console.log("⚠️  Email not configured - skipping verification email");
        }
      } catch (emailError) {
        console.error(
          "⚠️  Email send failed (continuing anyway):",
          emailError instanceof Error ? emailError.message : emailError
        );
      }

      // ✅ Create welcome notification
      try {
        const notification = await context.prisma.notification.create({
          data: {
            type: "SYSTEM",
            title: "🎉 Hoş Geldiniz!",
            message:
              "Hesabınız başarıyla oluşturuldu. Lütfen email adresinizi doğrulayın.",
            userId: user.id,
            link: "/auth/verify-email",
            isRead: false,
          },
        });
        await publishNotification(notification);
        console.log(`📢 Welcome notification sent to user ${user.id}`);
      } catch (notifError) {
        console.error(
          "⚠️  Notification failed (continuing anyway):",
          notifError instanceof Error ? notifError.message : notifError
        );
      }

      // ✅ Notify all admins about new user registration
      try {
        const admins = await context.prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true, name: true },
        });

        for (const admin of admins) {
          const adminNotification = await context.prisma.notification.create({
            data: {
              type: "USER_MANAGEMENT",
              title: "👤 Yeni Kullanıcı Kaydı",
              message: `${user.name} (${user.email}) sisteme kayıt oldu. Rol: ${
                user.role
              }${user.company ? `, Şirket: ${user.company.name}` : ""}`,
              userId: admin.id,
              link: "/dashboard/admin/users",
              isRead: false,
            },
          });
          await publishNotification(adminNotification);
          console.log(
            `📢 New user registration notification sent to admin ${admin.id} (${admin.name})`
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

      // Development mode - log verification link
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔑 Email verification token for ${user.email}: ${emailVerificationToken}`
        );
        console.log(
          `🔗 Verification link: ${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/auth/verify-email/${emailVerificationToken}`
        );
      }

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        companyId: user.companyId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyType: user.company?.type || null,
          isCompanyOwner: user.role === "COMPANY_OWNER",
          department: user.department || null,
          jobTitle: user.jobTitle || null,
          permissions: user.permissions || null,
          emailVerified: user.emailVerified,
        },
        // Dev only:
        verificationToken:
          process.env.NODE_ENV === "development"
            ? emailVerificationToken
            : undefined,
      };
    },
  })
); // Register (alias for signup)
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
        include: {
          company: true,
        },
      });

      // ✅ Notify all admins about new user registration
      try {
        const admins = await context.prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true, name: true },
        });

        for (const admin of admins) {
          const adminNotification = await context.prisma.notification.create({
            data: {
              type: "USER_MANAGEMENT",
              title: "👤 Yeni Kullanıcı Kaydı",
              message: `${user.name} (${args.email}) sisteme kayıt oldu. Rol: ${
                user.role
              }${user.company ? `, Şirket: ${user.company.name}` : ""}`,
              userId: admin.id,
              link: "/dashboard/admin/users",
              isRead: false,
            },
          });
          await publishNotification(adminNotification);
          console.log(
            `📢 New user registration notification sent to admin ${admin.id} (${admin.name})`
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

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        companyId: user.companyId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyType: user.company?.type || null,
          isCompanyOwner: user.isCompanyOwner || false,
          department: user.department || null,
          jobTitle: user.jobTitle || null,
          permissions: user.permissions || null,
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
        include: {
          company: true,
        },
      });

      if (user) {
        // User already exists, update name if needed
        if (user.name !== args.name) {
          user = await context.prisma.user.update({
            where: { email: args.email },
            data: { name: args.name },
            include: {
              company: true,
            },
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
          include: {
            company: true,
          },
        });

        // ✅ Notify all admins about new OAuth user registration
        try {
          const admins = await context.prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true, name: true },
          });

          for (const admin of admins) {
            const adminNotification = await context.prisma.notification.create({
              data: {
                type: "USER_MANAGEMENT",
                title: "👤 Yeni OAuth Kullanıcı Kaydı",
                message: `${args.name} (${args.email}) OAuth ile sisteme kayıt oldu. Rol: ${user.role}`,
                userId: admin.id,
                link: "/dashboard/admin/users",
                isRead: false,
              },
            });
            await publishNotification(adminNotification);
            console.log(
              `📢 New OAuth user registration notification sent to admin ${admin.id} (${admin.name})`
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
      }

      // Generate real JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        companyId: user.companyId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyType: user.company?.type || null,
          isCompanyOwner: user.isCompanyOwner || false,
          department: user.department || null,
          jobTitle: user.jobTitle || null,
          permissions: user.permissions || null,
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
      customAvatar: t.arg.string(), // User-uploaded profile picture
      bio: t.arg.string(),
      socialLinks: t.arg.string(), // JSON string

      // Settings
      emailNotifications: t.arg.boolean(),
      pushNotifications: t.arg.boolean(),
      language: t.arg.string(),
      timezone: t.arg.string(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      console.log("👤 UpdateProfile Debug:", {
        hasUser: !!context.user,
        userId: context.user?.id,
        userRole: context.user?.role,
        hasJWT: !!(context as any).jwt,
        jwtPayload: (context as any).jwt?.payload,
        receivedArgs: Object.keys(args).filter(
          (k) => args[k] !== null && args[k] !== undefined
        ),
      });

      if (!context.user?.id) {
        console.error("❌ UpdateProfile: User not authenticated");
        console.error("❌ Full context:", {
          hasUser: !!context.user,
          hasJWT: !!(context as any).jwt,
          jwtKeys: (context as any).jwt
            ? Object.keys((context as any).jwt)
            : [],
        });
        throw new Error("Not authenticated");
      }

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
      if (args.customAvatar !== null && args.customAvatar !== undefined)
        updateData.customAvatar = args.customAvatar;
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

      console.log("💾 UpdateProfile: Updating user", {
        userId: context.user.id,
        fieldsToUpdate: Object.keys(updateData),
      });

      const updatedUser = await context.prisma.user.update({
        ...query,
        where: { id: context.user.id },
        data: updateData,
      });

      console.log("✅ UpdateProfile: User updated successfully", {
        userId: updatedUser.id,
        name: updatedUser.name,
      });

      // ✅ Create profile update notification
      try {
        const notification = await context.prisma.notification.create({
          data: {
            type: "SYSTEM",
            title: "✅ Profil Güncellendi",
            message: "Profil bilgileriniz başarıyla güncellendi.",
            userId: context.user.id,
            link: "/settings",
            isRead: false,
          },
        });
        await publishNotification(notification);
        console.log(
          `📢 Profile update notification sent to user ${context.user.id}`
        );
      } catch (notifError) {
        console.error(
          "⚠️  Notification failed (continuing anyway):",
          notifError instanceof Error ? notifError.message : notifError
        );
      }

      return updatedUser;
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

// Request password reset (public - generates token)
builder.mutationField("requestPasswordReset", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      email: t.arg.string({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });

      // Don't reveal if user exists (security best practice)
      if (!user) {
        return {
          success: true,
          message: "If this email exists, a password reset link has been sent.",
        };
      }

      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save token to database
      await context.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send email with reset link (optional in dev mode)
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await sendPasswordResetEmail(user.email, resetToken);
          console.log(`✅ Password reset email sent to: ${user.email}`);
        } else {
          console.log("⚠️  Email not configured - skipping email send");
        }
      } catch (emailError) {
        console.error(
          "⚠️  Email send failed (continuing anyway):",
          emailError instanceof Error ? emailError.message : emailError
        );
        // Don't throw error - token is saved, user can still use console token in dev
      }

      // Development mode - also log to console
      if (process.env.NODE_ENV === "development") {
        console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);
        console.log(
          `🔗 Reset link: ${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/auth/reset/${resetToken}`
        );
      }

      return {
        success: true,
        message: "If this email exists, a password reset link has been sent.",
        // Dev only - remove in production:
        token: process.env.NODE_ENV === "development" ? resetToken : undefined,
      };
    },
  })
);

// Reset password with token (public)
builder.mutationField("resetPassword", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      token: t.arg.string({ required: true }),
      newPassword: t.arg.string({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      // Find user with valid token
      const user = await context.prisma.user.findFirst({
        where: {
          resetToken: args.token,
          resetTokenExpiry: {
            gt: new Date(), // Token not expired
          },
        },
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(args.newPassword, 10);

      // Update password and clear reset token
      await context.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return {
        success: true,
        message:
          "Password has been reset successfully. You can now login with your new password.",
      };
    },
  })
);

// Verify email with token (public)
builder.mutationField("verifyEmail", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      token: t.arg.string({ required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      // Find user with valid verification token
      const user = await context.prisma.user.findFirst({
        where: {
          emailVerificationToken: args.token,
          emailVerificationExpiry: {
            gt: new Date(), // Token not expired
          },
        },
      });

      if (!user) {
        throw new Error("Invalid or expired verification token");
      }

      // Update user - mark email as verified and clear token
      await context.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });

      // Send welcome email
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await sendWelcomeEmail(user.email, user.name || "User");
          console.log(`✅ Welcome email sent to: ${user.email}`);
        }
      } catch (emailError) {
        console.error(
          "⚠️  Welcome email failed:",
          emailError instanceof Error ? emailError.message : emailError
        );
        // Don't throw - verification was successful
      }

      // ✅ Create email verified notification
      try {
        const notification = await context.prisma.notification.create({
          data: {
            type: "SYSTEM",
            title: "✅ Email Doğrulandı",
            message:
              "Email adresiniz başarıyla doğrulandı! Artık profil bilgilerinizi tamamlayabilirsiniz.",
            userId: user.id,
            link: "/settings",
            isRead: false,
          },
        });
        await publishNotification(notification);
        console.log(
          `📢 Email verification notification sent to user ${user.id}`
        );
      } catch (notifError) {
        console.error(
          "⚠️  Notification failed (continuing anyway):",
          notifError instanceof Error ? notifError.message : notifError
        );
      }

      return {
        success: true,
        message:
          "Email has been verified successfully! Welcome to the platform.",
      };
    },
  })
);

// Resend verification email (authenticated user)
builder.mutationField("resendVerificationEmail", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      if (!context.user?.id) throw new Error("Not authenticated");

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });

      if (!user) throw new Error("User not found");

      // Already verified
      if (user.emailVerified) {
        return {
          success: false,
          message: "Email is already verified",
        };
      }

      // Generate new verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationExpiry = new Date(Date.now() + 86400000); // 24 hours

      // Update user with new token
      await context.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpiry,
        },
      });

      // Send verification email
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await sendEmailVerification(
            user.email,
            emailVerificationToken,
            user.name || undefined
          );
          console.log(`✅ Verification email resent to: ${user.email}`);
        } else {
          console.log("⚠️  Email not configured - skipping verification email");
        }
      } catch (emailError) {
        console.error(
          "⚠️  Email send failed (continuing anyway):",
          emailError instanceof Error ? emailError.message : emailError
        );
      }

      // Development mode - log verification link
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔑 Email verification token for ${user.email}: ${emailVerificationToken}`
        );
        console.log(
          `🔗 Verification link: ${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/auth/verify-email/${emailVerificationToken}`
        );
      }

      return {
        success: true,
        message: "Verification email has been sent to your email address.",
        // Dev only:
        verificationToken:
          process.env.NODE_ENV === "development"
            ? emailVerificationToken
            : undefined,
      };
    },
  })
);

// ============================================
// REFRESH TOKEN
// ============================================

/**
 * Refresh JWT Token
 *
 * Generates a new JWT token for the authenticated user.
 * Used for token rotation to maintain security.
 *
 * @example
 * mutation {
 *   refreshToken
 * }
 *
 * @returns New JWT token string
 */
builder.mutationField("refreshToken", (t) =>
  t.string({
    authScopes: { user: true },
    description: "Refresh authentication token for the current user",
    resolve: async (_root: any, _args: any, context: any) => {
      requireAuth(context.user?.id);

      // Get fresh user data
      const user = await context.prisma.user.findUnique({
        where: { id: context.user.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Generate new token with current user data
      const newToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
        companyId: user.companyId,
      });

      console.log(`🔄 Token refreshed for user: ${user.email}`);

      return newToken;
    },
  })
);

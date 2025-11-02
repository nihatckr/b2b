import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as crypto from "node:crypto";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../utils/emailService";
import {
  AuthenticationError,
  handleError,
  NotFoundError,
  requireAdmin,
  requireAuth,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logAuth, logError, logInfo } from "../../utils/logger";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeEmail,
  sanitizeInt,
  sanitizePhone,
  sanitizeString,
} from "../../utils/sanitize";
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
  const payload = {
    sub: user.id.toString(), // Subject (user ID) - standard JWT claim
    email: user.email,
    role: user.role,
    department: user.department || null, // Include department for permission checks
    companyId: user.companyId || null, // Include companyId for authorization
  };

  logInfo("JWT token generated", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

// ============================================
// INPUT TYPES
// ============================================

const LoginInput = builder.inputType("LoginInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

const SignupInput = builder.inputType("SignupInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    accountType: t.string({ required: true }), // "INDIVIDUAL" | "MANUFACTURER" | "BUYER"
  }),
});

const RegisterInput = builder.inputType("RegisterInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string(),
    role: t.string(),
  }),
});

const OAuthSignupInput = builder.inputType("OAuthSignupInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    name: t.string({ required: true }),
    role: t.string(),
  }),
});

const ChangePasswordInput = builder.inputType("ChangePasswordInput", {
  fields: (t) => ({
    oldPassword: t.string({ required: true }),
    newPassword: t.string({ required: true }),
  }),
});

const UpdateProfileInput = builder.inputType("UpdateProfileInput", {
  fields: (t) => ({
    name: t.string(),
    firstName: t.string(),
    lastName: t.string(),
    phone: t.string(),
    department: t.string(),
    jobTitle: t.string(),
    avatar: t.string(),
    customAvatar: t.string(),
    bio: t.string(),
    socialLinks: t.string(), // JSON string
    emailNotifications: t.boolean(),
    pushNotifications: t.boolean(),
    language: t.string(),
    timezone: t.string(),
  }),
});

const ResetUserPasswordInput = builder.inputType("ResetUserPasswordInput", {
  fields: (t) => ({
    userId: t.int({ required: true }),
    newPassword: t.string({ required: true }),
  }),
});

const UpdateUserRoleInput = builder.inputType("UpdateUserRoleInput", {
  fields: (t) => ({
    userId: t.int({ required: true }),
    role: t.string({ required: true }),
  }),
});

const RequestPasswordResetInput = builder.inputType(
  "RequestPasswordResetInput",
  {
    fields: (t) => ({
      email: t.string({ required: true }),
    }),
  }
);

const ResetPasswordInput = builder.inputType("ResetPasswordInput", {
  fields: (t) => ({
    token: t.string({ required: true }),
    newPassword: t.string({ required: true }),
  }),
});

const VerifyEmailInput = builder.inputType("VerifyEmailInput", {
  fields: (t) => ({
    token: t.string({ required: true }),
  }),
});

// Login (returns JWT token)
builder.mutationField("login", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("Login");

      try {
        // ✅ Sanitize inputs
        const email = sanitizeEmail(args.input.email);
        const password = sanitizeString(args.input.password);

        // ✅ Validate sanitized inputs
        if (!email) {
          throw new ValidationError("Geçerli bir email adresi giriniz");
        }

        if (!password || password.length < 6) {
          throw new ValidationError(
            "Şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        // ✅ Log login attempt
        logAuth("Login attempt", undefined, { email });

        const user = await context.prisma.user.findUnique({
          where: { email },
          include: {
            company: true, // Include company to get type
          },
        });

        if (!user) {
          logAuth("Login failed - user not found", undefined, { email });
          throw new AuthenticationError("Email veya şifre hatalı");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          logAuth("Login failed - invalid password", user.id, { email });
          throw new AuthenticationError("Email veya şifre hatalı");
        }

        // Generate real JWT token
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          companyId: user.companyId,
        });

        // ✅ Log successful login
        logAuth("Login successful", user.id, {
          email,
          role: user.role,
          companyId: user.companyId,
        });

        timer.end({ userId: user.id, success: true });

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
      } catch (error) {
        logError("Login mutation failed", error as Error, {
          email: args.input.email,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
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
      const timer = createTimer("Signup");

      try {
        // ✅ Sanitize inputs
        const name = sanitizeString(args.input.name);
        const email = sanitizeEmail(args.input.email);
        const password = sanitizeString(args.input.password);
        const accountType = sanitizeString(args.input.accountType);

        // ✅ Validate sanitized inputs
        if (!name || name.length < 2) {
          throw new ValidationError("İsim en az 2 karakter olmalıdır");
        }

        if (!email) {
          throw new ValidationError("Geçerli bir email adresi giriniz");
        }

        if (!password || password.length < 6) {
          throw new ValidationError(
            "Şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        if (!accountType) {
          throw new ValidationError("Hesap tipi seçiniz");
        }

        // ✅ Log signup attempt
        logAuth("Signup attempt", undefined, { email, accountType });

        // Check if email already exists
        const existing = await context.prisma.user.findUnique({
          where: { email },
        });

        if (existing) {
          logAuth("Signup failed - email exists", undefined, { email });
          throw new ValidationError("Bu email adresi zaten kayıtlı");
        }

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
            logInfo(`✅ Doğrulama e-postası gönderildi: ${user.email}`);
          } else {
            logInfo(
              "⚠️  E-posta yapılandırılmamış - doğrulama e-postası atlandı"
            );
          }
        } catch (emailError) {
          logError(
            "E-posta gönderilemedi (devam ediliyor)",
            emailError as Error,
            { userId: user.id }
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
          logInfo(`📢 Hoş geldin bildirimi gönderildi: kullanıcı ${user.id}`);
        } catch (notifError) {
          logError(
            "Bildirim gönderilemedi (devam ediliyor)",
            notifError as Error,
            { userId: user.id }
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
                message: `${user.name} (${
                  user.email
                }) sisteme kayıt oldu. Rol: ${user.role}${
                  user.company ? `, Şirket: ${user.company.name}` : ""
                }`,
                userId: admin.id,
                link: "/dashboard/users-management",
                isRead: false,
              },
            });
            await publishNotification(adminNotification);
            logInfo(
              `📢 New user registration notification sent to admin ${admin.id} (${admin.name})`
            );
          }
        } catch (adminNotifError) {
          logError(
            "Admin notification failed (signup)",
            adminNotifError as Error,
            { userId: user.id }
          );
        }

        // Development mode - log verification link
        if (process.env.NODE_ENV === "development") {
          logInfo(
            `🔑 Email verification token for ${user.email}: ${emailVerificationToken}`
          );
          logInfo(
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

        // ✅ Log successful signup
        logAuth("Signup successful", user.id, {
          email,
          role: user.role,
          accountType,
        });

        timer.end({ userId: user.id, success: true });

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
      } catch (error) {
        logError("Signup mutation failed", error as Error, {
          email: args.input.email,
          accountType: args.input.accountType,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Register (alias for signup)
builder.mutationField("register", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("Register");

      try {
        // ✅ Sanitize inputs
        const email = sanitizeEmail(args.input.email);
        const password = sanitizeString(args.input.password);
        const name = args.input.name ? sanitizeString(args.input.name) : email;
        const role = args.input.role
          ? sanitizeString(args.input.role)
          : "INDIVIDUAL_CUSTOMER";

        // ✅ Validate sanitized inputs
        if (!email) {
          throw new ValidationError("Geçerli bir email adresi giriniz");
        }

        if (!password || password.length < 6) {
          throw new ValidationError(
            "Şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        // ✅ Log register attempt
        logAuth("Register attempt", undefined, { email, role });

        const existing = await context.prisma.user.findUnique({
          where: { email },
        });

        if (existing) {
          logAuth("Register failed - email exists", undefined, { email });
          throw new ValidationError("Bu email adresi zaten kayıtlı");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await context.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || email,
            role: role as any,
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
                message: `${user.name} (${email}) sisteme kayıt oldu. Rol: ${
                  user.role
                }${user.company ? `, Şirket: ${user.company.name}` : ""}`,
                userId: admin.id,
                link: "/dashboard/users-management",
                isRead: false,
              },
            });
            await publishNotification(adminNotification);
            logInfo(
              `📢 New user registration notification sent to admin ${admin.id} (${admin.name})`
            );
          }
        } catch (adminNotifError) {
          logError(
            "Admin notification failed (register)",
            adminNotifError as Error,
            { userId: user.id }
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

        // ✅ Log successful register
        logAuth("Register successful", user.id, { email, role });

        timer.end({ userId: user.id, success: true });

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
      } catch (error) {
        logError("Register mutation failed", error as Error, {
          email: args.input.email,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// SignupOAuth (Google/OAuth - no password required)
builder.mutationField("signupOAuth", (t) =>
  t.field({
    type: "JSON", // { token: string, user: User }
    args: {
      input: t.arg({ type: OAuthSignupInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("SignupOAuth");

      try {
        // ✅ Sanitize inputs
        const email = sanitizeEmail(args.input.email);
        const name = sanitizeString(args.input.name);
        const role = args.input.role
          ? sanitizeString(args.input.role)
          : "INDIVIDUAL_CUSTOMER";

        // ✅ Validate sanitized inputs
        if (!email) {
          throw new ValidationError("Geçerli bir email adresi giriniz");
        }

        if (!name || name.length < 2) {
          throw new ValidationError("İsim en az 2 karakter olmalıdır");
        }

        // ✅ Log OAuth signup attempt
        logAuth("OAuth signup attempt", undefined, { email, role });

        // Email already exists - update name if different
        let user = await context.prisma.user.findUnique({
          where: { email },
          include: {
            company: true,
          },
        });

        if (user) {
          // User already exists, update name if needed
          if (user.name !== name) {
            user = await context.prisma.user.update({
              where: { email },
              data: { name },
              include: {
                company: true,
              },
            });
            logAuth("OAuth user updated", user.id, { email, name });
          } else {
            logAuth("OAuth user logged in (existing)", user.id, { email });
          }
        } else {
          // Create new OAuth user (with empty password)
          user = await context.prisma.user.create({
            data: {
              email,
              name,
              password: "", // OAuth users don't have password
              role: role as any,
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
              const adminNotification =
                await context.prisma.notification.create({
                  data: {
                    type: "USER_MANAGEMENT",
                    title: "👤 Yeni OAuth Kullanıcı Kaydı",
                    message: `${name} (${email}) OAuth ile sisteme kayıt oldu. Rol: ${user.role}`,
                    userId: admin.id,
                    link: "/dashboard/users-management",
                    isRead: false,
                  },
                });
              await publishNotification(adminNotification);
              logInfo(
                `📢 New OAuth user registration notification sent to admin ${admin.id} (${admin.name})`
              );
            }
          } catch (adminNotifError) {
            logError(
              "Admin notification failed (OAuth)",
              adminNotifError as Error,
              { userId: user.id }
            );
          }

          logAuth("OAuth signup successful", user.id, { email, role });
        }

        // Generate real JWT token
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          companyId: user.companyId,
        });

        timer.end({ userId: user.id, success: true });

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
      } catch (error) {
        logError("OAuth signup mutation failed", error as Error, {
          email: args.input.email,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Logout (client-side only, but here for completeness)
builder.mutationField("logout", (t) =>
  t.field({
    type: "Boolean",
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const timer = createTimer("Logout");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        logAuth("User logged out", context.user.id);
        timer.end({ userId: context.user.id, success: true });

        return true;
      } catch (error) {
        logError("Logout mutation failed", error as Error, {
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Change password (authenticated user)
builder.mutationField("changePassword", (t) =>
  t.field({
    type: "Boolean",
    args: {
      input: t.arg({ type: ChangePasswordInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("ChangePassword");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Sanitize inputs
        const oldPassword = sanitizeString(args.input.oldPassword);
        const newPassword = sanitizeString(args.input.newPassword);

        // ✅ Validate sanitized inputs
        if (!oldPassword) {
          throw new ValidationError("Mevcut şifre gerekli");
        }

        if (!newPassword || newPassword.length < 6) {
          throw new ValidationError(
            "Yeni şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        if (oldPassword === newPassword) {
          throw new ValidationError(
            "Yeni şifre mevcut şifreden farklı olmalıdır"
          );
        }

        // ✅ Log password change attempt
        logAuth("Password change attempt", context.user.id);

        const user = await context.prisma.user.findUnique({
          where: { id: context.user.id },
        });

        if (!user) {
          throw new AuthenticationError("Kullanıcı bulunamadı");
        }

        const isValidPassword = await bcrypt.compare(
          oldPassword,
          user.password
        );
        if (!isValidPassword) {
          logAuth("Password change failed - invalid old password", user.id);
          throw new ValidationError("Mevcut şifre hatalı");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await context.prisma.user.update({
          where: { id: context.user.id },
          data: { password: hashedPassword },
        });

        // ✅ Log successful password change
        logAuth("Password changed successfully", user.id);

        timer.end({ userId: user.id, success: true });

        return true;
      } catch (error) {
        logError("Change password mutation failed", error as Error, {
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Update profile (authenticated user)
builder.mutationField("updateProfile", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: UpdateProfileInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateProfile");

      try {
        logInfo("👤 UpdateProfile Debug:", {
          hasUser: !!context.user,
          userId: context.user?.id,
          userRole: context.user?.role,
          hasJWT: !!(context as any).jwt,
          jwtPayload: (context as any).jwt?.payload,
          receivedArgs: Object.keys(args).filter(
            (k) => args[k] !== null && args[k] !== undefined
          ),
        });

        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Log profile update attempt
        logAuth("Profile update attempt", context.user.id);

        const updateData: any = {};

        // ✅ Sanitize and validate inputs
        // Basic profile fields
        if (args.input.name !== null && args.input.name !== undefined) {
          const sanitizedName = sanitizeString(args.input.name);
          if (sanitizedName && sanitizedName.length >= 2) {
            updateData.name = sanitizedName;
          }
        }
        if (args.input.firstName !== null && args.input.firstName !== undefined)
          updateData.firstName = sanitizeString(args.input.firstName);
        if (args.input.lastName !== null && args.input.lastName !== undefined)
          updateData.lastName = sanitizeString(args.input.lastName);
        if (args.input.phone !== null && args.input.phone !== undefined)
          updateData.phone = sanitizePhone(args.input.phone);
        if (
          args.input.department !== null &&
          args.input.department !== undefined
        )
          updateData.department = sanitizeString(args.input.department);
        if (args.input.jobTitle !== null && args.input.jobTitle !== undefined)
          updateData.jobTitle = sanitizeString(args.input.jobTitle);

        // New profile fields
        if (args.input.avatar !== null && args.input.avatar !== undefined)
          updateData.avatar = sanitizeString(args.input.avatar);
        if (
          args.input.customAvatar !== null &&
          args.input.customAvatar !== undefined
        )
          updateData.customAvatar = sanitizeString(args.input.customAvatar);
        if (args.input.bio !== null && args.input.bio !== undefined)
          updateData.bio = sanitizeString(args.input.bio);
        if (
          args.input.socialLinks !== null &&
          args.input.socialLinks !== undefined
        )
          updateData.socialLinks = sanitizeString(args.input.socialLinks);

        // Settings
        if (
          args.input.emailNotifications !== null &&
          args.input.emailNotifications !== undefined
        )
          updateData.emailNotifications = args.input.emailNotifications;
        if (
          args.input.pushNotifications !== null &&
          args.input.pushNotifications !== undefined
        )
          updateData.pushNotifications = args.input.pushNotifications;
        if (args.input.language !== null && args.input.language !== undefined)
          updateData.language = sanitizeString(args.input.language);
        if (args.input.timezone !== null && args.input.timezone !== undefined)
          updateData.timezone = sanitizeString(args.input.timezone);

        logInfo("💾 UpdateProfile: Updating user", {
          userId: context.user.id,
          fieldsToUpdate: Object.keys(updateData),
        });

        const updatedUser = await context.prisma.user.update({
          ...query,
          where: { id: context.user.id },
          data: updateData,
        });

        logInfo("✅ UpdateProfile: User updated successfully", {
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
          logInfo(
            `📢 Profile update notification sent to user ${context.user.id}`
          );
        } catch (notifError) {
          logError("Notification failed (updateProfile)", notifError as Error, {
            userId: context.user.id,
          });
        }

        // ✅ Log successful profile update
        logAuth("Profile updated successfully", context.user.id, {
          fieldsUpdated: Object.keys(updateData),
        });

        timer.end({ userId: context.user.id, success: true });

        return updatedUser;
      } catch (error) {
        logError("Update profile mutation failed", error as Error, {
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Reset user password (admin only)
builder.mutationField("resetUserPassword", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: ResetUserPasswordInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("ResetUserPassword");

      try {
        // ✅ Auth check
        requireAdmin(context.user);

        // ✅ Sanitize inputs
        const userId = sanitizeInt(args.input.userId);
        const newPassword = sanitizeString(args.input.newPassword);

        // ✅ Validate sanitized inputs
        if (!userId || userId <= 0) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        if (!newPassword || newPassword.length < 6) {
          throw new ValidationError(
            "Yeni şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        logAuth("Admin resetting user password", context.user.id, { userId });

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await context.prisma.user.update({
          ...query,
          where: { id: userId },
          data: { password: hashedPassword },
        });

        logAuth("User password reset by admin", context.user.id, {
          userId,
          targetUser: user.email,
        });
        timer.end({ userId: context.user.id, success: true });

        return updatedUser;
      } catch (error) {
        logError("Reset user password mutation failed", error as Error, {
          userId: args.input.userId,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Update user role (admin only)
builder.mutationField("updateUserRole", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: UpdateUserRoleInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root: any, args: any, context: any) => {
      const timer = createTimer("UpdateUserRole");

      try {
        // ✅ Auth check
        requireAdmin(context.user);

        // ✅ Sanitize inputs
        const userId = sanitizeInt(args.input.userId);
        const role = sanitizeString(args.input.role);

        // ✅ Validate sanitized inputs
        if (!userId || userId <= 0) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        const ValidRoles = [
          "ADMIN",
          "COMPANY_OWNER",
          "COMPANY_EMPLOYEE",
          "INDIVIDUAL_CUSTOMER",
          "MANUFACTURE",
          "CUSTOMER",
        ];

        if (!role || !ValidRoles.includes(role)) {
          throw new ValidationError(
            "Geçerli bir rol seçiniz: " + ValidRoles.join(", ")
          );
        }

        logAuth("Admin updating user role", context.user.id, {
          userId,
          newRole: role,
        });

        const user = await context.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        const updatedUser = await context.prisma.user.update({
          ...query,
          where: { id: userId },
          data: { role: role as any },
        });

        logAuth("User role updated by admin", context.user.id, {
          userId,
          targetUser: user.email,
          oldRole: user.role,
          newRole: role,
        });
        timer.end({ userId: context.user.id, success: true });

        return updatedUser;
      } catch (error) {
        logError("Update user role mutation failed", error as Error, {
          userId: args.input.userId,
          role: args.input.role,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Request password reset (public - generates token)
builder.mutationField("requestPasswordReset", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      input: t.arg({ type: RequestPasswordResetInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("RequestPasswordReset");

      try {
        // ✅ Sanitize inputs
        const email = sanitizeEmail(args.input.email);

        // ✅ Validate sanitized inputs
        if (!email) {
          throw new ValidationError("Geçerli bir email adresi gerekli");
        }

        logAuth("Password reset requested", undefined, { email });

        const user = await context.prisma.user.findUnique({
          where: { email },
        });

        // Don't reveal if user exists (security best practice)
        if (!user) {
          logAuth("Password reset requested for non-existent user", undefined, {
            email,
          });
          timer.end({ success: true });

          return {
            success: true,
            message:
              "If this email exists, a password reset link has been sent.",
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
            logInfo(`✅ Password reset email sent to: ${user.email}`);
          } else {
            logInfo("⚠️  Email not configured - skipping email send");
          }
        } catch (emailError) {
          logError(
            "Email send failed (requestPasswordReset)",
            emailError as Error,
            { email }
          );
          // Don't throw error - token is saved, user can still use console token in dev
        }

        // Development mode - also log to console
        if (process.env.NODE_ENV === "development") {
          logInfo(`🔑 Password reset token for ${user.email}: ${resetToken}`);
          logInfo(
            `🔗 Reset link: ${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/auth/reset/${resetToken}`
          );
        }

        logAuth("Password reset token generated", user.id, { email });
        timer.end({ userId: user.id, success: true });

        return {
          success: true,
          message: "If this email exists, a password reset link has been sent.",
          // Dev only - remove in production:
          token:
            process.env.NODE_ENV === "development" ? resetToken : undefined,
        };
      } catch (error) {
        logError("Request password reset mutation failed", error as Error, {
          email: args.input.email,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Reset password with token (public)
builder.mutationField("resetPassword", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      input: t.arg({ type: ResetPasswordInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("ResetPassword");

      try {
        // ✅ Sanitize inputs
        const token = sanitizeString(args.input.token);
        const newPassword = sanitizeString(args.input.newPassword);

        // ✅ Validate sanitized inputs
        if (!token) {
          throw new ValidationError("Geçerli bir token gerekli");
        }

        if (!newPassword || newPassword.length < 6) {
          throw new ValidationError(
            "Yeni şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        logAuth("Password reset attempt with token", undefined, {
          tokenLength: token.length,
        });

        // Find user with valid token
        const user = await context.prisma.user.findFirst({
          where: {
            resetToken: token,
            resetTokenExpiry: {
              gt: new Date(), // Token not expired
            },
          },
        });

        if (!user) {
          throw new ValidationError("Geçersiz veya süresi dolmuş token");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await context.prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
          },
        });

        logAuth("Password reset successful", user.id, { email: user.email });
        timer.end({ userId: user.id, success: true });

        return {
          success: true,
          message:
            "Password has been reset successfully. You can now login with your new password.",
        };
      } catch (error) {
        logError("Reset password mutation failed", error as Error);
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Verify email with token (public)
builder.mutationField("verifyEmail", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    args: {
      input: t.arg({ type: VerifyEmailInput, required: true }),
    },
    authScopes: { public: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("VerifyEmail");

      try {
        // ✅ Sanitize inputs
        const token = sanitizeString(args.input.token);

        // ✅ Validate sanitized inputs
        if (!token) {
          throw new ValidationError("Geçerli bir token gerekli");
        }

        logAuth("Email verification attempt with token", undefined, {
          tokenLength: token.length,
        });

        // Find user with valid verification token
        const user = await context.prisma.user.findFirst({
          where: {
            emailVerificationToken: token,
            emailVerificationExpiry: {
              gt: new Date(), // Token not expired
            },
          },
        });

        if (!user) {
          throw new ValidationError("Geçersiz veya süresi dolmuş token");
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
            logInfo(`✅ Welcome email sent to: ${user.email}`);
          }
        } catch (emailError) {
          logError("Welcome email failed", emailError as Error, {
            userId: user.id,
            email: user.email,
          });
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
          logInfo(`📢 Email verification notification sent to user ${user.id}`);
        } catch (notifError) {
          logError("Notification failed (verifyEmail)", notifError as Error, {
            userId: user.id,
          });
        }

        logAuth("Email verification successful", user.id, {
          email: user.email,
        });
        timer.end({ userId: user.id, success: true });

        return {
          success: true,
          message:
            "Email has been verified successfully! Welcome to the platform.",
        };
      } catch (error) {
        logError("Verify email mutation failed", error as Error);
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Resend verification email (authenticated user)
builder.mutationField("resendVerificationEmail", (t) =>
  t.field({
    type: "JSON", // { success: boolean, message: string }
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const timer = createTimer("ResendVerificationEmail");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        logAuth("Resend verification email requested", context.user.id);

        const user = await context.prisma.user.findUnique({
          where: { id: context.user.id },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        // Already verified
        if (user.emailVerified) {
          logAuth(
            "Verification email requested for already verified user",
            user.id
          );
          timer.end({ userId: user.id, success: false });

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
            logInfo(`✅ Verification email resent to: ${user.email}`);
          } else {
            logInfo("⚠️  Email not configured - skipping verification email");
          }
        } catch (emailError) {
          logError(
            "Email send failed (resendVerification)",
            emailError as Error,
            { userId: context.user.id }
          );
        }

        // Development mode - log verification link
        if (process.env.NODE_ENV === "development") {
          logInfo(
            `🔑 Email verification token for ${user.email}: ${emailVerificationToken}`
          );
          logInfo(
            `🔗 Verification link: ${process.env.FRONTEND_URL}/auth/verify-email/${emailVerificationToken}`
          );
        }

        logAuth("Verification email resent", user.id, { email: user.email });
        timer.end({ userId: user.id, success: true });

        return {
          success: true,
          message: "Verification email has been sent to your email address.",
          // Dev only:
          verificationToken:
            process.env.NODE_ENV === "development"
              ? emailVerificationToken
              : undefined,
        };
      } catch (error) {
        logError("Resend verification email mutation failed", error as Error, {
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
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
      const timer = createTimer("RefreshToken");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        logAuth("Token refresh requested", context.user.id);

        // Get fresh user data
        const user = await context.prisma.user.findUnique({
          where: { id: context.user.id },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        // Generate new token with current user data
        const newToken = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
          department: user.department,
          companyId: user.companyId,
        });

        logInfo(`🔄 Token refreshed for user: ${user.email}`);
        logAuth("Token refresh successful", user.id, { email: user.email });
        timer.end({ userId: user.id, success: true });

        return newToken;
      } catch (error) {
        logError("Refresh token mutation failed", error as Error, {
          userId: context.user?.id,
        });
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

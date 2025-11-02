/**
 * ============================================================================
 * USER MUTATIONS
 * ============================================================================
 * Dosya: userMutation.ts
 * Amaç: Kullanıcı yönetimi mutasyonları
 * Versiyon: 2.0.0
 * Standart: GRAPHQL_STANDARDS_TR.md v2.0.0
 *
 * Mutasyonlar:
 * - createUserByAdmin: Admin tarafından kullanıcı oluşturma
 * - updateUser: Kullanıcı bilgilerini güncelleme
 * - deleteUserByAdmin: Admin tarafından kullanıcı silme
 * - toggleUserStatusByAdmin: Kullanıcı aktif/pasif durumu değiştirme
 * - updateUserCompanyByAdmin: Kullanıcının şirketini değiştirme
 * - bulkToggleUserStatus: Toplu aktif/pasif durumu değiştirme
 * - bulkDeleteUsersByAdmin: Toplu kullanıcı silme
 *
 * Güvenlik:
 * - Admin mutasyonları: admin yetkisi + ilgili permission
 * - updateUser: owner veya UPDATE_USERS permission
 * - Validasyon: Role enum, email format, password güç kontrolü
 *
 * Özellikler:
 * - Şifre hash'leme (bcrypt)
 * - Otomatik bildirim gönderimi
 * - Admin kullanıcıları silme koruması
 * - Permission tabanlı yetkilendirme
 * ============================================================================
 */

// Imports - External
import bcrypt from "bcryptjs";

// Imports - Errors & Logger
import {
  ForbiddenError,
  handleError,
  NotFoundError,
  requireAuth,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logAuth, logError, logInfo } from "../../utils/logger";

// Imports - Utils
import {
  PermissionGuide,
  requireOwnerOrPermission,
  requirePermission,
} from "../../utils/permissionHelpers";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeEmail,
  sanitizeInt,
  sanitizePhone,
  sanitizeString,
} from "../../utils/sanitize";
import { canPerformAction } from "../../utils/subscriptionHelper";

// Imports - GraphQL
import builder from "../builder";

// ========================================
// CONSTANTS - SCHEMA ENUMS
// ========================================

/**
 * Geçerli Kullanıcı Rolleri (schema.prisma Role enum)
 * Bu değerler %100 schema ile eşleşmelidir!
 */
const ValidRoles: string[] = [
  "ADMIN",
  "COMPANY_OWNER",
  "COMPANY_EMPLOYEE",
  "INDIVIDUAL_CUSTOMER",
];

// ============================================
// INPUT TYPES
// ============================================

const CreateUserByAdminInput = builder.inputType("CreateUserByAdminInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string({ required: true }),
    role: t.string({ required: true }),
    companyId: t.int(),
  }),
});

const UpdateUserInput = builder.inputType("UpdateUserInput", {
  fields: (t) => ({
    id: t.int({ required: true }),
    name: t.string(),
    email: t.string(),
    phone: t.string(),
    password: t.string(),
    role: t.string(),
    companyId: t.int(),
    avatar: t.string(),
    bio: t.string(),
    socialLinks: t.string(),
    emailNotifications: t.boolean(),
    pushNotifications: t.boolean(),
    language: t.string(),
    timezone: t.string(),
    department: t.string(),
    jobTitle: t.string(),
  }),
});

const ToggleUserStatusInput = builder.inputType("ToggleUserStatusInput", {
  fields: (t) => ({
    userId: t.int({ required: true }),
    isActive: t.boolean({ required: true }),
  }),
});

const UpdateUserCompanyInput = builder.inputType("UpdateUserCompanyInput", {
  fields: (t) => ({
    userId: t.int({ required: true }),
    companyId: t.int(),
  }),
});

const BulkToggleUserStatusInput = builder.inputType(
  "BulkToggleUserStatusInput",
  {
    fields: (t) => ({
      userIds: t.intList({ required: true }),
      isActive: t.boolean({ required: true }),
    }),
  }
);

const BulkDeleteUsersInput = builder.inputType("BulkDeleteUsersInput", {
  fields: (t) => ({
    userIds: t.intList({ required: true }),
  }),
});

const DeleteUserByAdminInput = builder.inputType("DeleteUserByAdminInput", {
  fields: (t) => ({
    userId: t.int({ required: true }),
  }),
});

/**
 * MUTATION: createUserByAdmin
 *
 * Açıklama: Admin tarafından yeni kullanıcı oluşturur
 * Güvenlik: admin + CREATE_USERS permission
 * Döner: User
 *
 * Input:
 * - email: Email adresi (geçerli format)
 * - password: Şifre (min 6 karakter)
 * - name: İsim (min 2 karakter)
 * - role: Role (ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER)
 * - companyId: Şirket ID (opsiyonel)
 *
 * Özellikler:
 * - Email benzersizlik kontrolü
 * - Şifre hash'leme (bcrypt)
 * - Diğer adminlere bildirim gönderimi
 * - Role enum validasyonu
 */
builder.mutationField("createUserByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: CreateUserByAdminInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("CreateUserByAdmin");

      try {
        // ✅ Permission check: USER_CREATE
        requirePermission(context, PermissionGuide.CREATE_USERS);

        // ========================================
        // SUBSCRIPTION LIMIT CHECK
        // ========================================
        if (args.input.companyId) {
          const limitCheck = await canPerformAction(
            context.prisma,
            args.input.companyId,
            "create_user"
          );

          if (!limitCheck.allowed) {
            throw new ValidationError(
              limitCheck.reason || "Kullanıcı oluşturma limiti aşıldı"
            );
          }
        }

        // ✅ Sanitize inputs
        const email = sanitizeEmail(args.input.email);
        const password = sanitizeString(args.input.password);
        const name = sanitizeString(args.input.name);
        const role = sanitizeString(args.input.role);
        const companyId = args.input.companyId
          ? sanitizeInt(args.input.companyId)
          : null;

        // ✅ Validate sanitized inputs
        if (!email) {
          throw new ValidationError("Geçerli bir email adresi giriniz");
        }

        if (!password || password.length < 6) {
          throw new ValidationError(
            "Şifre en az 6 karakter uzunluğunda olmalıdır"
          );
        }

        if (!name || name.length < 2) {
          throw new ValidationError("İsim en az 2 karakter olmalıdır");
        }

        if (!role || !ValidRoles.includes(role)) {
          throw new ValidationError(
            `Geçersiz rol. Şunlardan biri olmalı: ${ValidRoles.join(", ")}`
          );
        }

        // ✅ Log user creation attempt
        logAuth("Admin creating user", context.user?.id, { email, role });

        // Check if email already exists
        const existingUser = await context.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ValidationError("Bu e-posta adresi zaten kullanılıyor");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare user data
        const userData: any = {
          email,
          password: hashedPassword,
          name,
          role: role as any,
        };

        // Add company connection if companyId is provided
        if (companyId) {
          userData.company = {
            connect: { id: companyId },
          };
        }

        const user = await context.prisma.user.create({
          ...query,
          data: userData,
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
                link: "/dashboard/users-management",
                isRead: false,
              },
            });

            await publishNotification(adminNotification);
          }
        } catch (adminNotifError) {
          logError(
            "Admin notification failed (continuing anyway)",
            adminNotifError as Error,
            { userId: user.id }
          );
        }

        // ✅ Log successful user creation
        logAuth("User created by admin", context.user?.id, {
          metadata: timer.end(),
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return user;
      } catch (error) {
        logError("Create user by admin mutation failed", error as Error, {
          metadata: timer.end(),
          email: args.input.email,
          role: args.input.role,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: updateUser
 *
 * Açıklama: Kullanıcı bilgilerini günceller
 * Güvenlik: user + (owner veya UPDATE_USERS permission)
 * Döner: User
 *
 * Input: Tüm alanlar opsiyonel
 * - id: Kullanıcı ID (zorunlu)
 * - name, email, phone, password, avatar, bio, socialLinks
 * - emailNotifications, pushNotifications, language, timezone
 * - role, companyId, department, jobTitle (sadece admin)
 *
 * Özellikler:
 * - Kendi bilgilerini herkes güncelleyebilir
 * - Başkasının bilgilerini sadece UPDATE_USERS permission ile
 * - Admin özel alanları güncelleyebilir (role, company)
 * - Şifre değişikliğinde otomatik hash'leme
 */
builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: UpdateUserInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateUser");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        const { input } = args;
        const id = sanitizeInt(input.id);

        if (!id) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        // ✅ Permission check: Owner can edit themselves OR need UPDATE_USERS permission
        requireOwnerOrPermission(
          context,
          id,
          PermissionGuide.UPDATE_USERS,
          "Bu kullanıcıyı güncelleme yetkiniz yok"
        );

        // ✅ Log update attempt
        logInfo("User update attempt", {
          userId: id,
          byUser: context.user.id,
          isAdmin: context.user.role === "ADMIN",
        });

        const updateData: any = {};

        // ✅ Sanitize and validate basic fields
        if (input.name !== null && input.name !== undefined) {
          const sanitizedName = sanitizeString(input.name);
          if (sanitizedName && sanitizedName.length >= 2) {
            updateData.name = sanitizedName;
          }
        }

        if (input.email !== null && input.email !== undefined) {
          const sanitizedEmail = sanitizeEmail(input.email);
          if (sanitizedEmail) {
            updateData.email = sanitizedEmail;
          }
        }

        if (input.phone !== null && input.phone !== undefined) {
          updateData.phone = sanitizePhone(input.phone);
        }

        // Password (hash if provided)
        if (input.password !== null && input.password !== undefined) {
          const sanitizedPassword = sanitizeString(input.password);
          if (sanitizedPassword && sanitizedPassword.length >= 6) {
            updateData.password = await bcrypt.hash(sanitizedPassword, 10);
          } else {
            throw new ValidationError(
              "Şifre en az 6 karakter uzunluğunda olmalıdır"
            );
          }
        }

        // Profile fields
        if (input.avatar !== null && input.avatar !== undefined)
          updateData.avatar = sanitizeString(input.avatar);
        if (input.bio !== null && input.bio !== undefined)
          updateData.bio = sanitizeString(input.bio);
        if (input.socialLinks !== null && input.socialLinks !== undefined)
          updateData.socialLinks = sanitizeString(input.socialLinks);

        // Settings
        if (
          input.emailNotifications !== null &&
          input.emailNotifications !== undefined
        )
          updateData.emailNotifications = input.emailNotifications;
        if (
          input.pushNotifications !== null &&
          input.pushNotifications !== undefined
        )
          updateData.pushNotifications = input.pushNotifications;
        if (input.language !== null && input.language !== undefined)
          updateData.language = sanitizeString(input.language);
        if (input.timezone !== null && input.timezone !== undefined)
          updateData.timezone = sanitizeString(input.timezone);

        // Role and Company (admin only)
        if (context.user?.role === "ADMIN") {
          // Role change
          if (input.role !== null && input.role !== undefined) {
            const sanitizedRole = sanitizeString(input.role);
            if (sanitizedRole && !ValidRoles.includes(sanitizedRole)) {
              throw new ValidationError(
                `Geçersiz rol. Şunlardan biri olmalı: ${ValidRoles.join(", ")}`
              );
            }
            if (sanitizedRole) {
              updateData.role = sanitizedRole as any;
            }
          }

          // Company change
          if (input.companyId !== null && input.companyId !== undefined) {
            const sanitizedCompanyId = sanitizeInt(input.companyId);
            if (sanitizedCompanyId) {
              // Verify company exists
              const company = await context.prisma.company.findUnique({
                where: { id: sanitizedCompanyId },
              });
              if (!company) throw new NotFoundError("Şirket bulunamadı");
              updateData.companyId = sanitizedCompanyId;
            }
          } else if (input.companyId === null) {
            // Explicitly set to null if null is passed
            updateData.companyId = null;
          }

          // Department and Job Title
          if (input.department !== null && input.department !== undefined)
            updateData.department = sanitizeString(input.department);
          if (input.jobTitle !== null && input.jobTitle !== undefined)
            updateData.jobTitle = sanitizeString(input.jobTitle);
        }

        const updatedUser = await context.prisma.user.update({
          ...query,
          where: { id },
          data: updateData,
        });

        // ✅ Log successful update
        logInfo("User updated successfully", {
          metadata: timer.end(),
          userId: id,
          byUser: context.user.id,
          fieldsUpdated: Object.keys(updateData),
        });

        return updatedUser;
      } catch (error) {
        logError("Update user mutation failed", error as Error, {
          metadata: timer.end(),
          userId: args.input.id,
          byUser: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: deleteUserByAdmin
 *
 * Açıklama: Admin tarafından kullanıcı siler
 * Güvenlik: admin + DELETE_USERS permission
 * Döner: Boolean
 *
 * Input:
 * - userId: Silinecek kullanıcı ID
 *
 * Özellikler:
 * - Admin kullanıcıları silinemez (güvenlik)
 * - Kullanıcı varlık kontrolü
 * - Silme işlemi loglanır
 */
builder.mutationField("deleteUserByAdmin", (t) =>
  t.field({
    type: "Boolean",
    args: {
      input: t.arg({ type: DeleteUserByAdminInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("DeleteUserByAdmin");

      try {
        // ✅ Permission check: USER_DELETE
        requirePermission(context, PermissionGuide.DELETE_USERS);

        // ✅ Sanitize input
        const userId = sanitizeInt(args.input.userId);

        if (!userId) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        // ✅ Check if user exists
        const user = await context.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundError("Kullanıcı bulunamadı");
        }

        // ✅ Prevent deleting admin users
        if (user.role === "ADMIN") {
          throw new ForbiddenError("Admin kullanıcıları silinemez");
        }

        // ✅ Log deletion attempt
        logInfo("Admin deleting user", {
          userId,
          byAdmin: context.user?.id,
          userEmail: user.email,
        });

        await context.prisma.user.delete({
          where: { id: userId },
        });

        // ✅ Log successful deletion
        logInfo("User deleted by admin", {
          metadata: timer.end(),
          userId,
          byAdmin: context.user?.id,
          userEmail: user.email,
        });

        return true;
      } catch (error) {
        logError("Delete user by admin mutation failed", error as Error, {
          metadata: timer.end(),
          userId: args.input.userId,
          byAdmin: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: toggleUserStatusByAdmin
 *
 * Açıklama: Kullanıcı aktif/pasif durumunu değiştirir
 * Güvenlik: admin + UPDATE_USERS permission
 * Döner: User
 *
 * Input:
 * - userId: Kullanıcı ID
 * - isActive: Aktif durumu (true/false)
 *
 * Özellikler:
 * - Kullanıcı sisteme giriş yapabilme kontrolü
 * - Durum değişikliği loglanır
 */
builder.mutationField("toggleUserStatusByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: ToggleUserStatusInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("ToggleUserStatusByAdmin");

      try {
        // ✅ Permission check: USER_MANAGE_STATUS (uses UPDATE_USERS)
        requirePermission(context, PermissionGuide.UPDATE_USERS);

        // ✅ Sanitize inputs
        const userId = sanitizeInt(args.input.userId);
        const isActive = args.input.isActive;

        if (!userId) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        // ✅ Log status change attempt
        logInfo("Admin toggling user status", {
          userId,
          isActive,
          byAdmin: context.user?.id,
        });

        const user = await context.prisma.user.update({
          ...query,
          where: { id: userId },
          data: { isActive },
        });

        // ✅ Log successful status change
        logInfo("User status toggled", {
          metadata: timer.end(),
          userId,
          isActive,
          byAdmin: context.user?.id,
        });

        return user;
      } catch (error) {
        logError("Toggle user status mutation failed", error as Error, {
          metadata: timer.end(),
          userId: args.input.userId,
          byAdmin: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: updateUserCompanyByAdmin
 *
 * Açıklama: Kullanıcının şirketini değiştirir
 * Güvenlik: admin + MANAGE_COMPANY_USERS permission
 * Döner: User
 *
 * Input:
 * - userId: Kullanıcı ID
 * - companyId: Yeni şirket ID (null = şirketten ayır)
 *
 * Özellikler:
 * - Şirket varlık kontrolü
 * - Null ile şirketten ayırma
 * - Değişiklik loglanır
 */
builder.mutationField("updateUserCompanyByAdmin", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({ type: UpdateUserCompanyInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateUserCompanyByAdmin");

      try {
        // ✅ Permission check: COMPANY_MANAGE_USERS (update company assignment)
        requirePermission(context, PermissionGuide.MANAGE_COMPANY_USERS);

        // ✅ Sanitize inputs
        const userId = sanitizeInt(args.input.userId);
        const companyId = args.input.companyId
          ? sanitizeInt(args.input.companyId)
          : null;

        if (!userId) {
          throw new ValidationError("Geçerli bir kullanıcı ID'si gerekli");
        }

        const updateData: any = {};

        if (companyId !== null) {
          // Verify company exists
          const company = await context.prisma.company.findUnique({
            where: { id: companyId },
          });

          if (!company) throw new NotFoundError("Company", companyId);
          updateData.companyId = companyId;
        } else {
          updateData.companyId = null;
        }

        // ✅ Log company update attempt
        logInfo("Admin updating user company", {
          userId,
          companyId,
          byAdmin: context.user?.id,
        });

        const user = await context.prisma.user.update({
          ...query,
          where: { id: userId },
          data: updateData,
        });

        // ✅ Log successful company update
        logInfo("User company updated", {
          metadata: timer.end(),
          userId,
          companyId,
          byAdmin: context.user?.id,
        });

        return user;
      } catch (error) {
        logError("Update user company mutation failed", error as Error, {
          metadata: timer.end(),
          userId: args.input.userId,
          byAdmin: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: bulkToggleUserStatus
 *
 * Açıklama: Toplu kullanıcı aktif/pasif durumu değiştirme
 * Güvenlik: admin + UPDATE_USERS permission
 * Döner: JSON (success, count, message)
 *
 * Input:
 * - userIds: Kullanıcı ID dizisi
 * - isActive: Aktif durumu (true/false)
 *
 * Özellikler:
 * - Çoklu kullanıcı güncelleme
 * - Güncellenen kayıt sayısı döndürülür
 * - Toplu işlem loglanır
 */
builder.mutationField("bulkToggleUserStatus", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkToggleUserStatusInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("BulkToggleUserStatus");

      try {
        // ✅ Permission check: BULK_UPDATE_USERS (uses UPDATE_USERS)
        requirePermission(context, PermissionGuide.UPDATE_USERS);

        // ✅ Sanitize inputs
        const userIds = args.input.userIds
          .map((id) => sanitizeInt(id))
          .filter((id): id is number => id !== null);
        const isActive = args.input.isActive;

        if (userIds.length === 0) {
          throw new ValidationError("En az bir kullanıcı ID'si gerekli");
        }

        // ✅ Log bulk operation attempt
        logInfo("Admin bulk toggling user status", {
          count: userIds.length,
          isActive,
          byAdmin: context.user?.id,
        });

        const result = await context.prisma.user.updateMany({
          where: {
            id: { in: userIds },
          },
          data: { isActive },
        });

        // ✅ Log successful bulk operation
        logInfo("Bulk user status toggled", {
          metadata: timer.end(),
          count: result.count,
          isActive,
          byAdmin: context.user?.id,
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} kullanıcı ${
            isActive ? "aktif" : "pasif"
          } hale getirildi`,
        };
      } catch (error) {
        logError("Bulk toggle user status mutation failed", error as Error, {
          metadata: timer.end(),
          count: args.input.userIds.length,
          byAdmin: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * MUTATION: bulkDeleteUsersByAdmin
 *
 * Açıklama: Toplu kullanıcı silme
 * Güvenlik: admin + DELETE_USERS permission
 * Döner: JSON (success, count, message)
 *
 * Input:
 * - userIds: Silinecek kullanıcı ID dizisi
 *
 * Özellikler:
 * - Admin kullanıcıları korunur (silinemez)
 * - Çoklu silme işlemi
 * - Silinen kayıt sayısı döndürülür
 * - Güvenlik kontrolü çift katmanlı
 */
builder.mutationField("bulkDeleteUsersByAdmin", (t) =>
  t.field({
    type: "JSON",
    args: {
      input: t.arg({ type: BulkDeleteUsersInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("BulkDeleteUsersByAdmin");

      try {
        // ✅ Permission check: BULK_DELETE_USERS (uses DELETE_USERS)
        requirePermission(context, PermissionGuide.DELETE_USERS);

        // ✅ Sanitize inputs
        const userIds = args.input.userIds
          .map((id) => sanitizeInt(id))
          .filter((id): id is number => id !== null);

        if (userIds.length === 0) {
          throw new ValidationError("En az bir kullanıcı ID'si gerekli");
        }

        // ✅ Log bulk deletion attempt
        logInfo("Admin bulk deleting users", {
          count: userIds.length,
          byAdmin: context.user?.id,
        });

        // Prevent deleting admin users
        const adminUsers = await context.prisma.user.findMany({
          where: {
            id: { in: userIds },
            role: "ADMIN",
          },
          select: { id: true },
        });

        if (adminUsers.length > 0) {
          throw new ForbiddenError(
            "Admin kullanıcıları toplu silme işlemi ile silinemez"
          );
        }

        const result = await context.prisma.user.deleteMany({
          where: {
            id: { in: userIds },
            role: { not: "ADMIN" }, // Extra safety check
          },
        });

        // ✅ Log successful bulk deletion
        logInfo("Bulk users deleted", {
          metadata: timer.end(),
          count: result.count,
          byAdmin: context.user?.id,
        });

        return {
          success: true,
          count: result.count,
          message: `${result.count} kullanıcı başarıyla silindi`,
        };
      } catch (error) {
        logError("Bulk delete users mutation failed", error as Error, {
          metadata: timer.end(),
          count: args.input.userIds.length,
          byAdmin: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

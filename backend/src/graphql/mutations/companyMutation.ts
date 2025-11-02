/**
 * Company Mutations - COMPANY MANAGEMENT & BULK OPERATIONS
 *
 * 🎯 Purpose: Complete company lifecycle management
 *
 * 📋 Available Mutations:
 *
 * STANDARD MUTATIONS:
 * - createCompany: Create new company (admin only)
 * - updateCompany: Update company details (admin/owner + UPDATE_COMPANY permission)
 * - toggleCompanyStatus: Activate/deactivate company (admin only)
 * - deleteCompany: Soft/hard delete company (admin only)
 *
 * BULK OPERATIONS (Admin Only):
 * - bulkUpdateCompanies: Update multiple companies at once
 * - bulkToggleCompanyStatus: Activate/deactivate multiple companies
 * - bulkDeleteCompanies: Delete multiple companies (soft/hard)
 *
 * 🔒 Security:
 * - createCompany: Admin role required
 * - updateCompany: UPDATE_COMPANY permission + (owner or admin)
 * - toggleCompanyStatus: Admin only
 * - deleteCompany: Admin only
 * - All bulk operations: Admin only
 *
 * 💡 Features:
 * - Full subscription system management (plan, status, limits, billing)
 * - Usage tracking (users, samples, orders, collections, storage)
 * - Soft/hard delete options
 * - Automatic notifications to company members
 * - Comprehensive input validation
 * - JSON field handling (settings, brandColors, socialLinks, etc.)
 */

import {
  ForbiddenError,
  handleError,
  NotFoundError,
  requireAuth,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logError, logInfo } from "../../utils/logger";
import {
  PermissionGuide,
  requirePermission,
} from "../../utils/permissionHelpers";
import { publishNotification } from "../../utils/publishHelpers";
import {
  sanitizeBoolean,
  sanitizeFloat,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import {
  validateEmail,
  validateEnum,
  validateJSON,
  validateRange,
  validateRequired,
  validateStringLength,
  validateURL,
} from "../../utils/validation";
import builder from "../builder";

const ValidCompanyTypes = ["MANUFACTURER", "BUYER", "BOTH"] as const;

// ========================================
// INPUT TYPES (Clean & Organized)
// ========================================

// Create Company Input
const CreateCompanyInput = builder.inputType("CreateCompanyInput", {
  fields: (t) => ({
    // Required fields
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    type: t.string({ required: true }), // MANUFACTURER, BUYER, BOTH

    // Optional fields
    phone: t.string(),
  }),
});

// Update Company Input - 100% Schema Uyumlu
const UpdateCompanyInput = builder.inputType("UpdateCompanyInput", {
  fields: (t) => ({
    // ID (required for update)
    id: t.int({ required: true }),

    // ========================================
    // TEMEL BİLGİLER (Basic Info)
    // ========================================
    name: t.string(),
    email: t.string(),
    phone: t.string(),
    address: t.string(),
    city: t.string(), // Schema: String?
    country: t.string(), // Schema: String?
    website: t.string(),
    type: t.string(), // CompanyType enum: MANUFACTURER, BUYER, BOTH
    description: t.string(),

    // Status
    isActive: t.boolean(), // Schema: Boolean @default(true)
    settings: t.string(), // Schema: Json? - JSON string olarak gönderilecek

    // ========================================
    // SUBSCRIPTION SYSTEM (Admin Only)
    // ========================================
    subscriptionPlan: t.string(), // SubscriptionPlan enum: FREE, STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM
    subscriptionStatus: t.string(), // SubscriptionStatus enum: TRIAL, ACTIVE, PAST_DUE, CANCELLED, EXPIRED

    // Trial Period
    trialStartedAt: t.field({ type: "DateTime" }), // Schema: DateTime?
    trialEndsAt: t.field({ type: "DateTime" }), // Schema: DateTime?

    // Subscription Billing
    subscriptionStartedAt: t.field({ type: "DateTime" }), // Schema: DateTime?
    currentPeriodStart: t.field({ type: "DateTime" }), // Schema: DateTime?
    currentPeriodEnd: t.field({ type: "DateTime" }), // Schema: DateTime?
    cancelAtPeriodEnd: t.boolean(), // Schema: Boolean @default(false)
    cancelledAt: t.field({ type: "DateTime" }), // Schema: DateTime?
    billingCycle: t.string(), // BillingCycle enum: MONTHLY, YEARLY
    billingEmail: t.string(), // Schema: String?
    billingAddress: t.string(), // Schema: String? @db.Text
    taxId: t.string(), // Schema: String?

    // Usage Limits (Plan-based)
    maxUsers: t.int(), // Schema: Int @default(3)
    maxSamples: t.int(), // Schema: Int @default(10)
    maxOrders: t.int(), // Schema: Int @default(5)
    maxCollections: t.int(), // Schema: Int @default(5)
    maxStorageGB: t.float(), // Schema: Float @default(1.0)

    // Current Usage (auto-calculated - genelde mutation'da değiştirilmez ama ekliyoruz)
    currentUsers: t.int(), // Schema: Int @default(0)
    currentSamples: t.int(), // Schema: Int @default(0)
    currentOrders: t.int(), // Schema: Int @default(0)
    currentCollections: t.int(), // Schema: Int @default(0)
    currentStorageGB: t.float(), // Schema: Float @default(0.0)

    // ========================================
    // BRANDING & CUSTOMIZATION
    // ========================================
    logo: t.string(), // Schema: String?
    coverImage: t.string(), // Schema: String?
    brandColors: t.string(), // Schema: Json? - JSON string olarak gönderilecek

    // Public Profile
    profileSlug: t.string(), // Schema: String? @unique
    isPublicProfile: t.boolean(), // Schema: Boolean @default(false)
    socialLinks: t.string(), // Schema: Json? - JSON string olarak gönderilecek

    // Dashboard Preferences
    defaultView: t.string(), // Schema: String? - "MANUFACTURER" | "BUYER"
    enabledModules: t.string(), // Schema: Json? - JSON string olarak gönderilecek
  }),
});

// ========================================
// MUTATIONS (Using InputTypes)
// ========================================

// Create company (admin only)
builder.mutationField("createCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      input: t.arg({ type: CreateCompanyInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("CreateCompany");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: Admin only (company creation is admin-only)
        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Şirket oluşturma yetkisi sadece admin'lerde bulunur"
          );
        }

        // ✅ Sanitize inputs
        const name = sanitizeString(args.input.name);
        const email = sanitizeString(args.input.email);
        const type = sanitizeString(args.input.type);
        const phone = args.input.phone
          ? sanitizeString(args.input.phone)
          : undefined;

        // ✅ Validate inputs
        validateRequired(name, "Şirket adı");
        validateStringLength(name!, "Şirket adı", 2, 200);

        validateRequired(email, "E-posta");
        validateEmail(email!, "E-posta");

        validateRequired(type, "Şirket tipi");
        validateEnum(
          type as any,
          "Şirket tipi",
          ValidCompanyTypes as unknown as string[]
        );

        if (phone) {
          validateStringLength(phone, "Telefon", 5, 20);
        }

        logInfo("Şirket oluşturuluyor", {
          userId: context.user!.id,
          name,
          type,
        });

        const company = await context.prisma.company.create({
          ...query,
          data: {
            name: name!,
            email: email!,
            ...(phone ? { phone } : {}),
            type: type as any,
            isActive: true,
          },
        });

        logInfo("Şirket oluşturuldu", {
          metadata: timer.end(),
          userId: context.user!.id,
          companyId: company.id,
          name: company.name,
        });

        return company;
      } catch (error) {
        logError("Şirket oluşturma hatası", error as Error, {
          metadata: timer.end(),
          userId: context.user?.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Update company (owner or admin)
builder.mutationField("updateCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      input: t.arg({ type: UpdateCompanyInput, required: true }),
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("UpdateCompany");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Permission check: COMPANY_UPDATE
        requirePermission(context, PermissionGuide.UPDATE_COMPANY);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.input.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir şirket ID'si gerekli");
        }

        logInfo("Şirket güncelleniyor", {
          userId: context.user!.id,
          companyId: id,
        });

        // ✅ Check authorization
        if (context.user?.companyId !== id && context.user?.role !== "ADMIN") {
          throw new ForbiddenError("Bu şirketi güncelleme yetkiniz yok");
        }

        const updateData: any = {};
        const isAdmin = context.user?.role === "ADMIN";

        // ✅ Basic fields with validation
        if (args.input.name !== null && args.input.name !== undefined) {
          const name = sanitizeString(args.input.name);
          validateRequired(name, "Şirket adı");
          validateStringLength(name!, "Şirket adı", 2, 200);
          updateData.name = name;
        }

        if (args.input.email !== null && args.input.email !== undefined) {
          const email = sanitizeString(args.input.email);
          validateRequired(email, "E-posta");
          validateEmail(email!, "E-posta");
          updateData.email = email;
        }

        if (args.input.phone !== null && args.input.phone !== undefined) {
          const phone = sanitizeString(args.input.phone);
          if (phone) {
            validateStringLength(phone, "Telefon", 5, 20);
          }
          updateData.phone = phone;
        }

        if (
          args.input.description !== null &&
          args.input.description !== undefined
        ) {
          const description = sanitizeString(args.input.description);
          if (description) {
            validateStringLength(description, "Açıklama", 0, 2000);
          }
          updateData.description = description;
        }

        if (args.input.website !== null && args.input.website !== undefined) {
          const website = sanitizeString(args.input.website);
          if (website) {
            validateURL(website, "Website");
          }
          updateData.website = website;
        }

        if (args.input.address !== null && args.input.address !== undefined) {
          const address = sanitizeString(args.input.address);
          if (address) {
            validateStringLength(address, "Adres", 0, 500);
          }
          updateData.address = address;
        }

        if (args.input.city !== null && args.input.city !== undefined) {
          const city = sanitizeString(args.input.city);
          if (city) {
            validateStringLength(city, "Şehir", 0, 100);
          }
          updateData.city = city;
        }

        if (args.input.country !== null && args.input.country !== undefined) {
          const country = sanitizeString(args.input.country);
          if (country) {
            validateStringLength(country, "Ülke", 0, 100);
          }
          updateData.country = country;
        }

        if (args.input.type !== null && args.input.type !== undefined) {
          const type = sanitizeString(args.input.type);
          validateRequired(type, "Şirket tipi");
          validateEnum(type, "Şirket tipi", [...ValidCompanyTypes] as string[]);
          updateData.type = type;
        }

        if (args.input.isActive !== null && args.input.isActive !== undefined) {
          updateData.isActive = args.input.isActive;
        }

        if (args.input.settings !== null && args.input.settings !== undefined) {
          const settings = sanitizeString(args.input.settings);
          if (settings) {
            validateJSON(settings, "Ayarlar");
            updateData.settings = JSON.parse(settings);
          }
        }

        // ✅ Subscription fields (admin only)
        if (isAdmin) {
          if (
            args.input.subscriptionPlan !== null &&
            args.input.subscriptionPlan !== undefined
          )
            updateData.subscriptionPlan = sanitizeString(
              args.input.subscriptionPlan
            );

          if (
            args.input.subscriptionStatus !== null &&
            args.input.subscriptionStatus !== undefined
          )
            updateData.subscriptionStatus = sanitizeString(
              args.input.subscriptionStatus
            );

          // Trial Period
          if (
            args.input.trialStartedAt !== null &&
            args.input.trialStartedAt !== undefined
          )
            updateData.trialStartedAt = args.input.trialStartedAt;

          if (
            args.input.trialEndsAt !== null &&
            args.input.trialEndsAt !== undefined
          )
            updateData.trialEndsAt = args.input.trialEndsAt;

          // Subscription Billing
          if (
            args.input.subscriptionStartedAt !== null &&
            args.input.subscriptionStartedAt !== undefined
          )
            updateData.subscriptionStartedAt = args.input.subscriptionStartedAt;

          if (
            args.input.currentPeriodStart !== null &&
            args.input.currentPeriodStart !== undefined
          )
            updateData.currentPeriodStart = args.input.currentPeriodStart;

          if (
            args.input.currentPeriodEnd !== null &&
            args.input.currentPeriodEnd !== undefined
          )
            updateData.currentPeriodEnd = args.input.currentPeriodEnd;

          if (
            args.input.cancelAtPeriodEnd !== null &&
            args.input.cancelAtPeriodEnd !== undefined
          )
            updateData.cancelAtPeriodEnd = args.input.cancelAtPeriodEnd;

          if (
            args.input.cancelledAt !== null &&
            args.input.cancelledAt !== undefined
          )
            updateData.cancelledAt = args.input.cancelledAt;

          if (
            args.input.billingCycle !== null &&
            args.input.billingCycle !== undefined
          )
            updateData.billingCycle = sanitizeString(args.input.billingCycle);

          if (
            args.input.billingEmail !== null &&
            args.input.billingEmail !== undefined
          ) {
            const billingEmail = sanitizeString(args.input.billingEmail);
            if (billingEmail) {
              validateEmail(billingEmail, "Fatura e-postası");
            }
            updateData.billingEmail = billingEmail;
          }

          if (
            args.input.billingAddress !== null &&
            args.input.billingAddress !== undefined
          ) {
            const billingAddress = sanitizeString(args.input.billingAddress);
            if (billingAddress) {
              validateStringLength(billingAddress, "Fatura adresi", 0, 1000);
            }
            updateData.billingAddress = billingAddress;
          }

          if (args.input.taxId !== null && args.input.taxId !== undefined) {
            const taxId = sanitizeString(args.input.taxId);
            if (taxId) {
              validateStringLength(taxId, "Vergi numarası", 0, 50);
            }
            updateData.taxId = taxId;
          }

          if (
            args.input.maxUsers !== null &&
            args.input.maxUsers !== undefined
          ) {
            const maxUsers = sanitizeInt(args.input.maxUsers);
            if (maxUsers !== null) {
              validateRange(maxUsers, "Maksimum kullanıcı sayısı", 1, 10000);
            }
            updateData.maxUsers = maxUsers;
          }

          if (
            args.input.maxSamples !== null &&
            args.input.maxSamples !== undefined
          ) {
            const maxSamples = sanitizeInt(args.input.maxSamples);
            if (maxSamples !== null) {
              validateRange(maxSamples, "Maksimum örnek sayısı", 1, 100000);
            }
            updateData.maxSamples = maxSamples;
          }

          if (
            args.input.maxOrders !== null &&
            args.input.maxOrders !== undefined
          ) {
            const maxOrders = sanitizeInt(args.input.maxOrders);
            if (maxOrders !== null) {
              validateRange(maxOrders, "Maksimum sipariş sayısı", 1, 100000);
            }
            updateData.maxOrders = maxOrders;
          }

          if (
            args.input.maxCollections !== null &&
            args.input.maxCollections !== undefined
          ) {
            const maxCollections = sanitizeInt(args.input.maxCollections);
            if (maxCollections !== null) {
              validateRange(
                maxCollections,
                "Maksimum koleksiyon sayısı",
                1,
                10000
              );
            }
            updateData.maxCollections = maxCollections;
          }

          if (
            args.input.maxStorageGB !== null &&
            args.input.maxStorageGB !== undefined
          ) {
            const maxStorageGB = sanitizeFloat(args.input.maxStorageGB);
            if (maxStorageGB !== null) {
              validateRange(maxStorageGB, "Maksimum depolama (GB)", 0.1, 10000);
            }
            updateData.maxStorageGB = maxStorageGB;
          }

          // Current Usage (auto-calculated - genelde mutation'da değiştirilmez ama admin update edebilir)
          if (
            args.input.currentUsers !== null &&
            args.input.currentUsers !== undefined
          ) {
            const currentUsers = sanitizeInt(args.input.currentUsers);
            if (currentUsers !== null) {
              validateRange(currentUsers, "Mevcut kullanıcı sayısı", 0, 10000);
            }
            updateData.currentUsers = currentUsers;
          }

          if (
            args.input.currentSamples !== null &&
            args.input.currentSamples !== undefined
          ) {
            const currentSamples = sanitizeInt(args.input.currentSamples);
            if (currentSamples !== null) {
              validateRange(currentSamples, "Mevcut örnek sayısı", 0, 100000);
            }
            updateData.currentSamples = currentSamples;
          }

          if (
            args.input.currentOrders !== null &&
            args.input.currentOrders !== undefined
          ) {
            const currentOrders = sanitizeInt(args.input.currentOrders);
            if (currentOrders !== null) {
              validateRange(currentOrders, "Mevcut sipariş sayısı", 0, 100000);
            }
            updateData.currentOrders = currentOrders;
          }

          if (
            args.input.currentCollections !== null &&
            args.input.currentCollections !== undefined
          ) {
            const currentCollections = sanitizeInt(
              args.input.currentCollections
            );
            if (currentCollections !== null) {
              validateRange(
                currentCollections,
                "Mevcut koleksiyon sayısı",
                0,
                10000
              );
            }
            updateData.currentCollections = currentCollections;
          }

          if (
            args.input.currentStorageGB !== null &&
            args.input.currentStorageGB !== undefined
          ) {
            const currentStorageGB = sanitizeFloat(args.input.currentStorageGB);
            if (currentStorageGB !== null) {
              validateRange(currentStorageGB, "Mevcut depolama (GB)", 0, 10000);
            }
            updateData.currentStorageGB = currentStorageGB;
          }
        }

        // ✅ Branding
        if (args.input.logo !== null && args.input.logo !== undefined) {
          const logo = sanitizeString(args.input.logo);
          if (logo) {
            validateStringLength(logo, "Logo URL", 0, 500);
          }
          updateData.logo = logo;
        }

        if (
          args.input.coverImage !== null &&
          args.input.coverImage !== undefined
        ) {
          const coverImage = sanitizeString(args.input.coverImage);
          if (coverImage) {
            validateStringLength(coverImage, "Kapak görseli URL", 0, 500);
          }
          updateData.coverImage = coverImage;
        }

        if (
          args.input.brandColors !== null &&
          args.input.brandColors !== undefined
        ) {
          const brandColors = sanitizeString(args.input.brandColors);
          if (brandColors) {
            validateJSON(brandColors, "Marka renkleri");
          }
          updateData.brandColors = brandColors;
        }

        // ✅ Public profile
        if (
          args.input.profileSlug !== null &&
          args.input.profileSlug !== undefined
        ) {
          const profileSlug = sanitizeString(args.input.profileSlug);
          if (profileSlug) {
            validateStringLength(profileSlug, "Profil slug", 2, 100);
          }
          updateData.profileSlug = profileSlug;
        }

        if (
          args.input.isPublicProfile !== null &&
          args.input.isPublicProfile !== undefined
        )
          updateData.isPublicProfile = sanitizeBoolean(
            args.input.isPublicProfile
          );

        if (
          args.input.socialLinks !== null &&
          args.input.socialLinks !== undefined
        ) {
          const socialLinks = sanitizeString(args.input.socialLinks);
          if (socialLinks) {
            validateJSON(socialLinks, "Sosyal medya linkleri");
          }
          updateData.socialLinks = socialLinks;
        }

        // ✅ Dashboard preferences
        if (
          args.input.defaultView !== null &&
          args.input.defaultView !== undefined
        )
          updateData.defaultView = sanitizeString(args.input.defaultView);

        if (
          args.input.enabledModules !== null &&
          args.input.enabledModules !== undefined
        ) {
          const enabledModules = sanitizeString(args.input.enabledModules);
          if (enabledModules) {
            validateJSON(enabledModules, "Aktif modüller");
          }
          updateData.enabledModules = enabledModules;
        }

        const updatedCompany = await context.prisma.company.update({
          ...query,
          where: { id },
          data: updateData,
        });

        // ✅ Create company update notification (notify all company members)
        try {
          const companyMembers = await context.prisma.user.findMany({
            where: { companyId: id },
            select: { id: true },
          });

          for (const member of companyMembers) {
            const isOwner = member.id === context.user?.id;
            const notification = await context.prisma.notification.create({
              data: {
                type: "SYSTEM",
                title: "🏢 Şirket Bilgileri Güncellendi",
                message: isOwner
                  ? "Şirket bilgileri başarıyla güncellendi."
                  : "Şirket bilgileri bir yönetici tarafından güncellendi.",
                userId: member.id,
                link: "/settings/company",
                isRead: false,
              },
            });
            await publishNotification(notification);
          }

          logInfo("Şirket güncelleme bildirimleri gönderildi", {
            memberCount: companyMembers.length,
          });
        } catch (notifError) {
          logError(
            "Bildirim gönderme hatası (devam ediliyor)",
            notifError as Error
          );
        }

        logInfo("Şirket güncellendi", {
          metadata: timer.end(),
          userId: context.user!.id,
          companyId: id,
          updatedFields: Object.keys(updateData),
        });

        return updatedCompany;
      } catch (error) {
        logError("Şirket güncelleme hatası", error as Error, {
          metadata: timer.end(),
          companyId: args.input.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Toggle company active status (soft delete/restore) - Admin only
builder.mutationField("toggleCompanyStatus", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("ToggleCompanyStatus");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir şirket ID'si gerekli");
        }

        logInfo("Şirket durumu değiştiriliyor", {
          userId: context.user!.id,
          companyId: id,
        });

        // Get current status
        const company = await context.prisma.company.findUnique({
          where: { id },
          select: { isActive: true, name: true },
        });

        if (!company) {
          throw new NotFoundError("Şirket bulunamadı");
        }

        const newStatus = !company.isActive;

        // Update status
        const updatedCompany = await context.prisma.company.update({
          ...query,
          where: { id },
          data: { isActive: newStatus },
        });

        // ✅ Notify all company members
        try {
          const companyMembers = await context.prisma.user.findMany({
            where: { companyId: id },
            select: { id: true },
          });

          for (const member of companyMembers) {
            const notification = await context.prisma.notification.create({
              data: {
                type: "SYSTEM",
                title: newStatus
                  ? "✅ Şirket Hesabı Aktif"
                  : "⚠️ Şirket Hesabı Devre Dışı",
                message: newStatus
                  ? `${company.name} şirket hesabı yeniden aktif edildi.`
                  : `${company.name} şirket hesabı yönetici tarafından devre dışı bırakıldı.`,
                userId: member.id,
                link: "/settings/company",
                isRead: false,
              },
            });
            await publishNotification(notification);
          }

          logInfo("Şirket durum değişikliği bildirimleri gönderildi", {
            memberCount: companyMembers.length,
          });
        } catch (notifError) {
          logError(
            "Bildirim gönderme hatası (devam ediliyor)",
            notifError as Error
          );
        }

        logInfo("Şirket durumu değiştirildi", {
          metadata: timer.end(),
          userId: context.user!.id,
          companyId: id,
          newStatus,
        });

        return updatedCompany;
      } catch (error) {
        logError("Şirket durumu değiştirme hatası", error as Error, {
          metadata: timer.end(),
          companyId: args.id,
        });
        throw handleError(error);
      }
    },
  })
);

// Delete company (admin only) - Soft delete by default, optional hard delete
builder.mutationField("deleteCompany", (t) =>
  t.field({
    type: "JSON",
    args: {
      id: t.arg.int({ required: true }),
      hardDelete: t.arg.boolean({ defaultValue: false }), // false = soft delete, true = hard delete
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("DeleteCompany");

      try {
        // ✅ Auth check
        requireAuth(context.user?.id);

        // ✅ Sanitize and validate ID
        const id = sanitizeInt(args.id);
        if (!id || id <= 0) {
          throw new ValidationError("Geçerli bir şirket ID'si gerekli");
        }

        const hardDelete = sanitizeBoolean(args.hardDelete ?? false);

        logInfo("Şirket siliniyor", {
          userId: context.user!.id,
          companyId: id,
          hardDelete,
        });

        // Get company details
        const company = await context.prisma.company.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: {
                employees: true,
                samples: true,
                orders: true,
                collections: true,
              },
            },
          },
        });

        if (!company) {
          throw new NotFoundError("Şirket bulunamadı");
        }

        if (args.hardDelete) {
          // HARD DELETE - Cascade will delete all related data
          await context.prisma.company.delete({
            where: { id: args.id },
          });

          logInfo("Şirket kalıcı olarak silindi (Hard Delete)", {
            metadata: timer.end(),
            companyId: args.id,
            companyName: company.name,
            employeesCount: company._count.employees,
            samplesCount: company._count.samples,
            ordersCount: company._count.orders,
            collectionsCount: company._count.collections,
            deletedBy: context.user.id,
          });

          return {
            success: true,
            message: `${company.name} şirketi ve tüm ilişkili veriler kalıcı olarak silindi`,
            companyName: company.name,
            deletedCounts: {
              employees: company._count.employees,
              samples: company._count.samples,
              orders: company._count.orders,
              collections: company._count.collections,
            },
          };
        } else {
          // SOFT DELETE - Just set isActive to false
          const updatedCompany = await context.prisma.company.update({
            where: { id: args.id },
            data: { isActive: false },
          });

          // Notify all company members
          try {
            const companyMembers = await context.prisma.user.findMany({
              where: { companyId: args.id },
              select: { id: true },
            });

            for (const member of companyMembers) {
              const notification = await context.prisma.notification.create({
                data: {
                  type: "SYSTEM",
                  title: "⚠️ Şirket Hesabı Devre Dışı",
                  message: `${company.name} şirket hesabı yönetici tarafından devre dışı bırakıldı.`,
                  userId: member.id,
                  link: "/settings/company",
                  isRead: false,
                },
              });
              await publishNotification(notification);
            }

            logInfo("Şirket devre dışı bırakıldı ve bildirimler gönderildi", {
              companyId: args.id,
              companyName: company.name,
              notificationsSent: companyMembers.length,
            });
          } catch (notifError) {
            logError(
              "Bildirim gönderimi başarısız (işlem devam ediyor)",
              notifError instanceof Error ? notifError : undefined,
              { companyId: args.id }
            );
          }

          logInfo("Şirket soft delete ile devre dışı bırakıldı", {
            metadata: timer.end(),
            companyId: args.id,
            companyName: company.name,
            employeesCount: company._count.employees,
            samplesCount: company._count.samples,
            ordersCount: company._count.orders,
            collectionsCount: company._count.collections,
            deactivatedBy: context.user.id,
          });

          return {
            success: true,
            message: `${company.name} şirketi devre dışı bırakıldı (geri yüklenebilir)`,
            companyName: company.name,
            affectedCounts: {
              employees: company._count.employees,
              samples: company._count.samples,
              orders: company._count.orders,
              collections: company._count.collections,
            },
          };
        }
      } catch (error) {
        logError(
          "Şirket silme işlemi başarısız",
          error instanceof Error ? error : undefined,
          {
            metadata: timer.end(),
            companyId: args.id,
            hardDelete: args.hardDelete,
            userId: context.user?.id,
          }
        );
        throw handleError(error);
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (Admin Only)
// ========================================

/**
 * Bulk Update Companies
 * ✅ Permission: Admin only
 * ✅ Input: Array of company IDs + update data
 * ✅ Returns: JSON with success/failure counts
 */
builder.mutationField("bulkUpdateCompanies", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
      data: t.arg({ type: UpdateCompanyInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("BulkUpdateCompanies");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu şirket güncelleme başlatılıyor", {
          userId: context.user.id,
          companyIds: args.ids,
          updateFieldsCount: Object.keys(args.data).length,
        });

        const updateData: any = {};

        // Basic fields (safe to bulk update)
        if (args.data.isActive !== undefined) {
          updateData.isActive = args.data.isActive;
        }
        if (args.data.subscriptionPlan) {
          updateData.subscriptionPlan = sanitizeString(
            args.data.subscriptionPlan
          );
        }
        if (args.data.subscriptionStatus) {
          updateData.subscriptionStatus = sanitizeString(
            args.data.subscriptionStatus
          );
        }

        const results = await context.prisma.company.updateMany({
          where: {
            id: { in: args.ids },
          },
          data: updateData,
        });

        logInfo("Toplu şirket güncelleme tamamlandı", {
          metadata: timer.end(),
          userId: context.user.id,
          updatedCount: results.count,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} şirket başarıyla güncellendi`,
        };
      } catch (error) {
        logError("Toplu şirket güncelleme hatası", error as Error, {
          metadata: timer.end(),
          companyIds: args.ids,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Toggle Company Status
 * ✅ Permission: Admin only
 * ✅ Input: Array of company IDs + target status (true/false)
 * ✅ Returns: JSON with success/failure counts
 */
builder.mutationField("bulkToggleCompanyStatus", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
      isActive: t.arg.boolean({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("BulkToggleCompanyStatus");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu şirket durum değiştirme başlatılıyor", {
          userId: context.user.id,
          companyIds: args.ids,
          targetStatus: args.isActive,
        });

        const results = await context.prisma.company.updateMany({
          where: {
            id: { in: args.ids },
          },
          data: {
            isActive: args.isActive,
          },
        });

        logInfo("Toplu şirket durum değiştirme tamamlandı", {
          metadata: timer.end(),
          userId: context.user.id,
          updatedCount: results.count,
          newStatus: args.isActive,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} şirket durumu ${
            args.isActive ? "aktif" : "pasif"
          } olarak değiştirildi`,
        };
      } catch (error) {
        logError("Toplu şirket durum değiştirme hatası", error as Error, {
          metadata: timer.end(),
          companyIds: args.ids,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Delete Companies
 * ✅ Permission: Admin only
 * ✅ Input: Array of company IDs + hardDelete flag
 * ✅ Returns: JSON with success/failure counts
 */
builder.mutationField("bulkDeleteCompanies", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
      hardDelete: t.arg.boolean({ defaultValue: false }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("BulkDeleteCompanies");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu şirket silme başlatılıyor", {
          userId: context.user.id,
          companyIds: args.ids,
          hardDelete: args.hardDelete,
        });

        if (args.hardDelete) {
          // HARD DELETE
          const results = await context.prisma.company.deleteMany({
            where: {
              id: { in: args.ids },
            },
          });

          logInfo("Toplu şirket kalıcı silme tamamlandı", {
            metadata: timer.end(),
            userId: context.user.id,
            deletedCount: results.count,
          });

          return {
            success: true,
            deletedCount: results.count,
            message: `${results.count} şirket kalıcı olarak silindi`,
          };
        } else {
          // SOFT DELETE
          const results = await context.prisma.company.updateMany({
            where: {
              id: { in: args.ids },
            },
            data: {
              isActive: false,
            },
          });

          logInfo("Toplu şirket soft delete tamamlandı", {
            metadata: timer.end(),
            userId: context.user.id,
            deactivatedCount: results.count,
          });

          return {
            success: true,
            deactivatedCount: results.count,
            message: `${results.count} şirket devre dışı bırakıldı`,
          };
        }
      } catch (error) {
        logError("Toplu şirket silme hatası", error as Error, {
          metadata: timer.end(),
          companyIds: args.ids,
        });
        throw handleError(error);
      }
    },
  })
);

/**
 * ============================================================================
 * USER QUERIES
 * ============================================================================
 * Dosya: userQuery.ts
 * Amaç: Kullanıcı yönetimi sorguları
 * Versiyon: 2.0.0
 * Standart: GRAPHQL_STANDARDS_TR.md v2.0.0
 *
 * Queries:
 * - me: Mevcut kullanıcı bilgisi
 * - users: Tüm kullanıcılar (admin)
 * - user: Belirli kullanıcı (ID ile)
 * - allManufacturers: Üretici firmalar
 * - userStats: Kullanıcı istatistikleri
 * - usersCountByRole: Role göre kullanıcı sayıları (admin)
 * - userActivity: Kullanıcı aktivite detayları (admin)
 *
 * Güvenlik:
 * - me: user (authenticated)
 * - users: admin
 * - user: user (authenticated)
 * - allManufacturers: public
 * - userStats: user (authenticated)
 * - usersCountByRole: admin
 * - userActivity: admin
 * ============================================================================
 */

// Imports - GraphQL
import builder from "../builder";

// Imports - Utils
import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import { validateRequired } from "../../utils/validation";

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

// ========================================
// INPUT TYPES
// ========================================

const UsersFilterInput = builder.inputType("UsersFilterInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
    role: t.string(),
    search: t.string(),
  }),
});

const ManufacturersFilterInput = builder.inputType("ManufacturersFilterInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
    search: t.string(),
  }),
});

/**
 * QUERY: me
 *
 * Açıklama: Mevcut kullanıcının bilgilerini getirir
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: User
 */
builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { user: true },
    resolve: async (query, _root, _args, context) => {
      const timer = createTimer("me");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        const user = await context.prisma.user.findUniqueOrThrow({
          ...query,
          where: { id: context.user!.id },
        });

        // Başarıyı logla
        logInfo("Kullanıcı bilgisi alındı", {
          userId: user.id,
          email: user.email,
          role: user.role,
          metadata: timer.end(),
        });

        return user;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: users
 *
 * Açıklama: Tüm kullanıcıları filtrelerle getirir (admin)
 * Güvenlik: Admin yetkisi gerekli
 * Döner: User[]
 *
 * Filters:
 * - skip: Kaç kayıt atlanacak (pagination)
 * - take: Kaç kayıt getirilecek (pagination)
 * - role: Role filtreleme (ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER)
 * - search: Email veya isim araması
 */
builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      filters: t.arg({ type: UsersFilterInput }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("users");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        const { skip, take, role, search } = args.filters || {};
        const where: any = {};

        // Role filtresi - schema enum kontrolü
        if (role) {
          const sanitizedRole = sanitizeString(role);
          if (sanitizedRole && !ValidRoles.includes(sanitizedRole)) {
            throw new ValidationError(
              `Geçersiz rol. Geçerli roller: ${ValidRoles.join(", ")}`
            );
          }
          where.role = sanitizedRole;
        }

        // Arama filtresi
        if (search) {
          const sanitizedSearch = sanitizeString(search);
          if (sanitizedSearch) {
            where.OR = [
              { email: { contains: sanitizedSearch, mode: "insensitive" } },
              { name: { contains: sanitizedSearch, mode: "insensitive" } },
            ];
          }
        }

        const users = await context.prisma.user.findMany({
          ...query,
          where,
          ...(skip !== null && skip !== undefined ? { skip } : {}),
          ...(take !== null && take !== undefined ? { take } : {}),
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("Kullanıcı listesi alındı", {
          adminId: context.user.id,
          count: users.length,
          filters: { role, search, skip, take },
          metadata: timer.end(),
        });

        return users;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: user
 *
 * Açıklama: ID'ye göre kullanıcı bilgisi getirir
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: User
 */
builder.queryField("user", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("user");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        // ID sanitizasyonu
        const userId = sanitizeInt(args.id);
        validateRequired(userId, "Kullanıcı ID");

        const user = await context.prisma.user.findUniqueOrThrow({
          ...query,
          where: { id: userId! },
        });

        // Başarıyı logla
        logInfo("Kullanıcı bilgisi ID ile alındı", {
          requestedUserId: userId,
          byUser: context.user.id,
          metadata: timer.end(),
        });

        return user;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: allManufacturers
 *
 * Açıklama: Üretici firma kullanıcılarını getirir (COMPANY_OWNER, COMPANY_EMPLOYEE)
 * Güvenlik: Public (herkes erişebilir)
 * Döner: User[]
 */
builder.queryField("allManufacturers", (t) =>
  t.prismaField({
    type: ["User"],
    args: {
      filters: t.arg({ type: ManufacturersFilterInput }),
    },
    authScopes: { public: true },
    resolve: async (query, _root, args, context: any) => {
      const timer = createTimer("allManufacturers");
      try {
        const { skip, take, search } = args.filters || {};
        const where: any = {
          role: { in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"] },
        };

        // Arama filtresi
        if (search) {
          const sanitizedSearch = sanitizeString(search);
          if (sanitizedSearch) {
            where.OR = [
              { email: { contains: sanitizedSearch, mode: "insensitive" } },
              { name: { contains: sanitizedSearch, mode: "insensitive" } },
            ];
          }
        }

        const manufacturers = await context.prisma.user.findMany({
          ...query,
          where,
          ...(skip !== null && skip !== undefined ? { skip } : {}),
          ...(take !== null && take !== undefined ? { take } : {}),
          orderBy: { createdAt: "desc" },
        });

        // Başarıyı logla
        logInfo("Üretici listesi alındı", {
          count: manufacturers.length,
          filters: { search, skip, take },
          metadata: timer.end(),
        });

        return manufacturers;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: userStats
 *
 * Açıklama: Kullanıcının istatistiklerini getirir
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: JSON (totalSamples, totalOrders, totalCollections, pendingSamples)
 */
builder.queryField("userStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const timer = createTimer("userStats");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        const [totalSamples, totalOrders, totalCollections, pendingSamples] =
          await Promise.all([
            context.prisma.sample.count({
              where: {
                OR: [
                  { customerId: context.user.id },
                  { manufactureId: context.user.id },
                ],
              },
            }),
            context.prisma.order.count({
              where: {
                OR: [
                  { customerId: context.user.id },
                  { manufactureId: context.user.id },
                ],
              },
            }),
            context.prisma.collection.count({
              where: { authorId: context.user.id },
            }),
            context.prisma.sample.count({
              where: {
                customerId: context.user.id,
                status: { in: ["PENDING", "REVIEWED"] },
              },
            }),
          ]);

        const stats = {
          totalSamples,
          totalOrders,
          totalCollections,
          pendingSamples,
        };

        // Başarıyı logla
        logInfo("Kullanıcı istatistikleri alındı", {
          userId: context.user.id,
          ...stats,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: usersCountByRole
 *
 * Açıklama: Role göre kullanıcı sayılarını getirir (admin)
 * Güvenlik: Admin yetkisi gerekli
 * Döner: JSON (total, byRole, byStatus)
 */
builder.queryField("usersCountByRole", (t) =>
  t.field({
    type: "JSON",
    authScopes: { admin: true },
    resolve: async (_root: any, _args: any, context: any) => {
      const timer = createTimer("usersCountByRole");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        const [
          totalUsers,
          admins,
          companyOwners,
          companyEmployees,
          individualCustomers,
          activeUsers,
          inactiveUsers,
          pendingApproval,
        ] = await Promise.all([
          context.prisma.user.count(),
          context.prisma.user.count({ where: { role: "ADMIN" } }),
          context.prisma.user.count({ where: { role: "COMPANY_OWNER" } }),
          context.prisma.user.count({ where: { role: "COMPANY_EMPLOYEE" } }),
          context.prisma.user.count({ where: { role: "INDIVIDUAL_CUSTOMER" } }),
          context.prisma.user.count({ where: { isActive: true } }),
          context.prisma.user.count({ where: { isActive: false } }),
          context.prisma.user.count({ where: { isPendingApproval: true } }),
        ]);

        const stats = {
          total: totalUsers,
          byRole: {
            ADMIN: admins,
            COMPANY_OWNER: companyOwners,
            COMPANY_EMPLOYEE: companyEmployees,
            INDIVIDUAL_CUSTOMER: individualCustomers,
          },
          byStatus: {
            active: activeUsers,
            inactive: inactiveUsers,
            pendingApproval,
          },
        };

        // Başarıyı logla
        logInfo("Role bazlı kullanıcı sayıları alındı", {
          adminId: context.user.id,
          ...stats,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

/**
 * QUERY: userActivity
 *
 * Açıklama: Kullanıcının detaylı aktivite bilgilerini getirir (admin)
 * Güvenlik: Admin yetkisi gerekli
 * Döner: JSON (user, statistics, recentActivity)
 */
builder.queryField("userActivity", (t) =>
  t.field({
    type: "JSON",
    args: {
      userId: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root: any, args: any, context: any) => {
      const timer = createTimer("userActivity");
      try {
        // Kimlik doğrulama
        requireAuth(context.user?.id);

        // ID sanitizasyonu
        const userId = sanitizeInt(args.userId);
        validateRequired(userId, "Kullanıcı ID");

        const user = await context.prisma.user.findUnique({
          where: { id: userId! },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        if (!user) {
          throw new ValidationError("Kullanıcı bulunamadı");
        }

        const [
          totalSamples,
          totalOrders,
          totalCollections,
          sentMessages,
          receivedMessages,
        ] = await Promise.all([
          context.prisma.sample.count({
            where: {
              OR: [{ customerId: userId }, { manufactureId: userId }],
            },
          }),
          context.prisma.order.count({
            where: {
              OR: [{ customerId: userId }, { manufactureId: userId }],
            },
          }),
          context.prisma.collection.count({
            where: { authorId: userId },
          }),
          context.prisma.message.count({
            where: { senderId: userId },
          }),
          context.prisma.message.count({
            where: { receiverId: userId },
          }),
        ]);

        // Son aktiviteler
        const recentOrders = await context.prisma.order.findMany({
          where: {
            OR: [{ customerId: userId }, { manufactureId: userId }],
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
          },
        });

        const recentSamples = await context.prisma.sample.findMany({
          where: {
            OR: [{ customerId: userId }, { manufactureId: userId }],
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            sampleNumber: true,
            status: true,
            createdAt: true,
          },
        });

        const activity = {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            createdAt: user.createdAt,
            company: user.company,
          },
          statistics: {
            samples: totalSamples,
            orders: totalOrders,
            collections: totalCollections,
            messages: {
              sent: sentMessages,
              received: receivedMessages,
              total: sentMessages + receivedMessages,
            },
          },
          recentActivity: {
            orders: recentOrders,
            samples: recentSamples,
          },
        };

        // Başarıyı logla
        logInfo("Kullanıcı aktivite detayları alındı", {
          adminId: context.user.id,
          targetUserId: userId,
          statsCount: {
            samples: totalSamples,
            orders: totalOrders,
            messages: sentMessages + receivedMessages,
          },
          metadata: timer.end(),
        });

        return activity;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
  })
);

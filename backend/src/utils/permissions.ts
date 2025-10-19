/**
 * Department-Based Access Control (RBAC)
 *
 * Bu modül departman bazlı yetkilendirme sistemi sağlar.
 * Her departmanın hangi kaynaklara ve işlemlere erişebileceğini tanımlar.
 */

import type { Department, Role } from "../../lib/generated";

// Permission types
export enum Permission {
  // Sample (Numune) Permissions
  SAMPLE_VIEW = "sample:view",
  SAMPLE_CREATE = "sample:create",
  SAMPLE_UPDATE = "sample:update",
  SAMPLE_DELETE = "sample:delete",
  SAMPLE_APPROVE = "sample:approve",

  // Order (Sipariş) Permissions
  ORDER_VIEW = "order:view",
  ORDER_CREATE = "order:create",
  ORDER_UPDATE = "order:update",
  ORDER_DELETE = "order:delete",
  ORDER_APPROVE = "order:approve",

  // Production (Üretim) Permissions
  PRODUCTION_VIEW = "production:view",
  PRODUCTION_CREATE = "production:create",
  PRODUCTION_UPDATE = "production:update",
  PRODUCTION_DELETE = "production:delete",
  PRODUCTION_MANAGE = "production:manage", // Full production control

  // Quality Control Permissions
  QUALITY_VIEW = "quality:view",
  QUALITY_CREATE = "quality:create",
  QUALITY_UPDATE = "quality:update",
  QUALITY_DELETE = "quality:delete",
  QUALITY_APPROVE = "quality:approve",
  QUALITY_REJECT = "quality:reject",

  // Collection Permissions
  COLLECTION_VIEW = "collection:view",
  COLLECTION_CREATE = "collection:create",
  COLLECTION_UPDATE = "collection:update",
  COLLECTION_DELETE = "collection:delete",

  // Company (Firma) Permissions
  COMPANY_VIEW = "company:view",
  COMPANY_UPDATE = "company:update",
  COMPANY_DELETE = "company:delete",
  COMPANY_MANAGE_USERS = "company:manage_users",

  // User Management Permissions
  USER_VIEW = "user:view",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  // Analytics & Reports
  ANALYTICS_VIEW = "analytics:view",
  REPORTS_VIEW = "reports:view",
  REPORTS_EXPORT = "reports:export",

  // Settings
  SETTINGS_VIEW = "settings:view",
  SETTINGS_UPDATE = "settings:update",
}

// Department Permission Matrix
export const DEPARTMENT_PERMISSIONS: Record<Department, Permission[]> = {
  // PURCHASING (Satın Alma) - Sipariş ve tedarik odaklı
  PURCHASING: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.COLLECTION_VIEW,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // PRODUCTION (Üretim) - Üretim süreçleri tam kontrol
  PRODUCTION: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_UPDATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_CREATE,
    Permission.PRODUCTION_UPDATE,
    Permission.PRODUCTION_DELETE,
    Permission.PRODUCTION_MANAGE, // Full production control ✨
    Permission.QUALITY_VIEW,
    Permission.COLLECTION_VIEW,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // QUALITY (Kalite Kontrol) - Kalite onay yetkisi
  QUALITY: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_UPDATE,
    Permission.SAMPLE_APPROVE, // Sample approval ✨
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_UPDATE,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_CREATE,
    Permission.QUALITY_UPDATE,
    Permission.QUALITY_DELETE,
    Permission.QUALITY_APPROVE, // Quality approval ✨
    Permission.QUALITY_REJECT, // Quality rejection ✨
    Permission.COLLECTION_VIEW,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // DESIGN (Tasarım) - Ürün ve koleksiyon odaklı
  DESIGN: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.SAMPLE_UPDATE,
    Permission.ORDER_VIEW,
    Permission.COLLECTION_VIEW,
    Permission.COLLECTION_CREATE,
    Permission.COLLECTION_UPDATE,
    Permission.COLLECTION_DELETE,
    Permission.PRODUCTION_VIEW,
    Permission.QUALITY_VIEW,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // SALES (Satış) - Müşteri ve sipariş yönetimi
  SALES: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.COLLECTION_VIEW,
    Permission.PRODUCTION_VIEW,
    Permission.QUALITY_VIEW,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // MANAGEMENT (Yönetim) - Tüm yetkiler
  MANAGEMENT: Object.values(Permission), // All permissions
};

// Role-based Permissions (Department yoksa)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // ADMIN - Platform yöneticisi (her şey)
  ADMIN: Object.values(Permission),

  // COMPANY_OWNER - Firma sahibi (her şey)
  COMPANY_OWNER: Object.values(Permission),

  // COMPANY_EMPLOYEE - Departmana göre (DEPARTMENT_PERMISSIONS'dan gelir)
  COMPANY_EMPLOYEE: [], // Departmana göre dinamik

  // INDIVIDUAL_CUSTOMER - Müşteri (sınırlı)
  INDIVIDUAL_CUSTOMER: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.COLLECTION_VIEW,
    Permission.COMPANY_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  // Legacy roles (backward compatibility)
  MANUFACTURE: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.SAMPLE_UPDATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_UPDATE,
    Permission.PRODUCTION_VIEW,
    Permission.PRODUCTION_CREATE,
    Permission.PRODUCTION_UPDATE,
    Permission.COLLECTION_VIEW,
    Permission.COLLECTION_CREATE,
    Permission.COMPANY_VIEW,
    Permission.USER_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  CUSTOMER: [
    Permission.SAMPLE_VIEW,
    Permission.SAMPLE_CREATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.COLLECTION_VIEW,
    Permission.COMPANY_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.SETTINGS_VIEW,
  ],
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userRole: Role,
  userDepartment: Department | null,
  permission: Permission
): boolean {
  // Admin ve Company Owner her şeyi yapabilir
  if (userRole === "ADMIN" || userRole === "COMPANY_OWNER") {
    return true;
  }

  // Company Employee ise departmana bak
  if (userRole === "COMPANY_EMPLOYEE" && userDepartment) {
    const departmentPermissions = DEPARTMENT_PERMISSIONS[userDepartment];
    return departmentPermissions ? departmentPermissions.includes(permission) : false;
  }

  // Diğer roller için role permissions
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(
  userRole: Role,
  userDepartment: Department | null
): Permission[] {
  // Admin ve Company Owner her şeye erişebilir
  if (userRole === "ADMIN" || userRole === "COMPANY_OWNER") {
    return Object.values(Permission);
  }

  // Company Employee ise departmana göre
  if (userRole === "COMPANY_EMPLOYEE" && userDepartment) {
    return DEPARTMENT_PERMISSIONS[userDepartment] || [];
  }

  // Diğer roller için role permissions
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if user can access a specific route/page
 */
export function canAccessRoute(
  userRole: Role,
  userDepartment: Department | null,
  route: string
): boolean {
  // Route-Permission mapping
  const routePermissions: Record<string, Permission[]> = {
    // Production routes - Sadece PRODUCTION departmanı
    "/production": [Permission.PRODUCTION_VIEW],
    "/production/manage": [Permission.PRODUCTION_MANAGE],
    "/production/create": [Permission.PRODUCTION_CREATE],
    "/production/edit": [Permission.PRODUCTION_UPDATE],

    // Quality routes - Sadece QUALITY departmanı
    "/quality": [Permission.QUALITY_VIEW],
    "/quality/approve": [Permission.QUALITY_APPROVE],
    "/quality/reject": [Permission.QUALITY_REJECT],

    // Sample routes
    "/samples": [Permission.SAMPLE_VIEW],
    "/samples/create": [Permission.SAMPLE_CREATE],
    "/samples/edit": [Permission.SAMPLE_UPDATE],

    // Order routes
    "/orders": [Permission.ORDER_VIEW],
    "/orders/create": [Permission.ORDER_CREATE],
    "/orders/edit": [Permission.ORDER_UPDATE],

    // Collection routes
    "/collections": [Permission.COLLECTION_VIEW],
    "/collections/create": [Permission.COLLECTION_CREATE],
    "/collections/edit": [Permission.COLLECTION_UPDATE],

    // Analytics
    "/analytics": [Permission.ANALYTICS_VIEW],
    "/reports": [Permission.REPORTS_VIEW],

    // Settings
    "/settings": [Permission.SETTINGS_VIEW],

    // Company Management
    "/company/users": [Permission.COMPANY_MANAGE_USERS],
  };

  const requiredPermissions = routePermissions[route];

  // Route permission tanımlı değilse, herkese açık
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // En az bir permission varsa erişim ver
  return requiredPermissions.some((permission) =>
    hasPermission(userRole, userDepartment, permission)
  );
}

/**
 * Department display names (for UI)
 */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  PURCHASING: "Satın Alma",
  PRODUCTION: "Üretim",
  QUALITY: "Kalite Kontrol",
  DESIGN: "Tasarım",
  SALES: "Satış",
  MANAGEMENT: "Yönetim",
};

/**
 * Permission display names (for UI)
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.SAMPLE_VIEW]: "Numuneleri Görüntüle",
  [Permission.SAMPLE_CREATE]: "Numune Oluştur",
  [Permission.SAMPLE_UPDATE]: "Numune Düzenle",
  [Permission.SAMPLE_DELETE]: "Numune Sil",
  [Permission.SAMPLE_APPROVE]: "Numune Onayla",

  [Permission.ORDER_VIEW]: "Siparişleri Görüntüle",
  [Permission.ORDER_CREATE]: "Sipariş Oluştur",
  [Permission.ORDER_UPDATE]: "Sipariş Düzenle",
  [Permission.ORDER_DELETE]: "Sipariş Sil",
  [Permission.ORDER_APPROVE]: "Sipariş Onayla",

  [Permission.PRODUCTION_VIEW]: "Üretim Görüntüle",
  [Permission.PRODUCTION_CREATE]: "Üretim Oluştur",
  [Permission.PRODUCTION_UPDATE]: "Üretim Düzenle",
  [Permission.PRODUCTION_DELETE]: "Üretim Sil",
  [Permission.PRODUCTION_MANAGE]: "Üretim Yönet (Tam Kontrol)",

  [Permission.QUALITY_VIEW]: "Kalite Kontrol Görüntüle",
  [Permission.QUALITY_CREATE]: "Kalite Kaydı Oluştur",
  [Permission.QUALITY_UPDATE]: "Kalite Kaydı Düzenle",
  [Permission.QUALITY_DELETE]: "Kalite Kaydı Sil",
  [Permission.QUALITY_APPROVE]: "Kalite Onayla",
  [Permission.QUALITY_REJECT]: "Kalite Reddet",

  [Permission.COLLECTION_VIEW]: "Koleksiyonları Görüntüle",
  [Permission.COLLECTION_CREATE]: "Koleksiyon Oluştur",
  [Permission.COLLECTION_UPDATE]: "Koleksiyon Düzenle",
  [Permission.COLLECTION_DELETE]: "Koleksiyon Sil",

  [Permission.COMPANY_VIEW]: "Firma Bilgilerini Görüntüle",
  [Permission.COMPANY_UPDATE]: "Firma Bilgilerini Düzenle",
  [Permission.COMPANY_DELETE]: "Firma Sil",
  [Permission.COMPANY_MANAGE_USERS]: "Kullanıcıları Yönet",

  [Permission.USER_VIEW]: "Kullanıcıları Görüntüle",
  [Permission.USER_CREATE]: "Kullanıcı Oluştur",
  [Permission.USER_UPDATE]: "Kullanıcı Düzenle",
  [Permission.USER_DELETE]: "Kullanıcı Sil",

  [Permission.ANALYTICS_VIEW]: "Analitikleri Görüntüle",
  [Permission.REPORTS_VIEW]: "Raporları Görüntüle",
  [Permission.REPORTS_EXPORT]: "Rapor Dışa Aktar",

  [Permission.SETTINGS_VIEW]: "Ayarları Görüntüle",
  [Permission.SETTINGS_UPDATE]: "Ayarları Düzenle",
};

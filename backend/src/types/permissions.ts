// ========================================
// 🔐 USER PERMISSIONS TYPE DEFINITIONS
// ========================================

export const rolePermissions = {
  ADMIN: { canViewAll: true, canManageAll: true },
  COMPANY_OWNER: { canViewCompany: true, canManageCompany: true },
  COMPANY_EMPLOYEE: { canViewCompany: true, canManageOrders: true },
  INDIVIDUAL_CUSTOMER: { canViewOwn: true, canCreateOrders: true },
} as const;

export type RoleKey = keyof typeof rolePermissions;
export type RolePermissions = (typeof rolePermissions)[RoleKey];

export function getUserPermissions(role: string): RolePermissions {
  const permissions = rolePermissions[role as RoleKey];
  return permissions || rolePermissions.INDIVIDUAL_CUSTOMER;
}

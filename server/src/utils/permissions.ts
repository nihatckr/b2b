/**
 * Permission System
 *
 * Granular permission control for company employees
 */

export interface UserPermissions {
  collections?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
  };
  categories?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    view?: boolean;
  };
  samples?: {
    create?: boolean;
    updateStatus?: boolean;
    respond?: boolean;
    view?: boolean;
    approve?: boolean;
  };
  orders?: {
    create?: boolean;
    sendQuote?: boolean;
    updateStatus?: boolean;
    confirm?: boolean;
    view?: boolean;
  };
  production?: {
    updateStages?: boolean;
    assignWorkshop?: boolean;
    view?: boolean;
    requestRevision?: boolean;
  };
  quality?: {
    view?: boolean;
    comment?: boolean;
    perform?: boolean;
  };
  messages?: {
    send?: boolean;
    view?: boolean;
  };
  management?: {
    inviteUsers?: boolean;
    manageUsers?: boolean;
    viewReports?: boolean;
  };
}

/**
 * Get user permissions from JSON field
 */
export function getUserPermissions(user: any): UserPermissions {
  if (!user.permissions) {
    return getDefaultPermissions(user.role, user.isCompanyOwner);
  }

  try {
    if (typeof user.permissions === "string") {
      return JSON.parse(user.permissions);
    }
    return user.permissions;
  } catch (error) {
    console.error("Failed to parse user permissions:", error);
    return getDefaultPermissions(user.role, user.isCompanyOwner);
  }
}

/**
 * Get default permissions based on role
 */
function getDefaultPermissions(
  role: string,
  isOwner: boolean = false
): UserPermissions {
  // Admin has all permissions
  if (role === "ADMIN") {
    return {
      collections: { create: true, edit: true, delete: true, view: true },
      categories: { create: true, edit: true, delete: true, view: true },
      samples: {
        create: true,
        updateStatus: true,
        respond: true,
        view: true,
        approve: true,
      },
      orders: {
        create: true,
        sendQuote: true,
        updateStatus: true,
        confirm: true,
        view: true,
      },
      production: {
        updateStages: true,
        assignWorkshop: true,
        view: true,
        requestRevision: true,
      },
      quality: { view: true, comment: true, perform: true },
      messages: { send: true, view: true },
      management: { inviteUsers: true, manageUsers: true, viewReports: true },
    };
  }

  // Company Owner has full permissions
  if (role === "COMPANY_OWNER" || isOwner) {
    return {
      collections: { create: true, edit: true, delete: true, view: true },
      categories: { create: true, edit: true, delete: true, view: true },
      samples: {
        create: true,
        updateStatus: true,
        respond: true,
        view: true,
        approve: true,
      },
      orders: {
        create: true,
        sendQuote: true,
        updateStatus: true,
        confirm: true,
        view: true,
      },
      production: {
        updateStages: true,
        assignWorkshop: true,
        view: true,
        requestRevision: true,
      },
      quality: { view: true, comment: true, perform: true },
      messages: { send: true, view: true },
      management: { inviteUsers: true, manageUsers: true, viewReports: true },
    };
  }

  // Company Employee - limited permissions
  if (role === "COMPANY_EMPLOYEE") {
    return {
      collections: { view: true },
      categories: { view: true },
      samples: { view: true },
      orders: { view: true },
      production: { view: true },
      quality: { view: true },
      messages: { send: true, view: true },
      management: {},
    };
  }

  // Individual Customer
  if (role === "INDIVIDUAL_CUSTOMER" || role === "CUSTOMER") {
    return {
      samples: { create: true, view: true },
      orders: { create: true, confirm: true, view: true },
      messages: { send: true, view: true },
      production: { view: true },
    };
  }

  // Legacy MANUFACTURE role
  if (role === "MANUFACTURE") {
    return {
      collections: { create: true, edit: true, view: true },
      categories: { create: true, edit: true, view: true },
      samples: { updateStatus: true, respond: true, view: true },
      orders: { sendQuote: true, updateStatus: true, view: true },
      production: { updateStages: true, view: true },
      messages: { send: true, view: true },
    };
  }

  // Default: minimal permissions
  return {
    messages: { send: true, view: true },
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  user: any,
  resource: keyof UserPermissions,
  action: string
): boolean {
  const permissions = getUserPermissions(user);

  if (!permissions[resource]) {
    return false;
  }

  return (permissions[resource] as any)[action] === true;
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(
  user: any,
  resource: keyof UserPermissions,
  action: string,
  errorMessage?: string
): void {
  if (!hasPermission(user, resource, action)) {
    throw new Error(errorMessage || `Permission denied: ${resource}.${action}`);
  }
}

/**
 * Check if user is company owner
 */
export function isCompanyOwner(user: any): boolean {
  return user.isCompanyOwner === true || user.role === "COMPANY_OWNER";
}

/**
 * Check if user can manage company
 */
export function canManageCompany(user: any, companyId: number): boolean {
  if (user.role === "ADMIN") return true;
  if (isCompanyOwner(user) && user.companyId === companyId) return true;
  return false;
}

/**
 * Get user's company type
 */
export function getUserCompanyType(user: any): string | null {
  if (!user.company) return null;
  return user.company.type;
}

/**
 * Check if manufacturer (company type)
 */
export function isManufacturer(user: any): boolean {
  const companyType = getUserCompanyType(user);
  return companyType === "MANUFACTURER" || companyType === "BOTH";
}

/**
 * Check if buyer (company type)
 */
export function isBuyer(user: any): boolean {
  const companyType = getUserCompanyType(user);
  return companyType === "BUYER" || companyType === "BOTH";
}

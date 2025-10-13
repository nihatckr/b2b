import { useAuth } from "@/context/AuthProvider";
import { useMemo } from "react";

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
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo((): UserPermissions => {
    if (!user) return {};

    // Admin has all permissions
    if (user.role === "ADMIN") {
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

    // Parse JSON permissions
    let parsedPermissions: UserPermissions = {};
    if (user.permissions) {
      try {
        parsedPermissions =
          typeof user.permissions === "string"
            ? JSON.parse(user.permissions)
            : user.permissions;
      } catch (error) {
        console.error("Failed to parse user permissions:", error);
      }
    }

    // Company Owner has full permissions
    if (user.isCompanyOwner || user.role === "COMPANY_OWNER") {
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

    // Default permissions based on role if no custom permissions
    if (!user.permissions || Object.keys(parsedPermissions).length === 0) {
      return getDefaultPermissions(user.role);
    }

    return parsedPermissions;
  }, [user]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = (
    resource: keyof UserPermissions,
    action: string
  ): boolean => {
    if (!permissions[resource]) return false;
    return (permissions[resource] as any)[action] === true;
  };

  /**
   * Check if user is company owner
   */
  const isCompanyOwner = useMemo(() => {
    return user?.isCompanyOwner === true || user?.role === "COMPANY_OWNER";
  }, [user]);

  /**
   * Check if user can manage company
   */
  const canManageCompany = (companyId?: number): boolean => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    if (isCompanyOwner && user.companyId === companyId) return true;
    return false;
  };

  /**
   * Get user's company type
   */
  const companyType = useMemo(() => {
    return user?.company?.type || null;
  }, [user]);

  /**
   * Check if manufacturer (company type)
   */
  const isManufacturer = useMemo(() => {
    return companyType === "MANUFACTURER" || companyType === "BOTH";
  }, [companyType]);

  /**
   * Check if buyer (company type)
   */
  const isBuyer = useMemo(() => {
    return companyType === "BUYER" || companyType === "BOTH";
  }, [companyType]);

  return {
    permissions,
    hasPermission,
    isCompanyOwner,
    canManageCompany,
    companyType,
    isManufacturer,
    isBuyer,
  };
}

/**
 * Get default permissions based on role
 */
function getDefaultPermissions(role?: string): UserPermissions {
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

  // Company Employee - limited permissions (will be overridden by custom permissions)
  if (role === "COMPANY_EMPLOYEE") {
    return {
      collections: { view: true },
      categories: { view: true },
      samples: { view: true },
      orders: { view: true },
      production: { view: true },
      quality: { view: true },
      messages: { send: true, view: true },
    };
  }

  // Default: minimal permissions
  return {
    messages: { send: true, view: true },
  };
}

/**
 * Higher-order hook for specific permissions
 */
export function useCanManageCollections() {
  const { hasPermission } = usePermissions();
  return {
    canCreate: hasPermission("collections", "create"),
    canEdit: hasPermission("collections", "edit"),
    canDelete: hasPermission("collections", "delete"),
    canView: hasPermission("collections", "view"),
  };
}

export function useCanManageSamples() {
  const { hasPermission } = usePermissions();
  return {
    canCreate: hasPermission("samples", "create"),
    canUpdateStatus: hasPermission("samples", "updateStatus"),
    canRespond: hasPermission("samples", "respond"),
    canApprove: hasPermission("samples", "approve"),
    canView: hasPermission("samples", "view"),
  };
}

export function useCanManageOrders() {
  const { hasPermission } = usePermissions();
  return {
    canCreate: hasPermission("orders", "create"),
    canSendQuote: hasPermission("orders", "sendQuote"),
    canUpdateStatus: hasPermission("orders", "updateStatus"),
    canConfirm: hasPermission("orders", "confirm"),
    canView: hasPermission("orders", "view"),
  };
}

export function useCanManageCompany() {
  const { hasPermission, isCompanyOwner } = usePermissions();
  return {
    canInviteUsers:
      hasPermission("management", "inviteUsers") || isCompanyOwner,
    canManageUsers:
      hasPermission("management", "manageUsers") || isCompanyOwner,
    canViewReports:
      hasPermission("management", "viewReports") || isCompanyOwner,
    isOwner: isCompanyOwner,
  };
}

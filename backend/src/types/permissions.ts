// ========================================
// 🔐 USER PERMISSIONS TYPE DEFINITIONS
// ========================================
// Bu dosya Prisma schema'daki User.permissions Json field için
// TypeScript type tanımları içerir.

import { Department, Role, SubscriptionPlan } from '@prisma/client'

/**
 * Kullanıcı permission objesi
 * User.permissions Json field'ına yazılır
 */
export type UserPermissions = {
  // Sample Management
  samples: {
    create: boolean // Yeni sample oluşturabilir mi
    edit: boolean // Sample düzenleyebilir mi (sadece kendi oluşturduğu)
    delete: boolean // Sample silebilir mi
    viewAll: boolean // Şirketin tüm sample'larını görebilir mi (false ise sadece kendi sample'ları)
    approve: boolean // Sample onaylayabilir mi (COMPANY_OWNER için)
  }

  // Order Management
  orders: {
    create: boolean // Yeni order oluşturabilir mi
    edit: boolean // Order düzenleyebilir mi
    cancel: boolean // Order iptal edebilir mi
    approve: boolean // Order onaylayabilir mi
    viewAll: boolean // Şirketin tüm order'larını görebilir mi
  }

  // Collection Management
  collections: {
    create: boolean // Collection oluşturabilir mi
    edit: boolean // Collection düzenleyebilir mi
    delete: boolean // Collection silebilir mi
    publish: boolean // Collection yayınlayabilir mi
    viewAll: boolean // Tüm collection'ları görebilir mi
  }

  // Production Management
  production: {
    viewAll: boolean // Tüm production tracking'i görebilir mi
    updateStage: boolean // Production stage güncelleyebilir mi
    qaControl: boolean // Kalite kontrol yapabilir mi
    assignWorkshop: boolean // Workshop atayabilir mi
  }

  // User Management (Şirket içi)
  users: {
    view: boolean // Şirket kullanıcılarını görebilir mi
    invite: boolean // Yeni kullanıcı davet edebilir mi
    remove: boolean // Kullanıcı çıkarabilir mi
    changeRole: boolean // Kullanıcı rolü değiştirebilir mi
  }

  // Billing & Subscription
  billing: {
    view: boolean // Billing bilgilerini görebilir mi
    upgrade: boolean // Plan upgrade yapabilir mi
    managePlan: boolean // Subscription yönetebilir mi (cancel, renew)
  }

  // Company Settings
  settings: {
    editCompany: boolean // Şirket bilgilerini düzenleyebilir mi
    manageDepartments: boolean // Departman ayarlarını yönetebilir mi
    viewAnalytics: boolean // Analytics görebilir mi
  }

  // Messages
  messages: {
    send: boolean // Mesaj gönderebilir mi
    viewAll: boolean // Şirketin tüm mesajlarını görebilir mi
  }
}

/**
 * Role-based default permissions
 * Her rol için default permission seti
 */
export const ROLE_PERMISSIONS: Record<Role, UserPermissions> = {
  // Platform Admin - Full access
  ADMIN: {
    samples: { create: true, edit: true, delete: true, viewAll: true, approve: true },
    orders: { create: true, edit: true, cancel: true, approve: true, viewAll: true },
    collections: { create: true, edit: true, delete: true, publish: true, viewAll: true },
    production: { viewAll: true, updateStage: true, qaControl: true, assignWorkshop: true },
    users: { view: true, invite: true, remove: true, changeRole: true },
    billing: { view: true, upgrade: true, managePlan: true },
    settings: { editCompany: true, manageDepartments: true, viewAnalytics: true },
    messages: { send: true, viewAll: true },
  },

  // Company Owner - Full access (kendi şirketi için)
  COMPANY_OWNER: {
    samples: { create: true, edit: true, delete: true, viewAll: true, approve: true },
    orders: { create: true, edit: true, cancel: true, approve: true, viewAll: true },
    collections: { create: true, edit: true, delete: true, publish: true, viewAll: true },
    production: { viewAll: true, updateStage: true, qaControl: true, assignWorkshop: true },
    users: { view: true, invite: true, remove: true, changeRole: true },
    billing: { view: true, upgrade: true, managePlan: true },
    settings: { editCompany: true, manageDepartments: true, viewAnalytics: true },
    messages: { send: true, viewAll: true },
  },

  // Company Employee - Limited access (department-based)
  COMPANY_EMPLOYEE: {
    samples: { create: true, edit: true, delete: false, viewAll: false, approve: false },
    orders: { create: true, edit: true, cancel: false, approve: false, viewAll: false },
    collections: { create: true, edit: true, delete: false, publish: false, viewAll: false },
    production: { viewAll: false, updateStage: true, qaControl: false, assignWorkshop: false },
    users: { view: true, invite: false, remove: false, changeRole: false },
    billing: { view: false, upgrade: false, managePlan: false },
    settings: { editCompany: false, manageDepartments: false, viewAnalytics: false },
    messages: { send: true, viewAll: false },
  },

  // Individual Customer - Very limited access
  INDIVIDUAL_CUSTOMER: {
    samples: { create: true, edit: true, delete: false, viewAll: false, approve: false },
    orders: { create: true, edit: true, cancel: true, approve: false, viewAll: false },
    collections: { create: false, edit: false, delete: false, publish: false, viewAll: true },
    production: { viewAll: false, updateStage: false, qaControl: false, assignWorkshop: false },
    users: { view: false, invite: false, remove: false, changeRole: false },
    billing: { view: false, upgrade: false, managePlan: false },
    settings: { editCompany: false, manageDepartments: false, viewAnalytics: false },
    messages: { send: true, viewAll: false },
  },

  // Deprecated roles (backward compatibility)
  MANUFACTURE: {
    samples: { create: true, edit: true, delete: true, viewAll: true, approve: true },
    orders: { create: true, edit: true, cancel: true, approve: true, viewAll: true },
    collections: { create: true, edit: true, delete: true, publish: true, viewAll: true },
    production: { viewAll: true, updateStage: true, qaControl: true, assignWorkshop: true },
    users: { view: true, invite: true, remove: true, changeRole: true },
    billing: { view: true, upgrade: true, managePlan: true },
    settings: { editCompany: true, manageDepartments: true, viewAnalytics: true },
    messages: { send: true, viewAll: true },
  },

  CUSTOMER: {
    samples: { create: true, edit: true, delete: false, viewAll: false, approve: false },
    orders: { create: true, edit: true, cancel: true, approve: false, viewAll: false },
    collections: { create: false, edit: false, delete: false, publish: false, viewAll: true },
    production: { viewAll: false, updateStage: false, qaControl: false, assignWorkshop: false },
    users: { view: false, invite: false, remove: false, changeRole: false },
    billing: { view: false, upgrade: false, managePlan: false },
    settings: { editCompany: false, manageDepartments: false, viewAnalytics: false },
    messages: { send: true, viewAll: false },
  },
}

/**
 * Department-based permission modifications
 * COMPANY_EMPLOYEE için department'a göre ek permissions
 */
export const DEPARTMENT_PERMISSIONS: Record<Department, Partial<UserPermissions>> = {
  // Satın Alma - Order ve Sample siparişi
  PURCHASING: {
    samples: { viewAll: true, approve: true },
    orders: { viewAll: true, approve: true },
    production: { viewAll: true },
  },

  // Üretim - Sample üretimi ve Production tracking
  PRODUCTION: {
    production: { viewAll: true, updateStage: true, assignWorkshop: true },
    samples: { viewAll: true },
  },

  // Kalite - QA ve inspection
  QUALITY: {
    production: { viewAll: true, qaControl: true },
    samples: { viewAll: true },
    orders: { viewAll: true },
  },

  // Tasarım - Collection ve Sample design
  DESIGN: {
    collections: { create: true, edit: true, publish: false, viewAll: true },
    samples: { create: true, edit: true, viewAll: true },
  },

  // Satış - Customer relations ve Order management
  SALES: {
    orders: { viewAll: true, approve: true },
    samples: { viewAll: true },
    messages: { viewAll: true },
  },

  // Yönetim - Full access (COMPANY_OWNER gibi)
  MANAGEMENT: {
    samples: { viewAll: true, approve: true, delete: true },
    orders: { viewAll: true, approve: true, cancel: true },
    collections: { viewAll: true, publish: true, delete: true },
    production: { viewAll: true, qaControl: true, assignWorkshop: true },
    users: { view: true, invite: true },
    settings: { viewAnalytics: true },
    messages: { viewAll: true },
  },
}

/**
 * Plan-based feature flags
 * Subscription plan'a göre hangi özellikler aktif
 */
export type PlanFeatures = {
  // Core features
  aiDesign: boolean // AI-powered design generation
  analytics: boolean // Advanced analytics dashboard
  api: boolean // API access
  webhooks: boolean // Webhook support
  customBranding: boolean // Custom logo, colors
  prioritySupport: boolean // Priority customer support
  sso: boolean // Single Sign-On

  // Limits
  maxUsers: number
  maxSamples: number
  maxOrders: number
  maxCollections: number
  maxStorageGB: number
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    aiDesign: false,
    analytics: false,
    api: false,
    webhooks: false,
    customBranding: false,
    prioritySupport: false,
    sso: false,
    maxUsers: 3,
    maxSamples: 10,
    maxOrders: 5,
    maxCollections: 5,
    maxStorageGB: 1,
  },

  STARTER: {
    aiDesign: false,
    analytics: true,
    api: false,
    webhooks: false,
    customBranding: false,
    prioritySupport: false,
    sso: false,
    maxUsers: 10,
    maxSamples: 100,
    maxOrders: 50,
    maxCollections: 20,
    maxStorageGB: 10,
  },

  PROFESSIONAL: {
    aiDesign: true,
    analytics: true,
    api: true,
    webhooks: true,
    customBranding: true,
    prioritySupport: false,
    sso: false,
    maxUsers: 50,
    maxSamples: 500,
    maxOrders: 200,
    maxCollections: 100,
    maxStorageGB: 100,
  },

  ENTERPRISE: {
    aiDesign: true,
    analytics: true,
    api: true,
    webhooks: true,
    customBranding: true,
    prioritySupport: true,
    sso: true,
    maxUsers: -1, // unlimited
    maxSamples: -1, // unlimited
    maxOrders: -1, // unlimited
    maxCollections: -1, // unlimited
    maxStorageGB: 1000, // 1TB
  },

  CUSTOM: {
    aiDesign: true,
    analytics: true,
    api: true,
    webhooks: true,
    customBranding: true,
    prioritySupport: true,
    sso: true,
    maxUsers: -1, // unlimited
    maxSamples: -1, // unlimited
    maxOrders: -1, // unlimited
    maxCollections: -1, // unlimited
    maxStorageGB: -1, // unlimited
  },
}

/**
 * Helper function: Get user's final permissions
 * Role + Department + Custom permissions merge
 */
export function getUserPermissions(
  role: Role,
  department: Department | null,
  customPermissions: Partial<UserPermissions> | null
): UserPermissions {
  // Start with role defaults
  let permissions = { ...ROLE_PERMISSIONS[role] }

  // Apply department modifications (only for COMPANY_EMPLOYEE)
  if (role === 'COMPANY_EMPLOYEE' && department) {
    const deptPerms = DEPARTMENT_PERMISSIONS[department]
    permissions = deepMerge(permissions, deptPerms)
  }

  // Apply custom permissions (overrides)
  if (customPermissions) {
    permissions = deepMerge(permissions, customPermissions)
  }

  return permissions
}

/**
 * Helper function: Check if user has permission
 */
export function hasPermission(
  user: { role: Role; department: Department | null; permissions: any },
  category: keyof UserPermissions,
  action: string
): boolean {
  const permissions = getUserPermissions(user.role, user.department, user.permissions)
  return (permissions[category] as any)?.[action] === true
}

/**
 * Helper function: Deep merge objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key] as any)
    } else {
      result[key] = source[key] as any
    }
  }
  return result
}

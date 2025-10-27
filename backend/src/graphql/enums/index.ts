
import builder from '../builder';

// ========================================
// USER & COMPANY ENUMS
// ========================================


export const Role = builder.enumType('Role', {
  values: ['ADMIN', 'COMPANY_OWNER', 'COMPANY_EMPLOYEE', 'INDIVIDUAL_CUSTOMER', 'MANUFACTURE', 'CUSTOMER'] as const,
});

export const CompanyType = builder.enumType('CompanyType', {
  values: ['MANUFACTURER', 'BUYER', 'BOTH'] as const,
});

export const Department = builder.enumType('Department', {
  values: ['PURCHASING', 'PRODUCTION', 'QUALITY', 'DESIGN', 'SALES', 'MANAGEMENT'] as const,
});

// ========================================
// SUBSCRIPTION & BILLING ENUMS
// ========================================

export const SubscriptionPlan = builder.enumType('SubscriptionPlan', {
  values: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'] as const,
});

export const SubscriptionStatus = builder.enumType('SubscriptionStatus', {
  values: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'] as const,
});

export const BillingCycle = builder.enumType('BillingCycle', {
  values: ['MONTHLY', 'YEARLY'] as const,
});

// ========================================
// TEXTILE INDUSTRY ENUMS
// ========================================

export const Season = builder.enumType('Season', {
  values: ['SS25', 'FW25', 'SS26', 'FW26', 'SS27', 'FW27'] as const,
});

export const Gender = builder.enumType('Gender', {
  values: ['WOMEN', 'MEN', 'GIRLS', 'BOYS', 'UNISEX'] as const,
});

export const Fit = builder.enumType('Fit', {
  values: ['REGULAR', 'SLIM', 'RELAXED', 'OVERSIZED', 'FITTED', 'LOOSE'] as const,
});

// ========================================
// SAMPLE & ORDER STATUS ENUMS
// ========================================

export const SampleType = builder.enumType('SampleType', {
  values: ['STANDARD', 'REVISION', 'CUSTOM', 'DEVELOPMENT'] as const,
});

export const SampleStatus = builder.enumType('SampleStatus', {
  values: [
    // Initial stages
    'AI_DESIGN',
    'PENDING_APPROVAL',
    'PENDING',

    // Review & Quote stage
    'REVIEWED',
    'QUOTE_SENT',
    'CUSTOMER_QUOTE_SENT',
    'MANUFACTURER_REVIEWING_QUOTE',

    // Approval/Rejection
    'CONFIRMED',
    'REJECTED',
    'REJECTED_BY_CUSTOMER',
    'REJECTED_BY_MANUFACTURER',

    // Production stages
    'IN_DESIGN',
    'PATTERN_READY',
    'IN_PRODUCTION',
    'PRODUCTION_COMPLETE',

    // Quality & Delivery
    'QUALITY_CHECK',
    'SHIPPED',
    'DELIVERED',

    // Other statuses
    'ON_HOLD',
    'CANCELLED',

    // Legacy (backward compatibility)
    'REQUESTED',
    'RECEIVED',
    'COMPLETED',
  ] as const,
});

export const OrderStatus = builder.enumType('OrderStatus', {
  values: [
    'PENDING',
    'REVIEWED',
    'QUOTE_SENT',
    'CUSTOMER_QUOTE_SENT',
    'MANUFACTURER_REVIEWING_QUOTE',
    'CONFIRMED',
    'REJECTED',
    'REJECTED_BY_CUSTOMER',
    'REJECTED_BY_MANUFACTURER',
    'IN_PRODUCTION',
    'PRODUCTION_COMPLETE',
    'QUALITY_CHECK',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ] as const,
});

// ========================================
// PRODUCTION ENUMS
// ========================================

export const ProductionStage = builder.enumType('ProductionStage', {
  values: ['PLANNING', 'FABRIC', 'CUTTING', 'SEWING', 'QUALITY', 'PACKAGING', 'SHIPPING'] as const,
});

export const StageStatus = builder.enumType('StageStatus', {
  values: ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'REQUIRES_REVISION'] as const,
});

export const ProductionStatus = builder.enumType('ProductionStatus', {
  values: ['IN_PROGRESS', 'WAITING', 'BLOCKED', 'COMPLETED', 'CANCELLED'] as const,
});

export const QualityResult = builder.enumType('QualityResult', {
  values: ['PENDING', 'PASSED', 'FAILED', 'CONDITIONAL_PASS'] as const,
});

export const WorkshopType = builder.enumType('WorkshopType', {
  values: ['SEWING', 'PACKAGING', 'QUALITY_CONTROL', 'GENERAL'] as const,
});

// ========================================
// UNIFIED LIBRARY SYSTEM ENUMS
// ========================================

export const LibraryCategory = builder.enumType('LibraryCategory', {
  values: ['COLOR', 'FABRIC', 'MATERIAL', 'SIZE_GROUP', 'SEASON', 'FIT', 'CERTIFICATION'] as const,
});

export const LibraryScope = builder.enumType('LibraryScope', {
  values: ['PLATFORM_STANDARD', 'COMPANY_CUSTOM'] as const,
});

// ========================================
// CATEGORY SYSTEM ENUMS
// ========================================

export const CategoryType = builder.enumType('CategoryType', {
  values: ['GLOBAL_STANDARD', 'COMPANY_CUSTOM'] as const,
});

export const CategoryLevel = builder.enumType('CategoryLevel', {
  values: ['ROOT', 'MAIN', 'SUB', 'DETAIL'] as const,
});

// ========================================
// NOTIFICATION ENUMS
// ========================================

export const NotificationType = builder.enumType('NotificationType', {
  values: ['ORDER', 'SAMPLE', 'MESSAGE', 'PRODUCTION', 'QUALITY', 'SYSTEM'] as const,
});

// ========================================
// TASK SYSTEM ENUMS
// ========================================

export const TaskStatus = builder.enumType('TaskStatus', {
  values: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const,
});

export const TaskPriority = builder.enumType('TaskPriority', {
  values: ['LOW', 'MEDIUM', 'HIGH'] as const,
});

export const TaskType = builder.enumType('TaskType', {
  values: [
    // Status-based tasks
    'STATUS_CHANGE',

    // Special task types
    'QUOTATION',
    'REVIEW_QUOTE',
    'APPROVE_REJECT',
    'PAYMENT',
    'DOCUMENT',

    // Production tasks
    'PRODUCTION_STAGE',
    'QUALITY_CHECK',
    'SHIPMENT',
    'MATERIAL',

    // General tasks
    'MEETING',
    'REVISION',
    'NOTIFICATION',
    'DEADLINE_WARNING',
    'OTHER',
  ] as const,
});

// ========================================
// PARTNERSHIP & ANALYTICS ENUMS
// ========================================

export const PartnershipType = builder.enumType('PartnershipType', {
  values: [
    'SUPPLIER',
    'MANUFACTURER',
    'DISTRIBUTOR',
    'WHITE_LABEL',
    'CO_BRANDING',
    'SUBCONTRACTOR',
    'STRATEGIC_PARTNER',
  ] as const,
});

export const PartnershipStatus = builder.enumType('PartnershipStatus', {
  values: ['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'REJECTED'] as const,
});

export const ReportType = builder.enumType('ReportType', {
  values: [
    'COMPANY_COMPARISON',
    'PERFORMANCE',
    'FINANCIAL',
    'QUALITY',
    'MARKET_ANALYSIS',
    'TREND_ANALYSIS',
    'CUSTOM',
  ] as const,
});

export const ReportPeriod = builder.enumType('ReportPeriod', {
  values: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'] as const,
});

// ========================================
// ORDER CHANGE LOG ENUMS
// ========================================

export const OrderChangeLogStatus = builder.enumType('OrderChangeLogStatus', {
  values: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_NEGOTIATION'] as const,
});

export const OrderChangeType = builder.enumType('OrderChangeType', {
  values: ['QUANTITY', 'PRICE', 'DEADLINE', 'SPECIFICATIONS', 'NOTES', 'OTHER'] as const,
});

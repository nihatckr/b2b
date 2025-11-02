# Validation System Documentation

> Enterprise-grade validation system for ProtexFlow B2B Platform

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## 🎯 Overview

The ProtexFlow validation system provides:

- **Type-Safe Validation**: Full TypeScript support with generics
- **100% Turkish Error Messages**: Aligned with backend ValidationErrors
- **Modular Design**: Domain-separated validation schemas
- **Backend Compatible**: Matches Prisma schema constraints exactly
- **Composable Rules**: Reusable validation patterns
- **React Hooks**: Seamless integration with React components
- **Debounced Validation**: Performance-optimized real-time validation

## 🏗️ Architecture

```
frontend/src/lib/
├── validations/          # Zod schemas (domain-separated)
│   ├── auth.ts          # Authentication & password
│   ├── user.ts          # User profile
│   ├── company.ts       # Company information
│   ├── category.ts      # Category management
│   ├── library.ts       # Library items (7 types)
│   ├── review.ts        # Order reviews & replies
│   ├── bulk.ts          # Bulk operations
│   └── index.ts         # Central export
├── validation-utils.ts   # Utility functions & React hooks
└── zod-schema.ts        # DEPRECATED (backward compatibility)
```

### Design Principles

1. **Single Source of Truth**: Each schema exists in one place only
2. **Backend Alignment**: Error messages match backend ValidationErrors
3. **Fail-Fast**: Stop at first validation error per field
4. **Type Safety**: Full TypeScript inference
5. **Performance**: Debounced validation for real-time UX

## 📁 File Structure

### Validation Schemas

#### `auth.ts` - Authentication

```typescript
// Schemas
-ResetSchema - // Password reset request
  ResetPasswordSchema - // New password with token
  NewPasswordSchema - // Password change
  LoginSchema - // Login credentials
  RegisterSchema; // User registration

// Backend: authMutation.ts
// Errors: "İsim en az 2 karakter olmalıdır", "Geçerli bir e-posta adresi giriniz"
```

#### `user.ts` - User Profile

```typescript
// Schemas
-ProfileSchema - // User profile information
  NotificationSchema - // Notification preferences
  PreferencesSchema - // User preferences (language, timezone)
  PasswordSchema; // Password change with confirmation

// Backend: userMutation.ts, authMutation.ts
// Errors: "İsim gereklidir", "Şifre en az 8 karakter olmalıdır"
```

#### `company.ts` - Company

```typescript
// Schemas
-CompanySchema; // Company information, branding, social links

// Backend: companyMutation.ts
// Errors: "Firma adı gereklidir"
```

#### `category.ts` - Category Management

```typescript
// Schemas
- CategoryLevelEnum        // ROOT, MAIN, SUB, DETAIL
- CategorySchema           // Base category schema
- CategoryFormSchema       // Form-ready schema
- createCategorySchema()   // Dynamic schema with validation helpers

// Features
- Duplicate code detection
- Circular parent reference prevention
- Maximum depth validation
- Keywords JSON validation

// Backend: categoryMutation.ts
// Errors: "Kod sadece büyük harf, rakam ve tire içermelidir"
```

#### `library.ts` - Library Items (7 Types)

```typescript
// Base Schema
-BaseLibraryItemSchema - // Common fields (name, description, code)
  // Type-Specific Schemas
  FabricSchema - // Composition, weight, width, certifications
  ColorSchema - // Hex, Pantone codes
  SizeGroupSchema - // Regional standards, gender, category
  FitSchema - // Gender, fit type, category, sizes
  MaterialSchema - // Accessory details (type, material, dimensions)
  CertificationSchema - // Issuer, date, validity, categories
  SeasonSchema - // SS/FW, year
  // Union Schema
  LibraryItemSchema; // Discriminated union of all types

// Backend: libraryMutation.ts
// Errors: "Kompozisyon gereklidir", "Geçersiz hex renk formatı"
```

#### `review.ts` - Order Reviews (NEW in v2.0.0)

```typescript
// Schemas
- OrderReviewSchema        // 1-5 star ratings (overall, quality, delivery, communication)
- ManufacturerReplySchema  // Manufacturer response to reviews

// Features
- Rating validation (1-5 stars)
- Optional sub-ratings
- Public/private toggle
- Character limits (1000 max)

// Backend: reviewMutation.ts
// Errors: "Puan 1 ile 5 arasında olmalıdır"
```

#### `bulk.ts` - Bulk Operations (NEW in v2.0.0)

```typescript
// Schemas
-BulkUpdateOrderStatusSchema - // Max 50 orders
  BulkUpdateSampleStatusSchema - // Max 50 samples
  BulkDeleteSchema; // Max 50 items

// Backend: bulkMutation.ts
// Errors: "Aynı anda en fazla 50 sipariş güncellenebilir"
```

### Utility Functions (`validation-utils.ts`)

#### Core Validators

```typescript
validators.required(); // Required field
validators.length(); // String length (min-max)
validators.email(); // Email format
validators.code(); // Code format (A-Z, 0-9, -)
validators.phone(); // Phone number
validators.url(); // URL format
validators.numberRange(); // Number range
validators.json(); // JSON format
validators.hexColor(); // Hex color (#RGB or #RRGGBB)
validators.positiveNumber(); // Positive number
validators.integer(); // Integer (whole number)
```

#### Common Rules (Composable)

```typescript
commonRules.requiredString(); // Required string with length
commonRules.code(); // Code field (uppercase, numbers, dashes)
commonRules.email(); // Email field
commonRules.phone(); // Phone field
commonRules.url(); // URL field
commonRules.optionalString(); // Optional string with max length
commonRules.optionalUrl(); // Optional URL
commonRules.number(); // Number with range
commonRules.positiveInteger(); // Positive integer
commonRules.hexColor(); // Hex color
commonRules.json(); // JSON field
```

#### Form Validation

```typescript
validateForm(); // Validate entire form
validateField(); // Validate single field
combineValidationResults(); // Combine multiple results
getFieldError(); // Extract field error
hasFieldError(); // Check if field has error
```

#### React Hooks

```typescript
useRealtimeValidation(); // Real-time form validation with debounce
useFieldValidation(); // Single field validation with debounce
```

#### Utility Functions

```typescript
createDebouncedValidator(); // Create debounced validator
cleanupDebouncedValidator(); // Cleanup debounced validator
createCustomValidator(); // Create custom validator
createConditionalValidator(); // Conditional validation
```

## 📖 Usage Guide

### Basic Form Validation

```typescript
import { validateForm, commonRules } from "@/lib/validations";

const formData = {
  email: "user@example.com",
  name: "John Doe",
  age: 25,
};

const result = validateForm(formData, {
  email: commonRules.email(),
  name: commonRules.requiredString("İsim", 2, 100),
  age: commonRules.positiveInteger("Yaş", 150),
});

if (!result.isValid) {
  console.log(result.errors);
  // { email: "Geçerli bir e-posta adresi giriniz" }
}
```

### Real-Time Validation (React)

```typescript
"use client";

import { useState } from "react";
import { useRealtimeValidation, commonRules } from "@/lib/validations";

export default function MyForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });

  const { errors, isValidating, isValid, touchField } = useRealtimeValidation(
    formData,
    {
      email: commonRules.email(),
      name: commonRules.requiredString("İsim", 2, 50),
      phone: commonRules.phone(),
    },
    500 // 500ms debounce
  );

  return (
    <form>
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        onBlur={() => touchField("email")}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      {isValidating && <span>Doğrulanıyor...</span>}

      <button type="submit" disabled={!isValid || isValidating}>
        Gönder
      </button>
    </form>
  );
}
```

### Single Field Validation

```typescript
import { useFieldValidation, validators } from "@/lib/validation-utils";

function EmailInput() {
  const [email, setEmail] = useState("");

  const { error, isValidating, isValid } = useFieldValidation(
    email,
    [validators.email],
    "E-posta",
    300 // 300ms debounce
  );

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={error ? "error" : ""}
      />
      {error && <span>{error}</span>}
      {isValid && <span>✓</span>}
    </div>
  );
}
```

### Custom Validator

```typescript
import { createCustomValidator, validateForm } from "@/lib/validation-utils";

// Create custom validator
const isEven = createCustomValidator(
  (value) => Number(value) % 2 === 0,
  "Sayı çift olmalıdır"
);

// Use in form validation
const result = validateForm({ age: 25 }, { age: [isEven] });
```

### Conditional Validation

```typescript
import { createConditionalValidator, validators } from "@/lib/validation-utils";

// Only validate email if contact method is 'email'
const conditionalEmail = createConditionalValidator(
  (data: any) => data.contactMethod === "email",
  validators.email
);

const result = validateForm(formData, {
  contactMethod: commonRules.requiredString("İletişim Yöntemi"),
  email: [conditionalEmail],
});
```

### Zod Schema Validation (Type-Safe)

```typescript
import { LoginSchema, type LoginInput } from "@/lib/validations";

// Type-safe parsing
try {
  const validData: LoginInput = LoginSchema.parse(formData);
  // validData is fully typed and validated
  await login(validData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors);
  }
}

// Safe parsing (doesn't throw)
const result = LoginSchema.safeParse(formData);
if (result.success) {
  await login(result.data);
} else {
  console.log(result.error.errors);
}
```

### Category Validation (Complex Example)

```typescript
import { createCategorySchema } from "@/lib/validations";

// Fetch existing categories
const existingCategories = await fetchCategories();

// Create schema with custom validations
const categorySchema = createCategorySchema({
  existingCategories: existingCategories.map((cat) => ({
    id: cat.id,
    code: cat.code,
    level: cat.level,
    parentCategory: cat.parent ? { id: cat.parent.id } : null,
  })),
  currentCategoryId: editingCategory?.id,
});

// Validate
const result = categorySchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
  // - Duplicate code
  // - Circular parent reference
  // - Maximum depth exceeded
}
```

## 📋 API Reference

### Validators

#### `validators.required(value, fieldName)`

Validates that field has a non-empty value.

**Parameters:**

- `value: string | undefined | null` - Value to validate
- `fieldName: string` - Field name for error message

**Returns:** `string | null` - Error message or null if valid

**Example:**

```typescript
validators.required("", "İsim"); // "İsim gereklidir"
validators.required("John", "İsim"); // null
```

#### `validators.length(value, min, max, fieldName)`

Validates string length is within range.

**Parameters:**

- `value: string` - String to validate
- `min: number` - Minimum length (inclusive)
- `max: number` - Maximum length (inclusive)
- `fieldName: string` - Field name for error message

**Returns:** `string | null`

**Example:**

```typescript
validators.length("ab", 3, 10, "Kod"); // "Kod 3-10 karakter arasında olmalıdır"
validators.length("abc", 3, 10, "Kod"); // null
```

#### `validators.email(value)`

Validates email format.

**Parameters:**

- `value: string` - Email to validate

**Returns:** `string | null`

**Example:**

```typescript
validators.email("invalid"); // "Geçerli bir e-posta adresi giriniz"
validators.email("user@example.com"); // null
```

### Common Rules

#### `commonRules.requiredString(fieldName, minLength?, maxLength?)`

Required string with length validation.

**Parameters:**

- `fieldName: string` - Field name for error messages
- `minLength?: number` - Minimum length (default: 1)
- `maxLength?: number` - Maximum length (default: 1000)

**Returns:** `ValidatorFn[]`

**Example:**

```typescript
commonRules.requiredString("İsim", 2, 100);
```

#### `commonRules.email()`

Email field with format validation.

**Returns:** `ValidatorFn[]`

**Example:**

```typescript
const rules = {
  email: commonRules.email(),
};
```

### React Hooks

#### `useRealtimeValidation(data, rules, debounceMs?)`

Real-time form validation with debouncing.

**Parameters:**

- `data: T` - Form data to validate
- `rules: ValidationRules<T>` - Validation rules
- `debounceMs?: number` - Debounce delay (default: 500)

**Returns:**

```typescript
{
  errors: Record<string, string>;
  isValidating: boolean;
  isValid: boolean;
  touched: Set<keyof T>;
  touchField: (fieldName: keyof T) => void;
  reset: () => void;
}
```

**Example:**

```typescript
const { errors, isValidating, isValid } = useRealtimeValidation(formData, {
  email: commonRules.email(),
  name: commonRules.requiredString("İsim"),
});
```

#### `useFieldValidation(value, validators, fieldName, debounceMs?)`

Single field validation with debouncing.

**Parameters:**

- `value: unknown` - Field value to validate
- `validators: ValidatorFn[]` - Array of validators
- `fieldName: string` - Field name for error messages
- `debounceMs?: number` - Debounce delay (default: 300)

**Returns:**

```typescript
{
  error: string | null;
  isValidating: boolean;
  isValid: boolean;
}
```

## ✨ Best Practices

### 1. Use Zod Schemas for Type Safety

```typescript
// ✅ GOOD: Type-safe with Zod
import { LoginSchema, type LoginInput } from "@/lib/validations";

const handleLogin = (data: LoginInput) => {
  // data is fully typed
};

// Validate with Zod
const result = LoginSchema.safeParse(formData);
if (result.success) {
  handleLogin(result.data);
}
```

### 2. Compose Validation Rules

```typescript
// ✅ GOOD: Reusable composition
const passwordRules = [
  ...commonRules.requiredString("Şifre", 8, 128),
  createCustomValidator(
    (value) => /[A-Z]/.test(String(value)),
    "Şifre en az bir büyük harf içermelidir"
  ),
];

const rules = {
  password: passwordRules,
  confirmPassword: [
    ...passwordRules,
    (value, _) => (value === formData.password ? null : "Şifreler eşleşmiyor"),
  ],
};
```

### 3. Use Constants for Limits

```typescript
import { VALIDATION_LIMITS } from "@/lib/validation-utils";

// ✅ GOOD: Use predefined limits
commonRules.requiredString(
  "İsim",
  VALIDATION_LIMITS.NAME_MIN,
  VALIDATION_LIMITS.NAME_MAX
);

// ❌ BAD: Magic numbers
commonRules.requiredString("İsim", 2, 100);
```

### 4. Handle Validation Errors Properly

```typescript
// ✅ GOOD: User-friendly error handling
const result = validateForm(formData, rules);
if (!result.isValid) {
  setErrors(result.errors);
  toast.error("Lütfen formu kontrol ediniz");
  return;
}

// Proceed with valid data
await submitForm(formData);
```

### 5. Debounce Real-Time Validation

```typescript
// ✅ GOOD: Debounced validation (better UX)
const { errors } = useRealtimeValidation(formData, rules, 500);

// ❌ BAD: No debounce (validates on every keystroke)
const { errors } = useRealtimeValidation(formData, rules, 0);
```

### 6. Mark Fields as Touched

```typescript
// ✅ GOOD: Show errors only after user interaction
const { errors, touched, touchField } = useRealtimeValidation(formData, rules);

<input onBlur={() => touchField("email")} />;
{
  touched.has("email") && errors.email && <span>{errors.email}</span>;
}

// ❌ BAD: Show errors immediately (poor UX)
{
  errors.email && <span>{errors.email}</span>;
}
```

## 🔄 Migration Guide

### From Old zod-schema.ts

```typescript
// ❌ OLD (deprecated)
import { ProfileSchema } from "@/lib/zod-schema";

// ✅ NEW (recommended)
import { ProfileSchema } from "@/lib/validations";
```

### From Custom Validation Functions

```typescript
// ❌ OLD (custom validation)
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? null : "Invalid email";
};

// ✅ NEW (use validators)
import { validators } from "@/lib/validation-utils";
const error = validators.email(email);
```

### From React Hook Form

```typescript
// ❌ OLD (React Hook Form)
const {
  register,
  formState: { errors },
} = useForm({
  resolver: zodResolver(LoginSchema),
});

// ✅ NEW (useRealtimeValidation)
const { errors, isValid } = useRealtimeValidation(formData, {
  email: commonRules.email(),
  password: commonRules.requiredString("Şifre", 8, 128),
});
```

## 📊 Validation Limits

All limits are aligned with backend Prisma schema:

```typescript
import { VALIDATION_LIMITS } from "@/lib/validation-utils";

VALIDATION_LIMITS.NAME_MIN; // 2
VALIDATION_LIMITS.NAME_MAX; // 100
VALIDATION_LIMITS.CODE_MIN; // 3
VALIDATION_LIMITS.CODE_MAX; // 40
VALIDATION_LIMITS.DESCRIPTION_MAX; // 500
VALIDATION_LIMITS.COMMENT_MAX; // 1000
VALIDATION_LIMITS.PASSWORD_MIN; // 8
VALIDATION_LIMITS.PASSWORD_MAX; // 128
VALIDATION_LIMITS.MIN_RATING; // 1
VALIDATION_LIMITS.MAX_RATING; // 5
VALIDATION_LIMITS.MAX_BULK_ITEMS; // 50
```

## 🧪 Testing

```typescript
import { validateForm, commonRules } from "@/lib/validations";

describe("Email Validation", () => {
  it("should validate valid email", () => {
    const result = validateForm(
      { email: "test@example.com" },
      { email: commonRules.email() }
    );
    expect(result.isValid).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = validateForm(
      { email: "invalid" },
      { email: commonRules.email() }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("Geçerli bir e-posta adresi giriniz");
  });
});
```

## 📝 Notes

- All error messages are in Turkish and match backend ValidationErrors
- Validation is fail-fast (stops at first error per field)
- Debounced validation improves performance for real-time validation
- TypeScript types are automatically inferred from Zod schemas
- All schemas are 100% compatible with backend Prisma models

## 🔗 Related Documentation

- [Backend Validation Documentation](../../../../backend/README.md#validation)
- [Prisma Schema](../../../../backend/prisma/schema.prisma)
- [Authentication Guide](../../../AUTHENTICATION_GUIDE.md)
- [Zod Documentation](https://zod.dev/)

## 📌 Version

**Current Version:** 2.0.0  
**Last Updated:** November 1, 2025  
**Status:** ✅ Production Ready

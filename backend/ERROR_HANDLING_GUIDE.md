# 🛡️ Error Handling & Masking Guide

## 📋 Overview

This project implements **GraphQL Yoga's best practice error handling** with:
- ✅ **Error Masking** - Hides sensitive errors in production
- ✅ **Custom Error Classes** - Proper error codes and HTTP status codes
- ✅ **Development Mode** - Full error details with stack traces
- ✅ **Production Mode** - Masked errors for security

---

## 🔒 Error Masking Configuration

### Server Configuration (`src/server.ts`)

```typescript
const yoga = createYoga({
  schema,
  context: createContext,
  // Error masking (enabled by default)
  maskedErrors: {
    maskError(error, message, isDev) {
      // GraphQLError instances are NEVER masked
      if (error instanceof GraphQLError) {
        return error;
      }

      // All other errors are masked in production
      return maskError(error, message, isDev);
    },
  },
});
```

### What Gets Masked?

| Error Type | Production | Development |
|------------|-----------|-------------|
| `GraphQLError` | ✅ **NOT masked** (exposed) | ✅ Full details |
| `new Error()` | ⚠️ **Masked** ("Unexpected error.") | ✅ Full details + stack |
| Database errors | ⚠️ **Masked** | ✅ Full details + stack |
| Network errors | ⚠️ **Masked** | ✅ Full details + stack |

---

## 🎯 Custom Error Classes (`src/utils/errors.ts`)

### Available Error Types

```typescript
// 1. Authentication Error (401)
throw new AuthenticationError();
throw new AuthenticationError("Custom message");

// 2. Forbidden Error (403)
throw new ForbiddenError();
throw new ForbiddenError("Admin access required");

// 3. Not Found Error (404)
throw new NotFoundError("User", userId);
// Returns: "User with id '123' not found"

// 4. Validation Error (400)
throw new ValidationError("Email is required", "email");

// 5. Duplicate Error (409)
throw new DuplicateError("User", "email", "test@example.com");
// Returns: "User with email 'test@example.com' already exists"

// 6. Business Logic Error (422)
throw new BusinessLogicError("Order cannot be cancelled after shipment");

// 7. Rate Limit Error (429)
throw new RateLimitError();

// 8. File Upload Error (400)
throw new FileUploadError("File size exceeds 10MB", {
  maxSize: 10485760,
  receivedSize: 15728640
});
```

### Helper Functions

```typescript
// Require authentication (throws if not authenticated)
requireAuth(context.user?.id);

// Require permission (throws if not permitted)
requirePermission(
  context.user?.role === 'ADMIN',
  "Only admins can perform this action"
);
```

---

## 📝 Usage Examples

### ✅ Good Practice (Custom GraphQLError)

```typescript
builder.mutationField("deleteUser", (t) =>
  t.field({
    type: "Boolean",
    args: { userId: t.arg.string({ required: true }) },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      // Use helper function
      requireAuth(context.user?.id);

      const user = await context.prisma.user.findUnique({
        where: { id: args.userId },
      });

      if (!user) {
        // Custom error - NOT masked
        throw new NotFoundError("User", args.userId);
      }

      await context.prisma.user.delete({ where: { id: args.userId } });
      return true;
    },
  })
);
```

**Response in Production:**
```json
{
  "errors": [{
    "message": "User with id '123' not found",
    "extensions": {
      "code": "NOT_FOUND",
      "resource": "User",
      "id": "123",
      "http": { "status": 404 }
    }
  }]
}
```

---

### ❌ Bad Practice (Generic Error)

```typescript
// DON'T DO THIS
if (!user) {
  throw new Error("User not found"); // Will be masked in production!
}

// Database connection error (will be masked)
const users = await prisma.user.findMany(); // If DB fails, error is masked
```

**Response in Production (Masked):**
```json
{
  "errors": [{
    "message": "Unexpected error."
  }]
}
```

---

## 🔧 Development vs Production

### Start Development Mode

```bash
NODE_ENV=development npm run dev
```

**Features:**
- ✅ GraphiQL enabled
- ✅ Full error stack traces in response
- ✅ Detailed logging
- ✅ All errors exposed (even masked ones have `originalError` in extensions)

### Start Production Mode

```bash
npm start
# or
NODE_ENV=production npm run dev
```

**Features:**
- ⚠️ GraphiQL **disabled**
- ✅ Error masking **enabled**
- ✅ Only `GraphQLError` instances exposed
- ⚠️ Generic errors shown as "Unexpected error."
- ✅ Minimal logging

---

## 🌐 HTTP Status Codes

All custom errors include proper HTTP status codes:

| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `AuthenticationError` | 401 | User not logged in |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ValidationError` | 400 | Invalid input |
| `DuplicateError` | 409 | Resource already exists |
| `BusinessLogicError` | 422 | Business rule violation |
| `RateLimitError` | 429 | Too many requests |
| `FileUploadError` | 400 | File upload issues |

---

## 🔍 Error Response Format

### Custom GraphQLError (Exposed)

```json
{
  "errors": [{
    "message": "User with id '123' not found",
    "path": ["deleteUser"],
    "locations": [{ "line": 2, "column": 3 }],
    "extensions": {
      "code": "NOT_FOUND",
      "resource": "User",
      "id": "123",
      "http": {
        "status": 404
      }
    }
  }],
  "data": null
}
```

### Masked Error (Production)

```json
{
  "errors": [{
    "message": "Unexpected error.",
    "path": ["deleteUser"],
    "locations": [{ "line": 2, "column": 3 }]
  }],
  "data": null
}
```

### Masked Error (Development)

```json
{
  "errors": [{
    "message": "Unexpected error.",
    "path": ["deleteUser"],
    "locations": [{ "line": 2, "column": 3 }],
    "extensions": {
      "originalError": {
        "message": "connect ECONNREFUSED 127.0.0.1:3306",
        "stack": "Error: connect ECONNREFUSED 127.0.0.1:3306\n    at..."
      }
    }
  }],
  "data": null
}
```

---

## 🎨 Migration Checklist

To migrate existing code to use proper error handling:

### 1. Replace Generic Errors

```typescript
// ❌ Before
if (!context.user?.id) {
  throw new Error("Not authenticated");
}

// ✅ After
requireAuth(context.user?.id);
// or
if (!context.user?.id) {
  throw new AuthenticationError();
}
```

### 2. Use Specific Error Classes

```typescript
// ❌ Before
if (!user) {
  throw new Error("User not found");
}

// ✅ After
if (!user) {
  throw new NotFoundError("User", userId);
}
```

### 3. Let Unexpected Errors Bubble

```typescript
// ❌ Before
try {
  const data = await externalAPI.fetch();
} catch (error) {
  throw new Error("Failed to fetch data"); // Hides real error
}

// ✅ After
try {
  const data = await externalAPI.fetch();
} catch (error) {
  console.error("External API error:", error);
  throw error; // Let Yoga mask it automatically
}
```

---

## 🚀 Best Practices

1. **✅ Use Custom Errors for Expected Issues**
   - Authentication, validation, not found, permissions

2. **✅ Let Unexpected Errors Be Masked**
   - Database errors, network errors, third-party API failures

3. **✅ Include Error Codes**
   - Makes it easy for frontend to handle specific errors

4. **✅ Add Contextual Information**
   - Resource type, field name, received value

5. **✅ Test in Both Modes**
   - Development: See full errors
   - Production: Verify masking works

6. **❌ Never Expose Sensitive Info**
   - Database connection strings
   - Internal API endpoints
   - User credentials
   - System paths

---

## 📚 References

- [GraphQL Yoga Error Masking](https://the-guild.dev/graphql/yoga-server/docs/features/error-masking)
- [GraphQL Error Specification](https://spec.graphql.org/October2021/#sec-Errors)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

## 🔐 Security Notes

**Why Error Masking is Important:**

1. **Prevents Information Leakage**
   - Hides database structure
   - Conceals internal system details
   - Protects against reconnaissance attacks

2. **Compliance**
   - GDPR, PCI DSS, HIPAA requirements
   - Security best practices

3. **Professional UX**
   - Consistent error messages
   - User-friendly error codes
   - Proper HTTP status codes

**Remember:** Error masking is **enabled by default** in GraphQL Yoga - it's a security feature, not a bug!

---

✅ **Status:** Error handling system fully implemented and tested
📅 **Last Updated:** October 18, 2025
🔄 **Version:** 1.0.0

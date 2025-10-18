# 🔒 CORS Configuration Guide

## ✅ CORS Setup Complete

Cross-Origin Resource Sharing (CORS) başarıyla konfigüre edildi!

---

## 🎯 Problem: Same-Origin Policy

### CORS Nedir?

Tarayıcılar güvenlik nedeniyle, bir web sayfasının farklı bir domain'deki kaynaklara (API) erişmesini engeller.

**Örnek:**
```
Frontend: http://localhost:3000
Backend:  http://localhost:4001
         ↑ Farklı port = Farklı origin = CORS hatası!
```

### CORS Olmadan:

```bash
# Browser Console Error:
Access to fetch at 'http://localhost:4001/graphql' from origin
'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present.
```

---

## ⚙️ Konfigürasyon

### Backend (server.ts)

```typescript
// CORS configuration for cross-origin requests
const allowedOrigins = isDev
  ? [
      'http://localhost:3000',  // Next.js default dev port
      'http://localhost:3001',  // Alternative Next.js port
      'http://localhost:4000',  // GraphiQL/testing
    ]
  : process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [];

const yoga = createYoga({
  // ... other config
  cors: {
    origin: allowedOrigins,
    credentials: true,              // ✅ Allow cookies & Authorization header
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',             // Custom request tracking
    ],
    methods: ['GET', 'POST'],       // GraphQL uses POST
    maxAge: 86400,                  // Cache preflight for 24 hours
  },
});
```

### Environment Variables (.env)

```bash
# Development (otomatik localhost izinleri)
NODE_ENV=development

# Production
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

---

## 🧪 CORS Testing

### Test 1: Preflight Request (OPTIONS)

Browser otomatik olarak POST request'ten önce OPTIONS (preflight) gönderir:

```bash
curl -X OPTIONS http://localhost:4001/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
```

---

### Test 2: Actual GraphQL Request

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "{ me { id email } }"}' \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

---

### Test 3: Blocked Origin (Security Test)

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}' \
  -v
```

**Expected Behavior:**
```
❌ No Access-Control-Allow-Origin header
❌ Browser blocks the request
✅ Security working!
```

---

## 🛡️ Security Features

### 1. **Origin Whitelist**

```typescript
// ✅ Development: Specific localhost ports
allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
]

// ✅ Production: Only your domain
allowedOrigins = ['https://yourdomain.com']

// ❌ NEVER use in production:
origin: '*'  // Allows ALL origins (security risk!)
```

### 2. **Credentials Support**

```typescript
credentials: true  // ✅ Required for:
// - JWT in Authorization header
// - HttpOnly cookies
// - Session management
```

**Frontend must also enable credentials:**
```typescript
// URQL Client
fetchOptions: {
  credentials: 'include', // Send cookies
  headers: {
    Authorization: `Bearer ${token}`,
  },
}
```

### 3. **Preflight Caching**

```typescript
maxAge: 86400  // 24 hours
// Browser won't send OPTIONS for 24 hours
// Reduces network overhead
```

---

## 📊 Development vs Production

### Development Mode:

```typescript
NODE_ENV=development

// Auto-allowed origins:
✅ http://localhost:3000 (Next.js)
✅ http://localhost:3001 (Alternative)
✅ http://localhost:4000 (GraphiQL)

// No FRONTEND_URL needed
```

### Production Mode:

```typescript
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

// Allowed origins:
✅ https://yourdomain.com
❌ http://localhost:3000 (blocked)
❌ * (wildcard blocked)

// Strict security!
```

---

## 🚨 Common CORS Errors

### Error 1: Missing Authorization Header

```
Access to fetch has been blocked:
Request header field authorization is not allowed
```

**Fix:**
```typescript
allowedHeaders: [
  'Content-Type',
  'Authorization',  // ✅ Add this!
]
```

---

### Error 2: Credentials Not Sent

```
Cookie not being sent to backend
```

**Frontend Fix:**
```typescript
// URQL Client
fetchOptions: {
  credentials: 'include',  // ✅ Add this!
}
```

**Backend Fix:**
```typescript
cors: {
  credentials: true,  // ✅ Must be true!
}
```

---

### Error 3: Origin Not Allowed

```
Access-Control-Allow-Origin header has value 'null'
```

**Fix:**
```bash
# Production .env
FRONTEND_URL=https://actual-domain.com  # ✅ Set correct URL
```

---

## 🔍 CORS Headers Explained

### Request Headers (Browser → Server):

```
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, authorization
```

### Response Headers (Server → Browser):

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID
Access-Control-Max-Age: 86400
```

---

## 📈 Performance Impact

### Without Preflight Caching:
```
Every GraphQL request:
1. OPTIONS (preflight) → 50ms
2. POST (actual query) → 200ms
Total: 250ms
```

### With Preflight Caching (maxAge: 86400):
```
First request:
1. OPTIONS (preflight) → 50ms
2. POST (actual query) → 200ms
Total: 250ms

Next requests (24 hours):
1. POST (actual query) → 200ms
Total: 200ms (20% faster!)
```

---

## 🌐 Multi-Domain Setup

### Multiple Frontend Domains:

```typescript
const allowedOrigins = isDev
  ? [
      'http://localhost:3000',
      'http://localhost:3001',
    ]
  : [
      'https://app.yourdomain.com',      // Main app
      'https://admin.yourdomain.com',    // Admin panel
      'https://mobile.yourdomain.com',   // Mobile web
    ];
```

### Environment Variable:

```bash
# .env (production)
FRONTEND_URL=https://app.yourdomain.com,https://admin.yourdomain.com
```

**Update server.ts:**
```typescript
const allowedOrigins = isDev
  ? ['http://localhost:3000', 'http://localhost:3001']
  : process.env.FRONTEND_URL?.split(',') || [];
```

---

## 🔧 Advanced CORS Configuration

### Dynamic Origin (Request-Based):

```typescript
cors: (request) => {
  const origin = request.headers.get('origin');

  // Whitelist check
  const allowedOrigins = [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
  ];

  const isAllowed = allowedOrigins.includes(origin || '');

  return {
    origin: isAllowed ? origin : false,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST'],
  };
}
```

---

## 🚀 Deployment Checklist

### Before Production:

- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to actual domain
- [ ] Remove wildcard origins (`*`)
- [ ] Enable credentials (`credentials: true`)
- [ ] Test CORS with actual frontend URL
- [ ] Verify Authorization header works
- [ ] Check preflight caching works
- [ ] Monitor CORS errors in logs

---

## 📚 Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Yoga CORS Docs](https://the-guild.dev/graphql/yoga-server/docs/features/cors)
- [CORS Spec (W3C)](https://www.w3.org/TR/cors/)
- [CORS Preflight](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

---

## 🎯 Summary

### What We Configured:

✅ **Origin Whitelist**: Localhost (dev) + Custom domain (prod)
✅ **Credentials**: Cookie & Authorization header support
✅ **Allowed Headers**: Content-Type, Authorization, X-Request-ID
✅ **Methods**: GET, POST (GraphQL standard)
✅ **Preflight Caching**: 24 hours (performance)
✅ **Security**: No wildcard origins in production

### Benefits:

- 🔒 **Secure**: Only whitelisted origins allowed
- ⚡ **Fast**: Preflight caching reduces overhead
- 🍪 **Compatible**: Cookies and JWT work perfectly
- 🌐 **Flexible**: Easy multi-domain support
- 📊 **Production-Ready**: Environment-based configuration

---

**Status**: ✅ Production Ready
**Security Level**: High 🔒
**Performance**: Optimized ⚡
**Last Updated**: October 18, 2025

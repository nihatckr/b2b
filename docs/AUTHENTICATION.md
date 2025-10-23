# JWT Authentication Implementation

## Overview
Real JWT authentication has been implemented using GraphQL Yoga's JWT plugin to replace the previous fake token system. This provides secure, stateless authentication with proper token verification.

## Security Improvement
**CRITICAL FIX:** Replaced insecure fake tokens (`jwt_token_for_${user.id}`) with cryptographically signed JWT tokens.

### Before (Security Vulnerability)
```typescript
return {
  token: `jwt_token_for_${user.id}`,  // ❌ No verification, anyone could forge
  user: { ... }
};
```

### After (Secure)
```typescript
const token = generateToken({
  id: user.id,
  email: user.email,
  role: user.role,
});
return { token, user: { ... } };  // ✅ Cryptographically signed
```

## JWT Configuration

### Dependencies
```json
{
  "dependencies": {
    "@graphql-yoga/plugin-jwt": "^3.9.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.8"
  }
}
```

### Server Plugin Setup
**File:** `backend/src/server.ts`

```typescript
import { useJWT, extractFromHeader, createInlineSigningKeyProvider } from '@graphql-yoga/plugin-jwt';

const yoga = createYoga({
  plugins: [
    useJWT({
      signingKeyProviders: [
        createInlineSigningKeyProvider(process.env.JWT_SECRET!)
      ],
      tokenLookupLocations: [
        extractFromHeader({ name: 'authorization', prefix: 'Bearer' })
      ],
      tokenVerification: {
        algorithms: ['HS256']
      },
      reject: {
        missingToken: false,  // Allow public queries
        invalidToken: true    // Reject invalid tokens
      }
    })
  ]
});
```

### Token Generation Helper
**File:** `backend/src/graphql/mutations/authMutation.ts`

```typescript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

function generateToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id.toString(),  // Standard JWT "subject" claim
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",          // Token expires in 7 days
      algorithm: "HS256",       // HMAC SHA-256
    }
  );
}
```

## Token Structure

### JWT Payload
```json
{
  "sub": "123",              // User ID (standard claim)
  "email": "user@example.com",
  "role": "MANUFACTURER",
  "iat": 1234567890,        // Issued At (automatic)
  "exp": 1234567890         // Expiration (automatic, +7 days)
}
```

### Token Example
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiTUFOVUZBQ1RVUkVSIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTY4NDM4MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Environment Setup

### Generate Secret Key
```bash
# Generate a secure random secret (32 bytes)
openssl rand -base64 32
```

### Configure Environment Variables
**File:** `.env`
```env
JWT_SECRET=your_generated_secret_here_32_characters_minimum
```

**File:** `.env.example`
```env
# JWT Authentication Secret (generate with: openssl rand -base64 32)
JWT_SECRET=
```

## Updated Authentication Mutations

All authentication mutations now generate real JWT tokens:

### 1. Login
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token   # Real JWT token
    user {
      id
      email
      name
      role
    }
  }
}
```

### 2. Signup
```graphql
mutation Signup($email: String!, $password: String!, $name: String, $role: String) {
  signup(email: $email, password: $password, name: $name, role: $role) {
    token   # Real JWT token
    user {
      id
      email
      name
      role
    }
  }
}
```

### 3. Register (alias for Signup)
```graphql
mutation Register($email: String!, $password: String!, $name: String, $role: String) {
  register(email: $email, password: $password, name: $name, role: $role) {
    token   # Real JWT token
    user {
      id
      email
      name
      role
    }
  }
}
```

### 4. SignupOAuth (Google/OAuth)
```graphql
mutation SignupOAuth($email: String!, $name: String!, $role: String) {
  signupOAuth(email: $email, name: $name, role: $role) {
    token   # Real JWT token
    user {
      id
      email
      name
      role
    }
  }
}
```

## Client-Side Integration

### Storage (Already Configured)
- **Location:** localStorage
- **Key:** `token`
- **Header:** `Authorization: Bearer <token>`

### Frontend Implementation
```typescript
// Login/Signup Response
const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: loginMutation,
    variables: { email, password }
  })
});

const { token, user } = await response.json();

// Store token
localStorage.setItem('token', token);

// Use token in subsequent requests
const authenticatedRequest = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ✅ Already configured
  },
  body: JSON.stringify({ query, variables })
});
```

## Token Verification (Automatic)

The JWT plugin automatically:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies signature using JWT_SECRET
3. Validates expiration (rejects expired tokens)
4. Injects payload into GraphQL context

### Context Access
```typescript
// In GraphQL resolvers
resolve: async (_root, args, context) => {
  // JWT payload automatically available in context
  const userId = context.jwt?.payload?.sub;
  const userEmail = context.jwt?.payload?.email;
  const userRole = context.jwt?.payload?.role;

  // Or access via existing user object (if populated)
  const currentUser = context.user;
}
```

## Security Features

### ✅ Implemented
- **Cryptographic Signing:** HS256 algorithm with secret key
- **Token Expiration:** 7-day automatic expiration
- **Invalid Token Rejection:** Automatically rejects tampered tokens
- **Stateless:** No server-side session storage needed
- **CSRF Protection:** Not using cookies, immune to CSRF
- **Secure Storage:** Frontend uses localStorage + Authorization header

### Token Lifecycle
1. **Issue:** User logs in → Server generates signed JWT → Client stores in localStorage
2. **Use:** Client sends JWT in Authorization header → Server verifies signature → Grants access
3. **Expire:** After 7 days, token becomes invalid → User must re-authenticate
4. **Logout:** Client deletes localStorage → Token unusable (client-side only)

## Testing

### Test Valid Token
```bash
# Login to get token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@example.com\", password: \"password\") { token user { id email role } } }"}'

# Use token in authenticated request
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{"query":"{ me { id email role } }"}'
```

### Test Invalid Token
```bash
# Should be rejected
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_here" \
  -d '{"query":"{ me { id email role } }"}'
```

### Test Expired Token
```typescript
// Manually create expired token for testing
const expiredToken = jwt.sign(
  { sub: "123", email: "test@example.com", role: "USER" },
  JWT_SECRET,
  { expiresIn: "1s" }  // Expires in 1 second
);

// Wait 2 seconds, then try to use it → Should be rejected
```

### Test Missing Token (Public Access)
```bash
# Public queries should work without token
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

## Best Practices

### ✅ DO
- Store JWT_SECRET in environment variables (never commit to git)
- Use HTTPS in production to prevent token interception
- Set reasonable expiration times (7 days for web, shorter for mobile)
- Validate token on every request (automatic with plugin)
- Include minimal necessary claims in payload (sub, email, role)
- Use standard JWT claims (`sub` for user ID, `exp` for expiration)

### ❌ DON'T
- Store JWT_SECRET in code or public repositories
- Store sensitive data in JWT payload (it's base64, not encrypted)
- Use tokens without expiration
- Allow token reuse after logout (implement token blacklist if needed)
- Use GET requests with tokens in URL (always use headers)

## Migration Notes

### Changed Files
1. **backend/src/server.ts**
   - Added JWT plugin configuration
   - Token verification automatic

2. **backend/src/graphql/mutations/authMutation.ts**
   - Added `generateToken()` helper
   - Updated: login, signup, register, signupOAuth mutations
   - Removed: All fake tokens (`jwt_token_for_${user.id}`)

3. **backend/package.json**
   - Added: @graphql-yoga/plugin-jwt, jsonwebtoken, @types/jsonwebtoken

### Frontend (No Changes Required)
- Already using localStorage + Authorization header
- Token format transparent to frontend (string)
- Same API, more secure backend

## Production Deployment

### Checklist
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Store JWT_SECRET in secure environment variables
- [ ] Enable HTTPS (required for production)
- [ ] Verify token expiration works (test with short-lived token)
- [ ] Test authentication flow (login → use token → expire → re-login)
- [ ] Monitor for invalid token attempts (implement logging if needed)
- [ ] Document token renewal strategy (for 7-day expiration)

## Troubleshooting

### "Invalid token" error
- **Cause:** Token signature doesn't match, or token is expired
- **Fix:** Generate new token via login mutation

### "JWT_SECRET is not defined"
- **Cause:** Environment variable not set
- **Fix:** Add JWT_SECRET to .env file

### Token works locally but fails in production
- **Cause:** Different JWT_SECRET in production
- **Fix:** Ensure same secret in both environments (or re-login in production)

### User not authenticated despite valid token
- **Cause:** Context not reading JWT payload correctly
- **Fix:** Check `context.jwt.payload.sub` exists and is being used

## Future Enhancements

### Optional Improvements
1. **Token Refresh:** Implement refresh tokens for seamless re-authentication
2. **Token Blacklist:** Add Redis for logout/revocation support
3. **Multi-Device:** Track tokens per device for selective logout
4. **Audit Logging:** Log all authentication attempts
5. **Rate Limiting:** Prevent brute-force login attempts

## Summary

✅ **Security vulnerability FIXED**
- Replaced fake tokens with cryptographically signed JWTs
- Automatic token verification on every request
- 7-day expiration with HS256 algorithm

✅ **Zero Breaking Changes**
- Frontend code unchanged (same localStorage + header pattern)
- Same GraphQL API surface
- Backward compatible response format

✅ **Production Ready**
- Industry-standard JWT implementation
- Stateless authentication (scalable)
- CSRF-safe (no cookies)
- TypeScript type-safe

---
**Implementation Date:** 2025
**GraphQL Yoga Version:** 5.16.0
**JWT Plugin Version:** 3.9.2

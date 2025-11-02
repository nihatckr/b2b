# Authentication System - ProtexFlow B2B

## 🔐 Overview

NextAuth.js tabanlı authentication sistemi - GraphQL backend ile entegre, URQL-ready operations.

## 📁 Dosya Yapısı

```
src/lib/auth/
├── config.ts          # NextAuth configuration (URQL-ready)
├── index.ts           # Auth exports
└── README.md          # Bu dosya

src/graphql/misc/
├── login.graphql      # Login mutation
├── signup.graphql     # Signup mutation
├── signupOAuth.graphql # OAuth signup
├── refreshToken.graphql # Token refresh
├── changePassword.graphql
├── requestPasswordReset.graphql
├── resetPassword.graphql
└── verifyEmail.graphql
```

## 🎯 GraphQL Operations

### Auto-Generated Documents

Tüm auth operations otomatik oluşturuldu ve `src/__generated__/graphql.tsx`'de type-safe hooks olarak mevcut:

```typescript
// Generated Documents
import {
  MutationLoginDocument,
  MutationSignupDocument,
  MutationSignupOAuthDocument,
  MutationRefreshTokenDocument,
  MutationChangePasswordDocument,
  MutationRequestPasswordResetDocument,
  MutationResetPasswordDocument,
  MutationVerifyEmailDocument,
} from "@/__generated__/graphql";

// Generated Hooks (URQL)
import {
  useMutation_loginMutation,
  useMutation_signupMutation,
  useMutation_signupOAuthMutation,
  useMutation_refreshTokenMutation,
  useMutation_changePasswordMutation,
  useMutation_requestPasswordResetMutation,
  useMutation_resetPasswordMutation,
  useMutation_verifyEmailMutation,
} from "@/__generated__/graphql";
```

## 🚀 Kullanım Örnekleri

### 1. Login Component (URQL)

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useMutation_loginMutation } from "@/__generated__/graphql";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Giriş başarısız");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Giriş Yap</button>
    </form>
  );
}
```

### 2. Signup Component (URQL)

```typescript
"use client";

import { useMutation_signupMutation } from "@/__generated__/graphql";
import { signIn } from "next-auth/react";

export function SignupForm() {
  const [, signup] = useMutation_signupMutation();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const result = await signup({
      input: {
        email,
        password,
        name,
      },
    });

    if (result.data?.signup) {
      // Auto-login after signup
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      });
    }

    if (result.error) {
      console.error("Signup error:", result.error);
    }
  };

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Ad Soyad" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Şifre" required />
      <button type="submit">Kayıt Ol</button>
    </form>
  );
}
```

### 3. Password Reset Flow

```typescript
"use client";

import {
  useMutation_requestPasswordResetMutation,
  useMutation_resetPasswordMutation,
} from "@/__generated__/graphql";

// Step 1: Request reset token
export function RequestPasswordReset() {
  const [, requestReset] = useMutation_requestPasswordResetMutation();

  const handleSubmit = async (email: string) => {
    const result = await requestReset({
      input: { email },
    });

    if (result.data?.requestPasswordReset) {
      alert("Reset linki email adresinize gönderildi");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.currentTarget.email.value);
      }}
    >
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Reset Linki Gönder</button>
    </form>
  );
}

// Step 2: Reset password with token
export function ResetPassword({ token }: { token: string }) {
  const [, resetPassword] = useMutation_resetPasswordMutation();

  const handleSubmit = async (newPassword: string) => {
    const result = await resetPassword({
      input: {
        token,
        newPassword,
      },
    });

    if (result.data?.resetPassword) {
      alert("Şifre başarıyla değiştirildi");
      window.location.href = "/auth/login";
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.currentTarget.password.value);
      }}
    >
      <input
        name="password"
        type="password"
        placeholder="Yeni Şifre"
        required
      />
      <button type="submit">Şifreyi Değiştir</button>
    </form>
  );
}
```

### 4. Email Verification

```typescript
"use client";

import { useMutation_verifyEmailMutation } from "@/__generated__/graphql";

export function VerifyEmail({ token }: { token: string }) {
  const [, verifyEmail] = useMutation_verifyEmailMutation();

  const handleVerify = async () => {
    const result = await verifyEmail({
      input: { token },
    });

    if (result.data?.verifyEmail) {
      alert("Email doğrulandı! Giriş yapabilirsiniz.");
      window.location.href = "/auth/login";
    }
  };

  return (
    <div>
      <button onClick={handleVerify}>Email Doğrula</button>
    </div>
  );
}
```

### 5. Change Password (Authenticated User)

```typescript
"use client";

import { useMutation_changePasswordMutation } from "@/__generated__/graphql";
import { useSession } from "next-auth/react";

export function ChangePasswordForm() {
  const { data: session } = useSession();
  const [, changePassword] = useMutation_changePasswordMutation();

  const handleSubmit = async (formData: FormData) => {
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const result = await changePassword({
      input: {
        oldPassword,
        newPassword,
      },
    });

    if (result.data?.changePassword) {
      alert("Şifre başarıyla değiştirildi");
    }

    if (result.error) {
      alert("Şifre değiştirilemedi: " + result.error.message);
    }
  };

  if (!session) return null;

  return (
    <form action={handleSubmit}>
      <input
        name="oldPassword"
        type="password"
        placeholder="Mevcut Şifre"
        required
      />
      <input
        name="newPassword"
        type="password"
        placeholder="Yeni Şifre"
        required
      />
      <button type="submit">Şifreyi Değiştir</button>
    </form>
  );
}
```

## 🔑 Session Management

### Get Current User

```typescript
"use client";

import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Yükleniyor...</div>;
  if (!session) return <div>Giriş yapınız</div>;

  return (
    <div>
      <h1>Merhaba, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
      <p>Company ID: {session.user.companyId}</p>
      <p>Permissions: {session.user.permissions?.join(", ")}</p>
    </div>
  );
}
```

### Logout

```typescript
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
      Çıkış Yap
    </button>
  );
}
```

### Protected Route (Server Component)

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
}
```

## 🛡️ Security Features

### Rate Limiting

Login attempts are rate-limited per email:

- Max 5 failed attempts
- 15 minutes cooldown after limit reached

### Token Rotation

- JWT tokens auto-refresh after 12 hours
- Backend token included in session
- Seamless renewal without re-login

### Role-Based Access Control (RBAC)

```typescript
import { useSession } from "next-auth/react";

export function AdminOnly() {
  const { data: session } = useSession();

  if (session?.user.role !== "ADMIN") {
    return <div>Yetkisiz erişim</div>;
  }

  return <div>Admin Panel</div>;
}
```

### Permission Checks

```typescript
import { useSession } from "next-auth/react";

export function DeleteUserButton({ userId }: { userId: string }) {
  const { data: session } = useSession();

  const hasPermission = session?.user.permissions?.includes("DELETE_USER");

  if (!hasPermission) return null;

  return <button>Delete User</button>;
}
```

### Department-Based Access Control

```typescript
import {
  hasDepartment,
  Department,
  isPurchasing,
  isProduction,
} from "@/lib/auth";

// Server Component - Check multiple departments
export default async function OrdersPage() {
  const hasAccess = await hasDepartment([
    Department.PURCHASING,
    Department.SALES,
    Department.MANAGEMENT,
  ]);

  if (!hasAccess) {
    return <div>Bu sayfaya erişim yetkiniz yok</div>;
  }

  return <div>Sipariş Yönetimi</div>;
}

// Server Component - Department-specific helpers
export async function PurchasingDashboard() {
  if (!(await isPurchasing())) {
    return <div>Sadece Satın Alma departmanı erişebilir</div>;
  }

  return <div>Satın Alma Dashboard</div>;
}

// Client Component - Check department in UI
("use client");
import { useSession } from "next-auth/react";
import { Department } from "@/lib/auth";

export function DepartmentBadge() {
  const { data: session } = useSession();

  if (!session?.user.department) return null;

  const departmentNames: Record<string, string> = {
    [Department.PURCHASING]: "Satın Alma",
    [Department.PRODUCTION]: "Üretim",
    [Department.QUALITY]: "Kalite Kontrol",
    [Department.DESIGN]: "Tasarım",
    [Department.SALES]: "Satış",
    [Department.MANAGEMENT]: "Yönetim",
  };

  return (
    <span className="badge">
      {departmentNames[session.user.department] || session.user.department}
    </span>
  );
}
```

## 🔄 Token Refresh Flow

NextAuth otomatik olarak token'ları yeniler:

1. **12 saat** sonra backend token refresh mutation çağrılır
2. Yeni token JWT'ye kaydedilir
3. Kullanıcı logout olmaz, session devam eder
4. Maksimum session süresi: **7 gün**

## 📝 Environment Variables

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Backend GraphQL API
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql

# OAuth Providers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## ⚠️ Error Handling

### Centralized Error Handler

Tüm auth hatalar otomatik olarak Türkçe mesajlara çevrilir:

```typescript
import { handleAuthError, formatErrorMessage, AuthErrorCode } from "@/lib/auth";

try {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    // NextAuth errors are already in Turkish
    setError(result.error);
  }
} catch (error) {
  // Handle unexpected errors
  const authError = handleAuthError(error, "login");
  setError(formatErrorMessage(authError));
}
```

### Error Types

| Error Code             | Backend Error                      | Turkish Message                                               |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `INVALID_CREDENTIALS`  | "Email veya şifre hatalı"          | "Email veya şifre hatalı"                                     |
| `AUTHENTICATION_ERROR` | "Authentication failed"            | "Kimlik doğrulama başarısız"                                  |
| `VALIDATION_ERROR`     | "Geçerli bir email adresi giriniz" | "Geçerli bir email adresi giriniz"                            |
| `NETWORK_ERROR`        | "Failed to fetch"                  | "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin." |
| `RATE_LIMIT_EXCEEDED`  | "Too many attempts"                | "Çok fazla deneme. Lütfen daha sonra tekrar deneyin."         |
| `TOKEN_EXPIRED`        | "Token expired"                    | "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın."       |

### HTTP Status Codes

NextAuth config otomatik olarak HTTP status kodlarını yönetir:

```typescript
// config.ts'de otomatik handle ediliyor:
400 → "Geçersiz istek. Lütfen bilgilerinizi kontrol edin."
401 → "Email veya şifre hatalı"
403 → "Bu işlem için yetkiniz yok"
404 → "Kullanıcı bulunamadı"
429 → "Çok fazla deneme. Lütfen daha sonra tekrar deneyin."
500 → "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
503 → "Servis geçici olarak kullanılamıyor."
```

### Error Recovery

```typescript
import { isRecoverableError, requiresReauth } from "@/lib/auth";

const authError = handleAuthError(error);

if (requiresReauth(authError)) {
  // Redirect to login
  signOut({ callbackUrl: "/auth/login" });
} else if (isRecoverableError(authError)) {
  // Show retry button
  setShowRetry(true);
}
```

### Validation Errors

```typescript
import { handleValidationError } from "@/lib/auth";

const emailError = handleValidationError("email", "invalid");
// { message: "Geçerli bir email adresi giriniz" }

const passwordError = handleValidationError("password", "min");
// { message: "Şifre en az 6 karakter uzunluğunda olmalıdır" }
```

## 🎨 Best Practices

1. ✅ **Always use URQL hooks** - Type-safe, auto-generated
2. ✅ **Server-side auth checks** - `getServerSession()` in Server Components
3. ✅ **Client-side auth checks** - `useSession()` in Client Components
4. ✅ **Error handling** - Use `handleAuthError()` for consistent Turkish messages
5. ✅ **HTTP status handling** - All status codes automatically converted to Turkish
6. ✅ **Rate limiting** - Prevent brute force attacks
7. ✅ **Email verification** - Verify user emails before full access
8. ✅ **Permission checks** - Always check permissions before sensitive operations
9. ✅ **Validation** - Use `handleValidationError()` for form validation
10. ✅ **Error recovery** - Check `isRecoverableError()` before showing retry

## 🐛 Troubleshooting

### "Session expired" Loop

**Problem**: Redirect loop after session expires

**Solution**: Check middleware.ts - should not redirect already protected pages

### Backend Token Missing

**Problem**: `session.user.backendToken` is undefined

**Solution**: Re-login - old sessions don't have backend token

### Rate Limit Not Working

**Problem**: Too many failed login attempts allowed

**Solution**: Clear rate limit cache: `resetRateLimit(email)`

## 📚 Related Docs

- [NextAuth.js Documentation](https://next-auth.js.org)
- [URQL Documentation](https://formidable.com/open-source/urql/)
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen)

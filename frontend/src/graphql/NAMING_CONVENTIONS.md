# GraphQL Naming Conventions

## 🎯 Çakışmaları Önlemek İçin Adlandırma Kuralları

### 1. **Prefix Kullanımı**

Her GraphQL dosyası için dosya bazlı prefix kullanılır:

#### **Auth Operations** (`auth.graphql`)

- Prefix: `Auth`
- Örnek: `AuthRequestPasswordReset`, `AuthVerifyEmail`

#### **Admin Operations** (`admin/users.graphql`)

- Prefix: `Admin`
- Örnek: `AdminUsers`, `AdminCreateUser`, `AdminDeleteUser`

#### **Settings Operations** (`settings.graphql`)

- Prefix: `Settings`
- Örnek: `SettingsGetCurrentUser`, `SettingsUpdateUserProfile`

#### **Dashboard Operations** (`dashboard.graphql`)

- Prefix: `Dashboard`
- Örnek: `DashboardGetMyCompany`

#### **Operations Klasörü**

- Auth: `AuthOperation` prefix
- Notifications: `Notification` prefix
- File Upload: `FileUpload` prefix
- Signup: `SignupOperation` prefix

### 2. **Adlandırma Kalıpları**

#### **Queries**

```graphql
# Pattern: [Prefix][Action][Entity]
query AdminUsers($skip: Int) { ... }
query SettingsGetCurrentUser { ... }
query DashboardGetMyCompany { ... }
```

#### **Mutations**

```graphql
# Pattern: [Prefix][Action][Entity]
mutation AdminCreateUser($email: String!) { ... }
mutation SettingsUpdateUserProfile($name: String) { ... }
mutation AuthRequestPasswordReset($email: String!) { ... }
```

#### **Subscriptions**

```graphql
# Pattern: [Prefix][Event][Entity]
subscription NotificationOnNewNotification { ... }
subscription NotificationOnTaskAssigned { ... }
```

### 3. **Dosya Organizasyonu**

```text
src/graphql/
├── auth.graphql                    # Auth: Auth* prefix
├── dashboard.graphql               # Dashboard: Dashboard* prefix
├── settings.graphql                # Settings: Settings* prefix
├── admin/
│   └── users.graphql              # Admin Users: Admin* prefix
└── operations/
    ├── auth.graphql               # AuthOperation* prefix
    ├── signup.graphql             # SignupOperation* prefix
    ├── notifications.graphql      # Notification* prefix
    └── file-upload.graphql        # FileUpload* prefix
```

### 4. **TypeScript Generated Types**

GraphQL Codegen sonrasında oluşan tipler:

```typescript
// Queries
type AdminUsersQuery = { ... }
type SettingsGetCurrentUserQuery = { ... }

// Mutations
type AdminCreateUserMutation = { ... }
type AuthRequestPasswordResetMutation = { ... }

// Subscriptions
type NotificationOnNewNotificationSubscription = { ... }
```

### 5. **Frontend Kullanımı**

```typescript
import { useQuery, useMutation } from "urql";
import {
  AdminUsersDocument,
  AdminCreateUserDocument,
  SettingsGetCurrentUserDocument,
  AuthRequestPasswordResetDocument,
} from "@/__generated__/graphql";

// Query kullanımı
const [{ data }] = useQuery({
  query: AdminUsersDocument,
  variables: { skip: 0, take: 20 },
});

// Mutation kullanımı
const [, createUser] = useMutation(AdminCreateUserDocument);
```

### 6. **Çakışma Önleme Stratejileri**

#### **✅ DOĞRU:**

```graphql
# Farklı dosyalarda aynı işlev için farklı prefix
mutation AuthRefreshToken {
  refreshToken
}
mutation AuthOperationRefreshToken {
  refreshToken
}
mutation SettingsResendVerificationEmail {
  resendVerificationEmail
}
mutation DashboardResendVerificationEmail {
  resendVerificationEmail
}
```

#### **❌ YANLIŞ:**

```graphql
# Aynı isimler çakışır
mutation RefreshToken {
  refreshToken
}
mutation RefreshToken {
  refreshToken
} # ERROR!
```

### 7. **Yeni Operation Ekleme Rehberi**

1. **Dosya seçimi:** Operation hangi sayfa/feature için?
2. **Prefix belirleme:** Dosya için tanımlanan prefix kullan
3. **İsim oluşturma:** `[Prefix][Action][Entity]` pattern'i
4. **Çakışma kontrolü:** Aynı isimde operation var mı kontrol et
5. **Codegen çalıştır:** `npm run codegen`

### 8. **Örnekler**

#### **User Management**

```graphql
# Admin panel user operations
query AdminUsers { ... }
mutation AdminCreateUser { ... }
mutation AdminUpdateUser { ... }
mutation AdminDeleteUser { ... }

# Settings user operations
query SettingsGetCurrentUser { ... }
mutation SettingsUpdateUserProfile { ... }
```

#### **Company Management**

```graphql
# Settings company operations
query SettingsGetMyCompany { ... }
mutation SettingsUpdateCompanyInfo { ... }

# Dashboard company operations
query DashboardGetMyCompany { ... }
```

#### **Authentication**

```graphql
# Auth pages
mutation AuthRequestPasswordReset { ... }
mutation AuthVerifyEmail { ... }

# Auth operations (NextAuth callbacks)
mutation AuthOperationLogin { ... }
mutation AuthOperationSignupOAuth { ... }
```

### 9. **Best Practices**

1. **Consistency:** Aynı dosya içinde tutarlı prefix kullan
2. **Clarity:** Operation ne yaptığı açık olsun
3. **Brevity:** Çok uzun isimlerden kaçın
4. **Context:** Operation hangi context'te kullanılacağı belli olsun
5. **Maintenance:** Yeni feature eklerken bu kuralları takip et

### 10. **Migration Guide**

```bash
# 1. Tüm .graphql dosyalarını güncelle
# 2. GraphQL codegen çalıştır
npm run codegen

# 3. Frontend'te import'ları güncelle
# Eski: DeleteUserDocument
# Yeni: AdminDeleteUserDocument

# 4. Hook kullanımlarını güncelle
const [, deleteUser] = useMutation(AdminDeleteUserDocument);
```

Bu convention'ları takip ederek GraphQL operation çakışmalarını tamamen önleyebiliriz! 🚀

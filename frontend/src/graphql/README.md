# GraphQL Operations

Bu klasör ProtexFlow'un frontend GraphQL operasyonlarını içerir.

## 📁 Dosya Organizasyonu

```text
src/graphql/
├── auth.graphql                    # Auth sayfaları (Auth* prefix)
├── dashboard.graphql               # Dashboard sayfası (Dashboard* prefix)
├── settings.graphql                # Settings sayfaları (Settings* prefix)
├── admin/
│   └── users.graphql              # Admin panel (Admin* prefix)
├── operations/
│   ├── auth.graphql               # NextAuth operations (AuthOperation* prefix)
│   ├── signup.graphql             # Signup operations (SignupOperation* prefix)
│   ├── notifications.graphql      # Notification operations (Notification* prefix)
│   └── file-upload.graphql        # File upload operations (FileUpload* prefix)
├── NAMING_CONVENTIONS.md          # Adlandırma kuralları guide
└── README.md                      # Bu dosya
```

## 🎯 Naming Convention

**Önemli:** Her dosya için tanımlı prefix kullanılması zorunludur. Bu çakışmaları önler:

- `auth.graphql` → `Auth*` prefix
- `admin/users.graphql` → `Admin*` prefix
- `settings.graphql` → `Settings*` prefix
- `operations/auth.graphql` → `AuthOperation*` prefix

Detaylı rehber için [`NAMING_CONVENTIONS.md`](./NAMING_CONVENTIONS.md) dosyasına bakın.

## 🔄 Workflow

1. `.graphql` dosyasında operation tanımla
2. Doğru prefix kullan (`Auth*`, `Admin*`, vb.)
3. GraphQL codegen çalıştır: `npm run codegen`
4. Generated types'ları import et: `@/__generated__/graphql`

## 📖 Örnekler

### Query

```graphql
query AdminUsers($skip: Int, $take: Int) {
  users(skip: $skip, take: $take) {
    id
    email
    name
  }
}
```

### Mutation

```graphql
mutation AdminCreateUser($email: String!, $name: String) {
  createUser(email: $email, name: $name) {
    id
    email
  }
}
```

### TypeScript Usage

```typescript
import { useQuery, useMutation } from "urql";
import {
  AdminUsersDocument,
  AdminCreateUserDocument,
} from "@/__generated__/graphql";

// Query
const [{ data }] = useQuery({
  query: AdminUsersDocument,
  variables: { skip: 0, take: 20 },
});

// Mutation
const [, createUser] = useMutation(AdminCreateUserDocument);
```

## 🚀 Development

GraphQL schema değişikliklerinden sonra her zaman codegen çalıştır:

```bash
npm run codegen
```

Bu komut `@/__generated__/graphql` klasöründeki TypeScript types'ları günceller.

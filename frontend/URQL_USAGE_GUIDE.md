# URQL Modern Setup - Kullanım Rehberi

Backend'inizde **Relay Nodes** ve **DataLoader** optimizasyonları var. Frontend'i buna göre güncelledik.

## 📦 Kurulum Bilgileri

✅ **Yüklü Paketler:**
- `urql@5.0.1` - Modern GraphQL client
- `next@15.5.6` - App Router support
- `next-auth@4.24.11` - Authentication

## 🚀 Temel Kullanım

### 1. Query Örneği (useQuery)

```tsx
'use client';

import { useQuery } from '@/hooks/useGraphQL';
import { graphql } from '@/__generated__/graphql';

// GraphQL query (GraphQL Codegen ile type-safe)
const GetUserQuery = graphql(`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      name
      email
      company {
        id
        name
      }
    }
  }
`);

export function UserProfile({ userId }: { userId: number }) {
  const [result, reexecuteQuery] = useQuery({
    query: GetUserQuery,
    variables: { id: userId },

    // Request Policy (opsiyonel)
    requestPolicy: 'cache-first', // default
  });

  const { data, fetching, error } = result;

  if (fetching) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;

  return (
    <div>
      <h1>{data?.user?.name}</h1>
      <p>{data?.user?.email}</p>
      <p>Şirket: {data?.user?.company?.name}</p>

      {/* Manuel refresh */}
      <button onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })}>
        Yenile
      </button>
    </div>
  );
}
```

### 2. Mutation Örneği (useMutation)

```tsx
'use client';

import { useMutation } from '@/hooks/useGraphQL';
import { graphql } from '@/__generated__/graphql';
import { useState } from 'react';

const UpdateUserMutation = graphql(`
  mutation UpdateUser($id: Int!, $name: String!) {
    updateUser(id: $id, name: $name) {
      id
      name
      updatedAt
    }
  }
`);

export function UpdateUserForm({ userId }: { userId: number }) {
  const [name, setName] = useState('');
  const [result, executeMutation] = useMutation(UpdateUserMutation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await executeMutation({
      id: userId,
      name,
    });

    if (result.data) {
      alert('Güncellendi!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Yeni isim"
      />
      <button type="submit" disabled={result.fetching}>
        {result.fetching ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
      {result.error && <p>Hata: {result.error.message}</p>}
    </form>
  );
}
```

### 3. Optimistic Update (UI Hızlandırma)

```tsx
const [result, executeMutation] = useMutation(UpdateUserMutation);

const handleUpdate = async () => {
  await executeMutation(
    { id: 1, name: "Yeni İsim" },
    {
      // UI'da hemen görünsün (backend'den cevap beklemeden)
      optimistic: {
        __typename: 'User',
        id: 1,
        name: "Yeni İsim",
        updatedAt: new Date().toISOString(),
      }
    }
  );
};
```

### 4. Conditional Query (Pause)

```tsx
const [userId, setUserId] = useState<number | null>(null);

const [result] = useQuery({
  query: GetUserQuery,
  variables: { id: userId! },

  // userId yoksa query çalışmasın
  pause: userId === null,
});

// userId set edilince query otomatik çalışır
```

### 5. Real-Time Data (Cache-and-Network)

```tsx
// Cache'ten hemen göster + arka planda güncelle
const [result] = useQuery({
  query: GetDashboardQuery,
  requestPolicy: 'cache-and-network', // Real-time için ideal
});

// Her 5 saniyede bir güncelle
useEffect(() => {
  const interval = setInterval(() => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  }, 5000);

  return () => clearInterval(interval);
}, [reexecuteQuery]);
```

## 📊 Request Policy Rehberi

| Policy | Davranış | Kullanım |
|--------|----------|----------|
| `cache-first` | Önce cache, yoksa network | ✅ Default (önerilen) |
| `cache-and-network` | Cache + arka planda güncelle | Real-time UI |
| `network-only` | Her zaman network | Fresh data gerekli |
| `cache-only` | Sadece cache | Offline mode |

## 🔄 Cache Yönetimi

```tsx
import { useClient } from 'urql';

function MyComponent() {
  const client = useClient();

  // Tüm cache'i temizle
  const clearCache = () => {
    client.reexecuteOperation(client.createRequestOperation(
      'mutation',
      { key: Date.now(), query: '', variables: {} }
    ));
  };

  // Belirli query'yi yenile
  const refreshQuery = () => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  return (
    <button onClick={clearCache}>Cache Temizle</button>
  );
}
```

## 🎯 Backend Integration

Backend'inizde şu optimizasyonlar aktif:

### Relay Nodes (Global ID)
```graphql
query GetNodeById {
  node(id: "VXNlcjox") {  # Base64 encoded "User:1"
    ... on User {
      name
      email
    }
  }
}
```

### Relay Connections (Pagination)
```graphql
query GetCompanyEmployees {
  company(id: 1) {
    employeesConnection(first: 20, after: "cursor123") {
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
}
```

### DataLoader (Otomatik Batching)
Backend otomatik olarak N+1 query'leri birleştiriyor:
```graphql
# Bu query'ler backend'de tek SQL sorgusuna dönüşür
query GetMultipleUsers {
  user1: user(id: 1) { name }
  user2: user(id: 2) { name }
  user3: user(id: 3) { name }
}
```

## 🛠️ Developer Tools

### Chrome Extension
[URQL DevTools](https://chrome.google.com/webstore/detail/urql-devtools) - Cache'i görselleştir

### Debug Mode
```tsx
import { devtoolsExchange } from '@urql/devtools';

// development'ta devtools ekle
const exchanges = [
  devtoolsExchange,
  cacheExchange,
  fetchExchange
];
```

## 📚 İleri Seviye

### Error Handling
```tsx
const [result] = useQuery({ query: MyQuery });

if (result.error) {
  // GraphQL errors
  if (result.error.graphQLErrors) {
    result.error.graphQLErrors.forEach(err => {
      console.error('GraphQL Error:', err.message);
    });
  }

  // Network errors
  if (result.error.networkError) {
    console.error('Network Error:', result.error.networkError);
  }
}
```

### Loading States
```tsx
const [result] = useQuery({ query: MyQuery });

// İlk yükleme
if (result.fetching && !result.data) {
  return <Skeleton />;
}

// Arka planda güncelleme (data var ama refetch ediliyor)
if (result.fetching && result.data) {
  return (
    <>
      <RefreshIndicator />
      <DataDisplay data={result.data} />
    </>
  );
}
```

## 🚨 Sık Karşılaşılan Hatalar

### 1. "No client provided"
✅ **Çözüm:** `GraphQLProvider` içinde kullan

### 2. Query çalışmıyor
✅ **Çözüm:** `pause: false` olduğundan emin ol

### 3. Cache güncellenmiyor
✅ **Çözüm:** `requestPolicy: 'network-only'` ile zorla

### 4. Auth hatası (401)
✅ **Çözüm:** NextAuth session'ı kontrol et

## 📖 Kaynaklar

- [URQL Docs](https://formidable.com/open-source/urql/docs/)
- [React/Preact Guide](https://formidable.com/open-source/urql/docs/basics/react-preact/)
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen)
- Backend Docs: `/server/HOW_TO_ADD_NEW_FEATURES.md`

## ✨ Next Steps

1. ✅ URQL setup tamamlandı
2. ⏳ Normalized cache eklenebilir (`@urql/exchange-graphcache`)
3. ⏳ Subscriptions aktifleştirilir (WebSocket)
4. ⏳ Offline mode (`@urql/offline-exchange`)

---

**Not:** Bu setup Next.js 15 + React 19 ile tam uyumlu. SSR exchange aktif, NextAuth ile entegre, cache-first strategy ile optimize edilmiş.

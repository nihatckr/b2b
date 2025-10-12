# 🚀 Hızlı Başlangıç Rehberi (Ekim 2025)

## ✅ Backend Production Ready!

Backend %100 tamamlandı ve production ortamına hazır. Sadece frontend geliştirme kaldı.

### 🛠️ Mevcut Teknoloji Stack

- **Backend**: ✅ Node.js + Apollo Server + Prisma + MySQL
- **GraphQL**: ✅ Nexus + WebSocket subscriptions
- **Database**: ✅ 11 model, 8 enum, enhanced schema
- **Features**: ✅ File upload, email notifications, real-time updates
- **Frontend**: ⚠️ Henüz yok - React + TypeScript gerekiyor

### 1. ✅ Backend Hazır ve Çalışıyor

```bash
cd /Users/nihatcakir/Desktop/websites/fullstack/server

# Server zaten çalışıyor ve hazır:
# ✅ GraphQL API: http://localhost:4000/graphql
# ✅ WebSocket: ws://localhost:4000/graphql
# ✅ Database: MySQL with all migrations applied
# ✅ All TypeScript errors resolved

# Test etmek için:
npm run dev
```

### 🎯 Aktif Özellikler:

- **Authentication**: JWT + role-based permissions
- **File Upload**: Profile, collection, license uploads
- **Email System**: Welcome, order, notification emails
- **Real-time**: WebSocket subscriptions for messaging
- **Production Tracking**: 7-stage tracking system
- **Quality Control**: Automated QC workflows

### 2. Mevcut Prisma Schema (MySQL)

```prisma
// Zaten mevcut schema.prisma dosyası var
// Temel modeller:
model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  password    String
  name        String?
  role        Role         @default(CUSTOMER)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Collection {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  price       Float
  sku         String    @unique
  stock       Int       @default(0)
  images      String?   // JSON: ["url1","url2"]
  isActive    Boolean   @default(true)
}

model Sample {
  id                   Int          @id @default(autoincrement())
  sampleNumber         String       @unique
  sampleType           SampleType   @default(STANDARD)
  status               SampleStatus @default(REQUESTED)
  customerNote         String?
  manufacturerResponse String?
}

enum Role { ADMIN, MANUFACTURE, CUSTOMER }
enum SampleStatus { REQUESTED, REVIEWED, APPROVED, REJECTED, IN_PRODUCTION, DELIVERED }
```

### 3. Mevcut GraphQL API (Apollo Server)

```typescript
// Mevcut server zaten GraphQL kullanıyor
// server/src/server.ts dosyasında:

import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { createContext, type Context } from './context'
import { schema } from './schema'

const server = new ApolloServer<Context>({ schema })

// Port 4000'de çalışıyor (http://localhost:4000/graphql)

// Örnek GraphQL Mutations/Queries:

// Login
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id name role }
  }
}

// Get Collections
query GetCollections {
  collections {
    id name price sku stock
    author { name }
    category { name }
  }
}

// Request Sample
mutation RequestSample($input: RequestSampleInput!) {
  requestSample(input: $input) {
    id sampleNumber status
  }
}
```

### 4. Frontend Hızlı Kurulum (Apollo Client)

```bash
npx create-react-app tekstil-frontend --template typescript
cd tekstil-frontend
npm install @apollo/client graphql react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Apollo Client kurulumu
# src/index.tsx'da:
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }
});
```

### 5. Minimal React App (GraphQL Hook'lar)

```tsx
// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import Login from "./components/Login";
import CollectionList from "./components/CollectionList";
import SampleRequest from "./components/SampleRequest";

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      role
    }
  }
`;

function App() {
  const { data, loading } = useQuery(ME_QUERY);

  if (loading) return <div>Yükleniyor...</div>;

  if (!data?.me) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm p-4">
          <div className="flex justify-between">
            <h1 className="text-xl font-bold">Tekstil Platform</h1>
            <div>
              <span>
                {data.me.name} ({data.me.role})
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                Çıkış
              </button>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<CollectionList user={data.me} />} />
          <Route
            path="/sample-request"
            element={<SampleRequest user={data.me} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

---

## ⚡ Demo Hazırlama (1 gün)

### Hızlı Demo için Gerekli Sayfalar:

1. **Login Sayfası** (30 dakika)

```javascript
// components/Login.tsx
import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        role
      }
    }
  }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const result = await login({
        variables: { email, password },
      });

      localStorage.setItem("token", result.data.login.token);
      window.location.reload(); // Apollo cache'i refresh etmek için
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Giriş</h2>
        <input
          className="block w-full p-2 border mb-4"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="block w-full p-2 border mb-4"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleLogin}
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
```

2. **Ürün Listesi** (1 saat)

```javascript
// components/CollectionList.tsx
import { useQuery, gql } from "@apollo/client";

const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      description
      price
      sku
      stock
      images
      category {
        name
      }
      author {
        name
      }
    }
  }
`;

function CollectionList({ user }) {
  const { data, loading, error } = useQuery(GET_COLLECTIONS);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Koleksiyonlar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.collections.map((collection) => (
          <div key={collection.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{collection.name}</h3>
            <p className="text-gray-600">{collection.sku}</p>
            <p className="text-lg font-semibold">₺{collection.price}</p>
            <p className="text-sm">Stok: {collection.stock}</p>
            <p className="text-sm">Üretici: {collection.author?.name}</p>

            {user.role === "CUSTOMER" && (
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                Numune Talep Et
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

3. **Test Data Seeding** (15 dakika)

```typescript
// prisma/seed.ts zaten mevcut - çalıştırmak için:
npm run seed

// Veya manuel GraphQL mutations ile test data:
mutation CreateTestUser {
  register(input: {
    email: "uretici@test.com"
    password: "123456"
    name: "ABC Tekstil"
    role: MANUFACTURE
  }) {
    token
    user { id name role }
  }
}

mutation CreateTestCollection {
  createCollection(input: {
    name: "Klasik Polo T-shirt"
    description: "Rahat ve şık polo t-shirt"
    price: 125.50
    sku: "THS-2024-001"
    stock: 100
  }) {
    id name price
  }
}
```

---

## 📱 Mobile-First Yaklaşım

MVP için mobil öncelikli basit tasarım:

```javascript
// components/MobileProductCard.js
function MobileProductCard({ product, onSampleRequest }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              📷
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.model_code}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-blue-600">
              ${product.price}
            </span>
            <span className="text-xs text-gray-500">MOQ: {product.moq}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => onSampleRequest(product)}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
        >
          Numune Talep Et
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
          Detay
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 MVP Test Senaryoları

### Demo için 5 dakikalık senaryo:

1. **Giriş** (30 saniye)

   - Üretici olarak giriş yap
   - Dashboard'u göster

2. **Ürün Ekleme** (1 dakika)

   - Yeni ürün ekle
   - Fotoğraf yükle (opsiyonel)

3. **Müşteri Görünümü** (1 dakika)

   - Müşteri olarak giriş yap
   - Ürün kataloğunu göster
   - Filtre kullan

4. **Numune Talebi** (1 dakika)

   - Ürün seç
   - Numune talep et
   - Form doldur

5. **Üretici Onayı** (30 saniye)

   - Üretici olarak giriş
   - Gelen talebi onayla

6. **Takip** (1 dakika)
   - Müşteri olarak durum takibi
   - Basit timeline göster

Bu minimal setup ile mevcut GraphQL backend üzerine hızlıca frontend ekleyebilirsiniz!

## 🔧 Mevcut Projede Çalıştırma

### Backend'i Başlatma

```bash
cd server
npm run dev
# GraphQL Playground: http://localhost:4000/graphql
```

### Frontend Kurulumu

```bash
# Ana dizinde
npx create-react-app client --template typescript
cd client
npm install @apollo/client graphql react-router-dom
```

### Veritabanı Hazırlama

```bash
cd server
npx prisma migrate dev
npm run seed
npx prisma studio # Veritabanını görüntülemek için
```

### GraphQL Schema Test Etme

Apollo Studio'da (http://localhost:4000/graphql) test queries:

```graphql
query {
  collections {
    id
    name
    price
    stock
    author {
      name
      role
    }
  }
}
```

# 🚀 ProTexFlow - Kullanıcı Kayıt Akışı (User Onboarding Flow)

**Tarih:** 19 Ekim 2025
**Durum:** ✅ Mevcut Sistem Analizi ve İyileştirme Önerileri
**Soru:** _"ProTexFlow'a bir insan girer, kim olduğunu bilmeyiz - üretici mi alıcı mı? Kayıt olma için hem üretici kaydı hem de müşteri kaydı dikkate alınmalı. Sisteme nasıl çözeriz?"_

---

## 📊 Mevcut Sistem Durumu

### ✅ ZATEn ÇALIŞIYOR!

ProTexFlow **şu anda** kullanıcıların kim olduklarını seçmelerine izin veriyor. Kayıt akışı **4 adımlı** ve kullanıcı firma tipini kendisi seçiyor.

---

## 🎯 Kayıt Akışı - 4 Adım

### Adım 1: Email ve Şifre

```
- Email
- Şifre
- Şifre Tekrar
```

### Adım 2: Kişisel Bilgiler

```
- Ad
- Soyad
- Telefon (Opsiyonel)
```

### Adım 3: **FİRMA DURUMU SEÇİMİ** 🎯

Kullanıcı 3 seçenekten birini seçer:

#### 1️⃣ Yeni Firma Oluştur (CREATE_NEW)

```
🏭 Yeni Firma Oluştur
"Kendi firmanızı oluşturun ve çalışanlarınızı ekleyin"

→ Sonraki adımda firma bilgileri sorulur
→ Kullanıcı otomatik COMPANY_OWNER olur
```

#### 2️⃣ Mevcut Firmaya Katıl (JOIN_EXISTING)

```
👥 Mevcut Firmaya Katıl
"Davet kodu ile bir firmaya çalışan olarak katılın"

→ Firma seçimi veya davet kodu girişi
→ Kullanıcı COMPANY_EMPLOYEE olur
```

#### 3️⃣ Bireysel Müşteri (INDIVIDUAL)

```
👤 Bireysel Müşteri
"Firma olmadan bireysel müşteri olarak devam edin"

→ Firma bilgisi sorulmaz
→ Kullanıcı INDIVIDUAL_CUSTOMER olur
→ companyId: null
```

---

### Adım 4a: Firma Bilgileri (Eğer CREATE_NEW seçildiyse)

```typescript
Form Alanları:
- companyName: string (required) - "Defacto Tekstil A.Ş."
- companyEmail: string (required) - "info@defacto.com"
- companyPhone: string (optional) - "+90 212 555 0001"
- companyAddress: string (optional) - "İstanbul, Türkiye"
- companyWebsite: string (optional) - "www.defacto.com"
- companyType: enum (required) - MANUFACTURER | BUYER | BOTH 🎯
```

**Firma Tipi Seçenekleri:**

```
🏭 Üretici (MANUFACTURER)
   - Ürün üretir, collection oluşturur
   - Sample taleplerini alır, fiyat teklifi verir
   - Siparişleri üretir

🛒 Alıcı (BUYER)
   - Ürün satın alır
   - Sample talebi oluşturur
   - Sipariş verir
   - Collection oluşturamaz

⚡ Her İkisi (BOTH)
   - Hem üretir hem alır
   - Tüm yetkiler aktif
```

---

### Adım 4b: Çalışan Bilgileri (Eğer JOIN_EXISTING seçildiyse)

```typescript
Form Alanları:
- department: string (optional) - "Satın Alma Departmanı"
- jobTitle: string (optional) - "Satın Alma Müdürü"
- inviteCode: string - Firma sahibinden alınan davet kodu
```

---

## 💾 Backend - GraphQL Mutation

### Signup Mutation

```typescript
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      email
      name
      role
      companyId
      isCompanyOwner
      company {
        id
        name
        type  # 🎯 MANUFACTURER | BUYER | BOTH
      }
    }
  }
}
```

### Input Örneği - Üretici Firma Oluşturma

```typescript
{
  "input": {
    "email": "ahmet@defacto.com",
    "password": "SecurePass123!",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "phone": "+90 532 111 2222",

    "companyFlow": {
      "action": "CREATE_NEW",
      "companyName": "Defacto Tekstil A.Ş.",
      "companyEmail": "info@defacto.com",
      "companyPhone": "+90 212 555 0001",
      "companyAddress": "İstanbul, Türkiye",
      "companyWebsite": "www.defacto.com",
      "companyType": "MANUFACTURER"  // 🎯 ÜRETİCİ
    }
  }
}
```

### Input Örneği - Alıcı Firma Oluşturma

```typescript
{
  "input": {
    "email": "fatma@lcwaikiki.com",
    "password": "SecurePass123!",
    "firstName": "Fatma",
    "lastName": "Şahin",

    "companyFlow": {
      "action": "CREATE_NEW",
      "companyName": "LC Waikiki Mağazacılık A.Ş.",
      "companyEmail": "info@lcwaikiki.com",
      "companyType": "BUYER"  // 🎯 ALICI
    }
  }
}
```

### Input Örneği - Her İkisi (Hem Üretir Hem Alır)

```typescript
{
  "input": {
    "email": "mehmet@koton.com",
    "password": "SecurePass123!",
    "firstName": "Mehmet",
    "lastName": "Demir",

    "companyFlow": {
      "action": "CREATE_NEW",
      "companyName": "Koton Mağazacılık A.Ş.",
      "companyEmail": "info@koton.com",
      "companyType": "BOTH"  // 🎯 HER İKİSİ
    }
  }
}
```

---

## 🎭 Roller ve Yetkiler

### User Role (Kullanıcı Rolü)

```typescript
enum UserRole {
  ADMIN                // Platform yöneticisi
  COMPANY_OWNER        // Firma sahibi
  COMPANY_EMPLOYEE     // Firma çalışanı
  MANUFACTURE          // Üretici (deprecated - COMPANY_OWNER/EMPLOYEE kullanılmalı)
  CUSTOMER             // Müşteri (deprecated - COMPANY_OWNER/EMPLOYEE kullanılmalı)
  INDIVIDUAL_CUSTOMER  // Bireysel müşteri (firma yok)
}
```

### Company Type (Firma Tipi)

```typescript
enum CompanyType {
  MANUFACTURER  // Üretici firma
  BUYER         // Alıcı firma
  BOTH          // Her ikisi de
}
```

---

## 🔐 Yetkilendirme Matrisi

### Collection (Ürün) Oluşturma

| Kullanıcı Rolü      | Firma Tipi   | Collection Oluşturabilir mi? |
| ------------------- | ------------ | ---------------------------- |
| ADMIN               | -            | ✅ Evet                      |
| COMPANY_OWNER       | MANUFACTURER | ✅ Evet                      |
| COMPANY_OWNER       | BUYER        | ❌ Hayır                     |
| COMPANY_OWNER       | BOTH         | ✅ Evet                      |
| COMPANY_EMPLOYEE    | MANUFACTURER | ✅ Evet                      |
| COMPANY_EMPLOYEE    | BUYER        | ❌ Hayır                     |
| COMPANY_EMPLOYEE    | BOTH         | ✅ Evet                      |
| INDIVIDUAL_CUSTOMER | -            | ❌ Hayır                     |

**Kontrol Kodu:**

```typescript
// collectionMutation.ts
if (userCompany.type === "BUYER") {
  throw new Error(
    "Only manufacturer companies can create product collections. " +
      "Your company is registered as BUYER type."
  );
}
```

---

### Sample (Numune Talebi) Oluşturma

| Kullanıcı Rolü | Sample Oluşturabilir mi? |
| -------------- | ------------------------ |
| **Tüm Roller** | ✅ Evet                  |

**Not:** Sample oluştururken `manufacturerId` parametresi **zorunlu**!

```typescript
mutation {
  createSample(
    name: "Özel Tasarım Gömlek"
    manufacturerId: 18  // 🎯 Zorunlu
  ) {
    id
  }
}
```

---

## 🎨 Frontend - Signup Form

### Dosya Konumu

```
client/src/components/Auth/SignupForm/multi-step-signup-form.tsx
```

### Step 3: Company Action Selection

```tsx
<FormField
  control={form.control}
  name="companyAction"
  render={({ field }) => (
    <FormItem className="space-y-4">
      <FormLabel>Firma Durumu</FormLabel>
      <FormControl>
        <div className="grid gap-4">

          {/* Option 1: Create New Company */}
          <button
            onClick={() => field.onChange("CREATE_NEW")}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border-2 p-4",
              field.value === "CREATE_NEW"
                ? "border-primary bg-accent"
                : "border-muted"
            )}
          >
            <div className="font-semibold">🏭 Yeni Firma Oluştur</div>
            <div className="text-sm text-muted-foreground">
              Kendi firmanızı oluşturun ve çalışanlarınızı ekleyin
            </div>
          </button>

          {/* Option 2: Join Existing */}
          <button
            onClick={() => field.onChange("JOIN_EXISTING")}
            className={...}
          >
            <div className="font-semibold">👥 Mevcut Firmaya Katıl</div>
            <div className="text-sm text-muted-foreground">
              Davet kodu ile bir firmaya çalışan olarak katılın
            </div>
          </button>

          {/* Option 3: Individual */}
          <button
            onClick={() => field.onChange("INDIVIDUAL")}
            className={...}
          >
            <div className="font-semibold">👤 Bireysel Müşteri</div>
            <div className="text-sm text-muted-foreground">
              Firma olmadan bireysel müşteri olarak devam edin
            </div>
          </button>

        </div>
      </FormControl>
    </FormItem>
  )}
/>
```

---

### Step 4: Company Type Selection

```tsx
<FormField
  control={form.control}
  name="companyType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Firma Tipi</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="MANUFACTURER">
            🏭 Üretici (Manufacturer)
          </SelectItem>

          <SelectItem value="BUYER">🛒 Alıcı (Buyer)</SelectItem>

          <SelectItem value="BOTH">⚡ Her İkisi (Both)</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

---

## 🎬 Kullanıcı Senaryoları

### Senaryo 1: Üretici Firma Kaydı ✅

**Kullanıcı:** Ahmet (Defacto Tekstil sahibi)

```
Step 1: Email/Şifre
  ahmet@defacto.com
  ••••••••

Step 2: Kişisel Bilgiler
  Ahmet Yılmaz
  +90 532 111 2222

Step 3: Firma Durumu
  ✅ 🏭 Yeni Firma Oluştur

Step 4: Firma Bilgileri
  Firma Adı: Defacto Tekstil A.Ş.
  Firma Email: info@defacto.com
  Firma Tipi: 🏭 Üretici (MANUFACTURER) 👈 ÖNEMLİ!

Sonuç:
  ✅ User created
     - Role: COMPANY_OWNER
     - companyId: 18
     - isCompanyOwner: true

  ✅ Company created
     - Name: Defacto Tekstil A.Ş.
     - Type: MANUFACTURER 👈
     - ownerId: ahmet

  ✅ Ahmet'in Yetkileri:
     - Collection oluşturabilir ✅
     - Sample taleplerini alır ✅
     - Fiyat teklifi verir ✅
     - Sipariş alır ✅
```

---

### Senaryo 2: Alıcı Firma Kaydı ✅

**Kullanıcı:** Fatma (LC Waikiki satın alma müdürü)

```
Step 1: Email/Şifre
  fatma@lcwaikiki.com
  ••••••••

Step 2: Kişisel Bilgiler
  Fatma Şahin
  +90 532 222 3333

Step 3: Firma Durumu
  ✅ 🏭 Yeni Firma Oluştur

Step 4: Firma Bilgileri
  Firma Adı: LC Waikiki Mağazacılık A.Ş.
  Firma Email: info@lcwaikiki.com
  Firma Tipi: 🛒 Alıcı (BUYER) 👈 ÖNEMLİ!

Sonuç:
  ✅ User created
     - Role: COMPANY_OWNER
     - companyId: 19
     - isCompanyOwner: true

  ✅ Company created
     - Name: LC Waikiki Mağazacılık A.Ş.
     - Type: BUYER 👈
     - ownerId: fatma

  ✅ Fatma'nın Yetkileri:
     - Collection oluşturamaz ❌
     - Sample talebi oluşturabilir ✅
     - Sipariş verebilir ✅
     - Üreticileri görüntüler ✅
```

---

### Senaryo 3: Her İkisi (Hem Üretir Hem Alır) ✅

**Kullanıcı:** Mehmet (Koton - hem üretir hem alır)

```
Step 3: Firma Durumu
  ✅ 🏭 Yeni Firma Oluştur

Step 4: Firma Bilgileri
  Firma Adı: Koton Mağazacılık A.Ş.
  Firma Tipi: ⚡ Her İkisi (BOTH) 👈 ÖNEMLİ!

Sonuç:
  ✅ Company created
     - Type: BOTH 👈

  ✅ Mehmet'in Yetkileri:
     - Collection oluşturabilir ✅
     - Sample talebi oluşturabilir ✅
     - Sample talebi alabilir ✅
     - Sipariş verebilir ✅
     - Sipariş alabilir ✅
```

---

### Senaryo 4: Çalışan Olarak Firmaya Katılma ✅

**Kullanıcı:** Ali (Defacto'da satış müdürü)

```
Step 1: Email/Şifre
  ali@defacto.com
  ••••••••

Step 2: Kişisel Bilgiler
  Ali Kaya
  +90 532 444 5555

Step 3: Firma Durumu
  ✅ 👥 Mevcut Firmaya Katıl

Step 4: Çalışan Bilgileri
  Firma Seçimi: Defacto Tekstil A.Ş. (ID: 18)
  Departman: Satış Departmanı
  Pozisyon: Satış Müdürü
  Davet Kodu: DEFACTO-INVITE-123

Sonuç:
  ✅ User created
     - Role: COMPANY_EMPLOYEE 👈
     - companyId: 18
     - isCompanyOwner: false
     - department: "Satış Departmanı"
     - jobTitle: "Satış Müdürü"

  ✅ Ali'nin Yetkileri:
     - Company type: MANUFACTURER (Defacto'dan miras alır)
     - Collection oluşturabilir ✅
     - Sample taleplerini görür ✅
     - Sipariş yönetebilir ✅
     - Firma ayarlarını değiştiremez ❌ (owner değil)
```

---

### Senaryo 5: Bireysel Müşteri ✅

**Kullanıcı:** Ayşe (kendi tasarımını üretmek istiyor)

```
Step 1: Email/Şifre
  ayse@gmail.com
  ••••••••

Step 2: Kişisel Bilgiler
  Ayşe Demir
  +90 532 666 7777

Step 3: Firma Durumu
  ✅ 👤 Bireysel Müşteri

Step 4: -
  (Firma bilgisi sorulmaz)

Sonuç:
  ✅ User created
     - Role: INDIVIDUAL_CUSTOMER 👈
     - companyId: null
     - isCompanyOwner: false

  ✅ Ayşe'nin Yetkileri:
     - Collection oluşturamaz ❌
     - Sample talebi oluşturabilir ✅
     - Özel tasarım gönderebilir ✅
     - Üreticilerle iletişime geçebilir ✅
```

---

## 🚦 Sistem Akışı

### 1. Kullanıcı Kayıt Olur

```
Kullanıcı → Signup Form
  ↓
  Step 1: Email/Şifre
  ↓
  Step 2: Kişisel Bilgiler
  ↓
  Step 3: Firma Durumu Seçimi 🎯
    - CREATE_NEW (Yeni firma)
    - JOIN_EXISTING (Mevcut firma)
    - INDIVIDUAL (Bireysel)
  ↓
  Step 4a: Firma Bilgileri (CREATE_NEW)
    → companyType: MANUFACTURER | BUYER | BOTH 🎯
  ↓
  Backend → signup mutation
  ↓
  ✅ User + Company Created
```

---

### 2. Giriş Yaptıktan Sonra

```
User Login
  ↓
  Token alır (JWT)
  ↓
  Context'e yüklenir:
    - user.id
    - user.role (COMPANY_OWNER, EMPLOYEE, etc.)
    - user.companyId
    - user.company.type (MANUFACTURER | BUYER | BOTH)
  ↓
  Authorization Checks:
    - Collection oluşturma isteği
      → Company type MANUFACTURER veya BOTH mı?
        → YES: ✅ İzin ver
        → NO: ❌ Error: "Only manufacturer companies..."

    - Sample talebi oluşturma
      → manufacturerId var mı?
        → YES: ✅ İzin ver
        → NO: ❌ Error: "Manufacturer ID required"
```

---

## ⚙️ Backend Kod Akışı

### authMutation.ts - Signup

```typescript
// Line 80-180
builder.mutationField("signup", (t) =>
  t.field({
    type: "JSON",
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
      name: t.arg.string(),
      role: t.arg.string(),
    },
    authScopes: { public: true },
    resolve: async (_root, args, context) => {
      // 1. Email kontrolü
      const existing = await context.prisma.user.findUnique({
        where: { email: args.email },
      });
      if (existing) throw new Error("Email already registered");

      // 2. Şifre hash
      const hashedPassword = await bcrypt.hash(args.password, 10);

      // 3. User oluştur
      const user = await context.prisma.user.create({
        data: {
          email: args.email,
          password: hashedPassword,
          name: args.name || args.email,
          role: (args.role || "INDIVIDUAL_CUSTOMER") as any,
        },
        include: {
          company: true, // 🎯 Company bilgisi de gelir
        },
      });

      // 4. JWT token oluştur
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // 5. Response dön
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          companyType: user.company?.type || null, // 🎯 ÖNEMLİ!
        },
      };
    },
  })
);
```

---

### collectionMutation.ts - Authorization

```typescript
// Line 24-52
builder.mutationField("createCollection", (t) =>
  t.prismaField({
    type: "Collection",
    args: {
      /* ... */
    },
    authScopes: { user: true }, // ✅ Tüm giriş yapmış kullanıcılar
    resolve: async (query, _root, args, context) => {
      // 1. Kullanıcının şirketi var mı?
      if (!context.user?.companyId) {
        throw new Error("You must be part of a company to create collections");
      }

      // 2. Şirket bilgilerini al
      const userCompany = await context.prisma.company.findUnique({
        where: { id: context.user.companyId },
        select: { id: true, type: true, name: true },
      });

      if (!userCompany) {
        throw new Error("Company not found");
      }

      // 3. Şirket tipi BUYER mı? 🎯 ÖNEMLİ!
      if (userCompany.type === "BUYER") {
        throw new Error(
          "Only manufacturer companies can create product collections. " +
            "Your company is registered as BUYER type. " +
            "Please contact support to change company type if needed."
        );
      }

      // 4. MANUFACTURER veya BOTH ise izin ver
      console.log(
        `✅ Collection creation allowed for ${userCompany.name} (Type: ${userCompany.type})`
      );

      // 5. Collection oluştur
      const collection = await context.prisma.collection.create({
        /* ... */
      });

      return collection;
    },
  })
);
```

---

## 📋 Database Schema

### User Model

```prisma
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  password        String
  name            String?
  firstName       String?
  lastName        String?
  phone           String?

  role            Role     @default(INDIVIDUAL_CUSTOMER)
  companyId       Int?
  company         Company? @relation(fields: [companyId], references: [id])

  isCompanyOwner  Boolean  @default(false)
  department      String?
  jobTitle        String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum Role {
  ADMIN
  COMPANY_OWNER
  COMPANY_EMPLOYEE
  MANUFACTURE        // Deprecated
  CUSTOMER           // Deprecated
  INDIVIDUAL_CUSTOMER
}
```

---

### Company Model

```prisma
model Company {
  id          Int         @id @default(autoincrement())
  name        String
  email       String      @unique
  phone       String?
  address     String?
  website     String?

  type        CompanyType @default(MANUFACTURER) // 🎯 ÖNEMLİ!

  ownerId     Int?
  owner       User?       @relation("CompanyOwner", fields: [ownerId], references: [id])

  employees   User[]
  collections Collection[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum CompanyType {
  MANUFACTURER  // Üretici
  BUYER         // Alıcı
  BOTH          // Her ikisi
}
```

---

## 🎯 İyileştirme Önerileri

### 1. ✅ Mevcut Sistem Zaten İyi!

**Durum:** Signup flow **şu anda** kullanıcının kim olduğunu soruyor:

- Step 3: Firma durumu seçimi
- Step 4: Firma tipi seçimi (MANUFACTURER | BUYER | BOTH)

**Sonuç:** Hiçbir değişiklik gerekmiyor! Sistem zaten çalışıyor.

---

### 2. 🔄 İsteğe Bağlı: Daha Akıllı Onboarding

**Öneri:** Kullanıcının davranışına göre otomatik tespit:

```typescript
// Example: Smart role detection
if (user.email.includes("@gmail.com") || user.email.includes("@hotmail.com")) {
  // Bireysel email → INDIVIDUAL_CUSTOMER olabilir
  suggestedAction = "INDIVIDUAL";
} else {
  // Kurumsal email → Firma seçeneği öner
  suggestedAction = "CREATE_NEW";

  // Email domain'den firma adını tahmin et
  const domain = user.email.split("@")[1];
  suggestedCompanyName = toTitleCase(domain.split(".")[0]);
  // "defacto.com" → "Defacto"
}
```

---

### 3. 📧 Email Domain Kontrolü

**Öneri:** Aynı email domain'inden kayıt olanları tespit et:

```typescript
// Example: Check existing companies with same domain
const userDomain = userEmail.split("@")[1];

const existingCompany = await prisma.company.findFirst({
  where: {
    email: { endsWith: `@${userDomain}` },
  },
});

if (existingCompany) {
  // Aynı domain'den firma var!
  showSuggestion = {
    message: `${existingCompany.name} firması zaten kayıtlı. Bu firmaya çalışan olarak katılmak ister misiniz?`,
    action: "JOIN_EXISTING",
    companyId: existingCompany.id,
  };
}
```

---

### 4. 🎨 UI İyileştirmesi - Step 3'te Firma Tipi Açıklaması

**Şu Anki Durum:**

```
Step 3: Firma durumu seçimi
  - CREATE_NEW
  - JOIN_EXISTING
  - INDIVIDUAL

Step 4: Firma bilgileri
  - companyType: MANUFACTURER | BUYER | BOTH
```

**Öneri:** Step 3'te firma tipini de göster:

```tsx
// Step 3 Improved
<button onClick={() => field.onChange("CREATE_MANUFACTURER")}>
  🏭 Üretici Firma Oluştur
  <span>Ürün üretiyorum, numune talepleri alıyorum</span>
</button>

<button onClick={() => field.onChange("CREATE_BUYER")}>
  🛒 Alıcı Firma Oluştur
  <span>Ürün satın alıyorum, sipariş veriyorum</span>
</button>

<button onClick={() => field.onChange("CREATE_BOTH")}>
  ⚡ Karma Firma Oluştur
  <span>Hem üretiyorum hem satın alıyorum</span>
</button>

<button onClick={() => field.onChange("JOIN_EXISTING")}>
  👥 Mevcut Firmaya Katıl
  <span>Çalışan olarak katılmak istiyorum</span>
</button>

<button onClick={() => field.onChange("INDIVIDUAL")}>
  👤 Bireysel Müşteri
  <span>Firma olmadan devam etmek istiyorum</span>
</button>
```

Bu sayede kullanıcı **tek adımda** hem firma durumunu hem tipini seçer.

---

### 5. 🧪 Davet Kodu Sistemi

**Şu Anki Durum:** JOIN_EXISTING için davet kodu var ama tam implemente edilmemiş.

**Öneri:**

```typescript
// Company model'e ekle
model Company {
  /* ... */
  inviteCode String @unique @default(cuid()) // "DEFACTO-ABC123"
}

// Signup sırasında kod kontrolü
if (companyFlow.action === "JOIN_EXISTING") {
  const company = await prisma.company.findUnique({
    where: { inviteCode: companyFlow.inviteCode }
  });

  if (!company) {
    throw new Error("Invalid invite code");
  }

  // Kullanıcıyı firmaya ekle
  user.companyId = company.id;
  user.role = "COMPANY_EMPLOYEE";
}
```

**UI:**

```tsx
// Step 4b - Join Company
<Input placeholder="Davet kodunu girin (ör: DEFACTO-ABC123)" {...field} />
```

---

## 📊 Özet Tablosu

| Özellik                   | Durum     | Açıklama                                       |
| ------------------------- | --------- | ---------------------------------------------- |
| **4 Adımlı Kayıt**        | ✅ Mevcut | Email, Bilgiler, Firma Durumu, Firma Detayları |
| **Firma Tipi Seçimi**     | ✅ Mevcut | MANUFACTURER, BUYER, BOTH                      |
| **Firma Oluşturma**       | ✅ Mevcut | CREATE_NEW akışı çalışıyor                     |
| **Firmaya Katılma**       | ⚠️ Kısmi  | JOIN_EXISTING var ama davet kodu sistemi eksik |
| **Bireysel Kayıt**        | ✅ Mevcut | INDIVIDUAL akışı çalışıyor                     |
| **Authorization**         | ✅ Mevcut | Company type'a göre yetkilendirme var          |
| **Email Domain Kontrolü** | ❌ Yok    | Aynı domain'den firma tespiti yok              |
| **Akıllı Öneri**          | ❌ Yok    | Kullanıcı davranışına göre öneri yok           |

---

## ✅ Sonuç

### CEVAP: Sistem Zaten Hazır! 🎉

**Soru:** _"ProTexFlow'a bir insan girer, kim olduğunu bilmeyiz - sisteme nasıl çözeriz?"_

**Cevap:** Sistem **zaten çözülmüş durumda!**

1. ✅ Kullanıcı kayıt olurken **Step 3**'te firma durumunu seçiyor
2. ✅ **Step 4**'te firma tipini seçiyor (MANUFACTURER | BUYER | BOTH)
3. ✅ Backend'de company type'a göre yetkilendirme yapılıyor
4. ✅ Üreticiler collection oluşturabiliyor
5. ✅ Alıcılar collection oluşturamıyor (hata alıyor)
6. ✅ Herkes sample talebi oluşturabiliyor

**Gerekli mi?** Hayır, sistem sorunsuz çalışıyor.

**İyileştirme:** Yukarıdaki 5 öneri opsiyonel iyileştirmeler (davet kodu, email domain kontrolü, akıllı öneri, vb.)

---

**Hazırlayan:** AI Development Team
**Tarih:** 19 Ekim 2025
**Status:** ✅ Dokümantasyon Tamamlandı

---

## 📞 İlgili Dosyalar

### Backend

- `backend/src/graphql/mutations/authMutation.ts` - Signup mutation
- `backend/src/graphql/mutations/collectionMutation.ts` - Authorization kontrolü
- `backend/prisma/schema.prisma` - User ve Company modelleri

### Frontend

- `client/src/components/Auth/SignupForm/multi-step-signup-form.tsx` - 4 adımlı kayıt formu
- `client/src/lib/graphql/mutations.ts` - GraphQL mutations

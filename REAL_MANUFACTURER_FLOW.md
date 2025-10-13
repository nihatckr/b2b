# 🏭 Gerçek Üretici Firma Akışı

## 📋 Senaryonuz (Gerçek İhtiyaç)

### Senaryo 1: Firma Sahibi Kaydı

```
Ahmet Bey (Firma Sahibi)
    ↓
1. Sisteme üye ol
   - "MANUFACTURE" role seç
   - "YENİ FİRMA OLUŞTUR" butonuna tıkla
   - Firma bilgilerini gir:
     * Firma Adı: "Defacto Tekstil A.Ş."
     * Email: info@defacto.com
     * Telefon, Adres, vb.
    ↓
2. Kayıt tamamlanır
   - Ahmet Bey → MANUFACTURE role
   - Ahmet Bey → Defacto Tekstil'e bağlı (companyId)
   - Ahmet Bey → Firma sahibi (isOwner: true)
    ↓
3. Dashboard'a giriş yapar
   - "Defacto Tekstil - Üretim Paneli"
   - Kendi firması için işlem yapabilir
    ↓
4. Kategori oluşturur
   - "Erkek Giyim"
   - "Kadın Giyim"
   - (Defacto Tekstil'e özel)
    ↓
5. Koleksiyon oluşturur
   - "2025 Yaz Serisi"
   - Kategori: Erkek Giyim
   - Company: Defacto Tekstil (otomatik)
   - Author: Ahmet Bey (otomatik)
```

### Senaryo 2: Çalışan Ekleme

```
Ahmet Bey (Firma Sahibi)
    ↓
1. Admin Panel'e gider
    ↓
2. "Kullanıcı Ekle" butonuna tıklar
   - İsim: Ayşe Demir
   - Email: ayse@defacto.com
   - Role: MANUFACTURE
   - Company: Defacto Tekstil (otomatik/seçili)
   - İzinler: Koleksiyon Yöneticisi
    ↓
3. Ayşe hesap alır
   - Defacto Tekstil'e bağlı
   - Firma adına koleksiyon oluşturabilir
   - Gelen talepleri görebilir
   - Firma adına cevap verebilir
```

### Senaryo 3: Başka Firmaya Katılma

```
Mehmet Bey (Deneyimli Tasarımcı)
    ↓
1. Sisteme üye ol
   - "MANUFACTURE" role seç
   - "MEVCUT FİRMAYA KATIL" seçeneği
   - Firma seç: "LC Waikiki Mağazacılık"
   - Davet kodu gir veya onay bekle
    ↓
2. Firma sahibi/admin onaylar
    ↓
3. Mehmet artık LC Waikiki çalışanı
   - LC Waikiki adına koleksiyon oluşturur
   - Gelen talepleri görür
```

---

## ⚠️ ŞU ANKİ SİSTEM EKSİKLERİ

### 1. Signup Flow Eksik

**Şu an**:

```typescript
signup(email, password, name, role);
// Company seçimi/oluşturma YOK! ❌
```

**Olması gereken**:

```typescript
signup(email, password, name, role, companyFlow)

if (role === "MANUFACTURE") {
  // Option 1: Create new company
  createCompany(name, email, phone, ...) → Company created
  user.companyId = newCompany.id
  user.isOwner = true

  // Option 2: Join existing company
  selectCompany(companyId) → Pending approval
  user.companyId = companyId
  user.isOwner = false
  user.isPendingApproval = true
}
```

### 2. User Model Eksikleri

```prisma
model User {
  companyId Int?            // ✅ VAR
  isActive  Boolean         // ✅ VAR

  // EKSİK:
  isOwner           Boolean? // Firma sahibi mi?
  isPendingApproval Boolean? // Onay bekliyor mu?
  permissions       Json?    // İzinler (koleksiyon, sipariş, vb.)
}
```

### 3. Company Ownership Eksik

```prisma
model Company {
  // EKSİK:
  owner   User @relation("CompanyOwner")
  ownerId Int?
}
```

---

## ✅ ÇÖZÜM PLANI

### Adım 1: Schema Güncellemeleri

```prisma
model User {
  // Yeni alanlar
  isOwner           Boolean @default(false)
  isPendingApproval Boolean @default(false)
  permissions       Json?   // {"canCreateCollection": true, ...}

  // Relations
  ownedCompanies    Company[] @relation("CompanyOwner")
}

model Company {
  owner   User? @relation("CompanyOwner", fields: [ownerId], references: [id])
  ownerId Int?  @unique
}
```

### Adım 2: Signup Mutation Güncelleme

```typescript
mutation Signup(
  $email: String!
  $password: String!
  $name: String!
  $role: Role!
  $companyFlow: CompanyFlowInput // Yeni!
) {
  signup(...) {
    token
    user
    company // Yeni oluşturulduysa
  }
}

input CompanyFlowInput {
  action: CompanyAction! // CREATE_NEW / JOIN_EXISTING

  # CREATE_NEW için
  companyName: String
  companyEmail: String
  companyPhone: String

  # JOIN_EXISTING için
  companyId: Int
  inviteCode: String
}

enum CompanyAction {
  CREATE_NEW
  JOIN_EXISTING
}
```

### Adım 3: Signup Form Güncelleme

```typescript
// Step 1: Basic info
name, email, password

// Step 2: Role selection
ADMIN / MANUFACTURE / CUSTOMER

// Step 3 (if MANUFACTURE): Company Setup
┌─────────────────────────────────────┐
│  Firma Tercihiniz?                  │
│                                     │
│  ○ Yeni Firma Oluştur               │
│    → Firma adı, email, telefon      │
│    → Firma sahibi olarak kayıt      │
│                                     │
│  ○ Mevcut Firmaya Katıl             │
│    → Firma seç (dropdown)           │
│    → Davet kodu gir (opsiyonel)     │
│    → Onay bekle                     │
└─────────────────────────────────────┘
```

### Adım 4: Dashboard Güncellemeleri

```typescript
// Üretici dashboard
if (user.isOwner) {
  // Firma sahibi özellikleri
  - Çalışan yönetimi
  - Firma ayarları
  - Tüm izinler
} else {
  // Normal çalışan
  - Kısıtlı işlemler
  - İzin bazlı erişim
}
```

---

## 🎯 ÖNERİ: Hangi Yaklaşım?

### Yaklaşım A: Basitleştirilmiş (Hızlı)

**Signup sırasında**:

- MANUFACTURE seçilirse → Mevcut companylerden seç
- Admin sonradan company oluşturur
- Basit ama gerçekçi değil

### Yaklaşım B: Tam Çözüm (Doğru) ⭐ **ÖNERİM**

**Signup multi-step**:

1. Basic info
2. Role seçimi
3. MANUFACTURE ise:
   - Yeni firma oluştur (firma sahibi)
   - Mevcut firmaya katıl (çalışan)
4. Company creation/selection
5. Kayıt tamamla

**Avantajlar**:

- ✅ Gerçek iş akışına uygun
- ✅ Self-service (admin'e gerek yok)
- ✅ Firma sahibi vs çalışan ayrımı
- ✅ Permission sistemi

**Dezavantajlar**:

- ⏱️ Daha uzun sürer (2-3 saat)
- 📝 Daha fazla kod

---

## 🤔 KARARINIZ?

**A) Basit Git** (Şimdilik admin'den company, sonra düzelt)
**B) Doğru Yap** (Signup multi-step, self-service company)

Hangi yaklaşımı tercih edersiniz? 🎯

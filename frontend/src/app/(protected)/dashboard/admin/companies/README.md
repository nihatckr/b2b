# Admin Company Management

## 📋 Genel Bakış

Platform genelindeki tüm firmaları yönetme sistemi. Admin kullanıcıları firmaları görüntüleyebilir, düzenleyebilir ve istatistiklerini takip edebilir.

## 🏗️ Mimari

```
Admin Company Management
├── Companies List (Table View)
├── Company Stats (Dashboard Cards)
├── Company Detail Dialog
└── Company Edit Dialog
```

## 📁 Dosya Yapısı

```
frontend/src/
├── app/(protected)/dashboard/admin/companies/
│   ├── page.tsx                # Ana şirket yönetim sayfası
│   └── README.md               # Bu dosya
└── graphql/admin/
    └── companies.graphql       # GraphQL operations

backend/src/graphql/
├── types/index.ts              # Company GraphQL type
├── queries/
│   └── companyQuery.ts         # Company queries
└── mutations/
    └── companyMutation.ts      # Company mutations
```

## 🎯 Özellikler

### ✅ Tamamlanan

1. **İstatistik Kartları**

   - ✅ Toplam firma sayısı
   - ✅ Üretici firma sayısı
   - ✅ Alıcı firma sayısı
   - ✅ Her ikisi (BOTH) sayısı
   - ✅ Aktif firma sayısı
   - ✅ Pasif firma sayısı

2. **Filtreleme & Arama**

   - ✅ Metin arama (firma adı, email)
   - ✅ Tip filtresi (MANUFACTURER, BUYER, BOTH)
   - ✅ Real-time filtering

3. **Firma Listesi (Table)**

   - ✅ Firma adı & açıklama
   - ✅ Tip badge (renk kodlu)
   - ✅ İletişim bilgileri (email, telefon)
   - ✅ Kullanıcı sayısı (current/max)
   - ✅ Abonelik planı & durum
   - ✅ Aktif/Pasif badge
   - ✅ Detay & Düzenle butonları

4. **Düzenleme Dialog**

   - ✅ Temel bilgiler (ad, email, telefon, website)
   - ✅ Açıklama (description)
   - ✅ Adres bilgileri (adres, şehir, ülke)
   - ✅ Form validation
   - ✅ Toast notifications
   - ✅ Loading states
   - ✅ Auto-refetch after update

5. **Detay Dialog**
   - ✅ Temel bilgiler
   - ✅ Abonelik & kullanım istatistikleri
   - ✅ Kullanım limitleri (users, samples, orders, storage)
   - ✅ Firma çalışanları listesi (ilk 5 + toplam)
   - ✅ Firma sahibi bilgisi

## 🔧 Kullanım

### Admin Panelinden Erişim

```
URL: /dashboard/admin/companies
```

**Gereksinim**: ADMIN rolü

### Backend Test (GraphQL Playground)

```bash
cd backend && npm run dev
# http://localhost:4001/graphql
```

**Firma Listesi:**

```graphql
query {
  companies(take: 10, search: "textile") {
    id
    name
    email
    type
    isActive
    subscriptionPlan
    currentUsers
    maxUsers
  }
}
```

**Firma Detayı:**

```graphql
query {
  company(id: 1) {
    id
    name
    email
    type
    subscriptionPlan
    subscriptionStatus
    currentUsers
    maxUsers
    employees {
      id
      name
      email
      role
    }
  }
}
```

**Firma Güncelleme:**

```graphql
mutation {
  updateCompany(
    id: 1
    name: "Yeni Firma Adı"
    email: "yeni@email.com"
    phone: "+90 555 123 4567"
    description: "Güncellenmiş açıklama"
  ) {
    id
    name
    email
    updatedAt
  }
}
```

### Frontend Usage

```typescript
import { AdminCompaniesListDocument } from "@/__generated__/graphql";
import { useQuery } from "urql";

// List companies
const [{ data, fetching }] = useQuery({
  query: AdminCompaniesListDocument,
  variables: {
    search: "textile",
    type: "MANUFACTURER",
    take: 20,
  },
});

const companies = data?.companies || [];
```

## 📊 Company Types

| Type           | Açıklama      | Badge Color |
| -------------- | ------------- | ----------- |
| `MANUFACTURER` | Üretici Firma | Blue        |
| `BUYER`        | Alıcı Firma   | Gray        |
| `BOTH`         | Her İkisi de  | Outline     |

## 💳 Subscription Plans

| Plan           | Features                           |
| -------------- | ---------------------------------- |
| `FREE`         | 5 users, 50 samples, 10 orders     |
| `STARTER`      | 10 users, 200 samples, 50 orders   |
| `PROFESSIONAL` | 25 users, 1000 samples, 200 orders |
| `ENTERPRISE`   | Unlimited                          |
| `CUSTOM`       | Custom limits                      |

## 🎨 UI Components

### Stats Cards

```tsx
<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
  {/* Total, Manufacturer, Buyer, Both, Active, Inactive */}
</div>
```

### Filters

```tsx
<div className="flex gap-4">
  <Input placeholder="Search..." /> {/* Search */}
  <Select>{/* Type filter */}</Select>
</div>
```

### Company Table

```tsx
<Table>
  <TableHeader>{/* Headers */}</TableHeader>
  <TableBody>
    {companies.map((company) => (
      <TableRow key={company.id}>
        {/* Company info, badges, actions */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Dialogs

```tsx
// Edit Dialog
<EditCompanyDialog
  open={editDialogOpen}
  onOpenChange={setEditDialogOpen}
  company={selectedCompany}
  onSuccess={() => refetchCompanies()}
/>

// Detail Dialog
<CompanyDetailDialog
  open={detailDialogOpen}
  onOpenChange={setDetailDialogOpen}
  companyId={selectedCompany?.id}
/>
```

## 🔐 Permissions & Security

### Backend Authorization

```typescript
// companyQuery.ts
builder.queryField("companies", (t) =>
  t.prismaField({
    authScopes: { public: true }, // Anyone can see active companies
    // ...
  })
);

// companyMutation.ts
builder.mutationField("updateCompany", (t) =>
  t.prismaField({
    authScopes: { companyOwner: true, admin: true }, // Owner or admin
    resolve: async (query, _root, args, context) => {
      // Check ownership
      if (
        context.user?.companyId !== args.id &&
        context.user?.role !== "ADMIN"
      ) {
        throw new Error("Unauthorized");
      }
      // ...
    },
  })
);
```

### Frontend Route Protection

```typescript
// middleware.ts
// Admin routes protected at /dashboard/admin/*
if (pathname.startsWith("/dashboard/admin") && session.role !== "ADMIN") {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

## 📝 Data Flow

```
1. User Search/Filter
   ↓
2. AdminCompaniesListDocument query
   ↓
3. Backend: companyQuery.ts
   ↓
4. Prisma: company.findMany()
   ↓
5. GraphQL Response
   ↓
6. Frontend: Display in table
```

## 🐛 Troubleshooting

### Error: "Variable never used"

**Problem**: GraphQL mutation parametresi backend'de kullanılmıyor

```graphql
# ❌ WRONG
mutation AdminUpdateCompany($type: String) {
  updateCompany(id: $id) {
    # $type kullanılmıyor!
  }
}
```

**Solution**: Kullanılmayan parametreyi kaldır veya backend'de kullan

```graphql
# ✅ CORRECT
mutation AdminUpdateCompany($id: Int!, $name: String) {
  updateCompany(id: $id, name: $name) {
    id
    name
  }
}
```

### Error: "Unauthorized"

**Problem**: Admin rolü yok veya başka firmaya erişim

**Solution**:

1. Admin hesabıyla giriş yap: `admin@protexflow.com / Admin123!`
2. Session kontrol: `console.log(session.role)`
3. Backend log kontrol: `User companyId doesn't match`

### Empty Company List

**Problem**: Firma yok veya filter yanlış

**Solution**:

1. Backend'de seed çalıştır: `cd backend && npx prisma db seed`
2. Filter sıfırla: Type = "Tüm Tipler"
3. Search temizle

## 🚀 Gelecek İyileştirmeler

### Öncelikli (High Priority)

- [ ] **Bulk Operations**: Toplu aktif/pasif yapma
- [ ] **Export**: CSV/Excel export
- [ ] **Pagination**: Büyük listeler için sayfalama
- [ ] **Sorting**: Sütunlara göre sıralama

### Orta Öncelikli (Medium Priority)

- [ ] **Activity Logs**: Firma aktivite geçmişi
- [ ] **Subscription Management**: Plan değiştirme UI
- [ ] **Company Merge**: İki firmayı birleştirme
- [ ] **Email Notifications**: Firma güncellemelerinde email

### Düşük Öncelikli (Low Priority)

- [ ] **Analytics Dashboard**: Grafik ve raporlar
- [ ] **Advanced Filters**: Tarih aralığı, kullanıcı sayısı vb.
- [ ] **Company Categories**: Firma kategorilendirme
- [ ] **Notes & Tags**: Firma notları ve etiketleri

## 📚 İlgili Dökümanlar

- **User Management**: `frontend/src/app/(protected)/dashboard/admin/users/page.tsx`
- **Category Management**: `frontend/src/app/(protected)/dashboard/admin/categories/`
- **Backend Permissions**: `backend/src/utils/permissions.ts`
- **GraphQL Schema**: `backend/src/graphql/types/index.ts`
- **Company Type**: `backend/prisma/schema.prisma`

## 🎓 Best Practices

### 1. Always Refetch After Mutations

```typescript
const handleUpdate = async () => {
  await updateCompany({ id, ...data });
  refetchCompanies({ requestPolicy: "network-only" }); // ✅ Force fresh data
};
```

### 2. Show Loading States

```typescript
{
  fetching ? (
    <TableRow>
      <TableCell colSpan={7}>Yükleniyor...</TableCell>
    </TableRow>
  ) : (
    // ... data
  );
}
```

### 3. Validate Form Data

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault(); // ✅ Prevent default
  // ... validation
  if (!form.name || !form.email) {
    toast.error("Zorunlu alanları doldurun");
    return;
  }
  // ... submit
};
```

### 4. Use Toast Notifications

```typescript
if (result.data) {
  toast.success("Firma güncellendi"); // ✅ Success feedback
} else if (result.error) {
  toast.error("Hata oluştu"); // ✅ Error feedback
}
```

### 5. Handle Edge Cases

```typescript
// ✅ Empty state
{
  companies.length === 0 && <p>Firma bulunamadı</p>;
}

// ✅ Null safety
{
  company?.description && <p>{company.description}</p>;
}

// ✅ Numeric ID conversion
const companyId = Number(company.id);
```

## 🔍 Testing Checklist

- [x] ✅ Firma listesi görüntüleme
- [x] ✅ Arama çalışıyor
- [x] ✅ Tip filtresi çalışıyor
- [x] ✅ İstatistikler doğru hesaplanıyor
- [x] ✅ Detay dialog açılıyor
- [x] ✅ Düzenleme dialog açılıyor
- [x] ✅ Firma güncelleme başarılı
- [x] ✅ Toast notifications gösteriliyor
- [x] ✅ Form validation çalışıyor
- [x] ✅ Loading states gösteriliyor
- [x] ✅ Empty states gösteriliyor
- [x] ✅ TypeScript hataları yok
- [x] ✅ GraphQL errors yok
- [x] ✅ Responsive design çalışıyor

## ✅ Sonuç

Admin company management sistemi başarıyla oluşturuldu. Sistem production-ready durumda ve user management ile tutarlı bir yapıda.

**Öne Çıkan Özellikler**:

- ✅ Clean & modern UI
- ✅ Type-safe GraphQL operations
- ✅ Real-time search & filtering
- ✅ Comprehensive company details
- ✅ Easy to extend
- ✅ Consistent with existing patterns

**Durum**: ✅ COMPLETED (100%)

---

**Son Güncelleme**: 2025-10-20
**Oluşturan**: AI Coding Agent
**Review**: Ready for production

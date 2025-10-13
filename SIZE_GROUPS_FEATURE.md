# 📏 Birden Fazla Beden Grubu Desteği

**Tarih:** 13 Ekim 2025, 25:00  
**Durum:** ✅ BACKEND TAMAMLANDI

---

## 💡 Problem

```
Eski Sistem:
Collection → sizeRange: "S-XL" (tek grup)

Problem:
- Bir koleksiyonda pantolon + gömlek varsa?
- Pantolon: 28/30, 30/32, 32/34
- Gömlek: S, M, L, XL
- İkisini nasıl saklayacağız? ❌
```

## ✅ Çözüm

```
Yeni Sistem:
Collection → sizeGroups: [1, 2, 3] (birden fazla grup)

Örnek:
sizeGroupIds: [1, 3]
  └─ Grup 1: "Erkek Standart" → ["S", "M", "L", "XL"]
  └─ Grup 3: "Kadın Standart" → ["XS", "S", "M", "L"]

Kullanım Senaryoları:
✅ Unisex ürünler (erkek + kadın bedenleri)
✅ Set ürünler (üst + alt beden grupları)
✅ Çok kategorili koleksiyonlar
```

---

## ✅ Yapılanlar

### 1. Database Schema ✅

```prisma
model Collection {
  sizeGroups String? // JSON array: [1, 2, 3]
  sizeRange  String? // Legacy/manual override
}
```

### 2. GraphQL Type ✅

```graphql
type Collection {
  sizeGroupIds: [Int] # Birden fazla grup
  sizeRange: String # Manuel override
}

input CreateCollectionInput {
  sizeGroupIds: [Int]
  sizeRange: String
}
```

### 3. Resolver ✅

```typescript
createCollection({
  sizeGroupIds: [1, 3]  // Erkek + Kadın
}) {
  // JSON.stringify([1, 3]) → database
}
```

---

## 🎯 Kullanım Örnekleri

### Örnek 1: Unisex Sweatshirt

```graphql
mutation {
  createCollection(input: {
    name: "Unisex Sweatshirt"
    gender: UNISEX
    sizeGroupIds: [1, 3]  # Erkek Standart + Kadın Standart
  })
}

Result:
✅ Müşteri hem erkek hem kadın bedeni seçebilir
✅ Bedenler: S, M, L, XL, XXL (erkek) + XS, S, M, L, XL (kadın)
```

### Örnek 2: Takım Elbise

```graphql
mutation {
  createCollection(input: {
    name: "Business Suit"
    sizeGroupIds: [1, 7]  # Ceket bedenleri + Pantolon bedenleri
  })
}

Result:
✅ Ceket: 46, 48, 50, 52
✅ Pantolon: 28/30, 30/32, 32/34
```

### Örnek 3: Sadece Manuel Beden

```graphql
mutation {
  createCollection(
    input: {
      name: "Özel Ürün"
      sizeRange: "Custom: 42-44-46" # Manuel giriş
      sizeGroupIds: [] # Boş
    }
  )
}
```

---

## 📊 Frontend UI (Taslak)

### Collection Form - Step 2

```tsx
<FormField>
  <Label>Beden Grupları (Birden fazla seçilebilir)</Label>

  <MultiSelect
    options={mySizeGroups.map(sg => ({
      value: sg.id,
      label: `${sg.name} (${sg.sizes.join(", ")})`
    }))}
    value={formData.sizeGroupIds}
    onChange={(ids) => setFormData({...formData, sizeGroupIds: ids})}
  />

  <div className="flex items-center gap-2 mt-2">
    <Checkbox id="manual-size" />
    <Label htmlFor="manual-size">Manuel beden girişi</Label>
  </div>

  {useManualSize && (
    <Input
      placeholder="örn: S-XL veya 28/30-32/34"
      value={formData.sizeRange}
      onChange={(e) => setFormData({...formData, sizeRange: e.target.value})}
    />
  )}
</FormField>

Preview:
┌─────────────────────────────────────┐
│ Seçili Beden Grupları:             │
│                                     │
│ ✅ Erkek Standart                  │
│    S, M, L, XL, XXL                 │
│                                     │
│ ✅ Kadın Plus Size                 │
│    L, XL, XXL, 3XL                  │
│                                     │
│ Toplam: 10 farklı beden            │
└─────────────────────────────────────┘
```

---

## ✅ Backend Hazır!

```
Database:   ✅ sizeGroups field (JSON array)
GraphQL:    ✅ sizeGroupIds (Int array)
Resolver:   ✅ JSON.stringify/parse
Validation: ✅ Array support

BACKEND: %100
FRONTEND: TODO
```

**Esnek ve profesyonel beden yönetimi!** 📏✨

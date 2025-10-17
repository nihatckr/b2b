# Müşteri Koleksiyon Özellikleri - Kurulum Talimatları

## 🚀 Hızlı Başlangıç

### 1. Client Tarafı Bağımlılıkları

```bash
cd client
npm install @radix-ui/react-accordion
```

### 2. Server Tarafı - Prisma Generate

```bash
cd server
npx prisma generate
```

### 3. Database Migration (Opsiyonel - Production için)

**Not**: Şu an veritabanında drift var. Development ortamında devam edebilirsiniz ama production'a geçerken migration yapmalısınız.

```bash
cd server
npx prisma migrate dev --name add_company_location
```

## 📁 Oluşturulan Dosyalar

### Backend
1. ✅ `server/prisma/schema.prisma` - Company modeline `location` eklendi
2. ✅ `server/src/types/Company.ts` - GraphQL type güncellendi
3. ✅ `server/src/types/Collection.ts` - Certifications field eklendi
4. ✅ `server/src/query/collectionQuery.ts` - Lokasyon filtreleri eklendi

### Frontend
1. ✅ `client/src/components/Collection/CustomerCollectionCard.tsx` - Yeni koleksiyon kartı
2. ✅ `client/src/components/Collection/CollectionFiltersPanel.tsx` - Filtreleme paneli
3. ✅ `client/src/components/ui/accordion.tsx` - Accordion UI bileşeni
4. ✅ `client/src/app/(protected)/customer/collections/page.tsx` - Örnek sayfa

## 🎯 Kullanıma Hazır Özellikler

### Koleksiyon Kartı Özellikleri
- [x] Ürün görseli (hover zoom efekti)
- [x] Beğeni butonu (kalp ikonu)
- [x] Sezon ve cinsiyet badge'leri
- [x] Sertifika ikonları (renkli, tooltip'li)
- [x] Üretici bilgileri (isim + lokasyon)
- [x] Termin süresi
- [x] Kumaş detayı
- [x] Trend bilgisi
- [x] Fit bilgisi
- [x] Açıklama
- [x] Hedef fiyat ve MOQ
- [x] 3 Aksiyon Butonu:
  - Sipariş Ver (Add to PO)
  - Numune Talep Et
  - Revize İle Numune

### Filtreleme Özellikleri
- [x] Arama çubuğu
- [x] Üretici lokasyonu filtresi
- [x] Üretici ismi filtresi
- [x] Sezon filtresi
- [x] Cinsiyet filtresi
- [x] Trend filtresi
- [x] Kategori filtresi
- [x] Fiyat aralığı filtresi
- [x] Aktif filtre gösterimi
- [x] Hızlı filtre temizleme

## 🔗 Entegrasyonlar

### GraphQL Query Örneği

```typescript
const GET_COLLECTIONS = gql`
  query GetCollections(
    $location: String
    $manufacturerName: String
  ) {
    collections(
      location: $location
      manufacturerName: $manufacturerName
      isActive: true
    ) {
      id
      name
      modelCode
      targetLeadTime
      fabricComposition
      trend
      company {
        name
        location
      }
      certifications {
        name
        category
      }
    }
  }
`;
```

### Mutation Örneği (Beğeni)

```typescript
const TOGGLE_LIKE = gql`
  mutation ToggleLike($collectionId: Int!) {
    toggleFavoriteCollection(collectionId: $collectionId) {
      id
      likesCount
    }
  }
`;
```

## 🎨 Sertifika Renk Kodları

```typescript
const certificationColors = {
  FIBER: "text-green-600",        // Lif/Hammadde
  CHEMICAL: "text-blue-600",      // Kimyasal
  SOCIAL: "text-purple-600",      // Sosyal/Etik
  ENVIRONMENTAL: "text-emerald-600", // Çevresel
  TRACEABILITY: "text-orange-600" // İzlenebilirlik
};
```

## ⚙️ Yapılandırma

### 1. Apollo Client Kurulumu (Eğer yoksa)

```bash
cd client
npm install @apollo/client graphql
```

### 2. Toast Hook'u (Eğer yoksa)

`client/src/hooks/use-toast.ts` dosyasının tanımlı olduğundan emin olun.

### 3. Routing

Butonlar şu route'lara yönlendirme yapar:
- Numune Talep: `/samples/request?collectionId={id}`
- Revize İsteği: `/samples/request?collectionId={id}&type=revision`
- Sipariş: `/orders/create?collectionId={id}`

Bu sayfaların oluşturulması gerekir.

## 🧪 Test

### Manuel Test Adımları

1. **Filtreleme Testi**
   - Lokasyon seçin
   - Üretici seçin
   - Sonuçların filtrelendiğini kontrol edin

2. **Beğeni Testi**
   - Kalp ikonuna tıklayın
   - Sayının artıp azaldığını kontrol edin
   - GraphQL mutation'ın çağrıldığını kontrol edin

3. **Buton Testi**
   - Her 3 butona tıklayın
   - Doğru route'lara yönlendirildiğinizi kontrol edin

### GraphQL Playground'da Test

```graphql
# Koleksiyonları lokasyona göre getir
query {
  collections(location: "İstanbul", isActive: true) {
    id
    name
    company {
      name
      location
    }
  }
}

# Bir koleksiyonu beğen
mutation {
  toggleFavoriteCollection(collectionId: 1) {
    id
    likesCount
  }
}
```

## 🐛 Bilinen Sorunlar ve Çözümler

### 1. Accordion Import Hatası
**Hata**: `Cannot find module '@radix-ui/react-accordion'`
**Çözüm**: `npm install @radix-ui/react-accordion`

### 2. Apollo Client Hatası
**Hata**: `Cannot find module '@apollo/client'`
**Çözüm**: `npm install @apollo/client graphql`

### 3. Database Drift
**Hata**: "Drift detected: Your database schema is not in sync"
**Çözüm**: Development'ta `npx prisma generate` yeterli, production'da migration yapın

### 4. Type Hatası (locations/manufacturers)
**Çözüm**: TypeScript strict mode nedeniyle, sayfa bileşeninde type assertion ekleyin:

```typescript
const uniqueLocations = Array.from(
  new Set(
    collections
      .map((c: any) => c.company?.location)
      .filter((l: string | undefined) => l)
  )
) as string[];
```

## 📚 Ek Kaynaklar

- [Radix UI Accordion Docs](https://www.radix-ui.com/docs/primitives/components/accordion)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)

## ✅ Checklist

Kurulum öncesi kontrol listesi:

- [ ] Node.js ve npm kurulu
- [ ] MySQL veritabanı çalışıyor
- [ ] `.env` dosyası doğru yapılandırılmış
- [ ] Server dependency'leri kurulu (`npm install`)
- [ ] Client dependency'leri kurulu (`npm install`)
- [ ] Prisma generate çalıştırıldı
- [ ] Apollo Client yapılandırılmış
- [ ] Toast sistemi kurulu

Kurulum sonrası kontrol:

- [ ] Accordion bileşeni çalışıyor
- [ ] Koleksiyon kartları render ediliyor
- [ ] Filtreleme çalışıyor
- [ ] Beğeni butonu çalışıyor
- [ ] GraphQL query'ler başarılı
- [ ] Butonlar doğru yönlendiriyor

## 🎉 Başarılı Kurulum

Eğer tüm adımlar tamamlandıysa, `/customer/collections` sayfasında:
- Koleksiyon kartlarını görebilirsiniz
- Filtreleme yapabilirsiniz
- Koleksiyonları beğenebilirsiniz
- Butonlar çalışır durumda olmalı

---

**Not**: Herhangi bir sorun yaşarsanız, CUSTOMER_COLLECTION_FEATURE.md dosyasına bakın veya loglara göz atın.

# Collection ve Image Upload Özellikleri

## ✅ Tamamlanan İşlemler

### Backend

1. **File Upload Mutations** ✅

   - `singleUpload`: Tek dosya yükleme
   - `deleteFile`: Dosya silme
   - Upload scalar type tanımlandı
   - File model Prisma schema'ya eklendi

2. **Collection Mutations** ✅

   - `createCollection`: Yeni koleksiyon oluşturma
   - `updateCollection`: Koleksiyon güncelleme
   - `deleteCollection`: Koleksiyon silme
   - Images array desteği eklendi

3. **Collection Queries** ✅

   - `collections`: Filtreleme ve arama ile tüm koleksiyonlar
   - `collection`: ID'ye göre tekil koleksiyon
   - `myCollections`: Kullanıcının kendi koleksiyonları
   - `featuredCollections`: Öne çıkan koleksiyonlar
   - `collectionsByCategory`: Kategoriye göre koleksiyonlar
   - `collectionsByCompany`: Şirkete göre koleksiyonlar

4. **Dosya Servisi** ✅
   - `/uploads` endpoint'i üzerinden static dosya servisi
   - GraphQL upload middleware entegrasyonu
   - 10MB maksimum dosya boyutu limiti

### Frontend

1. **UI Components** ✅

   - `ImageUpload`: Sürükle-bırak destekli resim yükleme component'i
   - `Textarea`: Form alanları için textarea component'i
   - Alert Dialog, Dialog, Select, Switch vb. tüm gerekli UI component'leri

2. **Collections Sayfası** ✅

   - Grid layout ile koleksiyon listesi
   - Arama ve filtreleme
   - Yeni koleksiyon oluşturma dialogu
   - Koleksiyon düzenleme dialogu
   - Koleksiyon silme onay dialogu
   - Resim yükleme ve önizleme
   - Kategori ve şirket seçimi
   - Aktif/Pasif ve Öne Çıkan durumları

3. **GraphQL Integration** ✅

   - URQL client multipart upload desteği
   - File upload mutations
   - Collection queries ve mutations
   - Otomatik yeniden yükleme (refetch)

4. **Image Handling** ✅
   - Next.js Image optimization konfigürasyonu
   - Remote patterns için domain ayarları
   - Upload progress feedback
   - Hata yönetimi ve toast bildirimleri

## 📁 Dosya Yapısı

### Backend

```
server/
├── src/
│   ├── mutations/
│   │   ├── fileUpload.ts         # File upload mutations
│   │   └── collectionResolver.ts # Collection mutations
│   ├── query/
│   │   └── collectionQuery.ts    # Collection queries
│   ├── types/
│   │   ├── File.ts               # File type definition
│   │   ├── Upload.ts             # Upload scalar
│   │   └── Collection.ts         # Collection type
│   └── server.ts                 # Server config with upload middleware
├── uploads/                      # Uploaded files directory
└── prisma/
    └── schema.prisma             # Database schema with File model
```

### Frontend

```
client/
├── src/
│   ├── app/(protected)/dashboard/collections/
│   │   └── page.tsx              # Collections page
│   ├── components/ui/
│   │   ├── image-upload.tsx      # Image upload component
│   │   └── textarea.tsx          # Textarea component
│   ├── lib/graphql/
│   │   ├── queries.ts            # GraphQL queries
│   │   ├── mutations.ts          # GraphQL mutations
│   │   └── urqlClient.ts         # URQL config with upload support
│   └── next.config.ts            # Next.js config with image domains
```

## 🚀 Kullanım

### Koleksiyon Oluşturma

1. Dashboard'da "Koleksiyonlar" sayfasına gidin
2. "Yeni Koleksiyon" butonuna tıklayın
3. Form alanlarını doldurun:
   - **Koleksiyon Adı** (zorunlu)
   - Açıklama
   - Fiyat
   - Stok
   - SKU (otomatik oluşturulur)
   - Slug
   - Kategori
   - Şirket
   - Resimler (maksimum 5 adet)
   - Aktif/Pasif durumu
   - Öne Çıkan durumu
4. "Oluştur" butonuna tıklayın

### Resim Yükleme

1. Koleksiyon formundaki resim alanına tıklayın
2. Dosya seçici açılacak, resimleri seçin
3. Yükleme otomatik başlayacak
4. Yüklenen resimler önizleme olarak gösterilecek
5. İstenmeyen resimleri X butonuyla silebilirsiniz

### Koleksiyon Düzenleme

1. Koleksiyon kartındaki "Düzenle" butonuna tıklayın
2. Değişiklik yapmak istediğiniz alanları güncelleyin
3. "Güncelle" butonuna tıklayın

### Koleksiyon Silme

1. Koleksiyon kartındaki "Sil" butonuna tıklayın
2. Onay dialogunda "Sil" butonuna tıklayın
3. **Not**: İlişkili sample veya order'ları olan koleksiyonlar silinemez

## 🔐 Yetkilendirme

### Admin

- Tüm koleksiyonları görüntüleyebilir
- Herhangi bir koleksiyon oluşturabilir
- Herhangi bir koleksiyonu düzenleyebilir
- Herhangi bir koleksiyonu silebilir

### Manufacturer (Üretici)

- Kendi şirketinin ve genel (global) koleksiyonlarını görüntüleyebilir
- Sadece kendi şirketi için koleksiyon oluşturabilir
- Kendi oluşturduğu veya şirketinin koleksiyonlarını düzenleyebilir
- Kendi oluşturduğu veya şirketinin koleksiyonlarını silebilir

### Customer (Müşteri)

- Sadece aktif koleksiyonları görüntüleyebilir
- Koleksiyon oluşturamaz, düzenleyemez veya silemez

## 🛡️ Güvenlik

1. **Authentication**: Tüm işlemler JWT token ile doğrulanır
2. **Authorization**: Role-based erişim kontrolü
3. **File Validation**:
   - Maksimum dosya boyutu: 10MB
   - Maksimum dosya sayısı: 10
   - Sadece image MIME type'ları kabul edilir
4. **SQL Injection**: Prisma ORM ile korunma
5. **XSS Prevention**: React'ın built-in XSS koruması

## 📝 Notlar

1. **Dosya Yolları**: Backend, yüklenen dosyaları `./uploads/` klasörüne kaydeder
2. **Dosya İsimlendirme**: UUID + orijinal dosya adı formatında saklanır
3. **Static Serving**: Express static middleware ile dosyalar serve edilir
4. **Image Optimization**: Next.js Image component ile otomatik optimizasyon
5. **Error Handling**: Tüm işlemlerde hata yakalama ve toast bildirimleri

## 🐛 Bilinen Sorunlar

Şu an bilinen sorun bulunmamaktadır.

## 🔄 Gelecek Geliştirmeler

1. [ ] Resim boyutlandırma ve thumbnail oluşturma
2. [ ] Toplu resim yükleme
3. [ ] Resim sıralama (drag & drop)
4. [ ] Resim kırpma ve düzenleme
5. [ ] Koleksiyon import/export
6. [ ] Pagination desteği
7. [ ] Advanced filtering
8. [ ] Bulk operations (toplu güncelleme/silme)

## 🤝 API Endpoints

### GraphQL Mutations

```graphql
# File Upload
mutation SingleUpload($file: Upload!) {
  singleUpload(file: $file) {
    id
    filename
    path
    size
  }
}

# Create Collection
mutation CreateCollection($input: CreateCollectionInput!) {
  createCollection(input: $input) {
    id
    name
    images
  }
}

# Update Collection
mutation UpdateCollection($input: UpdateCollectionInput!) {
  updateCollection(input: $input) {
    id
    name
    images
  }
}

# Delete Collection
mutation DeleteCollection($id: Int!) {
  deleteCollection(id: $id) {
    id
    name
  }
}
```

### GraphQL Queries

```graphql
# Get All Collections
query AllCollections($search: String) {
  collections(search: $search) {
    id
    name
    description
    price
    images
    category {
      id
      name
    }
    company {
      id
      name
    }
  }
}

# Get Single Collection
query CollectionById($id: Int!) {
  collection(id: $id) {
    id
    name
    description
    price
    stock
    images
  }
}
```

## 📞 Destek

Herhangi bir sorun yaşarsanız veya öneriniz varsa lütfen iletişime geçin.

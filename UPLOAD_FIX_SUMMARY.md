# 🔧 Upload Sistemi Düzeltme Özeti

## 🐛 Problem

```
Error: No "exports" main defined in graphql-upload/package.json
```

`graphql-upload` paketi eski ve Node.js'in modern ES module sistemiyle uyumlu değildi.

## ✅ Çözüm

GraphQL upload yerine **REST API endpoint** kullanımına geçildi.

### Backend Değişiklikleri

1. **Paket Değişiklikleri**

   ```bash
   npm install multer @types/multer
   # graphql-upload kaldırıldı
   ```

2. **Server Konfigürasyonu** (`server/src/server.ts`)
   - `graphql-upload` import'u kaldırıldı
   - `multer` middleware eklendi
   - `/api/upload` REST endpoint oluşturuldu
3. **GraphQL Schema**

   - `Upload` scalar type kaldırıldı
   - `singleUpload` mutation kaldırıldı
   - `deleteFile` mutation kaldırıldı
   - `File` type kaldırıldı
   - `fileUploadMutations` kaldırıldı

4. **Yeni Upload Endpoint**

   ```typescript
   POST /api/upload
   Content-Type: multipart/form-data
   Authorization: Bearer <token>

   Response:
   {
     "data": {
       "id": "filename",
       "filename": "original.jpg",
       "path": "uploads/filename.jpg",
       "size": 12345,
       "mimetype": "image/jpeg",
       "encoding": "7bit"
     }
   }
   ```

### Frontend Değişiklikleri

1. **GraphQL Mutations Kaldırıldı**

   - `SINGLE_UPLOAD_MUTATION` kaldırıldı
   - `DELETE_FILE_MUTATION` kaldırıldı

2. **Upload Fonksiyonu** (`collections/page.tsx`)

   ```typescript
   // Eski: GraphQL mutation
   const [, uploadFile] = useMutation(SINGLE_UPLOAD_MUTATION);

   // Yeni: REST API fetch
   const response = await fetch(`${serverUrl}/api/upload`, {
     method: "POST",
     body: formData,
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });
   ```

3. **URQL Client**
   - Gereksiz multipart upload kodları temizlendi
   - Basit JSON-only konfigürasyona dönüldü

## 📁 Değiştirilen Dosyalar

### Backend

- ✅ `server/src/server.ts` - Multer middleware ve REST endpoint
- ✅ `server/src/mutations/Mutation.ts` - fileUploadMutations kaldırıldı
- ✅ `server/src/types/index.ts` - File ve Upload export'ları kaldırıldı
- ✅ `server/package.json` - multer eklendi

### Frontend

- ✅ `client/src/app/(protected)/dashboard/collections/page.tsx` - REST upload
- ✅ `client/src/lib/graphql/mutations.ts` - Upload mutations kaldırıldı
- ✅ `client/src/lib/graphql/urqlClient.ts` - Basitleştirildi

## 🎯 Sonuç

✅ Server başarıyla çalışıyor
✅ Upload endpoint hazır (`/api/upload`)
✅ Frontend REST API kullanıyor
✅ GraphQL schema temizlendi
✅ Gereksiz bağımlılıklar kaldırıldı

## 🚀 Test

### 1. Server'ı Başlat

```bash
cd server
npm run dev
```

Çıktı:

```
🚀 Server ready at http://localhost:4000/graphql
📤 Upload endpoint ready at http://localhost:4000/api/upload
```

### 2. Upload Test

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"
```

Beklenen Response:

```json
{
  "data": {
    "id": "1234567890-test-image.jpg",
    "filename": "test-image.jpg",
    "path": "uploads/1234567890-test-image.jpg",
    "size": 12345,
    "mimetype": "image/jpeg",
    "encoding": "7bit"
  }
}
```

### 3. Frontend Test

```bash
cd client
npm run dev
```

- `/dashboard/collections` sayfasına git
- Yeni koleksiyon oluştur
- Resim yükle
- Başarıyla yüklenmeli ve önizleme görünmeli

## 💡 Avantajlar

1. **Daha Kararlı**: Modern paketler kullanılıyor
2. **Daha Basit**: REST endpoint GraphQL'den daha basit
3. **Daha Uyumlu**: Node.js module sistemiyle tam uyumlu
4. **Daha Hızlı**: Multer optimize edilmiş bir middleware
5. **Daha Esnek**: REST endpoint'i istediğiniz yerden kullanabilirsiniz

## 📝 Notlar

- Uploads klasörü otomatik oluşturulmalı
- Maksimum dosya boyutu: 10MB
- Dosya isimleri: `timestamp-random-originalname.ext` formatında
- Static files `/uploads` endpoint'inden serve ediliyor
- JWT token ile authentication korunuyor

## 🔮 Gelecek İyileştirmeler

- [ ] Image resizing ve thumbnail oluşturma
- [ ] Cloud storage entegrasyonu (S3, GCS, vb.)
- [ ] Progress bar için chunk upload
- [ ] Virus scanning
- [ ] Image optimization (sharp, jimp)

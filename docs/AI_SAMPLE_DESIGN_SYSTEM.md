# 🎨 AI Sample Design Generator - ComfyUI Integration

## Özellik Özeti

AI destekli numune tasarım sistemi. Kullanıcılar eskiz veya referans görsel yükleyerek, Stable Diffusion + ControlNet ile profesyonel numune tasarımları oluşturabilir.

## Teknoloji Stack

- **Backend**: Node.js + GraphQL (Nexus)
- **AI Engine**: ComfyUI + Stable Diffusion + ControlNet
- **Frontend**: Next.js 14 + React + urql
- **Database**: MySQL (Prisma ORM)

## Kurulum

### 1. ComfyUI Kurulumu (Sunucuda çalışıyor olmalı)

ComfyUI'ın `http://127.0.0.1:8188` adresinde çalıştığından emin olun.

Gerekli modeller:
- Stable Diffusion checkpoint (örn: `sd_xl_base_1.0.safetensors`)
- ControlNet model (örn: `control_v11p_sd15_canny.pth`)

### 2. Environment Variables

`server/.env` dosyasına ekleyin:

```env
COMFYUI_URL=http://127.0.0.1:8188
```

### 3. Database Migration

```bash
cd server
npx prisma db push
```

### 4. Backend Dependencies

```bash
cd server
npm install axios form-data
```

## Kullanım

### Frontend'de Kullanım

```tsx
import { AIDesignGenerator } from "@/components/AI/AIDesignGenerator";

// Herhangi bir sayfada kullanın
<AIDesignGenerator
  collectionId={123} // Opsiyonel
  onSuccess={(sample) => {
    console.log("✨ Yeni AI numune:", sample);
    // Başarılı olduğunda yapılacak işlemler
  }}
/>
```

### Buton Ekleme Örnekleri

#### 1. Collection Detail Sayfasında

`client/src/app/(protected)/dashboard/collections/[id]/page.tsx`:

```tsx
import { AIDesignGenerator } from "@/components/AI/AIDesignGenerator";

// Component içinde:
<div className="flex gap-2">
  <Button>Sipariş Ver</Button>
  <Button>Numune İste</Button>
  <AIDesignGenerator
    collectionId={collection.id}
    onSuccess={(sample) => {
      router.push(`/dashboard/samples/${sample.id}`);
    }}
  />
</div>
```

#### 2. Samples Listesi Sayfasında

`client/src/app/(protected)/dashboard/samples/page.tsx`:

```tsx
<div className="flex justify-between items-center mb-6">
  <h1>Numunelerim</h1>
  <AIDesignGenerator
    onSuccess={() => {
      refetch(); // Listeyi yenile
    }}
  />
</div>
```

#### 3. Dashboard Ana Sayfasında

```tsx
<Card>
  <CardHeader>
    <CardTitle>Hızlı İşlemler</CardTitle>
  </CardHeader>
  <CardContent>
    <AIDesignGenerator />
  </CardContent>
</Card>
```

## Workflow Akışı

```
1. Kullanıcı eskiz yükler + prompt yazar
   ↓
2. Frontend: /api/upload ile eskiz sunucuya yüklenir
   ↓
3. GraphQL Mutation: generateSampleDesign
   ↓
4. ComfyUI Service:
   - Eskiz ComfyUI'a upload
   - Workflow oluşturulur (SD + ControlNet)
   - Prompt queue'ya eklenir
   ↓
5. ComfyUI:
   - ControlNet ile eskiz analizi
   - Stable Diffusion ile görsel üretimi
   - Sonuç kaydedilir
   ↓
6. Backend:
   - Üretilen görsel indirilir
   - Sample database'e kaydedilir
   - Frontend'e sonuç döner
   ↓
7. Frontend: Başarı mesajı + yeni sample gösterilir
```

## Database Schema

```prisma
model Sample {
  // ... mevcut alanlar ...

  // AI Generated Sample fields
  name         String?
  description  String?
  images       String?      // JSON array
  aiGenerated  Boolean?     @default(false)
  aiPrompt     String?      // User's prompt
  aiSketchUrl  String?      // Original sketch URL
}
```

## GraphQL API

### Mutation

```graphql
mutation GenerateSampleDesign(
  $sketchUrl: String!
  $prompt: String!
  $negativePrompt: String
  $width: Int
  $height: Int
  $steps: Int
  $cfgScale: Int
  $collectionId: Int
  $sampleName: String
  $description: String
) {
  generateSampleDesign(
    sketchUrl: $sketchUrl
    prompt: $prompt
    negativePrompt: $negativePrompt
    width: $width
    height: $height
    steps: $steps
    cfgScale: $cfgScale
    collectionId: $collectionId
    sampleName: $sampleName
    description: $description
  ) {
    id
    sampleNumber
    name
    description
    status
    images
    aiGenerated
    aiPrompt
    aiSketchUrl
    createdAt
  }
}
```

### Parametreler

- **sketchUrl** (required): Eskiz/referans görsel URL'i
- **prompt** (required): Tasarım açıklaması (İngilizce önerilir)
- **negativePrompt**: İstenmeyen özellikler
- **width/height**: Görsel boyutu (default: 512x512)
- **steps**: Üretim adımı sayısı (default: 20)
- **cfgScale**: CFG scale (default: 7.5)
- **collectionId**: İlişkilendirilecek koleksiyon
- **sampleName**: Numune adı
- **description**: Açıklama/notlar

## ComfyUI Workflow

Kullanılan nodlar:
1. **CheckpointLoaderSimple**: SD modeli yüklenir
2. **CLIPTextEncode**: Prompt ve negative prompt işlenir
3. **LoadImage**: Eskiz yüklenir
4. **ControlNetLoader**: ControlNet modeli yüklenir
5. **ControlNetApply**: Eskiz ile conditioning uygulanır
6. **KSampler**: Görsel üretimi
7. **VAEDecode**: Latent'tan image'a dönüşüm
8. **SaveImage**: Sonuç kaydedilir

## Özelleştirme

### Farklı ControlNet Modelleri

`server/src/utils/comfyui.ts` dosyasında:

```typescript
'5': {
  inputs: {
    control_net_name: 'control_v11p_sd15_canny.pth', // Bunu değiştirin
  },
  class_type: 'ControlNetLoader',
}
```

Alternatifler:
- `control_v11p_sd15_canny.pth` - Kenar algılama
- `control_v11p_sd15_openpose.pth` - Poz takibi
- `control_v11p_sd15_depth.pth` - Derinlik haritası
- `control_v11f1p_sd15_depth.pth` - İyileştirilmiş derinlik

### Stable Diffusion Modeli

```typescript
'1': {
  inputs: {
    ckpt_name: 'sd_xl_base_1.0.safetensors', // Modelinizi buraya
  },
  class_type: 'CheckpointLoaderSimple',
}
```

## Troubleshooting

### ComfyUI bağlantı hatası

```
Error: Failed to connect to ComfyUI
```

**Çözüm**: ComfyUI'ın çalıştığından emin olun:
```bash
cd ComfyUI
python main.py
```

### Model bulunamadı

```
Error: Checkpoint not found
```

**Çözüm**: Model dosyalarını doğru klasöre koyun:
- Checkpoints: `ComfyUI/models/checkpoints/`
- ControlNet: `ComfyUI/models/controlnet/`

### Timeout hatası

```
Error: ComfyUI workflow timed out
```

**Çözüm**:
- Steps sayısını azaltın (örn: 20 → 15)
- Görsel boyutunu küçültün (örn: 512x512 → 384x384)
- `maxWaitTime` değerini artırın

## Performans İyileştirmeleri

1. **GPU Kullanımı**: ComfyUI'ı GPU ile çalıştırın
2. **Model Optimizasyonu**: Daha küçük/hızlı modeller kullanın
3. **Batch Processing**: Birden fazla numune için queue sistemi
4. **Caching**: Sık kullanılan prompt'lar için cache

## Gelecek Geliştirmeler

- [ ] Batch numune üretimi
- [ ] Farklı stillerde varyasyonlar
- [ ] Kullanıcı tercihlerini öğrenme
- [ ] Otomatik kalite kontrolü
- [ ] Video/animasyon üretimi
- [ ] 3D model entegrasyonu

## Lisans

MIT

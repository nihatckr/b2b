# ComfyUI Workflow Kurulum Kılavuzu

## Workflow'unuzu Projeye Eklemek

### Adım 1: ComfyUI'da Workflow'u Export Edin

1. ComfyUI'ı açın: http://127.0.0.1:8188
2. `protext_flow_design` workflow'unuzu yükleyin veya oluşturun
3. **Sağ üst köşede** "Save (API Format)" butonuna tıklayın
4. JSON dosyasını kaydedin

### Adım 2: JSON Dosyasını Projeye Kopyalayın

Kaydettiğiniz JSON dosyasını şu konuma kopyalayın:
```
server/src/workflows/protext_flow_design.json
```

### Adım 3: Workflow Parametreleri

Sistem otomatik olarak şu parametreleri güncelleyecek:

- **Prompt (Positive)**: `CLIPTextEncode` node'unda
- **Negative Prompt**: `CLIPTextEncode` node'unda (negative içeren)
- **Sketch Image**: `LoadImage` node'unda
- **Width/Height**: `EmptyLatentImage` node'unda
- **Steps & CFG**: `KSampler` node'unda

### Adım 4: Gerekli Node'lar

Workflow'unuzda şu node'lar bulunmalı:

1. ✅ **CLIPTextEncode** (x2) - Pozitif ve negatif prompt için
2. ✅ **LoadImage** - Sketch/referans görsel için
3. ✅ **EmptyLatentImage** - Boyut ayarları için
4. ✅ **KSampler** - Render ayarları için
5. ✅ **SaveImage** - Sonucu kaydetmek için

### Örnek Workflow Yapısı

```json
{
  "prompt": {
    "1": {
      "inputs": {
        "ckpt_name": "your_model.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "2": {
      "inputs": {
        "text": "PROMPT_WILL_BE_REPLACED",
        "clip": ["1", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "3": {
      "inputs": {
        "text": "NEGATIVE_PROMPT_WILL_BE_REPLACED",
        "clip": ["1", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "4": {
      "inputs": {
        "image": "IMAGE_NAME_WILL_BE_REPLACED",
        "upload": "image"
      },
      "class_type": "LoadImage"
    }
  }
}
```

## Test Etmek

1. Server'ı yeniden başlatın:
   ```bash
   cd server
   npm run dev
   ```

2. AI Features sayfasına gidin:
   - Dashboard → AI Features
   - Eskiz yükleyin
   - Prompt yazın
   - Generate'e tıklayın

3. Console loglarını kontrol edin:
   - ✅ "Using custom workflow: protext_flow_design" görmelisiniz
   - Veya ⚠️ "Custom workflow not found, using default workflow"

## Troubleshooting

### Workflow yüklenmiyor
- JSON dosyasının doğru konumda olduğunu kontrol edin
- JSON formatının geçerli olduğunu doğrulayın
- Console'da hata mesajlarını kontrol edin

### Parametreler güncellenmiyor
- Node'ların `class_type` değerlerini kontrol edin
- Input field isimlerinin doğru olduğunu doğrulayın

### ComfyUI bağlanamıyor
- ComfyUI'ın çalıştığını kontrol edin: http://127.0.0.1:8188
- `.env` dosyasında `COMFYUI_URL` değişkenini kontrol edin

## İpuçları

1. **Model Seçimi**: `CheckpointLoaderSimple` node'unda kullanmak istediğiniz Stable Diffusion modelini belirtin
2. **ControlNet**: Sketch-based generation için ControlNet kullanmayı unutmayın
3. **Seed**: Her istek için otomatik olarak random seed üretilir
4. **Output**: `SaveImage` node'u `filename_prefix: "sample_design"` kullanır

## Varsayılan Workflow

Eğer custom workflow yoksa, sistem şu varsayılan workflow'u kullanır:
- SDXL Base 1.0
- ControlNet Canny
- Euler sampler
- 20 steps, CFG 7.5

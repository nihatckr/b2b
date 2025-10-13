# 🏭 Company-Centric Sistem Güncellemeleri

## ✅ Mevcut Durum (İyi)

Backend'de company logic zaten var ve doğru çalışıyor:

- ✅ Company → Users, Collections, Samples, Orders ilişkileri var
- ✅ MANUFACTURE user'lar company'lerine göre filtreleniyor
- ✅ Permissions company-based çalışıyor

## 🔧 Yapılacak Güncellemeler

### 1. Signup Form - Company Seçimi Zorunlu

MANUFACTURE role seçilince:

- Company dropdown göster
- Company seçimi zorunlu yap
- Yeni company oluşturma opsiyonu

### 2. UI Gösterimleri - Company Öncelikli

**Collections Page**:

```
Eski: "Yaz Koleksiyonu - Ali Yılmaz tarafından"
Yeni: "Yaz Koleksiyonu - Defacto Tekstil"
```

**Samples/Orders Listesi**:

```
Müşteri için:
  Şirket: Defacto Tekstil ← BÜYÜK
  İlgili: Ali Y. ← küçük

Üretici için:
  Müşteri: Ayşe Demir ← BÜYÜK
  Email: ayse@email.com ← küçük
```

### 3. Dashboard - Company Vurgusu

```
Üretici Dashboard:
"Defacto Tekstil - Üretim Paneli"
"Şirketinize gelen 15 numune talebi"
"Toplam 8 aktif sipariş"
```

### 4. Company Profile Sayfası (Yeni)

Her company için:

- Company bilgileri
- Koleksiyonlar
- İstatistikler
- Çalışanlar listesi

---

## 📋 Uygulama Planı

1. ✅ Backend zaten hazır (değişiklik yok)
2. ⏳ Signup form'a company seçimi ekle
3. ⏳ UI gösterimlerini company-centric yap
4. ⏳ Dashboard'ları güncelle

**Bu güncellemeleri şimdi yapalım mı, yoksa production tracking'e devam mı?**

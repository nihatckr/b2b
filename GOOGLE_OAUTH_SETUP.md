# Google OAuth Setup Guide

## Frontend Setup Tamamlandı ✅

### 1. Environment Variables

`.env.local` dosyasına Google OAuth credentials'ı ekleyin:

```bash
# Google OAuth - https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Google Cloud Console Configuration

Google OAuth'u etkinleştirmek için:

1. [Google Cloud Console](https://console.cloud.google.com) ziyaret edin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** → **OAuth 2.0 Client ID** oluşturun
4. **Application Type**: Web application seçin
5. **Authorized redirect URIs** ekleyin:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google  (production)
   ```
6. Client ID ve Client Secret'ı kopyalayın

### 3. Frontend Changes

#### LoginForm (`src/components/auth/login-form.tsx`)

- ✅ Google giriş state'i eklendi
- ✅ `handleGoogleSignIn()` fonksiyonu eklendi
- ✅ Google giriş button'ı eklendi (outline style, Google icon)
- ✅ "Veya" separator eklendi

#### SignupForm (`src/components/auth/signup-form.tsx`)

- ✅ Google giriş state'i eklendi
- ✅ `handleGoogleSignIn()` fonksiyonu eklendi
- ✅ Google giriş button'ı eklendi
- ✅ "Veya" separator eklendi

#### NextAuth Route Handler (`src/app/api/auth/[...nextauth]/route.ts`)

- ✅ GoogleProvider import'u eklendi
- ✅ GoogleProvider provider'ı eklendi
- ✅ `signIn` callback'i eklendi (Backend sync için)
- ✅ OAuth kullanıcılar otomatik Backend'de kayıt olur

### 4. Backend Changes

#### Auth Mutation (`backend/src/graphql/mutations/authMutation.ts`)

- ✅ `signupOAuth` mutation'ı eklendi
- Email kontrol: var mı, varsa güncelle; yoksa oluştur
- Şifresiz OAuth kullanıcı desteği

## Google OAuth Flow

```
1. Kullanıcı "Google ile Giriş Yap" butonuna tıklar
   ↓
2. NextAuth → Google OAuth flow
   ↓
3. Kullanıcı Google'da kimliğini doğrular
   ↓
4. Google → NextAuth callback
   ↓
5. NextAuth signIn callback tetiklenir
   ├─ Backend'e signupOAuth mutation gönderilir
   ├─ Backend: Email var mı? (Evet → güncelle / Hayır → oluştur)
   └─ Backend token döndürülür
   ↓
6. Kullanıcı session'a kaydedilir
   ├─ session.user.id
   ├─ session.user.email
   ├─ session.user.name
   ├─ session.user.role
   ├─ session.user.backendToken (GraphQL auth)
   └─ session.user.companyId
   ↓
7. Dashboard'a yönlendirilir
```

## Testing

### Local Test (http://localhost:3000)

1. Backend'i başlat:

```bash
cd backend
npm run dev
```

2. Frontend'i başlat:

```bash
cd frontend
npm run dev
```

3. `/auth/login` veya `/auth/signup` ziyaret et
4. "Google ile Giriş Yap" butonu kısayol seç
5. Google hesabında oturum aç
6. Otomatik `/dashboard`'a yönlendir

### GraphQL Backend Tests

Credentials mutation'ı test et:

```graphql
mutation {
  signupOAuth(email: "user@gmail.com", name: "John Doe") {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

## Envrionment Variables Özeti

| Variable               | Örnek                                  | Kaynak               |
| ---------------------- | -------------------------------------- | -------------------- |
| `GOOGLE_CLIENT_ID`     | `123456789.apps.googleusercontent.com` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...`                           | Google Cloud Console |
| `NEXTAUTH_SECRET`      | Auto-generated                         | NextAuth             |
| `NEXTAUTH_URL`         | `http://localhost:3000`                | NextAuth             |

## Security Notes

⚠️ **Production için önemli:**

1. `.env.local`'ı `.gitignore`'e ekle (zaten ekli)
2. NEXTAUTH_SECRET'ı production'da güçlü bir değerle değiştir
3. Google OAuth callback URL'ini HTTPS ile konfigüre et
4. Backend'de OAuth user validation'ı ekle
5. CORS ayarlarını kontrol et

## Troubleshooting

### "Google signin failed" hatası

- Google Cloud Console'de Client ID/Secret'ı kontrol et
- Redirect URI'ların doğru olduğundan emin ol
- `.env.local` dosyasının reload olduğunu kontrol et

### "Backend sync failed"

- Backend'in çalıştığından emin ol (port 4001)
- GraphQL endpoint'i erişilebilir mi kontrol et
- Browser console'da hataları kontrol et

### OAuth hesabı var mı?

- Email adresinin daha önceki signup/login ile eşleşme durumunu kontrol et
- Backend Prisma Studio'da user'ı kontrol et

## Next Steps

- [ ] JWT token generation'ı implement et (şu an: dummy token)
- [ ] Token refresh mechanism'i ekle
- [ ] OAuth provider olarak GitHub ekle
- [ ] Session persistence test'i yap
- [ ] Rate limiting ekle
- [ ] Audit logging ekle

# web/frontend/

Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui tabanlı doktor
arayüzü.

## Kimlik doğrulama

`next-auth` v5 (`auth.ts`), Credentials provider ile Django backend'deki JWT
token endpoint'ini (`/api/accounts/v1/token/`) çağırır. Access token 25
dakikada bir refresh token ile otomatik yenilenir.

- `app/(auth)/login/` — giriş sayfası (Server Component + Server Action +
  `useActionState` ile hata gösterimi)
- `app/(dashboard)/` — korumalı alan; `layout.tsx` içinde `auth()` kontrolü,
  oturum yoksa `/login`'e yönlendirir
- `lib/api.ts` — Django API'sine, oturumdaki JWT'yi `Authorization` header'ı
  olarak ekleyen fetch wrapper'ı (`djangoFetch`/`djangoFetchJson`)

## Sayfalar

- `/` — hasta listesi (`app/(dashboard)/page.tsx`)
- `/patients/new` — yeni hasta ekleme (Server Action)
- `/patients/[id]` — hasta detayı: kayıt listesi + ses kaydı yükleme formu
  (yükleme, Django'daki `run_analysis`'i tetikleyip senkron bekliyor)
- `/recordings/[id]` — analiz raporu: kalp hızı/sistol/diyastol kartları,
  PCG rapor görseli, filtrelenmiş ses oynatıcı, "Yazdır/PDF Olarak Kaydet"
  butonu (`window.print()` + `print:` CSS varyantı — ek kütüphane yok)

Hasta detayında (`/patients/[id]`), o hastanın ≥2 tamamlanmış analizi varsa
kalp hızı/sistol/diyastol için 3 küçük SVG trend grafiği (`trend-sparkline.tsx`)
gösteriliyor — `dataviz` skill'ine göre tasarlandı, `--chart-1/2/3` CSS
değişkenleri (`app/globals.css`) doğrulanmış kategorik paletle dolduruldu.

Not: Ses dosyası yükleme formu (`Server Action` + `FormData`) gerçek bir
tarayıcıda henüz elle test edilmedi — bu ortamda headless tarayıcı aracı
(chromium-cli/Playwright) yok. Diğer tüm sayfalar gerçek oturum çerezi
üzerinden HTTP seviyesinde test edildi.

## Çalıştırma

```bash
npm run dev   # http://localhost:3000
```

`.env.local` gerekli (`.env.local.example`'a bakın): `AUTH_SECRET`,
`DJANGO_API_URL`.

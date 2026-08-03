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
  olarak ekleyen fetch wrapper'ı

## Çalıştırma

```bash
npm run dev   # http://localhost:3000
```

`.env.local` gerekli (`.env.local.example`'a bakın): `AUTH_SECRET`,
`DJANGO_API_URL`.

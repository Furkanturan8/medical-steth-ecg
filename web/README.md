# web/

Doktorun hasta kalp sesi (PCG) kayıtlarını arayüz üzerinden inceleyebilmesi için
web uygulaması.

- `backend/` — Django + Django REST Framework API. JWT (SimpleJWT) ile doktor
  girişi, `accounts` (kullanıcı) ve `recordings` (hasta/kayıt/analiz sonucu)
  app'leri. Veritabanı: PostgreSQL (local dev). Ses dosyaları yerel diskte
  (`media/`) tutulur.
- `frontend/` — Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
  `next-auth` v5, backend'deki JWT token endpoint'ine bağlanan bir Credentials
  provider ile doktor girişini yönetir.

## Yerel geliştirme

Backend:
```bash
source ../../.venv/bin/activate   # kök .venv, signal_processing ile paylaşılıyor
cd backend
python manage.py migrate
python manage.py runserver 8000
```

Frontend:
```bash
cd frontend
npm run dev   # http://localhost:3000
```

Ortam değişkenleri için `backend/.env.example` ve `frontend/.env.local.example`
dosyalarına bakın (gerçek `.env`/`.env.local` git'e girmez).

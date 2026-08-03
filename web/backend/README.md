# web/backend/

Django + Django REST Framework API sunucusu.

## Yapı

Stack konvansiyonu (`~/Desktop/.claude/stacks/django/rules`) gereği her app
`models/`, `serializers/v1/`, `views/v1/`, `filters/`, `services/` alt
klasörlerine bölünmüş şekilde `apps/` altında tutulur:

- `apps/accounts/` — `User` (custom, `AbstractUser` tabanlı) modeli, JWT
  token endpoint'leri (`/api/accounts/v1/token/`, `/token/refresh/`).
- `apps/recordings/` — `Patient`, `Recording`, `AnalysisResult` modelleri.
  Henüz serializer/viewset eklenmedi (API endpoint'leri sıradaki iş).

## Kimlik doğrulama

`djangorestframework-simplejwt` ile JWT. `AUTH_USER_MODEL = accounts.User`.
Next.js frontend `next-auth` üzerinden bu token endpoint'lerini çağırır.

## Veritabanı

PostgreSQL, local dev'de `medical_steth_dev` (rol: `medical_steth_web`).
Bağlantı bilgileri `.env` içinde (`.env.example`'a bakın). Not: local Postgres
kurulumu `pg_hba.conf`'ta `trust` moduna alındı (yalnızca bu geliştirme
makinesi için — üretimde kullanılmaz).

## Çalıştırma

```bash
source ../../.venv/bin/activate
python manage.py migrate
python manage.py runserver 8000
```

# web/backend/

Django + Django REST Framework API sunucusu.

## Yapı

Stack konvansiyonu (`~/Desktop/.claude/stacks/django/rules`) gereği her app
`models/`, `serializers/v1/`, `views/v1/`, `filters/`, `services/` alt
klasörlerine bölünmüş şekilde `apps/` altında tutulur:

- `apps/accounts/` — `User` (custom, `AbstractUser` tabanlı) modeli, JWT
  token endpoint'leri (`/api/accounts/v1/token/`, `/token/refresh/`).
- `apps/recordings/` — `Patient`, `Recording`, `AnalysisResult` modelleri;
  `/api/recordings/v1/patients/` ve `/api/recordings/v1/recordings/` (DRF
  router). Bir kayıt yüklendiğinde (`multipart/form-data`, `audio_file`
  alanı) `services/analysis.py` içindeki `run_analysis()` otomatik olarak
  `signal_processing/src/pipeline.py`'yi çalıştırıp `AnalysisResult`'u
  (kalp hızı, sistol/diyastol, S1/S2 zaman damgaları, rapor PNG'si,
  filtrelenmiş WAV) dolduruyor — senkron, kuyruk yok.

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

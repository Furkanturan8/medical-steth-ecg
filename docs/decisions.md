# Kararlar

Projenin yönünü etkileyen, geriye dönüp "neden böyle yaptık" diye
sorulabilecek kararlar burada tutulur.

---

## Web arayüzü mimarisi

Proje, doktorun hasta kalp sesi (PCG) kayıtlarını inceleyebileceği bir web
arayüzüne taşınıyor (bkz. `web/README.md`). Alınan mimari kararlar:

| Konu | Karar | Gerekçe |
|---|---|---|
| Backend | Django + Django REST Framework | Kullanıcının mevcut Django stack kütüphanesiyle (`~/Desktop/.claude/stacks/django`) uyumlu; hazır admin panel, ORM, auth. |
| Veritabanı | PostgreSQL (local: `medical_steth_dev`) | Kullanıcı tercihi; local makinede zaten kurulu (Homebrew, v14). |
| Dosya depolama | Yerel disk (`web/backend/media/`) | MVP için yeterli, tek sunuculu kurulum. Nesne depolama (S3/MinIO) sonraki aşamaya bırakıldı. |
| Kimlik doğrulama | JWT (`djangorestframework-simplejwt`) + `next-auth` v5 Credentials provider | Next.js (localhost:3000) ↔ Django (localhost:8000) cross-origin API kullanımı için standart yaklaşım. MVP'den itibaren gerçek login var (sonradan eklemek yerine). |
| Python ortamı | Kök `.venv` paylaşılıyor (ayrı `web/backend/.venv` yok) | `signal_processing` kodunu backend'den doğrudan import edebilmek için; iki ayrı venv yönetmenin getirisi düşük görüldü. |
| Dev ortamı | Native (Docker yok) — venv + local Postgres | Kullanıcı tercihi; mevcut `.venv` iş akışıyla tutarlı. |
| Django app yapısı | `apps/accounts` (doktor kullanıcı) + `apps/recordings` (Patient/Recording/AnalysisResult) | İki app MVP için yeterli ayrım; gereksiz parçalanma yok. |
| Custom user modeli | `accounts.User(AbstractUser)`, ekstra alan yok | Django'da sonradan custom user modeline geçmek migration/db'yi yeniden kurmayı gerektiriyor — en baştan kurmak bu riski önlüyor. |
| Frontend | Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui | Kullanıcının mevcut Next.js stack kütüphanesiyle uyumlu. Server Component varsayılan, mutasyonlar Server Actions ile (`~/Desktop/.claude/stacks/nextjs-ts-react/rules`). |

### Local Postgres auth notu

Homebrew'daki `postgresql@14` kurulumunda `pg_hba.conf` varsayılan olarak
`md5` (şifreli) idi ve mevcut şifre bilinmiyordu. Kullanıcı onayıyla yalnızca
bu geliştirme makinesi için `local`/`host` (127.0.0.1, ::1) satırları
`trust`'a çevrildi (`replication` satırları `md5` kaldı). Orijinal dosya
`pg_hba.conf.bak` olarak yedeklendi. **Bu değişiklik yalnızca local geliştirme
içindir, production'da kullanılmamalıdır.**

### Kısıtlama: bağımlılık kurulumu

Bu projenin `.claude/settings.json`'ı (stack kütüphanesinden kopyalanan
template) `pip install` ve `npm install` komutlarını kasıtlı olarak Claude'a
kapatıyor — bağımlılık değişiklikleri her zaman kullanıcı tarafından elle
çalıştırılıyor. Bu yüzden backend/frontend kurulumunda paket kurulum adımları
kullanıcıya komut olarak verildi, Claude yalnızca kurulum sonrası dosya/kod
işlerini yaptı.

# data/

Projede kullanılan tüm ses/sinyal verileri burada tutulur.

- `raw/` — kaynağından hiç değiştirilmeden indirilen ham kayıtlar
- `processed/` — filtrelenmiş/temizlenmiş, işlenmiş sinyal çıktıları
- `exports/` — analizden dışa aktarılan CSV, grafik gibi paylaşılabilir çıktılar

Ham veri hiçbir zaman doğrudan düzenlenmez; işleme adımları `signal_processing/`
altındaki kod ile yapılır ve sonuç `processed/` veya `exports/` altına yazılır.

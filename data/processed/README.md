# data/processed/

`data/raw/` altındaki ham kayıtların filtrelenmiş/temizlenmiş halleri.

- `own_recordings/` — `data/raw/own_recordings/` içindeki kendi
  kayıtlarımızın band-pass+notch filtre zincirinden geçirilmiş, dinlenebilir
  WAV hali (`signal_processing/notebooks/01_ilk_analiz.ipynb`, Bölüm 13d ile
  üretiliyor). `.gitignore`'daki `data/processed/*` kuralı gereği bu dosyalar
  git'e girmez — kişisel ses verisi olduğu için yalnızca local'de tutulur.

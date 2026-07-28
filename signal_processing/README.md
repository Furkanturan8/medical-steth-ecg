# signal_processing/

Python ile sinyal işleme ve doğrulama çalışmaları — projenin şu anki
odak noktası (README "Aşama 3 — Python ile doğrulama").

- `notebooks/` — analiz notebook'ları (Jupyter); asıl çalışma burada yürüyor
- `src/` — notebook'larda olgunlaşan mantığın yeniden kullanılabilir Python
  koduna dönüştürüleceği yer
- `filters/` — band-pass, notch gibi filtre implementasyonları
- `tests/` — `src/`/`filters/` içindeki kod için birim testleri

Şu an filtreleme ve S1/S2 segmentasyon mantığı doğrudan
`notebooks/01_ilk_analiz.ipynb` içinde; `src/`, `filters/`, `tests/` bu
mantık koda dönüştürüldüğünde kullanılacak.

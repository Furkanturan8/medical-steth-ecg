# signal_processing/src/

`notebooks/01_ilk_analiz.ipynb`'de doğrulanmış, web backend'inin (`web/backend`)
de kullandığı mantığın yeniden kullanılabilir Python modülleri. Notebook'un
kendisi değiştirilmedi — burada aynı fonksiyonların (deneysel kod tekrarını
önlemek için) tek, import edilebilir kopyası tutuluyor.

- `filters.py` — `bandpass`/`notch` (offline, zero-phase) ve `bandpass_causal`/
  `notch_causal` (ESP32 gerçek zamanlı prova için, Bölüm 12); `clean_signal()`
  ikisini zincirleyen kısayol.
- `envelope.py` — `compute_envelope` (Hilbert), `compute_envelope_lightweight`
  (hafif, ESP32 adayı), `detect_peaks`.
- `segmentation.py` — `label_s1_s2` (medyan eşikli, kaskad oluşturmayan
  etiketleme, Bölüm 8) ve bunları birleştiren `analyze_recording()`.
- `report.py` — `render_report_figure()`, doktora sunum için sinyal+zarf+S1/S2
  ve spektrogramı birlikte çizen fonksiyon (Bölüm 14).
- `pipeline.py` — `analyze_wav_file(path)`: bir WAV dosyasını yükleyip yukarıdaki
  zinciri uçtan uca çalıştırır. Backend'in `run_analysis` servisi bunu çağırır.

Notebook'ta bir şey değişirse (yeni filtre, ayar) buradaki karşılığı da
güncellenmeli — şu an senkronizasyon elle yapılıyor, otomatik değil.

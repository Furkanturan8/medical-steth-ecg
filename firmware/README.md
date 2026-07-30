# firmware/

ESP32 üzerinde çalışan gömülü yazılım.

- `esp32_steth/` — Arduino framework ile yazılmış ESP32 sketch'i
  (`esp32_steth.ino`); MAX9814'ten `analogRead` ile örnekleme yapıp ham PCM
  veriyi Serial üzerinden gönderiyor. Karşı taraftaki Python alıcısı:
  `scripts/record_from_esp32.py`.

Bu klasör README'deki "Aşama 4 — ESP32 gerçek zamanlı çalışma" ile
ilgilidir. İlk çalışan uçtan uca kayıt zinciri (ESP32 → Serial → Python →
WAV) bu haliyle kuruldu; ADC continuous mode / DMA buffer / gömülü tarafta
filtreleme gibi ESP-IDF gerektiren daha ileri adımlar henüz yapılmadı.

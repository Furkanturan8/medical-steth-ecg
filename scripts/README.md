# scripts/

Tek seferlik veya tekrarlı yardımcı script'ler için ayrılmıştır (örn. veri
seti indirme, toplu dönüştürme, ölçüm otomasyonu).

- `record_from_esp32.py` — `firmware/esp32_steth/esp32_steth.ino` çalışan
  ESP32'den Serial üzerinden ham PCM veri okuyup WAV dosyasına yazan
  karşılama script'i. `"START"` satırını bekler, `"END"` görene kadar
  byte'ları toplar. Kullanmadan önce `PORT` (şu an `"COM7"`, Windows'a
  özel — macOS'ta `/dev/tty.usbserial-*` gibi bir değere değişmesi gerekir)
  ve çıktı dosya adı (`yahia_heart2.wav`) elle güncellenmeli.

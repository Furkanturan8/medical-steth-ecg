# firmware/esp32_steth/

ESP32 üzerinde çalışan, ses toplayıp Serial üzerinden gönderen sketch.

- `esp32_steth.ino` — Arduino framework ile yazılmış ilk çalışan versiyon
  (ESP-IDF değil — proje başta ESP-IDF ile planlanmıştı, ama ilk gerçek
  donanım testi Arduino ile yapıldı ve işe yaradığı için bu haliyle
  bırakıldı). `analogRead` ile 16 kHz'de örnekleme yapar, 16-bit imzalı
  PCM'e çevirip `Serial.write` ile ham byte olarak yollar; kayıt başı/sonu
  `"START"` / `"END"` metin satırlarıyla işaretlenir. Karşı taraftaki
  alıcı script: `scripts/record_from_esp32.py`.

**Not:** Dosyanın başındaki yorum `MAX9814 OUT -> GPIO36` diyor ama kodda
`MIC_PIN = 34` kullanılıyor — hangisinin doğru bağlantı olduğu kontrol
edilmeli.

ADC continuous mode / DMA buffer / gömülü filtreleme gibi daha ileri
ESP-IDF tabanlı adımlar henüz yapılmadı; ileride gerekirse ayrı bir
ESP-IDF hedefi olarak eklenebilir.

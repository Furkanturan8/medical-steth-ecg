# firmware/

ESP32 üzerinde çalışacak gömülü yazılım.

- `esp32_steth/` — ESP-IDF tabanlı ESP32 projesi (ADC continuous mode ile
  veri toplama, DMA buffer yönetimi, gömülü tarafta filtreleme)

Bu klasör README'deki "Aşama 4 — ESP32 gerçek zamanlı çalışma" ile
ilgilidir. ESP-IDF kurulu (`~/esp/esp-idf`, her terminalde
`. ~/esp/esp-idf/export.sh` gerekiyor) ama proje şu an önce Python ile
sinyal işleme doğrulamasına (Aşama 3) odaklanıyor; gömülü taraf beklemede.

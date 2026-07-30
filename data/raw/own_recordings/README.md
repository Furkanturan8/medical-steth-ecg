# own_recordings/

Kendi donanımımızla (ESP32 + MAX9814) kaydedilmiş kalp sesi örnekleri.
`firmware/esp32_steth/esp32_steth.ino` + `scripts/record_from_esp32.py`
zinciriyle toplandı.

- `abdul_heart1.wav`, `muhammed_heart1.wav`, `nadeemHeart1.wav` — 16000 Hz,
  16-bit mono WAV
- PhysioNet kayıtlarının aksine (bkz. `../physionet-cinc2016-a/`) dışarıdan
  indirilmedi, atıf/lisans gereksinimi yok — kendi verimiz.

Ham veri, `physionet-cinc2016-a/` ile aynı kuralla elle düzenlenmez;
herhangi bir işlem sonucu `data/processed/` altına yazılır.

- kvkk gizlilik hakkından dolayı bireylerden alınan ses örnekleri localdedir.
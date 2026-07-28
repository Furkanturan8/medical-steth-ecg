# Medikal Steteskop Gürültü Filtreleme ve ESP32 Entegrasyonu

Bu proje, **MAX9814 tabanlı elektronik steteskop** sinyalindeki ortam gürültüsünü azaltmak, kalp seslerini daha temiz hale getirmek ve filtrelenmiş sinyali mevcut **ESP32 tabanlı EKG cihazına** entegre etmek amacıyla geliştirilmektedir. MAX9814, analog çıkış veren ve AGC içeren bir mikrofon yükselteç modülüdür; bu nedenle sistemin merkezinde analog ses toplama, ADC ile örnekleme ve dijital filtreleme yer alır [web:109][file:53].

Projenin temel hedefi doğrudan “cihaz yapmak” değil, önce güvenilir bir **araştırma ve prototipleme platformu** kurmaktır. Bu platform üzerinden analog filtre tasarımı, sinyal analizi, gürültü karakterizasyonu ve gömülü yazılım geliştirmesi birlikte yürütülür [file:64][cite:65].

---

## Amaç

Bu çalışmanın amacı, steteskop başlığından alınan biyomedikal ses sinyalini temizleyerek:
- Kalp sesi bileşenlerini daha anlaşılır hale getirmek,
- Ortam gürültüsü, temas gürültüsü ve elektriksel parazitleri azaltmak,
- Filtrelenmiş sesi/dijital veriyi mevcut ESP32 tabanlı EKG sistemine entegre etmek,
- Gerekirse ileride EKG + steteskop verisini zaman eşlemeli işleyebilecek bir altyapı oluşturmaktır [file:64][file:35][cite:65].

---

## Problem Tanımı

Steteskop ile alınan biyomedikal sesler düşük genliklidir ve kolayca bozulur [file:64]. Gürültü kaynakları yalnızca dış ortam sesi değildir; el teması, gövde titreşimi, kablo hareketi ve 50 Hz şebeke paraziti de sinyali bozabilir [file:64].

Kalp sesi bileşenleri genellikle düşük frekans bölgesindedir. Kalp sesleri tipik olarak 20–500 Hz bandında yer alır ve enerjinin büyük kısmı 200 Hz altında yoğunlaşır; S1 genelde 20–100 Hz, S2 ise 50–200 Hz civarındadır [web:46][web:48]. Bu nedenle genel amaçlı ses işleme yerine **kalp sesi odaklı filtreleme** yaklaşımı gerekir [web:46][file:64].

---

## Sistem Özeti

Sistemde steteskop tarafında kullanılan mikrofon modülü **MAX9814**’tür [file:53]. MAX9814; düşük gürültülü ön yükselteç, değişken kazanç katı, çıkış yükselteci ve AGC devresi içerir; analog çıkış verir ve toplam kazanç yapılandırmaya bağlı olarak 40 dB, 50 dB veya 60 dB olabilir [web:109][web:111].

Mevcut EKG cihazı hazırdır ve ESP32 içermektedir [file:35][cite:65]. Bu nedenle geliştirme önceliği EKG tarafı değil, steteskop sinyalinin temizlenmesi ve daha sonra bu kanalın ESP32’ye eklenmesidir [cite:65].

---

## Çalışma Mantığı

Sinyal akışı aşağıdaki gibidir:

1. Steteskop başlığındaki mikrofon vücut içi akustik titreşimleri toplar.
2. MAX9814 bu mikrofon sinyalini analog olarak yükseltir [web:109][file:53].
3. Gerekirse analog ön filtre katı ile DC bileşen, düşük frekans temas gürültüsü ve yüksek frekanslı istenmeyen bileşenler bastırılır [file:64].
4. ESP32, ADC continuous mode kullanarak analog sinyali sürekli örnekler; bu modda örnekler DMA ile belleğe aktarılır [web:114][web:75].
5. Yazılım tarafında band-pass, notch, median veya daha ileri dijital filtreleme uygulanır [file:64].
6. Filtrelenmiş veri seri port, BLE veya Wi-Fi ile dış ortama aktarılabilir ya da mevcut cihaz içinde başka işleme adımlarına verilebilir [cite:65][web:114].

---

## Neden MAX9814 Zorlayıcı

MAX9814 kullanımı pratik olsa da iki önemli mühendislik zorluğu getirir:

- Modül analog çıkış verir; bu yüzden veri almak için ESP32 ADC kullanmak gerekir [web:109][web:114].
- AGC devresi, ses seviyesini otomatik değiştirerek medikal ölçümlerde genlik tutarlılığını etkileyebilir [web:109][web:110].

Bu yüzden proje kapsamında yalnızca “ses geliyor mu” kontrolü değil, **ölçülebilir ve tekrarlanabilir sinyal davranışı** hedeflenmelidir [web:109][file:64].

---

## Geliştirme Yaklaşımı

Bu proje üç katmanda geliştirilecektir:

### 1. Analog katman
KiCad ve ngspice ile MAX9814 sonrası filtre devreleri simüle edilir. Amaç, kalp sesini mümkün olduğunca korurken gürültü bileşenlerini zayıflatacak analog ön katı belirlemektir [web:106][web:87].

### 2. Sinyal işleme katmanı
Python ortamında kayıtlı veriler üzerinde FFT, spektral analiz, notch filtre, band-pass filtre ve diğer yöntemler test edilir. Böylece gömülü tarafa geçmeden önce hangi filtre zincirinin işe yaradığı doğrulanır [file:64].

### 3. Gömülü katman
ESP-IDF kullanılarak ESP32 üzerinde sürekli örnekleme, tampon yönetimi ve gerçek zamanlı filtreleme uygulanır. ESP32 ADC continuous mode sürücüsü, periyodik veya yüksek hızlı veri toplama uygulamaları için uygundur [web:114][web:94].

---

## Kullanılan Teknolojiler

- **ESP32 / ESP-IDF**: Gömülü veri toplama ve filtreleme [web:94][web:114]
- **MAX9814**: Analog mikrofon amplifikatörü ve AGC modülü [web:109][file:53]
- **KiCad + ngspice**: Şema, PCB ve analog simülasyon [web:106][web:87]
- **Python + NumPy + SciPy + Matplotlib**: Sinyal analizi ve algoritma doğrulama
- **Jupyter Notebook**: Deneysel filtre analizi ve görselleştirme

---

## Klasör Yapısı

```text
medical-steth-ecg/
├── README.md
├── docs/
│   ├── notes/
│   ├── papers/
│   ├── diagrams/
│   └── decisions.md
├── hardware/
│   ├── kicad/
│   ├── sim/
│   └── datasheets/
├── firmware/
│   └── esp32_steth/
├── signal_processing/
│   ├── notebooks/
│   ├── src/
│   ├── filters/
│   └── tests/
├── data/
│   ├── raw/
│   ├── processed/
│   └── exports/
├── scripts/
└── results/
```

Bu yapı; donanım, simülasyon, gömülü yazılım ve veri analizini birbirinden ayırarak ilerlemeyi kolaylaştırır.

---

## Geliştirme Aşamaları

### Aşama 1 — Sinyali anlama
- MAX9814 çıkışını osiloskop veya ESP32 ADC ile gözlemle
- Sessiz ve gürültülü ortam kayıtları al
- Ham sinyalin zaman grafiğini ve FFT’sini çıkar

### Aşama 2 — Analog ön filtre
- DC blocking
- High-pass / low-pass / band-pass denemeleri
- 50 Hz bastırma ihtiyacını ölçerek karar verme

### Aşama 3 — Python ile doğrulama
- Ham veriyi CSV veya WAV olarak kaydet
- Band-pass, notch, median filtreleri uygula
- Filtre öncesi / sonrası spektrumu karşılaştır

### Aşama 4 — ESP32 gerçek zamanlı çalışma
- ADC continuous mode ile veri toplama [web:114]
- DMA buffer yönetimi
- Basit filtreleri gömülü tarafta çalıştırma

### Aşama 5 — Mevcut EKG cihazına entegrasyon
- Steteskop kanalını mevcut karta bağlama [file:35]
- Zaman damgası eşleme
- Gerekirse ortak veri akışı tasarlama

---

## İlk Başarı Kriterleri

İlk prototip başarılı sayılmak için aşağıdaki maddeleri sağlamalıdır:

- MAX9814 çıkışından kararlı ham veri okunabilmeli [file:53][web:109]
- Ham verinin frekans içeriği analiz edilebilmeli [file:64]
- En az bir filtreleme yöntemiyle gürültü görünür biçimde azaltılabilmeli [file:64][web:46]
- ESP32 üzerinde sürekli örnekleme kararlı çalışmalı [web:114]
- Filtrelenmiş sinyal mevcut sistem mimarisine bağlanabilir hale gelmeli [file:35][cite:65]

---

## Kurulum Özeti

### ESP-IDF
Espressif, macOS üzerinde ESP-IDF kurulumu için resmi kurulum adımları sunmaktadır [web:94].

```bash
brew install python cmake ninja dfu-util git
mkdir -p ~/esp
cd ~/esp
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh esp32
. ./export.sh
```

### Python ortamı
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install numpy scipy matplotlib jupyter pyserial pandas
```

---

## Notlar

Bu proje bir klinik ürün değil, araştırma ve prototipleme çalışmasıdır. Medikal güvenlik, izolasyon, kalibrasyon ve regülasyon gereksinimleri prototip sonrasında ayrıca ele alınmalıdır [file:64].

Ayrıca bu projede öncelik doğrudan “en iyi algoritma” değil, önce güvenilir veri toplamak ve sistem davranışını anlamaktır. Çünkü hatalı veya dengesiz giriş verisi üzerinde yapılan filtreleme çalışmaları yanıltıcı sonuçlar üretebilir [file:64][web:109].

---

## Kaynaklar

- Gülin Ütebay, *Kablosuz Elektronik Steteskop Tasarımı ve Bilgisayar Ortamında Görüntülenmesi* [file:64]
- MAX9814 datasheet [web:109]
- ESP-IDF ADC Continuous Mode Driver [web:114]
- Kalp sesi frekans aralıkları üzerine PCG kaynakları [web:46][web:48]
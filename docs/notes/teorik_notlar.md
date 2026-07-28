# Teorik Notlar

Bu proje boyunca sık kullandığımız kavramların basit açıklamaları. Yeni bir kavram
ortaya çıktıkça buraya eklenir — referans olarak kullanılır.

---

## SNR (Sinyal/Gürültü Oranı)

Sinyalin, üzerine binen gürültüye kıyasla ne kadar "güçlü" olduğunu tek bir sayıyla
özetleyen ölçüm.

```
SNR (dB) = 10 × log10( sinyal_gücü / gürültü_gücü )
```

- **Sinyal gücü**: istediğimiz şeyin (kalp sesi) enerjisi
- **Gürültü gücü**: istemediğimiz kısmın (beyaz gürültü, 50 Hz hum, hareket artefaktı) enerjisi

**dB (desibel) nasıl okunur:**
- Pozitif ve büyük (örn. +20 dB) → sinyal gürültüden çok daha güçlü, temiz kayıt
- 0 dB → sinyal ve gürültü eşit güçte
- Negatif (örn. -10 dB) → gürültü sinyalden daha güçlü, kayıt gürültü içinde kayboluyor
- Logaritmik olduğu için her +10 dB, gücün 10 katına çıktığı anlamına gelir

**Neden kullanıyoruz:** "Filtre gürültüyü azalttı mı, ne kadar azalttı" sorusuna
göz kararı değil, somut bir sayıyla cevap vermek için (`results/01_ilk_analiz_rapor.md`
içindeki ölçümler buna dayanıyor).

---

## Zaman Domeni ve FFT (Frekans Domeni)

- **Zaman domeni grafiği**: sinyalin genliğinin zamana göre değişimi. Kalp
  atışındaki "lub-dub" (S1-S2) darbeleri burada tepe noktaları olarak görünür.
- **FFT (Fast Fourier Transform)**: sinyali "hangi frekanslarda ne kadar enerji
  var" şeklinde başka bir bakış açısıyla gösterir. Zaman domeninde göremediğimiz
  gürültü bileşenlerini (örn. 50 Hz şebeke paraziti) FFT'de keskin bir tepe
  olarak görürüz.
- İkisi aynı sinyalin iki farklı temsili — biri "ne zaman" oluyor, diğeri "hangi
  frekansta" oluyor sorusuna cevap verir.

---

## Kalp Sesi Frekans Bandı

Kalp sesleri (fonokardiyogram) düşük frekans bölgesinde yoğunlaşır:

- Genel bant: **20–500 Hz**, enerjinin büyük kısmı 200 Hz altında
- **S1** (birinci kalp sesi, "lub"): ~20–100 Hz
- **S2** (ikinci kalp sesi, "dub"): ~50–200 Hz

Bu yüzden filtre tasarımında band-pass aralığını 20-500 Hz seçiyoruz — bunun
dışındaki her şey (yüksek frekans hışırtı, çok düşük frekans DC/hareket) gürültü
kabul edilebilir.

---

## Band-pass ve Notch Filtre

- **Band-pass filtre**: sadece belirli bir frekans aralığını (örn. 20-500 Hz)
  geçirir, altını ve üstünü bastırır. Kalp sesi dışındaki içeriği temizlemek
  için kullanılır.
- **Notch filtre**: tek bir dar frekansı (örn. tam 50 Hz) hedef alıp bastırır.
  Şebeke elektriği paraziti (Türkiye'de 50 Hz) genelde çok dar ve keskin bir
  bileşen olduğu için notch filtre ile temizlenir; harmoniği olan 100 Hz için de
  ayrıca notch uygulanır.
- İkisi birlikte kullanılır: önce band-pass genel temizliği yapar, sonra notch
  şebeke parazitini nokta atışı temizler.

---

## MAX9814 Kazanç (Gain) Ayarı

MAX9814 mikrofon modülünün `GAIN` pini üç kademeli kazanç sunar:

- Açıkta bırakılırsa: 60 dB
- GND'ye bağlanırsa: 50 dB
- VCC'ye bağlanırsa: 40 dB

Kalp sesi gibi düşük genlikli sinyallerde clipping (tepe kırpılması) riskini
azaltmak için genelde 40 dB ile başlamak önerilir.

---

## Sistol / Diyastol ve S1/S2 Tespiti

- **Sistol**: kalbin kasılıp kanı pompaladığı, S1'den S2'ye kadar olan kısa
  süre.
- **Diyastol**: kalbin gevşeyip dolduğu, S2'den bir sonraki S1'e kadar olan
  daha uzun süre.
- İstirahat halinde sistol genelde diyastolden **daha kısadır** — bu yüzden
  ardışık kalp sesi tepeleri arasındaki süreye bakarak "kısa aralık = sistol
  (S1→S2), uzun aralık = diyastol (S2→S1)" mantığıyla hangi tepenin S1
  hangisinin S2 olduğu tahmin edilebilir.

**Zarf (envelope) çıkarma — Hilbert dönüşümü:** Bir sinyalin ham hali hızlı
salınımlar içerir, ama bizi ilgilendiren "ne zaman bir ses patlaması oldu"
sorusudur. Hilbert dönüşümü sinyalin anlık genliğini (zarfını) çıkarır; bunu
alçak geçiren bir filtreyle yumuşatınca kalp sesi darbelerinin (S1/S2) net,
tümsek şeklinde göründüğü bir eğri elde edilir. Tepe bulma (`find_peaks`)
işlemi bu zarf üzerinde yapılır, ham sinyal üzerinde değil.

**Bilinen zayıflık — parity kayması:** Eğer tepe tespiti bir vuruşu kaçırır
veya fazladan bir tepe bulursa, "kısa/uzun aralık dönüşümlü" varsayımına
dayanan basit etiketleme yöntemi o noktadan sonraki tüm S1/S2 etiketlerini
tersine çevirir — çünkü etiketleme tek bir global başlangıç kararına dayanır.
Bu yüzden tüm kayıt üzerinden alınan ortalamalar yanıltıcı olabilir; yerel
(kayıt içindeki küçük pencerelerde) kontrol daha güvenilir bir doğrulama
sağlar.

### Düzeltme — Medyan Eşikli Yerel Sınıflandırma

Önceki yöntemin kök sorunu: "ilk tepe S1 mi S2 mi" kararını **bir kere** verip
sonra baştan sona sabit dönüşümlü (toggle) uygulamaktı. Tek bir anomali (kaçan/
fazladan tepe) bu döngüyü kalıcı olarak kaydırıyordu.

**Yeni yaklaşım:** Global bir "başlangıç" kararı yerine, her aralığı (iki tepe
arası süreyi) **kendi başına, veri temelli bir eşikle** sınıflandırıyoruz:

1. Tüm aralıkların **medyanını** eşik olarak al (kayıttaki tipik sistol/diyastol
   ayrımını otomatik yakalar, elle sabit bir sayı girmeye gerek kalmaz).
2. Her aralık: medyandan kısaysa sistol, uzunsa diyastol olarak sınıflandırılır.
3. Her tepenin etiketi, kendisinden **sonra gelen** aralığın sınıfına göre
   belirlenir (sistol başlıyorsa S1, diyastol başlıyorsa S2).

**Neden kaskad oluşmuyor:** Her tepenin etiketi yalnızca kendi bitişik
aralığının medyana göre kısa/uzun olduğuna bakılarak belirleniyor — önceki
tepelerden gelen "hafızaya" (toggle durumuna) bağlı değil. Yani ortadaki bir
anomali sadece o anomaliye en yakın 1-2 tepenin etiketini etkileyebilir, geri
kalan kayıt boyunca hatayı taşımaz. Sistol/diyastol ortalamaları da artık
etiketlerden bağımsız, doğrudan "medyandan kısa aralıklar" / "medyandan uzun
aralıklar" ayrımından hesaplanıyor — bu yüzden tek bir yanlış etiket, genel
istatistiği bozmuyor.

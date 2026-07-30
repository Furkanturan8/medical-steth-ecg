# İlk Analiz Raporu — Gürültü Filtreleme SNR Ölçümü

Kaynak notebook: `signal_processing/notebooks/01_ilk_analiz.ipynb`
Veri seti: PhysioNet/CinC 2016 Challenge, training-a (a0001, a0002, a0003)

## Yöntem

Her kayda sentetik gürültü (beyaz gürültü, 50/100 Hz şebeke paraziti, düşük frekanslı hareket artefaktı) eklendi, ardından band-pass (20-500 Hz) + notch (50/100 Hz) filtre zinciri uygulandı. Filtreleme öncesi ve sonrası SNR (sinyal/gürültü oranı, dB) hesaplanarak karşılaştırıldı.

## Sonuçlar

| Kayıt | SNR öncesi (dB) | SNR sonrası (dB) | İyileşme (dB) |
|---|---|---|---|
| a0001.wav | -4.82 | 12.83 | +17.65 |
| a0002.wav | -3.91 | 13.92 | +17.82 |
| a0003.wav | -9.52 | 6.80 | +16.32 |

## Yorum

Negatif SNR değerleri, gürültünün sinyalden daha güçlü olduğu bir başlangıç durumunu gösteriyor — özellikle a0003 en kötü durumdu (-9.52 dB). Filtre uygulandıktan sonra üç kayıtta da sinyal gürültüden belirgin biçimde baskın hale geldi ve iyileşme tüm kayıtlarda tutarlı bir aralıkta (~16-18 dB) kaldı.

Bu tutarlılık, filtre zincirinin (band-pass + notch) farklı kayıtlarda benzer şekilde davrandığını, yani gürültü azaltmanın belirli bir örneğe özgü bir tesadüf olmadığını gösteriyor. README'deki "gürültü görünür/ölçülebilir biçimde azaltılabilmeli" ilk başarı kriteri bu ölçümle sayısal olarak karşılanmış oldu.

## Dayanıklılık Testi — Farklı Gürültü Seviyeleri

Aynı filtre zinciri, kademeli olarak artan dört gürültü seviyesinde (Hafif, Orta, Güçlü, Aşırı) üç kayıt üzerinde tekrar test edildi.

| Seviye | Ortalama iyileşme (dB) | Filtre sonrası SNR aralığı (dB) |
|---|---|---|
| Hafif | ~15.9 | 16.31 – 23.45 |
| Orta | ~17.3 | 6.80 – 13.92 |
| Güçlü | ~15.4 | -1.69 – 5.38 |
| Aşırı | ~14.1 | -7.10 – -1.08 |

Ayrıntılı seviye × kayıt tablosu ve SNR-vs-gürültü-seviyesi grafiği: `signal_processing/notebooks/01_ilk_analiz.ipynb`, bölüm 7.

### Yorum

Filtrenin sağladığı iyileşme miktarı (~14-18 dB) gürültü seviyesinden bağımsız olarak oldukça sabit kalıyor — yani filtre girdi seviyesiyle orantılı, öngörülebilir bir gürültü azaltıcı gibi davranıyor. Ancak bu sabit iyileşme, girdi zaten çok gürültülüyse (Güçlü/Aşırı seviyelerde) çıktının hâlâ negatif SNR'da kalmasını engelleyemiyor.

**Sonuç:** Band-pass + notch filtre zincirinin bir dayanıklılık sınırı var. Belirli bir gürültü eşiğinin üzerinde bu filtre tek başına yeterli olmuyor; ileride adaptif filtreleme veya wavelet denoising gibi ek bir yöntem değerlendirilmeli.

## S1/S2 Tespiti (Kalp Sesi Segmentasyonu)

Temiz (gürültüsüz) `a0001.wav` kaydı üzerinde, Hilbert dönüşümü ile zarf (envelope) çıkarılıp `scipy.signal.find_peaks` ile tepe noktaları bulundu. Ardışık tepeler arası süreye bakılarak (kısa aralık = sistol → S1'i S2'den ayırır, uzun aralık = diyastol) tepeler S1/S2 olarak etiketlendi.

### Sonuçlar (ilk versiyon — global alternasyon)

- Toplam 75 tepe tespit edildi (38 S1, 37 S2)
- Tahmini kalp hızı: **63.3 bpm**
- Tüm kayıt ortalaması: sistol 470 ms, diyastol 479 ms

### Yorum

İlk ~13 saniyelik pencerede tepe aralıkları net ve tutarlı biçimde ~360 ms (sistol) / ~630 ms (diyastol) arasında dönüşümlü — fizyolojik olarak beklenen örüntüyle (sistol < diyastol) uyumlu. Ancak kaydın ortasında (yaklaşık 13. saniye civarı) muhtemelen zayıf/gürültülü bir vuruşun kaçırılması veya fazladan bir tepenin algılanması nedeniyle 232 ms ve 208 ms gibi fizyolojik olarak anlamsız kısa aralıklar ortaya çıkıyor. Bu tek anomali, o noktadan sonraki **tüm** S1/S2 etiketlerini tersine çeviriyor (parity kayması) — çünkü algoritma tek bir global "hangi tepe S1 ile başlıyor" kararı veriyor ve bunu kayıt boyunca sabit tutuyor.

Bu yüzden tüm kayıt ortalaması yanıltıcı: sistol (470 ms) ve diyastol (479 ms) neredeyse eşit çıkıyor, oysa kaydın büyük kısmında gerçek fark ~360/630 ms civarında. Bu, basit global alternasyon varsayımına dayanan segmentasyon yöntemlerinin bilinen bir zayıflığı.

### Düzeltme — Medyan Eşikli Yerel Sınıflandırma

Etiketleme yöntemi değiştirildi: global bir "ilk tepe S1 mi S2 mi" kararı yerine, her aralık **kendi başına** aralıkların medyanına göre kısa (sistol) / uzun (diyastol) sınıflandırılıyor; her tepenin etiketi yalnızca kendisinden sonra gelen aralığın sınıfına bağlı (bkz. `docs/notes/teorik_notlar.md` — "Düzeltme — Medyan Eşikli Yerel Sınıflandırma"). Bu değişiklik önceki hiçbir global "hafıza/toggle" durumu taşımadığı için bir anomalinin etkisini yalnızca kendi civarındaki 1-2 tepeyle sınırlıyor.

**Not:** Bu düzeltme daha önce bu raporda belgelenmişti ama gerçek notebook koduna (`label_s1_s2` fonksiyonu) hiç uygulanmamış olduğu fark edildi — kod hâlâ eski global-toggle yöntemini çalıştırıyordu. İnce ayar çalışması kapsamında bu tutarsızlık giderildi ve düzeltme gerçekten koda uygulanıp çalıştırıldı.

### İnce Ayar — `find_peaks` distance Parametresi

Düzeltilmiş etiketleme yöntemiyle bile anomali bölgesinde (13-16 sn) art arda aynı etiket (S2-S2-S2) görülüyordu. İncelemede kök neden bulundu: `detect_peaks` içindeki `min_distance_ms=200` değeri, birbirine 208-232 ms gibi fizyolojik olarak imkânsız kadar yakın iki sahte/gürültü kaynaklı tepeyi de kalp sesi tepesi olarak kabul ediyordu. `min_distance_ms` **250**'ye çıkarılınca bu 2 sahte tepe otomatik elendi ve aralık dağılımı temiz iki kümeye ayrıldı: sistol kümesi 290-390 ms, diyastol kümesi 539-734 ms, aralarında boşluk var — hiç kısa aykırı değer kalmadı.

**Sonuç (düzeltme + ince ayar, gerçek çalıştırma):**

- Toplam tespit edilen tepe: **73** (S1: 37, S2: 36) — önceki 75'ten 2 sahte tepe elendi
- Tahmini kalp hızı: **61.5 bpm**
- Ortalama sistol süresi (S1→S2): **352 ms**
- Ortalama diyastol süresi (S2→S1): **623 ms**

Sistol/diyastol net ve fizyolojik olarak makul biçimde ayrışıyor (sistol, toplam kalp döngüsünün ~%36'sı). Anomali bölgesinde (13-15 sn) hâlâ 3 art arda aynı etiket (S2-S2-S2) görülüyor, ancak bunun nedeni artık sahte bir tepe değil — bu bölgedeki gerçek aralıklardan biri (390 ms) medyana (380 ms) çok yakın bir sınır değeri, hangi tarafa sınıflandığı gürültü payı içinde. Kayıt gerçek (sentetik olmayan) bir kayıt olduğu için küçük düzensizlikler beklenebilir; birkaç tepe içinde kendini düzeltiyor, kalıcı bir kaskad **yok**. Bu, kabul edilebilir bir sınır durumu olarak not edildi; daha ileri gitmek (örn. zorla alternasyon uygulamak) tam olarak önceki hatalı yaklaşımın kendisi olurdu.

## Median Filtre Denemesi

README'deki Aşama 3 kontrol listesinde band-pass ve notch'un yanında median filtre de sayılıyor ama şimdiye kadar denenmemişti. Mevcut sentetik gürültü modeli (beyaz gürültü + hum + hareket artefaktı) median filtrenin asıl güçlü olduğu tür değil — median filtre kısa **darbesel** (impulsif) gürültüde işe yarar (örn. steteskop temasının anlık kopması/kablo çarpması gibi "click" sesleri). Bu yüzden test için önce bu tür bir gürültü eklendi, sonra band-pass+notch zincirine median filtre eklenip **katı** bir karşılaştırma yapıldı: referans sinyal median filtreden geçirilmedi (band-pass/notch denemesindeki "adil karşılaştırma" mantığının tersine) — çünkü median filtre, notch/band-pass gibi bant dışını atmıyor, bant içindeki gerçek keskin geçişleri (S1/S2 başlangıcı gibi) de düzleştirebilir. Referansı da median'dan geçirmek bu bozulmayı gizlerdi.

| Kayıt | Click yok, median yok (dB) | Click yok, median var (dB) | Click var, median yok (dB) | Click var, median var (dB) |
|---|---|---|---|---|
| a0001.wav | 12.82 | 16.14 | 8.83 | 11.53 |
| a0002.wav | 13.93 | 8.15 | 8.37 | 6.78 |
| a0003.wav | 6.85 | 10.83 | 2.41 | 5.23 |

### Yorum

Median filtre a0001 ve a0003'te click gürültüsü olsun olmasın net SNR kazancı sağlıyor. Ama a0002'de tam tersi oluyor — median filtre SNR'ı düşürüyor, çünkü bu kayıtta median filtrenin bant içindeki gerçek keskin geçişlere verdiği zarar, kazandığı gürültü azaltmasından fazla. Yani median filtrenin faydası **kayda bağlı**; sabit bir kazanç değil.

**Sonuç:** Median filtre, band-pass+notch zincirine varsayılan/otomatik bir adım olarak eklenmiyor. Gerekirse (örn. gerçek donanımda sık click/temas kopması gözlenirse) kayda özel değerlendirilecek opsiyonel bir adım olarak not ediliyor.

## Dayanıklılık Sınırını Aşma — Wavelet Denoising

Dayanıklılık testi bölümünde bulunan sınırı (Güçlü/Aşırı seviyede band-pass+notch çıktısının hâlâ negatif SNR'da kalması) aşmaya çalışmak için wavelet tabanlı denoising denendi: VisuShrink yöntemi (`db6` dalgacığı, 5 seviye ayrıştırma, en ince seviye katsayılarından medyan tabanlı gürültü tahmini ile evrensel eşik, yumuşak eşikleme), band-pass+notch zincirine ek bir adım olarak eklendi. Median filtre denemesindeki gibi **katı** karşılaştırma kullanıldı (referans wavelet'ten geçirilmedi).

| Seviye | Kayıt | SNR (band+notch) | SNR (+wavelet) | Fark |
|---|---|---|---|---|
| Hafif | a0001.wav | 22.38 | 23.63 | +1.25 |
| Hafif | a0002.wav | 23.45 | 20.93 | -2.52 |
| Hafif | a0003.wav | 16.39 | 19.61 | +3.22 |
| Orta | a0001.wav | 12.78 | 16.57 | +3.79 |
| Orta | a0002.wav | 13.93 | 14.54 | +0.61 |
| Orta | a0003.wav | 6.76 | 12.06 | +5.30 |
| Güçlü | a0001.wav | 4.36 | 10.33 | +5.97 |
| Güçlü | a0002.wav | 5.47 | 8.62 | +3.15 |
| Güçlü | a0003.wav | -1.69 | 5.54 | +7.23 |
| Aşırı | a0001.wav | -1.14 | 6.04 | +7.18 |
| Aşırı | a0002.wav | -0.05 | 5.02 | +5.06 |
| Aşırı | a0003.wav | -7.12 | 1.04 | +8.16 |

Kendi bozulma (gürültüsüz filtrelenmiş sinyale wavelet uygulanınca): a0001 31.94 dB, a0002 28.92 dB, a0003 42.53 dB — median filtrenin kendi bozulmasından (~9-21 dB) çok daha iyi.

### Yorum

Wavelet denoising, median filtreden farklı olarak **her seviyede ve her kayıtta** net kazanç sağlıyor (Orta/Güçlü/Aşırı'da +3 ile +8 dB arası) — tek istisna Hafif seviyede a0002 (-2.52 dB, önemsiz çünkü o seviyede SNR zaten ~23 dB). Daha önemlisi, **dayanıklılık sınırını gerçekten aşıyor**: Aşırı seviyede önceden negatif kalan SNR değerleri (a0001: -1.14→+6.04, a0002: -0.05→+5.02, a0003: -7.12→+1.04) pozitife çekildi.

**Sonuç:** Wavelet denoising, band-pass+notch dayanıklılık sınırını aşmak için işe yarayan bir yöntem — median filtreden farklı olarak tutarlı ve düşük bozulmalı. Ancak ESP32 üzerinde gerçek zamanlı çalıştırmak (Aşama 4) hesaplama maliyeti açısından band-pass/notch'tan çok daha ağır; bu yüzden şimdilik yalnızca Python tarafında doğrulanmış bir yöntem olarak not ediliyor. Gömülü tarafa taşınıp taşınmayacağı Aşama 4'te (DMA/ADC performansı görüldükten sonra) değerlendirilecek.

## Dinamik Gürültü Geçidi (Noise Gate)

Bir arkadaşın önerdiği fikir test edildi: kalp sesi kesintili (S1/S2 arasında sessizlik var), zarfın (envelope) düşük olduğu "sessiz" bölgeleri tamamen sıfırlarsak aradaki kalıntı gürültü de sıfırlanır. Yöntem: zarfın 20. persentili "sessizlik seviyesi" kabul edilip 1.5 katı eşik alındı; zarf bu eşiğin altına düştüğü her noktada sinyal sıfırlandı. Median/wavelet denemelerindeki gibi katı karşılaştırma kullanıldı.

| Seviye | Kayıt | SNR (band+notch) | SNR (+gate) | Fark |
|---|---|---|---|---|
| Hafif | a0001.wav | 22.39 | 15.41 | -6.99 |
| Hafif | a0002.wav | 23.49 | 12.79 | -10.71 |
| Hafif | a0003.wav | 16.33 | 13.89 | -2.45 |
| Orta | a0001.wav | 12.82 | 11.86 | -0.95 |
| Orta | a0002.wav | 13.96 | 10.73 | -3.23 |
| Orta | a0003.wav | 6.86 | 8.57 | +1.71 |
| Güçlü | a0001.wav | 4.33 | 7.17 | +2.84 |
| Güçlü | a0002.wav | 5.47 | 5.76 | +0.30 |
| Güçlü | a0003.wav | -1.65 | 3.41 | +5.06 |
| Aşırı | a0001.wav | -1.11 | 4.08 | +5.19 |
| Aşırı | a0002.wav | 0.01 | 2.66 | +2.65 |
| Aşırı | a0003.wav | -7.11 | 0.01 | +7.12 |

### Yorum

Sonuç net bir çizgide ayrılıyor — gürültü seviyesine bağlı bir dönüm noktası var. Hafif/Orta seviyede gate SNR'ı düşürüyor (Hafif'te -2 ile -11 dB arası): gürültü zaten azken, sessiz bölgeleri sıfırlamanın kaybettirdiği gerçek sinyal, kazandığı gürültü azaltmasından fazla. Güçlü/Aşırı seviyede ise tam tersi — gate net kazanç sağlıyor (+0.3 ile +7 dB arası).

**Sonuç:** Gate, median filtre gibi kayda bağlı değil, **gürültü seviyesine bağlı** koşullu bir fayda sağlıyor. Bu yüzden sabit bir adım olarak değil, yalnızca gürültü yüksek olduğunda devreye giren **adaptif bir adım** olarak düşünülmeli. Hesaplama açısından çok hafif (abs + persentil + karşılaştırma) — ESP32'de gerçek zamanlı çalıştırmak wavelet'ten çok daha kolay; donanım aşamasında (Aşama 4) denenmeye değer bir aday.

## Donanıma Hazırlık — Gerçek Zamanlı Filtre ve Hafif Zarf Dedektörü

Şu ana kadar kullanılan `sosfiltfilt`/`filtfilt` çift geçişli (offline) filtreler ESP32'de gerçek zamanlı çalışamaz — gelecekteki örneklere ihtiyaç duyarlar. Bu bölümde iki şey doğrulandı:

### Fark denklemi doğrulaması

`scipy.signal.sosfilt`'in içeride yaptığı biquad kademe döngüsü (`y[n] = b0*w0 + b1*w1 + b2*w2`, Direct Form II Transposed) elle Python'da yazıldı ve scipy'nin kendi çıktısıyla karşılaştırıldı: en büyük fark **2.18e-14** — kayan noktalı sayı hassasiyeti seviyesinde, yani aynı. Bu, bu katsayı ve döngünün doğrudan C koduna (ESP32) taşınabileceğini kanıtlıyor.

### Causal (tek geçişli) filtre — SNR karşılaştırması

| Seviye | Kayıt | SNR (offline) | SNR (causal) | Fark |
|---|---|---|---|---|
| Hafif | a0001.wav | 22.34 | 22.17 | -0.17 |
| Hafif | a0002.wav | 23.51 | 22.97 | -0.54 |
| Hafif | a0003.wav | 16.36 | 16.56 | +0.20 |
| Orta | a0001.wav | 12.81 | 12.63 | -0.17 |
| Orta | a0002.wav | 13.92 | 13.38 | -0.53 |
| Orta | a0003.wav | 6.90 | 7.06 | +0.17 |
| Güçlü | a0001.wav | 4.32 | 4.18 | -0.14 |
| Güçlü | a0002.wav | 5.30 | 4.86 | -0.44 |
| Güçlü | a0003.wav | -1.68 | -1.40 | +0.28 |
| Aşırı | a0001.wav | -1.14 | -1.24 | -0.10 |
| Aşırı | a0002.wav | -0.08 | -0.49 | -0.41 |
| Aşırı | a0003.wav | -7.14 | -6.85 | +0.29 |

Fark her durumda 0.6 dB'nin altında — gerçek zamanlı (causal) filtreye geçince ihmal edilebilir bir performans kaybı var.

### Hafif zarf dedektörü (abs + hareketli ortalama)

Hilbert dönüşümü FFT gerektirdiği için ESP32'de pahalı. Alternatif: mutlak değer + hareketli ortalama. Pencere uzunluğu denemesi (temiz sinyal, a0001):

| Yöntem | Tepe sayısı | Kalp hızı (bpm) | Sistol (ms) | Diyastol (ms) |
|---|---|---|---|---|
| Hilbert (referans) | 73 | 61.5 | 352 | 623 |
| Hafif, pencere=30ms | 74 | 62.7 | 351 | 606 |
| Hafif, pencere=50ms | 75 | 63.3 | 355 | 593 |
| Hafif, pencere=80ms | 87 | 73.6 | 325 | 491 |
| Hafif, pencere=100ms | 96 | 81.4 | 302 | 436 |
| Hafif, pencere=150ms | 104 | 88.2 | 282 | 398 |

30ms pencere seçildi (Hilbert'e en yakın). Orta gürültülü, filtrelenmiş sinyalde (gerçek kullanım senaryosuna daha yakın) karşılaştırma: Hilbert 75 tepe / 63.3 bpm / sistol 349ms / diyastol 599ms; Hafif (30ms) 76 tepe / 64.8 bpm / sistol 346ms / diyastol 580ms — neredeyse birebir aynı.

**Sonuç:** Causal filtre + hafif zarf dedektörü, offline/Hilbert versiyonlarına çok yakın performans veriyor ve ikisi de ESP32'de gerçek zamanlı çalışacak şekilde tasarlandı. `manual_sos_filter` mantığı (biquad kademeleri) ve `compute_envelope_lightweight` mantığı (abs + hareketli ortalama), Aşama 4'te (ESP32) doğrudan C koduna taşınabilecek temel yapı taşları.

## Gerçek Donanım Kayıtları — Kendi Steteskopumuzla Alınan Sesler

Şimdiye kadarki tüm analiz PhysioNet'ten indirilen temiz kayıtlara sentetik gürültü ekleyerek yapılmıştı. ESP32 + MAX9814 ile alınan 3 gerçek kayıt (`data/raw/own_recordings/`: `abdul_heart1.wav`, `muhammed_heart1.wav`, `nadeemHeart1.wav`) üzerinde aynı band-pass+notch filtre zinciri (Bölüm 3) ve S1/S2 tespiti (Bölüm 8) çalıştırıldı. Bu kayıtların temiz bir referansı olmadığı için klasik SNR ölçülemedi; değerlendirme ham/filtrelenmiş karşılaştırması ve S1/S2 sonuçlarının fizyolojik makuliyeti üzerinden yapıldı.

### Kırpılma (clipping) kontrolü

| Kayıt | Örnekleme | Süre | Kırpılma oranı |
|---|---|---|---|
| abdul_heart1.wav | 16000 Hz | 30.0 s | %2.17 |
| muhammed_heart1.wav | 16000 Hz | 60.1 s | %3.29 |
| nadeemHeart1.wav | 16000 Hz | 60.0 s | %0.68 |

Üç kayıtta da örneklerin bir kısmı 16-bit sınırına (±32768) dayanmış — MAX9814'ün mevcut kazanç ayarının (muhtemelen 60 dB, `GAIN` pini açıkta) bu ses seviyesi için yüksek olabileceğine işaret ediyor. `GAIN` pini VCC'ye bağlanıp 40 dB'ye düşürülmesi bir sonraki kayıtta denenmeli (bkz. `docs/notes/teorik_notlar.md` — MAX9814 Kazanç Ayarı).

### S1/S2 tespiti sonuçları

| Kayıt | Tespit edilen tepe | Kalp hızı | Sistol | Diyastol |
|---|---|---|---|---|
| abdul_heart1.wav | 86 | 86.6 bpm | 278 ms | 415 ms |
| muhammed_heart1.wav | 158 | 79.3 bpm | 299 ms | 458 ms |
| nadeemHeart1.wav | 141 | 70.5 bpm | 308 ms | 543 ms |

### Yorum

Üç kayıtta da fizyolojik olarak makul kalp hızları (70-87 bpm) ve net sistol/diyastol ayrışması elde edildi. PhysioNet verisiyle (Bölüm 3-8) kurulan filtre + S1/S2 zinciri hiç değiştirilmeden gerçek donanım kaydına uygulanabiliyor — bu, yöntemin sentetik gürültüde değil gerçek ortam koşullarında da işe yaradığını gösteriyor. Zarf grafiklerinde PhysioNet kayıtlarına göre daha fazla küçük/sahte tepecik görülüyor (gerçek ortam gürültüsü + kırpılma nedeniyle), ancak ana S1/S2 darbeleri hâlâ net biçimde ayırt edilebiliyor.

**Sonuç:** Aşama 4 (donanım) fiilen başladı ve Aşama 3'te doğrulanan yöntemler ilk testte gerçek veriyle çalıştı. Bir sonraki adım aday: MAX9814 kazancını düşürüp kırpılmayı azaltmak, ardından bu kayıtlara wavelet/noise-gate gibi dayanıklılık artırıcı adımların (Bölüm 10-11) da fayda sağlayıp sağlamadığını test etmek.

## Doktora Sunum İçin Görselleştirme — PCG Raporu (Spektrogram + Zarf/S1-S2)

Kayıtları bir doktora anlamlı biçimde sunabilmek için literatür kısaca araştırıldı. Klinik PCG (fonokardiyogram) çalışmalarında standart temsil, zaman domeni (zarf + S1/S2 işaretleme) ile spektrogramın (zaman-frekans) birlikte gösterilmesi — üfürüm (murmur) gibi bulgular genelde S1-S2 arasında uzayan ek frekans enerjisi olarak spektrogramda görünür hale gelir. Kaynaklar: [Heart energy signature spectrogram](https://pmc.ncbi.nlm.nih.gov/articles/PMC1899182/), [Phono-spectrographic analysis of heart murmur in children](https://link.springer.com/article/10.1186/1471-2431-7-23), [Real-Time Smart-Digital Stethoscope System](https://pmc.ncbi.nlm.nih.gov/articles/PMC6630694/) (ayrıntı: `docs/notes/teorik_notlar.md` — "PCG Görselleştirme").

Bu format `pcg_report_figure` fonksiyonuyla uygulandı (Bölüm 14): üstte filtrelenmiş sinyal + zarf + S1/S2 işaretleri, altta aynı zaman ekseninde spektrogram (0-500 Hz, `scipy.signal.spectrogram`, 512 örnek pencere, %90 örtüşme), başlıkta kalp hızı/sistol/diyastol özeti. Üç kayıt için üretilip `results/own_recordings_reports/` altına PNG olarak kaydedildi (kişisel sağlık verisi olduğu için `.gitignore`'da — yalnızca local).

**Not:** Bu bir tanı aracı değil, sinyali okunabilir bir görüntüye çeviren bir görselleştirme — yorumlama doktora ait.

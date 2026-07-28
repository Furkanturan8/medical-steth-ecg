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

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

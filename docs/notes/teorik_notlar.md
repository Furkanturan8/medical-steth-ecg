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

---

## PCG Görselleştirme — Klinik Sunum İçin Spektrogram

Fonokardiyogram (PCG = kalp sesi sinyali) literatüründe, bir kaydı doktora/
klinisyene "okunabilir" hale getirmek için genelde **iki temsil birlikte**
kullanılır:

1. **Zaman domeni + zarf (envelope) + S1/S2 işaretleme** — kalp döngüsünün
   nerede başlayıp bittiğini, sistol/diyastol sürelerini gösterir (bkz.
   yukarıdaki "Zarf çıkarma" ve "Sistol/Diyastol" notları).
2. **Spektrogram (zaman-frekans)** — sinyali zamana karşı frekans içeriği
   olarak (ısı haritası şeklinde) gösterir. Üfürüm (murmur) gibi bulgular
   genelde S1-S2 arasında **uzayan, ek frekans enerjisi** olarak görülür;
   normal bir kalp sesinde bu aralık nispeten "sessiz" (düşük enerjili)
   kalır. Bu yüzden spektrogram, tek başına zaman domeni grafiğinde
   gözden kaçabilecek bulguları görünür kılabilir.

Bu ikisinin birlikte (üstte zaman/zarf/S1-S2, altta spektrogram, aynı zaman
eksenini paylaşarak) sunulması, klinik PCG çalışmalarında ve akıllı dijital
steteskop sistemlerinde standart bir rapor formatıdır:

- Heart energy signature spectrogram for cardiovascular diagnosis —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC1899182/
- Phono-spectrographic analysis of heart murmur in children (BMC
  Pediatrics) — https://link.springer.com/article/10.1186/1471-2431-7-23
- Real-Time Smart-Digital Stethoscope System for Heart Diseases
  Monitoring — https://pmc.ncbi.nlm.nih.gov/articles/PMC6630694/

**Önemli sınır:** Bu görselleştirme bir tanı aracı değildir — ham/filtrelenmiş
sinyali okunabilir bir görüntüye çevirir, yorumlama doktora aittir. Projede
bu format `signal_processing/notebooks/01_ilk_analiz.ipynb` Bölüm 14'te
uygulanıyor (`pcg_report_figure` fonksiyonu), çıktılar
`results/own_recordings_reports/` altına PNG olarak kaydediliyor.

**Web backend entegrasyonu:** Aynı mantık `signal_processing/src/` altına
(`filters.py`, `envelope.py`, `segmentation.py`, `report.py`, `pipeline.py`)
çıkarıldı ve `web/backend/apps/recordings/services/analysis.py` tarafından
kullanılıyor — bir kayıt yüklendiğinde backend aynı filtre+S1/S2+rapor
zincirini otomatik çalıştırıp `AnalysisResult`'a yazıyor. Notebook'un kendisi
değiştirilmedi; iki kopya şu an elle senkronize ediliyor.

---

## Klinik Olarak Faydalı PCG Özellikleri (Literatür Taraması)

Spektrogram + S1/S2 işaretlemenin ötesinde, fonokardiyogram (PCG) literatüründe
ve piyasadaki dijital steteskoplarda (örn. Eko CORE + Eko Murmur Analysis
Software — FDA onaylı) doktora fayda sağlayan başlıca özellik/analiz grupları:

### 1. Zamanlama tabanlı özellikler
- **Kalp hızı ve R-R/S1-S1 değişkenliği (HRV benzeri)**: aritmi/blok şüphesi
  için — ardışık kalp döngüsü sürelerindeki düzensizlik.
- **Sistolik zaman aralıkları (STI)**: EMAT, PEP, LVET gibi — S1/S2
  zamanlarından türetilen, kalp kasının kasılma performansını gösteren
  klasik klinik parametreler (ECG ile senkronize edilirse daha kesin).
- **Sistol/diyastol oranı**: zaten hesaplıyoruz (S1→S2 kısa, S2→S1 uzun);
  bu oranın normalden sapması taşikardi/bradikardi gibi durumlarda değişir.

### 2. Üfürüm (murmur) karakterizasyonu
Klinikte bir üfürüm şu eksenlerde tarif edilir — otomatik analizde de aynı
eksenler kullanılıyor:
- **Zamanlama**: sistolik mi, diyastolik mi, yoksa sürekli mi (S1-S2 arasında
  mı, S2-S1 arasında mı enerji var) — elimizdeki S1/S2 zaman damgalarıyla
  doğrudan hesaplanabilir (o aralıktaki enerji/genlik normalin üstünde mi).
- **Şekil**: crescendo, decrescendo, plato (zarfın aralık içindeki eğimi).
- **Şiddet (Levine skalası, I-VI)**: geleneksel olarak elle, kulakla
  derecelendirilir; otomatik sistemlerde zarf genliği/RMS'ten yaklaşık
  bir şiddet skoru türetilebilir.
- **Perde/kalite**: sert (harsh), üfleyen (blowing), kaba (rumbling) gibi
  nitel tanımlar spektral içerikle (baskın frekans bandı, bant genişliği)
  ilişkilendirilir.

### 3. Ekstra sesler (S1/S2 dışında)
- **S3/S4 gallop**: S2'den ~100-200 ms sonra (S3) veya S1'den hemen önce
  (S4) görülen düşük frekanslı ek sesler — kalp yetmezliği/sertlik
  bulgusu olabilir. Zarfımızda S1/S2 dışında üçüncü bir tepe aranarak
  tespit edilebilir.
- **S2'nin çiftleşmesi (split S2)**: aortik ve pulmoner kapak kapanması
  arasındaki gecikme. Fizyolojik (nefes alırken artan) veya patolojik
  (sabit/ters çiftleşme, örn. atriyal septal defekt) olabilir — S2
  tepesinin kendisinin ince zaman-frekans yapısına bakmak gerekir.

### 4. Frekans/spektral özellikler (spektrogramın ötesi)
- Bant enerjisi oranları (örn. 100-200 Hz vs 200-500 Hz), üfürüm-gürültü
  oranı, MFCC benzeri katsayılar — özellikle makine öğrenmesi
  sınıflandırması için kullanılan sayısal öznitelikler.

### 5. Sınıflandırma / makine öğrenmesi
PhysioNet/CinC 2016 ve 2022 (Moody) challenge'ları ile CirCor DigiScope
veri seti gibi kaynaklarda üfürüm varlığı, üfürüm tipi (masum/yapısal) ve
genel normal/anormal sınıflandırması derin öğrenme ile yapılıyor. Eko'nun
FDA onaylı EMAS yazılımı yapısal vs. masum üfürüm ayrımında ~85-90 duyarlılık/
özgüllük bildiriyor — yani bu yön ticari olarak doğrulanmış, tek kayıtla
"kesin tanı" değil ama tarama amaçlı güvenilir.

### 6. Çoklu oskültasyon noktası
Klinikte üfürümün hangi noktada (aortik, pulmoner, triküspid, mitral, Erb
noktası) en iyi duyulduğu ve nereye yayıldığı (radyasyon) tanıyı
daraltır — tek noktadan kayıt, konum bilgisini kaybeder.

### Projemiz için öncelik önerisi
Elimizde zaten S1/S2 zaman damgaları ve zarf var; en düşük maliyetli
sonraki adımlar:
1. S1-S2 (sistol) ve S2-S1 (diyastol) aralıklarındaki **zarf enerjisini**
   ölçüp "bu aralık sessiz mi, yoksa beklenmedik enerji mi var" diye
   bakmak → basit bir üfürüm-varlığı göstergesi.
2. S2'den sonra ek bir tepe arayarak **S3/S4 taraması**.
3. Bunları `pcg_report_figure`'a ek bilgi olarak (örn. "sistolik aralıkta
   enerji: normalin X katı") eklemek — doktora ek bir ipucu sağlar, tanı
   koymaz.

**Kaynaklar:**
- Heart murmur detection — PhysioNet Challenge 2022 —
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10495026/
- Murmur identification via Stockwell transform (Scientific Reports) —
  https://www.nature.com/articles/s41598-024-58274-6
- Automated time label segmentation of heart sounds (Frontiers) —
  https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2023.1309750/full
- Levine scale — https://en.wikipedia.org/wiki/Levine_scale
- Beyond Heart Murmur Detection: Automatic Murmur Grading from PCG —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10482086/
- Synchronous ECG/PCG acquisition for systolic time intervals —
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12252480/
- CirCor DigiScope Dataset (murmur detection → classification) —
  https://arxiv.org/pdf/2108.00813
- Eko Murmur Analysis Software (FDA clearance) —
  https://www.patientcareonline.com/view/fda-clears-heart-murmur-detection-ai-for-eko-smart-stethoscope

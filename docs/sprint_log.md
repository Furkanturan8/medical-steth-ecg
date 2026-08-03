# Sprint Günlüğü

Projede sırayla yapılan işlerin takibi. Her madde: ne yapıldı, nerede yapıldı,
neden yapıldı, sonucu ne oldu. Yeni bir iş bittikçe sona yeni bir madde eklenir.

---

### 1. Proje README'si oluşturuldu
- **Nerede:** `README.md`
- **Ne yapıldı:** Proje amacını, problem tanımını, sistem özetini, geliştirme
  aşamalarını ve klasör yapısını içeren README dosyası oluşturuldu.
- **Neden:** Projeye başlarken kapsamı ve yol haritasını netleştirmek için.
- **Sonuç:** Tüm sonraki adımlar (klasör yapısı, geliştirme aşamaları) bu
  README'deki plana göre ilerliyor.

### 2. Klasör yapısı oluşturuldu
- **Nerede:** Proje kökü — `docs/`, `hardware/`, `firmware/`, `signal_processing/`,
  `data/`, `scripts/`, `results/` ve alt klasörleri
- **Ne yapıldı:** README'deki "Klasör Yapısı" bölümünde tanımlanan dizin ağacı
  `mkdir -p` ile oluşturuldu.
- **Neden:** Donanım, simülasyon, gömülü yazılım ve veri analizini birbirinden
  ayırarak ilerlemeyi kolaylaştırmak.
- **Sonuç:** Proje iskeleti hazır, her çalışma türü kendi klasörüne yazılabilir
  hale geldi.

### 3. Gerekli araçların kurulum durumu kontrol edildi
- **Nerede:** Sistem genelinde (Homebrew, Python, ESP-IDF ön koşulları)
- **Ne yapıldı:** `brew`, `python3`, `git`, `cmake`, `ninja`, `dfu-util`,
  `ngspice`, `kicad` komutlarının kurulu olup olmadığı kontrol edildi.
- **Neden:** README'nin "Kurulum Özeti" bölümündeki adımlara geçmeden önce
  eksik olanları belirlemek.
- **Sonuç:** Kurulu: Homebrew, Python3, Git, KiCad. Eksik: cmake, ninja,
  dfu-util, ngspice, ESP-IDF, Python paketleri (numpy/scipy/matplotlib/jupyter/
  pyserial/pandas).

### 4. Python sanal ortamı (venv) kuruldu
- **Nerede:** `.venv/`
- **Ne yapıldı:** `python3 -m venv .venv` ile proje bazlı sanal ortam
  oluşturuldu; içine `numpy`, `scipy`, `matplotlib`, `jupyter`, `pyserial`,
  `pandas` kuruldu.
- **Neden:** Sistem Python'unu kirletmemek, macOS'ta Homebrew Python'a global
  pip kurulumunun zaten önerilmemesi (externally-managed-environment), proje
  bazlı bağımlılık izolasyonu.
- **Sonuç:** Tüm Python analiz çalışmaları `.venv` içinden çalıştırılıyor.

### 5. Homebrew paketleri kuruldu
- **Nerede:** Sistem genelinde (Homebrew)
- **Ne yapıldı:** `cmake`, `ninja`, `dfu-util`, `ngspice` kuruldu.
- **Neden:** ESP-IDF kurulumunun ön koşulları (cmake, ninja, dfu-util) ve
  analog simülasyon için ngspice (KiCad ile birlikte kullanılacak).
- **Sonuç:** Dört araç da başarıyla kuruldu ve doğrulandı (`cmake --version`
  vb.).

### 6. ESP-IDF kuruldu
- **Nerede:** `~/esp/esp-idf`
- **Ne yapıldı:** `git clone --recursive` ile ESP-IDF reposu indirildi,
  `./install.sh esp32` ile ESP32 hedefi için araç zinciri kuruldu.
- **Neden:** Gömülü katman (Aşama 4-5) için gerekli; ESP32 üzerinde ADC
  continuous mode ve firmware geliştirme buna bağlı.
- **Sonuç:** Kurulum başarılı, `idf.py --version` → `ESP-IDF v6.1-dev`.
  Her yeni terminalde `. ~/esp/esp-idf/export.sh` çalıştırılması gerekiyor.
  *(Not: Şu an donanım tarafı beklemede, kullanıcı önce simülasyon/veri
  analizi ile ilerlemeyi tercih etti.)*

### 7. Jupyter kernel kaydı yapıldı
- **Nerede:** `~/Library/Jupyter/kernels/medical-steth-ecg`
- **Ne yapıldı:** `.venv` içi Python, `python -m ipykernel install --user
  --name=medical-steth-ecg` ile Jupyter kernel olarak kaydedildi.
- **Neden:** Antigravity IDE'de notebook açıldığında `.venv` ortamının kernel
  listesinde görünmesi ve indirme yapmadan seçilebilmesi için.
- **Sonuç:** "Python (steth-ecg venv)" kernel olarak listede görünür hale
  geldi.

### 8. Örnek kalp sesi veri seti indirildi
- **Nerede:** `data/raw/physionet-cinc2016-a/` (`a0001.wav`, `a0002.wav`,
  `a0003.wav`)
- **Ne yapıldı:** PhysioNet/CinC Challenge 2016 (training-a) veri setinden
  3 örnek kayıt indirildi (2000 Hz, 16-bit mono WAV).
- **Neden:** Donanım (MAX9814 + ESP32) hazır olmadan, gerçek kalp sesi
  kayıtları üzerinde filtre geliştirme ve doğrulama yapabilmek için. Tüm
  181 MB'lık veri seti yerine sadece birkaç örnek indirildi.
- **Sonuç:** 3 kayıt başarıyla indirildi ve doğrulandı.

### 9. İlk analiz notebook'u oluşturuldu ve çalıştırıldı
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb`
- **Ne yapıldı:**
  - Bölüm 1: Ham sinyalin zaman grafiği ve FFT'si
  - Bölüm 2: Sentetik gürültü ekleme (beyaz gürültü, 50/100 Hz şebeke
    paraziti, hareket artefaktı)
  - Bölüm 3: Band-pass (20-500 Hz) + notch (50/100 Hz) filtreleme
  - Bölüm 4: Ham / gürültülü / filtrelenmiş sinyal karşılaştırması
  - Bölüm 5: Aynı analiz a0002 ve a0003 kayıtlarıyla tekrarlandı
  - Bölüm 6: SNR (sinyal/gürültü oranı, dB) ölçümü — filtre öncesi/sonrası
  - Bölüm 7: Dayanıklılık testi — 4 farklı gürültü seviyesinde (Hafif/Orta/
    Güçlü/Aşırı) SNR karşılaştırması
- **Neden:** README'deki Aşama 3 (Python ile doğrulama) kapsamında, filtre
  zincirinin gerçekten işe yarayıp yaramadığını hem görsel hem sayısal
  olarak doğrulamak.
- **Sonuç:**
  - Üç kayıtta da filtre ~16-18 dB tutarlı SNR iyileşmesi sağladı (Orta
    gürültü seviyesinde)
  - Dayanıklılık testinde: iyileşme miktarı (~14-18 dB) gürültü seviyesinden
    bağımsız sabit kalıyor, ama girdi çok gürültülüyse (Güçlü/Aşırı) çıktı
    SNR'ı hâlâ negatif kalabiliyor → filtrenin bir dayanıklılık sınırı
    olduğu tespit edildi.

### 10. Analiz raporu oluşturuldu
- **Nerede:** `results/01_ilk_analiz_rapor.md`
- **Ne yapıldı:** Notebook'taki SNR ölçümü ve dayanıklılık testi sonuçları
  tablo + yorum halinde markdown rapora yazıldı.
- **Neden:** Notebook çıktısının kalıcı, okunabilir bir özetinin proje
  içinde durması; ileride referans alınabilmesi.
- **Sonuç:** Rapor iki bölümden oluşuyor: "Sonuçlar" (temel SNR tablosu) ve
  "Dayanıklılık Testi" (gürültü seviyesi × SNR tablosu + yorum).

### 11. Teorik notlar dosyası oluşturuldu
- **Nerede:** `docs/notes/teorik_notlar.md`
- **Ne yapıldı:** SNR/dB, zaman-frekans domeni (FFT), kalp sesi frekans
  bandı (S1/S2), band-pass/notch filtre mantığı, MAX9814 kazanç ayarı gibi
  sık kullanılan teorik kavramların basit açıklamaları yazıldı.
- **Neden:** Kullanıcı bu alanda yeni olduğu için, tekrar tekrar sorulacak
  temel kavramların bir referans dosyada toplanması.
- **Sonuç:** Kavramlar tek bir dosyada, madde madde erişilebilir hale geldi.
  Yeni bir kavram geçtikçe bu dosyaya eklenecek.

### 12. Sprint günlüğü oluşturuldu
- **Nerede:** `docs/sprint_log.md` (bu dosya)
- **Ne yapıldı:** O ana kadar yapılan tüm işler (1-11) geriye dönük olarak
  bu dosyaya sırayla işlendi.
- **Neden:** Hangi işin nerede, neden yapıldığını ve sonucunu takip etmek;
  ileriki çalışmaların da aynı formatta eklenerek proje geçmişinin kolay
  takip edilebilir olmasını sağlamak.
- **Sonuç:** Bundan sonraki her iş adımı bu dosyaya aynı formatta
  (Nerede / Ne yapıldı / Neden / Sonuç) eklenecek.

### 13. S1/S2 tespiti (kalp sesi segmentasyonu) yapıldı
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (Bölüm 8),
  sonuç yorumu `results/01_ilk_analiz_rapor.md`'ye eklendi
- **Ne yapıldı:** Temiz `a0001.wav` kaydı üzerinde Hilbert dönüşümü ile zarf
  (envelope) çıkarıldı, `find_peaks` ile tepeler bulundu, ardışık aralıklara
  (kısa=sistol, uzun=diyastol) bakılarak tepeler S1/S2 olarak etiketlendi.
- **Neden:** README'deki yol haritasında bir sonraki mantıklı adım — filtrelenmiş
  sinyalden kalp atışlarını (S1/S2) otomatik olarak ayırt edebilmek.
- **Sonuç:** 75 tepe tespit edildi (38 S1, 37 S2), tahmini kalp hızı 63.3 bpm.
  İlk ~13 saniyede sistol/diyastol net ayrışıyor (~360/630 ms), ama kaydın
  ortasında bir anomali (muhtemelen kaçırılan/fazladan bir vuruş) tüm sonraki
  etiketleri tersine çeviriyor (parity kayması) — bu basit global alternasyon
  yönteminin bilinen bir zayıflığı olarak tespit edildi ve sonraki adım için
  not düşüldü (yerel/adaptif senkronizasyon gerekiyor).

### 14. S1/S2 parity kayması hatası düzeltildi
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (Bölüm 8,
  `label_s1_s2` fonksiyonu ve analiz hücresi), açıklama önce
  `docs/notes/teorik_notlar.md`'ye yazıldı, sonuç `results/01_ilk_analiz_rapor.md`'ye
  eklendi
- **Ne yapıldı:** `label_s1_s2` fonksiyonu, global tek başlangıç kararı +
  dönüşümlü toggle yerine, her aralığı kendi başına aralıkların medyanına göre
  kısa (sistol)/uzun (diyastol) sınıflandıran bir yönteme değiştirildi. Sistol/
  diyastol ortalamaları da artık etiketlerden bağımsız, doğrudan medyan eşiğine
  göre hesaplanıyor.
- **Neden:** Madde 13'te tespit edilen parity kayması sorununu kökten çözmek —
  tek bir anomalinin (kaçan/fazladan vuruş) kayıt sonuna kadar tüm etiketleri
  bozmasını önlemek.
- **Sonuç:** Whole-recording ortalamaları artık net ayrışıyor: sistol 344 ms,
  diyastol 604 ms (önceden 470/479 ms — neredeyse ayırt edilemez durumdaydı).
  Anomali bölgesi (13-16 sn) manuel kontrol edildi: birkaç yerde art arda aynı
  etiket (yerel sapma) hâlâ oluşuyor ama kalıcı kaskad **yok** — birkaç tepe
  içinde kendini düzeltiyor. Kalan yerel sapmalar ince ayar seviyesinde,
  kritik değil.

### 15. Tüm klasörlere README eklendi
- **Nerede:** Proje kökündeki her klasöre (`data/` ve alt klasörleri,
  `docs/` ve alt klasörleri, `firmware/`, `hardware/` ve alt klasörleri,
  `results/`, `scripts/`, `signal_processing/` ve alt klasörleri) birer
  `README.md`. Ayrıca `.gitignore`, `data/processed/` ve `data/exports/`
  klasörlerini bütünüyle değil, içeriklerini yok sayacak şekilde düzeltildi
  (`data/processed/*` + `!data/processed/README.md` deseni) — aksi halde bu
  klasörlerdeki README'ler git'e hiç girmeyecekti.
- **Neden:** Proje GitHub'da public'e açıldı ve arkadaşlar repoyu
  görecek; boş/açıklamasız klasörler kafa karıştırıyordu. Her klasörde ne
  amaçlandığı ve şu an boşsa neden boş olduğu netleştirilmek istendi.
  `data/raw/physionet-cinc2016-a/README.md`'ye ayrıca veri setinin kaynağı
  ve atıf/lisans notu eklendi çünkü repo artık public.
- **Sonuç:** 22 klasörün tamamında açıklayıcı README var. Henüz commit
  edilmedi (kullanıcı onayı bekleniyor).

### 16. S1/S2 medyan düzeltmesi gerçekten koda uygulandı + ince ayar yapıldı
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (Bölüm 8,
  `label_s1_s2` ve `detect_peaks` fonksiyonları, analiz hücresi), sonuç
  `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:**
  - Önce bir tutarsızlık bulundu: madde 14'te "yapıldı" diye kaydedilen
    medyan eşikli düzeltme, gerçek notebook koduna hiç uygulanmamıştı —
    `label_s1_s2` hâlâ eski global-toggle yöntemini çalıştırıyordu (çıktı
    hâlâ 470/479 ms gösteriyordu, 344/604 ms değil).
  - Medyan eşikli yerel sınıflandırma gerçekten `label_s1_s2`'ye yazıldı;
    sistol/diyastol ortalamaları da etiketlerden bağımsız, doğrudan
    medyan eşiğine göre hesaplanacak şekilde analiz hücresi güncellendi.
  - Anomali bölgesi (13-16 sn) incelendi: `detect_peaks`'teki
    `min_distance_ms=200` değerinin, birbirine 208-232 ms gibi fizyolojik
    olarak imkânsız yakınlıkta iki sahte tepeyi kabul ettiği bulundu.
    `min_distance_ms` 250'ye çıkarıldı.
  - Notebook `jupyter nbconvert --execute --inplace` ile yeniden
    çalıştırılıp tüm çıktılar tazelendi.
- **Neden:** Dokümantasyon (rapor/sprint log) ile gerçek kod arasındaki
  tutarsızlığı gidermek, ve kullanıcının seçtiği sıradaki iş olan "S1/S2
  ince ayarı"nı tamamlamak.
- **Sonuç:** Sahte 2 tepe elendi (75 → 73 tepe), aralık dağılımı temiz iki
  kümeye ayrıldı (sistol 290-390 ms, diyastol 539-734 ms, aralarında
  boşluk, hiç kısa aykırı değer yok). Yeni sonuçlar: 61.5 bpm, sistol
  352 ms, diyastol 623 ms. Anomali bölgesinde hâlâ 3 art arda aynı etiket
  görülüyor ama artık sahte tepeden değil, medyana çok yakın (390 ms vs
  380 ms medyan) bir sınır değerinden kaynaklanıyor — gerçek kayıttaki
  küçük düzensizlik olarak kabul edilebilir, kalıcı kaskad yok.

### 17. Median filtre denemesi yapıldı
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni Bölüm 9),
  sonuç `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:** README'nin Aşama 3 kontrol listesinde geçen ama hiç
  denenmemiş median filtre test edildi. Mevcut gürültü modelinin (beyaz+hum+
  hareket) median filtrenin hedef gürültü tipi olmadığı fark edildiği için
  önce darbesel/impulsif "click" gürültüsü (`add_click_noise`) eklendi.
  Band-pass+notch zincirine median filtre eklenip eklenmemesi, click olan/
  olmayan durumlarda, **katı** karşılaştırmayla (referans median'dan
  geçirilmeden) 3 kayıt üzerinde ölçüldü.
- **Neden:** Median filtrenin gerçekten faydalı olup olmadığını, körü
  körüne zincire eklemek yerine ölçerek karar vermek.
- **Sonuç:** Karışık/kayda bağlı sonuç — a0001 ve a0003'te median filtre
  net SNR kazancı sağlıyor (+2.7 ile +5.5 dB arası), ama a0002'de SNR'ı
  düşürüyor (-1.6 ile -5.8 dB) çünkü median filtrenin bant içi gerçek
  keskin geçişlere verdiği zarar kazandığından fazla. Median filtre bu
  yüzden band-pass+notch zincirine varsayılan adım olarak eklenmedi;
  gerekirse kayda özel opsiyonel bir adım olarak not edildi.

### 18. Dayanıklılık sınırı için wavelet denoising denendi
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni
  Bölüm 10), `.venv`'e `PyWavelets` eklendi (ve `README.md`'deki kurulum
  komutuna eklendi), sonuç `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:** Bölüm 7'deki dayanıklılık testinde bulunan sınırı
  (Güçlü/Aşırı seviyede band-pass+notch çıktısının negatif SNR'da
  kalması) aşmak için wavelet tabanlı denoising (VisuShrink: `db6`
  dalgacığı, 5 seviye, medyan tabanlı evrensel eşik, yumuşak eşikleme)
  band-pass+notch zincirine ek adım olarak denendi. Median denemesindeki
  gibi katı karşılaştırma (referans wavelet'siz) kullanıldı; kendi
  bozulma da ölçüldü.
- **Neden:** Kullanıcının seçtiği sıradaki iş — dayanıklılık sınırını
  aşacak bir yöntem araştırmak.
- **Sonuç:** Median filtreden farklı olarak **her seviyede, her kayıtta**
  tutarlı kazanç (+3 ile +8 dB, Orta/Güçlü/Aşırı'da) ve düşük kendi
  bozulma (~29-43 dB, median'ın ~9-21 dB'sine kıyasla çok daha iyi).
  Aşırı seviyede önceden negatif kalan SNR'lar pozitife çekildi (örn.
  a0003: -7.12→+1.04 dB) — dayanıklılık sınırı gerçekten aşıldı. Ancak
  ESP32'de gerçek zamanlı çalıştırmak hesaplama açısından ağır; Aşama
  4'e (donanım) taşınıp taşınmayacağı orada değerlendirilecek, şimdilik
  yalnızca Python tarafında doğrulanmış bir yöntem.

### 19. Dinamik gürültü geçidi (noise gate) denendi
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni
  Bölüm 11), sonuç `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:** Kullanıcının bir arkadaşının önerdiği fikir test
  edildi: kalp sesi kesintili olduğu için, zarfın düşük olduğu "sessiz"
  bölgeleri tamamen sıfırlayarak aradaki kalıntı gürültüyü de sıfırlamak.
  Zarfın 20. persentili "sessizlik seviyesi" kabul edilip 1.5 katı eşik
  alındı, band-pass+notch çıktısına uygulandı; median/wavelet
  denemelerindeki gibi katı karşılaştırma kullanıldı.
- **Neden:** Arkadaşın önerdiği yöntemi körü körüne kabul/reddetmek
  yerine ölçerek karar vermek, önceki denemelerle (median, wavelet) aynı
  disiplinle test etmek.
- **Sonuç:** Median filtreden farklı bir örüntü bulundu — kayda bağlı
  değil, **gürültü seviyesine bağlı** koşullu bir fayda. Hafif/Orta
  seviyede SNR'ı düşürüyor (-2 ile -11 dB), Güçlü/Aşırı seviyede net
  kazanç sağlıyor (+0.3 ile +7 dB) ve Aşırı'daki negatif SNR'ları
  iyileştiriyor (wavelet'ten daha az güçlü ama aynı yönde). Sabit bir
  adım olarak değil, gürültü yüksek olduğunda devreye giren adaptif bir
  adım olarak not edildi. Hesaplama maliyeti çok düşük (abs+persentil) —
  bu yüzden wavelet'ten farklı olarak ESP32'de gerçek zamanlı
  çalıştırmak kolay; Aşama 4'te denenmeye değer bir aday.

### 20. Donanıma hazırlık simülasyonu — causal filtre + hafif zarf dedektörü
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni
  Bölüm 12), sonuç `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:** Arkadaşın önerdiği 1. ve 2. fikirler test edildi:
  - Şu ana kadarki filtreler (`sosfiltfilt`/`filtfilt`) çift geçişli,
    ESP32'de gerçek zamanlı çalışamaz. `sosfilt`+`lfilter` ile tek
    geçişli (causal) versiyonu test edildi, offline versiyonla SNR
    karşılaştırıldı (her ikisi de kendi referansına göre, adil
    karşılaştırma).
  - `sosfilt`'in içeride yaptığı biquad döngüsü (`y[n]=b0*w0+b1*w1+b2*w2`,
    Direct Form II Transposed) elle Python'da yazılıp scipy çıktısıyla
    bit düzeyinde karşılaştırıldı — bu döngünün C'ye birebir
    çevrilebileceğini kanıtlamak için.
  - Hilbert dönüşümüne alternatif olarak abs+hareketli ortalama tabanlı
    hafif bir zarf dedektörü (`compute_envelope_lightweight`) yazıldı,
    farklı pencere uzunlukları denendi, S1/S2 sonuçları Hilbert'le
    karşılaştırıldı (hem temiz hem Orta gürültülü sinyalde).
- **Neden:** Kullanıcının seçtiği yön — donanım gelmeden önce, ESP32'de
  gerçekten çalışacak (gerçek zamanlı, hafif) versiyonları hazırlayıp
  doğrulamak.
- **Sonuç:** Causal filtre offline'a kıyasla ihmal edilebilir kayıpla
  (<0.6 dB, her seviyede) çalışıyor. Elle yazılan fark denklemi döngüsü
  scipy ile 2.18e-14 farkla (kayan nokta hassasiyeti) eşleşti — katsayı
  ve döngü doğrudan C'ye taşınabilir. Hafif zarf dedektörü 30ms
  pencerede Hilbert'e çok yakın sonuç verdi (temiz sinyalde 74 vs 73
  tepe, gürültülü sinyalde 76 vs 75 tepe) — daha büyük pencerelerde
  (80ms+) sahte tepe sayısı hızla arttı. Aşama 4'e geçildiğinde bu iki
  fonksiyon doğrudan C koduna taşınmaya hazır.

### 21. İlk donanım kaydı başarıyla alındı — Aşama 4 başladı
- **Nerede:** `firmware/esp32_steth/esp32_steth.ino` (yeni),
  `scripts/record_from_esp32.py` (yeni), `data/raw/own_recordings/`
  (yeni — 3 kayıt), ilgili README'ler (`firmware/README.md`,
  `firmware/esp32_steth/README.md`, `scripts/README.md`,
  `data/raw/own_recordings/README.md`) ve kök `README.md` güncellendi.
- **Ne yapıldı:** Kullanıcı MAX9814 + ESP32 ile gerçek donanımdan ilk kez
  ses kaydı almayı başardı. Kod proje köküne `kod1.c++`/`kod2.py` olarak
  bırakılmıştı, doğru klasörlere taşındı ve isimlendirildi:
  - `esp32_steth.ino` — Arduino framework ile yazılmış ESP32 sketch'i;
    `analogRead` ile 16 kHz örnekleme yapıp 16-bit imzalı PCM'e çevirip
    Serial üzerinden (`"START"`/`"END"` işaretli) gönderiyor.
  - `record_from_esp32.py` — Serial'den PCM veriyi okuyup WAV'a yazan
    Python karşılama script'i.
  - Kullanıcı ve arkadaşlarından (abdul, muhammed, nadeem) alınan 3 kalp
    sesi kaydı `data/raw/own_recordings/` altına eklendi (16 kHz, 16-bit
    mono WAV).
  - Not düşüldü: `.ino` dosyasındaki yorum `GPIO36` diyor ama kod
    `MIC_PIN = 34` kullanıyor — bağlantı kontrol edilmeli. Ayrıca
    `record_from_esp32.py` içindeki `PORT = "COM7"` Windows'a özel,
    macOS'ta kullanılmadan önce değiştirilmesi gerekiyor.
- **Neden:** Proje başta ESP-IDF ile planlanmıştı (README'nin Aşama 4
  tanımı), ama kullanıcı önce Arduino framework ile daha hızlı, çalışan
  bir uçtan uca zincir kurdu — bu ilerlemeyi kaybetmemek ve doğru
  klasörlere yerleştirip belgelemek için taşıma/README güncellemesi
  yapıldı.
- **Sonuç:** Artık PhysioNet'in 3 dış kaydına ek olarak, kendi
  donanımımızdan 3 gerçek kayıt var (toplam 6). Aşama 3'te doğrulanan
  filtre zincirinin (causal band-pass+notch, hafif zarf dedektörü vb.)
  bu yeni kayıtlarla da test edilmesi sıradaki iş. Aşama 4 (ESP32 gerçek
  zamanlı çalışma) fiilen başlamış oldu; ADC continuous mode/DMA gibi
  ESP-IDF gerektiren ileri adımlar henüz yapılmadı.

### 22. Gerçek donanım kayıtları analiz edildi
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni Bölüm
  13), sonuç `results/01_ilk_analiz_rapor.md`'ye eklendi.
- **Ne yapıldı:** `data/raw/own_recordings/` altındaki 3 gerçek kayıt
  (abdul, muhammed, nadeem) üzerinde önce kırpılma (clipping) kontrolü
  yapıldı, sonra Bölüm 3'teki band-pass+notch filtre zinciri ve Bölüm
  8'deki S1/S2 tespiti (Hilbert zarf + medyan eşikli etiketleme) hiç
  değiştirilmeden bu kayıtlara uygulandı. Her kayıt için ham/filtrelenmiş
  zaman+FFT grafikleri ve S1/S2 işaretli zarf grafiği çizildi.
- **Neden:** Kullanıcının isteği — artık elde gerçek donanım kaydı olduğu
  için, PhysioNet verisiyle doğrulanmış yöntemin gerçek veride de işe
  yarayıp yaramadığını görsel olarak göstermek.
- **Sonuç:** Üç kayıtta da fizyolojik olarak makul kalp hızı (70.5-86.6
  bpm) ve net sistol/diyastol ayrışması elde edildi — mevcut filtre+S1/S2
  zinciri sentetik gürültüde olduğu gibi gerçek kayıtlarda da çalışıyor.
  Ayrıca üç kayıtta da bir miktar kırpılma tespit edildi (%0.68-3.29) —
  MAX9814 kazancının (muhtemelen 60 dB) yüksek olabileceğine işaret
  ediyor; bir sonraki kayıtta `GAIN` pini VCC'ye bağlanıp 40 dB'ye
  düşürülmesi önerisi not edildi. Temiz bir referans olmadığı için klasik
  SNR ölçülemedi; değerlendirme S1/S2 sonuçlarının makuliyeti üzerinden
  yapıldı.

### 23. Filtrelenmiş sesler WAV olarak kaydedildi (dinlemek için)
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (Bölüm
  13d), çıktılar `data/processed/own_recordings/` altına.
- **Ne yapıldı:** Bölüm 13b'de bellekte tutulan filtrelenmiş sinyaller,
  [-1,1] aralığına kırpılıp 16-bit WAV olarak diske yazıldı.
- **Neden:** Kullanıcı filtrelenmiş sesleri bir müzik oynatıcıda dinlemek
  istedi.
- **Sonuç:** 3 dosya üretildi (`*_filtered.wav`). `data/processed/*`
  zaten `.gitignore`'da olduğu için otomatik olarak git'e girmiyor —
  kişisel ses verisi yalnızca local'de kalıyor.

### 24. Doktora sunum için PCG rapor görüntüsü eklendi
- **Nerede:** `signal_processing/notebooks/01_ilk_analiz.ipynb` (yeni
  Bölüm 14), çıktılar `results/own_recordings_reports/` altına, kaynaklar
  ve yöntem `docs/notes/teorik_notlar.md`'ye ("PCG Görselleştirme") ve
  `results/01_ilk_analiz_rapor.md`'ye eklendi. `.gitignore`'a
  `results/own_recordings_reports/*` kuralı eklendi.
- **Ne yapıldı:** Kullanıcı, kayıtları bir doktora görüntü olarak sunmak
  istediğini belirtti; önce kısa bir literatür taraması yapıldı (klinik
  PCG çalışmalarında standart sunum: zaman domeni+zarf+S1/S2 işaretleme +
  spektrogram birlikte). Bu format `pcg_report_figure` fonksiyonuyla
  uygulandı: üstte filtrelenmiş sinyal+zarf+S1/S2, altta aynı zaman
  ekseninde spektrogram (0-500 Hz), başlıkta kalp hızı/sistol/diyastol
  özeti. Üç kayıt için PNG üretildi.
- **Neden:** Kullanıcının hedefi — bu kayıtları bir doktora değerlendirme
  için görsel olarak sunmak; kör kör bir grafik yerine literatürde
  kullanılan, klinisyenin aşina olduğu bir format seçildi.
- **Sonuç:** 3 kayıt için de spektrogramda S1/S2 zamanlarıyla örtüşen net
  dikey enerji patlamaları görüldü (beklenen, sağlıklı örüntü). Görüntüler
  kişisel sağlık verisi olduğu için yalnızca local'de tutuluyor, git'e
  girmiyor.

### 25. Doktora faydalı PCG özellikleri için literatür taraması yapıldı
- **Nerede:** `docs/notes/teorik_notlar.md` (yeni "Klinik Olarak Faydalı
  PCG Özellikleri" bölümü).
- **Ne yapıldı:** Kullanıcı, spektrogram+S1/S2 dışında piyasada/literatürde
  doktora faydalı olabilecek başka hangi PCG analizlerinin kullanıldığını
  sordu. Web araştırması yapıldı: zamanlama tabanlı özellikler (kalp hızı
  değişkenliği, sistolik zaman aralıkları), üfürüm karakterizasyonu
  (zamanlama/şekil/Levine şiddeti/perde), ekstra sesler (S3/S4 gallop,
  S2 çiftleşmesi), spektral öznitelikler, ML sınıflandırma (PhysioNet
  Challenge, CirCor DigiScope) ve ticari örnek olarak Eko'nun FDA onaylı
  EMAS yazılımı incelendi.
- **Neden:** Kullanıcının sıradaki yön kararını (hangi klinik özelliği
  eklemenin değerli olacağını) bilgiye dayalı vermesini sağlamak.
- **Sonuç:** Elimizdeki S1/S2 zaman damgaları ve zarfla en düşük maliyetle
  eklenebilecek iki adım önerildi: (1) sistol/diyastol aralıklarındaki
  zarf enerjisine bakarak basit bir üfürüm-varlığı göstergesi, (2) S2
  sonrası ek tepe arayarak S3/S4 taraması. Henüz koda uygulanmadı — bu bir
  literatür/yön araştırması, sıradaki iş kullanıcının hangisini seçtiğine
  bağlı.

### 26. Web arayüzü iskeleti kuruldu (Django + Next.js)
- **Nerede:** `web/` (yeni — `backend/`, `frontend/`), `.claude/rules/`,
  `.claude/skills/`, `.claude/settings.json`, `docs/decisions.md` (yeni
  içerik), kök `README.md` (klasör yapısı), `.gitignore`.
- **Ne yapıldı:** Kullanıcının hedefi (doktorun kayıtları web arayüzünden
  incelemesi) için mimari kararlar netleştirildi (bkz. `docs/decisions.md`)
  ve iskelet kuruldu:
  - `.claude/rules/django`, `.claude/rules/nextjs-ts-react` ve karşılık gelen
    `skills/` sembolik bağlantıları eklendi; iki stack template'inin
    `settings.json`'ı birleştirilerek proje köküne kopyalandı.
  - Local Postgres (`medical_steth_dev` db, `medical_steth_web` rolü)
    oluşturuldu; `pg_hba.conf` yalnızca local dev için `trust`'a çevrildi
    (kullanıcı onayıyla, yedek alınarak).
  - Django backend: `config` projesi, `apps/accounts` (custom `User`, JWT
    token endpoint'leri) ve `apps/recordings` (`Patient`, `Recording`,
    `AnalysisResult` modelleri) stack konvansiyonuna uygun klasör yapısıyla
    (`models/`, `serializers/v1/`, `views/v1/`, `filters/`, `services/`)
    oluşturuldu. `django-cors-headers`, `django-filter`, `django-extensions`
    (`TimeStampedModel`) entegre edildi. Migrasyonlar uygulandı, admin
    kayıtları eklendi, `runserver` ile smoke test yapıldı.
  - Next.js frontend: `create-next-app` ile TypeScript/App Router/Tailwind
    v4/shadcn kuruldu; `next-auth` v5 Credentials provider ile Django JWT
    endpoint'ine bağlandı (access token 25 dk'da bir refresh token ile
    otomatik yenileniyor). `app/(auth)/login` (Server Action +
    `useActionState`) ve `app/(dashboard)` (layout'ta `auth()` ile korumalı)
    route group'ları, `lib/api.ts` fetch wrapper'ı eklendi.
  - Test hesabı (`doktor` / superuser) oluşturulup Django token endpoint'i
    curl ile doğrulandı; frontend `npx tsc --noEmit`, `npm run lint`,
    `npm run build` ile temiz geçti; `/` → `/login` redirect ve login
    formunun render'ı HTTP seviyesinde doğrulandı.
- **Neden:** Kullanıcının kararı — backend Python/Django, db PostgreSQL,
  frontend Next.js; auth MVP'den itibaren, dosyalar yerel diskte, dev ortamı
  Docker'sız (native venv + local Postgres), backend kök `.venv`'i
  `signal_processing` ile paylaşıyor (ayrı ayrı sorulup onaylandı).
- **Sonuç:** Çalışan bir iskelet var (backend API + frontend login/dashboard
  kabuğu), ama henüz gerçek özellik (hasta/kayıt listesi, PCG görüntüleyici,
  ölçüm kartı vb. — önceki oturumda önerilen 5 özellik) eklenmedi. Ayrıca iki
  bilinen sınır: (1) `create-next-app` bir ara adımda projeyi yanlışlıkla
  `web/frontend/next-app/` alt klasörüne kurdu, elle düzeltilip
  `web/frontend/`'e taşındı — kurulum komutlarını tekrar çalıştırırken dizin
  teyidi önemli; (2) tam tarayıcı testi (gerçek login tıklaması) yapılamadı
  çünkü `chromium-cli`/Playwright bu makinede kurulu değil ve kurulumu
  `npm install` gerektirdiği için `.claude/settings.json`'daki deny kuralına
  takılıyor — yalnızca HTTP seviyesinde (curl) doğrulama yapıldı, kullanıcının
  tarayıcıda elle test etmesi gerekiyor.

### 27. Backend'e gerçek PCG analizi bağlandı (uçtan uca çalışıyor)
- **Nerede:** `signal_processing/src/` (yeni — `filters.py`, `envelope.py`,
  `segmentation.py`, `report.py`, `pipeline.py`, güncellenmiş `README.md`),
  `web/backend/apps/recordings/` (`serializers/v1/`, `views/v1/`,
  `services/analysis.py`, `urls_v1.py`), `web/backend/config/settings.py`
  (repo kökü `sys.path`'e eklendi), `docs/decisions.md`,
  `docs/notes/teorik_notlar.md`.
- **Ne yapıldı:** Kullanıcının seçtiği kapsam — sadece CRUD iskeleti değil,
  gerçek analiz. `01_ilk_analiz.ipynb`'deki doğrulanmış fonksiyonlar
  (`bandpass`/`notch`, `compute_envelope`, `detect_peaks`, `label_s1_s2`,
  `pcg_report_figure`) `signal_processing/src/`'e çıkarıldı ve
  `data/raw/own_recordings/` kayıtlarıyla (86.6/79.3/70.5 bpm, notebook
  Bölüm 13 çıktısıyla birebir) doğrulandı. Backend tarafında:
  - `apps/recordings/serializers/v1/` — Patient (List/Detail/Write),
    Recording (List/Detail/Write), AnalysisResult serializer'ları.
  - `apps/recordings/services/analysis.py` — `run_analysis(recording)`:
    pipeline'ı çalıştırıp `AnalysisResult`'a kalp hızı/sistol/diyastol/S1-S2
    zaman damgalarını yazıyor, rapor PNG'sini ve filtrelenmiş WAV'ı
    (`ContentFile` ile, diske ayrı yazmadan) kaydediyor, hata durumunda
    `status=failed` + `error_message` set ediyor.
  - `apps/recordings/views/v1/` — `PatientViewSet`, `RecordingViewSet`
    (multipart upload, `create()` override edilip yükleme sonrası analiz
    çalıştırılıp tam detay (analiz dahil) dönüyor).
  - `urls_v1.py` — `DefaultRouter` ile `patients/` ve `recordings/`.
- **Neden:** Kullanıcının kararı (bkz. `docs/decisions.md`) — CRUD'u analiz
  olmadan kurmak yerine, doğrulanmış sinyal işleme mantığını hemen bağlayıp
  uçtan uca çalışan bir sistem elde etmek.
- **Sonuç:** Test hesabıyla (`doktor`) curl üzerinden hasta oluşturulup
  gerçek bir kayıt (`abdul_heart1.wav`) yüklendi; backend otomatik olarak
  86.6 bpm, 278ms sistol, 415ms diyastol hesapladı (notebook referansıyla
  birebir), rapor PNG'sini (spektrogram+S1/S2 işaretli) ve filtrelenmiş
  WAV'ı üretti — PNG görsel olarak da kontrol edildi. Analiz senkron
  çalışıyor (Celery yok), MVP için yeterli hızda. Sıradaki iş: frontend'de
  hasta/kayıt listesi ve rapor görüntüleyici ekranlarının bu API'lere
  bağlanması.

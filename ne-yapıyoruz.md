# Bu Projede Ne Yapıyoruz?

Bu dosya, projeyi teknik bilgisi olmayan biri için basit dille anlatır — "şu ana kadar ne yaptık, neden yaptık" sorusuna cevap.

## Hedef

ESP32 (küçük bir mikroişlemci) ve MAX9814 (hassas bir mikrofon amplifikatörü) ile kalp seslerini dinleyen dijital bir steteskop yapmak. Bunu mevcut EKG cihazına da bağlanabilir hale getirmek istiyoruz.

## Sorun

Mikrofon ham haliyle sadece kalp sesini değil, her türlü gürültüyü de yakalar:

- elektrik hattından gelen 50 Hz uğultu (evdeki prizin sesi gibi)
- kablo/temas hareketinden gelen hışırtı
- genel ortam gürültüsü

Bu gürültüyü temizlemeden kalp sesini net dinleyemeyiz.

## Neden simülasyonla başladık

Henüz MAX9814'ü ESP32'ye bağlayıp gerçek kayıt almadık — donanım hazır değil. Bu yüzden "gerçek hastane kayıtları" içeren halka açık bir veri tabanından (PhysioNet) 3 örnek kalp sesi kaydı indirdik. Bunlar gerçek insanlardan alınmış temiz kayıtlar. Üzerine **kendimiz sahte gürültü ekleyip** filtrelerimizin işe yarayıp yaramadığını test ediyoruz — yani gerçek donanım gelmeden önce "kağıt üzerinde" (Python'da) prova yapıyoruz.

## Adım Adım Ne Yaptık

### 1. Ham sinyale bakma

Kaydı bilgisayara alıp iki şekilde çizdirdik: zamana göre (dalga nasıl görünüyor) ve frekansa göre (FFT — hangi frekanslarda ne kadar "ses enerjisi" var). Bu, doktorun steteskopu takmadan önce "neyle karşı karşıyayız" diye bakması gibi.

### 2. Sahte gürültü ekleme

Temiz kayda üç tür gürültü bindirdik: beyaz gürültü (radyo cızırtısı gibi rastgele), 50/100 Hz uğultu (priz sesi) ve düşük frekanslı hareket sesi (kablo oynaması gibi). Artık elimizde gürültülü, gerçekçi bir test kaydı var.

### 3. Filtre kurma (band-pass + notch)

İki filtre yazdık:

- **Band-pass**: sadece 20-500 Hz arasını bırakır, dışındaki her şeyi keser. Kalp sesleri bu bantta olduğu için, bunun dışındaki her şey zaten gürültüdür.
- **Notch**: sadece 50 Hz (ve 100 Hz) civarını nokta atışı keser — priz uğultusunu hedef alır.

### 4-5. Karşılaştırma ve tekrar test

Ham/gürültülü/filtrelenmiş halleri yan yana çizdirip gözle kontrol ettik, aynı testi 3 kayıtla tekrarladık (tek kayıtta işe yarayıp diğerinde yaramaması riskine karşı).

### 6. Sayısal ölçüm — SNR

"Filtre gerçekten işe yaradı mı" sorusunu göze değil sayıya bağladık: **SNR** (sinyal/gürültü oranı, dB) — basitçe "sesin gürültüye göre ne kadar yüksek olduğu". Negatif SNR = gürültü sesten baskın; pozitif ve yüksek SNR = ses net duyuluyor. Filtre öncesi negatifti, sonrası +17 dB civarına çıktı — yani gürültü belirgin şekilde azaldı. Bu sadece gözle "sanki iyileşti" demek değil, ölçülebilir bir kanıt.

### 7. Dayanıklılık testi

"Peki gürültü çok daha fazla olsa filtre yine kurtarır mı?" diye sorduk. Gürültüyü kademeli artırıp (Hafif → Orta → Güçlü → Aşırı) her seviyede test ettik. Sonuç: filtre her seferinde benzer miktarda (~15-18 dB) iyileştiriyor ama girdi zaten çok kötüyse çıktı da hâlâ kötü kalabiliyor — yani filtrenin bir sınırı var, sihirli değnek değil.

### 8. Kalp atışını bulma (S1/S2)

"Lub-dub" dediğimiz iki ses var: S1 (lub) ve S2 (dub). Sinyalin "zarfını" (genel şeklini) çıkarıp tepe noktalarını bulduk; kısa aralık = S1'den S2'ye (sistol), uzun aralık = S2'den sonraki S1'e (diyastol) mantığıyla etiketledik.

İlk denemede bir hata bulduk: tek bir yanlış tespit, tüm sonraki etiketleri ters çeviriyordu (domino etkisi). Bunu, her aralığı kendi başına değerlendiren daha akıllı bir yöntemle düzelttik, sonra da tespit hassasiyetini ayarlayıp (çok yakın sahte tepeleri eleyerek) sonucu netleştirdik.

### 9. Median filtre denemesi (işe yaramadı, ama denemeye değerdi)

Median filtre, ani "click/pat" tarzı gürültüye iyi gelir (kablo çarpması gibi). Test ettik: bazı kayıtlarda yardımcı oldu, bazısında zarar verdi (gerçek sesin ince detaylarını da bulanıklaştırdığı için). Yani garanti bir çözüm değil — sonuç kayda göre değişiyor, bu yüzden varsayılan olarak kullanmıyoruz.

### 10. Wavelet denoising (sınırı aşan yöntem)

Daha akıllı bir gürültü temizleme yöntemi denedik (wavelet denoising — sinyali farklı "ölçeklerde" inceleyip sadece gürültü kısmını temizliyor). Bu, 7. adımda bulduğumuz sınırı gerçekten aştı: en kötü gürültü seviyesinde bile SNR'ı negatiften pozitife çekti, ve median filtre gibi bazen zarar vermedi — her kayıtta tutarlı fayda sağladı. Tek dezavantajı: hesaplama açısından ağır, küçük bir işlemci (ESP32) üzerinde gerçek zamanlı çalıştırmak zor olabilir — bu yüzden şimdilik not olarak duruyor.

## Genel Resim

Şu ana kadar yaptığımız her şey **"donanım gelmeden önce yazılımda prova"** aşaması (README'deki Aşama 3). Gerçek MAX9814 mikrofonunu hiç bağlamadık, gerçek bir devre (analog filtre) hiç kurmadık — onlar Aşama 1 ve 2, henüz yapılmadı.

Şu anki kazancımız: hangi filtrenin işe yaradığını, hangisinin yaramadığını ve sınırların nerede olduğunu gerçek insan verisiyle, sayısal olarak öğrenmiş olmamız. Donanım geldiğinde artık kör kör denemek yerine, "bu filtreler işe yarıyor, bunlar yaramıyor" bilgisiyle başlayacağız.

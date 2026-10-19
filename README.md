# serkan.exe — Birthday Edition ✳

Serkan Abi için telefonda da iyi görünen küçük bir doğum günü sürprizi: animasyonlu geliştirici terminali → tek dokunuşla müzikli kutlama → kişisel mektup.

**Kurulum, paket yöneticisi, ücretli servis veya sunucu uygulaması gerekmez.** HTML, CSS ve sade JavaScript. Tüm bağlantılar göreli; GitHub Pages'in `/repo-adi/` adreslerinde de çalışır. Site dışarıdan font, görsel, analiz aracı ya da müzik indirmez.

## Yerelde aç

Bu klasörde bir terminal açıp çalıştır:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Tarayıcıdan **http://127.0.0.1:8000** adresine git. Kapatmak için terminalde `Ctrl+C`. Python yoksa VS Code'un ücretsiz Live Server eklentisi gibi bir statik önizleyici de yeterlidir. `index.html` doğrudan açıldığında da temel deneyim çalışır; ses dosyası ve tarayıcı izinlerini doğrulamak için HTTP önizlemesi önerilir.

## Mesajı değiştir

**`content.js`** kişiselleştirilecek alanları tek yerde toplar:

- `name`, `terminalName`, `tagline`: kutlama başlığı ve kısa alt metin.
- `salutation`, `message`: hitap ve mektup paragrafları. Her paragraf ayrı bir dize.
- `signoff`, `signature`: kapanış ve büyük Mıstık imzası.
- `portrait`, `portraitAlt`, `portraitPosition`, `portraitCaption`: fotoğraf.
- `memoryPhoto`, `memoryPhotoAlt`, `memoryTitle`, `memoryCaption`: üçlü mangal fotoğrafı ve yanındaki yazı.
- `music`: kendi müziğin veya varsayılan özgün döngü.

Mektup samimi bir **örnek metindir**; istediğin gibi düzenle. Çift tırnak kullanacaksan dizenin içinde `\"` yaz veya tek tırnak kullan. Metinler `textContent` ile yerleştirilir; HTML kabul edilmez. JavaScript kapalıyken de kendi mesajının görünmesini istiyorsan `index.html` içindeki aynı metinleri de güncelle.

## Serkan Abi'nin fotoğrafını ekle

Serkan Abi’nin gönderilen portresi `assets/serkan.jpg`, üçlü fotoğrafınız `assets/mangal-ekibi.jpg` olarak eklendi. Fotoğraflar mobil yüklemeye uygun JPEG kopyalarıdır; asılları değiştirilmedi. Üçlü fotoğraf, mektuptan sonra tam kadrajlı bir anı bölümü olarak görünür.

Fotoğrafı ileride değiştirmek için:

1. Fotoğrafı `assets/serkan.jpg` olarak koy. Dikey, en az 640 × 760 piksel ve tercihen 500 KB altı bir görsel iyi sonuç verir.
2. `content.js` içinde şu alanları güncelle:

```js
portrait: "./assets/serkan.jpg",
portraitAlt: "Serkan Abi gülümserken",
portraitPosition: "60% 35%",
portraitCaption: "",
```

Yüzün konumuna göre `portraitPosition` içindeki ikinci yüzdeyi değiştir. `portrait-placeholder.svg`, yalnızca yükleme hatası için saklanan SA harfli özgün bir çizimdir; gerçek Serkan Abi'nin fotoğrafı değildir. Fotoğraf yüklenemezse bu çizim gösterilir. SVG de yoksa çerçeve ve yazılı kutlama görünmeye devam eder.

## Müzik

Varsayılan müzik, `audio.js` içinde Web Audio API ile üretilen **özgün 120 BPM house döngüsüdür**: kick, hi-hat, clap, bas ve akorlar. Sample veya üçüncü taraf kayıt içermez. Terminalin yaklaşık 5 saniyelik açılışı tamamlanmadan düğme ve Enter ile geçiş yapılamaz; açılışı atlama yoktur. Sonrasında **Sürprizi başlat** veya Enter ile müzik başlar ve sayfa açıkken döngüde kalır. Ses aç/kapat veya sakin mod düğmesi yoktur. Ses yavaşça yükselir. Tarayıcı/işletim sistemi sesi keserse dönüşte ya da sonraki dokunuşta devam etmeyi dener; mobil tarayıcıların arka plan ses politikaları değişebilir.

Kendi kaydın veya kullanım iznin olan bir müzik için:

1. Dosyayı `assets/house.mp3` olarak koy.
2. `content.js` içindeki `music` alanını değiştir:

```js
music: {
  src: "./assets/house.mp3",
  label: "SERKAN'S BIRTHDAY MIX",
  volume: 0.35
}
```

MP3 geniş tarayıcı desteği sağlar. Parça döngüye girer; kesintisiz bir loop seç. Lisans gerektiriyorsa sanatçı/kaynak bilgisini görünür biçimde `index.html` içine ekle. Yükleme başarısız olur veya 6 saniyeyi aşarsa özgün döngüye geçilir. Web Audio da kullanılamıyorsa kutlama sessiz çalışır. Başlatma engellenirse sonraki dokunuşta tekrar denenir. Ayrıntılar: [MDN — Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## Ücretsiz GitHub Pages yayını

GitHub Free ile **public** bir depo kullan:

1. GitHub'da `serkan-birthday` gibi boş bir public depo oluştur.
2. **Bu klasörün içeriğini deponun köküne** yükle. `index.html`, `styles.css`, `content.js`, `app.js`, `audio.js` ve `assets/` aynı seviyede olmalı. Üstte bir `serkan-birthday/` klasörü daha bırakma. `.nojekyll` dosyasını da dahil et; görünmüyorsa Git üzerinden ekleyebilirsin.
3. Depoda **Settings → Pages → Build and deployment** bölümüne git.
4. **Source: Deploy from a branch**, **Branch: main**, klasör **/(root)** seç ve **Save** düğmesine bas.
5. GitHub'ın dağıtımı bitirmesini bekle. Pages ekranında yayın adresi görünür: `https://KULLANICI-ADIN.github.io/serkan-birthday/`.
6. Bu adresi önce telefonunda dene; sonra Serkan Abi'ye gönder. Sonraki dosya güncellemeleri aynı adrese otomatik yayımlanır.

Build komutu veya GitHub Actions yapılandırması gerekmez. Bir hata olursa deponun **Actions** sekmesindeki Pages çalışmasını kontrol et. Fotoğraf ve müzik dosya adlarında büyük/küçük harfleri birebir eşleştir.

Resmî kaynaklar: [GitHub Pages site oluşturma](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [yayın kaynağı ayarları](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Hareket, erişilebilirlik ve yedekler

- Not bağlantısı büyük bir neon tabela gibi, 3.8 saniyelik yumuşak bir parıltıyla belirginleşir. Cihazın hareketi azalt tercihinde sabit kalır.
- Arka plan ışıkları 12–15 saniyelik yavaş hareketlerle akar; sert flaş veya strobe kullanılmaz. Çok hızlı parlaklık değişimleri ve otomatik ses yoktur.
- Cihazın **hareketi azalt** tercihi terminal satırlarını animasyonsuz gösterir, konfeti ve dekoratif hareketleri durdurur. Ayrı bir sakin mod düğmesi yoktur; işletim sisteminin erişilebilirlik tercihi otomatik uygulanır.
- Tüm düğmeler klavyeyle kullanılabilir, belirgin odak halkaları ve ekran okuyucu etiketleri vardır. Terminalin dekoratif satırları tek tek okutulmaz; hazır olma ve kutlama durumları kısa bildirilir.
- Konfeti en fazla 3.8 saniye sürer, mobilde parçacık ve piksel yoğunluğu sınırlıdır. Arka planda durur. Hareketi azalt tercihinde düğmeler yazılı kutlama üretir.
- JavaScript kapalıysa doğrudan fotoğraf ve mektup görünür. Ana kod yüklenemezse açılış en geç 8 saniye sonra kaldırılır. Ses dosyası ya da Canvas desteği kutlama için zorunlu değildir.
- Site form göndermez, dilek kaydetmez, çerez, yerel depolama veya analiz aracı kullanmaz.

## Dosyalar

```text
index.html                      Yapı, erişilebilir etiketler, JS'siz metin
styles.css                      Mobil düzen, ışıklar ve hareketi azalt desteği
content.js                      Fotoğraf, mesaj ve müzik ayarları
audio.js                        Özgün house sentezleyicisi ve dosya yedeği
app.js                          Terminal, geçiş, ses, konfeti ve kontroller
assets/serkan.jpg               Serkan Abi’nin gerçek portresi
assets/mangal-ekibi.jpg         Üçlü mangal fotoğrafı
assets/portrait-placeholder.svg Fotoğraf yüklenemezse kullanılan SA yedeği
assets/favicon.svg              Sekme simgesi
.nojekyll                       GitHub Pages için statik dosya işareti
LICENSE                         Proje kodu ve özgün çizimlerin MIT lisansı
```

## Göndermeden önce

- iPhone Safari / Android Chrome'da portreyi ve uzun mesajı kontrol et.
- Terminal sürerken dokunmanın veya Enter basmanın geçiş yapmadığını doğrula.
- Terminal bitince başlat; müziğin döngüde devam ettiğini kontrol et.
- Cihazdaki hareketi azalt ayarını dene.
- Klavyeyle Tab, Enter ve düğmeleri kullan.
- Fotoğrafı ve kendi ses dosyanı eklediysen yayın adresinde de yüklenmelerini kontrol et.

Kod, sentezlenen döngü ve SVG çizimleri bu proje için hazırlanmıştır. Kendi eklediğin fotoğraf ve kayıtların izinleri sana aittir.

# **Kizuna: Çiftler İçin Ortak Sanal Pet Mobil Web PWA Platformu Kapsamlı Ürün Gereksinimleri Dokümanı (PRD) ve Teknik Şartnamesi**

## **Marka Kimliği, İsimlendirme ve Sanatsal Tarz Analizi**

Sanal pet ekosistemleri, kullanıcıların dijital bir varlıkla kurduğu duygusal bağ üzerine inşa edilir. Bu bağın kalıcı hale gelmesi, platformun sunduğu görsel dilin samimiyeti ve markanın akılda kalıcılığı ile doğrudan ilişkilidir. Çiftlerin ortaklaşa sahipleneceği bu oyun için belirlenen marka ismi **Kizuna** olarak kararlaştırılmıştır. Japonca kökenli bir kelime olan ve "bireyler arasındaki sarsılmaz bağ, sevgi ve dostluk köprüsü" anlamına gelen Kizuna, iki kullanıcının ortak bir yaşam formunu birlikte büyütme misyonunu sembolize eder.  
Uygulamanın sanatsal tarzı, retro oyun konsollarının nostaljisini modern mobil tasarım estetiğiyle harmanlayan **Sıcak Pastel Piksel Sanatı (Cozy Pastel Pixel Art)** akımına dayanmaktadır1. Klasik PICO-8 tarzının sunduğu keskin ve agresif kontrastlı renk paletleri yerine, oyuncuyu yormayan ve huzur veren Sweetie 16 esintili daha yumuşak, pastel tonlar tercih edilmiştir2. Görsel dünyayı oluşturan piksellerin ölçeklendirilmesinde çift doğrusal (bi-linear) yumuşatma algoritmaları tamamen devre dışı bırakılarak, CSS katmanında piksel keskinliği (image-rendering: pixelated) korunmuştur.  
Aşağıdaki tabloda, Kizuna markasının kurumsal kimliğini oluşturan renk paleti standartları, renk kodları ve bu renklerin oyun içi kullanıcı arayüzü (UI) bileşenlerindeki spesifik rol dağılımları listelenmiştir:

| Renk Adı | Hex Kodu | Kullanım Alanı ve Arayüz Rolü | Psikolojik Etki ve Estetik Amaç |
| :---- | :---- | :---- | :---- |
| **Kozmik Gece** | \#1a1c2c | Metinler, piksel dış hatları (outlines), kart kenarlıkları ve gölgeler2. | Keskin siyahın oluşturduğu sertliği kırarak göz yorgunluğunu azaltır, arayüze retro derinlik katar. |
| **Pastel Gül** | \#ff77a8 | Yakınlık (Kinship) göstergesi, sevgi etkileşimi kalpleri, dişi tasarım ögeleri2. | Şefkat, sıcaklık, romantik bağ ve empati hissini tetikler. |
| **Günbatımı Turuncusu** | \#ef7d57 | Açlık durumu, kritik uyarı pencereleri, enerji harcama butonları2. | Dikkat çekici bir uyanıklık hissi verir, ancak kırmızı gibi agresif veya korkutucu bir duruma yol açmaz. |
| **Sıcak Kum Sarısı** | \#ffcd75 | Deneyim puanı (XP) barları, seviye atlama efektleri, altın birikimleri2. | Başarı, neşe, ödüllendirme ve pozitif geri bildirim algısını güçlendirir. |
| **Nane Yeşili** | \#a7f070 | Temizlik/hijyen göstergesi, banyo eylemleri, doğa elementleri2. | Tazelik, sağlık, temizlik ve dengeli bir yaşam ritmi hissi uyandırır. |
| **Bulut Mavisi** | \#41a6f6 | Gökyüzü arka planı, su etkileşimleri, uyku rüya bulutları2. | Dinginlik, huzur, sonsuz güven ve stabilite algısı sunar. |
| **Krem Beyazı** | \#f4f4f4 | Bilgi kartları arka planları, konuşma balonları, nötr alanlar2. | Okunabilirliği maksimize eder, pastel renklerin ön plana çıkması için temiz bir zemin oluşturur. |
| **Mistik Mor** | \#5d275d | Çiftlerin ortak profili, geçmiş bakım günlükleri arka planı2. | İki kişi arasındaki bağın benzersizliğini ve derinliğini temsil eder. |

### **Pet Karakter Tasarımı: Mochi**

Kizuna dünyasının merkezinde yer alan sanal canlı, sevimli bir aksolotl ile yavru kedinin fiziksel özelliklerini taşıyan **Mochi** isimli melez bir varlıktır3. Mochi, su canlılarının yumuşak hatlarına sahip olmakla birlikte kedi kulakları, patileri ve kuyruğuna sahiptir3. Başının iki yanından çıkan üçer adet duyusal solungaç, petin o anki duygusal durumuna göre (mutluyken parıldama, açken büzüşme, uykuluyken yavaşça sönme) renk değiştiren pastel pembe piksellerden oluşur3. Mochi, çiftlerin ortak bakımına bağlı olarak zaman içerisinde üç farklı gelişim aşamasına (Evrim Evreleri) ulaşır:

* **Bebeklik (Evre 1):** Henüz küçük bir su damlası formunda olan, patileri belirmemiş, sürekli yuvarlanarak hareket eden ve sadece basit ses efektleri çıkaran aşamadır.  
* **Gençlik (Evre 2):** Kulakları ve patileri belirginleşen, arka ayakları üzerinde durabilen, sahiplerini tanıyıp konuşma balonlarında daha belirgin ifadeler sergileyen orta aşamadır.  
* **Kadimlik (Evre 3):** Tam kedi-aksolotl formuna erişmiş, başında çiftlerin tercihine göre özelleştirilebilen küçük bir piksel taç veya şapka taşıyan, gelişmiş animasyonlara sahip olgun aşamadır.

## **Sistem Mimarisi ve Teknoloji Seçimi Gerekçelendirmesi**

Ortak bir sanal pet uygulamasında kullanılacak platformun seçimi, çiftlerin oyuna erişim hızını ve geliştirme sürecinin verimliliğini doğrudan belirler. Projenin başlangıcında değerlendirilen React Native seçeneği, derleme süreçleri, mağaza onay mekanizmaları ve Netlify'ın statik barındırma mimarisine uyumsuzluğu nedeniyle elenmiştir4. Bunun yerine, uygulamanın **React \+ Vite \+ TypeScript \+ Tailwind CSS** tabanlı bir **Progressive Web App (PWA)** olarak yapılandırılması kararlaştırılmıştır5.  
Aşağıdaki tabloda, platformun hedeflediği kullanıcı deneyimi ve dağıtım kolaylığı açısından React PWA ile React Native teknolojileri derinlemesine karşılaştırılmıştır:

| Değerlendirme Kriteri | React PWA (Vite \+ Netlify) | React Native (iOS / Android) | Tercih Gerekçesi ve Stratejik Önem |
| :---- | :---- | :---- | :---- |
| **Dağıtım ve Yayınlama** | Netlify üzerinden tek tıkla anlık statik yayınlama4. | App Store / Google Play üzerinden zorunlu onay süreci. | Hızlı iterasyon ve sıfır maliyetli barındırma sağlar4. |
| **Kullanıcı Erişim Süreci** | Uygulama mağazasına girmeden, URL üzerinden anında kurulum7. | Mağazadan indirme, depolama alanı ayırma gereksinimi. | Çiftlerin uygulamaya sürtünmesiz erişimini destekler7. |
| **Güncelleme Mekanizması** | Sunucu üzerinde anında güncelleme, tarayıcıda otomatik yenileme7. | Mağaza güncellemeleri, kullanıcı onayına bağlı sürüm geçişleri. | Çiftlerin her zaman aynı veritabanı şeması ve oyun sürümünde kalmasını sağlar7. |
| **Geliştirme Hızı (HMR)** | Vite ile milisaniyeler düzeyinde Hot Module Replacement hızı5. | Metro bundler ile nispeten daha yavaş derleme ve emülatör yükü. | Cursor ile "Vibe Coding" yaparken yapay zekanın kod üretme ve test döngüsünü kısaltır5. |
| **Çevrimdışı Çalışma Gücü** | Service Worker ve Workbox ile gelişmiş statik varlık önbelleğe alma7. | Cihazın yerel dosya sistemine doğrudan bağımlılık. | İnternet kesintilerinde dahi oyun arayüzünün sorunsuz açılmasını sağlar7. |

### **Progressive Web App (PWA) Yapılandırma Standartları**

Uygulamanın mobil cihazlarda yerel bir uygulama gibi çalışabilmesi için vite-plugin-pwa kütüphanesi entegre edilmiştir7. Bu entegrasyon kapsamında, uygulamanın çevrimdışı kalması durumunda dahi çalışabilmesi için statik dosyalar (HTML, JS, CSS ve ses şablonları) tarayıcı hafızasına CacheFirst stratejisiyle kaydedilir7. Aşağıdaki teknik blokta, projenin derleme aşamasında otomatik olarak PWA manifestosunu üreten ve arka planda çalışan servis işçisini (Service Worker) yapılandıran vite.config.ts ayarları sunulmuştur7:

TypeScript  
import { defineConfig } from 'vite';  
import react from '@vitejs/plugin-react';  
import tailwindcss from '@tailwindcss/vite';  
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({  
  plugins: \[  
    react(),  
    tailwindcss(),  
    VitePWA({  
      registerType: 'autoUpdate',  
      includeAssets: \['favicon.ico', 'robots.txt', 'apple-touch-icon.png'\],  
      manifest: {  
        name: 'Kizuna: Cozy Shared Pet',  
        short\_name: 'Kizuna',  
        description: 'Çiftler için tasarlanmış gerçek zamanlı, ortak sanal pet büyüme oyunu.',  
        theme\_color: '\#1a1c2c',  
        background\_color: '\#f4f4f4',  
        display: 'standalone',  
        orientation: 'portrait',  
        icons: \[  
          {  
            src: 'pwa-192x192.png',  
            sizes: '192x192',  
            type: 'image/png'  
          },  
          {  
            src: 'pwa-512x512.png',  
            sizes: '512x512',  
            type: 'image/png'  
          }  
        \]  
      },  
      workbox: {  
        globPatterns: \['\*\*/\*.{js,css,html,ico,png,svg,woff2}'\],  
        runtimeCaching: \[  
          {  
            urlPattern: ({ url }) \=\> url.pathname.startsWith('/api/'),  
            handler: 'NetworkOnly'  
          }  
        \]  
      }  
    })  
  \]  
});

## **Aavegotchi ve Tamagotchi Esintili Stat ve İlerleme Sistemi**

Kizuna'nın oyun mekaniği, klasik Tamagotchi cihazlarının periyodik bakım sorumluluğu ile Aavegotchi'nin matematiksel olarak çeşitlendirilmiş istatistik ve nadirlik felsefesinden ilham alır13. Geleneksel sanal pet oyunlarındaki tek boyutlu "yaşat/öldür" döngüsünün ötesine geçebilmek adına, karakterin kişiliği altı adet temel nitelik (nitelik matrisi) üzerinden şekillendirilir13.

### **Temel Nitelikler ve Dağılım Aralıkları**

Kizuna dünyasındaki her pet, doğum anında Aavegotchi benzeri bir çan eğrisi (bell curve) dağılımına göre belirlenen istatistik değerleriyle dünyaya gelir13. Bu değerler doğrudan petin davranışlarını, konuşma kalıplarını ve gelişim yönünü etkiler13.  
Aşağıdaki tabloda, petin sahip olduğu altı temel nitelik, bu niteliklerin sistemdeki rolü ve doğum anındaki çan eğrisine göre atanma olasılık yüzdeleri gösterilmiştir13:

| Nitelik Adı | Kısaltma | Oyun İçi Etkisi ve Karakter Rolü | Nadirlik Tipi | Değer Aralığı | Dağılım Olasılığı |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Saldırganlık** | AGG | Petin oyun oynama sırasındaki hırçınlık durumunu ve tepkilerini belirler13. | **Mythical (Low)** | **![][image1]** \[cite: 13, 15\] | %413 |
| **Enerji** | NRG | Gün içindeki hareketlilik, uyku ihtiyacı ve oyun oynama isteğini yönetir13. | **Rare (Low)** | **![][image2]** \[cite: 13, 15\] | %1613 |
| **Ürkütücülük** | SPK | Gece etkileşimlerindeki cesaret seviyesini ve rüyalarını etkiler13. | **Uncommon (Low)** | **![][image3]** \[cite: 13, 15\] | %3013 |
| **Zeka** | BRN | Çıkarabildiği seslerin karmaşıklığını ve gelişim katsayısını belirler13. | **Common** | **![][image4]** \[cite: 13, 15\] | %5013 |
| **Göz Şekli** | EYS | Petin arayüzdeki piksel göz ifadesini (yuvarlak, anime, çizgi vb.) tanımlar13. | **Uncommon (High)** | **![][image5]** \[cite: 13, 15\] | %3013 |
| **Göz Rengi** | EYC | Göz piksellerinin hangi pastel tonda parlayacağını belirler13. | **Rare (High)** | **![][image6]** \[cite: 13, 15\] | %1613 |
| *Değişken* | \- | \- | **Mythical (High)** | **![][image7]** \[cite: 13, 15\] | %413 |

### **Temel Nadirlik Skoru (Base Rarity Score \- BRS) Hesaplaması**

Aavegotchi mekaniklerinden uyarlanan en önemli sistem, petin genel nadirlik durumunu gösteren **Temel Nadirlik Skoru (BRS)** hesaplamasıdır14. Bu sistemde, uç değerler (çok düşük veya çok yüksek) en nadir durumları temsil eder13. Niteliklerin BRS üzerindeki etkisi doğrusal olmayan simetrik bir fonksiyonla hesaplanır16.  
Her bir niteliğin (![][image8]) nadirlik skora katkısı (![][image9]) şu formülle belirlenir16:  
![][image10]  
\[cite: 16\]  
Toplam Temel Nadirlik Skoru (BRS) ise tüm niteliklerin bireysel nadirlik katkılarının toplamına eşittir16:  
![][image11]  
\[cite: 16\]  
Aşağıdaki tabloda, yeni doğmuş bir Mochi karakterinin sahip olabileceği örnek bir nitelik dağılımı ve bu dağılım üzerinden hesaplanan toplam BRS matrisi sunulmuştur16:

| Nitelik Adı | Atanan Değer (Ti​) | Nadirlik Seviyesi | Nadirlik Katkısı (Si​) | Durumsal Karakter Tepkisi |
| :---- | :---- | :---- | :---- | :---- |
| **Saldırganlık (AGG)** | **![][image12]** | Uysal (Uncommon Low)16 | ![][image13] \[cite: 16\] | Sevilirken mırlama animasyonu tetiklenir. |
| **Enerji (NRG)** | **![][image14]** | Hiperaktif (Uncommon High)16 | ![][image15] \[cite: 16\] | Ekranda sürekli zıplar, daha az uyur. |
| **Ürkütücülük (SPK)** | **![][image16]** | Hayalet gibi (Mythical High)16 | ![][image17] \[cite: 16\] | Gece karanlığında solungaçları mor parlar3. |
| **Zeka (BRN)** | **![][image18]** | Standart (Common)16 | ![][image19] \[cite: 16\] | Temel sesli heceleri dengeli kullanır. |
| **Göz Şekli (EYS)** | **![][image20]** | Yatay Çizgiler (Rare Low)16 | ![][image21] \[cite: 16\] | Sürekli uykulu veya sakin göz pikselleri. |
| **Göz Rengi (EYC)** | **![][image22]** | Sıradan (Common)16 | ![][image23] \[cite: 16\] | Standart pastel pembe göz pikselleri2. |
| **TOPLAM BRS** | \- | \- | **478** \[cite: 16\] | **Sınıflandırma: Çok Nadir (Highly Rare)** |

### **Seviye Atlama ve Ruh Puanı (Spirit Points) Tahsisi**

Kullanıcılar petle etkileşime girdikçe (besleme, oynama, temizleme) pet deneyim puanı (![][image24]) kazanır13. Deneyim puanı belirli limitlere ulaştığında seviye (![][image25]) artar13. Aavegotchi sistemine sadık kalınarak, pet her **üç seviye atladığında** (![][image26]) çiftlerin ortak kararla kullanabileceği **1 Ruh Puanı (Spirit Point)** kazanılır13.  
Kullanıcılar bu Ruh Puanını istedikleri bir temel niteliği (![][image27]) kalıcı olarak artırmak veya azaltmak için kullanabilirler13. Bu mekanizma, çiftlerin petin kişiliğini zamanla tamamen uysal, aşırı zeki veya hiperaktif bir karaktere dönüştürmelerine olanak tanır13.

### **Yakınlık (Kinship) ve Zamansal Azalma Dinamikleri**

Yakınlık (![][image28]), Mochi'nin sahiplerine olan duygusal bağını temsil eder, başlangıç değeri ![][image18]'dir ve maksimum ![][image29] olabilir14. Evcil hayvanın ihmal edilmesi durumunda bu değer zamanla azalır. Gerçek zamanlı olarak işleyen sistemde, her bir saatlik dilim (![][image30]) için yakınlık kaybı ve bakım eylemlerinin matematiksel simülasyonu şu formülle hesaplanır:  
![][image31]  
Bu formüle göre, eğer petin açlık ve temizlik değerleri yüksekse (yani pet bakımlıysa), zamansal yakınlık azalması minimum düzeyde (![][image32]) kalır. Ancak pet aç ve kirli bırakılmışsa, yakınlık kaybının hızı iki katına (![][image33]) kadar çıkabilir.  
Evcil hayvanla yapılan her bakım eylemi, yakınlığı doğrudan artırır14:  
![][image34]  
Eylemlerin baz yakınlık katkı değerleri (![][image35]) şu şekildedir: Besleme (![][image36]), Sevme (![][image37]), Temizleme (![][image38]), Oyun Oynama (![][image36]).

## **İlişkisel Veritabanı Şeması ve Eşleşme (Matchmaking) Akışı**

Kizuna platformunun en hassas bölümlerinden biri, kullanıcıların güvenli bir şekilde hesap oluşturup, partnerleriyle kusursuz bir şekilde eşleşerek ortak pet veritabanını oluşturabilmeleridir17. Supabase PostgreSQL üzerinde kurgulanan sistem, her iki tarafın da veri bütünlüğünü korumak üzere RLS (Row Level Security) mimarisiyle izole edilmiştir18.

### **Eşleşme ve Ortak Pet Yaratım Akış Diyagramı**

İki kullanıcının eşleşerek ortak bir sanal pet oluşturması süreci, veritabanı bütünlüğünün bozulmaması ve dairesel referans kilitlenmelerinin yaşanmaması için adım adım tasarlanmıştır17:

\[Kullanıcı A (Gönderici)\]                               \[Kullanıcı B (Alıcı)\]  
         │                                                       │  
         ▼ (Kullanıcı Adı ile Arama)                             │  
\[İstek Oluştur (match\_requests: status='pending')\]              │  
         │                                                       │  
         └─────────────────── GERÇEK ZAMANLI BİLDİRİM ──────────►│  
                                                                 ▼  
                                                    \[İsteği Gör & Kabul Et\]  
                                                                 │  
         ┌────────────────── PostgreSQL TRANSACTION ─────────────┘  
         ▼  
 1\. 'pets' tablosunda yeni satır oluşturulur (Rastgele çan eğrisi nitelikleriyle) \[cite: 13, 15, 20\].  
 2\. Kullanıcı A'nın 'partner\_id' değeri Kullanıcı B'nin ID'si yapılır.  
 3\. Kullanıcı B'nin 'partner\_id' değeri Kullanıcı A'nın ID'si yapılır.  
 4\. Her iki kullanıcının 'pet\_id' değeri yeni oluşturulan petin ID'sine eşitlenir.  
 5\. 'match\_requests' durumu 'accepted' olarak güncellenir.  
         │  
         ├───► \[Kullanıcı A Arayüzü Tetiklenir\] ──► Ortak pet oyunu canlı olarak başlar.  
         └───► \[Kullanıcı B Arayüzü Tetiklenir\] ──► Ortak pet oyunu canlı olarak başlar.

Bu akışın PostgreSQL üzerinde herhangi bir çökme anında yarıda kalmasını önlemek amacıyla, tüm adımlar tek bir veritabanı işlemi (Database Transaction) altında yürütülür. Eğer adımlardan biri başarısız olursa, işlem tamamen geri alınarak (rollback) tutarsız eşleşmeler engellenir23.

### **Supabase PostgreSQL Veritabanı Şeması**

Aşağıdaki SQL şeması, belirtilen ilişkisel yapıyı ve kısıtlamaları tam olarak uygulamaktadır17:

SQL  
\-- KIZUNA POSTGRESQL VERİTABANI ŞEMASI

\-- PostgreSQL UUID ve Şema Ayarları \[cite: 19, 21\]  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\-- 1\. Ortak Petler Tablosu \[cite: 17, 20\]  
CREATE TABLE public.pets (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    name VARCHAR(50) NOT NULL,  
    level INTEGER NOT NULL DEFAULT 1, \[cite: 13\]  
    xp INTEGER NOT NULL DEFAULT 0, \[cite: 13\]  
    kinship NUMERIC(5,2) NOT NULL DEFAULT 50.00, \[cite: 14, 15\]  
    energy INTEGER NOT NULL DEFAULT 100, \[cite: 13, 15\]  
    aggressiveness INTEGER NOT NULL DEFAULT 50, \[cite: 13, 15\]  
    brain\_size INTEGER NOT NULL DEFAULT 50, \[cite: 13, 15\]  
    spookiness INTEGER NOT NULL DEFAULT 50, \[cite: 13, 15\]  
    eye\_shape INTEGER NOT NULL DEFAULT 50, \[cite: 13, 15\]  
    eye\_color INTEGER NOT NULL DEFAULT 50, \[cite: 13, 15\]  
    hunger INTEGER NOT NULL DEFAULT 100,  
    cleanliness INTEGER NOT NULL DEFAULT 100,  
    evolution\_stage INTEGER NOT NULL DEFAULT 1,  
    spirit\_points INTEGER NOT NULL DEFAULT 0, \[cite: 13, 15\]  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

\-- 2\. Kullanıcı Profilleri Tablosu (auth.users ile birebir ilişkili) \[cite: 17, 18\]  
CREATE TABLE public.profiles (  
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
    username VARCHAR(30) UNIQUE NOT NULL,  
    partner\_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  
    pet\_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

\-- 3\. Eşleşme İstekleri Tablosu  
CREATE TABLE public.match\_requests (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    sender\_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  
    receiver\_username VARCHAR(30) NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,  
    status VARCHAR(20) NOT NULL DEFAULT 'pending', \-- 'pending', 'accepted', 'rejected'  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,  
    CONSTRAINT unique\_pending\_match UNIQUE (sender\_id, receiver\_username)  
);

\-- 4\. Bakım Günlükleri Tablosu (Loglama ve Kimin Ne Yaptığını Takip Etme) \[cite: 17, 20\]  
CREATE TABLE public.care\_logs (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    pet\_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,  
    user\_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  
    action\_type VARCHAR(30) NOT NULL, \-- 'feed', 'pet', 'clean', 'play'  
    stat\_gained VARCHAR(100) NOT NULL, \-- Örn: '+15 Hunger, \+2 Kinship'  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

\-- Veritabanı Sorgu Performans İndeksleri  
CREATE INDEX idx\_profiles\_pet\_id ON public.profiles(pet\_id);  
CREATE INDEX idx\_match\_requests\_status ON public.match\_requests(status);  
CREATE INDEX idx\_care\_logs\_pet\_id ON public.care\_logs(pet\_id);

### **Row Level Security (RLS) ve Veri Güvenliği Politikaları**

Supabase üzerindeki tüm tablolar varsayılan olarak dış erişime kapalıdır ve erişim yetkileri her bir sorgu için RLS politikaları ile dinamik olarak değerlendirilir18. Aşağıdaki güvenlik tanımlamaları, doğrulanmış (authenticated) kullanıcıların yalnızca kendi petlerine ve partner ilişkilerine erişmesini yasal çerçeveye bağlar18:

SQL  
\-- RLS Etkinleştirilmesi \[cite: 18\]  
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.match\_requests ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.care\_logs ENABLE ROW LEVEL SECURITY;

\-- 1\. Profiles Tablosu Politikaları \[cite: 18\]  
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.profiles  
    FOR SELECT TO authenticated USING (auth.uid() \= id);

CREATE POLICY "Kullanıcılar kendi kullanıcı adını güncelleyebilir" ON public.profiles  
    FOR UPDATE TO authenticated USING (auth.uid() \= id);

\-- 2\. Pets Tablosu Politikaları (Yalnızca ilgili petin sahibi olan iki kullanıcı erişebilir) \[cite: 18\]  
CREATE POLICY "Sadece pet sahipleri pet detayını okuyabilir" ON public.pets  
    FOR SELECT TO authenticated USING (  
        EXISTS (  
            SELECT 1 FROM public.profiles   
            WHERE profiles.id \= auth.uid() AND profiles.pet\_id \= pets.id  
        )  
    );

CREATE POLICY "Sadece pet sahipleri peti güncelleyebilir" ON public.pets  
    FOR UPDATE TO authenticated USING (  
        EXISTS (  
            SELECT 1 FROM public.profiles   
            WHERE profiles.id \= auth.uid() AND profiles.pet\_id \= pets.id  
        )  
    );

\-- 3\. Care Logs Politikası \[cite: 17, 18\]  
CREATE POLICY "Sadece pet sahipleri bakım günlüklerini okuyabilir" ON public.care\_logs  
    FOR SELECT TO authenticated USING (  
        EXISTS (  
            SELECT 1 FROM public.profiles   
            WHERE profiles.id \= auth.uid() AND profiles.pet\_id \= care\_logs.pet\_id  
        )  
    );

CREATE POLICY "Sadece pet sahipleri yeni günlük ekleyebilir" ON public.care\_logs  
    FOR INSERT TO authenticated WITH CHECK (  
        auth.uid() \= user\_id AND  
        EXISTS (  
            SELECT 1 FROM public.profiles   
            WHERE profiles.id \= auth.uid() AND profiles.pet\_id \= care\_logs.pet\_id  
        )  
    );

## **Real-Time Senkronizasyon ve Yarış Koşullarının Önlenmesi**

Ortaklaşa yönetilen bir sanal ekosistemde iki kullanıcının aynı anda pet üzerinde farklı eylemler gerçekleştirmesi durumunda (örneğin bir taraf temizlik yaparken diğer tarafın oyun oynatması) veri senkronizasyonunun milisaniyeler içinde gerçekleşmesi gerekir22. Kizuna, bu anlık veri akışını yönetmek üzere **Supabase Realtime** altyapısını kullanır18.

### **Postgres Değişiklik Aboneliği (Postgres Changes Subscription)**

İstemci tarafında çalışan React uygulaması, doğrulanmış kullanıcının oturum açmasıyla birlikte veritabanındaki pets ve care\_logs tablolarında meydana gelen her türlü UPDATE veya INSERT olayına doğrudan abone olur22. Bu sayede, Kullanıcı A'nın gerçekleştirdiği herhangi bir bakım aktivitesi anında veritabanına işlenir ve bu değişiklik Supabase Realtime WebSocket kanalı aracılığıyla Kullanıcı B'nin ekranına yansıtılır21.  
İstemci tarafında gerçek zamanlı verileri dairesel kapanım (stale closure) hatalarına yol açmadan yöneten ve durumu dinamik olarak güncelleyen React Hook tasarımı şu şekildedir21:

TypeScript  
import { useEffect, useState } from 'react';  
import { supabase } from '../lib/supabase';

export interface Pet {  
  id: string;  
  name: string;  
  level: number;  
  xp: number;  
  kinship: number;  
  hunger: number;  
  cleanliness: number;  
  energy: number;  
}

export function useRealtimePet(petId: string) {  
  const \[pet, setPet\] \= useState\<Pet | null\>(null);  
  const \[loading, setLoading\] \= useState(true);

  useEffect(() \=\> {  
    if (\!petId) return;

    // Başlangıç verilerinin çekilmesi  
    const fetchPet \= async () \=\> {  
      const { data, error } \= await supabase  
        .from('pets')  
        .select('\*')  
        .eq('id', petId)  
        .single();  
        
      if (\!error && data) {  
        setPet(data as Pet);  
      }  
      setLoading(false);  
    };

    fetchPet();

    // Gerçek zamanlı veritabanı değişiklik aboneliği \[cite: 22, 27, 28\]  
    const channel \= supabase  
      .channel(\`realtime-pet-${petId}\`)  
      .on(  
        'postgres\_changes',  
        {  
          event: 'UPDATE',  
          schema: 'public',  
          table: 'pets',  
          filter: \`id=eq.${petId}\`,  
        },  
        (payload) \=\> {  
          // Fonksiyonel güncelleme kullanımı dairesel kapanımları önler \[cite: 28\]  
          setPet((currentPet) \=\> {  
            if (\!currentPet) return payload.new as Pet;  
            return {  
              ...currentPet,  
              ...payload.new,  
            };  
          });  
        }  
      )  
      .subscribe();

    // Temizlik fonksiyonu: Aboneliğin sonlandırılması \[cite: 21, 29\]  
    return () \=\> {  
      supabase.removeChannel(channel);  
    };  
  }, \[petId\]);

  return { pet, loading };  
}

### **Yarış Koşullarının (Race Conditions) Algoritmik Olarak Önlenmesi**

İki kullanıcının aynı anda "Besle" butonuna basması durumunda, istemci tarafındaki mevcut açlık değerinin üzerine ekleme yapmak veri kaybına yol açar. Örneğin, açlık seviyesi ![][image18] iken her iki kullanıcı da ![][image39] açlık veren besleme butonuna bastığında, eğer istemci durumları bağımsız gönderilirse veritabanındaki değer ![][image40] yerine ![][image41] olarak güncellenebilir.  
Bunun önüne geçmek için Kizuna şu mimari kuralları benimser22:

* **İstemci Tarafı Geçici Kilitleme:** Bir butona basıldığında, o butonun aktifliği ağ isteği tamamlanana kadar yerel arayüzde devre dışı bırakılır.  
* **PostgreSQL Seviyesinde Atomik Artırımlar:** İstemciler veritabanına doğrudan set hunger \= 60 şeklinde bir değer göndermez. Bunun yerine veritabanı üzerinde atomik SQL komutları koşturulur. Bu işlem Supabase Edge Functions veya RPC (Remote Procedure Call) yardımıyla şu şekilde yürütülür:  
  SQL  
  CREATE OR REPLACE FUNCTION feed\_pet\_atomic(target\_pet\_id UUID, user\_id UUID)  
  RETURNS void AS $$  
  BEGIN  
      \-- Pet değerlerini atomik olarak artır  
      UPDATE public.pets  
      SET   
          hunger \= LEAST(100, hunger \+ 15),  
          kinship \= LEAST(100.00, kinship \+ 2.00), \[cite: 14\]  
          xp \= xp \+ 5 \[cite: 13, 14\]  
      WHERE id \= target\_pet\_id;

      \-- Bakım günlüğünü kaydet \[cite: 20\]  
      INSERT INTO public.care\_logs (pet\_id, user\_id, action\_type, stat\_gained)  
      VALUES (target\_pet\_id, user\_id, 'feed', '+15 Açlık, \+2 Yakınlık, \+5 XP'); \[cite: 14\]  
  END;  
  $$ LANGUAGE plpgsql SECURITY DEFINER;

## **Web Audio API ile Nintendo Tarzı Üretken Ses Sentezi**

Mobil web tabanlı bir oyunda, harici ses kütüphanelerinin (MP3 veya WAV dosyaları) yüklenmesi hücresel veri kullanımını artırır ve gecikmeli ses oynatımına sebep olur30. Bu teknik engeli aşmak amacıyla Kizuna, gücünü doğrudan tarayıcının donanımsal ses hızlandırıcısından alan **Web Audio API** tabanlı chiptune sentezleyicisini kullanır31.

### **Nintendo "Animalese" Konuşma Sentezi Algoritması**

Nintendo'nun retro chiptune ses estetiği, insan konuşma kalıplarındaki sesli ve sessiz harfleri temsil eden temel frekansların çok hızlı bir şekilde sentezlenmesi prensibine dayanır33. Kizuna konuşma motoru, petin konuşma balonundaki harfleri analiz ederek her karakter için dinamik osilatör dalgaları üretir31.  
Karakterlerin sese dönüştürülmesinde kullanılan temel akustik kurallar şunlardır34:

* **Osilatör Seçimi:** Seslerin dijital kalitesini artırmak için yumuşatılmış üçgen (triangle) ve keskin kare (square) dalga osilatörleri karıştırılır32.  
* **Harf Frekans Dağılımı:** Sesli harfler (a, e, i, o, u) yüksek perdeli (![][image42]) melodik frekanslarla eşlenirken, sessiz harfler (f, p, s, w) daha pes (![][image43]) ve gürültü efektine (noise gate) yakın dalgalarla eşlenir34.  
* **Pitch Çarpanı ve Enerji Uyumu:** Petin anlık enerjisi (NRG), konuşmanın hızını ve tonunu etkiler13. Enerjisi yüksek olan Mochi tiz ve hızlı konuşurken, uykulu olduğunda sesler yavaşlar ve pesleşir13.

Aşağıdaki matematiksel formülasyon, bir harfin (![][image44]) sentezlenme aşamasındaki frekans değişim aralığını (![][image45]) belirler34:  
![][image46]  
Burada ![][image47] harfin akustik karşılığı, ![][image48] ise konuşmanın robotik bir yapaylıktan kurtularak doğal bir iniş-çıkışa (intonation) sahip olması için uygulanan ![][image49] aralığındaki rastgele dalgalanmadır34.

### **Chiptune Ses Motoru Kod Yapısı**

Sistem genelinde ses efektlerini ve konuşma sentezleyicisini koordine eden sınıf tasarımı şu şekildedir32:

TypeScript  
class ChiptuneVoiceEngine {  
  private audioCtx: AudioContext | null \= null;  
  private masterGain: GainNode | null \= null;

  constructor() {  
    // Tarayıcı güvenlik politikalarına uygun olarak ilk etkileşimde başlatılacaktır \[cite: 30, 36\]  
  }

  private init() {  
    if (this.audioCtx) return;  
    this.audioCtx \= new (window.AudioContext || (window as any).webkitAudioContext)();  
    this.masterGain \= this.audioCtx.createGain();  
    this.masterGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime); // Kulak sağlığı için düşük ses \[cite: 36\]  
    this.masterGain.connect(this.audioCtx.destination);  
  }

  public playTone(frequency: number, duration: number, type: 'square' | 'triangle' | 'sine' \= 'triangle') {  
    this.init();  
    if (\!this.audioCtx || \!this.masterGain) return;

    const osc \= this.audioCtx.createOscillator();  
    const gainNode \= this.audioCtx.createGain();

    osc.type \= type; \[cite: 36\]  
    osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    // ADSR Zarfı (Envelope) Uygulaması: Çıtırtı seslerini önleme \[cite: 38, 39\]  
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);  
    gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime \+ 0.01);  
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime \+ duration);

    osc.connect(gainNode);  
    gainNode.connect(this.masterGain);

    osc.start();  
    osc.stop(this.audioCtx.currentTime \+ duration);

    // Bellek sızıntısını önlemek için bağlantıların koparılması \[cite: 36, 40\]  
    setTimeout(() \=\> {  
      osc.disconnect();  
      gainNode.disconnect();  
    }, (duration \+ 0.1) \* 1000);  
  }

  public async playAnimalese(text: string, petEnergy: number) {  
    this.init();  
    const speed \= 0.08 \* (1 \+ (50 \- petEnergy) / 100); // Enerjiye göre konuşma hızı değişimi  
      
    for (let i \= 0; i \< text.length; i++) {  
      const char \= text\[i\].toLowerCase();  
      if (char \=== ' ') {  
        await new Promise((r) \=\> setTimeout(r, speed \* 1000 \* 1.5));  
        continue;  
      }

      // Harfe göre baz frekans seçimi \[cite: 34, 41\]  
      let baseFreq \= 440; // 'a' harfi referansı  
      if ('aeiou'.includes(char)) {  
        baseFreq \= 523.25 \+ (char.charCodeAt(0) % 5) \* 40; // Tiz tonlar  
      } else if ('bcdfghjklmnpqrstvwxyz'.includes(char)) {  
        baseFreq \= 220 \+ (char.charCodeAt(0) % 7) \* 20; // Pes tonlar  
      }

      const randomShift \= 0.95 \+ Math.random() \* 0.1; // %5 intonasyon dalgalanması  
      const finalFreq \= baseFreq \* (1 \+ (petEnergy \- 50) / 150) \* randomShift;

      this.playTone(finalFreq, speed \* 0.9, 'triangle'); \[cite: 36\]  
      await new Promise((r) \=\> setTimeout(r, speed \* 1000));  
    }  
  }

  public playCoinSound() {  
    this.init();  
    // Klasik retro altın kazanma sesi (Arpejli iki ton) \[cite: 38, 39\]  
    const now \= this.audioCtx\!.currentTime;  
    this.playTone(523.25, 0.1, 'square'); // C5 \[cite: 38, 39\]  
    setTimeout(() \=\> {  
      this.playTone(659.25, 0.25, 'square'); // E5 \[cite: 38, 39\]  
    }, 100);  
  }  
}

export const soundEngine \= new ChiptuneVoiceEngine();

## **Cursor AI Vibe Coding Yapılandırma Promptları**

Aşağıdaki yapılandırılmış prompt serisi, projenin tamamını Cursor AI editörü kullanarak tek bir satır hata yapmadan adım adım kodlamak üzere tasarlanmıştır9. Bu komutlar, yapay zekanın tüm bağlamı anlamasını sağlayacak teknik yönergeler, dosya isimleri ve entegrasyon parametrelerini barındırır9.

### **Prompt 1: Temel Proje Yapılandırması ve PWA Entegrasyonu**

Sistem Rolü: Kıdemli Frontend Mimarı ve PWA Uzmanı.  
Görev: React \+ Vite \+ TypeScript \+ Tailwind CSS tabanlı, mobil web öncelikli, "vite-plugin-pwa" entegrasyonu tamamlanmış bir iskelet proje oluşturmak.  
Lütfen aşağıdaki adımları sırasıyla gerçekleştir ve gerekli dosyaları oluştur:

1. Projenin bağımlılıklarını kurmak için kullanılacak 'package.json' dosyasını hazırla. Gerekli kütüphaneler: react, react-dom, tailwindcss, @tailwindcss/vite, lucide-react, @supabase/supabase-js, vite-plugin-pwa.  
2. Tailwind CSS v4 ve @tailwindcss/vite konfigürasyonunu içeren 'vite.config.ts' dosyasını yaz. Bu dosya içinde 'vite-plugin-pwa' konfigürasyonunu eksiksiz yap. Service Worker 'registerType' değerini 'autoUpdate' olarak ayarla. Manifest dosyasına şunları ekle:  
   * short\_name: "Kizuna"  
   * name: "Kizuna: Cozy Shared Pet"  
   * theme\_color: "\#1a1c2c"  
   * background\_color: "\#f4f4f4"  
   * display: "standalone"  
   * orientation: "portrait"  
     İkonlar için '/pwa-192x192.png' ve '/pwa-512x512.png' yollarını referans göster.  
3. TypeScript konfigürasyon dosyalarını (tsconfig.json, tsconfig.app.json, tsconfig.node.json) oluştur.  
4. CSS dosyasını oluştur (src/index.css) ve içine '@import "tailwindcss";' ile birlikte piksel sanatına uygun font ayarlarını ve görsel render modunu ekle:  
   img, canvas, .pixelated {  
   image-rendering: pixelated;  
   image-rendering: crisp-edges;  
   }  
5. Service Worker kaydini gerçekleştiren bir 'src/registerSW.ts' veya main.tsx entegrasyonunu yaz.  
6. index.html dosyasını mobil cihazlarda ölçeklenmeyi engelleyecek viewport ayarlarıyla birlikte hazırla:

Lütfen sadece en yüksek standartlarda yazılmış, temiz, tip güvenli TypeScript kodlarını sağla. Hata yapmamaya özen göster.

### **Prompt 2: Supabase Entegrasyonu ve Kimlik Doğrulama Sistemi**

Sistem Rolü: Kıdemli Full-Stack Geliştirici ve Supabase Mimarı.  
Görev: Supabase Auth istemcisini kurmak, profiles tablosuyla eşleşen bir React Authentication katmanı ve arayüzü tasarlamak.  
Lütfen aşağıdaki bileşenleri ve mantığı sırasıyla oluştur:

1. 'src/lib/supabase.ts' dosyasını oluştur. Çevre değişkenlerinden (import.meta.env.VITE\_SUPABASE\_URL ve VITE\_SUPABASE\_ANON\_KEY) beslenen bir Supabase istemcisi tanımla.  
2. Basit, pastel piksel art temalı bir Giriş/Kayıt arayüzü ('src/components/Auth.tsx') tasarla. Kullanıcı adı, e-posta ve şifre ile kayıt olunabilsin. Kayıt sırasında Supabase auth.signUp çağrıldıktan hemen sonra profiles tablosuna kullanıcı adı (username) değeriyle yeni bir satır ekleyen veritabanı tetikleyicisini destekleyecek şekilde istemci tarafı hata kontrollerini yap.  
3. Kullanıcının oturum durumunu yöneten bir React Context ('src/context/AuthContext.tsx') tasarla. Bu context:  
   * 'user' (Supabase User objesi)  
   * 'profile' (public.profiles tablosundan çekilen kullanıcı adı ve partner\_id'yi içeren obje)  
   * 'loading' durumunu barındırmalıdır.  
   * OnAuthStateChange dinleyicisi ile kullanıcının çıkış yapması veya oturum açması durumunda state'i anlık güncellemelidir.  
4. Çiftlerin arayüzde temiz hata mesajları görebilmesi için hata yakalama mekanizmalarını ekle.

Görsel tasarımın Cozy Pastel temasına uygun olmasını sağla. Border'lar 2px solid \#1a1c2c, gölgeler ise sert piksel gölgesi (box-shadow: 4px 4px 0px 0px \#1a1c2c) şeklinde olmalıdır. Kodları eksiksiz sağla.

### **Prompt 3: Çiftler Arası Davet ve Eşleşme (Matchmaking) Arayüzü**

Sistem Rolü: Kıdemli Sistem Tasarımcısı ve Veritabanı Mühendisi.  
Görev: Çiftlerin birbirlerini kullanıcı adı (username) üzerinden bulup eşleşmelerini ve ortak petlerini yaratmalarını sağlayan Matchmaking arayüzünü kodlamak.  
Lütfen şu mantığı içeren 'src/components/Matchmaking.tsx' bileşenini yaz:

1. Kullanıcı kendi ekranında başka birinin kullanıcı adını yazarak istek gönderebilmelidir (public.match\_requests tablosuna INSERT).  
2. Kullanıcıya gelen davetler gerçek zamanlı listelenmelidir. Davet durumları: Beklemede (pending), Kabul Edildi (accepted), Reddedildi (rejected).  
3. Davet Kabul Edildiğinde (accepted) arka planda atomik bir işlem (RPC veya Supabase fonksiyonu) yürütülmelidir:  
   * Yeni bir pet yaratılır (public.pets tablosuna varsayılan değerlerle INSERT yapılır).  
   * İstek gönderenin ve kabul edenin profiles tablosundaki 'partner\_id' değerleri karşılıklı olarak güncellenir.  
   * Her iki kullanıcının da profiles tablosundaki 'pet\_id' değeri yeni yaratılan petin id'si olarak güncellenir.  
4. Arayüz tasarımı:  
   * Gönderilen İstekler paneli (Bekleme animasyonu ile).  
   * Gelen İstekler paneli (Kabul Et / Reddet piksel butonları ile).  
   * Cozy Pastel stiline uygun, şirin bildirim pencereleri.

Lütfen Supabase tablosu entegrasyonlarını ve state güncellemelerini eksiksiz, yarış koşullarını (race conditions) önleyecek şekilde yaz.

### **Prompt 4: Gerçek Zamanlı Ortak Pet Oyun Ekranı ve Etkileşim Paneli**

Sistem Rolü: Kıdemli Oyun Tasarımcısı ve Real-Time Senkronizasyon Uzmanı.  
Görev: Çiftlerin ortak olarak beslediği, sevdiği ve temizlediği pet ekranını ve etkileşim panelini 'src/components/PetScreen.tsx' olarak kodlamak.  
Bileşenin içermesi gereken teknik ve görsel yapılar:

1. Petin Görsel Alanı:  
   * Petin gelişim evresine (Evre 1, 2 veya 3\) göre farklılaşan, Cozy Pastel stilinde CSS animasyonlu bir piksel karakter kutusu tasarla. Karakter nefes alma, havada süzülme ve etkileşime girildiğinde zıplama/mutluluk animasyonlarına sahip olmalıdır.  
   * Arka plan, günün saatine göre değişmelidir (sabah sarımsı-krem, öğleden sonra açık mavi, gece mistik koyu mor).  
2. İstatistik Göstergeleri:  
   * Açlık, Temizlik, Kinship ve Enerji değerlerini gösteren şirin, piksel kenarlıklı ilerleme çubukları (Progress Bars) oluştur. Her bar kendi renginde olmalıdır (Örn: Açlık turuncu, Temizlik yeşil, Sevgi pembe).  
3. Etkileşim Butonları:  
   * "Besle" (Yemek verir, Hunger barını artırır).  
   * "Sev" (Kinship barını artırır).  
   * "Temizle" (Cleanliness barını artırır).  
   * "Oyna" (Enerjiyi tüketir, Zekayı ve XP'yi artırır).  
4. Gerçek Zamanlı Güncelleme Sistemi:  
   * useEffect içinde Supabase .channel() kullanarak 'public.pets' tablosunu dinle. Değişiklik geldiğinde pet state'ini anlık güncelle.  
   * Her etkileşim yapıldığında 'public.care\_logs' tablosuna hangi ortağın bu eylemi yaptığını belirten bir satır ekle.  
5. Bakım Geçmişi (Care Logs) Paneli:  
   * Ekranın altında, "En son \[Partner İsmi\] petimizi besledi (+10 Açlık)" gibi son 5 bakımı gösteren şirin bir geçmiş akışı sun.

Lütfen state güncellemelerinde stale closure hatalarını önlemek için fonksiyonel state güncellemelerini (setPet(prev \=\> ...)) kullan.

### **Prompt 5: Web Audio API Nintendo Tarzı Ses ve Konuşma Sistemi**

Sistem Rolü: Kıdemli Audio Programmer ve Chiptune Sanatçısı.  
Görev: Web Audio API kullanarak harici hiçbir ses dosyasına ihtiyaç duymadan Nintendo tarzı chiptune konuşma sesleri üreten bir modül ve görsel konuşma balonu geliştirmek.  
Lütfen şu özellikleri içeren 'src/lib/soundEngine.ts' ve 'src/components/SpeechBubble.tsx' dosyalarını kodla:

1. 'soundEngine.ts':  
   * Tarayıcının 'AudioContext' yapısını başlatan ve güvenli bir şekilde yöneten sınıf (SoundEngine).  
   * Sentezleyici ses üretimi için kare (square) ve üçgen (triangle) dalga osilatörleri kullanan 'playTone(frequency, duration, pitchShift)' metodu.  
   * 'playAnimalese(text, speed, basePitch)' metodu: Verilen metni harf harf gezerek ses sentezlemelidir. Sesli harfler tiz, sessiz harfler pes frekanslarda tetiklenmeli, harf aralarında milisaniyelik boşluklar bırakılmalıdır.  
   * Ton kalitesi, petin güncel Enerji ve Sevgi seviyelerine göre değişmelidir (Düşük enerji \= yavaş ve kalın ses, yüksek enerji \= hızlı ve tiz ses).  
2. 'SpeechBubble.tsx':  
   * Petin üzerinde beliren piksel tarzı beyaz diyalog kutusu.  
   * Yazı efektli (Typewriter Effect) olarak harfler tek tek ekrana akarken, eşzamanlı olarak 'playAnimalese' tetiklenmelidir.  
   * Mochi'nin konuşabileceği şirin kalıplar: "uww", "uffu puffu", "mimi\~", "graff", "poko pipo". Metin bittiğinde ses durmalıdır.  
3. Kullanıcının tarayıcı etkileşim izni (AudioContext resume) yönetimini hatasız yap.

Kodun performans optimizasyonuna dikkat et, kullanılmayan osilatör düğümlerini bellek sızıntılarını önlemek için her ton bitiminde otomatik olarak kapat/bağlantısını kes (disconnect/stop).

### **Prompt 6: Eksiksiz Arayüz Entegrasyonu ve Dağıtım Hazırlığı**

Sistem Rolü: Kıdemli Ürün Yöneticisi ve Lead Frontend Geliştirici.  
Görev: Yazılan tüm bileşenleri (Auth, Matchmaking, PetScreen, SpeechBubble, Ses Motoru) 'src/App.tsx' içinde birleştirmek, Netlify single-page-app yönlendirme ayarlarını yapmak.  
Lütfen şu adımları tamamla:

1. 'src/App.tsx' ana uygulama dosyasını yaz. Eğer kullanıcı oturumu yoksa Auth ekranını göster. Oturumu varsa ancak eşleşmiş bir partneri veya peti yoksa Matchmaking ekranını göster. Eğer her ikisi de tamamlanmışsa PetScreen (Ortak Sanal Pet Ekranı) arayüzünü yükle.  
2. Netlify dağıtımında React Router veya SPA yönlendirmelerinin 404 hatası vermesini önlemek için 'public/\_redirects' dosyasını oluştur ve içeriğini yaz:  
   /\* /index.html 200  
3. Netlify'da çevrimdışı önbelleklerin düzgün çalışabilmesi için PWA entegrasyonunun 'build' aşamasında dist/ klasörüne manifest ve service worker dosyalarını eksiksiz çıkardığından emin olan yapılandırma kontrollerini tamamla.  
4. Tüm uygulamanın mobil web uyumluluğunu, Tailwind CSS esnek kutu modelini (Flexbox) ve ızgara (Grid) sistemini kullanarak dikey ekranlara (mobil arayüz) göre kesin olarak optimize et. Ekran dışına taşmaları önlemek için her şeyi güvenli alan (safe-area) sınırları içinde tut.

Tüm kodların birbiriyle uyumlu, temiz ve üretime hazır olduğundan emin ol.

## **Sonuç ve Mimari Öngörüler**

Çiftlerin günlük hayatlarına organik olarak entegre olacak dijital bir arkadaşlık platformu tasarlamak, yalnızca görsel bir şirinlikten öte, arka planda çalışan senkronize bir sistem mimarisi gerektirir3. Kizuna için kurgulanan bu teknik altyapı, PWA teknolojisinin sunduğu anlık güncelleme ve hızlı erişim gücünü, Supabase PostgreSQL'in sarsılmaz ilişkisel veri güvenliği ve gerçek zamanlı haberleşme yetenekleriyle birleştirir5.  
Aavegotchi sisteminden esinlenen matematiksel nitelik dağılımı ve Temel Nadirlik Skoru (BRS) formülasyonu, petin gelişimini klasik oyunların sıradanlığından kurtararak stratejik bir boyuta taşır13. Web Audio API tabanlı dinamik sentezleme motoru ise mobil veri tüketimini minimize ederken, çiftlerin cihazlarında her dokunuşta gerçek zamanlı, şirin bir chiptune melodisiyle yankılanan derin bir işitsel geri bildirim oluşturur31. Sunulan Cursor "Vibe Coding" prompt hiyerarşisi, geliştiricinin tüm bu katmanları sırasıyla ve tam entegrasyon halinde, Netlify üzerinde yayına hazır şekilde ayağa kaldırmasını sağlayacaktır4.

#### **Alıntılanan çalışmalar**

1. Cozy \- Palette List, [https://lospec.com/palette-list/tag/cozy](https://lospec.com/palette-list/tag/cozy)  
2. 10 pixel art color palettes (with hex codes) \- Sprite-AI, [https://www.sprite-ai.art/guides/pixel-art-color-palettes](https://www.sprite-ai.art/guides/pixel-art-color-palettes)  
3. What new pet should we add to our cozy genetics-focused game for animal lovers? \- Reddit, [https://www.reddit.com/r/CozyGamers/comments/16dhfzm/what\_new\_pet\_should\_we\_add\_to\_our\_cozy/](https://www.reddit.com/r/CozyGamers/comments/16dhfzm/what_new_pet_should_we_add_to_our_cozy/)  
4. React on Netlify, [https://docs.netlify.com/build/frameworks/framework-setup-guides/react/](https://docs.netlify.com/build/frameworks/framework-setup-guides/react/)  
5. Vite on Netlify, [https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)  
6. How I Built My Personal Website Using React & Tailwind | Tehreem Zafar \- Medium, [https://medium.com/@tehreem.zafar06/how-i-built-my-personal-website-using-react-tailwind-tehreem-zafar-6334c437ca51](https://medium.com/@tehreem.zafar06/how-i-built-my-personal-website-using-react-tailwind-tehreem-zafar-6334c437ca51)  
7. PWA in React with Vite Plugin PWA – Full Setup Guide \- Chapimaster, [https://mail.chapimaster.com/programming/vite/setup-react-pwa-vite-plugin](https://mail.chapimaster.com/programming/vite/setup-react-pwa-vite-plugin)  
8. nickgraffis/react-typescript-vite-tailwind-netlify-starter \- GitHub, [https://github.com/nickgraffis/react-typescript-vite-tailwind-netlify-starter](https://github.com/nickgraffis/react-typescript-vite-tailwind-netlify-starter)  
9. Building a Database With Cursor and Supabase MCP. | by Elijah Chimera | Medium, [https://medium.com/@elijahchimera01/building-a-database-with-cursor-and-supabase-mcp-b8e935f8f3a7](https://medium.com/@elijahchimera01/building-a-database-with-cursor-and-supabase-mcp-b8e935f8f3a7)  
10. Getting Started | Guide \- Vite PWA \- Netlify, [https://vite-pwa-org.netlify.app/guide/](https://vite-pwa-org.netlify.app/guide/)  
11. Progressive Web App (PWA) with Vite : Development Guide \- DEV Community, [https://dev.to/hamdankhan364/simplifying-progressive-web-app-pwa-development-with-vite-a-beginners-guide-38cf](https://dev.to/hamdankhan364/simplifying-progressive-web-app-pwa-development-with-vite-a-beginners-guide-38cf)  
12. React \+ Tailwind Vite Boilerplate with PWA support \- GitHub, [https://github.com/Salmandabbakuti/react-vite-boilerplate](https://github.com/Salmandabbakuti/react-vite-boilerplate)  
13. Traits | Aavegotchi Wiki, [https://wiki.aavegotchi.com/en/traits](https://wiki.aavegotchi.com/en/traits)  
14. How to Play Aavegotchi: A Beginner's Guide \- CoinGecko, [https://www.coingecko.com/learn/how-to-play-aavegotchi-beginners-guide](https://www.coingecko.com/learn/how-to-play-aavegotchi-beginners-guide)  
15. Aavegotchi Whitepaper v1.1 \- CryptoCompare, [https://resources.cryptocompare.com/asset-management/178/1664358731923.pdf](https://resources.cryptocompare.com/asset-management/178/1664358731923.pdf)  
16. Rarity Farming \- Aavegotchi Wiki, [https://wiki.aavegotchi.com/en/rarity-farming](https://wiki.aavegotchi.com/en/rarity-farming)  
17. Pet Owners Social Network Database Structure and Schema, [https://databasesample.com/database/pet-owners-social-network-database](https://databasesample.com/database/pet-owners-social-network-database)  
18. Supabase | The Postgres Development Platform., [https://supabase.com/](https://supabase.com/)  
19. Schema Design with Supabase: Partitioning and Normalization \- DEV Community, [https://dev.to/pipipi-dev/schema-design-with-supabase-partitioning-and-normalization-4b7i](https://dev.to/pipipi-dev/schema-design-with-supabase-partitioning-and-normalization-4b7i)  
20. Building Real-time Magic: Supabase Subscriptions in Next.js 15 \- DEV Community, [https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp](https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp)  
21. Realtime | Supabase Docs, [https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)  
22. Declarative Schemas | Supabase Features, [https://supabase.com/features/declarative-schemas](https://supabase.com/features/declarative-schemas)  
23. Basics of Animal Tracking Databases: Crafting the Schema \- Schäuffelhut Berger GmbH, [https://www.schaeuffelhut-berger.de/wordpress/en/building-an-animal-tracking-database-in-postgresql-crafting-the-schema/](https://www.schaeuffelhut-berger.de/wordpress/en/building-an-animal-tracking-database-in-postgresql-crafting-the-schema/)  
24. AI Prompts | Supabase Docs, [https://supabase.com/docs/guides/ai-tools/ai-prompts](https://supabase.com/docs/guides/ai-tools/ai-prompts)  
25. How to Connect Cursor.AI to Supabase 2026 (Cursor.AI Supabase Integration) \- YouTube, [https://www.youtube.com/watch?v=FYYqt-8ueqw](https://www.youtube.com/watch?v=FYYqt-8ueqw)  
26. Subscribing to Database Changes | Supabase Docs, [https://supabase.com/docs/guides/realtime/subscribing-to-database-changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)  
27. How to subscribe to realtime data from Supabase in React Native application?, [https://stackoverflow.com/questions/76177187/how-to-subscribe-to-realtime-data-from-supabase-in-react-native-application](https://stackoverflow.com/questions/76177187/how-to-subscribe-to-realtime-data-from-supabase-in-react-native-application)  
28. Audio for Web games \- Game development \- MDN Web Docs, [https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio\_for\_Web\_Games](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games)  
29. 20+ Web Audio API Examples \- FreeFrontend, [https://freefrontend.com/web-audio-api/](https://freefrontend.com/web-audio-api/)  
30. Example and tutorial: Simple synth keyboard \- Web APIs | MDN, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_Audio\_API/Simple\_synth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth)  
31. Best 5 Animal Crossing Voice Generators in 2026 \- HitPaw Edimakor, [https://edimakor.hitpaw.com/ai-video-tools/animal-crossing-voice-generator.html](https://edimakor.hitpaw.com/ai-video-tools/animal-crossing-voice-generator.html)  
32. I made a free asset for dialouge voices similar to animal crossing : r/gamemaker \- Reddit, [https://www.reddit.com/r/gamemaker/comments/1nxwrbx/i\_made\_a\_free\_asset\_for\_dialouge\_voices\_similar/](https://www.reddit.com/r/gamemaker/comments/1nxwrbx/i_made_a_free_asset_for_dialouge_voices_similar/)  
33. Animal Crossing Voice Generator: 3 Easy and Fun Ways to Try It \- Fineshare, [https://www.fineshare.com/text-to-speech/animal-crossing-voice-generator.html](https://www.fineshare.com/text-to-speech/animal-crossing-voice-generator.html)  
34. learosema/retro-sound: 8-bit style sound library based on Web Audio API \- GitHub, [https://github.com/learosema/retro-sound](https://github.com/learosema/retro-sound)  
35. Animalese Typing \- Chrome Web Store, [https://chromewebstore.google.com/detail/animalese-typing/djbgadolfboockbofalipohdncimebic](https://chromewebstore.google.com/detail/animalese-typing/djbgadolfboockbofalipohdncimebic)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAWCAYAAACyjt6wAAAA+klEQVR4XmNgGAWjYPAATiCOAuJZQNwFxOqo0gML+IF4NxA3AzEPEBsA8TUgDkZWNJCgHIhPA7Egklg0EF8HYnEksQEBIEeBHLcQTdwUiL8AsR+aON2BJhC/ZcB0oDEQfwXiVjRxugOYQ3A5EF2c7sAXiP8zYDpk0DjQk4F8B3IAsSSRWBiIGSHaSAO4HIJLHBmAPAcqN4nBHUAsANFGGlAC4ucMmA6BObAKTZzuAFQwHwDirQyQKIMBFyD+BaUHHMQA8SMgVoTyQWkFVKucYIDUMgMOWIF4OhDvB+IABojjrjJAqrxBA0ChpgbEIUBsxwBx9CgYBSMeAABdTDDeky+EwwAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAWCAYAAACyjt6wAAABBUlEQVR4Xu3UMUtCURiA4S80UBwMmlqlpclB0KXASXDtF0SLszVEgoObk+Amra0NLg5iv8B/UQRtDUFtUe/Hd49e76LYcM5wXnhQ7z0XDsd7jkgsFk4n6OMBA5xu3vZbHQtcoIoZfnGLg9Q4LxUxxTVyybVjLPGFWnLNW/rXvuBTbPVcPbFVvEld89IhxpiLTdZ1JzZB/QyuPJ7wg+bmrTBqiL1/uqN1hYOqjGc8opS5l60g9lrsQjfev08EXa0JRmK7e1ttsVXexRBH9th+ucndy/q4OUNrNcJjuvR6KHeT764OLlO/vaQTusI33vCa8oHz1UhPuYNaz7ysd1TWQ2OxWHD9AfmELml+BpXyAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAWCAYAAAB+F+RbAAABTElEQVR4Xu2WsUoDQRRFn0VAMRDFSoggEhALQdDKWoQ0ImgR9A/E2loQQS0t7Sz8BCtFUpsuhY2FCII/kJSi9/ISeVlnxhSuzIY5cJq7s2EvM5MZkUQiUXTmYSMbGhbhBbyCe3Bi8HH8LMED+AA/4PXg42924BNcgWV4Au9gxQ6KHZbdhuvwTdxl5+Az3DfZNGzBQ5MVhln4Ku6yLNmFqyYbgzewKTrThSJU9lJ+liUc+w4XMnn0hMoy85V15dHjK8sl2hR3qZErOwnvxV3qt7Lc1zOivz2M4/pa/vjKEl8pX95nCp6JnsvDWNfX8idU9lTcpTiWx1U1k0dPqOyW6IVjw2Rccrc9/235/RX9sjw7udcs3HeP8NhkNdFZDV0vo4OzxY/mzH327MA2XDbj1uALPIK7orenc1gyY0YK/jNvil4veYVMJBKJXPgCGclLHt6W+PUAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAWCAYAAAB+F+RbAAABnUlEQVR4Xu2WPShGURjHH6EIUYoUiywmpIgok5JFJIvBx0A2DKIMNhP5GCRlMCgMFoMoNmUwWQ2kTAyKLD5+j+ecnPdNsah7dX/1673vOefWfTrP+XdEEhIS4koZzuI6zmFV6vQnvdiM+ZiBJdiPteGiqNOAR9iKNXiA7zgpVpSShTtuPHQXC92ayJOL+ziEmW6sGM/xCevdmLKBl3iDe9gpX+/EAm3fa3wU21XPjNjOTQRjK5JafOzIxiU8FCvcMyVWrP56Yl/sd+j51DZ9xbZgfBUX8QJv8QzrgvlY0ih2XjWZdec9mzgtX+dUk/hBLOBiiSbrMW5hXtpcgaQGUrnYDm+LdcN3aJpr4OkR+Y059trfo7u4hgtiKf0TPtyusDRtzlOE82Jd8hs77LW/xRcatmk1trvnQXzDUfdf8cWqYbhFGm01vUCMu2fPCHa7Z5/OYbG+jU/FblWRR4sbwGexD9cLg1fDp8WtaxJL4zCw+vAFe4KxSONbMf0aqN5hpVvnd/8Eh3EZ73HMzf1LKrBL7CzH5k6ckJAQPz4AeWZSD3vnGeAAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAWCAYAAAB+F+RbAAABfklEQVR4Xu2WQStFQRSAj1CEKCJF1sqCFBFbkZSSLNjIgmwV+Qd2CqVQioVCWVlR7OysbBWyxUophe8093rzxty38hZT89VX782ZqXuamXNGJBKJhMgwHmAHNjs2YXkybxL7sRpLsBFnsDOJB8EKfmf4gu1Yhsee+AnWSkDs4RnuWO7iAy6L2cV03h0+4SmOYmkSCwI9ktvY4Iz34iFWWmOb2G39Dw5NRhPTY5qid1F3rs0aU4JP1kWT3sApNwBbuI63+Iw32JU3IzAG8UL8RWcfVyV3T7USv2LP74yA0F09ErOzPmokvyC1iNlhXWNfAxstbvXyt6VlWWGWFR/ts2847QYy0I97xHsx/dhHHa5JfqUv5IhZVnzmxfTOMTcAs/iFC9ZYmqyqv4NC++gnDrgByT087GTTY3wtpoUFg96Vc3wXf3vpE1ON06ejohX7AyessSCowkvJTlYLzRJe4ZyYIqZPycUkFhz6iNAjXOgJ2IrjOCT+9hSJRCL/wg+1tEjoqzTihwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAWCAYAAAB+F+RbAAABTElEQVR4Xu2WvyuFURjHHzEQogwo5a5mIWUwSCnuogwGkzKZLcqkTGKVks3mX7iy+AtYlJQfg9goCz7fzvvqvK/lDhc9t/Opz3Cec26d7z33OeeaJRIJr3TgMh7gNg4Vpwu04hJWSnUXDOAZ7lkIOY83OBWt0ZexgPt4j684Gs27oA0P8Qr7o7pO9wJ7srHCzuE0bpnTsCP4jDXsiuo6xQ+ciWo5G+Y0rDasjdfsZ9hPC8HKNG1Y/cTLuA2rnlRvnmN3VFfPKuxxVMtxG1Ys4hNOZOOKhQurEWFbsA8H67Q9fOz30Ib03FzjLZ7imjWmZ3txx8L7XY+68f8chW2621isW+jZ4Wyskz6y4jsb4zqs+vIdJ7PxOD5i9XtFEYV9w7HyhAcU6hJXcRPvcMXCCed04gm+WOjl3Afcjda5QH8V9bbOWgiWSCQS/8oXeI1M3aKyf2MAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAWCAYAAAB+F+RbAAABx0lEQVR4Xu2WPyhGYRTGjxgIUQYUkUJmRaQsiMLChGRQFiyKxWBRMkkmfSWLgUE2TGRRjP4NSkoZxGYw+PM8nfd+zv364lvovnWf+tV9z3veuueee855RWLFiuWr8sAQWAeLoCK8nVQ9WBb1GwH54e3oqwwcgxXRIHvBHWizTtAA2AYNon7T4AxUWacoKwckwDUoNXZm9xQUuTX39iWc8SywBhaMLdJilp7BESgw9j7wATrcuhHcgNqkh2pO9GN5IQbxKumD/RQNhqoBj+AWtDsbs34I+t068vot2CBr/GVnnY1sgD0w4/a8ELPD2jwBhcbOmmVQm8aWbezkCXSKR8FS7LJ88Wa3rhZtWDZYBjQp+tu2imaV++9g1PmkE8+VgPIMydVjfye+EMcN6/Ee7IIJCdcsM3gBKt2aWeZcZgmkdnKrYrAkOpczoUeP/a8YrO3GrN3V7+2kusGLaO17oSnRmg0uB8w0G5Cds/ydWa+p4tw9Fx1hXoiBvIEWt24SHTN2pPD5UrSeA/GjjIEt0cuJF2IgV2AczIMH0aZjuyxrlKOHFxD6DIMdcCB63fRKbDCcrV3y8+WenZV+g6BOPBs7sWLF8kdfpnNZ1+9Q3DkAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAaCAYAAAC6nQw6AAABFElEQVR4XmNgGAXEAicgvgvEj4jELhBtqIARiKcA8UogVoDyQWAOEP8DYg8onxmI7YH4ARCbQsVQgDgQrwJiMSQxQSA+zQDRJI0kzgPEi4FYBkkMDkDOLEQT0wfiT0C8BohZkMRBFkwCYl4kMTgIBWI1NLFoIP4PxOVo4sJAnMaA8D5BAAqf30Bsgy5BCsAVPiQDYyD+yoAZPshAD4gjGAh4EVf4IINMBkhY4QQgG+Yz0CF8uIG4EYhnAzE/mhwKIBQ+gUBsAMTbgdgSTQ6chs4B8TsGSNjA8Bcgvs4AMRwGVIHYAoh3M0BcTxFogGKKgAgQH2GAuCobiDlRpYkHoCyyB4ibgdgWTY5kwMoAib1RMFAAAP58NURr1GQeAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAZCAYAAADTyxWqAAABVElEQVR4Xu3UvyuFURzH8a9Q5FcRUQzKooxKSjGJxUJRbJIymEhklZRBFouSjcEguyQTk8GiFOUfMBj9eH+cc+89jsfTozsY+NSre5/vee55zq/nmv35VGMAg6jztQY05m7IknKs4g7zmMMVNnGOzsKt6SnDDg5QFdQ1okucmRtxpvTiAV1xA1nBdlxMyxoe0Ro3kEWMxMW07OMNyyiN2jpQH9VSM2GuM3nBKaZRG96UNdrJdXMd5TqVa0ueeqZoijoCG3gy1+Fs0K6Hztg3D9CPtSYlcQMZwiuWgpo62UVLUMtHu3SCiriBTOEWbf66D8cYzt8RRUfiGT1RXaPVeo366yZznev60L7u+MeJPsICbvx37eAW7jFuhenraDRjD5O+9imV5kagaGG7MWbuJU+adjsu/GfR0a5qZHr1+qO2H0dLoD8CvSWaVdGpsYTF/88v5x3pADJ/iBWrJgAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,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>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABDklEQVR4XmNgGAXkAAUgjkAXhAJmIPYG4mlQHALEnMgKNIE4C4j3AfFfIF6ILAkFrEA8GYjrgVgZiFOB+CsQXwFieZgikEEBQGwFxE8YsBvkAcR7gFgaSSwGiP8D8RwkMTCQBOKHDNgNKmfA1CTDALH4LpIYGOAzyASILwBxGpIYTD0IowB8BmEDNkD8G4jXo0uQYhAo8OcD8XsgNkOTI8mgYCB+DsQu6BIgQKxBIBecA2JTdAkYIMYgkCFHgFgFymdhgCQDFEDIIFDCWwOlYUAEiGch8cEAZtBSIGZEk5MA4kNA/A6IHyHhV0C8CqYIFGCghAXKHqBEB8JfgPgSEOtC1cASJDbcClUzCugBAKetQEpQrjL+AAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABlElEQVR4Xu2TPSiGURTHj0wiBglFPvIRKYOJxUQWFkoh2SyyKCKDxcAok5QsBkpJCpMoCyXlK5ksBrEZxf/33nN53pfF7l+/es59/vfcc895HrN//UU5YkCsiEXRKLLSHEH1Ft7jGxK5yZcFYlsMi1LRLI7FhKUn6xWbokGUiXFxJiqiYUzMxMDVJC5ElcfFYt9CgigOWRZzcWFdLPiLKCojEdWhFnEnar8cQVNiNQbz4kMs2fed+8WeyPO4WjyJB9Hua7TkUPR4nLrjvYVkGEl84utRVDvpHlgTO/azj6kGProJuG5+0iBl23f18Cw6LJGIBlLBqIXJvbnxVBS6BzND4SptFqrB8+57Ut/ProWmRZE4GtmMOPlKlHtMdXx3HHrLAlOhP1wtKQ5g3FwRMRmGkaku8coDY72xMJVM8W3FzSSkP5mi+nMeGC/3nrb07heJI9HqMSO+FpUeI/wjYiMu1IhLCwkHLVTCJpoYk9MTxv8iZt23JQ5EiXtSwsg1+0SnZfyMCTHFbgu+Ovv9x/7XL/oEqhdOGVe5QjsAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABfElEQVR4Xu3TPSiFURwG8EcYRAwoouRjIWXwUcooKSOlkA2LzSAWk4GRMkjJqhtJSjIIGX0UBjGQUgYmk4Hnuf//ufe9b1LKeJ/6dTvnnvf/nq8XyOYvKaAhWqVFaqKcjBFALvXRihuAPZdKCW3RKFVSCx3TFNLF8mmZ5qiexuiDrqnGx2CSZkPD00wXVOvtXjqkqtQIYIS+aC10bNACMpeimamQZqdMI/YQU03P9BA65mGDlqjQ+wZpj4q83UaXNO5tRS97dMlojXewYvewwife/1u66JO2o52N9AQrJlpucXRALNr8dXqnjtCptWoGE7CT02mo2BmVhkGx9NMLdYcO3YNd2GaGqPAOrJhONB7N4Jzao506Fe2PlhaNXrAPW2I0KnJKDd7Og10DtNIt1fkf0ehu6SRDtPkJ/w0pg30NyeM9oBlk3qNyOqJOb1fAbvsb7FCCV9r0MclpXsEKDsNmcgPb+FA8XMif6Lqkog9Sy9SH2IP0xczmn/IN89NNYGyqo3cAAAAASUVORK5CYII=>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABj0lEQVR4Xu2TPyjFURTHv8IgQmFQ5E8kEoMkuzBKpJDFYLEZxC6RhURPFhOTkpRkEGWVwiALG8KCEd/v79zr3d8LZX/f+vS69573/Z1zz7lAWv9RDhkka2SeNJCMWISt28gSWSH9JDcMKCDbZISUkmZyTCaQNMsii2SGlJFaF3NBKlwMxsm0Xzg1kjNS5db15IkckDy3N0Q+YRlG2iBziJeizGSk7KQ6ck/OSZHb64UZrbt1lK539jUPkD0kvy4VBmt9dJl8wAwjqcZrmNkNzPjE7f8kmXSRZ7JAssND3cEdzEyo3PwwwKkDFvdAEqQ4PFQXlMEYrHNvMLNTJO8jVZlklrzAzKP52SWTQZCMd2Bm6uhvaiXvsBGIuqL7UWmh9IF9WIlSE6wZ+vVSZ29hFaCFXJHqIMBLs+VnRIb+7rz0X5lovqJ2asimEJ+jEnJE2t1apT+Sbh9ADcPMV/1GDWzQZKhpVSaXsIv35npGm+SQjMKezyvZcmffUheUah/pRMpjdJJpJelxlMdO0/pTX+BRTZ68JZgPAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABi0lEQVR4Xu2TPSiHURTGH7EIGQwMRAqZFZGyIAMWJiSDsmBRLAaLxSSZpGQxMMiGiSyK0degpJRBbAaDj+e557yv+//nI7unfvWee5/33HPPvRf411+UTwbICpkn5ZnTqerIAsw3RAriyTJySBZhCbrJDWmNTVQf2ST1MN8kOSGVmswjq+SSlPoPkqo6JsUea24XmZXmkGUyp0DZH8kBKUwtQA95I+0eN5ArUpM6TDOwQoLhGV8neocZpWpyT65Jm4+p2n3Sq+C3RGE12DamfUyskR0y5XMhq3pxRIrsnyD1SD+sR2O50bh4IB3wRJJOQ4NNHlfBmh8nknkctpUWWDWafyXD7gkmHbn2f0u2yZgbkx5p5TNS4bGq071TW7Tot1Ki+NTUq6XP6VRd5CkJJmA9ChcLVqGaGd8jbVH9yZbu1WkSyPRCmj1uhB11OFaXvs9h/UukBUfIRjIg0wUZJbPkDtbA9DRgPdHx6/LKM0i2yB7siaXSE9Dd6UTWQ8xSCczXT2qRudi/ftAHeI9RZU9RqjAAAAAASUVORK5CYII=>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABiElEQVR4Xu2TvyuFURjHv8IgV0qKQV0ZyEyk2GRyDZdBlAxKirIxWC0mGaVEyWiScg0Xy/0HUFJSfgyyKIMF3+/7nPd9z3u73Oz3W5/hOec5zznv93leoKL/qI5MkW2yTtqS25G6yAYsb5xU+5ut5JxswgqMknsy6OVUkVlyS4ZImhyQfdgjUEN2yA1pCY6Y9KoCaXRxD/kgi1EG0EGeyaSCbvJG8iQV5yBDvsiwi7fIt1sPpfw8OVYQ3qSF4kI6uOLiPReXKvSgoFwhfbb0V6F3BfJAXlyShjgn8EgHVUCSD4qzUYZ59AJ7SCC18ZX0u7gdZr5fSBeekV1SC+viKszHqJAW1fI72PcekXkkPZKaYC1/go3BArmA8+g3qZDftVJqJldwXZOWYB5pyCS9UJ/gz5EGVUO77PYlNUpGB3MkyYdPMuDiPpiJY2EC4u4ewoZYPuk3OYXXbR24JnNkjTySGcQ3S0o+gR2ehhXIwX6vhPR7aEZGSH3RXii9opdMkE4kL6qojH4ANR9UTkBrKukAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABaklEQVR4Xu2UsStHURTHj1BESUopIimZKEoMJlmUFIMYlclMWZAM2Fhko8wm08/wi1IYGCRFiZS/wGAQn/M79z33vd/9leW3vW99eu+ee87p3HfOfSKZyqUOmIVWqIQa6IUF9+6rG7bhQCymNrn9p2H4gh+PTxj3ndAUPEAf1MMG5KDBd4rUL+b8CHewDi0JD5E2eII5z9YIN7Do2WJp0r20MSVNptWrb6QKOIa8WOUJ/SfprhQnVR3CB3Sm7AXHEziCZ3iDVUk2QYNLJQ3ZC4Yr6HLrJrgW63C12NHyEg4umVQD61K2FbGJGHJ7ZxIODibVqrSD99Ds2ZfFRkufqk0JBIslfReb8Vg6Oq9SnFQr1aQTbq3PbxiNPexinDoSl6QK9mHQs+kwn4sdORrs6DuvubVKe6BVzni2WO1wATswD7dwKakjoQF4gSWYFvtsW2I9CUo3RsSce8T+ASFp08ZgUuyWZcpUbv0CUs1HHuj1wOQAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABHUlEQVR4XmNgGAXEAgUgjgJiGSBmBmIOINYH4jQoGx2A1IQxQPShACsg/gnE/5HwVyD2RlLDCcS+QDwRiJ9C5Y2R5MEAJHANiG8A8QUgbgRiSRQVEIM8gdgBiOsZ8Bg0GV0QDyhnoIdB64F4ERDfAeJHDBDng7yDDeA16CQQq0D5wkB8CohnATErTBESwGkQSDE3mlgVAyQmLdHEQQCnQdgASDEoGRShSzDgMAjkjdNAfAWIxZDEYQaBaHSA1SBQennIgGkQyGsgg/yQxGAAq0EsQDwDiM2RxPiB+BAQ74Gy0QHIoG9AbIouIQ/Eh4G4G4iTgfg8EB9jgOQ9GABFxgogfseAmpWeAXEfkjpwzNkBcQgQazJAMuYooCIAAPf2PfUYKAE0AAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABXklEQVR4Xu3TPyiFURjH8eeGokgWUgwMZCNRDCYpiRRSWGSR1SBWWSwKpaRkuoXVZHA3Spn8mQykTEyUDPg+7znnvs91ua79/urT7TznnOe999zzihTyn5RhAttYRXPmdJQxdKMcCVRjCq1hQSWOsewX6cQ1RsICUox9fH5zIG5/lAWcoyoUyCRuUGNqO7jEPQ4xgKIwqZu1yV4o+HTgBUOmtoF2M85IC54ku5FueMWKqeVsFDb81sjWN7GGCzzgFG1hclDcoeXTaBeLEp+L/mPP6NRBv+TfqELM4ZI6cd8sqYOfNuSq29TiDrc6aMSjZG8IjZb8eBofmE2viBup6AKmcITSeI304t1/avSu6RHYRuGnpUJBD00vWYMfJ8Td8jOJb22XuH+txI8143gT8wbo5BZOMCyuyZWYd0hc83m/Zgbr4u7fnJ9LRwdNGEWPZD7Zpl7cw/rEvGOF/J0vj8xMSXUv+rcAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABaklEQVR4Xu2TvyuGURTHjzAI2fwoYrWRIjLK4kdKUpISRcpkkLKaCZOUTArlT/DKwGQSC4mUQWyKBZ/znHte930oyfp+61PPPec85znP994rktdfVAIjsAFLUJubTjQEHVAGBVAJo9DkBdVwBCtiDXrhBjq9ABXBLnyk2IMKL9iES6iydxLpVKdeFKR153AH+9ADhZ5shCfIiI3s6oN36Ipia9ASrXOkiRf5uZGOPh/F/tVIf8e1DstwBvdwAs2eVA/Ui2Mo96CYR9poO4ptwYJ8+aI79gytXjAIj9AW1g1i5qcb6Yey5ortsE624wE9E7rlV3ALBzAl3z1Kq0as/jqdiKWN4l0bD+vpbMVXIyXRrJhH9WGtE6of8TnSyXTCuJH/WsYD6sMbtIe1mvcA/V4QcrprxVFsGF7FPE6kL1zAJCyKfWVMbDKXPs/BIUzAqthBnknVJddDz043lMaJlOpgQKwuvj55/aJPhsBN9h68NioAAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABKElEQVR4Xu3SMUtCURjG8TeqIQokilwKWpsMql2IhAZBAh36APURKgqaGlqCiBa3pvwQDo1SS0PSJC7VEjUENVb/9557Lq+3Yyg4+sBv8D3H5x7vUWSYfjOBbVRxgvnO5SSjqGAxNY+yhHsciCso4xZz8bo+pIhzPOMTK/FaEt38IK5kBJOoS+dmLdpEHseptSR7eBN3Kp917IsrSEf3/ynKoIE7zMT0hPoeuiVYpKfQ02jZJQ5xgSaWzT6bYJF+0OE3tuKZvqdTPEr45v4t0hPMmrne0A92zcwnWJTDB24wZea+6MrMfIJFWbRkAEVjuBZ3a9Nm3vdP02zg1Sz08rK/sJZeGMcR2tgRd/1PWDV79N9ew7u4k3ovODP7oiyghIK4Lw4zwPwCmBNESERfxewAAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABcElEQVR4Xu3TyytFURTH8SUM5JZEHiEDJkaUx8jMIyUlj4lM8ScgysjAWAykZKSk/AMGNxnoKhmQkURKEUoZKXzX2Wt39slRlOH91ad79zr77PZZZx+RfP6aEkxgA8uoT16WQgxi3YyJuyeRFpxhXtwC48ihyq4XYxVLaMIU3nCORpsTTdaCLlKAUhzYxHabM2C1OhtrJvGJTV+YxZO4Xfn0YE7ireucxE3idn6HKx2U4RgnqDC6Q+1HmA5xjz4d1GpxY6Jd6G50sTUsiOvFBdrshp/SjXfs60B7oL34wIhN0D6t4FK+vzkfbf4WXtClBb+Q7qAynidD4noyE9TCjOIevb7QildkkfFFiRfaDmo+uoNTdIbFanFdz8rvFtJFjtBs4yJxxyD6syPurZXbRU3ao+nB27NfH22HfglR+vAo8eFLa3YNDvGM28ADdm1O9AYWcS3unOjr14OmZ8fHH8g0+l0m0oBh9Iv7TPL5x3wBynRQEqgY9OsAAAAASUVORK5CYII=>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAaCAYAAAA5WTUBAAABnUlEQVR4Xu2VTSgFURTHjyJEFAuJEkmRtVIslIWPhbKysbKzs5AlJSs7FoqFpViQhfJKkpWslUKhlBB2Cvn4n849uXOamXffVvOrX2/e/c/MO/feM/OIMjLS6YBX8MfzDfa6fNlk17DNZcwEfDHnPHpjD3AalusFaXTDd3gJ673xUrgDZ2GFN+7D4wfwHrZ440VwhOS+K7DYy2LhSvfhNxxwY3wTngXLx0k0wjuSQmyhPKFb+AzbTRbLGMkSbsASkh9fdMdp9JMUv2ADkpXhFbKrlEgdPIevcJ6kH/IVwMyQFD9oA4pOLO92KDwbvugYVpssjjK4R/EzbYIX8MwdBzNEsrQnFFZEA7yBT3Adrjo3SZ4M3s4qPTkEbpxDkur9Bk1D+2GNpAlV3tqQrYzAy7ULW6mwfdR+GLVBofCyb8Eu991v0E49KQbth+DHLwkuYBsOm/E5khnyZxL6fjiCldEonGaSLZiyAeiBn/AU1ppM4Z7hfliyQQjj8IP+3vVfJK9XZdKN+XkO1ricr+f/B81ZfkT7XJ6RkZHxP/gFFxFj8NmG/uQAAAAASUVORK5CYII=>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAaCAYAAAAjZdWPAAACA0lEQVR4Xu2WvytGURjHH/mRXyURyYIsyiLJgEEZGBhYFJvBbqBsyGCVUqJIWJTJxKCM/gCTQqLIhoH8+H6d93Du85773uvNxP3Up97Oc95zzj3nOc+9IgkJf5tueAffHZ/hAaxw+lXCY0+/HqdPAdxRfSadOPGNQy9gl9MvFqvwDfbqgKJfzCQbOpAiF27DaZivYi59YsZZgjkqFotyeALPYW0wlEYrfIS7ME/FSDvchEU6oJgXs+gBHYhLE7yX8IW4NMAbeARLg6HPha7DFtWuKYT7YsbheFkxIuapp3TAQzU8E5ODNSo2Cmck+rgzPXhsFuEL7NQBD5zkSMzJ8IQsdXAPVjltYfDy8v4wRbLC5jN3j7sYBdOHafQE21Jt3NkFiZ+fNp95GbMiKp9ZxnQVYKXhpKwkhKWKVUD38xGVz6w+xbpRY/N5QgfE7OAsbFbtzH37nzIxtbkx0CMcm8+HsETFCEvuuG7UcNfC8pkLWZP08jUoZtE8Zi48chIHW599+cyTWpb0TQqQqT5zgBUxJ6GxF+lUTE3+SQXIVJ+H4Jb40/SLsBcFSxkXfAnrnXaL/R/lyyQutvLofOZJjsEHOOy0B+BOXcv3e/8VXqXkb9vOXPU9NR+KdXpOomsyYRnk9wa/VezYt2I2hQu1bZzft0m/AlOnQ/wXKSEhISHhH/IBKjt4ZjHvfZ0AAAAASUVORK5CYII=>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAAC10lEQVR4Xu2XS+gNURzHv0KRVyIkwsajFCJSkvJKIXmULGwIC/+QvGLBwsJCiWykkMTOipXFyEZsKI/ySCSSJMqC8vh++53TPXfuzNwzmXvvZj71qf+cmf9v5vzO7zwuUFNTUxPHcLqHXqAn6FTar+mJeAbTLbBYJ+mE5ttRVBGjNLNoQpfQkXQn/UX3o3wyZtBH9Ajs4zfRB3RM+FAbxtG79Awsxmr6hi4KH+oEZ+lvutZdKxkP6RdYx2JRZ5/AkqAEDqF36A86N3iuiAH0In1Oxwbtqor7dETQVjmn6V+6zV0Po/fod1i1xHIIrclbSg/DSj0G/a9iJHRo0L6G/qHLgrbKGUhH0/7ueib9itaPKUIjpRFTJY1yqkJ8zFhUOaqgBK2J0GAp2V1Bi+Y1+o7OTt0rwo+kknGeHqXn6FOUi9MuEZo2HUXz+QYsAa/pSpQbTd8Ble9616Z14hRsvseu+r6yNDU1RT1aI5SIK0Fbx5lOP9CrsATF4BOhCtA08/iR1E4Uywb6mS5w15Nhyex6IjSSmh568a7UvTy0qGpxTZBd0mU6oPdry3xF39KbsER2dI3QQrnPqb89emGZDmir05RK8P+JyEKJ6Oiu4Us6vdfrw9UBnTE86qB2g6xDlvb/67BdQ+cQT9bUKIoj+mBrxCR3recuofUcoeQrTojuj0dzbA2wYoUD3cJE+pJeRuMlCq7ToLbQOUHbY/qTLnRtaZbD5rZPaNZiGRNHgxDen08/onHgE9PoJ/qeTnFtebH9Oel40JbJKth81EdvprfoN9fu0SjehpXngaA9RBk/BjsO74Btn/rQecEzMXHU4Wd0OyyeYmxF8ygrseq0Tq5+AH3sF2hUk9gL+8mgRbgtg2C/NTbSxcgvI83R3enGFKqydXQF8neddnFU9ppWRTF6ykHkl3QZqorTE7RF6mQX+7shj6ri9AyVauwJsYiq4tTU1NR0hX8VvpVErHprhwAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,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>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABGklEQVR4Xu2TsUoDQRCGRxLBYBHSmMLGIhEEO1ubiEUeQVGfQEgbQppACnvBzt7GJhDfwWhhE0glaGOhaKpUouYbdpfb7BlcsArcBx/H7gx3c//tiWT8lxq+4Y/nB554Pd2g3sNVr57iEr9xPyxAFQd4jCtBLUUJ7/EJ12dLsod93Aj257KF73gjyZNz2MAzLNi9KI7EZNG0a83jQkxuS64plnP8xF3cxAe8xaLfFIPL6xlP8UrMjfRj1L2+KFxeX9jGZTwQ89p643zS+jcur5Yk+ZRxhGPctntR6Plyefl0xDxEr1G4vB7FTOOjE+lkOmFY+5UdnOC1pLPRte7rdHry56K/zIvM/m+veGjra3gX1IdYsfWMjMVlCn+/PCJqzkDYAAAAAElFTkSuQmCC>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABmUlEQVR4Xu2UsSuFURjG3zsoom4ySFFIZFAKi8EkZSDFIPwFMlMmJQOjRdkM/gQTcUe5m8JgECmTjUWJ53HOub3n3O98d7hhOU/9ut99znnPc87X+V6RpCSRbrAYmkoDYA8cgiXQ5A//iB7HOIdzWRPVIFgF5+ATHPnDFc2DWzAMWsA2OAVFNYfP9DjGOZzLGtZmiuFzYBw8S3Z4F7gHy8prBWWwprwN63HMiTV3oF15VeoAj5IdzgXewYjyCuAYlMSc0m0mrB8Db2A28D3lhe9LdTjFuS+gV8wbfLWeFmtYuxP4nvLC6cXCne9CwvqY7ykWzldaktrhM+DLelp1hTeDM6kdPi2/EE7922uneFli4fw8O8VcOl6+sN6Fbwa+p7xwfiZsQJPKawQnFj67u+H+O7Hmw/5G5cL57RaCsTZwBbaU1yfm1Lodr4An0GP/cx12u0vxO2FF3BEX4cl4YQibwjUYUvNGwQNYBwtiGsouaFBz+HwALsR0TQbfiGmzdYs3f0rMwmy5WeJp+8VscEL8zSUlJf2tvgHppGwFoHGpQAAAAABJRU5ErkJggg==>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABYElEQVR4Xu2UPyhFYRjGHylR6hKRwXDLIla7sphNipmrDFKyKYPBYjArUjZJSRnvKIxkN5KUwWDA83jvyffPuffWGc+vfnXP951zvu953+9coKQgOugSnQknimSSvtF7OhTMFYJS7NEv+k1r/nQSPbNDj2i3P5Vmgl7QBdhCN3TAuyNmkD7Q/XAiRZZikfbQK1gaXecxRT9gG2vKGD3D385nYWmuaSW7yaGPjtAN+k6nYT3sdO7xUIpt+LvupXVYmnlnXHTRdXpIXxrq9y5yylulp4hvmEN+mrb6sYX0SdKLtYAW0oIhLfdDKS7x/zehUqlkdVgJXZbpKx0PxiM26Wo46OCm0WHIUB9P6C3td8YjRuk5HQ4nAnQglEbHWsdbZP04aFyrn/oEwrS/CT7pUxOfYYu4aVQilUr9UKo1JPqm3T/CHm5H/SMojTymd7CTuQJbrHD0UpUpKlFJSUlr/AB6slF7qIl2cgAAAABJRU5ErkJggg==>

[image31]: <data:image/png;base64,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>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAZCAYAAACvrQlzAAAEmklEQVR4Xu2XaahvUxjGHxkiZIxMOVci3VuUkA+GD8ZCuETI/aBLiXwgY+mYPpAMXbdbIkPJrGTKEEc+GCPlIkMuGZJQQiHD8/Pu1X73+g/H+bs5J+2nnv7/vfbaa7/rWe+0pR49evx7bGyuUw/2mAzbmjebG9U3Fjow+BTzVvM6c/fu7bFgLs/w7Pnmdt3b2tA83VzS/F/X3NE805xqpw3FyebZ9eBCx2bms+ZV5ibmXua75tI8aQSY87C5p3mA+Zb5q3l8mrO5+ar5Z8XrzfXTvBrrmSvMPeob/xE4/DMU9s8JF5mvm1uksVPN9xQhNwrce8k8RG2O29X80vzQ3KkZ45CeMN8xPzbvNPfT7HkRIVcphJ0PbK2wu464sUBExLyrGt/H/NE8phrP2Nv8SSFSER6R7lF44JHNGIKy/pwMU4Q6IT9fIOJWa4524wXfalDQItY11XgGqYJwv0MhWgFrIejRzfUkgpLTbzMXVeOkiAMVuZoDI9Xsku5vZR5nXmGe2FzXIIezPw7swuY/YxlTCkf7QvEObM97HIki3ChB6/HZUDz+a7WFDUPuN29QhD1GPqrxBWl/RaHLaWEb83lF1LDBI8zP1B7cYvMb89rmPoUQO3I+Z72bFM/tq3AobHlK4SBgStFZfGL+oog4Cm6JuLHAGLypFm5SQU8yf1ecfBEDQZ9u7jEGKYAfmDs3c2pcphAsgw29aG6axs5SKyiHgAB4NuA9t5hrzB2aMfLxveYPCs8DdB/fK2pJBnv/VHOLrL+NXFuCIg6FbFrd6s3GECF7Gzn6Z8XcGng576UoZFD8OCwE4T/Vl0oMAetvqe67EYl9sJ8C5ufKjWAIV+91IkFHCTdqfBQIFyrieRrMR8NQ1n9O8SWUgVjT1RhAKFqt3HrdpzZUAf3tSkWhZO03NCgo9i01XzHfNx9SeHa914kEJaF/pcHFyoYvrcaHoYhZQhpQOOhnATntN/PQ5hqU9WfUTfY8T+4kfEeBjoKC86BCVHIizx2u6EzI1RQ1UHso73pAkUOJEvBPPJT1aPVmbeF4wYxCkBI6AC+hQee3AOG2Vzd08Ro2lBM/uFqtwRhGqGZBS8jTIeT1yHV111BArsx5jufIxTNqe0ZSTmnhQBGUA77APMr8wzwnzcmCst+y5ywo5HqYXQM4TXFii5rrYighUcKJ9uNtRWgU70HM6WaM5ws/VxSC0s7QS16sVjh+L1EUAiptxrhPTQR9Td1WCGE4ADwIQdeoLUCMPaYQlMO8UbEGguaD4R4HjmB80JQiR8tI9LIPyPOzeihAmFXmC+axCjFXqw1ZwMk8qW5lLmGbc1ph/vJi/ZWKnnWZebei963bEIxlHlV3GNgon7ZvmrcrQv4ZRd4E2PuRojWjzXlE0WLhCN+Z5ypsIQURHTxPgbtcITARyZdfWY99stbL5uMaPPyxwGt2M09QhEeulGsDef2D1U0vBXjBCo32gg0UdlFU6EmHfWPzHjyY+6U48lvvh/cTxjmEWT+nH1DeNczeBY/lmt9Pzf8VyHfDPjV7TAjy5pUaDLkeE+Iw86B6sEePHj0WMP4Cp83yAnxAOg4AAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAZCAYAAACvrQlzAAAEkklEQVR4Xu2Ya6ilUxzGH7lE7kbkUs6RRjIaxZBy+eKaSxhqQnzQUJPLB6IoueQDyW1cSiQfREjJNSNm8oEQKYNEhkgIJRTl8vz6v6u99v/d795n9pRz6H3q6ex3rfey/s/639aRevTosenY1twsD/aYDrubd5nb5ImFDhZ8jvmAeau5//B0Jw4yzzZ3U3jRduZR5rn1Tc3c4ebd5n3myebmQ3eMxgpzVR5c6NjRXGPepBDkYPNDc3l9Uwcw+O/ELxXvKEDMq8x15qy5yHxUsXlbVvdlbGGuNg/IE/8StjYvNHfKE5Nwtfm2uXM1hod9pAi5cTjV/Kzhm+bl5g5Dd0iHmN+aR1Zj+5pfmCdWYxkIeb9C2PnArubz5h55YhwQETEfSePLzF/M09J4BoKyIeNws0K8emHbm6+bD6u74BDqRMB8gdS1XhspKF7wg9qC4lW/KsQYh0mCEjbschaU1LJW7cgoIKc/qEgRNUgRR5tXmCeZSxXeXkA6OcO8QZHbuc4gd2MfG0Yq4nfO5zOKtX2t+AZrZ80TUYTrEjSPZyAo97ykCPvPzZUaLLAI1yVoHi84QlEca++l8L2qiBqeIV2Qr1kDOND83rylmT9fkWrObOYB77tT8dxhCod6xnxRUUvAjKKzwJbfNcj3bOBEsBgKSRZuYwTFyF2a6/3MrxQ7z+IxDNGycJMEvVbt/IpB6xTpouBiDQRlExAAzwZ8/x5zg7lXM0Y+fsz8WeF5YIn5k9qRhu1d6+sEi9wUQQlpWIAR7CiiziqKGp6bFzZOUFIA36Uo1DjW/FMhCL+pvvX3+TYbW3cOiIQd2FPA/XXlLpuebZ1K0C7husbnAp5hk9isLuG6xgFiXZ/GAELdpuEW7XENQhXsbd6r2MRXzHfUFpR0tFzRlXxsPqXw7GzrVIKS0L9R+2VF0GvSeI3FiqT9rIZPMkVQQpEQY8F5YUVQKn0dwngZuZPw7QJeT8F5UvEdciLPnaDoTG7XYD3ZQ/nuE4ocuqwZm4uH8j4OJhNbuGIYlbgOXbzkj+ZvAZ6wpwaFooheC8ocIV8bgVF0EhSAAsJ5veLkVINcRys1qqLmjoJvcRhZq0HPmHvnIiidwZXmKeZf5iXVPbWg2FtsrgWFXI9aVwvnKXZstrkuCyUkSjgtMt9XhEbxHuYQb6a5Bvwm3OpTUClUdU9Jj/ed2p447qiJoG9puBVCGDaADUXQDRoUIMbYbAQ9zrxD8Q4ErTeGOXIzgnGgKUWOlpHoJYohz0/0UIDhnEheM09XiIn31MdHduYF8xNzn2r8UPNdRWq4TGFQzmuA1oU25CLzAsXRFuGKtwMWS/5bUo3VwND3FN97SBHyLyvyJmC9n5ofKDb0aUWLhSP8aF6qsJW26jfF8xS46xQCE5GkoPI+7ORdb5jPKdqsOQPDyIlnKcKjrpSTwL/Xjldsxoy6Tz54FqLA2ssK8ILV6vaCrRTroqjQk446Y/Nt3s186YX5m+0hvRHGdQjz/rz28q06Hf5nsFLze9T8X4F8N+qo2WNKkDdvVDvkekwJcvAxebBHjx49FjD+ATig9Fd9UzmkAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,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>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAaCAYAAAAnkAWyAAACOUlEQVR4Xu2WTUhVQRTH/1JGmt+I1sKFkkgiKIiC4CISIYkURMRF0cKNywhM0M0DERQRxD6EIKhF7kWIsha2URciumgX+AHaItq4a9HH/8+ZwXsfz/d62MsrvD/8uDNz5tx3ZubMeRfIKqt/onoyRx6TVnI5bI6u6shzWNCL5DcZCc2IsO6SCde+AFtE0bE52rpBNsn1eMN5UB55Rz6S4jjbudB98ouMk5w4W2RVRt6QJbJFfpC20IyI6hpZh5VH7fYArNKMBidFUQp2Fha8z3Nd3O/ktZ+UplSxfsKqV0ZVQ74iXM91Ens43c5r4RkPvguW3+2BMS3okHQHxtLVfwv+iDQHxhT0Z1Lp+ldIjLyCfTpchfm9cKjd5NqTpATh4BP5a77mzJAHsEKhdKuFvUMluwMpVAUL9Lbrq9br02DI9S+SZ+Se6+v5BHZX5LNKSkkhmYZVLckHn8y/l+zDTloLXCbzJJe0kDVSbm4n6xbZhv3gChmDvUDSi7/A7kSfe74lBbCgP8FSroH0Ox/JB5/MX/YV15bkowVJygSVbN2/lNK3TAWOX+TVSHYRTqugYuQp7KSqA+M++GT+iYL3qZZW8CdJaaSdUu2XdNx3yCXX144fkCln8/KBJPPPePCSPtQ+kEew8tkZsCmnXyJcrQbJDtmAXeZE/rqwyulvbuwhrGRrTKmzACskuuAqAKeW/sT8XVCa5cOCH3a2VAr6n6mUBu/JTdITNkVfqtU6btXoSOxmVln9hf4A8rtqGnHOfsYAAAAASUVORK5CYII=>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABN0lEQVR4Xu2TsUoDQRCGR9RKIaYSCxGCkFJBUsbKxsJGER8gD5BCsLFJYWVlbSMWqcQyT2BpYWkhokgI+AAWCmK+ce7i3ppsVkkTch98zc7e/XezsyI5k0IZT/EcD3EpWx4Ne3iNa1jFO/zAXXdTiEWxL5zzCw665wa3cCpZW8UOPuByshZEf/8S5/2Cwwa+4aNYqKKBTfzC7WQtSExQQaxtF5Ldp89p0I6zNpCYoH4U8RZfxYZkKP8NOsBPPJKfc+uxIPZiV52iK7HD9WuDwlfwHhs4my3ZVB2LTZirHuiTWP/9Wu37ySx6Xi2s47RXC/KX1qUh2ra0XZu43tsRIDZIW3Qmvy/oCVa8tb7EBGlIA9/xxbGNz1hKN4aICUovrN4ZXx1xHfWhxASNBA3Yxxm/kJMzHnQBRs44TvCMRTAAAAAASUVORK5CYII=>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAAA50lEQVR4Xu2UsQ7BUBiFj4SJhIlIJAx2G29hEU9gMVu9Ah6AQTpIJFbvI0SMHoCB87ttNH96q03cQfRLvqE5mlPHLSDjH2nSLa3q4JsU6JoeaV1lVmp0SYs6iGFI70hZJB/0aEkHFlowD7aHwyKZbE67MPc4KxrQCc3BYZGcshUt+9exRRWYIGyH7mg7IgvKZbIZ7fnXgrVITtUU5ocMu6EHmOOqs9HrTqCP92QB1iIbSaZb0JPyRh/0AvPifnw9khRF4eQbaWRCmfxMGyqzkrZoTK8ws4kyodPpUiMF8t+V10FGxm/wBJOgNNSBw5E8AAAAAElFTkSuQmCC>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABTElEQVR4Xu2UvytGYRSAj1AKUX6lWGRH/gEpsli+mIwGZTUoUoq/QkoGk8HELEbFJAtJiY1NFj+e47xf3nu7XkcZlPvUU993zrn3vO+5770iJf+FblzBDVzA3mz6d5jEAxzADlzDZ6zERSm6xFbYmE9ENOA+PuJQiPXhPZ5je4gl0XFsY1M+EaGN9vAFR0KsB2/xSmyx3+JppGizNqwJ/yfwFTexrlqUwtsoRndzhCfht4ufNOrEY7GRnYodjOoOM7SK3ThWi3exvyCXaj6KT7iK9XFCT9Wy2AmL3cFr3CrIzX5cWUyz2O70gIzlcoV4RtcitvIZyY5Kr3vDxSj2JZ5G+rLqDW/E6hWtPwzxuRBL4mk0jA+4Lp/PQ5/pHV6I8+R5Gum45sW+AktiIzzDSxyM6pJ4GlXRZzWOU2K7rM2m02iDaXG+3SUlf493brc4orSGhLgAAAAASUVORK5CYII=>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAABbElEQVR4Xu2VwSsFURTGj1DKU0Rk+WRjJVlIsZXobZSys1CSP4Bi7R+wsLCRhRVbe7K0ZicpKYqdNd/3jqkzd+bO3NFdKPOrX73OuTPn6829MyI1NX+bKbjgFn/ogDPwEB7BZdiZWhERDtqBt/AL7qbbbRiIa65hEw7CM3gMu826UkZEL+p1Gw4M1YJL8FPyQ03DVzhnamPwCS6aWimj8BQ23IYHDvaFOhANwHsm9MEbeCL6TwYRK1QPvJRsKN73SvSxD5h6IbFCJcN9odx6IbFC8T4c7A4vDdUv2rBOwnM4ntPLC+oLxQPzINnhhaF4uvZFT5qVR/ZRdCO6vY32lWl8oXzDffVCYj2+Lngh2eFJKJ5AnsQgYoUirL3DCVMbgneib/hgfhtqz22I7stnuGZq8/ANzppaKaGhtuCL6Ccm8UP0sQybdSuie3QTrsN7uC0VXpwkNFQV+M3jJ4nyd2UYZlV0o9bU1PwLvgEXF1T7EIl8YQAAAABJRU5ErkJggg==>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABRUlEQVR4Xu3TsStGURjH8UcooiQiRUpKyqAoC5tkIUURf4DFzKpkYLQoLEgWZTIxvDO7xcCgTEaTxPd5n3vve8655/VO73Z/9anbc855zrm3c0WK1CvzuMAY+gK9aK5MlREc4gTraHXGvOzgt4pPjCbzlvGMcbRjD/foSMa9nOFWbPfUKd6wjQYM4AUbtqScTjxhy6mVozseozuoT+FSKq+nzb4wkc2wza5QEuuTRRdpgyan1oMbDDq1I8k31ZzjA0NB3Ys21warQV0XV2saq3uZkfzH11crSXxxzaZ6ymuxk7ppw4PEF9dsuil2jRbCAbIv8cXa9B39QT2LXq1vTIcDZBE/mHVqLbhL6HMu6YTYaTRdeMSuUxsWO+WaU/Py33dLM4lXsR9iReziH4j/G+ei91JfvTEccKKbz2FJ7C8rUqTe+QM90UE0GsqSBwAAAABJRU5ErkJggg==>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABa0lEQVR4Xu2Tuy9EQRSHjyAhJCKEhkYkopPwH3h0RBaJ0NOoPUIhEQUl0egU4i9QUWwpNAqPQkQjUYhS6fH9nLl3Z/fuFort9ku+5M65Z86cuTPXrEa1acYFPMZd7Cl+/ccA7pvnKFdzKjKIt7hhXmwOr7ErypnBBxzCVtzBC2yLclI08c68YB224CV+4nDI6cUnXAxj0Y43uBLFUtbww7zbhFFct8L2VCxeRKiBU8ybd56i1q/MV+wIqvP6OAkOLFtUnOAb9sVBdacuVfgIN/EQ782/XYImVyqaiWug4DfmQkzb2sNH80PT1vIh719F1VlnFJ/EH1y28geXULZoNz5b9mMnRTVJ6N5mJpu/f7WSO92AZ+YHpSuSEHcqpvALx9IMsyY8D+q5iHF8t0IXpd9U6FboZ9gOY9Fv3uV8FEtpxC18wSXz01fySJwUxspZxVnz3Wlxza+I/pppnDA/nHIorvfKU36NGtXmF5CgS3/mxkzNAAAAAElFTkSuQmCC>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAAAZCAYAAADaDHeVAAAFKElEQVR4Xu2Za8hlUxjHnwlF7o1IyCW51WTKDPFByDWRjHIZSSnmw9SUaUZmcks+oNyLfHArhZQPmmIoJ8p1GhRGQ4lEFFIoI5f/7332ctZeZ6991nl7z9tL61f/9tlrr733Wv/1rNs+ZpVKpVKpVCqVHIdJV0gHSztJu0rHS9c2v2OOlu6SHjW/Z7f25RlI4xp5yMs9faySfpH+jvSjdKa0RNqeXPtTelbanZsXEHtJa8zrfZN0SPvyDKXelPgcc4+0w9o+4Rv+4SN+xtfIyz1zyinS79Z+0a/S+XEmsUL6RFoq7SHdLr0i7R3l4TdpXCMPebmHe8exwfzdN6QXxHLpN2lg/tyFxqHSy9K50oHSadKH0sVRnlJvSnzuYpH0tLmHFyTXgLJw7cn0wlxxgnnBP5U+kG4zNyOG3vWZtDJK21d6T1odpREEpHEtwD3bpAOitC64N2cCZSS4B7bwAokGfMjaQQME1es2DIASb0p9zkGQ4BN+peDr1APpwTQxgYqlBQw9YGDeuKHCaUEZTZi6LkzSU/6rgUR5BtLV7eSZMm8xD5JSb0p87mPBB9ID1l1ACvWtdIR0rPRDkxYTguCOJD1lNoG0j/nomWqxeQPMBztLz5uvO9ZJu5i/+0bp4eZ6qTclPvcxaSCxJt7fRv1D44J2BF76gvSU9Ln0lXSLtRd4uQLG6cGUnFlpekoIpKtstFLnWPcaiWf+3BxZmL4o/WVen3SjME1OlH4yL/+70r3mZQjTWs6DNL3E5z7Ih0/4lXqIr2kgkf6l9JG5f4i1HfmuifIVQeHekY5szunNmMFD6V1h6O6qSFzBroiH1KwcIZA227BSQTQKATKwYSBx3CSd3JzTaK9K39iwLvPJ6dbetNxsw85Y4k2pz32QL3Sk1EN8TcvA816yYcCHDvGcedtPBDekW2l2UJhCI3GNBuqqSFzB82y0oDBpIJVObRwfM1+DLJLWS3/Y6C4ohfpyT9pju8Swz/A/DnZYW6WLzKc0PlFQF0Z5gqnEm1Kf++jL1xXM5AufAUJH3G6+C50TQqNe35znChin5wIml54yaSARPHs2x7PMGy+sSfqg0dPemtP95t/Z+iDYCKJ413ac9L756MDuLedBml7icx99+boCKQwieHifuYfjNkWdLDbfTTBHYkggNCpHYDHYVUAK9bX5x0wWgiwIc2YxyvUxaSAF6D30InoTvQpj+Ji3X5xpijDa4F/6Pka9beb1KvWmxOc+Jg2kwArz0ZxRnaBaIm1s5RhDvNiKA4mK8dIQnRyJVr6SBljMbmrE7zDHh/MA9+xojn3MJpDoUYwczOvM73CQ9LiNBty0oLzp9yGgQdi2X2fl3pT43MdsAintiEA51v2bowCmgUekk6I0HsaHtPjBjFwswG9tzoEFLb3ksijtSvNd3+HNOWbyZfZtG/9lNgRvGAVjcoG01nz64L3A+y63+d21MUqw07k0ST9GesuGXpR4U+pzFyFwc52xK5DwcrO1Nyis6Z4w7wATQUS+Id1tvuVjbn/TRofRZdIX5sPfJea98E5rr+75zTrlNfOFJ0Z9bL4uycF/bd+bVzKIitErGWIZLcPiFfEB7xnzZ34X5aeRwnPSXjdt2JQwdbG4psHxhWntjChPqTclPqewYI7/T8MvfMM/fMSf2F/ycg/tzTmjIv4h/CWtKxjHQiFPNS84H89yOxXWH2ebG9H1pyTQM44yfxbP7DPg/0TsYa7epd6U+FypVCqVSqVSqVQqlUqlMl/8A6iJtDD0mdW7AAAAAElFTkSuQmCC>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAAAZCAYAAADaDHeVAAAFSklEQVR4Xu2ZXchmUxTH14QihGaQhnwkcjEx+ahxIclnIhlimKbkgjR3EzKamsKFuWAGpSQfF/JZLvRKQzxxQaaIjKmZkUyiUUMKaYRZv1lnzbPPes4+H2/v+3pN+1//nufss/c5+/z3f6+z9j4iBQUFBQUFBQUFfXCa8tZYWOFm5cXKo5QLlCcoVyrPSyspjlDepnxGuUF5dv30BO5W/qb8N+HPysuVS5Tbw7m/la8qj6TxPMJJynViz71GeUr99H701YZyzlOP+rRrw2PKvVLXCd3QDx3RMz1HXdrMKM5R3qN8X2yQXqyf3o9Dla9JvTPwdeUxST3+v6t8SMxwmOxr5fKkTg5rxa55fzyhuFD5h3Ikdt35huuUbyvPVR4v9vx/Km9M6vTVhmPKOU896tMu1bkJTO6XxDSkPxH0hXNN4zsjwEg3iEWb7yV/o2eVXyl3Kd9QXqs8pFbDTLBFeVxSdrtym/LEpKwJtM2JcL7yd5mfRjpcOaX8Rbm0KjtD+aNyq3JRVdZHG6LYjqrcQX3arU7KcmDs0Am9ItB1Vo3kIDR/J/kbPSnNHXT4A8f2RBNeXdeH8oj/s5HeFIvml1ZlJ4tNym/ETNJXGwwUjeCRZiTdz35QGInItkcm27sJHgnlEdMx0rFi/Y5cKDYAcwXMlN7zauU/YlGctKCvNk9Ux1Fn2hHhiHRtGGok3ijkulE/2GXaLLqM9JTyceVnYrPtYxmHcuCixPa58gg30iqZfKirpDlH4pq/Vr8kpm+JDSARgsH9L0A0+lAsAvEf5DSI5Tkj5MojqIdO6BU1RNdoJB9zUhb0g19U9e5M6g1Cl5GeVz4g47yIFRurgYuq4ybHgyhWDm6kzTJ+KCfGwCAjGRuJ3ynlsuqYZPQ95Q/KM6uyuQQz+yOxScZkI/FeUJ3row3PM6qOo2GGGMknUtQQXWMfuN47Mk7kGUtyPRZWh3mloegy0tFST649D3hZLHxfI5MdBUON1PfVxu9zYjkIA3af8i+ZXAVFIBBt4oxtIuaIC4o+uEwsMqwXu18fbdjOYCI0GWaIkXL1msxMPd8G8Im4XXnqgRrTQJeRIry+J5Q5w+TKI4YaCfNgbn6vEEt2nxYzdRtYVsfZmuMmsb21oaBfRCf6RN9yGsTynBFy5RFt9ZqMhMkxMBpuFOtv16KoE21GukMsZLJ56PD6kP++5I3tXay1oTxiqJEczB5mEbOJWYUwbOb5snu2wT3Xi624GBAHOvA8PFdfbUi6m4xAO6K/51w5DDWSY7lYNCeq8wxLlA/WagxAm5F8kFMj+attJDa4/o6fknqiy87q3uq3DdMxEjOKyMF73XO1xWL5XDTcbMEHyCcUcC0ovys57tKGaEBUSLXyfarYtgnTMVKciIB+3HugxkC4kdizSGcWWCa2aksTsFvEdm9xs4MEnA3L06tjrsPO7CfSvTPLrPQZHJEz0hqxSMl9AfdbIXO7aqNvLDoelrE+JPsk/dtkHEX6aLNQ+alYhHNwLSZs7tOVg+u17Ww3GQktN0t9gcLnmBfEJsAg4H46ykzgRpBNsi/FQhygkwzaB2LLQvY79oh9WklNh5DkKdRjtxyhtsrk97gURLmfZHxvyIPRL+7P0jT27RWxa+5O6jNIfp0462YTPD868JxMBl5xnyt3Sv25+2pzgfJbsdfMTWLbCI9K+yqKhDn9noZe6IZ+6Ig+qb7UpQ1jyTFREf2gf/dsMuOMgS18RLhS8hEGYc8SE+ESaRfgYAJ6oAvPTZRqWu311YY8j2uhddPH34KCgoKCgoKCgoKCgoKCgoK5xD7S7qTd/qtfogAAAABJRU5ErkJggg==>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAA4UlEQVR4Xu3SsQtBURTH8SMMZCCDZJCymK2yGUkWym4yGVgtNguLf0IZrAaTv4KiZDMaJPG93ru69/WYDX71Wc65r3M6PZGfTwBJxL0Nv4zxcPU8vY9p4IaSt/EpU+yR8dR9E8Mac4Tsln8KOGOAFKooI2w+MlPDHSvM0MIGS0SMd++o/dUHTXHOq6KmHZDWj3T0/guxVxhhJ86KVsz9db4eQe1/Ffv+RVzQNmrvqNF7se8/xBE5VNDRDb/RZi2KCfJuT7I4oasL4lypj604H9WN3quZQNAsulF/rZr2z4/lCbTFJhO8bMfAAAAAAElFTkSuQmCC>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABQklEQVR4Xu2Uq0sFQRSHj2gQFXwgiI9kEwSD2owGLbd5QW6/RsEi2MVit4hisIhgEEHEZPU/EKw3GkQtBv0OM+d67uBjdxAEuR98MDtzdnfmN7Mr0uavWca3Aj7jbLynNEf4igtJfyfWsYFTyVghBvEW73EkGVOG8QJH04EizOAjnmJX7OvA3tjWh+9hX7wuRU1CrhuuTyPYlfCSAVyJ7dLsS2vemvMOrjUrMrG8dea6aU+x/YLzri4LPV56zHzeGsm1hKyNMbyRMIFJ1/8tlvem6/N5exbxSgpu7E9H0NON57glYY+OcaKlIuGzSL5iHO9wVcKKdKV+tU10eZqd/7wf8BKHXJ3HR6IPP5RfOE2GznI7tjVC3dzpj+F8NLITrMTrJTzDOaxaUS42UzuC+pIDXMd+K8rF/2eMHglfcpv/zDt/yD4zocx+KwAAAABJRU5ErkJggg==>

[image46]: <data:image/png;base64,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>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAYAAADhVZELAAADu0lEQVR4Xu2YS6hNURjHP6E884yESCghJCSPrjIgkTxKMSMiE48yMLmRvMkrlAhJykSIJGRCGWDATF0SMaCEkjz+v9Ze56z73X3uOTfXidv517+zz/7WWXut7/Ff3z5mNdTQVtFD7OhvlkF7sZfYzhvaAuaJ+y3fKd3EfhYc4IEzNokbsusWYa74qwJ+ESdmv6kWJoh3LWw8xSzxm4V13Ra7NjYXgCPPiYu9oVKcFb+L0919orBafCOOcra/ic7iFXGZN2QYJL4Wd3iDwxjxgTjYG8qB2nskvhD7OxvoK14XB3jDX8Qc8anlrwfMFn+IC7zBoYN4Uax398tinPhJvGxhEkAdxrTEKcct1HA1wLPPiIe9IcEW8a04zBtysNxC0Al+xeBH1OfG5B6lss/CAnuKS7PraoAgPBMXeUOGThYy956FsXXifLFPcUgjEPSX4iRvaA6nrLGeoCM7xTWFEdUFgv4q+8zDQLFBfCxetRBUsuqdOLo4rADKHqeUcnITRD0hUxDTz9n1V2uhZ1sRRL250kBPfloIJoIMcCAnJL/1oOzvWSi5ihAnS/WE0uGoIzXBTPGjhROqGmBjRLaUsLO59+KI5B5ZzjFNi+ERnVLupCog6knqxVRPIki9f8EpqZ6kwt+c8EankFllEVXe9yc0Pb4hYqH/glOinqRRj5tOsz1Fi8qnXH+SgoUiapvFa+I6K9bzQvGAeFJca8WWfKS4W9wlnhfHWggEWcf3C+K0bGwKAoS+cWp4xDJJ+5OpFjSQRo/u96DYJbHHfaana0nk6Ukp4JT7Fl7OwHoLvQvfb1h4IBs+Iq7Mxhy1olizCZ7HJ603jhsu3rKmAaF8cQqC6pFXJuk95ACmoPsl8HnzFYCRh6bvNh/Em2LvZFwKXz5s8LkVF8fGGEP0Y5rWWxBEMmiKBUcQAMYsEVeID63p0RvT3bcEtAqXLKwzZimYbOEIZ+491vTlkeyi76H0WhV5TmnIPo9lpHnCIdEp6FKdeMhCD8EcnGqV1Ha95WcwDkNsPbjH8/MazHoLrb6f648RsyA+lHcTUn+G+MSKoogAbrOQwlutWBroCM6g7NIF8iY8NLtOQWkx7xhvaCFw1B0L62x18L/GaQsb462ZiI+3oCm8ze61ILJ8kqpckz2kMwKI/iC0pD3dJ99XWfi/w6d7xCYLAp4X/UpBiZ6w0s9oFTA5uuMXyvuRT2uyodQ/YIxN+4w88CyEe7E3VAiyjUNgiDf870CXtlt+U9YculsoZU6eGmqooYaq4jeQsrc8vlF7AQAAAABJRU5ErkJggg==>

[image48]: <data:image/png;base64,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>

[image49]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAAAZCAYAAAC4j5m6AAAD9klEQVR4Xu1YW6hNURSdNxQhzzyKuBL5I68IX4g884iQR4SUUkLkQ8mPiFxRUvgQccuXL8WVD0r58vghkRLCD4XyGOPOs+6Ze+29z1nLOeV07VGjfc7aa+8151hzzbnWFilQ4H9EEzgAHFq68n+BcPQS1W4Q2MW7VxF88CZ4GdwDdk/eLlAF88Fz4G3RCQgGhb8k6YcY+VPBU+AZcIGEz2gPcI2oQUfAYcnb7VgJThcdn2MxYtaB422nCHDMjWBfr70SrJ1HwbHJ2+0ItfOwpDWsiCzhOcBe8C7YLJqCuCJoYDfTLwtDRJ87KSr4QvAlOMP06QpeA397vA72Mf2qoT+4CrwIfgZfSbjzHOeWqGDUgEI+BZebPjF21kX4ieA7SYo1StSxeabNBw09Dz4DB5t2Rv0DSRrLfo/B12CrxK0oBwq/BJwEXpU44feBD8F+pm2tpG0PtbMuwlMo34ne4D3wguQX4HHgR7BN9L0Oi8Bf4GzT1iI6wfUCffBtzgPFpuh8xmIy+AVcbNpC7axZeBZXFlvfCfZrk3SUWNDAr5ItPJcoo8wh1KFQxAjvAsQX3tnPwHMItbNm4Z3AvhN57RbVhOeydTgNngAfgW/A++AEcz8WMcI7O/OEt+2hdtYsPK90wHciRHjmcOZypiSmJgdGEIW3DjFl7ZdyvuRO4RM4paNHHGKEd4EQInyonTULz8LyQtJOhAhPcFfwQXQrSowULVi+o5wYW6S4A2JEXREt0rGIEZ57b98eIkv4UDtrFj5P4Lx2H02iW8jnon1vgNskneN9uJXGSbe7ilDECJ8lcKV2izw7axaes9gqaSec8H4aCQGFt7uaTaX/2zt6lB3yxw1FjPDcGr+VtMBO+AOl/zF21iw8wchk1Wf1dxgIPhE9yTrwMDWidHXYKTo5bCeaRPOk3cfz/VwB1iG3hNukXJi5xHlSDPmMUUl4304XRNy92XczMH6UrkSonURdhB8t+vLVpm0m+B6cZtqOixp2yLTxXd+l3I9FiNFl98a8x92CnTCeQL9J8uS4WfT9fj7NAselzRTGR5adLJI8FDWX/jNAKJ4NkFA7iboITywTPepvBTeIHqd3SPLwtEs0QqwRFJh9t4AHRcVYL8nn+Hs3eEdUXK4irjD//dx90EnmU98+gquBq4uHHgpL/hQd00Zplp0U86yoDUtFheOKtt9gQu0k6iY8MUDUeZK/Q8Giw2fmgj29exbDRZ1mP//bhwNTQYv8XcGtBoo3BlwBzpL871AhdtZV+EYAU8ExqZ5q/jU6lfAsrhR9jn+jAdGphKdN/Pro59NGRLTwzMH8pMoKz2ulnFwgDRZxasciz2JfoECBAo2AP0ewDMx8hBTcAAAAAElFTkSuQmCC>
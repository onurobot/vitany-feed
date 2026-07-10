# VITANY® · İçerik Planı Feed Önizleme

Müşterinin bir linke tıklayıp içerik planını gerçek bir Instagram profili gibi
görebileceği statik site. Her `public/media/<klasör>` bir gönderiye dönüşür ve
tip **içeriğe göre** otomatik belirlenir:

| Klasör içeriği            | Gönderi tipi |
|---------------------------|--------------|
| 1 görsel                  | **Post**     |
| 2+ görsel                 | **Carousel** |
| en az 1 video             | **Reels**    |

Caption'lar, bölümler ve profil bilgisi `content.json` içinde tutulur.

## Klasör yapısı
```
vitany-feed/
├─ content.json              → bio + 9 postun caption'ı (düzenlenebilir)
├─ scripts/generate-manifest.js
├─ public/
│  ├─ index.html             → müşterinin gördüğü sayfa
│  ├─ logo.svg               → profil görseli (gerçek logoyla değiştir)
│  └─ media/
│     ├─ 01-teaser/          → 01. gönderinin görselleri
│     ├─ 02-sculpt-detay/
│     └─ ... 09-sokak/
└─ vercel.json
```

## 1) Medyayı ekle
Masaüstündeki `vitany content plan` klasöründeki görselleri ilgili numaralı
klasöre kopyala. Dosya sırası önemliyse `1.jpg, 2.jpg, 3.jpg` diye adlandır
(carousel sırası bu şekilde belirlenir). Reels için `.mp4` koyman yeterli.

> Klasör adındaki sayı (01, 02…) gönderi numarasına eşlenir; adın gerisi serbest.

## 2) Logo
`public/logo.svg` yerine gerçek logoyu `public/logo.jpg` olarak koy ve
`content.json` içindeki `"avatar": "logo.svg"` değerini `"logo.jpg"` yap.

## 3) Yerel önizleme
Statik sunucu gerekir (dosyayı çift tıklamak `feed.json`'u okuyamaz):
```bash
npm run build          # feed.json üretir
npx serve public       # veya: python3 -m http.server -d public 8080
```

## 4) Vercel'e yayınlama

**Seçenek A — GitHub + Vercel (önerilen)**
1. Bu klasörü bir GitHub reposuna push et.
2. vercel.com → *Add New → Project* → repoyu import et.
3. Framework: **Other**. Ayarlar `vercel.json`'dan otomatik gelir
   (Build: `npm run build`, Output: `public`). **Deploy**.
4. Her `git push` yeni görselleri otomatik yayınlar.

**Seçenek B — Vercel CLI**
```bash
npm i -g vercel
vercel            # önizleme linki
vercel --prod     # canlı link
```

## Notlar
- Instagram verileri (30 B takipçi, 2 takip, "Vitaniate your potential.")
  `content.json → profile` içine gerçek hesaptan alınarak yazıldı; istediğin an
  güncelleyebilirsin.
- Görsel eklenmeden de site, bölüm renklerinde placeholder'larla açılır —
  yani boş repoda bile sunulabilir.

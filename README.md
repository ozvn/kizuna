# Kizuna — Cozy Shared Pet (Mochi)

Ortak sanal pet PWA. React + Vite + TypeScript + Tailwind CSS + Supabase.

## Kurulum

```bash
npm install
cp .env.example .env
# .env dosyasına Supabase URL ve anon key ekleyin
npm run dev
```

## Supabase Kurulumu

1. [Supabase](https://supabase.com) projesi oluşturun
2. **SQL Editor** → `supabase/schema.sql` dosyasını çalıştırın
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
4. (Geliştirme için önerilir) **Authentication → Providers → Email** → "Confirm email" kapalı bırakılabilir
5. Project Settings → API'den URL ve anon key'i `.env` dosyasına ekleyin

## Netlify Dağıtımı

```bash
npm run build
```

Netlify'da environment variables olarak `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ekleyin.

## Özellikler

- PWA (offline destek, ana ekrana ekleme)
- Supabase Auth (kayıt/giriş)
- Arkadaş eşleşme (matchmaking)
- Gerçek zamanlı ortak pet senkronizasyonu
- Atomik bakım eylemleri (feed, pet, clean, play)
- Aavegotchi tarzı BRS nadirlik sistemi
- Web Audio API chiptune ses ve Animalese konuşma
- 3 evrim evresi (Bebeklik, Gençlik, Kadimlik)

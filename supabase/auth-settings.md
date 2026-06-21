# Supabase Auth Ayarları

## E-posta doğrulamayı kapat (şimdilik)

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen
2. **Authentication** → **Providers** → **Email**
3. **Confirm email** → **OFF** (kapalı)
4. **Save**

Kayıt sonrası kullanıcı **hemen giriş yapabilir**; doğrulama maili gitmez.

### URL ayarı

**Authentication → URL Configuration**

| Alan | Geliştirme | Canlı |
|------|------------|-------|
| Site URL | `http://localhost:5173` | `https://senin-domain.com` |
| Redirect URLs | `http://localhost:5173/**` | `https://senin-domain.com/**` |

---

## E-posta doğrulamayı tekrar aç (ileride)

1. **Authentication → Providers → Email** → **Confirm email** → **ON**
2. Proje `.env` dosyasına ekle:
   ```env
   VITE_REQUIRE_EMAIL_CONFIRMATION=true
   ```
3. Dev sunucusunu yeniden başlat: `npm run dev`
4. (İsteğe bağlı) **Email Templates** → `supabase/email-templates/confirmation.html`

---

## Kullanıcı adı ile giriş (SQL)

SQL Editor'de bir kez çalıştır: `supabase/migrations/add_login_by_username.sql`

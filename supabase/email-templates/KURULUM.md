# Kizuna E-posta Şablonları

Supabase auth mailleri **Dashboard üzerinden** düzenlenir. Aşağıdaki dosyaları ilgili şablona yapıştır.

## Adımlar

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen
2. **Authentication** → **Email Templates**
3. Her şablon için **Subject** ve **Body (HTML)** alanlarını güncelle

## URL ayarı (önemli)

**Authentication → URL Configuration**

| Alan | Değer |
|------|--------|
| Site URL | `http://localhost:5173` (prod: kendi domain'in) |
| Redirect URLs | `http://localhost:5173/**` |

## Şablon eşleştirmesi

| Supabase şablonu | Konu dosyası | HTML dosyası |
|------------------|--------------|--------------|
| **Confirm signup** | `confirmation-subject.txt` | `confirmation.html` |
| **Magic Link** | `magic-link-subject.txt` | `magic-link.html` |
| **Reset Password** | `reset-password-subject.txt` | `reset-password.html` |
| **Invite user** | `invite-subject.txt` | `invite.html` |

## Gönderen adı (isteğe bağlı)

**Project Settings → Authentication → SMTP Settings** veya varsayılan mail için:

**Authentication → Email** bölümünde sender name:
`Kizuna`

## Değişkenler

Şablonlarda Supabase'in Go template değişkenleri kullanılır — silme:

- `{{ .ConfirmationURL }}` — doğrulama / giriş linki
- `{{ .SiteURL }}` — site adresi
- `{{ .Email }}` — kullanıcı e-postası

## Test

1. Uygulamadan yeni kayıt ol veya "Doğrulama e-postasını tekrar gönder"
2. Gelen mailde Türkçe Kizuna tasarımını kontrol et
3. Butona tıkla → `localhost:5173` açılmalı ve oturum oluşmalı

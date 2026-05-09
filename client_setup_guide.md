# 🚀 Kaze POS — Panduan Setup untuk Client

> Panduan ini menjelaskan cara menyiapkan Kaze POS untuk setiap client baru dari nol, mulai dari database, web, hingga instalasi desktop.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SITE                          │
│                                                         │
│  ┌──────────────┐    ┌───────────────┐                  │
│  │   Vercel      │    │  Electron App │                  │
│  │  (Web/PWA)   │    │  (Desktop)    │                  │
│  │  kaze-abc    │    │  Kaze-POS-    │                  │
│  │  .vercel.app │    │  Setup.exe    │                  │
│  └──────┬───────┘    └──────┬────────┘                  │
│         │                   │                           │
│         └────────┬──────────┘                           │
│                  ▼                                       │
│         ┌────────────────┐                              │
│         │   Supabase     │                              │
│         │ (Database &    │                              │
│         │ Realtime API)  │                              │
│         │ 1 PROJECT PER  │                              │
│         │    CLIENT      │                              │
│         └────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Setiap client HARUS punya Supabase project sendiri** (database terpisah). Jangan share satu database untuk banyak client — data mereka akan bercampur!

---

## 📋 Checklist Setup per Client

- [ ] 1. Buat Supabase Project baru
- [ ] 2. Jalankan SQL Schema
- [ ] 3. Set RLS (Row Level Security)
- [ ] 4. Clone & konfigurasi `.env`
- [ ] 5. Deploy ke Vercel
- [ ] 6. Build installer Electron (opsional)
- [ ] 7. Serahkan ke client

---

## STEP 1 — Setup Supabase (Database)

### 1.1 Buat Project Baru
1. Buka [supabase.com](https://supabase.com) → Login
2. Klik **"New Project"**
3. Isi:
   - **Name**: `kaze-pos-[nama-toko]` (contoh: `kaze-pos-warung-sari`)
   - **Database Password**: buat password kuat, simpan!
   - **Region**: pilih yang dekat client (Asia Southeast)
4. Tunggu ±2 menit hingga project siap

### 1.2 Jalankan SQL Schema

Buka **SQL Editor** di Supabase → Klik **"New Query"** → Paste SQL berikut → Klik **Run**:

```sql
-- ===================================
-- KAZE POS — DATABASE SCHEMA
-- Jalankan di SQL Editor Supabase
-- ===================================

-- TABLE: settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name text DEFAULT 'Kaze POS',
  store_address text DEFAULT '',
  tax_rate integer DEFAULT 11,
  member_discount integer DEFAULT 5,
  primary_color text DEFAULT '#6366f1',
  is_customer_display_on boolean DEFAULT true,
  welcome_text text DEFAULT 'Selamat Datang / Welcome',
  qris_image text DEFAULT '',
  display_template text DEFAULT 'classic',
  points_enabled boolean DEFAULT false,
  points_per_rupiah integer DEFAULT 1000,
  points_value integer DEFAULT 500,
  is_dark boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.settings (store_name) VALUES ('Kaze POS')
ON CONFLICT DO NOTHING;

-- TABLE: products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  category text DEFAULT 'Umum',
  variants text DEFAULT '',
  image text DEFAULT '',
  barcode text DEFAULT '',
  cost integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- TABLE: members
CREATE TABLE IF NOT EXISTS public.members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text DEFAULT '',
  points integer DEFAULT 0,
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- TABLE: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  total integer NOT NULL DEFAULT 0,
  subtotal integer DEFAULT 0,
  tax integer DEFAULT 0,
  discount integer DEFAULT 0,
  points_redeemed integer DEFAULT 0,
  points_discount integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  "customerName" text DEFAULT 'Umum',
  member_phone text DEFAULT NULL,
  payment_method text DEFAULT 'Cash',
  items jsonb DEFAULT '[]',
  notes text DEFAULT '',
  status text DEFAULT 'preparing',
  cashier_name text DEFAULT 'Admin',
  captain_name text DEFAULT 'Self',
  created_at timestamptz DEFAULT now()
);

-- TABLE: shifts
CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cashier_name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  starting_cash integer DEFAULT 0,
  expected_cash integer DEFAULT 0,
  actual_cash integer DEFAULT 0,
  difference integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ===================================
-- ENABLE REALTIME
-- ===================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ===================================
-- RLS (Row Level Security) — DISABLE untuk internal use
-- Aktifkan RLS lalu buat policy anon access
-- ===================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anon read/write (untuk aplikasi POS lokal)
CREATE POLICY "Allow anon all" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON public.shifts FOR ALL USING (true) WITH CHECK (true);
```

### 1.3 Ambil Credentials

Di Supabase Project → **Settings** → **API**:
- Salin **Project URL** → `VITE_SUPABASE_URL`
- Salin **anon public key** → `VITE_SUPABASE_ANON_KEY`

---

## STEP 2 — Konfigurasi Kode

### 2.1 Edit `.env`

Buka file `.env` di root project, ubah isinya:

```env
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...KEY_CLIENT_DISINI...
```

> [!TIP]
> Untuk efisiensi, buat file `.env.client-abc` per client. Sebelum build, copy ke `.env`:
> ```bash
> copy .env.warung-sari .env
> npm run build
> ```

---

## STEP 3 — Deploy Web ke Vercel

### 3.1 Cara Pertama: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI (sekali saja)
npm i -g vercel

# Login
vercel login

# Deploy ke production
vercel --prod
```

Saat ditanya, isi:
- **Project name**: `kaze-pos-warung-sari`
- **Framework**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

**Env vars di Vercel**: Masuk ke dashboard Vercel → Project → **Settings** → **Environment Variables** → tambahkan:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3.2 Cara Kedua: Via GitHub (Auto Deploy)

1. Push kode ke GitHub repo baru (satu repo per client, atau branch per client)
2. Di [vercel.com](https://vercel.com) → **Add New Project** → Import repo
3. Tambahkan environment variables
4. Deploy!

### 3.3 Custom Domain (Opsional)

Di Vercel → Domains → tambahkan domain client, misal:
- `pos.warunglsari.com` → Vercel akan kasih instruksi DNS-nya

---

## STEP 4 — Build Installer Desktop (Electron)

Jika client mau pakai versi desktop (.exe):

```bash
# Pastikan .env sudah diisi dengan credentials client
npm run dist
```

File installer akan ada di: `dist_electron\Kaze-POS-Setup-2.1.0.exe`

Kirim file `.exe` ini ke client, mereka tinggal double-click untuk install.

> [!NOTE]
> Versi desktop tetap butuh internet untuk konek ke Supabase. Bedanya dengan web, versi desktop bisa buka multi-window (Kasir + Customer Display + Kitchen Display) otomatis.

---

## STEP 5 — Apa yang Diserahkan ke Client

### Paket Web (SaaS)
| Item | Keterangan |
|------|-----------|
| URL Aplikasi | `https://kaze-pos-xxx.vercel.app` |
| URL Customer Display | `URL/#customer-view` |
| URL Kitchen Display | `URL/#kitchen-view` |
| Supabase Dashboard | Login Supabase (bisa bikin akun sendiri atau titipkan) |

### Paket Desktop
| Item | Keterangan |
|------|-----------|
| File Installer | `Kaze-POS-Setup-2.1.0.exe` |
| URL Customer Display | Otomatis buka di layar kedua |
| Supabase Dashboard | Untuk backup & monitoring data |

---

## ⚙️ Pengaturan Awal untuk Client

Setelah aplikasi terbuka, minta client untuk langsung:

1. **Buka Settings → Informasi Toko**
   - Ubah Nama Toko
   - Isi Alamat Toko

2. **Settings → Keuangan & Pajak**
   - Set Persentase Pajak (PPN 11% atau 0%)
   - Upload foto QRIS (jika pakai QRIS manual)

3. **Tab Stok** → Tambah produk pertama

---

## 💰 Model Bisnis Saran

| Model | Cara | Harga Supabase |
|-------|------|---------------|
| **Per Client DB** | 1 Supabase project / client | Free (500MB, cukup untuk UMKM) |
| **SaaS Bulanan** | Client bayar langganan, Ali maintain server | Free tier aman s/d ~50 client aktif |
| **Jual Putus** | Client dapat installer + setup sendiri | Gratis selamanya |

> [!TIP]
> **Supabase Free Tier** cukup untuk 1 toko UMKM:
> - 500MB database (jutaan transaksi)
> - 2GB bandwidth
> - Realtime connections unlimited
> 
> Upgrade ke **Pro ($25/bln)** hanya jika storage habis atau butuh backup otomatis.

---

## 🔒 Keamanan Penting

> [!WARNING]
> **JANGAN** pernah share `ANON_KEY` satu client ke client lain. Setiap client harus punya key masing-masing dari project Supabase mereka sendiri.

> [!CAUTION]
> File `.env` berisi credentials rahasia. Jangan push ke GitHub public. Pastikan `.env` sudah ada di `.gitignore`.

---

## 🛠️ Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| Data tidak tersimpan | Cek koneksi internet & credentials `.env` |
| Realtime tidak sync | Cek apakah Realtime sudah enabled di Supabase |
| App blank/error | Buka browser DevTools (F12) → lihat error di Console |
| Customer Display tidak muncul | Buka URL + `#customer-view` di browser terpisah |
| Installer gagal install | Jalankan sebagai Administrator |

---

*Kaze POS — Setup Guide v2.1.0*

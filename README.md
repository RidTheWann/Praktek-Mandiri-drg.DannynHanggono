# Praktek Mandiri

![Vercel Deploy](https://vercel.com/button)

Aplikasi Praktek Mandiri drg. Danny Hanggono untuk manajemen data pasien.

## Fitur

- Pencatatan data kunjungan pasien
- Sinkronisasi data dengan Google Sheets
- Penyimpanan data di database PostgreSQL
- Statistik kunjungan harian
- Pencarian data pasien

## Teknologi

- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express
- Database: PostgreSQL (Neon)
- Integrasi: Google Sheets API

## Konfigurasi

Aplikasi ini menggunakan file `.env` untuk konfigurasi. Salin `.env.example` ke `.env` dan sesuaikan nilai-nilai berikut:

```
# Database connection string (PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Google Sheets API endpoint
GOOGLE_SHEETS_URL=https://script.google.com/macros/s/your-script-id/exec

# Google Sheets ID
SPREADSHEET_ID=your-spreadsheet-id

# Google Service Account credentials (JSON format)
GOOGLE_CREDENTIALS={ "type": "service_account", "project_id": "your-project-id", ... }
```

## Pengembangan

1. Install dependencies:
   ```
   npm install
   ```

2. Jalankan server pengembangan:
   ```
   npm run dev
   ```

3. Build untuk produksi:
   ```
   npm run build
   ```

## Deployment

Deploy otomatis ke Vercel dengan push ke branch utama. Pastikan environment variable sudah diatur di dashboard Vercel.

1. Klik tombol deploy di bawah untuk deploy instan:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/username/repo)

2. Atau clone repo dan deploy manual:

```bash
git clone https://github.com/username/repo.git
cd repo
vercel
```

## Best Practices
- Gunakan environment variable, jangan hardcode credential.
- Pastikan file `.env` tidak di-commit.
- Struktur folder konsisten dan modular.
- Tambahkan komentar pada kode penting.
- Gunakan branch untuk fitur/bugfix.

## Struktur Proyek

- `/api` - API endpoints dan logika backend
- `/client` - Aplikasi frontend React
- `/shared` - Kode yang digunakan bersama antara frontend dan backend
- `/goggle-app-script` - Script Google Apps Script untuk integrasi Google Sheets

## Google Apps Script

File `goggle-app-script/Kode.gs` berisi script yang perlu diupload ke Google Apps Script untuk mengaktifkan integrasi dengan Google Sheets. Script ini menangani operasi CRUD pada spreadsheet.

## Vercel Deployment Best Practices

- Pastikan semua variabel lingkungan (DATABASE_URL, GOOGLE_SHEETS_URL, SPREADSHEET_ID, GOOGLE_CREDENTIALS) diatur di dashboard Vercel (Project Settings > Environment Variables).
- Semua endpoint API di folder `/api` hanya boleh menggunakan file `.js` (bukan `.ts`). File `.ts` dan file yang memakai modul `fs`, `path`, atau akses file lokal harus diabaikan (lihat `.vercelignore`).
- Untuk backend, hanya gunakan Postgres/Google Sheets. Fallback ke `storage.js` (local JSON) hanya untuk development lokal.
- Build client dengan `npm run build` (output di `/dist`).
- Deploy: push ke GitHub, lalu hubungkan ke Vercel, atau gunakan `vercel` CLI.
- Jika ada error deployment, cek log di dashboard Vercel dan pastikan tidak ada import dari file yang diabaikan.
- Untuk pengembangan lokal, gunakan `.env` di root. Untuk production, gunakan Environment Variables di Vercel.
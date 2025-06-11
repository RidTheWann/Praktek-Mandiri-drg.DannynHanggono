# Scripts Utilitas untuk Praktek Mandiri

Folder ini berisi script utilitas untuk membantu pengelolaan data di aplikasi Praktek Mandiri.

## Export Google Sheets ke Database

### 1. Export ke MongoDB

Script `export-sheets-to-mongo.js` digunakan untuk mengekspor data dari Google Sheets ke MongoDB.

```bash
node scripts/export-sheets-to-mongo.js
```

### 2. Export ke PostgreSQL (Neon)

Script `export-sheets-to-postgres.js` digunakan untuk mengekspor data dari Google Sheets ke database PostgreSQL di Neon.

```bash
node scripts/export-sheets-to-postgres.js
```

## Konfigurasi

Sebelum menjalankan script, pastikan variabel lingkungan berikut sudah diatur di file `.env`:

```
SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_CREDENTIALS={ ... your google service account credentials ... }
DATABASE_URL=postgres://user:password@host/database
```

## Format Google Sheets

Script ini akan mencari sheet dengan nama format "[Bulan] [Tahun]" (contoh: "Januari 2025").

Format kolom yang diharapkan:
- Tanggal Kunjungan (format: YYYY-MM-DD)
- Nama Pasien
- No.RM
- Kelamin (L/P)
- Obat (Yes/No atau deskripsi)
- Cabut Anak (Yes/No atau deskripsi)
- Cabut Dewasa (Yes/No atau deskripsi)
- Tambal Sementara (Yes/No atau deskripsi)
- Tambal Tetap (Yes/No atau deskripsi)
- Scaling (Yes/No atau deskripsi)
- Rujuk (Yes/No atau deskripsi)
- Biaya (BPJS/UMUM atau deskripsi)
- Lainnya (teks bebas)

## Proses Transformasi Data

Script akan melakukan transformasi berikut:
1. Mengambil data dari semua sheet yang cocok dengan format nama bulan+tahun
2. Memfilter baris dengan "Tanggal Kunjungan" valid dan "Nama Pasien" tidak kosong
3. Menggabungkan kolom tindakan (Obat, Cabut Anak, dll) menjadi array actions
4. Menyesuaikan format data dengan schema database
5. Melakukan deduplikasi berdasarkan tanggal dan nomor rekam medis
6. Menyimpan data ke database
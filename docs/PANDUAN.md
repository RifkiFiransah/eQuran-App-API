# Panduan Penggunaan e-Quran API

Dokumen ini menjelaskan cara menjalankan, menggunakan, dan menguji e-Quran API dari awal.

## 1. Persiapan

Pastikan Node.js 18 atau lebih baru sudah terpasang.

```bash
node --version
npm --version
```

Install dependency:

```bash
npm install
```

Buat file environment:

```powershell
Copy-Item .env.example .env
```

Ganti nilai `JWT_SECRET` di `.env` dengan string acak yang panjang, misalnya hasil dari:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## 2. Menjalankan Server

```bash
npm start
```

Untuk development dengan reload otomatis:

```bash
npm run start-dev
```

Output yang diharapkan:

```text
Server berjalan pada: http://0.0.0.0:5000
```

Buka `http://localhost:5000/health` untuk memastikan server hidup.

## 3. Alur Penggunaan Dasar

### 3.1 Registrasi

```powershell
$body = @{
  name = 'Pengguna Baru'
  email = 'pengguna@example.com'
  password = 'password123'
} | ConvertTo-Json

$register = Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/auth/register `
  -ContentType 'application/json' `
  -Body $body

$token = $register.data.token
$headers = @{ Authorization = "Bearer $token" }
```

### 3.2 Login

```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/auth/login `
  -ContentType 'application/json' `
  -Body (@{
    email = 'pengguna@example.com'
    password = 'password123'
  } | ConvertTo-Json)

$headers = @{ Authorization = "Bearer $($login.data.token)" }
```

### 3.3 Ambil Data Quran

```powershell
Invoke-RestMethod http://localhost:5000/quran/surat?limit=5
Invoke-RestMethod http://localhost:5000/quran/surat/1
Invoke-RestMethod http://localhost:5000/quran/surat/1/tafsir
```

### 3.4 Tambah Surat Lokal

```powershell
$surat = @{
  nomor = 1
  nama = 'Al-Fatihah'
  jumlahAyat = 7
  turun = 'mekah'
  arti = 'Pembukaan'
  deskripsi = 'Surat pembuka Al-Quran.'
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/surats `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $surat

$suratId = $created.data.surat.id
```

### 3.5 Lihat, Ubah, dan Hapus Surat Lokal

```powershell
Invoke-RestMethod http://localhost:5000/surats
Invoke-RestMethod "http://localhost:5000/surats/$suratId"

Invoke-RestMethod -Method Put `
  -Uri "http://localhost:5000/surats/$suratId" `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body (@{ nama = 'Al Fatihah' } | ConvertTo-Json)

Invoke-RestMethod -Method Delete `
  -Uri "http://localhost:5000/surats/$suratId" `
  -Headers $headers
```

## 4. Format Respons

Respons sukses:

```json
{
  "status": "success",
  "message": "Daftar surat berhasil diambil",
  "data": {}
}
```

Respons gagal:

```json
{
  "status": "fail",
  "message": "Surat tidak ditemukan"
}
```

Respons validasi:

```json
{
  "status": "fail",
  "message": "Validasi gagal",
  "errors": [
    "\"nomor\" must be less than or equal to 114"
  ]
}
```

Kode status yang digunakan:

| Kode | Arti |
| --- | --- |
| 200 | Berhasil |
| 201 | Data berhasil dibuat |
| 400 | Validasi request gagal |
| 401 | Token tidak ada atau tidak valid |
| 404 | Data atau endpoint tidak ditemukan |
| 409 | Duplikasi data, misalnya email atau nomor surat |
| 502 | Layanan equran.id gagal dihubungi |

## 5. Autentikasi

- Kirim token pada header `Authorization: Bearer <token>`.
- Token default berlaku 24 jam.
- Endpoint baca bisa diakses tanpa token.
- Endpoint tulis surat memerlukan token.
- Jika token kedaluwarsa, login ulang untuk mendapatkan token baru.

## 5.1 Dokumentasi API dengan Swagger

Swagger UI tersedia setelah server berjalan:

```text
http://localhost:5000/docs
```

Langkah mencoba endpoint dari Swagger:

1. Jalankan register atau login lewat Swagger atau terminal.
2. Salin nilai `data.token`.
3. Klik tombol **Authorize** di kanan atas Swagger UI.
4. Isi dengan `Bearer <token>`, lalu klik **Authorize** dan **Close**.
5. Buka endpoint yang diinginkan, klik **Try it out**, isi parameter, lalu **Execute**.

Spesifikasi OpenAPI dapat diakses di:

```text
http://localhost:5000/openapi.json
```

File tersebut bisa diimpor ke Postman, Insomnia, atau tool lain yang mendukung OpenAPI 3.

## 6. Pengujian

### 6.1 Test Otomatis

```bash
npm test
```

Test memakai mock equran.id sehingga tidak membutuhkan internet.

### 6.2 Smoke Test

Terminal pertama:

```bash
npm start
```

Terminal kedua:

```bash
npm run smoke
```

Smoke test membuat user baru, menguji seluruh endpoint utama, lalu menghapus surat uji yang dibuat.

Jika port berbeda:

```bash
npm run smoke -- -BaseUrl http://localhost:5000
```

### 6.3 Postman

Panduan lengkap ada di [POSTMAN.md](POSTMAN.md).

## 7. Reset Data Lokal

Semua user dan surat lokal tersimpan di folder `data` sesuai `DATA_DIR`.

Hentikan server, lalu hapus folder data:

```powershell
Remove-Item -Recurse -Force data
```

Folder akan dibuat ulang otomatis saat server dijalankan.

## 8. Troubleshooting

| Masalah | Penyebab | Solusi |
| --- | --- | --- |
| `EADDRINUSE` | Port sudah dipakai | Ganti `PORT` atau hentikan proses lain |
| 502 pada endpoint Quran | equran.id tidak dapat dihubungi | Cek koneksi internet atau `EQURAN_API_BASE_URL` |
| 401 | Token tidak dikirim atau kedaluwarsa | Login ulang dan pakai token terbaru |
| 409 | Email atau nomor surat sudah ada | Pakai data lain atau hapus data lama |
| Response lambat pada Quran | Cache belum terisi | Request pertama memang lebih lambat |
| Script PowerShell diblokir | Execution policy | Jalankan lewat `npm run smoke` atau tambahkan `-ExecutionPolicy Bypass` |

## 9. Catatan Produksi

- Set `NODE_ENV=production`.
- Wajib set `JWT_SECRET` yang kuat.
- Batasi `CORS_ORIGINS` ke domain frontend.
- Gunakan HTTPS melalui reverse proxy seperti Nginx.
- Backup folder `data` secara berkala atau migrasikan ke database jika trafik meningkat.

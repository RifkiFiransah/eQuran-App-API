# e-Quran API

e-Quran API adalah backend REST API untuk aplikasi Al-Quran yang dibangun dengan Node.js, Hapi, dan Joi. API ini mem-proxy data 114 surat, detail ayat, dan tafsir dari equran.id dengan cache dan timeout, sekaligus menyediakan CRUD surat lokal yang tersimpan permanen dalam berkas JSON. Keamanan ditangani melalui autentikasi JWT, password hashing bcrypt, validasi payload, dan pembatasan endpoint tulis. Proyek dilengkapi test otomatis, smoke test PowerShell, serta Postman collection dan environment untuk pengujian seluruh endpoint.

## Fitur

- Proxy data 114 surat, detail ayat, dan tafsir dari equran.id dengan cache dan timeout
- CRUD surat lokal yang tersimpan permanen di berkas JSON
- Autentikasi JWT: register, login, dan profil pengguna
- Validasi request dengan Joi dan format respons yang konsisten
- Filter, pencarian, dan pagination pada daftar surat
- Dokumentasi interaktif Swagger UI di `/docs` dan spesifikasi OpenAPI di `/openapi.json`
- Alias endpoint lama (`/surat`) untuk kompatibilitas
- Test otomatis, smoke test PowerShell, dan Postman collection

## Teknologi

- Node.js 18 atau lebih baru
- [@hapi/hapi](https://hapi.dev) 21
- Joi, @hapi/jwt, bcryptjs, nanoid, dotenv

## Persyaratan

- Node.js >= 18
- npm
- Koneksi internet untuk endpoint proxy equran.id

## Instalasi

```bash
git clone https://github.com/RifkiFiransah/eQur-an-App-API.git
cd eQur-an-App-API
npm install
```

Salin konfigurasi environment:

```powershell
Copy-Item .env.example .env
```

Atau di shell Unix:

```bash
cp .env.example .env
```

Buka `.env` dan ganti `JWT_SECRET` dengan nilai acak yang panjang.

## Menjalankan Server

Mode produksi:

```bash
npm start
```

Mode development dengan auto-reload:

```bash
npm run start-dev
```

Server berjalan di `http://localhost:5000` secara default.

## Dokumentasi API Interaktif

Setelah server berjalan, buka:

- Swagger UI: `http://localhost:5000/docs`
- Spesifikasi OpenAPI: `http://localhost:5000/openapi.json`

Untuk mencoba endpoint yang membutuhkan autentikasi, jalankan register atau login, lalu klik **Authorize** di Swagger UI dan masukkan token dengan format `Bearer <token>`. Swagger UI disajikan secara lokal sehingga tetap bisa dibuka tanpa CDN.

## Variabel Environment

| Variabel                 | Default                 | Keterangan                        |
| ------------------------ | ----------------------- | --------------------------------- |
| `PORT`                   | `5000`                  | Port server                       |
| `HOST`                   | `0.0.0.0`               | Host binding                      |
| `CORS_ORIGINS`           | `*`                     | Daftar origin dipisah koma        |
| `JWT_SECRET`             | nilai development       | Wajib diganti di produksi         |
| `JWT_EXPIRES_IN_SECONDS` | `86400`                 | Masa berlaku token (detik)        |
| `DATA_DIR`               | `./data`                | Lokasi penyimpanan user dan surat |
| `EQURAN_API_BASE_URL`    | `https://equran.id/api` | Base URL equran.id                |
| `EQURAN_API_TIMEOUT_MS`  | `10000`                 | Timeout request ke equran.id      |
| `EQURAN_CACHE_TTL_MS`    | `600000`                | Masa berlaku cache proxy          |

## Ringkasan Endpoint

| Method | Path                          | Auth   | Keterangan                        |
| ------ | ----------------------------- | ------ | --------------------------------- |
| GET    | `/`                           | Tidak  | Informasi API dan daftar endpoint |
| GET | `/health` | Tidak | Health check |
| GET | `/docs` | Tidak | Dokumentasi interaktif Swagger UI |
| GET | `/openapi.json` | Tidak | Spesifikasi OpenAPI 3 |
| GET | `/quran/surat` | Tidak | Daftar 114 surat |
| GET    | `/quran/surat/{nomor}`        | Tidak  | Detail surat beserta ayat         |
| GET    | `/quran/surat/{nomor}/tafsir` | Tidak  | Tafsir surat                      |
| POST   | `/auth/register`              | Tidak  | Registrasi user                   |
| POST   | `/auth/login`                 | Tidak  | Login dan dapatkan token          |
| GET    | `/auth/me`                    | Bearer | Profil user                       |
| GET    | `/surats`                     | Tidak  | Daftar surat lokal                |
| POST   | `/surats`                     | Bearer | Tambah surat lokal                |
| GET    | `/surats/{id}`                | Tidak  | Detail surat lokal                |
| PUT    | `/surats/{id}`                | Bearer | Ubah surat lokal                  |
| DELETE | `/surats/{id}`                | Bearer | Hapus surat lokal                 |

Alias lama yang tetap didukung: `POST /surat`, `GET /surat/{id}`, `PUT /surat/{id}`, `DELETE /surat/{id}`.

Dokumentasi lengkap:

- [Panduan Penggunaan](docs/PANDUAN.md)
- [Referensi API](docs/API.md)
- [Panduan Postman](docs/POSTMAN.md)

## Pengujian

Test otomatis tanpa jaringan:

```bash
npm test
```

Smoke test terhadap server yang berjalan:

```bash
npm start
npm run smoke
```

Postman:

1. Import `postman/eQuran-API.postman_collection.json`
2. Import `postman/eQuran-API-Local.postman_environment.json`
3. Pilih environment `e-Quran API - Local`
4. Jalankan collection secara berurutan

Lewat CLI:

```bash
npx newman run postman/eQuran-API.postman_collection.json -e postman/eQuran-API-Local.postman_environment.json
```

## Struktur Proyek

```text
src/
  app.js                 Factory server Hapi
  server.js              Entry point
  config.js              Konfigurasi environment
  validations.js         Skema validasi Joi
  routes/                Definisi route
  handlers/              Handler request
  services/              Proxy equran.id dan penyimpanan JSON
  utils/                 Helper respons, error, dan token
  docs/swagger.html      Halaman Swagger UI
test/                    Test otomatis
test-utils/              Helper test
postman/                 Collection dan environment Postman
docs/                    Dokumentasi dan openapi.json
```

## Keamanan dan Data

- Password disimpan sebagai hash bcrypt, tidak pernah dikembalikan di respons.
- Endpoint tulis surat wajib memakai token Bearer.
- `data/` dan `.env` tidak ikut masuk git.
- Ganti `JWT_SECRET` sebelum deploy dan batasi `CORS_ORIGINS` sesuai kebutuhan.
- Gunakan HTTPS di belakang reverse proxy saat produksi.

## Lisensi

MIT License

# Referensi API

Base URL lokal: `http://localhost:5000`

Dokumentasi interaktif tersedia di `GET /docs` (Swagger UI) dan spesifikasi OpenAPI 3 di `GET /openapi.json`.

Semua request dan respons menggunakan JSON. Untuk endpoint yang membutuhkan autentikasi, kirim header:

```http
Authorization: Bearer <token>
```

## Format Respons

### Sukses

```json
{
  "status": "success",
  "message": "Pesan human-readable",
  "data": {}
}
```

`data` tidak selalu ada, misalnya pada respons hapus data.

### Gagal

```json
{
  "status": "fail",
  "message": "Pesan kesalahan"
}
```

### Gagal Validasi

```json
{
  "status": "fail",
  "message": "Validasi gagal",
  "errors": [
    "\"nomor\" must be less than or equal to 114"
  ]
}
```

## Kode Status

| Kode | Keterangan |
| --- | --- |
| 200 | Berhasil |
| 201 | Data berhasil dibuat |
| 400 | Validasi request gagal |
| 401 | Autentikasi diperlukan atau token tidak valid |
| 404 | Data atau endpoint tidak ditemukan |
| 409 | Duplikasi data |
| 500 | Kesalahan internal server |
| 502 | Layanan equran.id tidak dapat dihubungi |

## 1. Informasi

### GET /

Mengembalikan informasi aplikasi dan daftar endpoint.

Respons `200`:

```json
{
  "status": "success",
  "message": "e-Quran API berjalan",
  "data": {
    "name": "equran-api-app",
    "version": "1.0.0",
    "endpoints": {
      "health": "GET /health",
      "quranList": "GET /quran/surat",
      "quranDetail": "GET /quran/surat/{nomor}",
      "quranTafsir": "GET /quran/surat/{nomor}/tafsir"
    }
  }
}
```

### GET /health

Respons `200`:

```json
{
  "status": "success",
  "message": "Server sehat",
  "data": {
    "uptimeSeconds": 120,
    "timestamp": "2026-11-17T07:00:00.000Z"
  }
}
```

## 2. Quran (Proxy equran.id)

Data diambil dari equran.id, disimpan di cache selama `EQURAN_CACHE_TTL_MS`, lalu diteruskan ke client. Field respons mengikuti format equran.id.

### GET /quran/surat

Daftar 114 surat.

Query parameter:

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `nama` | string | - | Cari pada nama latin, nama Arab, atau arti |
| `tempat_turun` | `mekah` atau `madinah` | - | Filter tempat turun |
| `limit` | integer 1-114 | `114` | Jumlah data per halaman |
| `offset` | integer >= 0 | `0` | Jumlah data yang dilewati |

Contoh:

```http
GET /quran/surat?nama=baqarah
GET /quran/surat?tempat_turun=mekah&limit=10&offset=0
```

Respons `200`:

```json
{
  "status": "success",
  "message": "Daftar surat berhasil diambil",
  "data": {
    "total": 114,
    "limit": 10,
    "offset": 0,
    "surat": [
      {
        "nomor": 1,
        "nama": "الفاتحة",
        "nama_latin": "Al-Fatihah",
        "jumlah_ayat": 7,
        "tempat_turun": "mekah",
        "arti": "Pembukaan",
        "deskripsi": "Surat pembuka Al-Quran."
      }
    ]
  }
}
```

### GET /quran/surat/{nomor}

Detail satu surat beserta ayat.

Parameter path:

| Parameter | Tipe | Keterangan |
| --- | --- | --- |
| `nomor` | integer 1-114 | Nomor surat |

Respons `200`:

```json
{
  "status": "success",
  "message": "Detail surat berhasil diambil",
  "data": {
    "surat": {
      "nomor": 1,
      "nama": "الفاتحة",
      "nama_latin": "Al-Fatihah",
      "jumlah_ayat": 7,
      "tempat_turun": "mekah",
      "arti": "Pembukaan",
      "deskripsi": "Surat pembuka Al-Quran.",
      "ayat": [
        {
          "id": 1,
          "surah": 1,
          "nomor": 1,
          "ar": "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
          "tr": "Bismillāhir-raḥmānir-raḥīm(i).",
          "idn": "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang."
        }
      ]
    }
  }
}
```

Field lain seperti `audio`, `status`, `surat_sebelumnya`, dan `surat_selanjutnya` juga diteruskan apa adanya dari equran.id.

Kemungkinan error:

- `400` jika `nomor` di luar 1-114.
- `404` jika surat tidak ditemukan di equran.id.
- `502` jika equran.id tidak dapat dihubungi.

### GET /quran/surat/{nomor}/tafsir

Respons `200`:

```json
{
  "status": "success",
  "message": "Tafsir surat berhasil diambil",
  "data": {
    "tafsir": {
      "nomor": 1,
      "nama_latin": "Al-Fatihah",
      "tafsir": [
        {
          "ayat": 1,
          "teks": "Teks tafsir ayat pertama."
        }
      ]
    }
  }
}
```

## 3. Autentikasi

### POST /auth/register

Payload:

| Field | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | 2-100 karakter, wajib |
| `email` | string | Format email valid, wajib, unik |
| `password` | string | 8-72 karakter, wajib |

Contoh request:

```json
{
  "name": "Rifki Firansah",
  "email": "rifki@example.com",
  "password": "password123"
}
```

Respons `201`:

```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "V1StGXR8_Z5jdHi6",
      "name": "Rifki Firansah",
      "email": "rifki@example.com",
      "createdAt": "2026-11-17T07:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Kemungkinan error:

- `400` jika payload tidak valid.
- `409` jika email sudah terdaftar.

### POST /auth/login

Payload:

```json
{
  "email": "rifki@example.com",
  "password": "password123"
}
```

Respons `200`:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "V1StGXR8_Z5jdHi6",
      "name": "Rifki Firansah",
      "email": "rifki@example.com",
      "createdAt": "2026-11-17T07:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Kemungkinan error:

- `400` jika payload tidak valid.
- `401` jika email atau password salah.

### GET /auth/me

Memerlukan header Bearer token.

Respons `200`:

```json
{
  "status": "success",
  "message": "Profil berhasil diambil",
  "data": {
    "user": {
      "id": "V1StGXR8_Z5jdHi6",
      "name": "Rifki Firansah",
      "email": "rifki@example.com",
      "createdAt": "2026-11-17T07:00:00.000Z"
    }
  }
}
```

Kemungkinan error:

- `401` jika token tidak ada, tidak valid, atau kedaluwarsa.

## 4. Surat Lokal

Surat lokal disimpan di `DATA_DIR/surats.json` dan bentuk objeknya:

```json
{
  "id": "L6oAnAOa6pMsqbKK",
  "nomor": 1,
  "nama": "Al-Fatihah",
  "jumlahAyat": 7,
  "turun": "mekah",
  "arti": "Pembukaan",
  "deskripsi": "Surat pembuka Al-Quran.",
  "createdAt": "2026-11-17T07:00:00.000Z",
  "updatedAt": "2026-11-17T07:00:00.000Z"
}
```

### GET /surats

Query parameter:

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `nomor` | integer 1-114 | - | Filter nomor surat |
| `nama` | string | - | Cari nama surat, case-insensitive |
| `id` | string | - | Filter berdasarkan ID |
| `limit` | integer 1-114 | `50` | Jumlah data per halaman |
| `offset` | integer >= 0 | `0` | Jumlah data yang dilewati |

Respons `200`:

```json
{
  "status": "success",
  "message": "Daftar surat berhasil diambil",
  "data": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "surat": []
  }
}
```

### POST /surats

Memerlukan Bearer token.

Payload:

| Field | Tipe | Aturan |
| --- | --- | --- |
| `nomor` | integer | 1-114, wajib, unik |
| `nama` | string | 1-100 karakter, wajib |
| `jumlahAyat` | integer | 1-300, wajib |
| `turun` | `mekah` atau `madinah` | Wajib |
| `arti` | string | 1-200 karakter, wajib |
| `deskripsi` | string | Maksimal 5000 karakter, opsional |

Respons `201`:

```json
{
  "status": "success",
  "message": "Surat berhasil ditambahkan",
  "data": {
    "surat": {
      "id": "L6oAnAOa6pMsqbKK",
      "nomor": 1,
      "nama": "Al-Fatihah",
      "jumlahAyat": 7,
      "turun": "mekah",
      "arti": "Pembukaan",
      "deskripsi": "Surat pembuka Al-Quran.",
      "createdAt": "2026-11-17T07:00:00.000Z",
      "updatedAt": "2026-11-17T07:00:00.000Z"
    }
  }
}
```

Kemungkinan error:

- `400` jika payload tidak valid.
- `401` jika token tidak ada atau tidak valid.
- `409` jika nomor surat sudah dipakai.

### GET /surats/{id}

Respons `200`:

```json
{
  "status": "success",
  "message": "Detail surat berhasil diambil",
  "data": {
    "surat": {}
  }
}
```

Kemungkinan error:

- `404` jika ID tidak ditemukan.

### PUT /surats/{id}

Memerlukan Bearer token. Kirim minimal satu field yang ingin diubah. Field yang sama dengan payload create, semuanya opsional, tetapi tidak boleh kosong semua.

Contoh:

```json
{
  "nama": "Al Fatihah",
  "arti": "Pembukaan"
}
```

Respons `200`:

```json
{
  "status": "success",
  "message": "Surat berhasil diperbarui",
  "data": {
    "surat": {}
  }
}
```

Kemungkinan error:

- `400` jika payload kosong atau tidak valid.
- `401` jika token tidak ada atau tidak valid.
- `404` jika ID tidak ditemukan.
- `409` jika nomor baru sudah dipakai surat lain.

### DELETE /surats/{id}

Memerlukan Bearer token.

Respons `200`:

```json
{
  "status": "success",
  "message": "Surat berhasil dihapus"
}
```

Kemungkinan error:

- `401` jika token tidak ada atau tidak valid.
- `404` jika ID tidak ditemukan.

## 5. Alias Endpoint Lama

Endpoint berikut tetap tersedia dan memakai handler yang sama:

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/surat` | Bearer |
| GET | `/surat/{id}` | Tidak |
| PUT | `/surat/{id}` | Bearer |
| DELETE | `/surat/{id}` | Bearer |

## 6. Contoh Error

### 400 Validasi

```json
{
  "status": "fail",
  "message": "Validasi gagal",
  "errors": [
    "\"nomor\" must be less than or equal to 114"
  ]
}
```

### 401 Tanpa Token

```json
{
  "status": "fail",
  "message": "Autentikasi diperlukan atau token tidak valid"
}
```

### 404 Tidak Ditemukan

```json
{
  "status": "fail",
  "message": "Surat tidak ditemukan"
}
```

### 409 Duplikat

```json
{
  "status": "fail",
  "message": "Surat dengan nomor tersebut sudah ada"
}
```

### 502 EQuran Gagal

```json
{
  "status": "fail",
  "message": "Gagal menghubungi layanan equran.id"
}
```

# Panduan Postman

Collection dan environment tersedia di folder `postman`:

- `postman/eQuran-API.postman_collection.json`
- `postman/eQuran-API-Local.postman_environment.json`

Collection berisi 28 request dengan 74 assertion dan sudah diverifikasi memakai Newman.

## 1. Import ke Postman

1. Buka Postman.
2. Klik **Import**.
3. Pilih kedua file JSON dari folder `postman`.
4. Setelah selesai, pilih environment **e-Quran API - Local** di kanan atas.

## 2. Siapkan Server

Terminal:

```bash
npm start
```

Pastikan `http://localhost:5000/health` merespons sukses. Jika port berbeda, ubah `baseUrl` pada environment.

## 3. Jalankan Collection

1. Klik collection **e-Quran API**.
2. Klik **Run**.
3. Pastikan environment **e-Quran API - Local** dipilih.
4. Klik **Run e-Quran API**.

Jalankan berurutan dari folder 1 sampai 4 karena beberapa request bergantung pada variabel dari request sebelumnya.

## 4. Variabel

Variabel environment:

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `baseUrl` | `http://localhost:5000` | Alamat server |
| `password` | `password123` | Password user uji |

Variabel collection yang diisi otomatis oleh test script:

| Variabel | Diisi oleh | Keterangan |
| --- | --- | --- |
| `token` | Register, Login | Token Bearer |
| `email` | Register | Email unik berbasis timestamp |
| `userId` | Register | ID user baru |
| `suratId` | Create Surat | ID surat lokal yang dibuat |
| `suratNomor` | Create Surat | Nomor surat yang belum terpakai |
| `aliasSuratId` | Legacy Create | ID surat untuk pengujian alias |
| `aliasSuratNomor` | Legacy Create | Nomor surat untuk pengujian alias |
| `fakeId` | Statis | ID palsu untuk uji 404 |

Request create surat otomatis mencari nomor yang belum dipakai melalui `GET /surats`, sehingga kecil kemungkinan mendapat 409 karena sisa data lama.

## 5. Cakupan Pengujian

### Folder 1. Info

- `GET /`
- `GET /health`

### Folder 2. Quran

- Daftar surat, filter nama, filter tempat turun, pagination
- Detail surat dan tafsir
- Nomor surat tidak valid menghasilkan 400

Folder ini membutuhkan koneksi internet karena memanggil equran.id.

### Folder 3. Autentikasi

- Register dan penyimpanan token otomatis
- Login
- Profil dengan token
- Register duplikat menghasilkan 409
- Login dengan password salah menghasilkan 401
- Profil tanpa token menghasilkan 401

### Folder 4. Surat Lokal

- Create, list, filter, detail, update, delete
- Create duplikat menghasilkan 409
- Create tanpa token menghasilkan 401
- Payload tidak valid menghasilkan 400
- Detail ID palsu menghasilkan 404
- Seluruh alias `/surat/*` diuji

## 6. Menjalankan Lewat CLI

Dengan Newman:

```bash
npx newman run postman/eQuran-API.postman_collection.json -e postman/eQuran-API-Local.postman_environment.json
```

Jika server memakai port lain:

```bash
npx newman run postman/eQuran-API.postman_collection.json -e postman/eQuran-API-Local.postman_environment.json --env-var "baseUrl=http://localhost:5055"
```

Output yang diharapkan:

```text
requests: 30
test-scripts: 28
assertions: 74
failed: 0
```

Angka request 30 mencakup 28 request collection ditambah 2 request internal `pm.sendRequest` untuk mencari nomor surat yang belum dipakai.

## 7. Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Semua request gagal koneksi | Pastikan server berjalan dan `baseUrl` benar |
| Register menghasilkan 409 | Email dibuat otomatis, seharusnya tidak terjadi. Jalankan ulang collection |
| Create Surat menghasilkan 409 | Semua nomor 1-114 sedang terpakai. Hapus folder `data` lalu jalankan ulang server |
| Endpoint Quran menghasilkan 502 | Cek koneksi internet dan akses ke equran.id |
| Profil menghasilkan 401 | Pastikan Register atau Login dijalankan lebih dulu |
| Request setelah delete menghasilkan 404 | Urutan request diubah. Jalankan ulang seluruh collection dari awal |
| Variabel kosong | Pastikan environment dipilih dan collection dijalankan berurutan |

Untuk mengulang dari kondisi bersih:

```bash
# hentikan server terlebih dahulu
Remove-Item -Recurse -Force data
npm start
```

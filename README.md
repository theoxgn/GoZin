# Sistem Perizinan Karyawan

Aplikasi web untuk mengelola perizinan karyawan dengan fitur persetujuan bertingkat dan berbagai tipe perizinan.


## Screenshot Aplikasi
<div align="center">
  <img src="https://github.com/theoxgn/GoZin/blob/main/hr.png" alt="Screenshot Home" width="800">
  <img src="https://github.com/theoxgn/GoZin/blob/main/admin.png" alt="Screenshot Home" width="800">
  <img src="https://github.com/theoxgn/GoZin/blob/main/approval.png" alt="Screenshot Home" width="800">
</div>

## Fitur Utama

### Tipe Perizinan
- **Izin Keluar (Short Leave)**: Perizinan untuk keluar kantor dalam waktu singkat
- **Cuti**: Perizinan untuk tidak masuk kerja dalam jangka waktu tertentu
- **Kunjungan**: Perizinan untuk mengunjungi lokasi/kantor lain
- **Dinas**: Perizinan untuk tugas dinas ke lokasi lain

### Status Perizinan
- **Pending**: Menunggu persetujuan dari approval
- **Approved by Approval**: Disetujui oleh approval, menunggu persetujuan HRD
- **Approved**: Disetujui sepenuhnya (oleh approval dan HRD)
- **Rejected**: Ditolak (bisa oleh approval atau HRD)

### Peran & Hak Akses
- **User**: Mengajukan perizinan, melihat status perizinan sendiri
- **Approval**: Menyetujui/menolak perizinan dari user di bawahnya
- **HRD**: Menyetujui/menolak perizinan yang sudah disetujui approval
- **Administrator**: Mengelola pengguna, konfigurasi perizinan, dan melihat statistik

## Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- MySQL (dengan Sequelize ORM)
- JWT untuk autentikasi

### Frontend
- React.js
- Material-UI (MUI)
- Axios untuk HTTP requests
- React Router untuk navigasi

## Cara Instalasi & Penggunaan

### Prasyarat
- Node.js (v14 atau lebih baru)
- PostgreSQL

### Langkah Instalasi

1. Clone repository ini

2. Install semua dependensi
   ```
   npm run install-all
   ```

3. Konfigurasi database
   - Buat database MySQL baru
   - Sesuaikan konfigurasi database di `backend/config/config.js`

4. Inisialisasi database dengan data awal
   ```
   npm run seed
   ```

5. Jalankan aplikasi (backend dan frontend)
   ```
   npm start
   ```

6. Buka aplikasi di browser
   ```
   http://localhost:3000
   ```

### Akun Default

- **Administrator**
  - Email: admin@example.com
  - Password: admin123

- **HRD**
  - Email: hrd@example.com
  - Password: hrd123

- **Approval**
  - Email: approval@example.com
  - Password: approval123

- **User**
  - Email: user@example.com
  - Password: user123

## Struktur Proyek

```
permission-system/
├── backend/             # Kode backend
│   ├── config/          # Konfigurasi aplikasi
│   ├── controllers/     # Controller untuk menangani request
│   ├── middleware/      # Middleware (auth, validation, dll)
│   ├── models/          # Model database
│   ├── routes/          # Definisi rute API
│   ├── seeders/         # Data awal untuk database
│   └── server.js        # Entry point aplikasi backend
│
├── frontend/            # Kode frontend
│   ├── public/          # Asset publik
│   └── src/             # Source code React
│       ├── components/  # Komponen React yang dapat digunakan kembali
│       ├── contexts/    # Context API (auth, dll)
│       ├── layouts/     # Layout aplikasi
│       └── pages/       # Halaman aplikasi
│
└── package.json         # Konfigurasi npm untuk root proyek
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna

### User
- `GET /api/users/profile` - Mendapatkan profil pengguna
- `PUT /api/users/profile` - Memperbarui profil pengguna
- `PUT /api/users/change-password` - Mengubah password

### Permission
- `GET /api/permissions` - Mendapatkan semua perizinan (dengan filter)
- `GET /api/permissions/:id` - Mendapatkan detail perizinan
- `POST /api/permissions` - Membuat perizinan baru
- `PUT /api/permissions/:id` - Memperbarui perizinan
- `DELETE /api/permissions/:id` - Menghapus perizinan

### Approval
- `GET /api/approval/pending` - Mendapatkan perizinan yang menunggu persetujuan
- `PUT /api/approval/approve/:id` - Menyetujui perizinan
- `PUT /api/approval/reject/:id` - Menolak perizinan

### HRD
- `GET /api/hrd/pending` - Mendapatkan perizinan yang sudah disetujui approval
- `PUT /api/hrd/approve/:id` - Menyetujui perizinan
- `PUT /api/hrd/reject/:id` - Menolak perizinan

### Admin
- `GET /api/admin/stats` - Mendapatkan statistik dashboard
- `GET /api/admin/permission-config` - Mendapatkan semua konfigurasi perizinan
- `GET /api/admin/permission-config/:type` - Mendapatkan konfigurasi perizinan berdasarkan tipe
- `PUT /api/admin/permission-config/:id` - Memperbarui konfigurasi perizinan
- `POST /api/admin/permission-config` - Membuat konfigurasi perizinan baru
- `GET /api/admin/users` - Mendapatkan semua pengguna
- `POST /api/admin/users` - Membuat pengguna baru
- `PUT /api/admin/users/:id` - Memperbarui pengguna
- `DELETE /api/admin/users/:id` - Menghapus pengguna
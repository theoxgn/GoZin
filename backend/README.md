# Sistem Perijinan Karyawan

Aplikasi untuk mengelola perijinan karyawan dengan berbagai tipe perijinan dan alur persetujuan.

## Fitur Utama

### Tipe Perijinan
- **Short Leave**: Izin keluar kantor dalam waktu singkat
- **Cuti**: Cuti tahunan karyawan
- **Visit**: Kunjungan ke client atau partner
- **Dinas**: Perjalanan dinas ke luar kota atau luar negeri

### Status Perijinan
- **Pending**: Menunggu persetujuan dari Approval
- **Disetujui oleh Approval**: Menunggu persetujuan dari HRD
- **Disetujui**: Disetujui oleh Approval dan HRD
- **Ditolak**: Ditolak oleh Approval atau HRD

### Roles dan Hak Akses
1. **User**
   - Login ke sistem
   - Mengajukan perijinan
   - Melihat daftar perijinan milik sendiri

2. **Approval**
   - Login ke sistem
   - Melihat semua pengajuan perijinan yang berada pada tahap approval
   - Menyetujui atau menolak perijinan
   - Memberi catatan alasan penolakan (opsional)

3. **HRD**
   - Login ke sistem
   - Melihat semua pengajuan perijinan yang sudah disetujui oleh Approval
   - Menyetujui atau menolak perijinan
   - Memberi catatan alasan penolakan (opsional)

4. **Administrator**
   - Login ke sistem
   - Melihat dashboard statistik (jumlah pengajuan, disetujui, ditolak, dll.)
   - Melakukan konfigurasi jumlah maksimal perijinan per user dalam 1 bulan
   - Melihat daftar semua perijinan dan statusnya

## Teknologi yang Digunakan

- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT

## Instalasi dan Penggunaan

### Prasyarat

- Node.js (v14 atau lebih tinggi)
- PostgreSQL

### Langkah Instalasi

1. Clone repository

```bash
git clone <repository-url>
cd permission-system
```

2. Install dependencies

```bash
npm install
```

3. Konfigurasi environment variables

Buat file `.env` berdasarkan `.env.example` dan sesuaikan dengan konfigurasi database Anda.

4. Inisialisasi database

```bash
node seeders/init.js
```

5. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan pada `http://localhost:5000`

### Akun Default

- **Admin**
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

## API Endpoints

### Auth
- `POST /api/auth/register` - Mendaftarkan user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Mendapatkan profil user yang sedang login
- `POST /api/auth/change-password` - Mengubah password

### User
- `GET /api/users` - Mendapatkan semua user (admin only)
- `GET /api/users/:id` - Mendapatkan detail user berdasarkan ID (admin only)
- `PUT /api/users/:id` - Mengupdate data user (admin only)
- `DELETE /api/users/:id` - Menghapus user (admin only)
- `GET /api/users/permissions/me` - Mendapatkan daftar perijinan milik user yang sedang login

### Permission
- `POST /api/permissions` - Membuat perijinan baru
- `GET /api/permissions` - Mendapatkan semua perijinan (admin, approval, hrd)
- `GET /api/permissions/:id` - Mendapatkan detail perijinan berdasarkan ID
- `PUT /api/permissions/:id` - Mengupdate perijinan
- `DELETE /api/permissions/:id` - Menghapus perijinan

### Approval
- `GET /api/approvals/pending` - Mendapatkan daftar perijinan yang perlu diapprove
- `PUT /api/approvals/approve/:id` - Menyetujui perijinan
- `PUT /api/approvals/reject/:id` - Menolak perijinan

### HRD
- `GET /api/hrd/pending` - Mendapatkan daftar perijinan yang sudah disetujui oleh approval
- `PUT /api/hrd/approve/:id` - Menyetujui perijinan
- `PUT /api/hrd/reject/:id` - Menolak perijinan

### Admin
- `GET /api/admin/dashboard` - Mendapatkan statistik dashboard
- `GET /api/admin/permission-configs` - Mendapatkan semua konfigurasi perijinan
- `GET /api/admin/permission-configs/:type` - Mendapatkan konfigurasi perijinan berdasarkan tipe
- `PUT /api/admin/permission-configs/:type` - Mengupdate konfigurasi perijinan
- `POST /api/admin/permission-configs` - Membuat konfigurasi perijinan baru
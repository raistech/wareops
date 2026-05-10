# Riwayat Migrasi & Pengembangan Monitoring Warehouse (Next.js)

Dokumen ini mencatat seluruh proses migrasi dan fitur-fitur yang diimplementasikan oleh Gemini CLI untuk Skye (raistech).

## 📅 Tanggal: 10 Mei 2026

### 🚀 1. Migrasi Arsitektur
- **Framework:** Migrasi dari Express static ke **Fullstack Next.js (App Router)**.
- **Deployment:** Menghilangkan ketergantungan Docker, beralih murni menggunakan **PM2**.
- **Server:** Implementasi *Custom Server* (`custom-server.js`) untuk menggabungkan Next.js dengan logic **Socket.io**.

### 📊 2. Fitur Dashboard Real-time
- **GSheets Sync:** Sinkronisasi otomatis data okupansi dari Google Sheets setiap 1 menit.
- **Dynamic Columns:** Sistem otomatis mencari kolom berdasarkan tanggal hari ini (`DD/MM/YYYY`) di tab `INVENTORY`.
- **Lifetime Stats:** Implementasi tabel `warehouse_metrics` di SQLite untuk menyimpan akumulasi (LIFETIME) truk yang selesai (Loading/Unloading).
- **Global Overview:** Menambahkan kartu ringkasan global (Total Activity & Global Occupancy).

### 📰 3. Content Management System (CMS)
- **Admin Panel:** Halaman `/admin` yang dilindungi password untuk HR/Admin.
- **News/Articles:** Fitur buat, lihat, dan hapus berita perusahaan dengan sistem popup (modal).
- **Banner Management:** Fitur upload banner promosi dengan sistem **Sliding Carousel** otomatis di halaman depan.
- **Org Structure:** Fitur penginputan struktur organisasi per gudang lengkap dengan foto staff, nama, dan jabatan.

### 🔐 4. Keamanan & UI/UX
- **Admin Security:** Menyembunyikan link Admin Panel dari navigasi publik (Desktop & Mobile). Akses manual via `/admin`.
- **Password Manager:** Fitur ganti password admin langsung dari panel pengaturan.
- **Mobile Friendly:** Implementasi Hamburger Menu untuk navigasi di layar kecil.
- **Dynamic Branding:** Nama website, judul tab browser, dan favicon bisa diubah langsung dari Admin Panel.
- **Branding Sync:** Sinkronisasi warna dan nama antara Navbar dan Footer.

### 🛠️ 5. Perbaikan Bug Utama
- **Express v5 Compatibility:** Memperbaiki rute *wildcard* yang menyebabkan server down.
- **Data Accuracy:** Memperbaiki logika pembacaan GSheets agar data antar gudang tidak tertukar.
- **Robust Data Handling:** Menambahkan *safety checks* di frontend agar web tidak crash saat data server sedang dimuat.

---
*Dokumentasi ini dibuat otomatis sebagai riwayat pengembangan proyek raistech/wareops.*

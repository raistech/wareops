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

## 📅 Tanggal: 11 Mei 2026

### 🔍 1. Sistem Filter Tanggal (Historical View)
- **Multi-source Sync:** Implementasi pencarian data harian dan akumulasi total berdasarkan tanggal yang dipilih.
- **Direct DB Access:** Mengoptimalkan pengambilan data statistik dengan membaca langsung database SQLite masing-masing gudang untuk akurasi data lampau.
- **UI Contextual:** Dashboard otomatis berubah ke mode "Historical" dengan indikator khusus saat melihat data selain hari ini.

### ⭐ 2. Review & Rating System
- **Per-Warehouse Feedback:** Menambahkan fitur rating (1-5 bintang) dan komentar untuk setiap kartu gudang.
- **Average Aggregation:** Menampilkan akumulasi rata-rata rating dan jumlah ulasan di dashboard utama.
- **Admin Moderation:** Halaman pengelolaan ulasan di Admin Panel untuk menghapus review yang dianggap tidak layak atau spam.

### 🚀 3. Optimasi Backend & Performa
- **Pre-fetching Data:** Mempercepat loading awal dashboard dengan mengambil data terbaru dari database anak gudang sebelum update socket pertama kali.
- **Unified Summary:** Pemisahan tampilan antara pencapaian harian (Day) dan akumulasi seumur hidup (Total) pada grid dan ringkasan global.

### 📈 4. Perbaikan Akurasi Histori & Visualisasi
- **Enhanced Durations:** Memperbaiki perhitungan rata-rata waktu tunggu (*Wait*), muat (*Load*), dan bongkar (*Unload*) pada mode histori dengan sistem *fallback* (menggunakan `processing_at` jika `called_at` kosong).
- **Dynamic Occupancy Styling:** Implementasi indikator warna dinamis pada kartu okupansi (Merah > 80%, Kuning > 50%, Hijau < 50%) untuk mempermudah monitoring kapasitas gudang.
- **Contextual Labels:** Menambahkan label otomatis **(Day)** pada metrik waktu saat filter tanggal diaktifkan untuk membedakan dengan data rata-rata 30 hari **(30D)**.

---
*Dokumentasi ini dibuat otomatis sebagai riwayat pengembangan proyek raistech/wareops.*

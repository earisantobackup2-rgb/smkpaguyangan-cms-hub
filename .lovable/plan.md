## Rencana perbaikan

1. **Perbaiki izin akses tabel role**
   - Tambahkan kembali izin baca untuk tabel `user_roles` agar aplikasi bisa membaca peran user setelah login.
   - Beri akses backend internal yang diperlukan tanpa membuka role ke publik.

2. **Perbaiki izin fungsi pengecekan role**
   - Beri izin eksekusi untuk fungsi `has_role` dan `get_user_role` kepada user yang sudah login.
   - Ini penting karena kebijakan akses admin memakai fungsi tersebut untuk menentukan apakah akun adalah `administrator` atau `admin`.

3. **Buat login lebih akurat**
   - Setelah password benar, halaman login akan memvalidasi role terlebih dulu sebelum menampilkan “Login berhasil”.
   - Jika akun tidak punya role, tampilkan pesan yang jelas dan logout otomatis agar tidak masuk ke halaman “Akses ditolak”.

4. **Perkuat hook role admin**
   - Ubah pembacaan role agar memakai fungsi database `get_user_role` sebagai sumber utama.
   - Tambahkan fallback ke tabel `user_roles` jika diperlukan, supaya akses admin lebih stabil.

5. **Validasi hasil**
   - Cek ulang query role admin dan pastikan admin yang sudah ada tetap memiliki role `administrator`.
   - Jalankan pemeriksaan linter backend untuk memastikan tidak menambah warning keamanan.
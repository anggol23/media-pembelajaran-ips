# Fitur-Fitur Dashboard Guru - Media Pembelajaran IPS

## Ringkasan
Telah ditambahkan 3 fitur baru ke Dashboard Guru untuk meningkatkan pengalaman monitoring kuis multiplayer:

---

## 1. 🏆 Leaderboard Realtime

### Deskripsi
Menampilkan ranking peserta secara real-time sesuai dengan skor yang diperoleh saat mengerjakan kuis.

### Fitur:
- **Tampilan Tabel Interaktif**: Menampilkan ranking dengan kolom:
  - Ranking (🥇🥈🥉 untuk 3 besar)
  - Nama Peserta
  - No Absen
  - Skor (jumlah jawaban benar)
  - Persentase (%)
  - Waktu pengerjaan

- **Tombol Refresh**: Memperbarui data leaderboard secara manual
- **Auto Refresh**: Memperbarui leaderboard setiap 2 detik secara otomatis
- **Warna Highlight**: 
  - 🟨 Kuning untuk Juara (Ranking 1)
  - ⚫ Abu-abu untuk Runner Up (Ranking 2)
  - 🟧 Orange untuk Bronze (Ranking 3)

### Penyimpanan Data
- Data disimpan di `localStorage` dengan key: `kuisScores`
- Setiap peserta yang menyelesaikan kuis otomatis terekam skornya

---

## 2. 🥇 Ranking Siswa Akhir

### Deskripsi
Menampilkan peringkat akhir siswa dengan desain visual yang menarik dan informatif.

### Fitur:
- **Kartu Ranking Bertingkat**: Setiap peserta ditampilkan dalam kartu dengan:
  - Medal (🥇🥈🥉)
  - Nama dan No Absen
  - Skor /10
  - Persentase nilai
  - Status (Juara/Runner Up/Bronze/Regular)

- **Tombol Refresh Ranking**: Memperbarui tampilan ranking
- **Tombol Hapus Semua Skor**: Menghapus semua data scoring (dengan konfirmasi)
- **Export ke CSV**: Mengunduh ranking dalam format CSV yang bisa dibuka di Excel
  - Format: Ranking, Nama, No Absen, Skor, Persentase, Waktu
  - Nama file: `Ranking-Kuis-[TANGGAL].csv`

### Keunggulan
- Desain visual yang menarik dengan gradient warna
- Mudah dibaca dan dipahami siswa
- Bisa diekspor untuk dokumentasi/analisis lebih lanjut

---

## 3. 👥 Status Multiplayer Quiz

### Deskripsi
Memantau status peserta kuis secara real-time dengan informasi detail tentang partisipasi mereka.

### Fitur:

#### Statistik Ringkas (3 Kartu):
1. **Total Peserta**: Jumlah siswa yang telah masuk ke kuis
2. **Sudah Selesai**: Jumlah siswa yang telah menyelesaikan kuis
3. **Masih Mengerjakan**: Jumlah siswa yang masih dalam proses

#### Daftar Peserta Interaktif:
Setiap peserta menampilkan:
- Nama dan No Absen
- Status (✅ Selesai / ⏳ Mengerjakan)
- Skor dan Persentase (jika sudah selesai)

#### Tombol Kontrol:
- **🔄 Update Status**: Memperbarui informasi status peserta
- **📢 Broadcast Pesan**: Mengirim pesan ke semua peserta yang sedang login
  - Guru bisa mengirim instruksi/pengumuman
  - Pesan tersimpan di localStorage untuk diakses peserta

### Real-time Updates
- Data otomatis diperbarui saat:
  - Peserta baru bergabung
  - Peserta menyelesaikan kuis
  - Guru menekan tombol Update

---

## 📊 Alur Kerja Lengkap

### Untuk Guru:
1. **Setup Awal**
   - Masuk ke Dashboard Guru
   - Set Kode Kuis (default: "IPS2024")
   - Klik "Simpan Kode Kuis"

2. **Proses Quiz**
   - Klik "Mulai Kuis" untuk membuka quiz ke siswa
   - Monitor peserta di "Animasi Peserta Kuis"
   - Pantau "Status Multiplayer Quiz" untuk lihat progress

3. **Monitoring Real-Time**
   - Gunakan "Leaderboard Realtime" untuk lihat scores live
   - Klik "Auto Refresh" untuk auto-update setiap 2 detik
   - Gunakan "Status Multiplayer" untuk lihat siapa sudah selesai

4. **Akhir Quiz**
   - Klik "Akhiri Kuis" untuk menutup quiz
   - Lihat "Ranking Siswa Akhir" untuk melihat hasil akhir
   - **Opsional**: Export ranking ke CSV

### Untuk Siswa:
1. Masuk ke kuis dengan kode dari guru
2. Isi Nama dan No Absen
3. Tunggu guru memulai kuis
4. Pilih karakter
5. Jawab pertanyaan 1-10 + refleksi
6. Lihat hasil dan ranking mereka

---

## 💾 Penyimpanan Data

### localStorage Keys yang Digunakan:
- `kodeKuisGuru`: Kode kuis yang di-set guru
- `kuisSudahDimulai`: Status apakah quiz dimulai
- `kuisSudahBerakhir`: Status apakah quiz berakhir
- `daftarPesertaKuis`: Daftar peserta yang bergabung
- `kuisScores`: Data skor semua peserta (untuk leaderboard & ranking)
- `guruBroadcastMessage`: Pesan dari guru ke siswa

### Struktur Data Skor:
```javascript
{
  nama: "Nama Siswa",
  absen: "1",
  score: 8,          // jumlah jawaban benar
  percentage: 80,    // persentase
  time: "2024-03-12T10:30:00.000Z"
}
```

---

## 🎨 Fitur Visual

### Warna & Tema:
- **Leaderboard**: Biru, Emerald, Teal (modern)
- **Ranking**: Gold (🥇), Silver (🥈), Bronze (🥉)
- **Multiplayer**: Biru-Cyan untuk peserta, Hijau untuk selesai, Orange untuk proses
- **Tombol**: Gradient colors untuk setiap fungsi unik

### Responsif
- Semua fitur responsive untuk desktop dan tablet
- Tabel otomatis scroll horizontal di mobile

---

## 🚀 Cara Menggunakan

### Leaderboard Realtime:
1. Klik "🔄 Refresh" untuk update manual
2. Klik "▶ Auto Refresh" untuk auto-update setiap 2 detik
3. Klik lagi untuk toggle "⏸ Stop Auto Refresh"

### Ranking Siswa:
1. Tunggu kuis selesai
2. Klik "🔄 Refresh Ranking" untuk update
3. Untuk hapus: Klik "🗑️ Hapus Semua Skor" (perlu konfirmasi)
4. Untuk export: Klik "📥 Export Ranking ke CSV"

### Status Multiplayer:
1. Pantau statistik di 3 kartu atas
2. Lihat daftar peserta dengan progress mereka
3. Klik "🔄 Update Status" untuk refresh
4. Klik "📢 Broadcast Pesan" untuk kirim pesan ke siswa

---

## 📝 Catatan Teknis

- Menggunakan localStorage untuk penyimpanan data (tidak perlu server)
- Auto-refresh interval: 2 detik untuk leaderboard
- Skor duplikat: Hanya skor tertinggi yang disimpan
- CSV export menggunakan format standar dengan separator koma
- Responsive design dengan Tailwind CSS

---

## ✅ Testing Checklist

- [x] Leaderboard menampilkan data dengan benar
- [x] Auto-refresh berfungsi setiap 2 detik
- [x] Ranking menampilkan warna sesuai position
- [x] Export CSV berfungsi dengan benar
- [x] Status multiplayer update real-time
- [x] Broadcast message tersimpan
- [x] Clear scores dengan konfirmasi
- [x] Responsive di berbagai ukuran layar

---

Created: March 2024
Version: 1.0

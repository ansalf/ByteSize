# 🤖 ByteSize EduTech

> Aplikasi web interaktif edukasi koding bertahap untuk anak-anak, petualangan 48 level, puzzle balok JavaScript, kuis tantangan harian, dan sertifikat resmi kelulusan.

---

## ✨ Fitur Utama

- 🗺️ **4 Tahap Kurikulum & 48 Level**: Dari urutan sekuensial dasar, variabel, percabangan *if-else*, perulangan *loops*, hingga *creator studio*.
- 🧩 **2 Mode Editor Fleksibel**:
  - **Mode Balok Puzzle Visual** (Drag & drop ramah anak).
  - **Mode Teks JavaScript Nyata** (Dengan syntax highlighting, auto-complete ramah anak, dan baris kode).
- 🏆 **Sistem Gamifikasi & Insentif**:
  - Bintang Emas & Koin Koding.
  - Toko Avatar Interaktif dengan efek suara unik masing-masing hewan/robot.
  - Tantangan Harian (1-Minute Daily Quiz) dengan animasi **Streak Api**.
- 📜 **Sertifikat Kelulusan Resmi**:
  - Dilengkapi sistem proteksi kelulusan (hanya terbuka jika stage tuntas 100%).
  - Predikat kelulusan (*Cum Laude, Excellent, Satisfactory*).
  - Siap cetak / simpan langsung ke PDF.
- 📱 **PWA & Notifikasi Pengingat**: Dapat dipasang di layar utama HP/Tablet dan mengirimkan pengingat belajar harian.
- 👥 **Multi-Profil Pemain**: Mendukung multi-anak dalam 1 perangkat tanpa saling menimpa progres.

---

## 🛠️ Panduan Pengembangan Lokal

### Prasyarat
- Node.js (versi 18 ke atas disarankan)
- npm / yarn / pnpm

### Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone https://github.com/ansalf/ByteSize.git
cd ByteSize

# 2. Install dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```

Buka peramban di `http://localhost:5173`.

### Build untuk Produksi

```bash
npm run build
```

---

## 🚀 Deployment Otomatis (GitHub Pages)

Repository ini telah dikonfigurasi dengan **GitHub Actions** (`.github/workflows/deploy.yml`).
Setiap kali ada commit/push ke branch `main`, aplikasi otomatis ter-build dan ter-deploy ke GitHub Pages.

---

## 📄 Lisensi
Distributed under the MIT License.
# ByteSize

# ByteSize — UI/UX Design Specification & System
**Target Audience**: Anak Usia Sekolah Dasar (SD) — Rentang Usia 7-12 Tahun  
**Tech Context**: React + TypeScript + Vite + Tailwind CSS / Modern CSS  
**Version**: 1.0.0 (UI/UX Design Phase)

---

## 1. Filosofi & Karakteristik Desain (Kid-Friendly Design Principles)

Untuk menciptakan pengalaman belajar coding yang menyenangkan dan tidak mengintimidasi bagi anak-anak SD, ByteSize mengadopsi 5 pilar desain utama:

1. **Playful & Friendly (Ceria & Mengundang)**:
   - Tampilan visual bergaya *gamified cartoon* dengan sudut-sudut membulat lembut (*rounded curves*), bayangan tebal bergaya arcade 2.5D / tactile (*chunky buttons*), dan mikro-animasi yang ekspresif.
2. **Visual Clutter-Free & Focused (Sederhana & Terarah)**:
   - Mengurangi beban kognitif (*cognitive load*). Setiap layar hanya memiliki 1 fokus aksi primer yang jelas (*clear affordance*).
   - Teks instruksi ringkas, bahasa tutur anak yang suportif (menyemangati, bukan menghakimi).
3. **High Affordance & Tactile Feel (Mudah Dipencet)**:
   - Anak-anak menyukai tombol fisik seperti mainan. Tombol memiliki efek kedalaman (*depth/extrusion*) yang terasa membal saat ditekan (*press-down bounce effect*).
   - Target sentuh (*touch target*) ekstra besar (minimal 48x48px hingga 64x64px) untuk mencegah *fat-finger errors* di layar sentuh tablet/HP.
4. **Instant Multi-Sensory Feedback (Umpan Balik Cepat & Ekspresif)**:
   - Partikel bintang/konfeti, animasi karakter melompat gembira, serta efek getar visual halus ketika aksi berhasil.
   - Peringatan ramah dan petunjuk visual (*gentle hints*) tanpa nada menghukum ketika jawaban salah.
5. **Aksesibilitas & Keterbacaan (Accessibility & Ergonomics)**:
   - Rasio kontras teks minimal WCAG AA (kontras tinggi terhadap latar belakang cerah).
   - Tipografi sans-serif ramah disleksia dengan huruf yang jelas perbedaannya (misal 'a', 'g', 'l', '1', 'I').

---

## 2. Design System Tokens

### 2.1. Palet Warna (Color Palette)

Palet ByteSize terinspirasi dari dunia permen arcade: ceria, kontras seimbang, dan memiliki semantik aksi yang intuitif bagi anak.

| Nama Token | Hex Code | Deskripsi & Penggunaan |
| :--- | :--- | :--- |
| **Primary (Byte Cyan)** | `#00C2CB` | Warna tema utama, header, aksen dunia digital ceria |
| **Primary Dark** | `#009AA2` | Border & efek kedalaman 3D tombol utama |
| **Secondary (Pixel Amber)** | `#FFAE00` | Tombol CTA utama (Play/Mulai), bintang bintang reward, koin |
| **Secondary Dark** | `#D48800` | Border/kedalaman tombol amber |
| **Success (Bit Green)** | `#2ECB71` | Tombol "Jalankan Kode", indikator level selesai, feedback benar |
| **Success Dark** | `#209E55` | Border/kedalaman tombol hijau |
| **Danger / Coral (Bug Pink)** | `#FF4B72` | Tombol Reset, peringatan bug, feedback mencoba lagi |
| **Danger Dark** | `#C92C4E` | Border/kedalaman tombol merah/pink |
| **Accent (Magic Violet)** | `#8854D0` | Logika coding khusus (Loop / Repeat), portal teleport |
| **Accent Dark** | `#6639A6` | Border/kedalaman blok logika ungu |
| **Background Light (Cloud)** | `#F3F8FC` | Latar belakang kanvas aplikasi yang sejuk di mata |
| **Surface Card (Pure White)** | `#FFFFFF` | Latar kartu instruksi, modal pop-up, panel editor |
| **Text Primary (Deep Navy)** | `#1E293B` | Warna teks utama (kontras tinggi, lebih ramah dibanding hitam pekat) |
| **Text Secondary (Slate)** | `#64748B` | Teks keterangan bantuan, nomor level |
| **Text On Dark (Pure White)** | `#FFFFFF` | Teks di atas tombol warna pekat |

---

### 2.2. Tipografi (Typography)

Menggunakan kombinasi font Sans-Serif geometris bulat yang ramah anak (*Friendly Rounded*) untuk UI teks dan font Monospace tebal untuk blok instruksi coding.

- **Primary Font Family**: `Fredoka`, `Nunito`, atau `Baloo 2` (Fallback: `'Comic Sans MS'`, `'Quicksand'`, system sans-serif)
- **Code Block Font Family**: `Fira Code`, `JetBrains Mono`, atau `Chivo Mono` (dengan ketebalan bold untuk blok visual)

| Skala Tipografi | Ukuran (Desktop) | Ukuran (Mobile) | Weight | Kegunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | 44px / 2.75rem | 32px / 2.0rem | 800 (ExtraBold) | Judul Game, Modal Kemenangan Besar |
| **Heading 1 (H1)** | 32px / 2.0rem | 26px / 1.625rem | 700 (Bold) | Judul Halaman (Peta Dunia, Level Title) |
| **Heading 2 (H2)** | 24px / 1.5rem | 20px / 1.25rem | 700 (Bold) | Judul Card, Nama Karakter, Dialog |
| **Body Large (B1)** | 18px / 1.125rem | 16px / 1.0rem | 600 (SemiBold) | Teks instruksi misi, panduan tutor |
| **Body Regular (B2)** | 16px / 1.0rem | 14px / 0.875rem | 500 (Medium) | Keterangan tombol kecil, tooltip |
| **Code Block Text** | 16px / 1.0rem | 14px / 0.875rem | 700 (Bold) | Tulisan di dalam blok coding visual (Maju, Putar) |

*Catatan Keterbacaan*: Line-height dijaga longgar (1.5 - 1.6) agar anak-anak SD yang sedang tahap lancar membaca dapat melacak kalimat tanpa terlewati.

---

### 2.3. Komponen Tombol (Buttons)

Tombol didesain menggunakan teknik **Tactile 3D Extrusion (Chunky Game Buttons)**:
- Sudut `rounded-2xl` (16px) hingga `rounded-full` (kapsul).
- Border bawah tebal (4px - 6px) dengan warna gelap sepadan (*shadow plate*).
- **Efek Interaksi**:
  - `Hover`: Naik sedikit (-2px translateY) + efek kilau (*shimmer effect*).
  - `Active / Pressed`: Turun (+4px translateY) memadatkan border bawah, menghasilkan ilusi tombol fisik ditekan secara nyata.
  - `Focus-Visible`: Outline cyan terang 3px dengan offset 2px untuk aksesibilitas navigasi keyboard.

#### Ragam Varian Tombol:
1. **Button Play/Action (Secondary Amber)**:
   - Latar: `#FFAE00`, Border bawah: 5px solid `#D48800`, Teks: `#FFFFFF` tebal, Ikon segitiga Play bulat.
2. **Button Run Code (Success Green)**:
   - Latar: `#2ECB71`, Border bawah: 5px solid `#209E55`, Teks: `#FFFFFF`, Ikon roket / play hijau.
3. **Button Reset/Batal (Danger Soft Pink)**:
   - Latar: `#FF4B72`, Border bawah: 5px solid `#C92C4E`, Teks: `#FFFFFF`, Ikon reload bulat.
4. **Button Icon-Only (Square / Circle Chunky)**:
   - Ukuran 56x56px (Desktop) / 48x48px (Mobile) untuk navigasi audio, pause, dan tombol bantuan (Hint).

---

### 2.4. Komponen Kartu (Cards) & Wadah (Containers)

- **Latar**: Putih `#FFFFFF` dengan border solid 2px atau 3px `#E2E8F0` / `#CBD5E1`.
- **Corner Radius**: `rounded-3xl` (24px) untuk card besar, `rounded-2xl` (16px) untuk card modul.
- **Drop Shadow**: Efek bayangan kartun lembut: `box-shadow: 0 8px 0 #E2E8F0, 0 12px 20px rgba(0, 0, 0, 0.05)`.
- **Card Interaktif (Level Selector, Avatar Card)**:
  - Saat di-hover: border berubah menjadi `#00C2CB`, card sedikit bergoyang (*gentle tilt/wiggle 1-2 deg*).
  - Saat dipilih (*selected*): Border tebal 4px `#00C2CB` dengan tanda centang animasi mengambang di pojok kanan atas.

---

### 2.5. Ikonografi & Gaya Ilustrasi (Icons & Illustrations)

- **Gaya Ikon**: *Duotone Chunky Line-Art* dengan sudut lengkung (*stroke round cap & join*), ketebalan garis 2.5px - 3px.
  - Bebas dari simbol rumit; selalu disertai label teks atau simbol universal yang dikenal anak (Contoh: Bintang untuk skor, Kunci untuk level terkunci, Hati untuk kesempatan/nyawa, Tanda Tanya lucu untuk petunjuk).
- **Gaya Ilustrasi (Art Style)**:
  - Gaya *Isometric Pop-Cartoon* atau *Flat 2D Chunky Vector* terinspirasi dari game ramah anak modern (seperti Roblox UI, Toca Life, Duolingo for Kids).
  - Karakter memiliki proporsi kepala besar (*chibi / cute mascot style*) dengan mata ekspresif yang berkedip dan bereaksi terhadap aksi pemain.
  - Blok coding divisualisasikan menyerupai kepingan puzzle yang saling mengunci (*interlocking jigsaw tabs*), bukan teks terminal.

---

## 3. Spesifikasi Rancang Layar (Screen-by-Screen Wireframe & Flows)

### 3.1. Layar 1: Home (Beranda Utama)

**Tujuan**: Menyambut pemain cilik dengan suasana seru, hangat, dan langsung mengarahkan ke permainan.

```
+-----------------------------------------------------------------------+
|  [Logo ByteSize 🚀]                 [Audio 🔊] [Profil Avatar 🐱 ▾]  |
|                                                                       |
|                     🐾 Selamat Datang di ByteSize! 🐾                 |
|                                                                       |
|                    +-----------------------------+                    |
|                    |                             |                    |
|                    |     [ Karakter Maskot:      |                    |
|                    |       "Robo-Kucing Bytey"   |                    |
|                    |       Melompat Ceria 👋 ]   |                    |
|                    |                             |                    |
|                    +-----------------------------+                    |
|                                                                       |
|                   +-------------------------------+                   |
|                   |    ⭐ [ PETUALANGAN BARU ] ⭐  |   <-- CTA Utama   |
|                   +-------------------------------+                   |
|                                                                       |
|         [ 🗺️ Lanjutkan Peta ]            [ 🎨 Ganti Avatar ]          |
|                                                                       |
+-----------------------------------------------------------------------+
```

**Elemen Utama**:
- **Header**: Logo animasi lentur "ByteSize", tombol toggle audio/musik (ramah anak dengan status visual on/off yang jelas), dan ikon avatar pemain saat ini.
- **Hero Centerpiece**: Maskot utama "Bytey" (robot kucing ramah) yang melambai dengan mata berkedip. Balon kata bertuliskan: *"Halo Teman Coding! Ayo bantu Bytey mengumpulkan baterai bintang!"*
- **Aksi Utama**:
  - Tombol raksasa kuning amber: **"MULAI PETUALANGAN"** (efek denyut lembut / *gentle pulse*).
  - Tombol sekunder: **"Lanjutkan Level Terakhir"** dan **"Pilih Avatar"**.

---

### 3.2. Layar 2: Pemilihan Avatar (Avatar Selection)

**Tujuan**: Memberikan rasa kepemilikan (*sense of agency*) dan ekspresi diri bagi anak sejak awal.

```
+-----------------------------------------------------------------------+
|  [ < Kembali ]               PILIH JAGOANMU!                 [ Bantuan ❓]|
|                                                                       |
|       +---------------+   +---------------+   +---------------+       |
|       |   🐱 Bytey    |   |   🐶 Pixel    |   |   🤖 Bolt     |       |
|       | (Kucing Cerdik|   | (Anjing Lincah|   | (Robot Pintar)|       |
|       |               |   |               |   |   [TERKUNCI]  |       |
|       |  [✓ DIPILIH]  |   |   [ PILIH ]   |   |   [ 🔒 Lv.5 ] |       |
|       +---------------+   +---------------+   +---------------+       |
|                                                                       |
|   Nama Jagoanmu: [ Petualang Cilik _________ ]  [ ✏️ Ganti Nama ]     |
|                                                                       |
|                    +-----------------------------+                    |
|                    |     [ SIAP BERANGKAT! 🚀 ]  |                    |
|                    +-----------------------------+                    |
+-----------------------------------------------------------------------+
```

**Elemen Utama**:
- **Katalog Karakter (Grid Card)**:
  - 4-6 karakter unik dengan kepribadian berbeda (Contoh: Bytey si Kucing, Pixel si Anjing Astronot, Gigi si Dinosaurus Mekanik, Bolt si Robot).
  - Status Card: *Aktif Dipilih* (bercahaya emas + confetti kecil), *Bisa Dipilih* (kartu putih cerah), *Terkunci* (semi-transparan dengan gembok emas dan tulisan "Buka di Dunia 2").
- **Pratinjau Suara Karakter**: Setiap kali kartu avatar diklik, ada efek suara khas yang menggemaskan (meow lucu, bip robot ceria).
- **Input Nama Panggilan**: Input box besar dengan font ramah anak untuk mengetik nama panggilan atau memilih dari saran nama otomatis (misal: "Bintang Kilat", "Kapten Ceria").
- **Tombol Konfirmasi**: "SIAP BERANGKAT! 🚀" menuju Peta Dunia.

---

### 3.3. Layar 3: Peta Dunia & Pilihan Level (World Map)

**Tujuan**: Menggambarkan progres belajar seperti petualangan mendaki pulau fantasi bertingkat.

```
+-----------------------------------------------------------------------+
|  [ < Menu ]   Dunia 1: Lembah Algoritma 🌴        ⭐ 14/18  [ ⚙️ Pengaturan ]|
|                                                                       |
|                                  [ (🏁 BOSS: Level 5) 🔒 ]            |
|                                             |                         |
|                                    [ (Level 4) ⭐⭐ ]                 |
|                                             /                         |
|                                   [ (Level 3) ⭐⭐⭐ ]                |
|                                           |                           |
|                                   [ (Level 2) ⭐⭐⭐ ]                |
|                                           \                           |
|           [ Karakter Ada Di Sini -> 🐱 ] [ (Level 1) ⭐⭐⭐ ]         |
|                                                                       |
|   < [ Dunia Sebelumnya ]                    [ Dunia Berikutnya > 🔒 ] |
+-----------------------------------------------------------------------+
```

**Elemen Utama**:
- **Lintasan Petualangan Berkelok (*Winding Path Road*)**:
  - Jalur beraspal kartun dengan pulau bertema (Dunia 1: Lembah Algoritma dasar, Dunia 2: Danau Pengulangan/Loop, Dunia 3: Gua Kondisi/If-Else).
- **Node Level (Pin Berbentuk Lingkaran 3D)**:
  - **Selesai**: Berwarna hijau/kuning emas lengkap dengan 1-3 bintang di atas pin.
  - **Level Saat Ini**: Berwarna cyan terang berdenyut, karakter avatar berdiri melompat-lompat di atas node tersebut.
  - **Terkunci**: Pin batu abu-abu dengan gembok perak.
- **Modal Pratinjau Level**: Ketika pin aktif disentuh, muncul pop-up mini:
  - Gambar tantangan singkat, misi (misal: *"Bantu Bytey mengambil 2 Baterai!"*), rekor bintang, dan tombol besar **"MAIN SEKARANG!"**.

---

### 3.4. Layar 4: Gameplay (Arena Coding Anak)

**Tujuan**: Ruang kerja interaktif yang intuitif membagi area panggung permainan visual dengan area penyusunan logika (*drag-and-drop / click-to-add block coding*).

```
+-----------------------------------------------------------------------+
| [ < Peta ]  Level 2: Ambil Baterai! 🔋        Petunjuk 💡 | Bintang ⭐⭐⭐ |
+-----------------------------------+-----------------------------------+
| AREA 1: PANGGUNG GAME (Visual)    | AREA 2: KANVAS BLOK KODING        |
|                                   |                                   |
|   +---------------------------+   | [ Blok Tersedia: ]                |
|   | [Kucing] . . . [Rintangan]|   | +-------+ +-------+ +-------+     |
|   |   .      .         .      |   | | Maju  | | Belok | | Ambil |     |
|   |   .   [Baterai]    .      |   | |  ➡️   | |  ↩️   | |  ⭐   |     |
|   |   .      .      [Tujuan🏁]|   | +-------+ +-------+ +-------+     |
|   +---------------------------+   |                                   |
|                                   | [ Urutan Kodemu: ] (Baki Puzzle)  |
| Instruksi: "Langkahkan kucing 3x  | 1. [ Maju ➡️          ] [ ✕ Hapus]|
| lalu ambil baterai bercahaya!"    | 2. [ Maju ➡️          ] [ ✕ Hapus]|
|                                   | 3. [ Ambil ⭐         ] [ ✕ Hapus]|
|                                   |                                   |
| --------------------------------- | --------------------------------- |
| [ 🔄 Reset Posisi ]               | [ ▶️ JALANKAN KODE! ]  (Hijau Besar)|
+-----------------------------------+-----------------------------------+
```

**Elemen Utama**:
- **Split-Screen Ergonomis**:
  - **Sisi Kiri (Stage Permainan Visual)**:
    - Grid visual berbentuk blok isometrik 3D ramah anak.
    - Menampilkan karakter, jalur jalan, item bintang/baterai yang bisa dikoleksi, serta titik garis finish.
    - Kotak balon instruksi suara/teks singkat dari mentor robot.
  - **Sisi Kanan (Code Workshop / Baki Balok Coding)**:
    - **Palette Blok**: Tombol balok perintah dengan ikon + teks jelas (Maju 1 Langkah, Belok Kanan, Belok Kiri, Lompat, Ulangi 2x).
    - **Code Workspace**: Jalur susunan puzzle vertikal bernomor langkah (1, 2, 3...) sehingga anak mudah membaca urutan sekuensial (*step-by-step logic*).
    - **Aksi Cepat**: Tombol silang merah pada setiap balok untuk menghapus langkah yang salah tanpa repot.
- **Kontrol Eksekusi Bawah**:
  - Tombol **"JALANKAN KODE! ▶️"**: Hijau menyala besar di kanan bawah. Ketika ditekan, karakter di panggung kiri bergerak step-by-step, dan balok di sisi kanan menyala oranye sesuai langkah yang sedang dieksekusi (*live code tracing*).
  - Tombol **"RESET POSISI 🔄"**: Mengembalikan panggung dan karakter ke titik awal tanpa menghapus susunan kode anak.

---

### 3.5. Layar 5: Hasil Level (Victory & Retry Modal)

**Tujuan**: Memberi dorongan positif, perayaan pencapaian, atau motivasi hangat jika belum berhasil.

#### Skenario A: Kemenangan (Level Cleared)
```
+-------------------------------------------------------------+
|                                                             |
|                    🎉 LUAR BIASA! 🎉                        |
|                                                             |
|                   ⭐     ⭐     ⭐                         |
|                 (Pop!)  (Pop!)  (Pop!)                      |
|                                                             |
|           [ Karakter Menari Bahagia Bersama Trofi 🏆 ]      |
|                                                             |
|               "Kamu Berhasil Menyelesaikan                   |
|                  Tantangan Algoritma!"                      |
|                                                             |
|          Koin Didapat: +30 🟡   |   Langkah Efisien: ✓      |
|                                                             |
|    +-----------------------------+   +-------------------+  |
|    |     [ LEVEL BERIKUTNYA ➡️ ] |   |   [ ULANGI 🔄 ]   |  |
|    +-----------------------------+   +-------------------+  |
+-------------------------------------------------------------+
```

- **Animasi Pop-Up**: Bintang muncul berurutan dengan suara gemerincing koin (*ding-ding-ding!*).
- **Feedback Evaluasi Positif**: Mengapresiasi logika anak (*"Kodingmu sangat rapi!"*).
- **Aksi Lanjutan**: Tombol besar amber **"LEVEL BERIKUTNYA ➡️"** dan tombol kecil **"Main Ulangi 🔄"**.

#### Skenario B: Belum Berhasil (Encouraging Retry / Oops!)
- Judul: *"Hampir Berhasil! Yuk Coba Lagi! 💪"*
- Maskot tidak bersedih dramatis, melainkan tersenyum sambil membawa kaca pembesar (*"Bytey terbentur sedikit, coba cek langkah nomor 3 ya!"*).
- Tombol: **"PERIKSA KODEKU 🔍"** (kembali ke editor dengan langkah yang keliru ditandai warna kuning) dan **"COBA LAGI 🔄"**.

---

## 4. Rencana Tata Letak Responsif (Responsive Layout Strategy)

Game ByteSize dirancang untuk dapat diakses di komputer sekolah (Lab Komputer Desktop/Chromebook), tablet keluarga (iPad/Android), serta smartphone orang tua.

| Fitur / Layar | Desktop (≥ 1024px) | Tablet / iPad (768px - 1023px) | Mobile Smartphone (< 768px) |
| :--- | :--- | :--- | :--- |
| **Grid Sistem** | 12 Kolom, Kanvas Lebar Terpusat (Max-width: 1280px) | 8 Kolom, Adaptif Sentuhan | 4 Kolom, Full-Width dengan bantalan sisi 16px |
| **Layar Home** | Karakter maskot besar di kiri, tombol aksi di kanan | Karakter di atas, tombol bersusun di bawah | Karakter di atas, tombol vertikal penuh (*sticky friendly*) |
| **Peta Dunia** | Peta horizontal luas atau vertikal dengan latar pemandangan penuh | Peta vertikal fleksibel, mudah digulir jari | Peta vertikal terpusat satu alur, pin level ekstra tebal |
| **Gameplay Screen** | **Split-Screen Horizontal**: Sisi kiri Stage Game (50%), sisi kanan Code Editor (50%) | **Split-Screen Seimbang**: Stage (45%), Editor (55%) dengan orientasi landscape direkomendasikan | **Tab / Bottom-Sheet Mode**: Stage di bagian atas (40vh tetap terlihat), Code Tray di bawah dalam bentuk swipeable sheet |
| **Target Sentuh Tombol** | 52px tinggi, padding horizontal 24px | 56px tinggi, padding horizontal 28px | 60px tinggi, padding horizontal penuh (mudah dijangkau ibu jari) |

### Penyesuaian Khusus Mobile (< 768px):
- Pada layar smartphone, orientasi **Landscape** sangat disarankan dengan memunculkan banner ramah: *"Putar layarmu ke samping untuk bermain lebih seru! 🔄"*.
- Jika dimainkan dalam orientasi Portrait, panggung game diperkecil proporsional dan blok perintah disusun horizontal scrollable di baris bawah.

---

## 5. Pedoman Interaksi Ramah Anak (Child-Friendly Ergonomics & Interaction)

1. **Prinsip Anti-Frustrasi (Zero Penalty)**:
   - Tidak ada sistem "Game Over" permanen atau nyawa habis yang mengharuskan anak menunggu berjam-jam.
   - Kesalahan adalah proses belajar dalam coding (*debugging*). Kesalahan diberikan nama ramah: *"Ada bug kecil yang tersesat!"*.
2. **Teks Pendukung Audio (Text-to-Speech / Voiceover Cue)**:
   - Di samping teks instruksi misi, disediakan ikon pengeras suara kecil 🔊. Ketika diklik, narasi suara ramah membacakan instruksi bagi siswa kelas 1-2 SD yang masih terbata-bata membaca.
3. **Interaksi Multi-Input (Drag & Drop + Tap to Insert)**:
   - Anak-anak dengan kemampuan motorik halus yang masih berkembang sering kesulitan melakukan *drag & drop* presisi.
   - Karena itu, sistem mendukung **"Klik Sekali untuk Masuk"**: menyentuh balok perintah langsung memasukkannya ke slot urutan koding berikutnya secara otomatis.
4. **Safety & Distraction-Free**:
   - Bebas dari tautan luar (*no external links*), bebas iklan pop-up (*no ads*), dan tombol pengaturan sensitif dilengkapi pelindung orang tua (*Parental Gate / Simple Math Lock* sederhana, misal: *"Berapa 3 + 4?"*).

---

## 6. Checklist Kesiapan Handover UI/UX ke Frontend Developer

- [x] Desain sistem warna, tipografi, dan gaya tombol didefinisikan lengkap.
- [x] Spesifikasi hierarki 5 layar utama (Home, Avatar, Map, Game, Victory) telah dimodelkan.
- [x] Layout responsif desktop, tablet, dan smartphone telah dirumuskan.
- [x] Ergonomi ramah anak dan aksesibilitas keterbacaan telah dipenuhi.
- [ ] *Tahap Berikutnya*: Menunggu persetujuan pengguna untuk melanjutkan ke implementasi kode React + TypeScript + Vite.

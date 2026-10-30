import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgress } from '../types/game';
import { sounds } from '../utils/sound';

interface DailyChallengeModalProps {
  progress: UserProgress;
  onClose: () => void;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

interface QuizChallenge {
  id: number;
  dateKey: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  question: string;
  codeSnippet: string;
  visualGraphic: {
    avatarEmoji: string;
    targetEmoji: string;
    pathDescription: string;
    gridVisual: string[];
  };
  options: {
    label: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  kidTip: string;
}

// Koleksi tantangan harian koding yang ramah anak SD
const DAILY_QUIZZES: QuizChallenge[] = [
  {
    id: 1,
    dateKey: 'day-1',
    category: 'Logika Gerak Robot',
    categoryColor: '#00C2CB',
    categoryIcon: '🤖',
    question: 'Robot Byte menghadap ke ATAS. Jika robot menjalankan perintah ini, ke mana arah robot sekarang?',
    codeSnippet: 'turnRight();\nturnRight();',
    visualGraphic: {
      avatarEmoji: '🤖',
      targetEmoji: '📍',
      pathDescription: 'Robot berputar ke kanan 2 kali berturut-turut.',
      gridVisual: [
        '⬆️ Awal: Menghadap ATAS',
        '➡️ Putar 1: Menghadap KANAN',
        '❓ Putar 2: Menghadap KEMANA?',
      ],
    },
    options: [
      { label: 'A', text: 'Menghadap ke BAWAH ⬇️', isCorrect: true, explanation: 'Tepat sekali! Putar kanan dari ATAS ke KANAN, lalu putar kanan lagi jadi ke BAWAH (180 derajat)!' },
      { label: 'B', text: 'Menghadap ke ATAS lagi ⬆️', isCorrect: false, explanation: 'Belum tepat. Untuk kembali ke ATAS, robot perlu berputar 4 kali.' },
      { label: 'C', text: 'Menghadap ke KIRI ⬅️', isCorrect: false, explanation: 'Belum tepat. Berputar kanan 2 kali membawa robot berbalik ke arah sebaliknya (BAWAH).' },
    ],
    kidTip: 'Bayangkan kamu berdiri menghadap papan tulis, lalu berputar ke kanan dua kali. Sekarang kamu menghadap ke belakang!',
  },
  {
    id: 2,
    dateKey: 'day-2',
    category: 'Perulangan (Loop)',
    categoryColor: '#8854D0',
    categoryIcon: '🌀',
    question: 'Ada 3 buah apel di jalan. Berapa kali balok perulangan (repeat) harus dijalankan untuk mengambil semua apel?',
    codeSnippet: 'repeat( ? ) {\n  moveForward();\n  collect();\n}',
    visualGraphic: {
      avatarEmoji: '🐱',
      targetEmoji: '🍎🍎🍎',
      pathDescription: 'Ada 3 buah apel berjejer lurus di depan kucing.',
      gridVisual: [
        '🐱 ➔ 🍎 ➔ 🍎 ➔ 🍎',
      ],
    },
    options: [
      { label: 'A', text: 'repeat(1) — 1 kali', isCorrect: false, explanation: 'Jika 1 kali, kucing hanya akan mengambil 1 apel pertama saja.' },
      { label: 'B', text: 'repeat(3) — 3 kali', isCorrect: true, explanation: 'Hebat! Karena ada 3 apel, repeat(3) akan mengulang ambil apel sebanyak 3 kali pas!' },
      { label: 'C', text: 'repeat(5) — 5 kali', isCorrect: false, explanation: 'Kebanyakan! Apelnya hanya ada 3, nanti robot menabrak ujung jalan.' },
    ],
    kidTip: 'Hitung jumlah benda yang mau diambil, itulah angka yang dimasukkan ke dalam repeat( )!',
  },
  {
    id: 3,
    dateKey: 'day-3',
    category: 'Kondisi Logika (If-Else)',
    categoryColor: '#F59E0B',
    categoryIcon: '🔀',
    question: 'Jika di depan ada BATU besar, apa yang sebaiknya dilakukan robot agar tidak menabrak?',
    codeSnippet: 'if (adaBatuDiDepan()) {\n  // Lakukan apa ya?\n}',
    visualGraphic: {
      avatarEmoji: '🐶',
      targetEmoji: '🪨',
      pathDescription: 'Anjing sedang berjalan dan melihat batu besar menghalangi jalannya.',
      gridVisual: [
        '🐶 ➔ 🪨 [BATU BESAR] ➔ 🏁',
      ],
    },
    options: [
      { label: 'A', text: 'Belok Kanan atau Kiri (turnRight / turnLeft)', isCorrect: true, explanation: 'Pintar! Menghindar dengan berbelok adalah cara paling aman agar tidak menabrak batu!' },
      { label: 'B', text: 'Maju terus (moveForward)', isCorrect: false, explanation: 'Aduh! Kalau maju terus, robot akan menabrak batu keras!' },
      { label: 'C', text: 'Ambil batu (collect)', isCorrect: false, explanation: 'Batu adalah rintangan berat, bukan barang koleksi seperti koin atau bintang.' },
    ],
    kidTip: 'Dalam koding, "if" dipakai untuk memeriksa apakah ada rintangan sebelum melangkah!',
  },
  {
    id: 4,
    dateKey: 'day-4',
    category: 'Membaca Kode (Tebak Langkah)',
    categoryColor: '#10B981',
    categoryIcon: '🔍',
    question: 'Berapa langkah total robot bergerak MAJU setelah kode ini dijalankan?',
    codeSnippet: 'moveForward();\nrepeat(2) {\n  moveForward();\n}\nmoveForward();',
    visualGraphic: {
      avatarEmoji: '🦊',
      targetEmoji: '⭐',
      pathDescription: 'Maju 1 kali, lalu repeat 2 kali maju, lalu maju 1 kali lagi.',
      gridVisual: [
        'Langkah 1: moveForward() ➔ 1 langkah',
        'Langkah 2: repeat(2) { moveForward() } ➔ 2 langkah',
        'Langkah 3: moveForward() ➔ 1 langkah',
      ],
    },
    options: [
      { label: 'A', text: '3 Langkah', isCorrect: false, explanation: 'Kurang tepat. Jangan lupa hitung repeat(2) yang mengulang 2 kali!' },
      { label: 'B', text: '4 Langkah', isCorrect: true, explanation: 'Luar biasa! 1 + 2 + 1 = 4 langkah maju seluruhnya!' },
      { label: 'C', text: '2 Langkah', isCorrect: false, explanation: 'Kurang tepat, ada beberapa baris moveForward() yang dijalankan.' },
    ],
    kidTip: 'Jumlahkan setiap gerakan maju: 1 di awal + 2 dari repeat + 1 di akhir = 4!',
  },
  {
    id: 5,
    dateKey: 'day-5',
    category: 'Detektif Bug (Kutu Koding)',
    categoryColor: '#EF4444',
    categoryIcon: '🐞',
    question: 'Kode ini macet karena ada huruf atau tanda yang hilang! Di manakah letak bug-nya?',
    codeSnippet: 'repeat 3 {\n  moveForward();\n}',
    visualGraphic: {
      avatarEmoji: '🐼',
      targetEmoji: '🔍',
      pathDescription: 'Komputer bingung membaca angka 3 karena tidak ada tanda kurung.',
      gridVisual: [
        '❌ Salah: repeat 3',
        '✅ Benar: repeat(3)',
      ],
    },
    options: [
      { label: 'A', text: 'Kurang tanda kurung ( ) pada angka 3', isCorrect: true, explanation: 'Benar sekali detektif cilik! Komputer butuh tanda kurung: repeat(3).' },
      { label: 'B', text: 'Kata "repeat" harus ditulis "ulang"', isCorrect: false, explanation: 'JavaScript menggunakan bahasa Inggris "repeat", jadi kata itu sudah benar.' },
      { label: 'C', text: 'Tidak boleh pakai angka 3', isCorrect: false, explanation: 'Angka 3 boleh dipakai, asalkan ditaruh di dalam tanda kurung.' },
    ],
    kidTip: 'Setiap perintah koding seperti repeat butuh tanda kurung () untuk membungkus angkanya!',
  },
];

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  progress,
  onClose,
  onUpdateProgress,
}) => {
  // Pilih kuis berdasarkan hari kalender (atau rotasi hari)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const challengeIndex = dayOfYear % DAILY_QUIZZES.length;
  const currentQuiz = DAILY_QUIZZES[challengeIndex];

  // Simpan tanggal pengerjaan terakhir di progress & localStorage agar streak akurat
  const todayDateString = today.toISOString().split('T')[0];
  const lastCompletedDate = progress.lastDailyQuizDate || localStorage.getItem(`bytesize_daily_date_${progress.playerName}`);
  const storedStreak = progress.dailyStreak !== undefined 
    ? progress.dailyStreak 
    : parseInt(localStorage.getItem(`bytesize_daily_streak_${progress.playerName}`) || '1', 10);

  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState<boolean>(lastCompletedDate === todayDateString);
  const [streakCount, setStreakCount] = useState<number>(storedStreak);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(alreadyCompletedToday);
  const [isCorrect, setIsCorrect] = useState<boolean>(alreadyCompletedToday);

  const handleSelectOption = (idx: number) => {
    if (isAnswered && alreadyCompletedToday) return;

    sounds.playClick();
    setSelectedOptionIndex(idx);
    const chosen = currentQuiz.options[idx];

    if (chosen.isCorrect) {
      sounds.playVictory();
      setIsCorrect(true);
      setIsAnswered(true);

      if (!alreadyCompletedToday) {
        // Efek koin & confetti meledak
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#FFAE00', '#00C2CB', '#10B981', '#FEF08A'],
          });
        } catch {
          // fallback
        }

        // Hitung streak baru
        const newStreak = lastCompletedDate === getYesterdayDateString() ? storedStreak + 1 : (lastCompletedDate === todayDateString ? storedStreak : 1);
        setStreakCount(newStreak);
        localStorage.setItem(`bytesize_daily_date_${progress.playerName}`, todayDateString);
        localStorage.setItem(`bytesize_daily_streak_${progress.playerName}`, newStreak.toString());
        setAlreadyCompletedToday(true);

        // Tambah koin bonus ke progress anak (+25 koin) dan simpan streak secara permanen
        onUpdateProgress(prev => ({
          ...prev,
          coins: prev.coins + 25,
          dailyStreak: newStreak,
          lastDailyQuizDate: todayDateString,
        }));
      }
    } else {
      sounds.playBump();
      setIsCorrect(false);
      setIsAnswered(true);
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    setIsAnswered(false);
    setSelectedOptionIndex(null);
  };

  function getYesterdayDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
    >
      <div
        className="card-kid"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(255, 255, 255, 0.8)',
          border: '4px solid #FCD34D',
          position: 'relative',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Tombol Tutup Pojok Kanan Atas */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="btn-chunky btn-white"
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            zIndex: 10,
            width: '38px',
            height: '38px',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            border: '2px solid #CBD5E1',
            boxShadow: '0 3px 0 #94A3B8',
          }}
          title="Tutup Tantangan"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* HEADER MODAL DENGAN STREAK API */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 60%, #FEF9C3 100%)',
          padding: '18px 64px 16px 20px',
          borderBottom: '3px dashed #FCD34D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '18px',
              backgroundColor: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 4px 0 #D97706',
              flexShrink: 0,
            }}>
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  backgroundColor: '#FDE68A',
                  color: '#92400E',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  Kuis Kilat 1 Menit
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309' }}>
                  {currentQuiz.category}
                </span>
              </div>
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#78350F',
                lineHeight: 1.2,
                marginTop: '2px',
              }}>
                Tantangan Koding Harian
              </h2>
            </div>
          </div>

          {/* Badge Streak Harian Gaya Api TikTok */}
          <div 
            className="tiktok-streak-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '20px',
              padding: '8px 18px',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.45)',
            }}
          >
            <span className="tiktok-fire-icon" style={{ fontSize: '1.8rem', lineHeight: 1 }}>
              🔥
            </span>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#FEF08A', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                STREAK API KODING
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {streakCount} HARI AKTIF!
              </div>
            </div>
          </div>
        </div>

        {/* KONTEN UTAMA KUIS */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flex: 1,
          willChange: 'scroll-position',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Banner Hadiah Koin */}
          <div style={{
            backgroundColor: alreadyCompletedToday ? '#ECFDF5' : '#FFFBEB',
            border: alreadyCompletedToday ? '2px solid #6EE7B7' : '2px solid #FDE68A',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{alreadyCompletedToday ? '🎉' : '🎁'}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: alreadyCompletedToday ? '#065F46' : '#92400E' }}>
                {alreadyCompletedToday
                  ? 'Tantangan hari ini sudah kamu selesaikan! Koin bonus +25 🪙 telah masuk.'
                  : 'Selesaikan kuis ini untuk mendapatkan bonus +25 Koin Koding 🪙!'}
              </span>
            </div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #F59E0B',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: 900,
              color: '#B45309',
              flexShrink: 0,
            }}>
              +25 🪙
            </div>
          </div>

          {/* Kartu Pertanyaan */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '2.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: '18px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: currentQuiz.categoryColor,
              fontWeight: 800,
              fontSize: '0.8rem',
              marginBottom: '6px',
            }}>
              <span>{currentQuiz.categoryIcon}</span>
              <span>Pertanyaan Hari Ini:</span>
            </div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: 'var(--color-text-navy)',
              lineHeight: 1.4,
              marginBottom: '14px',
            }}>
              {currentQuiz.question}
            </h3>

            {/* Kotak Kode JavaScript / Ilustrasi Visual */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginBottom: '6px',
            }}>
              {/* Snippet Kode */}
              <div style={{
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                borderRadius: '16px',
                padding: '14px 16px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                border: '2px solid #334155',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
                  💻 Kode JavaScript:
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#38BDF8' }}>
                  {currentQuiz.codeSnippet}
                </pre>
              </div>

              {/* Visual Animasi / Alur Sederhana */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '2px dashed #93C5FD',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase' }}>
                  🧭 Petunjuk Langkah:
                </div>
                {currentQuiz.visualGraphic.gridVisual.map((step, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Opsi Jawaban (Pilihan Ganda Chunky) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} />
              <span>Pilih jawaban yang paling benar:</span>
            </div>

            {currentQuiz.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              let btnBg = '#FFFFFF';
              let btnBorder = '#E2E8F0';
              let textColor = 'var(--color-text-navy)';

              if (isAnswered && isSelected) {
                if (opt.isCorrect) {
                  btnBg = '#DCFCE7';
                  btnBorder = '#22C55E';
                  textColor = '#15803D';
                } else {
                  btnBg = '#FEE2E2';
                  btnBorder = '#EF4444';
                  textColor = '#B91C1C';
                }
              } else if (isAnswered && opt.isCorrect) {
                btnBg = '#F0FDF4';
                btnBorder = '#86EFAC';
                textColor = '#166534';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="btn-chunky card-kid-interactive"
                  style={{
                    backgroundColor: btnBg,
                    border: `2.5px solid ${btnBorder}`,
                    borderRadius: '18px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'left',
                    cursor: isAnswered && alreadyCompletedToday ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 2px 0 rgba(0,0,0,0.1)' : '0 4px 0 #CBD5E1',
                    transform: isSelected ? 'translateY(2px)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? (opt.isCorrect ? '#22C55E' : '#EF4444') : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    {opt.label}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: textColor }}>
                      {opt.text}
                    </div>
                    {isAnswered && (isSelected || opt.isCorrect) && (
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginTop: '4px',
                        color: opt.isCorrect ? '#166534' : '#991B1B',
                      }}>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Hasil Jawaban */}
          {isAnswered && (
            <div style={{
              borderRadius: '20px',
              padding: '16px 20px',
              backgroundColor: isCorrect ? '#DCFCE7' : '#FEF2F2',
              border: isCorrect ? '2.5px solid #4ADE80' : '2.5px solid #FCA5A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{isCorrect ? '🏆' : '💡'}</span>
                <div>
                  <h4 style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: isCorrect ? '#166534' : '#991B1B',
                    margin: 0,
                  }}>
                    {isCorrect ? 'Jawabanmu Tepat Sekali! Hore!' : 'Hampir Benar! Jangan Menyerah!'}
                  </h4>
                  <p style={{
                    fontSize: '0.82rem',
                    color: isCorrect ? '#14532D' : '#7F1D1D',
                    margin: '2px 0 0',
                    fontWeight: 600,
                  }}>
                    {isCorrect
                      ? `Hebat, logika kodingmu makin tajam! Streak bertambah jadi ${streakCount} hari.`
                      : 'Yuk coba pikirkan lagi berdasarkan petunjuk di atas, lalu coba sekali lagi!'}
                  </p>
                </div>
              </div>

              {!isCorrect && (
                <button
                  onClick={handleRetry}
                  className="btn-chunky btn-secondary btn-sm"
                  style={{ borderRadius: '12px', padding: '8px 16px' }}
                >
                  Coba Jawab Lagi 🔄
                </button>
              )}
            </div>
          )}

          {/* Tip Pintar Ramah Anak */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px dashed #FCD34D',
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#92400E',
            fontWeight: 700,
          }}>
            <Sparkles size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <span><strong>Tips Koding:</strong> {currentQuiz.kidTip}</span>
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div style={{
          padding: '12px 20px',
          borderTop: '2px solid #F1F5F9',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
            Tantangan baru hadir setiap hari secara otomatis! ☀️
          </span>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="btn-chunky btn-primary btn-sm"
            style={{ borderRadius: '14px', padding: '8px 20px' }}
          >
            Selesai ➔
          </button>
        </div>
      </div>
    </div>
  );
};

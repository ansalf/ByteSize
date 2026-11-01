import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BonusChallenge, CurriculumStageId } from '../types/game';
import { sounds } from '../utils/sound';

interface BonusChallengeModalProps {
  stageId: CurriculumStageId;
  onSuccessEarnHint: () => void;
  onClose: () => void;
}

const BONUS_CHALLENGES: Record<CurriculumStageId, BonusChallenge[]> = {
  BEGINNER: [
    {
      id: 'beg_debug_1',
      type: 'DEBUGGING',
      title: 'Tantangan Debugging: Cari Kesalahan Kode!',
      description: 'Robot tidak bergerak karena ada kesalahan penulisan perintah. Manakah baris kode yang benar?',
      codeSnippet: '// Kode bermasalah:\nmoveForward;\nTurnRight();\nmoveforward();',
      options: [
        'moveForward(); — harus memiliki tanda kurung dan huruf besar F (camelCase)',
        'moveForward; — tanpa tanda kurung sudah benar',
        'Semua baris di atas sudah benar',
      ],
      correctOptionIndex: 0,
      explanation: 'Di JavaScript, pemanggilan fungsi WAJIB menggunakan tanda kurung buka dan tutup `()`, serta memperhatikan huruf besar-kecil (camelCase).',
    },
    {
      id: 'beg_order_1',
      type: 'ORDERING',
      title: 'Tantangan Urutan: Susun Langkah yang Benar!',
      description: 'Bantu robot melangkah menuju bendera yang berjarak 2 petak di sebelah kanannya (robot mula-mula menghadap ke atas/UP).',
      orderItems: [
        { id: '1', text: 'turnRight();' },
        { id: '2', text: 'moveForward();' },
        { id: '3', text: 'moveForward();' },
      ],
      correctOrder: ['1', '2', '3'],
      explanation: 'Karena robot mula-mula menghadap ke atas, ia harus memutar badan ke kanan (turnRight) terlebih dahulu, baru melangkah maju 2 kali!',
    },
    {
      id: 'beg_concept_1',
      type: 'CONCEPT_QUIZ',
      title: 'Kuis Konsep: Algoritma Langkah',
      description: 'Apa yang dimaksud dengan "Algoritma" dalam pemrograman komputer?',
      options: [
        'Urutan instruksi langkah demi langkah yang logis untuk menyelesaikan tugas',
        'Sebuah tombol rahasia untuk mematikan komputer',
        'Kabel listrik yang terhubung ke stopkontak',
      ],
      correctOptionIndex: 0,
      explanation: 'Tepat sekali! Algoritma adalah urutan langkah logis dan teratur yang diikuti komputer untuk menyelesaikan suatu misi.',
    },
  ],
  INTERMEDIATE: [
    {
      id: 'int_debug_1',
      type: 'DEBUGGING',
      title: 'Tantangan Debugging: Perbaiki Perulangan repeat()',
      description: 'Seorang koder ingin robot melangkah maju 4 kali, tapi kode di bawah ini error. Apa kesalahannya?',
      codeSnippet: '// Kode yang salah:\nrepeat(4) {\n  moveForward();\n}',
      options: [
        'repeat() di JavaScript membutuhkan callback function: repeat(4, () => { moveForward(); });',
        'Angka 4 harus ditulis dengan kata "empat"',
        'moveForward() tidak boleh ada di dalam kurung kurawal',
      ],
      correctOptionIndex: 0,
      explanation: 'Bagus sekali! Pada JavaScript di ByteSize, fungsi repeat menerima parameter angka pengulangan dan callback: `repeat(4, () => { ... });`.',
    },
    {
      id: 'int_order_1',
      type: 'ORDERING',
      title: 'Tantangan Urutan: Tangga Zigzag',
      description: 'Susun urutan instruksi agar robot menaiki satu anak tangga zigzag (maju, belok kiri, maju, belok kanan):',
      orderItems: [
        { id: 'a', text: 'moveForward();' },
        { id: 'b', text: 'turnLeft();' },
        { id: 'c', text: 'moveForward();' },
        { id: 'd', text: 'turnRight();' },
      ],
      correctOrder: ['a', 'b', 'c', 'd'],
      explanation: 'Rangkaian maju -> belok kiri -> maju -> belok kanan membentuk siklus satu anak tangga zigzag yang sempurna!',
    },
    {
      id: 'int_concept_1',
      type: 'CONCEPT_QUIZ',
      title: 'Kuis Konsep: Nested Loop (Perulangan Bersarang)',
      description: 'Jika ada repeat(2, ...) dan di dalamnya terdapat repeat(3, ...), berapa total instruksi di bagian terdalam dijalankan?',
      options: [
        '6 kali (2 dikali 3)',
        '5 kali (2 ditambah 3)',
        '1 kali saja',
      ],
      correctOptionIndex: 0,
      explanation: 'Benar! Dalam nested loop, perulangan luar akan mengalikan seluruh perulangan di dalamnya (2 x 3 = 6 kali).',
    },
  ],
  ADVANCED: [
    {
      id: 'adv_debug_1',
      type: 'DEBUGGING',
      title: 'Tantangan Debugging: Sensor ifPathAhead()',
      description: 'Robot harus memeriksa apakah ada jalan di depan sebelum melangkah maju. Manakah sintaks logika yang benar?',
      codeSnippet: '// Pilihan sintaks:\nA) if (pathAhead) { move(); }\nB) ifPathAhead(() => { moveForward(); });\nC) pathAhead = true;',
      options: [
        'Pilihan B: ifPathAhead(() => { moveForward(); });',
        'Pilihan A',
        'Pilihan C',
      ],
      correctOptionIndex: 0,
      explanation: 'Tepat! ifPathAhead() adalah Higher-Order Function yang mengeksekusi blok kode hanya jika sensor mendeteksi jalan aman di depannya.',
    },
    {
      id: 'adv_concept_1',
      type: 'CONCEPT_QUIZ',
      title: 'Kuis Konsep: Efisiensi Jalur Algoritma',
      description: 'Mengapa kita sebaiknya menggunakan repeat() dibanding menulis puluhan moveForward() secara berulang?',
      options: [
        'Menghemat memori, membuat kode mudah dibaca, dan mencegah kesalahan ketik manual',
        'Supaya komputer cepat panas',
        'Agar robot berjalan mundur',
      ],
      correctOptionIndex: 0,
      explanation: 'Luar biasa! Kode yang modular dan efisien adalah standar programmer handal untuk mencegah bug dan mempermudah pemeliharaan.',
    },
  ],
  CREATOR_STUDIO: [
    {
      id: 'cs_concept_1',
      type: 'CONCEPT_QUIZ',
      title: 'Kuis Kreator: Desain Logika Game',
      description: 'Dalam pembuatan game labirin, apa elemen paling penting agar pemain merasa tertantang tapi tidak putus asa?',
      options: [
        'Jalur yang logis dengan petunjuk jelas dan tingkat kesulitan bertahap',
        'Membuat labirin tanpa jalan keluar',
        'Membuat rintangan yang tidak bisa dilewati',
      ],
      correctOptionIndex: 0,
      explanation: 'Tepat sekali! Game design yang baik memberikan tantangan yang adil, bertahap, dan selalu memiliki solusi nyata.',
    },
  ],
};

export const BonusChallengeModal: React.FC<BonusChallengeModalProps> = ({
  stageId,
  onSuccessEarnHint,
  onClose,
}) => {
  const challengePool = BONUS_CHALLENGES[stageId] || BONUS_CHALLENGES.BEGINNER;
  // Pilih salah satu challenge secara konsisten per sesi
  const [challengeIndex, setChallengeIndex] = useState(0);
  const currentChallenge = challengePool[challengeIndex % challengePool.length];

  // State untuk MCQ / Debugging
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // State untuk ORDERING
  const [orderedList, setOrderedList] = useState<Array<{ id: string; text: string }>>(() => {
    if (currentChallenge.orderItems) {
      // Acak urutan awal agar tidak langsung tersusun benar
      return [...currentChallenge.orderItems].reverse();
    }
    return [];
  });

  const [feedbackStatus, setFeedbackStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const handleSelectOption = (idx: number) => {
    if (feedbackStatus === 'CORRECT') return;
    sounds.playClick();
    setSelectedOption(idx);
    setFeedbackStatus('IDLE');
  };

  // Handler pindah posisi urutan (ORDERING)
  const handleMoveOrderItem = (fromIndex: number, toIndex: number) => {
    if (feedbackStatus === 'CORRECT') return;
    sounds.playClick();
    const updated = [...orderedList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedList(updated);
    setFeedbackStatus('IDLE');
  };

  const handleVerifyAnswer = () => {
    sounds.playClick();
    if (currentChallenge.type === 'ORDERING') {
      const currentIds = orderedList.map(item => item.id);
      const isCorrect = JSON.stringify(currentIds) === JSON.stringify(currentChallenge.correctOrder);
      if (isCorrect) {
        handleSuccess();
      } else {
        handleFailure('Urutan langkah instruksi belum tepat. Coba periksa kembali logika arah pergerakannya ya!');
      }
    } else {
      if (selectedOption === null) {
        setFeedbackStatus('WRONG');
        setFeedbackMessage('Silakan pilih salah satu jawaban terlebih dahulu!');
        return;
      }
      if (selectedOption === currentChallenge.correctOptionIndex) {
        handleSuccess();
      } else {
        handleFailure('Jawabanmu belum tepat. Ayo baca kembali petunjuk kode dengan teliti!');
      }
    }
  };

  const handleSuccess = () => {
    sounds.playVictory();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00C2CB', '#FFAE00', '#2ECB71'],
      });
    } catch {}
    setFeedbackStatus('CORRECT');
    setFeedbackMessage(currentChallenge.explanation);
  };

  const handleFailure = (msg: string) => {
    sounds.playBump();
    setFeedbackStatus('WRONG');
    setFeedbackMessage(msg);
  };

  const handleClaimHint = () => {
    sounds.playClick();
    onSuccessEarnHint();
  };

  const handleNextChallenge = () => {
    sounds.playClick();
    setChallengeIndex(prev => prev + 1);
    setSelectedOption(null);
    setFeedbackStatus('IDLE');
    setFeedbackMessage('');
    const nextChal = challengePool[(challengeIndex + 1) % challengePool.length];
    if (nextChal.orderItems) {
      setOrderedList([...nextChal.orderItems].reverse());
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 1300 }}>
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '26px',
          padding: 'clamp(20px, 4vw, 32px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
          border: '3.5px solid #FFAE00',
          position: 'relative',
        }}
      >
        {/* Tombol Tutup */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={22} />
        </button>

        {/* Header Tantangan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            border: '2px solid #FCD34D',
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tantangan Tambahan Hint
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
              {currentChallenge.title}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
          {currentChallenge.description}
        </p>

        {/* Snippet Kode (Jika Ada) */}
        {currentChallenge.codeSnippet && (
          <div style={{
            backgroundColor: '#0F172A',
            color: '#38BDF8',
            fontFamily: 'var(--font-family-code)',
            fontSize: '0.85rem',
            padding: '12px 14px',
            borderRadius: '12px',
            marginBottom: '16px',
            whiteSpace: 'pre-wrap',
            borderLeft: '4px solid #FFAE00',
          }}>
            {currentChallenge.codeSnippet}
          </div>
        )}

        {/* OPSI MULTIPLE CHOICE ATAU DEBUGGING */}
        {currentChallenge.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {currentChallenge.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={feedbackStatus === 'CORRECT'}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    textAlign: 'left',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '2.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                    color: isSelected ? '#1D4ED8' : '#334155',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.88rem',
                    cursor: feedbackStatus === 'CORRECT' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#3B82F6' : '#CBD5E1',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* OPSI URUTAN INSTRUKSI (ORDERING) */}
        {currentChallenge.type === 'ORDERING' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', marginBottom: '8px' }}>
              Gunakan tombol panah untuk menyusun urutan yang tepat:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orderedList.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    fontFamily: 'var(--font-family-code)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: '#E2E8F0',
                      color: '#475569',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                    }}>
                      {idx + 1}
                    </span>
                    <span>{item.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleMoveOrderItem(idx, idx - 1)}
                      disabled={idx === 0 || feedbackStatus === 'CORRECT'}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        opacity: idx === 0 ? 0.4 : 1,
                        fontSize: '0.8rem',
                        fontWeight: 900,
                      }}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveOrderItem(idx, idx + 1)}
                      disabled={idx === orderedList.length - 1 || feedbackStatus === 'CORRECT'}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        cursor: idx === orderedList.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: idx === orderedList.length - 1 ? 0.4 : 1,
                        fontSize: '0.8rem',
                        fontWeight: 900,
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK BANNER */}
        {feedbackStatus !== 'IDLE' && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            backgroundColor: feedbackStatus === 'CORRECT' ? '#DCFCE7' : '#FEF2F2',
            border: feedbackStatus === 'CORRECT' ? '2px solid #86EFAC' : '2px solid #FCA5A5',
            color: feedbackStatus === 'CORRECT' ? '#166534' : '#991B1B',
            fontSize: '0.88rem',
          }}>
            {feedbackStatus === 'CORRECT' ? (
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ lineHeight: 1.4 }}>
              <strong>{feedbackStatus === 'CORRECT' ? 'Jawaban Benar! 🎉' : 'Belum Tepat! 💡'}</strong>
              <div style={{ marginTop: '2px' }}>{feedbackMessage}</div>
            </div>
          </div>
        )}

        {/* TOMBOL AKSI */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {feedbackStatus === 'CORRECT' ? (
            <button
              onClick={handleClaimHint}
              className="btn-chunky btn-secondary"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                fontSize: '1rem',
              }}
            >
              <Award size={18} />
              <span>Klaim +1 Hint Tambahan! 💡</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleVerifyAnswer}
                className="btn-chunky btn-primary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontSize: '1rem',
                }}
              >
                <span>Periksa Jawaban ✓</span>
              </button>
              {feedbackStatus === 'WRONG' && (
                <button
                  onClick={handleNextChallenge}
                  className="btn-chunky btn-white"
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.88rem',
                  }}
                  title="Coba Soal Lain"
                >
                  <RotateCcw size={16} /> Ganti Soal
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

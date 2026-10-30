import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { BookOpen, Sparkles, HelpCircle, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface Stage1LessonReaderProps {
  level: LevelConfig;
  avatarId: string;
  savedAnswerIndex?: number;
  onSaveAnswer?: (answerIndex: number) => void;
  onProceedToChallenge: () => void;
  onBackToMap: () => void;
}

export const Stage1LessonReader: React.FC<Stage1LessonReaderProps> = ({
  level,
  avatarId,
  savedAnswerIndex,
  onSaveAnswer,
  onProceedToChallenge,
  onBackToMap,
}) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const { lessonMaterial } = level;

  // Acak soal dari questionPool jika tersedia, atau acak urutan pilihan jawaban berdasarkan levelId + session
  const activeQuestion = React.useMemo(() => {
    const tq = lessonMaterial.thinkingQuestion;
    if (tq.questionPool && tq.questionPool.length > 0) {
      // Pilih variasi soal acak
      const allVariations = [
        {
          question: tq.question,
          options: tq.options,
          correctAnswerIndex: tq.correctAnswerIndex,
          explanation: tq.explanation,
        },
        ...tq.questionPool,
      ];
      // Ambil indeks varian acak yang stabil per sesi user
      const randomIndex = Math.floor(Math.random() * allVariations.length);
      return allVariations[randomIndex];
    }
    return tq;
  }, [level.id]);

  // State untuk kuis pertanyaan pemahaman (tetap ingat jawaban tersimpan jika pernah dijawab)
  const [selectedOption, setSelectedOption] = useState<number | null>(
    savedAnswerIndex !== undefined ? savedAnswerIndex : null
  );
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(savedAnswerIndex !== undefined);

  const handleSelectOption = (idx: number) => {
    sounds.playClick();
    setSelectedOption(idx);
    setShowAnswerFeedback(true);
    if (onSaveAnswer) {
      onSaveAnswer(idx);
    }
    if (idx === activeQuestion.correctAnswerIndex) {
      sounds.playCollect();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2ECB71', '#00C2CB', '#FFAE00'],
        });
      } catch (e) {
        // safe fallback
      }
    } else {
      sounds.playBump();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '860px',
      margin: '0 auto',
      width: '100%',
      padding: '8px 4px',
    }}>
      {/* HEADER NAVIGASI & STATUS TAHAP */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          className="btn-chunky btn-white btn-sm"
          onClick={() => { 
            sounds.playClick(); 
            sounds.stopSpeech(); 
            onBackToMap(); 
          }}
        >
          <ArrowLeft size={18} /> Daftar Level
        </button>

        {/* STEPPER 2 TAHAP: BACA & PAHAMI -> COBA SENDIRI */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          padding: '6px 14px',
          borderRadius: '18px',
          border: '2px solid #E2E8F0',
          boxShadow: '0 2px 0 #CBD5E1',
          fontSize: '0.82rem',
          fontWeight: 800,
        }}>
          <span style={{
            backgroundColor: '#00C2CB',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: '12px',
          }}>
            1. BACA ✓
          </span>
          <span style={{ color: '#94A3B8' }}>➔</span>
          <span style={{
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            padding: '3px 10px',
            borderRadius: '12px',
          }}>
            2. COBA 🚀
          </span>
        </div>
      </div>

      {/* KARTU UTAMA MATERI BELAJAR */}
      <div className="card-kid" style={{
        padding: 'clamp(16px, 3.5vw, 24px)',
        border: '4px solid #BAE6FD',
        borderRadius: '28px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Banner Judul Materi */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: '#E0F2FE',
          padding: '16px 20px',
          borderRadius: '24px',
          border: '2px solid #BAE6FD',
        }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1 }} className="animate-gentle-bounce">
            {avatar.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: '10px',
              marginBottom: '6px',
            }}>
              <Sparkles size={14} /> LEVEL {level.id} • {lessonMaterial.conceptName}
            </div>
            <h2 style={{
              fontSize: 'clamp(1.3rem, 4vw, 1.85rem)',
              fontWeight: 800,
              color: 'var(--color-text-navy)',
              lineHeight: 1.2,
            }}>
              {lessonMaterial.title}
            </h2>
          </div>
        </div>

        {/* 1. Cerita Singkat Petualangan */}
        <div style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#F8FAFC',
          padding: '16px',
          borderRadius: '20px',
          border: '2px solid #E2E8F0',
        }}>
          <BookOpen size={24} color="#00C2CB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-navy)', marginBottom: '4px' }}>
              📖 Cerita Petualangan:
            </h4>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-slate)', lineHeight: 1.6 }}>
              {lessonMaterial.story}
            </p>
          </div>
        </div>

        {/* 2. Penjelasan Konsep Coding (Sederhana & Ramah Anak) */}
        <div style={{
          backgroundColor: '#FFFBEB',
          padding: '16px 20px',
          borderRadius: '20px',
          border: '2px solid #FDE68A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Lightbulb size={22} color="#D97706" />
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#B45309' }}>
              Apa Itu {lessonMaterial.conceptName}?
            </h4>
          </div>
          <p style={{ fontSize: '1rem', color: '#78350F', lineHeight: 1.6 }}>
            {lessonMaterial.conceptExplanation}
          </p>
        </div>

        {/* 3. Cara Menulis Kode & Contoh Sintaks JavaScript */}
        <div style={{
          backgroundColor: '#0F172A',
          padding: '20px',
          borderRadius: '24px',
          color: '#F8FAFC',
          boxShadow: '0 6px 0 #000000',
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#38BDF8',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            💻 Contoh Kode JavaScript:
          </div>

          <pre style={{
            backgroundColor: '#1E293B',
            padding: '14px 18px',
            borderRadius: '16px',
            fontFamily: 'var(--font-family-code)',
            fontSize: '1.05rem',
            color: '#FDE047',
            lineHeight: 1.6,
            overflowX: 'auto',
            marginBottom: '10px',
            border: '1px solid #334155',
          }}>
            {lessonMaterial.syntaxCodeSnippet}
          </pre>

          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '12px' }}>
            💡 <strong>Penjelasan:</strong> {lessonMaterial.syntaxExplanation}
          </p>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '10px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Langkah Menulis:
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.6 }}>
              {lessonMaterial.howToWriteCode.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Target Misi Utama */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#ECFDF5',
          padding: '14px 18px',
          borderRadius: '18px',
          border: '2px solid #A7F3D0',
        }}>
          <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#065F46' }}>
              TARGET MISI LEVEL {level.id}:
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#047857' }}>
              {lessonMaterial.missionGoal}
            </div>
          </div>
        </div>

        {/* 5. Pertanyaan Ajak Berpikir (Thinking Question) */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '18px',
          borderRadius: '20px',
          border: '2px dashed #CBD5E1',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HelpCircle size={20} color="#8854D0" />
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-navy)' }}>
              🧠 Tebak Koding (Coba Pikirkan!):
            </h4>
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-navy)', marginBottom: '12px' }}>
            {activeQuestion.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === activeQuestion.correctAnswerIndex;
              let btnBg = '#FFFFFF';
              let btnBorder = '2px solid #CBD5E1';

              if (showAnswerFeedback && isSelected) {
                btnBg = isCorrect ? '#ECFDF5' : '#FFF1F2';
                btnBorder = isCorrect ? '2px solid #10B981' : '2px solid #EF4444';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    borderRadius: '14px',
                    backgroundColor: btnBg,
                    border: btnBorder,
                    fontFamily: 'var(--font-family-kids)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    color: 'var(--color-text-navy)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </button>
              );
            })}
          </div>

          {showAnswerFeedback && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: selectedOption === activeQuestion.correctAnswerIndex ? '#D1FAE5' : '#FFE4E6',
              color: selectedOption === activeQuestion.correctAnswerIndex ? '#065F46' : '#9F1239',
              fontSize: '0.85rem',
              fontWeight: 700,
              lineHeight: 1.5,
            }}>
              {selectedOption === activeQuestion.correctAnswerIndex
                ? '🎉 Hebat sekali! Jawabanmu benar! ' + activeQuestion.explanation
                : '💡 Yuk coba pikirkan lagi: ' + activeQuestion.explanation}
            </div>
          )}
        </div>

        {/* TOMBOL LANJUT KE TAHAP 2 (COBA SENDIRI) */}
        <div style={{ marginTop: '8px' }}>
          <button
            className="btn-chunky btn-secondary btn-lg"
            onClick={() => { sounds.playClick(); onProceedToChallenge(); }}
            style={{ width: '100%', padding: '18px 24px' }}
          >
            <Sparkles size={24} />
            <span>AKU SUDAH PAHAM, AYO MAIN! 🚀</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

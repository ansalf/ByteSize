import React, { useRef, useState } from 'react';
import { X, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { CURRICULUM_STAGES } from '../config/levels';
import { sounds } from '../utils/sound';

interface CertificateModalProps {
  progress: UserProgress;
  onClose: () => void;
  defaultStageId?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  progress,
  onClose,
  defaultStageId,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const avatar = AVATARS.find(a => a.id === progress.selectedAvatarId) || AVATARS[0];

  // Stage yang tersedia
  const availableStages = CURRICULUM_STAGES.filter(s => s.id !== 'CREATOR_STUDIO');
  
  // Pilih stage default (jika diberikan atau default stage 1)
  const [selectedStageId, setSelectedStageId] = useState<string>(
    defaultStageId || (progress.unlockedLevel > 12 ? 'INTERMEDIATE' : 'BEGINNER')
  );

  const activeStage = availableStages.find(s => s.id === selectedStageId) || availableStages[0];

  // Hitung level dan bintang di dalam stage terpilih
  const [startLvl, endLvl] = activeStage.levelRange;
  const totalStageLevels = endLvl - startLvl + 1;
  const completedInStage = Object.keys(progress.stars)
    .map(Number)
    .filter(lvl => lvl >= startLvl && lvl <= endLvl).length;

  const isStageFullyCompleted = completedInStage >= totalStageLevels;

  const stageStars = Object.entries(progress.stars)
    .filter(([lvl]) => Number(lvl) >= startLvl && Number(lvl) <= endLvl)
    .reduce((sum, [, s]) => sum + s, 0);

  const maxPossibleStars = totalStageLevels * 3;
  const starPercentage = maxPossibleStars > 0 ? (stageStars / maxPossibleStars) * 100 : 0;

  // Predikat kelulusan berdasarkan performa bintang
  let predicate = 'CUKUP BAIK (GOOD)';
  let predicateColor = '#D97706';
  let predicateBg = '#FEF3C7';
  let predicateBorder = '#FDE68A';

  if (starPercentage >= 90) {
    predicate = 'SANGAT MEMUASKAN DENGAN PUJIAN (CUM LAUDE ⭐⭐⭐)';
    predicateColor = '#166534';
    predicateBg = '#DCFCE7';
    predicateBorder = '#86EFAC';
  } else if (starPercentage >= 75) {
    predicate = 'SANGAT MEMUASKAN (EXCELLENT ⭐⭐)';
    predicateColor = '#0369A1';
    predicateBg = '#E0F2FE';
    predicateBorder = '#7DD3FC';
  } else if (starPercentage >= 50) {
    predicate = 'MEMUASKAN (SATISFACTORY ⭐)';
    predicateColor = '#92400E';
    predicateBg = '#FEF08A';
    predicateBorder = '#FACC15';
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Efek selebrasi saat sertifikat dibuka (HANYA jika stage sudah selesai resmi)
  React.useEffect(() => {
    if (isStageFullyCompleted) {
      sounds.playVictory();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFAE00', '#00C2CB', '#2ECB71', '#FF6B6B'],
        });
      } catch {}
    }
  }, [selectedStageId, isStageFullyCompleted]);

  // Cetak / Print ke PDF
  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 1200 }}>
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '94vh',
          overflow: 'hidden',
          borderRadius: '28px',
          backgroundColor: '#FFFFFF',
          border: '4px solid #FCD34D',
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'relative',
        }}
      >
        {/* Tombol Tutup Pojok Kanan Atas */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="btn-chunky btn-white print-hidden"
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            zIndex: 20,
            width: '36px',
            height: '36px',
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
          title="Tutup Sertifikat"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* HEADER MODAL & PILIH STAGE */}
        <div className="print-hidden" style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
          padding: '16px 20px',
          borderBottom: '2px dashed #FDE68A',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>📜</span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
                Sertifikat Kelulusan Per Stage
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700, margin: '2px 0 0 0' }}>
                Pilih stage yang telah diselesaikan untuk melihat predikat kelulusan & mencetak!
              </p>
            </div>
          </div>

          {/* TAB SELEKSI STAGE */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableStages.map((stage, idx) => {
              const isSelected = selectedStageId === stage.id;
              const isUnlocked = idx === 0 || (idx === 1 && progress.unlockedLevel >= 13);

              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedStageId(stage.id);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '14px',
                    backgroundColor: isSelected ? stage.color : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    border: isSelected ? `2px solid ${stage.color}` : '2px solid #E2E8F0',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 3px 0 rgba(0,0,0,0.15)' : 'none',
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                >
                  <span>{stage.icon}</span>
                  <span>Stage {idx + 1}: {stage.title.split(':')[1]?.trim() || stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AREA SERTIFIKAT UTAMA (Siap Dicetak atau Tampilan Terkunci) */}
        <div style={{
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          backgroundColor: '#F8FAFC',
        }}>
          {!isStageFullyCompleted ? (
            /* TAMPILAN TERKUNCI JIKA STAGE BELUM SELESAI (Mencegah Screenshot) */
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '3px dashed #CBD5E1',
                padding: 'clamp(32px, 5vw, 54px) 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '24px',
                  backgroundColor: '#FEF2F2',
                  border: '3px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                  boxShadow: '0 6px 16px rgba(239, 68, 68, 0.15)',
                  marginBottom: '16px',
                }}
              >
                🔒
              </div>

              <span
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  padding: '4px 14px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                Sertifikat Masih Terkunci
              </span>

              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: '0 0 8px 0' }}>
                Stage Belum Selesai!
              </h3>

              <p style={{ fontSize: '0.92rem', color: '#64748B', maxWidth: '440px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Sertifikat kelulusan resmi hanya diberikan kepada anak yang telah menyelesaikan seluruh <b>{totalStageLevels} Level</b> pada kurikulum ini.
              </p>

              {/* Progress Bar Penyelesaian Stage */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '2px solid #E2E8F0',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  <span>Progres Kelulusan</span>
                  <span style={{ color: activeStage.color, fontWeight: 900 }}>{completedInStage} / {totalStageLevels} Level</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(completedInStage / totalStageLevels) * 100}%`,
                      height: '100%',
                      backgroundColor: activeStage.color,
                      borderRadius: '10px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px', fontWeight: 700 }}>
                  Yuk selesaikan <b>{totalStageLevels - completedInStage} level lagi</b> untuk membuka sertifikatmu! 🚀
                </div>
              </div>
            </div>
          ) : (
            /* TAMPILAN RESMI JIKA STAGE SUDAH LULUS 100% */
            <div
              id="bytesize-certificate-print"
              ref={certificateRef}
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '6px solid #F59E0B',
                boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                padding: 'clamp(20px, 4vw, 36px)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              {/* Garis Border Ganda Hiasan Emas */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                border: '2px dashed #FCD34D',
                borderRadius: '16px',
                pointerEvents: 'none',
              }} />

              {/* Badge Icon Puncak */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#FEF3C7',
                border: '3px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.25)',
                marginBottom: '10px',
              }}>
                🏆
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#B45309',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                SERTIFIKAT KELULUSAN TAHAP
              </div>

              <h2 style={{
                fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 8px 0',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>
                ByteSize Coding Academy
              </h2>

              <p style={{
                fontSize: '0.86rem',
                color: '#64748B',
                margin: '0 0 12px 0',
              }}>
                Menyatakan dengan bangga bahwa:
              </p>

              {/* Nama Peserta / Anak */}
              <div style={{
                fontSize: 'clamp(1.5rem, 4.2vw, 2.1rem)',
                fontWeight: 900,
                color: '#0284C7',
                backgroundColor: '#F0F9FF',
                padding: '6px 24px',
                borderRadius: '16px',
                border: '2px solid #BAE6FD',
                marginBottom: '14px',
                maxWidth: '90%',
                wordBreak: 'break-word',
              }}>
                {progress.playerName}
              </div>

              <p style={{
                fontSize: '0.86rem',
                color: '#334155',
                lineHeight: 1.5,
                maxWidth: '480px',
                margin: '0 0 16px 0',
                fontWeight: 600,
              }}>
                Telah berhasil menyelesaikan seluruh tantangan koding pada kurikulum:
              </p>

              {/* Keterangan Stage Yang Diselesaikan */}
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: '#1E293B',
                backgroundColor: '#F1F5F9',
                padding: '8px 20px',
                borderRadius: '14px',
                border: '2px solid #CBD5E1',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>{activeStage.icon}</span>
                <span>{activeStage.title} (Level {startLvl}–{endLvl})</span>
              </div>

              {/* KETERANGAN PREDIKAT KELULUSAN */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                maxWidth: '460px',
                padding: '10px 16px',
                borderRadius: '16px',
                backgroundColor: predicateBg,
                border: `2.5px solid ${predicateBorder}`,
                marginBottom: '18px',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: predicateColor, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  PREDIKAT KELULUSAN
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: predicateColor }}>
                  {predicate}
                </div>
                <div style={{ fontSize: '0.76rem', color: predicateColor, fontWeight: 700 }}>
                  Menyelesaikan {completedInStage}/{totalStageLevels} Level • Meraih {stageStars}/{maxPossibleStars} Bintang Emas
                </div>
              </div>

              {/* Partner Avatar & Cap Resmi */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                paddingTop: '12px',
                borderTop: '1.5px dashed #CBD5E1',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <span style={{ fontSize: '1.8rem' }}>{avatar.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>PARTNER KODING</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0F172A' }}>{avatar.name}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748B' }}>
                  <div>Tanggal: <b>{currentDate}</b></div>
                  <div style={{ color: '#16A34A', fontWeight: 800, marginTop: '2px' }}>Status: Lulus Resmi ✓</div>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Aksi Cetak & Unduh */}
          <div className="print-hidden" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '600px' }}>
            {!isStageFullyCompleted && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '2px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
              }}>
                ⚠️ Stage ini belum selesai! Kamu baru menyelesaikan {completedInStage} dari {totalStageLevels} level.
                Selesaikan semua level untuk mencetak sertifikat resmi kelulusan!
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={handlePrint}
                disabled={!isStageFullyCompleted}
                className="btn-chunky btn-secondary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontSize: '1rem',
                  opacity: !isStageFullyCompleted ? 0.5 : 1,
                  cursor: !isStageFullyCompleted ? 'not-allowed' : 'pointer',
                }}
              >
                <Printer size={18} />
                <span>{isStageFullyCompleted ? 'Cetak / Simpan PDF' : 'Terkunci (Selesaikan Stage Dahulu)'}</span>
              </button>
              <button
                onClick={() => { sounds.playClick(); onClose(); }}
                className="btn-chunky btn-white"
                style={{
                  flex: '0 0 auto',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                }}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle2, Play, Star, Sparkles, HelpCircle, X, Award, Zap, BarChart2 } from 'lucide-react';
import { CurriculumStageId, LevelConfig, UserProgress } from '../types/game';
import { WORLDS, LEVELS, CURRICULUM_STAGES } from '../config/levels';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';
import { PersonalizedEvaluationModal } from './PersonalizedEvaluationModal';

interface WorldMapScreenProps {
  progress: UserProgress;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const currentAvatar = AVATARS.find(a => a.id === progress.selectedAvatarId) || AVATARS[0];

  // State untuk modal evaluasi bintang level spesifik
  const [evaluatingLevel, setEvaluatingLevel] = useState<LevelConfig | null>(null);

  // State untuk rapor evaluasi menyeluruh personal anak
  const [showPersonalReport, setShowPersonalReport] = useState<boolean>(false);

  // Tentukan stage awal berdasarkan progres anak
  const defaultStage: CurriculumStageId = progress.unlockedLevel >= 13 ? 'INTERMEDIATE' : 'BEGINNER';
  const [selectedStageId, setSelectedStageId] = useState<CurriculumStageId>(defaultStage);

  const selectedStage = CURRICULUM_STAGES.find(s => s.id === selectedStageId) || CURRICULUM_STAGES[0];

  // Cek apakah stage tertentu sudah terbuka
  const isStageUnlocked = (stageId: CurriculumStageId) => {
    if (stageId === 'BEGINNER') return true;
    if (stageId === 'INTERMEDIATE') return progress.unlockedLevel >= 13 || Boolean(progress.unlockedStages?.INTERMEDIATE);
    if (stageId === 'ADVANCED') return progress.unlockedLevel >= 25 || Boolean(progress.unlockedStages?.ADVANCED);
    if (stageId === 'CREATOR_STUDIO') return progress.unlockedLevel >= 37 || Boolean(progress.unlockedStages?.CREATOR_STUDIO);
    return false;
  };

  const handleStageTabClick = (stageId: CurriculumStageId) => {
    sounds.playClick();
    if (!isStageUnlocked(stageId)) {
      sounds.playBump();
      const stg = CURRICULUM_STAGES.find(s => s.id === stageId);
      sounds.speakText(`${stg?.title || 'Stage ini'} masih terkunci! Selesaikan stage sebelumnya terlebih dahulu ya.`);
      return;
    }
    setSelectedStageId(stageId);
  };

  const handleLevelClick = (levelId: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sounds.playBump();
      sounds.speakText(`Level ${levelId} masih terkunci! Selesaikan level sebelumnya terlebih dahulu ya.`);
      return;
    }
    sounds.playClick();
    onSelectLevel(levelId);
  };

  // Filter level berdasarkan stage yang sedang aktif
  const stageLevels = LEVELS.filter(lvl => {
    const world = WORLDS.find(w => w.id === lvl.worldId);
    return (world?.stageId || 'BEGINNER') === selectedStageId;
  });

  // Hitung total bintang di stage ini
  const stageStars = stageLevels.reduce((sum, lvl) => sum + (progress.stars[lvl.id] || 0), 0);
  const maxStageStars = stageLevels.length * 3;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flex: 1,
      paddingBottom: '24px',
    }}>
      {/* Header Navigasi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          className="btn-chunky btn-white btn-sm"
          onClick={() => { sounds.playClick(); onBack(); }}
        >
          <ArrowLeft size={18} /> Beranda
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, color: 'var(--color-text-navy)' }}>
            🎮 Zona Petualangan Koding
          </h2>
          <p style={{ color: 'var(--color-text-slate)', fontSize: '0.9rem' }}>
            Pilih tantangan misi, raih bintang emas, dan kembangkan logikamu!
          </p>
        </div>
        <button
          className="btn-chunky btn-secondary btn-sm"
          onClick={() => { sounds.playClick(); setShowPersonalReport(true); }}
          style={{
            padding: '8px 14px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 0 var(--color-secondary-dark)',
          }}
          title="Buka Evaluasi Belajar Personal"
        >
          <BarChart2 size={16} />
          <span>Rapor Belajar</span>
        </button>
      </div>

      {/* TABS STAGE KURIKULUM (Stage 1..4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '12px',
      }}>
        {CURRICULUM_STAGES.map((stage) => {
          const unlocked = isStageUnlocked(stage.id);
          const isSelected = selectedStageId === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => handleStageTabClick(stage.id)}
              className="card-kid"
              style={{
                padding: '14px 16px',
                textAlign: 'left',
                border: isSelected ? `3px solid ${stage.color}` : '2px solid #E2E8F0',
                backgroundColor: isSelected ? '#FFFFFF' : unlocked ? '#F8FAFC' : '#F1F5F9',
                boxShadow: isSelected ? `0 6px 0 ${stage.color}` : 'none',
                opacity: unlocked ? 1 : 0.65,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{stage.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{
                    fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                    fontWeight: 900,
                    color: isSelected ? stage.color : 'var(--color-text-navy)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.title}
                  </h4>
                  {!unlocked && <Lock size={12} color="#94A3B8" />}
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-slate)', marginTop: '3px' }}>
                  {stage.levelRange[0] === 37 ? 'Proyek Mandiri' : `Level ${stage.levelRange[0]}–${stage.levelRange[1]}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* BANNER RINGKASAN ZONA AKTIF */}
      <div className="card-kid" style={{
        background: `linear-gradient(135deg, #FFFFFF 0%, ${selectedStage.color}15 100%)`,
        borderLeft: `8px solid ${selectedStage.color}`,
        borderTop: '2px solid #E2E8F0',
        borderRight: '2px solid #E2E8F0',
        borderBottom: '2px solid #E2E8F0',
        padding: '18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>{selectedStage.icon}</span>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedStage.color, textTransform: 'uppercase' }}>
                  Zona Belajar Aktif
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-navy)' }}>
                  {selectedStage.title} — {selectedStage.subtitle}
                </h3>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFBEB',
            border: '2px solid #FDE68A',
            padding: '6px 14px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#B45309',
          }}>
            <Sparkles size={18} color="#D97706" />
            <span>{stageStars} / {maxStageStars} Bintang Tercapai</span>
          </div>
        </div>

        {/* Target Kompetensi */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-slate)', marginRight: '4px' }}>
            🎯 Keahlian yang Dipelajari:
          </span>
          {selectedStage.competencies.map((comp, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                padding: '3px 10px',
                borderRadius: '12px',
                color: '#334155',
              }}
            >
              <CheckCircle2 size={12} color={selectedStage.color} />
              {comp}
            </span>
          ))}
        </div>
      </div>

      {/* GRID KARTU MISI LEVEL (MODERN ADVENTURE MISSION CARDS) */}
      {stageLevels.length === 0 ? (
        <div className="card-kid" style={{
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '12px' }}>{selectedStage.icon}</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-navy)', marginBottom: '8px' }}>
            {selectedStage.title} Sedang Disiapkan!
          </h3>
          <p style={{ color: 'var(--color-text-slate)', fontSize: '0.95rem' }}>
            Selesaikan stage sebelumnya terlebih dahulu untuk membuka petualangan ini!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
          gap: '20px',
        }}>
          {stageLevels.map((lvl) => {
            const isUnlocked = progress.unlockedLevel >= lvl.id;
            const isCurrent = progress.unlockedLevel === lvl.id;
            const starCount = progress.stars[lvl.id] || 0;
            const world = WORLDS.find(w => w.id === lvl.worldId);

            // Ambil nama tema ramah anak (contoh: "🔁 Labirin Berputar", "🌴 Lembah Robot")
            const worldThemeName = world?.name || selectedStage.title;

            const isCompleted = starCount > 0;

            return (
              <div
                key={lvl.id}
                onClick={() => handleLevelClick(lvl.id, isUnlocked)}
                className={`card-kid mission-card ${isCurrent ? 'mission-card-current' : ''} ${isCompleted ? 'mission-card-completed' : ''} ${isUnlocked ? 'card-kid-interactive' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '22px 20px',
                  borderRadius: '26px',
                  backgroundColor: isCurrent ? '#FFFFFF' : isCompleted ? '#FAFFFC' : isUnlocked ? '#FFFFFF' : '#F8FAFC',
                  border: isCurrent
                    ? '3.5px solid #FFAE00'
                    : isCompleted
                    ? '3px solid #BBF7D0'
                    : isUnlocked
                    ? '3px solid #E2E8F0'
                    : '2.5px dashed #CBD5E1',
                  boxShadow: isCurrent
                    ? '0 8px 0 #D48800, 0 16px 28px rgba(255, 174, 0, 0.25)'
                    : isCompleted
                    ? '0 6px 0 #86EFAC, 0 8px 18px rgba(34, 197, 94, 0.08)'
                    : isUnlocked
                    ? '0 6px 0 #CBD5E1, 0 8px 18px rgba(0,0,0,0.04)'
                    : 'none',
                  opacity: isUnlocked ? 1 : 0.62,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {/* 1. HEADER CHIP BAR: Tag Zona Tema Ramah Anak & Badge Aktif */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: selectedStage.color,
                    backgroundColor: `${selectedStage.color}15`,
                    border: `1.5px solid ${selectedStage.color}30`,
                    padding: '4px 10px',
                    borderRadius: '10px',
                    letterSpacing: '0.2px',
                    whiteSpace: 'nowrap',
                  }}>
                    {worldThemeName}
                  </span>

                  {isCurrent && (
                    <div 
                      className="animate-badge-float"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)',
                        border: '2px solid #F59E0B',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        color: '#78350F',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {/* Avatar Head Bobbing / Peep Motion */}
                      <span 
                        className="animate-avatar-peep"
                        style={{ 
                          fontSize: '1.25rem', 
                          lineHeight: 1, 
                          filter: 'drop-shadow(0 2px 3px rgba(180, 83, 9, 0.25))',
                        }} 
                      >
                        {currentAvatar.emoji}
                      </span>
                      <span style={{ fontWeight: 900 }}>Levelmu Sekarang</span>
                    </div>
                  )}
                </div>

                {/* 2. BODY UTAMA: Nomor Kotak 3D + Judul Misi */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    backgroundColor: isCurrent
                      ? '#FFAE00'
                      : isCompleted
                      ? '#22C55E'
                      : isUnlocked
                      ? '#00C2CB'
                      : '#E2E8F0',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    boxShadow: isCurrent 
                      ? '0 5px 0 #D48800' 
                      : isCompleted
                      ? '0 5px 0 #15803D'
                      : isUnlocked 
                      ? '0 5px 0 #009AA2' 
                      : 'none',
                    flexShrink: 0,
                    transition: 'transform 0.15s ease',
                  }}>
                    {isUnlocked ? lvl.id : <Lock size={22} color="#94A3B8" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: 'var(--color-text-navy)',
                        lineHeight: 1.3,
                      }}>
                        {lvl.title}
                      </h4>
                      {isCompleted && (
                        <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. CERITA TANTANGAN (DESKRIPSI RAMAH ANAK) */}
                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--color-text-slate)',
                  lineHeight: 1.5,
                  flex: 1,
                  marginBottom: '16px',
                }}>
                  {lvl.storyIntro}
                </p>

                {/* 4. FOOTER: Bintang Prestasi & Tombol Mainkan Interaktif */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '2px dashed #E2E8F0',
                  marginTop: 'auto',
                }}>
                  {/* Bintang Emas + Tombol Evaluasi Bintang */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '3px', 
                        alignItems: 'center',
                        cursor: isCompleted ? 'pointer' : 'default',
                      }}
                      onClick={(e) => {
                        if (isCompleted) {
                          e.stopPropagation();
                          sounds.playClick();
                          setEvaluatingLevel(lvl);
                        }
                      }}
                      title={isCompleted ? "Klik untuk melihat evaluasi bintang!" : undefined}
                    >
                      {[1, 2, 3].map((starIdx) => {
                        const isFilled = starIdx <= starCount;
                        return (
                          <div 
                            key={starIdx}
                            style={{
                              transform: isFilled ? 'scale(1.08)' : 'scale(1)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <Star
                              size={22}
                              fill={isFilled ? '#FFAE00' : '#E2E8F0'}
                              color={isFilled ? '#D48800' : '#CBD5E1'}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Tombol Evaluasi Khusus Anak jika sudah selesai */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          setEvaluatingLevel(lvl);
                        }}
                        style={{
                          background: '#FEF3C7',
                          border: '1.5px solid #FCD34D',
                          borderRadius: '10px',
                          padding: '3px 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer',
                          color: '#B45309',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          transition: 'all 0.15s ease',
                        }}
                        title="Lihat Evaluasi Bintang"
                      >
                        <HelpCircle size={12} />
                        <span>Evaluasi</span>
                      </button>
                    )}
                  </div>

                  {/* Tombol Play */}
                  {isUnlocked ? (
                    <button
                      className={`btn-chunky ${isCurrent ? 'btn-secondary' : isCompleted ? 'btn-white' : 'btn-primary'} btn-sm`}
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        boxShadow: isCurrent 
                          ? '0 4px 0 var(--color-secondary-dark)' 
                          : isCompleted
                          ? '0 4px 0 #CBD5E1'
                          : '0 4px 0 var(--color-primary-dark)',
                        color: isCompleted ? '#059669' : undefined,
                        borderColor: isCompleted ? '#86EFAC' : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLevelClick(lvl.id, true);
                      }}
                    >
                      <Play size={15} fill={isCompleted ? '#059669' : '#FFFFFF'} color={isCompleted ? '#059669' : '#FFFFFF'} />
                      <span>{isCompleted ? 'Main Lagi' : 'Mulai!'}</span>
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#94A3B8',
                      backgroundColor: '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: '10px',
                    }}>
                      <Lock size={12} />
                      <span>Terkunci</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EVALUASI BINTANG LEVEL (RAMAH ANAK) */}
      {evaluatingLevel && (
        <div className="modal-backdrop" onClick={() => setEvaluatingLevel(null)}>
          <div 
            className="card-kid"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              borderRadius: '28px',
              backgroundColor: '#FFFFFF',
              border: '4px solid #FCD34D',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
            }}
          >
            {/* Header Modal Tetap dengan Tombol Tutup Bersih */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px 14px 24px',
              borderBottom: '2px dashed #FEF08A',
              backgroundColor: '#FFFFFF',
              zIndex: 5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Award size={24} color="#D97706" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0, lineHeight: 1.2 }}>
                    Evaluasi Bintang Level {evaluatingLevel.id}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-slate)', margin: '2px 0 0 0' }}>
                    {evaluatingLevel.title}
                  </p>
                </div>
              </div>

              {/* Tombol Tutup */}
              <button
                onClick={() => setEvaluatingLevel(null)}
                style={{
                  background: '#F1F5F9',
                  border: '2px solid #E2E8F0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  flexShrink: 0,
                }}
                title="Tutup Evaluasi"
              >
                <X size={20} />
              </button>
            </div>

            {/* Konten Scrollable Bersih */}
            <div style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
            }}>

            {/* Skor Bintang Sekarang */}
            {(() => {
              const stars = progress.stars[evaluatingLevel.id] || 0;
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#FFFBEB',
                  borderRadius: '20px',
                  padding: '16px',
                  border: '2px solid #FDE68A',
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={36}
                        fill={s <= stars ? '#FFAE00' : '#E2E8F0'}
                        color={s <= stars ? '#D48800' : '#CBD5E1'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#92400E' }}>
                    {stars === 3 
                      ? '🌟 Sempurna! Kamu Meraih 3 Bintang!' 
                      : stars === 2 
                      ? '⭐ Hebat! Kamu Meraih 2 Bintang!' 
                      : '⭐ Bagus! Kamu Meraih 1 Bintang!'}
                  </span>
                </div>
              );
            })()}

            {/* Aturan Bintang & Tips Ramah Anak */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-navy)' }}>
                💡 Cara Mendapatkan Bintang Lebih Banyak:
              </h5>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.85rem',
              }}>
                {/* Bintang 3 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  backgroundColor: (progress.stars[evaluatingLevel.id] || 0) === 3 ? '#DCFCE7' : '#F8FAFC',
                  border: (progress.stars[evaluatingLevel.id] || 0) === 3 ? '2px solid #86EFAC' : '1px solid #E2E8F0',
                }}>
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⭐⭐⭐</span>
                  <div>
                    <strong style={{ color: '#166534' }}>3 Bintang (Paling Efisien):</strong>
                    <p style={{ color: '#334155', marginTop: '2px' }}>
                      Gunakan <strong>maksimal {evaluatingLevel.maxBlocksFor3Stars} balok kode</strong>. Gunakan perulangan (repeat) agar kodemu tidak berulang-ulang!
                    </p>
                  </div>
                </div>

                {/* Bintang 2 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  backgroundColor: (progress.stars[evaluatingLevel.id] || 0) === 2 ? '#FEF9C3' : '#F8FAFC',
                  border: (progress.stars[evaluatingLevel.id] || 0) === 2 ? '2px solid #FDE047' : '1px solid #E2E8F0',
                }}>
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⭐⭐</span>
                  <div>
                    <strong style={{ color: '#854D0E' }}>2 Bintang (Cukup Efisien):</strong>
                    <p style={{ color: '#334155', marginTop: '2px' }}>
                      Gunakan <strong>antara {evaluatingLevel.maxBlocksFor3Stars + 1} sampai {evaluatingLevel.maxBlocksFor2Stars} balok kode</strong>.
                    </p>
                  </div>
                </div>

                {/* Bintang 1 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  backgroundColor: (progress.stars[evaluatingLevel.id] || 0) === 1 ? '#FEF3C7' : '#F8FAFC',
                  border: (progress.stars[evaluatingLevel.id] || 0) === 1 ? '2px solid #FCD34D' : '1px solid #E2E8F0',
                }}>
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⭐</span>
                  <div>
                    <strong style={{ color: '#92400E' }}>1 Bintang (Selesai):</strong>
                    <p style={{ color: '#334155', marginTop: '2px' }}>
                      Berhasil mencapai finish dan mengumpulkan semua item, namun menggunakan lebih dari {evaluatingLevel.maxBlocksFor2Stars} balok kode panjang.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Main Lagi untuk Tingkatkan Skor */}
            <button
              className="btn-chunky btn-secondary"
              style={{ width: '100%', marginTop: '6px' }}
              onClick={() => {
                const lvlId = evaluatingLevel.id;
                setEvaluatingLevel(null);
                handleLevelClick(lvlId, true);
              }}
            >
              <Zap size={18} />
              <span>Tantang Lagi untuk 3 Bintang!</span>
            </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RAPOR EVALUASI PERSONAL UNTUK ANAK */}
      {showPersonalReport && (
        <PersonalizedEvaluationModal
          progress={progress}
          onClose={() => setShowPersonalReport(false)}
          onNavigateToLevel={(lvlId) => {
            setShowPersonalReport(false);
            const isUnlocked = progress.unlockedLevel >= lvlId;
            handleLevelClick(lvlId, isUnlocked);
          }}
        />
      )}
    </div>
  );
};

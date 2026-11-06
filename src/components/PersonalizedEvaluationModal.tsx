import React from 'react';
import { X, Award, AlertTriangle, Lightbulb, CheckCircle2, Zap } from 'lucide-react';
import { UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface PersonalizedEvaluationModalProps {
  progress: UserProgress;
  onClose: () => void;
  onNavigateToLevel?: (levelId: number) => void;
  onOpenCertificate?: () => void;
}

export interface SkillDiagnosis {
  category: string;
  icon: string;
  name: string;
  scorePercent: number; // 0..100
  totalLevelsAttempted: number;
  starsGained: number;
  maxStarsPossible: number;
  status: 'MASTERED' | 'DEVELOPING' | 'NEEDS_FOCUS';
  strengthNotes: string;
  weaknessNotes: string;
  actionableTip: string;
  recommendedLevelId?: number;
}

export const PersonalizedEvaluationModal: React.FC<PersonalizedEvaluationModalProps> = ({
  progress,
  onClose,
  onNavigateToLevel,
  onOpenCertificate,
}) => {
  const avatar = AVATARS.find(a => a.id === progress.selectedAvatarId) || AVATARS[0];

  // 1. DAFTAR KATEGORI KOMPETENSI KODING UTAMA
  // Memetakan seluruh level yang ada (1..12) ke dalam domain logika koding
  const skillDefinitions = [
    {
      category: 'SEQUENTIAL',
      icon: '👣',
      name: 'Logika Langkah & Urutan (Sekuensial)',
      levelIds: [1, 2, 3],
      concept: 'Tanda kurung () & urutan pemanggilan fungsi forward(), turnLeft(), turnRight()',
      tip: 'Pastikan teliti menghitung langkah karakter dan arah hadap sebelum belok ya!',
    },
    {
      category: 'VARIABLES',
      icon: '⭐',
      name: 'Variabel & Koleksi Bintang',
      levelIds: [4, 5, 6],
      concept: 'Mengambil semua collectible dan mengatur state koin/energi',
      tip: 'Cek seluruh penjuru petak labirin agar tidak ada bintang yang terlewat sebelum menuju bendera!',
    },
    {
      category: 'LOOPS',
      icon: '🌀',
      name: 'Perulangan & Efisiensi Loop',
      levelIds: [7, 8],
      concept: 'Meringkas kode dengan repeat() dan pola bertingkat (nested loop)',
      tip: 'Jika ada balok yang kamu susun berulang 2x atau lebih, bungkus ke dalam balok repeat() agar hemat balok!',
    },
    {
      category: 'CONDITIONAL',
      icon: '🔀',
      name: 'Kondisi & Percabangan Logika',
      levelIds: [9, 10],
      concept: 'Mendeteksi rintangan jalan dengan ifPathAhead() / ifPathClear()',
      tip: 'Sebelum melangkah di jalan bercabang, pasang pemeriksaan kondisi agar robot tidak menabrak rintangan.',
    },
    {
      category: 'FUNCTIONS',
      icon: '🧩',
      name: 'Modularisasi & Fungsi Khusus',
      levelIds: [11, 12],
      concept: 'Memecah masalah besar menjadi bagian-bagian langkah kecil',
      tip: 'Pikirkan solusi per bagian: selesaikan satu sisi dahulu, baru buat polanya berulang.',
    },
  ];

  // 2. HITUNG SKOR & ANALISIS PERFORMA PERSONAL ANAK
  const analyzedSkills: SkillDiagnosis[] = skillDefinitions.map((skillDef) => {
    let attemptedCount = 0;
    let earnedStars = 0;
    const maxStars = skillDef.levelIds.length * 3;
    let lowestStarLevelId: number | undefined;
    let lowestStarCount = 999;

    skillDef.levelIds.forEach((lvlId) => {
      const stars = progress.stars[lvlId];
      if (stars !== undefined && stars > 0) {
        attemptedCount++;
        earnedStars += stars;
        if (stars < lowestStarCount) {
          lowestStarCount = stars;
          lowestStarLevelId = lvlId;
        }
      } else if (progress.unlockedLevel >= lvlId && lowestStarLevelId === undefined) {
        // Level sudah terbuka tapi belum dapat bintang
        lowestStarLevelId = lvlId;
      }
    });

    const scorePercent = attemptedCount > 0 ? Math.round((earnedStars / (attemptedCount * 3)) * 100) : 0;

    let status: 'MASTERED' | 'DEVELOPING' | 'NEEDS_FOCUS' = 'DEVELOPING';
    let strengthNotes = '';
    let weaknessNotes = '';

    if (attemptedCount === 0) {
      status = 'DEVELOPING';
      strengthNotes = 'Belum dicoba.';
      weaknessNotes = 'Tantangan pada domain ini belum dimainkan.';
    } else if (scorePercent >= 85) {
      status = 'MASTERED';
      strengthNotes = `Luar biasa! ${progress.playerName} sudah sangat mahir memahami konsep ini dengan efisiensi tinggi.`;
      weaknessNotes = 'Pertahankan ketelitian ini pada level tingkat lanjut!';
    } else if (scorePercent >= 60) {
      status = 'DEVELOPING';
      strengthNotes = `Kemampuan dasarmu sudah baik dalam menyelesaikan rute misi.`;
      weaknessNotes = `Masih sering menggunakan terlalu banyak balok panjang sehingga baru meraih 1–2 bintang.`;
    } else {
      status = 'NEEDS_FOCUS';
      strengthNotes = `Semangat juangmu hebat tidak mudah menyerah mencoba sampai finish!`;
      weaknessNotes = `Masih sering kesulitan merapikan pola kode dan sering melebihi target efisiensi balok.`;
    }

    return {
      category: skillDef.category,
      icon: skillDef.icon,
      name: skillDef.name,
      scorePercent,
      totalLevelsAttempted: attemptedCount,
      starsGained: earnedStars,
      maxStarsPossible: maxStars,
      status,
      strengthNotes,
      weaknessNotes,
      actionableTip: skillDef.tip,
      recommendedLevelId: lowestStarLevelId || skillDef.levelIds[0],
    };
  });

  // Urutkan keterampilan: yang perlu diperbaiki (NEEDS_FOCUS / skor terendah di level yang sudah dimainkan) paling atas
  const prioritizedSkills = [...analyzedSkills].sort((a, b) => {
    if (a.totalLevelsAttempted === 0 && b.totalLevelsAttempted > 0) return 1;
    if (b.totalLevelsAttempted === 0 && a.totalLevelsAttempted > 0) return -1;
    return a.scorePercent - b.scorePercent;
  });

  // Temukan kelemahan utama untuk tips personal
  const mainWeakness = prioritizedSkills.find(s => s.totalLevelsAttempted > 0 && s.scorePercent < 80);
  const mainStrength = [...analyzedSkills]
    .filter(s => s.totalLevelsAttempted > 0)
    .sort((a, b) => b.scorePercent - a.scorePercent)[0];

  const totalPlayedLevels = Object.keys(progress.stars).length;
  const totalStars = Object.values(progress.stars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '28px',
          backgroundColor: '#FFFFFF',
          border: '4px solid #00C2CB',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.22)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* HEADER MODAL TETAP (Bebas dari Tabrakan Scrollbar) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px 24px',
          borderBottom: '2px dashed #E0F2FE',
          backgroundColor: '#FFFFFF',
          zIndex: 5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              backgroundColor: '#E0F2FE',
              border: '2.5px solid #7DD3FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              flexShrink: 0,
            }}>
              {avatar.emoji}
            </div>
            <div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#0369A1',
                backgroundColor: '#E0F2FE',
                padding: '2px 8px',
                borderRadius: '8px',
                textTransform: 'uppercase',
              }}>
                Rapor Personal Belajar
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-navy)', lineHeight: 1.2, margin: '2px 0 0 0' }}>
                {progress.playerName}
              </h3>
            </div>
          </div>

          {/* Tombol Tutup Rapi & Bersih */}
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: '2px solid #E2E8F0',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            title="Tutup Rapor"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY KONTEN (Area Scrollable Bersih Bebas Glitch) */}
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flex: 1,
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
        }}>
        {/* 2. STATS RINGKAS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          backgroundColor: '#F8FAFC',
          borderRadius: '18px',
          padding: '12px',
          border: '1.5px solid #E2E8F0',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Total Bintang</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D97706' }}>
              {totalStars} ⭐
            </div>
          </div>
          <div style={{ borderLeft: '1.5px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Level Selesai</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-primary)' }}>
              {totalPlayedLevels}
            </div>
          </div>
          <div style={{ borderLeft: '1.5px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Status Belajar</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
              {totalStars >= 24 ? 'Aktif ⭐⭐⭐' : totalStars >= 10 ? 'Berkembang' : 'Pemula'}
            </div>
          </div>
        </div>

        {/* 3. HIGHLIGHT: KEKUATAN & AREA YANG HARUS DIPERBAIKI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {totalPlayedLevels === 0 ? (
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '2px dashed #93C5FD',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '2rem' }}>🚀</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1E40AF' }}>
                  Petualangan Koding Baru Saja Dimulai!
                </div>
                <p style={{ fontSize: '0.8rem', color: '#1E3A8A', marginTop: '3px', lineHeight: 1.4 }}>
                  Mainkan dan selesaikan level pertamamu untuk melihat analisis kelebihan dan tips koding personal dari ByteSize!
                </p>
              </div>
            </div>
          ) : mainWeakness ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #FCA5A5',
              borderRadius: '18px',
              padding: '14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#991B1B' }}>
                  🎯 Area yang Perlu Diperbaiki: {mainWeakness.name}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#7F1D1D', marginTop: '3px', lineHeight: 1.4 }}>
                  {mainWeakness.weaknessNotes}
                </p>
                <div style={{
                  marginTop: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1.5px solid #FECACA',
                  fontSize: '0.78rem',
                  color: '#991B1B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Lightbulb size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span><strong>Saran Jagoan:</strong> {mainWeakness.actionableTip}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '2px solid #6EE7B7',
              borderRadius: '18px',
              padding: '14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#065F46' }}>
                  🌟 Luar Biasa! Semua Level Dikerjakan Sangat Rapi!
                </div>
                <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '2px' }}>
                  {progress.playerName} telah membuktikan efisiensi kode yang hebat. Siap menaklukkan tantangan stage berikutnya!
                </p>
              </div>
            </div>
          )}

          {/* Highlight Kekuatan */}
          {mainStrength && mainStrength.scorePercent >= 60 && (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <Award size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>
                  💪 Kekuatan Utama: {mainStrength.name} ({mainStrength.scorePercent}% Bintang)
                </div>
                <p style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '2px' }}>
                  {mainStrength.strengthNotes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. DAFTAR RINCIAN 5 DOMAIN KEAHLIAN */}
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--color-text-navy)', marginBottom: '10px' }}>
            📊 Rincian Penguasaan Koding per Domain:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analyzedSkills.map((skill) => {
              const isMastered = skill.status === 'MASTERED';
              const isNeedsFocus = skill.status === 'NEEDS_FOCUS';

              return (
                <div
                  key={skill.category}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isNeedsFocus ? '2px solid #FCA5A5' : '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{skill.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-text-navy)' }}>
                          {skill.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {skill.totalLevelsAttempted > 0 
                            ? `${skill.starsGained} dari ${skill.totalLevelsAttempted * 3} Bintang Didapat` 
                            : 'Belum ada level yang dimainkan'}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '10px',
                      backgroundColor: isMastered ? '#DCFCE7' : isNeedsFocus ? '#FEE2E2' : '#FEF3C7',
                      color: isMastered ? '#166534' : isNeedsFocus ? '#991B1B' : '#92400E',
                    }}>
                      {skill.totalLevelsAttempted === 0 
                        ? 'Terkunci' 
                        : isMastered 
                        ? 'Sangat Mahir ✓' 
                        : isNeedsFocus 
                        ? 'Perlu Latihan ⚠️' 
                        : 'Bagus ⭐'}
                    </span>
                  </div>

                  {/* Progress Bar Visual */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      width: `${skill.scorePercent}%`,
                      height: '100%',
                      backgroundColor: isMastered ? '#22C55E' : isNeedsFocus ? '#EF4444' : '#FFAE00',
                      borderRadius: '6px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  {/* Tips Singkat Edukatif */}
                  <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>💡 {skill.actionableTip}</span>
                    {skill.recommendedLevelId && onNavigateToLevel && (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onClose();
                          onNavigateToLevel(skill.recommendedLevelId!);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary-dark)',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          textDecoration: 'underline',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Latihan Level {skill.recommendedLevelId} ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. TOMBOL AKSI */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '10px',
          width: '100%',
        }}>
          {onOpenCertificate && (
            <button
              className="btn-chunky btn-white"
              onClick={() => {
                sounds.playClick();
                onClose();
                onOpenCertificate();
              }}
              style={{
                flex: '1 1 200px',
                minWidth: 0,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '2.5px solid #FCD34D',
                color: '#B45309',
                backgroundColor: '#FFFBEB',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: 800,
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              <Award size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Lihat Status Sertifikat 📜
              </span>
            </button>
          )}

          <button
            className="btn-chunky btn-secondary"
            onClick={onClose}
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.25,
            }}
          >
            <Zap size={18} style={{ flexShrink: 0 }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Siap Tingkatkan Kodingku! 🚀
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

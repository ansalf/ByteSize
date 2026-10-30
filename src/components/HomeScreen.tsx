import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, UserCheck, Sparkles, Compass, Bell, X } from 'lucide-react';
import { UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { CURRICULUM_STAGES, LEVELS, WORLDS } from '../config/levels';
import { sounds } from '../utils/sound';
import { PersonalizedEvaluationModal } from './PersonalizedEvaluationModal';
import { ShopModal } from './ShopModal';
import { CertificateModal } from './CertificateModal';
import { CodingEncyclopediaModal } from './CodingEncyclopediaModal';
import { DailyChallengeModal } from './DailyChallengeModal';
import { notifications } from '../utils/notifications';

interface HomeScreenProps {
  progress: UserProgress;
  onStartAdventure: () => void;
  onOpenAvatarSelect: () => void;
  onOpenWorldMap: () => void;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onStartAdventure,
  onOpenAvatarSelect,
  onOpenWorldMap,
  onUpdateProgress,
}) => {
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedStageForCert, setSelectedStageForCert] = useState<string>('BEGINNER');
  const [showEncyclopediaModal, setShowEncyclopediaModal] = useState<boolean>(false);
  const [showDailyChallengeModal, setShowDailyChallengeModal] = useState<boolean>(false);
  const [dismissReminder, setDismissReminder] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => notifications.getStatus().permission);

  // Status tantangan harian hari ini (tersimpan aman di UserProgress)
  const todayDateString = new Date().toISOString().split('T')[0];
  const lastCompletedDate = progress.lastDailyQuizDate || localStorage.getItem(`bytesize_daily_date_${progress.playerName}`) || '';
  const isQuizCompletedToday = lastCompletedDate === todayDateString;
  const currentDailyStreak = progress.dailyStreak !== undefined 
    ? progress.dailyStreak 
    : parseInt(localStorage.getItem(`bytesize_daily_streak_${progress.playerName}`) || '1', 10);

  // Jalankan pengecekan background reminder
  React.useEffect(() => {
    notifications.startBackgroundReminderCheck(progress.playerName, currentDailyStreak, lastCompletedDate);
  }, [progress.playerName, currentDailyStreak, lastCompletedDate]);

  const handleEnableNotification = async () => {
    sounds.playClick();
    const granted = await notifications.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#FFAE00', '#FF4500', '#00C2CB'],
        });
      } catch {}
    }
  };

  const currentAvatar = AVATARS.find(a => a.id === progress.selectedAvatarId) || AVATARS[0];
  const totalStars = Object.values(progress.stars).reduce((sum, s) => sum + s, 0);
  const totalCompletedLevels = Object.keys(progress.stars).length;
  const currentLevelConfig = LEVELS.find(l => l.id === progress.unlockedLevel) || LEVELS[0];
  const currentWorld = WORLDS.find(w => w.id === currentLevelConfig.worldId);
  const currentStage = CURRICULUM_STAGES.find(s => s.id === currentWorld?.stageId) || CURRICULUM_STAGES[0];
  const activeWorldDisplayName = currentWorld?.name || currentLevelConfig.worldName;

  const handleMascotClick = () => {
    sounds.playAvatarVoice(currentAvatar.soundType);
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#FFAE00', '#FEF08A', '#00C2CB'],
      });
    } catch (e) {
      // safe fallback
    }
    sounds.speakText(`Halo ${progress.playerName}! Aku siap menemanimu menaklukkan tantangan koding hari ini!`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flex: 1,
      padding: '8px 4px',
    }}>
      {/* NOTIFIKASI REMINDER TANTANGAN HARIAN KUIS */}
      {!isQuizCompletedToday && !dismissReminder && (
        <div
          onClick={() => { sounds.playClick(); setShowDailyChallengeModal(true); }}
          className="card-kid card-kid-interactive"
          style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 50%, #FEE2E2 100%)',
            border: '3px solid #F59E0B',
            borderRadius: '22px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: '0 8px 18px rgba(245, 158, 11, 0.25), 0 4px 0 #D97706',
            cursor: 'pointer',
            position: 'relative',
            animation: 'popIn 0.3s ease',
          }}
        >
          {/* Ikon Lonceng Bergetar & Detail Pesan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 3px 0 #9A3412',
            }} className="animate-gentle-bounce">
              <Bell size={24} className="animate-spin-slow" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  PENGINGAT HARI INI ⏰
                </span>
                {/* TIKTOK STYLE FLAME STREAK BADGE */}
                <span 
                  className="tiktok-streak-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '14px',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
                    letterSpacing: '0.3px',
                  }}
                >
                  <span className="tiktok-fire-icon" style={{ fontSize: '1rem', lineHeight: 1 }}>🔥</span>
                  <span>{currentDailyStreak} HARI STREAK</span>
                </span>
              </div>

              <div style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: '#78350F',
                lineHeight: 1.25,
                marginTop: '3px',
              }}>
                Hai {progress.playerName}! Kamu belum menyelesaikan <span style={{ color: '#C2410C' }}>Kuis Koding 1 Menit</span> hari ini!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 700, marginTop: '2px' }}>
                Jawab 1 tebakan logika sekarang untuk amankan streak kodingmu & raih <strong style={{ color: '#EA580C' }}>+25 Koin Koding 🪙</strong>!
              </div>
            </div>
          </div>

          {/* Tombol Aksi Cepat, Izin Notifikasi HP & Tombol Dismiss */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            {/* Tombol Nyalakan Pengingat HP/Laptop jika belum diaktifkan */}
            {notifPermission !== 'granted' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnableNotification();
                }}
                className="btn-chunky btn-white btn-sm"
                style={{
                  fontSize: '0.8rem',
                  padding: '8px 12px',
                  borderRadius: '14px',
                  color: '#C2410C',
                  border: '2px solid #FDBA74',
                  whiteSpace: 'nowrap',
                }}
                title="Munculkan notifikasi pengingat langsung di layar HP atau Laptop"
              >
                <Bell size={15} color="#EA580C" />
                <span>Nyalakan di HP/Laptop 🔔</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                setShowDailyChallengeModal(true);
              }}
              className="btn-chunky btn-secondary btn-sm"
              style={{
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Kerjakan Sekarang ⚡</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                setDismissReminder(true);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1.5px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#92400E',
              }}
              title="Tutup pengingat untuk sementara"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* HERO BANNER: Panggung Petualangan Interaktif */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0284C7 0%, #00C2CB 50%, #38BDF8 100%)',
        borderRadius: '28px',
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3.5vw, 32px)',
        color: '#FFFFFF',
        boxShadow: '0 16px 32px rgba(2, 132, 199, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
        border: '4px solid #BAE6FD',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        {/* Dekorasi Awan & Partikel Bintang Latar */}
        <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '6rem', opacity: 0.15, pointerEvents: 'none' }}>
          ☁️
        </div>
        <div style={{ position: 'absolute', bottom: '-30px', right: '40px', fontSize: '8rem', opacity: 0.15, pointerEvents: 'none' }}>
          🏝️
        </div>

        {/* Teks Sambutan & Info Level Aktif */}
        <div style={{ flex: '1 1 260px', zIndex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            marginBottom: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}>
            <Sparkles size={14} /> PETUALANG CILIK
          </div>

          <h2 style={{
            fontSize: 'clamp(1.7rem, 4.5vw, 2.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            marginBottom: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            Halo, <span style={{ color: '#FEF08A' }}>{progress.playerName}</span>! 👋
          </h2>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            lineHeight: 1.5,
            opacity: 0.95,
            maxWidth: '540px',
            marginBottom: '20px',
            textShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}>
            Misimu berikutnya menanti di <strong>{activeWorldDisplayName}</strong>: Level {currentLevelConfig.id} — <em>"{currentLevelConfig.title}"</em> ({currentStage.title.split(':')[0]}). Ayo susun balok kodingmu!
          </p>

          {/* Tombol Utama Play Besar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { sounds.playClick(); onStartAdventure(); }}
              className="btn-chunky btn-secondary btn-lg"
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                padding: '14px 24px',
                boxShadow: '0 6px 0 var(--color-secondary-dark), 0 10px 18px rgba(0,0,0,0.25)',
                flex: '1 1 auto',
                minWidth: '220px',
              }}
            >
              <Play size={22} fill="#FFFFFF" />
              <span>LANJUTKAN LEVEL {progress.unlockedLevel}!</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); onOpenWorldMap(); }}
              className="btn-chunky btn-white btn-lg"
              style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                padding: '14px 20px',
                color: 'var(--color-primary-dark)',
                flex: '1 1 auto',
              }}
            >
              <Compass size={20} color="var(--color-primary)" />
              <span>Pilih Level Petualangan</span>
            </button>
          </div>
        </div>

        {/* Maskot Avatar 3D Card Interaktif */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 auto',
          zIndex: 1,
        }}>
          <div
            onClick={handleMascotClick}
            className="card-kid card-kid-interactive animate-pulse-glow"
            style={{
              width: 'clamp(140px, 25vw, 200px)',
              height: 'clamp(150px, 26vw, 210px)',
              borderRadius: '30px',
              backgroundColor: '#FFFFFF',
              border: '5px solid #FEF08A',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              paddingTop: '20px',
              paddingBottom: '16px',
            }}
          >
            {/* Unit Karakter Terintegrasi (Bouncing) */}
            <div 
              className="animate-gentle-bounce"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Emoji Avatar */}
              <span style={{ fontSize: 'clamp(3.8rem, 8.5vw, 5.5rem)', lineHeight: 1 }}>
                {currentAvatar.emoji}
              </span>
            </div>

            {/* Label Nama Karakter di Bawah Kartu */}
            <div style={{
              position: 'absolute',
              bottom: '-12px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '14px',
              fontSize: '0.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}>
              {currentAvatar.name}
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); onOpenAvatarSelect(); }}
            style={{
              marginTop: '18px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              borderRadius: '14px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <UserCheck size={16} /> Ganti Karakter
          </button>
        </div>
      </div>

      {/* DASHBOARD STATUS & STATISTIK PEMBELAJARAN ANAK (Tata Letak Rapi 2 Baris) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        gap: '14px',
      }}>
        {/* Baris 1 / Kartu 1: Bintang Emas */}
        <div className="card-kid" style={{
          backgroundColor: '#FFFFFF',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDF7 100%)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '2.5px solid #FDE68A',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: 'inset 0 -2px 0 rgba(217, 119, 6, 0.2)',
          }}>
            ⭐
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Bintang
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-navy)', lineHeight: 1.1 }}>
              {totalStars}
            </div>
          </div>
        </div>

        {/* Baris 1 / Kartu 2: Level Selesai */}
        <div className="card-kid" style={{
          backgroundColor: '#FFFFFF',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F0FDFA 100%)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '2.5px solid #A7F3D0',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: 'inset 0 -2px 0 rgba(5, 150, 105, 0.2)',
          }}>
            🏆
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Level Selesai
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-navy)', lineHeight: 1.1 }}>
              {totalCompletedLevels} <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>/ {LEVELS.length}</span>
            </div>
          </div>
        </div>

        {/* Baris 1 / Kartu 3: Koin Koding Interaktif (Toko) */}
        <div 
          onClick={() => { sounds.playClick(); setShowShopModal(true); }}
          className="card-kid card-kid-interactive" 
          style={{
            backgroundColor: '#FFFFFF',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFBEB 100%)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2.5px solid #FCD34D',
            borderRadius: '20px',
            boxShadow: '0 6px 14px rgba(245, 158, 11, 0.12)',
            cursor: 'pointer',
            position: 'relative',
          }}
          title="Klik untuk membuka Toko Koin Hadiah!"
        >
          <div style={{
            position: 'absolute',
            top: '-9px',
            right: '12px',
            backgroundColor: '#F59E0B',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: 900,
            padding: '2px 8px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
          }}>
            TOKO 🛍️
          </div>

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: 'inset 0 -2px 0 rgba(217, 119, 6, 0.25)',
          }} className="animate-gentle-bounce">
            🪙
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Koin Koding
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#B45309', lineHeight: 1.1 }}>
                {progress.coins}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 800 }}>
                Tukar ➔
              </span>
            </div>
          </div>
        </div>

        {/* Baris 2 / Kartu 4: Evaluasi Belajar */}
        <div 
          onClick={() => { sounds.playClick(); setShowEvaluationModal(true); }}
          className="card-kid card-kid-interactive" 
          style={{
            backgroundColor: '#FFFFFF',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFCE8 100%)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2.5px solid #FDE047',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(234, 179, 8, 0.1)',
            cursor: 'pointer',
          }}
          title="Klik untuk melihat evaluasi koding personalmu!"
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#FEF08A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
            boxShadow: 'inset 0 -2px 0 rgba(202, 138, 4, 0.2)',
          }}>
            🎯
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A16207', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Evaluasi Belajar
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#854D0E', lineHeight: 1.2 }}>
              Cek Rapor ➔
            </div>
          </div>
        </div>

        {/* Baris 2 / Kartu 5: Kamus Koding Bergambar (Opsi 3) */}
        <div 
          onClick={() => { sounds.playClick(); setShowEncyclopediaModal(true); }}
          className="card-kid card-kid-interactive" 
          style={{
            backgroundColor: '#FFFFFF',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F0F9FF 100%)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2.5px solid #7DD3FC',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.1)',
            cursor: 'pointer',
          }}
          title="Buka Kamus Koding Bergambar & Cerita Analogi!"
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: 'inset 0 -2px 0 rgba(2, 132, 199, 0.2)',
          }}>
            📖
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Kamus Koding
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0284C7', lineHeight: 1.2 }}>
              Baca Cerita ➔
            </div>
          </div>
        </div>

        {/* Baris 2 / Kartu 6: Tantangan Harian (Opsi C) */}
        <div 
          onClick={() => { sounds.playClick(); setShowDailyChallengeModal(true); }}
          className="card-kid card-kid-interactive" 
          style={{
            backgroundColor: '#FFFFFF',
            background: isQuizCompletedToday
              ? 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)'
              : 'linear-gradient(145deg, #FFFFFF 0%, #FEF3C7 100%)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: isQuizCompletedToday ? '2.5px solid #86EFAC' : '2.5px solid #FCD34D',
            borderRadius: '20px',
            boxShadow: isQuizCompletedToday
              ? '0 4px 12px rgba(22, 163, 74, 0.12)'
              : '0 4px 12px rgba(245, 158, 11, 0.18)',
            cursor: 'pointer',
            position: 'relative',
          }}
          title={isQuizCompletedToday ? "Tantangan kuis hari ini sudah selesai! Klik untuk melihat ringkasan." : "Tantangan kuis koding harian 1 menit! Kumpulkan koin & streak api!"}
        >
          <div style={{
            position: 'absolute',
            top: '-9px',
            right: '12px',
            backgroundColor: isQuizCompletedToday ? '#16A34A' : '#EA580C',
            color: '#FFFFFF',
            fontSize: '0.62rem',
            fontWeight: 900,
            padding: '2px 8px',
            borderRadius: '10px',
            boxShadow: isQuizCompletedToday
              ? '0 2px 4px rgba(22, 163, 74, 0.3)'
              : '0 2px 4px rgba(234, 88, 12, 0.3)',
          }}>
            {isQuizCompletedToday ? 'SELESAI ✓' : 'BELUM DIKERJAKAN ⚡'}
          </div>

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: isQuizCompletedToday ? '#DCFCE7' : '#FEF08A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            flexShrink: 0,
            boxShadow: isQuizCompletedToday
              ? 'inset 0 -2px 0 rgba(22, 101, 52, 0.2)'
              : 'inset 0 -2px 0 rgba(217, 119, 6, 0.25)',
          }}>
            {isQuizCompletedToday ? (
              <span className="animate-gentle-bounce">🎉</span>
            ) : (
              <span className="tiktok-fire-icon">🔥</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: isQuizCompletedToday ? '#166534' : '#B45309',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}>
              <span>Tantangan Harian</span>
              <span style={{
                backgroundColor: '#FFEDD5',
                color: '#C2410C',
                padding: '1px 5px',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}>
                🔥 {currentDailyStreak}d
              </span>
            </div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 900,
              color: isQuizCompletedToday ? '#15803D' : '#D97706',
              lineHeight: 1.2,
            }}>
              {isQuizCompletedToday ? 'Lihat Kuis ✓' : 'Kuis Kilat ➔'}
            </div>
          </div>
        </div>
      </div>

      {/* JALUR PETUALANGAN 4 STAGE (Overview Cepat) */}
      <div className="card-kid" style={{
        backgroundColor: '#FFFFFF',
        padding: 'clamp(16px, 3vw, 24px)',
        borderRadius: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: 800, color: 'var(--color-text-navy)' }}>
              🎯 Kurikulum & Level Belajar Koding
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-slate)' }}>
              Pohon perjalanan belajarmu dari pemula hingga mandiri!
            </p>
          </div>
          <button
            onClick={() => { sounds.playClick(); onOpenWorldMap(); }}
            className="btn-chunky btn-primary btn-sm"
          >
            Lihat Semua Level ➔
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '14px',
        }}>
          {CURRICULUM_STAGES.map((stage, idx) => {
            const isUnlocked = idx === 0 || (idx === 1 && progress.unlockedLevel >= 13);
            const totalStageLevels = stage.levelRange[1] - stage.levelRange[0] + 1;
            const completedInStage = Object.keys(progress.stars)
              .map(Number)
              .filter(lvl => lvl >= stage.levelRange[0] && lvl <= stage.levelRange[1]).length;

            return (
              <div
                key={stage.id}
                onClick={() => { sounds.playClick(); onOpenWorldMap(); }}
                className={`card-kid ${isUnlocked ? 'card-kid-interactive' : ''}`}
                style={{
                  padding: '20px 18px',
                  borderRadius: '24px',
                  border: isUnlocked ? `3.5px solid ${stage.color}` : '2.5px dashed #CBD5E1',
                  background: isUnlocked 
                    ? `linear-gradient(170deg, #FFFFFF 60%, ${stage.color}15 100%)` 
                    : '#F8FAFC',
                  boxShadow: isUnlocked 
                    ? `0 6px 0 ${stage.color}50, 0 10px 20px rgba(0,0,0,0.04)` 
                    : 'none',
                  opacity: isUnlocked ? 1 : 0.68,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    backgroundColor: isUnlocked ? `${stage.color}20` : '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    border: isUnlocked ? `2px solid ${stage.color}40` : 'none',
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: isUnlocked ? '#DCFCE7' : '#F1F5F9',
                      color: isUnlocked ? '#166534' : '#64748B',
                      boxShadow: isUnlocked ? '0 2px 4px rgba(22, 101, 52, 0.12)' : 'none',
                    }}>
                      {isUnlocked ? 'Terbuka ✓' : 'Terkunci 🔒'}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8' }}>
                      Level {stage.levelRange[0]}–{stage.levelRange[1]}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-text-navy)', marginBottom: '4px' }}>
                  {stage.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-slate)', lineHeight: 1.4, flex: 1, marginBottom: '12px' }}>
                  {stage.subtitle}
                </p>

                {/* Mini Progress Bar Per Stage */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                    <span>Progres:</span>
                    <span>{completedInStage}/{totalStageLevels} Level</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '7px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(completedInStage / totalStageLevels) * 100}%`,
                      height: '100%',
                      backgroundColor: stage.color,
                      borderRadius: '6px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  {/* Tombol Status Sertifikat: Selalu terlihat agar user tahu ada sertifikat, tapi status terkunci jika belum selesai */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setSelectedStageForCert(stage.id);
                      setShowCertificateModal(true);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '7px 10px',
                      borderRadius: '12px',
                      backgroundColor: completedInStage >= totalStageLevels ? '#FFFBEB' : '#F8FAFC',
                      border: completedInStage >= totalStageLevels ? '2px solid #FCD34D' : '2px dashed #CBD5E1',
                      color: completedInStage >= totalStageLevels ? '#B45309' : '#64748B',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: completedInStage >= totalStageLevels ? '0 2px 0 #F59E0B' : 'none',
                    }}
                    title={completedInStage >= totalStageLevels ? "Klik untuk melihat & mencetak sertifikat resmi!" : `Selesaikan ${totalStageLevels - completedInStage} level lagi untuk membuka sertifikat ini.`}
                  >
                    <span>{completedInStage >= totalStageLevels ? '📜' : '🔒'}</span>
                    <span>
                      {completedInStage >= totalStageLevels 
                        ? `Cetak Sertifikat ${stage.title.split(':')[0]}` 
                        : `Sertifikat (${completedInStage}/${totalStageLevels})`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL RAPOR EVALUASI PERSONAL UNTUK ANAK */}
      {showEvaluationModal && (
        <PersonalizedEvaluationModal
          progress={progress}
          onClose={() => setShowEvaluationModal(false)}
          onNavigateToLevel={() => {
            setShowEvaluationModal(false);
            onOpenWorldMap();
          }}
          onOpenCertificate={() => {
            setShowEvaluationModal(false);
            setShowCertificateModal(true);
          }}
        />
      )}

      {/* MODAL TOKO KOIN HADIAH INTERAKTIF */}
      {showShopModal && (
        <ShopModal
          progress={progress}
          onClose={() => setShowShopModal(false)}
          onUpdateProgress={onUpdateProgress}
        />
      )}

      {/* MODAL SERTIFIKAT KELULUSAN RESMI CETAK/UNDUH (Inovasi 4) */}
      {showCertificateModal && (
        <CertificateModal
          progress={progress}
          defaultStageId={selectedStageForCert}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* MODAL KAMUS KODING BERGAMBAR (Inovasi Baru) */}
      {showEncyclopediaModal && (
        <CodingEncyclopediaModal
          onClose={() => setShowEncyclopediaModal(false)}
        />
      )}

      {/* MODAL TANTANGAN HARIAN KUIS KILAT 1 MENIT (Opsi C) */}
      {showDailyChallengeModal && (
        <DailyChallengeModal
          progress={progress}
          onClose={() => setShowDailyChallengeModal(false)}
          onUpdateProgress={onUpdateProgress}
        />
      )}
    </div>
  );
};

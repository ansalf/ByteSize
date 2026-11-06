import React from 'react';
import { Volume2, VolumeX, Sparkles, Users } from 'lucide-react';
import { UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface HeaderBarProps {
  progress: UserProgress;
  onToggleSound: () => void;
  onNavigateHome: () => void;
  onNavigateAvatars: () => void;
  onNavigateWorldMap: () => void;
  onOpenProfileManager: () => void;
  currentScreen: 'HOME' | 'AVATAR_SELECT' | 'WORLD_MAP' | 'GAMEPLAY';
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  progress,
  onToggleSound,
  onNavigateHome,
  onNavigateAvatars,
  onNavigateWorldMap,
  onOpenProfileManager,
  currentScreen,
}) => {
  const currentAvatar = AVATARS.find(a => a.id === progress.selectedAvatarId) || AVATARS[0];
  const totalStars = Object.values(progress.stars).reduce((sum, s) => sum + s, 0);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '3px solid #E2E8F0',
      boxShadow: '0 4px 0 #E2E8F0',
      marginBottom: '14px',
      gap: '8px',
      flexWrap: 'wrap',
      width: '100%',
    }}>
      {/* Logo Game (Back to Home) */}
      <button 
        type="button"
        onClick={() => { sounds.playClick(); onNavigateHome(); }}
        onTouchEnd={(e) => {
          // Memastikan navigasi responsif pada layar sentuh mobile/tablet
          e.preventDefault();
          sounds.playClick();
          onNavigateHome();
        }}
        aria-label="Kembali ke Beranda ByteSize"
        title="Kembali ke Beranda"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          flexShrink: 0,
          background: 'none',
          border: 'none',
          padding: '4px',
          margin: '-4px',
          borderRadius: '16px',
          textAlign: 'left',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{
          width: 'clamp(36px, 4.5vw, 44px)',
          height: 'clamp(36px, 4.5vw, 44px)',
          borderRadius: '14px',
          backgroundColor: '#E0F2FE',
          border: '2px solid #BAE6FD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1.3rem, 3.5vw, 1.6rem)',
          boxShadow: '0 3px 0 #7DD3FC',
          flexShrink: 0,
          pointerEvents: 'none',
        }}>
          🤖
        </div>
        <div style={{ pointerEvents: 'none' }}>
          <h1 style={{
            fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--color-primary)',
            letterSpacing: '-0.5px',
          }}>
            Byte<span style={{ color: 'var(--color-secondary)' }}>Size</span>
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-slate)', fontWeight: 600, display: 'block' }}>
            Petualangan Koding
          </span>
        </div>
      </button>

      {/* Navigasi Cepat, Profil, & Status Bintang */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}>
        {/* Tombol Level */}
        {currentScreen !== 'WORLD_MAP' && (
          <button
            className="btn-chunky btn-primary btn-sm"
            onClick={() => { sounds.playClick(); onNavigateWorldMap(); }}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            🎮 <span className="hide-on-very-small">Level</span>
          </button>
        )}

        {/* Streak Api TikTok di Header Bar */}
        <div 
          onClick={() => { sounds.playClick(); onNavigateHome(); }}
          className="tiktok-streak-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '14px',
            fontWeight: 900,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
          }}
          title="Streak Belajar Koding Harianmu!"
        >
          <span className="tiktok-fire-icon" style={{ fontSize: '1rem', lineHeight: 1 }}>🔥</span>
          <span>{progress.dailyStreak !== undefined ? progress.dailyStreak : parseInt(localStorage.getItem(`bytesize_daily_streak_${progress.playerName}`) || '1', 10)}</span>
        </div>

        {/* Skor Bintang */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          backgroundColor: '#FFFBEB',
          border: '2px solid #FDE68A',
          borderRadius: '14px',
          fontWeight: 700,
          color: '#B45309',
          fontSize: '0.85rem',
        }}>
          <Sparkles size={16} color="#D97706" />
          <span>{totalStars} ⭐</span>
        </div>

        {/* Koin Koding */}
        <div 
          onClick={() => { sounds.playClick(); onNavigateHome(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: '#FEF3C7',
            border: '2px solid #FCD34D',
            borderRadius: '14px',
            fontWeight: 800,
            color: '#B45309',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
          title="Koin Koding - Klik untuk belanja hadiah!"
        >
          <span>🪙</span>
          <span>{progress.coins}</span>
        </div>

        {/* Tombol Pilih Avatar */}
        <button
          className="btn-chunky btn-white btn-sm"
          onClick={() => { sounds.playClick(); onNavigateAvatars(); }}
          title="Ganti Avatar Jagoan"
          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
        >
          <span>🎨 <span className="hide-on-very-small">Avatar</span></span>
        </button>

        {/* Profil Anak Aktif & Switcher Profil */}
        <button
          className="btn-chunky btn-white btn-sm"
          onClick={() => { sounds.playClick(); onOpenProfileManager(); }}
          title="Ganti Profil Pemain"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.88rem',
            maxWidth: '160px',
          }}
        >
          <Users size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '1.15rem' }}>{currentAvatar.emoji}</span>
          <span style={{
            display: 'inline-block',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 800,
          }}>
            {progress.playerName}
          </span>
        </button>

        {/* Tombol Toggle Audio */}
        <button
          type="button"
          className="btn-chunky btn-circle"
          onClick={(e) => {
            e.stopPropagation();
            if (progress.soundEnabled) {
              sounds.playClick();
            }
            onToggleSound();
          }}
          title={progress.soundEnabled ? 'Matikan Suara 🔊' : 'Nyalakan Suara 🔇'}
          style={{
            width: '40px',
            height: '40px',
            minWidth: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: progress.soundEnabled ? '#F0FDFA' : '#FEF2F2',
            border: progress.soundEnabled ? '2.5px solid #5EEAD4' : '2.5px solid #FCA5A5',
            boxShadow: progress.soundEnabled ? '0 3px 0 #14B8A6' : '0 3px 0 #EF4444',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {progress.soundEnabled ? (
            <Volume2 size={20} color="#0D9488" strokeWidth={2.5} />
          ) : (
            <VolumeX size={20} color="#DC2626" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </header>
  );
};

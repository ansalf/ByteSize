import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Lock, Sparkles, Edit3, ShoppingBag } from 'lucide-react';
import { AvatarOption, UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface AvatarSelectScreenProps {
  progress: UserProgress;
  onSelectAvatar: (avatarId: string, playerName: string) => void;
  onBack: () => void;
  onUpdateProgress?: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const AvatarSelectScreen: React.FC<AvatarSelectScreenProps> = ({
  progress,
  onSelectAvatar,
  onBack,
  onUpdateProgress,
}) => {
  const [selectedId, setSelectedId] = useState<string>(progress.selectedAvatarId || 'bytey');
  const [playerName, setPlayerName] = useState<string>(progress.playerName === 'Petualang Cilik' && !progress.hasCustomizedName ? '' : progress.playerName);

  const isAvatarUnlocked = (avatar: AvatarOption) => {
    const unlockedAvatars = progress.unlockedAvatars || [];
    if (unlockedAvatars.includes(avatar.id)) return true;
    if (avatar.unlockedAtLevel !== undefined) {
      return progress.unlockedLevel >= avatar.unlockedAtLevel;
    }
    return false;
  };

  const handleChoose = (avatar: AvatarOption) => {
    const unlocked = isAvatarUnlocked(avatar);
    if (!unlocked) {
      sounds.playBump();
      if (avatar.price) {
        sounds.speakText(`Karakter ${avatar.name} bisa dibeli di Toko Avatar seharga ${avatar.price} koin!`);
      } else if (avatar.unlockedAtLevel) {
        sounds.speakText(`Karakter ini baru terbuka saat kamu mencapai Level ${avatar.unlockedAtLevel}!`);
      }
      return;
    }
    setSelectedId(avatar.id);
    sounds.playAvatarVoice(avatar.soundType);
  };

  const handleBuyWithCoins = (avatar: AvatarOption, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!avatar.price || !onUpdateProgress) return;

    if (progress.coins < avatar.price) {
      sounds.playBump();
      sounds.speakText(`Koin kodingmu belum cukup! Kamu butuh ${avatar.price} koin untuk membuka ${avatar.name}. Selesaikan level untuk dapat koin!`);
      return;
    }

    sounds.playVictory();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFAE00', '#2ECB71', '#00C2CB'],
      });
    } catch (err) {}

    sounds.speakText(`Hore! ${avatar.name} berhasil kamu buka dengan ${avatar.price} koin!`);
    onUpdateProgress((prev) => ({
      ...prev,
      coins: prev.coins - (avatar.price || 0),
      unlockedAvatars: [...(prev.unlockedAvatars || []), avatar.id],
      selectedAvatarId: avatar.id,
    }));
    setSelectedId(avatar.id);
  };

  const handleConfirm = () => {
    sounds.stopAvatarVoice();
    sounds.playCollect();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00C2CB', '#FFAE00', '#2ECB71'],
      });
    } catch (e) {
      // safe fallback
    }
    setTimeout(() => {
      onSelectAvatar(selectedId, playerName.trim() || 'Petualang Cilik');
    }, 300);
  };

  const handleBack = () => {
    sounds.stopAvatarVoice();
    sounds.playClick();
    onBack();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flex: 1,
    }}>
      {/* Header Halaman */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        width: '100%',
      }}>
        {/* Tombol kembali hanya jika sudah pernah punya nama */}
        {progress.hasCustomizedName ? (
          <button
            className="btn-chunky btn-white btn-sm"
            onClick={handleBack}
          >
            <ArrowLeft size={18} /> Kembali
          </button>
        ) : (
          <div style={{ display: 'none' }} />
        )}
        <div style={{ textAlign: 'center', flex: '1 1 auto', minWidth: '240px' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 800, color: 'var(--color-text-navy)', margin: 0 }}>
            {!progress.hasCustomizedName ? 'Halo Petualang Baru! Siapa Namamu? 👋' : 'Pilih Jagoan Kodingmu! 🦸‍♂️'}
          </h2>
          <p style={{ color: 'var(--color-text-slate)', fontSize: '0.88rem', marginTop: '4px' }}>
            {!progress.hasCustomizedName 
              ? 'Tulis nama panggilanmu dan pilih karakter robot atau hewan favoritmu di bawah!' 
              : 'Setiap karakter memiliki suara dan kepribadian tersendiri!'}
          </p>
        </div>
        {progress.hasCustomizedName ? <div style={{ width: '80px' }} className="hide-on-very-small" /> : null}
      </div>

      {/* TOP BANNER: Set Nama Panggilan & Simpan Langsung di Atas */}
      <div className="card-kid" style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
        border: '3px solid #38BDF8',
        boxShadow: '0 8px 0 #0284C7, 0 12px 24px rgba(2, 132, 199, 0.15)',
        padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3.5vw, 20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '12px',
        borderRadius: '24px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px', minWidth: 0, width: '100%' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            border: '2px solid #BAE6FD',
            flexShrink: 0,
          }}>
            ✍️
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={{
              display: 'block',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: 'var(--color-text-navy)',
              marginBottom: '3px',
            }}>
              Nama Panggilan:
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                maxLength={20}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Contoh: Bintang Cerdas"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-family-kids)',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: '2.5px solid #CBD5E1',
                  color: 'var(--color-text-navy)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Edit3
                size={16}
                color="#0284C7"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>
        </div>

        <button
          className="btn-chunky btn-secondary"
          onClick={handleConfirm}
          style={{
            padding: '12px 20px',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            flex: '1 1 auto',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 4px 0 var(--color-secondary-dark)',
          }}
        >
          <Sparkles size={18} />
          <span>SIMPAN & BERANGKAT! 🚀</span>
        </button>
      </div>

      {/* Grid Katalog Karakter Koleksi Premium */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '16px',
        margin: '8px 0',
      }}>
        {AVATARS.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          const unlocked = isAvatarUnlocked(avatar);
          const isLocked = !unlocked;

          // Palet warna & kepribadian kartu tiap karakter
          const themeConfig: Record<string, { bgGrad: string; border: string; glow: string; badgeBg: string; typeIcon: string }> = {
            bytey: {
              bgGrad: 'linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 40%, #F0F9FF 100%)',
              border: '#38BDF8',
              glow: 'rgba(56, 189, 248, 0.35)',
              badgeBg: '#0284C7',
              typeIcon: '⚡ Cerdas',
            },
            pixel: {
              bgGrad: 'linear-gradient(180deg, #FEF3C7 0%, #FFFFFF 40%, #FFFBEB 100%)',
              border: '#FBBF24',
              glow: 'rgba(251, 191, 36, 0.4)',
              badgeBg: '#D97706',
              typeIcon: '🚀 Petualang',
            },
            bolt: {
              bgGrad: 'linear-gradient(180deg, #EDE9FE 0%, #FFFFFF 40%, #FAF5FF 100%)',
              border: '#A78BFA',
              glow: 'rgba(167, 139, 250, 0.4)',
              badgeBg: '#7C3AED',
              typeIcon: '🤖 Cepat',
            },
            dino: {
              bgGrad: 'linear-gradient(180deg, #DCFCE7 0%, #FFFFFF 40%, #F0FDF4 100%)',
              border: '#4ADE80',
              glow: 'rgba(74, 222, 128, 0.4)',
              badgeBg: '#16A34A',
              typeIcon: '🦖 Tangguh',
            },
            fox: {
              bgGrad: 'linear-gradient(180deg, #FFEDD5 0%, #FFFFFF 40%, #FFF7ED 100%)',
              border: '#FB923C',
              glow: 'rgba(251, 146, 60, 0.4)',
              badgeBg: '#EA580C',
              typeIcon: '🦊 Taktis',
            },
            duck: {
              bgGrad: 'linear-gradient(180deg, #CCFBF1 0%, #FFFFFF 40%, #F0FDFA 100%)',
              border: '#2DD4BF',
              glow: 'rgba(45, 212, 191, 0.4)',
              badgeBg: '#0D9488',
              typeIcon: '🦆 Ceria',
            },
            // Tiga Avatar Toko Koin Spesial
            horse: {
              bgGrad: 'linear-gradient(180deg, #FEF08A 0%, #FFFFFF 40%, #FFFBEB 100%)',
              border: '#F59E0B',
              glow: 'rgba(245, 158, 11, 0.45)',
              badgeBg: '#D97706',
              typeIcon: '🐴 Juara Kilat',
            },
            lion: {
              bgGrad: 'linear-gradient(180deg, #FED7AA 0%, #FFFFFF 40%, #FFF7ED 100%)',
              border: '#F97316',
              glow: 'rgba(249, 115, 22, 0.45)',
              badgeBg: '#C2410C',
              typeIcon: '🦁 Raja Logika',
            },
            penguin: {
              bgGrad: 'linear-gradient(180deg, #BAE6FD 0%, #FFFFFF 40%, #F0F9FF 100%)',
              border: '#0EA5E9',
              glow: 'rgba(14, 165, 233, 0.45)',
              badgeBg: '#0369A1',
              typeIcon: '🐧 Teliti Kutub',
            },
            frog: {
              bgGrad: 'linear-gradient(180deg, #DCFCE7 0%, #FFFFFF 40%, #F0FDF4 100%)',
              border: '#22C55E',
              glow: 'rgba(34, 197, 94, 0.45)',
              badgeBg: '#15803D',
              typeIcon: '🐸 Pelompat Kode',
            },
            monkey: {
              bgGrad: 'linear-gradient(180deg, #FFEDD5 0%, #FFFFFF 40%, #FFF7ED 100%)',
              border: '#F97316',
              glow: 'rgba(249, 115, 22, 0.45)',
              badgeBg: '#C2410C',
              typeIcon: '🐵 Cerdik Lincah',
            },
            rabbit: {
              bgGrad: 'linear-gradient(180deg, #FCE7F3 0%, #FFFFFF 40%, #FDF2F8 100%)',
              border: '#EC4899',
              glow: 'rgba(236, 72, 153, 0.45)',
              badgeBg: '#BE185D',
              typeIcon: '🐰 Kelinci Riang',
            },
            bear: {
              bgGrad: 'linear-gradient(180deg, #FEF3C7 0%, #FFFFFF 40%, #FFFBEB 100%)',
              border: '#B45309',
              glow: 'rgba(180, 83, 9, 0.45)',
              badgeBg: '#78350F',
              typeIcon: '🐻 Pelindung Tangguh',
            },
            elephant: {
              bgGrad: 'linear-gradient(180deg, #E0E7FF 0%, #FFFFFF 40%, #EEF2FF 100%)',
              border: '#6366F1',
              glow: 'rgba(99, 102, 241, 0.45)',
              badgeBg: '#4338CA',
              typeIcon: '🐘 Memori Super',
            },
            owl: {
              bgGrad: 'linear-gradient(180deg, #EDE9FE 0%, #FFFFFF 40%, #FAF5FF 100%)',
              border: '#8B5CF6',
              glow: 'rgba(139, 92, 246, 0.45)',
              badgeBg: '#6D28D9',
              typeIcon: '🦉 Profesor Logika',
            },
            tiger: {
              bgGrad: 'linear-gradient(180deg, #FFEDD5 0%, #FFFFFF 40%, #FFF7ED 100%)',
              border: '#EA580C',
              glow: 'rgba(234, 88, 12, 0.45)',
              badgeBg: '#9A3412',
              typeIcon: '🐯 Harimau Tangkas',
            },
            dragon: {
              bgGrad: 'linear-gradient(180deg, #FEE2E2 0%, #FFFFFF 40%, #FEF2F2 100%)',
              border: '#EF4444',
              glow: 'rgba(239, 68, 68, 0.55)',
              badgeBg: '#B91C1C',
              typeIcon: '🐲 Naga Legendaris',
            },
          };

          const theme = themeConfig[avatar.id] || {
            bgGrad: 'linear-gradient(180deg, #F1F5F9 0%, #FFFFFF 40%, #F8FAFC 100%)',
            border: '#94A3B8',
            glow: 'rgba(148, 163, 184, 0.3)',
            badgeBg: '#64748B',
            typeIcon: '⭐ Jagoan',
          };

          const canAffordCoins = avatar.price ? progress.coins >= avatar.price : false;

          return (
            <div
              key={avatar.id}
              onClick={() => handleChoose(avatar)}
              className={`card-kid ${!isLocked ? 'card-kid-interactive' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px 20px 20px',
                borderRadius: '32px',
                border: isSelected 
                  ? `4px solid ${theme.border}` 
                  : isLocked 
                  ? '3px dashed #CBD5E1' 
                  : '3px solid #E2E8F0',
                background: isLocked ? '#F8FAFC' : theme.bgGrad,
                boxShadow: isSelected 
                  ? `0 10px 0 ${theme.badgeBg}, 0 16px 32px ${theme.glow}` 
                  : isLocked 
                  ? 'none'
                  : '0 8px 0 #E2E8F0, 0 8px 18px rgba(0, 0, 0, 0.04)',
                opacity: isLocked ? 0.75 : 1,
                position: 'relative',
                transform: isSelected ? 'translateY(-6px)' : undefined,
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                overflow: 'hidden',
              }}
            >
              {/* Ornamen Kilau Foil Hologram saat Terpilih */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '-40%',
                  left: '-40%',
                  width: '180%',
                  height: '180%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.3) 100%)',
                  pointerEvents: 'none',
                  transform: 'rotate(25deg)',
                }} />
              )}

              {/* Tag Tipe Karakter di Pojok Kiri Atas */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: isLocked ? '#94A3B8' : theme.badgeBg,
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
              }}>
                {theme.typeIcon}
              </div>

              {/* Status Badge Pojok Kanan Atas: Terpilih atau Koin / Level */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'var(--color-success)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 6px rgba(46, 203, 113, 0.4)',
                }}>
                  <Check size={20} strokeWidth={3.5} />
                </div>
              )}

              {isLocked && avatar.price && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.35)',
                }}>
                  <span>🪙 {avatar.price}</span>
                </div>
              )}

              {isLocked && !avatar.price && avatar.unlockedAtLevel && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#64748B',
                  color: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  <Lock size={12} strokeWidth={2.5} /> Lv.{avatar.unlockedAtLevel}
                </div>
              )}

              {/* Wadah Panggung Avatar Bulat 3D */}
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: isSelected ? `4px solid ${theme.border}` : '3px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '14px',
                marginBottom: '12px',
                boxShadow: isSelected 
                  ? `inset 0 2px 6px rgba(0,0,0,0.06), 0 8px 16px ${theme.glow}` 
                  : 'inset 0 2px 6px rgba(0,0,0,0.04), 0 6px 12px rgba(0,0,0,0.04)',
                position: 'relative',
              }}>
                <span style={{ fontSize: '4.8rem', lineHeight: 1 }} className={isSelected ? 'animate-gentle-bounce' : ''}>
                  {avatar.emoji}
                </span>
              </div>

              {/* Nama Karakter */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--color-text-navy)',
                marginBottom: '2px',
              }}>
                {avatar.name}
              </h3>

              {/* Julukan Karakter */}
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: isLocked ? '#94A3B8' : theme.badgeBg,
                marginBottom: '12px',
              }}>
                {avatar.nickname}
              </span>

              {/* Deskripsi Keahlian */}
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-slate)',
                lineHeight: 1.45,
                fontWeight: 600,
                flex: 1,
              }}>
                {avatar.description}
              </p>

              {/* Action Bar Bawah Kartu */}
              <div style={{
                marginTop: '14px',
                width: '100%',
                paddingTop: '10px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isLocked && avatar.price ? (
                  <button
                    onClick={(e) => handleBuyWithCoins(avatar, e)}
                    className={`btn-chunky ${canAffordCoins ? 'btn-secondary btn-sm' : 'btn-white btn-sm'}`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>{canAffordCoins ? `Buka Sekarang (${avatar.price} 🪙)` : `Butuh ${avatar.price} 🪙 (Buka di Toko)`}</span>
                  </button>
                ) : (
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: isSelected ? 'var(--color-success)' : isLocked ? '#94A3B8' : 'var(--color-primary)',
                  }}>
                    {isSelected ? '✓ Sedang Dipakai' : isLocked ? `Terkunci (Level ${avatar.unlockedAtLevel})` : 'Pilih Jagoan ➔'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

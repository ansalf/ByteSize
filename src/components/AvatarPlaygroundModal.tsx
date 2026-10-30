import React, { useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgress } from '../types/game';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface AvatarPlaygroundModalProps {
  progress: UserProgress;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
}

export const AvatarPlaygroundModal: React.FC<AvatarPlaygroundModalProps> = ({
  progress,
  onClose,
  onSelectAvatar,
}) => {
  const [activeAvatarId, setActiveAvatarId] = useState<string>(progress.selectedAvatarId);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  // Avatar yang dimiliki oleh anak
  const unlockedIds = progress.unlockedAvatars && progress.unlockedAvatars.length > 0 
    ? progress.unlockedAvatars 
    : ['bytey'];

  const ownedAvatars = AVATARS.filter(a => unlockedIds.includes(a.id));

  // Klik avatar di taman untuk berinteraksi, memutar suara khasnya, dan animasi lompat
  const handleInteractWithAvatar = (avatar: typeof AVATARS[0]) => {
    sounds.playAvatarVoice(avatar.soundType);
    setCelebratingId(avatar.id);

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#00C2CB', '#FFAE00', '#2ECB71'],
      });
    } catch {}

    setTimeout(() => {
      setCelebratingId(null);
    }, 1200);
  };

  const handleSetMainAvatar = (avatarId: string) => {
    sounds.playClick();
    setActiveAvatarId(avatarId);
    onSelectAvatar(avatarId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 1150 }}>
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
          border: '4px solid #86EFAC',
          boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'relative',
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
          title="Tutup Taman"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* HEADER TAMAN HABITAT */}
        <div style={{
          background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)',
          padding: '16px 60px 14px 20px',
          borderBottom: '2px dashed #86EFAC',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#22C55E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)',
          }}>
            🏡
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532D', margin: 0 }}>
              Taman Jagoan Koding (Rumah Bermain Avatar)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, margin: '2px 0 0 0' }}>
              Tempat berkumpul semua karakter avatar yang sudah kamu miliki!
            </p>
          </div>
        </div>

        {/* PANDUAN CARA BERMAIN RAMAH ANAK */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#FFFBEB',
          borderBottom: '2px dashed #FDE68A',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>Cara Seru Bermain di Taman Avatar:</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#78350F',
            fontWeight: 700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>👆</span>
              <span><b>Sentuh Hewan:</b> Karakter akan melompat gembira!</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔊</span>
              <span><b>Klik Tombol "Bunyi":</b> Dengarkan suara asli karakternya!</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⭐</span>
              <span><b>Tombol "Pilih":</b> Ganti jadi jagoan utamamu di level koding!</span>
            </div>
          </div>
        </div>

        {/* AREA PADANG RUMPUT TAMAN (PLAYGROUND INTERAKTIF) */}
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px 20px',
          backgroundColor: '#F0FDF4',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          flex: 1,
        }}>
          {/* Padang Rumput Utama */}
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '3px solid #86EFAC',
            borderRadius: '24px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            boxShadow: 'inset 0 4px 12px rgba(22, 101, 52, 0.06)',
          }}>
            {/* Hiasan Bunga & Awan Padang Rumput */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px', fontSize: '1.2rem', flexWrap: 'wrap', gap: '6px' }}>
              <span>🌸 🌼 🌺</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803D', backgroundColor: '#FFFFFF', padding: '4px 14px', borderRadius: '14px', border: '1.5px solid #BBF7D0' }}>
                Ada {ownedAvatars.length} Jagoan Bermain di Sini
              </span>
              <span>🌻 🌿 🍀</span>
            </div>

            {/* Grid Seluruh Avatar yang Dimiliki */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '14px',
              width: '100%',
            }}>
              {ownedAvatars.map((a) => {
                const isSelected = activeAvatarId === a.id;
                const isCelebrating = celebratingId === a.id;

                return (
                  <div
                    key={a.id}
                    onClick={() => handleInteractWithAvatar(a)}
                    className="card-kid card-kid-interactive"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: isSelected ? '3px solid #00C2CB' : '2px solid #BBF7D0',
                      borderRadius: '20px',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected 
                        ? '0 8px 16px rgba(0, 194, 203, 0.25)' 
                        : '0 4px 10px rgba(0,0,0,0.05)',
                      transform: isCelebrating ? 'scale(1.08) translateY(-6px)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        backgroundColor: '#00C2CB',
                        color: '#FFFFFF',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}>
                        AKTIF ✓
                      </div>
                    )}

                    <span style={{
                      fontSize: '3.2rem',
                      lineHeight: 1,
                      display: 'inline-block',
                    }} className={isCelebrating ? 'animate-gentle-bounce' : ''}>
                      {a.emoji}
                    </span>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#14532D' }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A' }}>
                        "{a.nickname}"
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInteractWithAvatar(a);
                        }}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '10px',
                          backgroundColor: '#F0FDF4',
                          border: '1.5px solid #86EFAC',
                          color: '#15803D',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                        }}
                        title="Dengarkan suara"
                      >
                        <Volume2 size={12} /> Bunyi
                      </button>

                      {!isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMainAvatar(a.id);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '10px',
                            backgroundColor: '#00C2CB',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                          title="Pilih sebagai karakter utama"
                        >
                          Pilih
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Slot Kosong Mengajak Anak Mengumpulkan Lebih Banyak Karakter */}
              {ownedAvatars.length < 12 && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  border: '2px dashed #86EFAC',
                  borderRadius: '20px',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '2.2rem', opacity: 0.7 }}>➕</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>
                    Mau Teman Baru?
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#15803D' }}>
                    Kumpulkan koin koding & buka di Toko!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

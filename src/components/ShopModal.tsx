import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Check, Lock, Volume2, HelpCircle } from 'lucide-react';
import { UserProgress } from '../types/game';
import { SHOP_ITEMS, ShopItem } from '../config/shop';
import { sounds } from '../utils/sound';

interface ShopModalProps {
  progress: UserProgress;
  onClose: () => void;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onClose,
  onUpdateProgress,
}) => {
  const [showCoinGuide, setShowCoinGuide] = useState<boolean>(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const unlockedAvatars = progress.unlockedAvatars || [];
  const selectedAvatarId = progress.selectedAvatarId;

  const handleBuyItem = (item: ShopItem) => {
    if (progress.coins < item.price) {
      sounds.playBump();
      sounds.speakText(`Koin kodingmu belum cukup! Kamu butuh ${item.price} koin. Ayo kumpulkan koin lagi dengan menyelesaikan level!`);
      return;
    }

    sounds.playVictory();
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FFAE00', '#2ECB71', '#00C2CB', '#FF5C5C'],
      });
    } catch (e) {
      // safe fallback
    }

    sounds.speakText(`Hore! Kamu berhasil mendapatkan ${item.name}!`);

    onUpdateProgress((prev) => {
      const currentAvatars = prev.unlockedAvatars || [];
      const newAvatars = currentAvatars.includes(item.previewValue)
        ? currentAvatars
        : [...currentAvatars, item.previewValue];

      return {
        ...prev,
        coins: prev.coins - item.price,
        unlockedAvatars: newAvatars,
        selectedAvatarId: item.previewValue,
      };
    });
  };

  const handleEquipItem = (item: ShopItem) => {
    sounds.playClick();
    onUpdateProgress((prev) => {
      sounds.playAvatarVoice(item.previewValue as any);
      sounds.speakText(`Karakter ${item.name} dipilih sebagai jagoanmu!`);
      return { ...prev, selectedAvatarId: item.previewValue };
    });
  };

  const handleHearDescription = (item: ShopItem) => {
    setPlayingItemId(item.id);
    
    // 1. Putar suara khas hewan/karakternya secara langsung
    sounds.playAvatarVoice(item.previewValue as any);

    // 2. Beri narasi penjelasan suara ramah anak
    setTimeout(() => {
      sounds.speakText(
        `Ini adalah ${item.name}. ${item.description}`,
        undefined,
        () => setPlayingItemId(null)
      );
    }, 450);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflow: 'hidden',
          borderRadius: '28px',
          backgroundColor: '#FFFFFF',
          border: '4px solid #FCD34D',
          boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'relative',
        }}
      >
        {/* Tombol Tutup Toko di Pojok Kanan Atas Modal */}
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
          title="Tutup Toko"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Header Toko Hadiah */}
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
          padding: '16px 60px 14px 20px',
          borderBottom: '2px dashed #FDE68A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: '#FFAE00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(255, 174, 0, 0.35)',
              fontSize: '1.4rem',
            }}>
              🛍️
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-navy)', lineHeight: 1.15, margin: 0 }}>
                Toko Karakter Avatar ⭐
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700, margin: '2px 0 0 0' }}>
                Kumpulkan koin koding & buka karakter impianmu!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Saldo Koin Saat Ini */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '2px solid #FDE68A',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🪙</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#B45309' }}>
                {progress.coins}
              </span>
            </div>

            {/* Tombol Panduan Koin */}
            <button
              onClick={() => { sounds.playClick(); setShowCoinGuide(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '18px',
                backgroundColor: '#FEF08A',
                border: '2px solid #FACC15',
                color: '#854D0E',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 0 #CA8A04',
                transition: 'all 0.15s ease',
              }}
              title="Cara dapat koin"
            >
              <HelpCircle size={15} />
              <span>Dapat Koin?</span>
            </button>
          </div>
        </div>

        {/* Tab Kategori Toko - Modern Segmented Control Pills */}
        {/* Banner Motivasi Koin di dalam Toko */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#FFFBEB',
          borderBottom: '1px solid #FEF3C7',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.84rem',
          color: '#92400E',
          fontWeight: 700,
        }}>
          <span style={{ fontSize: '1.2rem' }}>⭐</span>
          <span>Koleksi 11 Avatar Keren: <b>Guntur si Kuda (100 🪙)</b>, <b>Piko (80 🪙)</b>, hingga <b>Naga Legendaris (200 🪙)</b>!</span>
        </div>

        {/* Daftar Avatar Toko (Scrollable Container Aman Rounded) */}
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          flex: 1,
        }}>
          {SHOP_ITEMS.map((item) => {
            const isOwned = unlockedAvatars.includes(item.previewValue);
            const isEquipped = selectedAvatarId === item.previewValue;
            const canAfford = progress.coins >= item.price;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: isOwned ? '#F0FDF4' : '#FFFFFF',
                  border: isEquipped 
                    ? '3px solid #2ECB71' 
                    : isOwned 
                      ? '2px solid #86EFAC' 
                      : '2px solid #E2E8F0',
                  borderRadius: '24px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  boxShadow: isEquipped
                    ? '0 10px 20px rgba(46, 203, 113, 0.2)'
                    : '0 4px 12px rgba(0,0,0,0.04)',
                }}
              >
                {/* Badge Status Terpasang / Dimiliki */}
                {isEquipped && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '14px',
                    backgroundColor: '#2ECB71',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(46, 203, 113, 0.3)',
                  }}>
                    <Check size={12} strokeWidth={3} /> JAGOAN AKTIF
                  </div>
                )}

                {/* Bagian Atas: Emoji & Suara Penjelasan */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    backgroundColor: '#E0F2FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.8rem',
                    border: '2.5px solid #BAE6FD',
                  }}>
                    {item.emoji}
                  </div>

                  <button
                    onClick={() => handleHearDescription(item)}
                    style={{
                      background: playingItemId === item.id 
                        ? 'linear-gradient(135deg, #00C2CB 0%, #0284C7 100%)' 
                        : '#F1F5F9',
                      border: playingItemId === item.id ? '2px solid #00C2CB' : '2px solid #E2E8F0',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: playingItemId === item.id ? '#FFFFFF' : '#475569',
                      boxShadow: playingItemId === item.id 
                        ? '0 0 12px rgba(0, 194, 203, 0.6)' 
                        : '0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s ease',
                      transform: playingItemId === item.id ? 'scale(1.12)' : 'none',
                    }}
                    title="Dengarkan suara & sifat karakter"
                  >
                    <Volume2 size={19} className={playingItemId === item.id ? 'animate-pulse-glow' : ''} />
                  </button>
                </div>

                {/* Judul & Deskripsi Item */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-navy)', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                </div>

                {/* Tombol Aksi: Beli atau Pasang */}
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  {isOwned ? (
                    <button
                      onClick={() => handleEquipItem(item)}
                      className={`btn-chunky ${isEquipped ? 'btn-white' : 'btn-success'}`}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        borderRadius: '16px',
                      }}
                    >
                      {isEquipped ? '✓ Sedang Dipakai' : 'Pilih Karakter Ini'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyItem(item)}
                      className={`btn-chunky ${canAfford ? 'btn-secondary' : 'btn-white'}`}
                      disabled={!canAfford}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity: canAfford ? 1 : 0.65,
                      }}
                    >
                      {canAfford ? (
                        <>
                          <Sparkles size={16} />
                          <span>Buka Karakter ({item.price} 🪙)</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>Butuh {item.price} 🪙</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal / Dialog Panduan Mendapatkan Koin */}
      {showCoinGuide && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCoinGuide(false)}
          style={{ zIndex: 1100, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div
            className="card-kid"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '4px solid #FCD34D',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.8rem' }}>🪙</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
                  Cara Mendapatkan Koin!
                </h3>
              </div>
              <button
                onClick={() => setShowCoinGuide(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
              Ingin membeli avatar keren seperti <b>Guntur si Kuda (100 Koin)</b> atau <b>Leo si Singa (150 Koin)</b>? Ini dia rahasia mengumpulkan banyak koin koding:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: '#FEF3C7',
                border: '2px solid #FDE68A',
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}>
                  ⭐
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400E' }}>
                    Selesaikan Level dengan 3 Bintang
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                    Dapatkan hingga <b>+30 Koin</b> setiap level saat kodemu rapi dan efisien!
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: '#DCFCE7',
                border: '2px solid #86EFAC',
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}>
                  🎯
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#166534' }}>
                    Taklukkan Dunia Baru
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D' }}>
                    Membuka dunia baru di Peta Petualangan memberikan bonus koin ekstra!
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '16px',
                backgroundColor: '#E0F2FE',
                border: '2px solid #BAE6FD',
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}>
                  🔄
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#075985' }}>
                    Ulangi Level yang Belum 3 Bintang
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0369A1' }}>
                    Perbaiki kodemu menjadi lebih cerdas untuk mengambil sisa koin emas!
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCoinGuide(false)}
              className="btn-chunky btn-secondary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.95rem',
                borderRadius: '16px',
                marginTop: '4px',
              }}
            >
              Aku Mengerti! Ayo Kumpulkan Koin! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

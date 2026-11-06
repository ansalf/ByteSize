import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface VictoryModalProps {
  levelTitle: string;
  starsEarned: number;
  blocksUsed: number;
  targetBlocksFor3Stars: number;
  onNextLevel: () => void;
  onReplay: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelTitle,
  starsEarned,
  blocksUsed,
  targetBlocksFor3Stars,
  onNextLevel,
  onReplay,
  hasNextLevel,
}) => {
  useEffect(() => {
    // Ledakan confetti ceria meriah saat anak menang
    try {
      // Semburan tengah
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFAE00', '#00C2CB', '#2ECB71', '#FF4B72', '#8854D0'],
      });

      // Semburan kembang api kiri
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#FFAE00', '#2ECB71', '#00C2CB'],
        });
      }, 250);

      // Semburan kembang api kanan
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#FF4B72', '#8854D0', '#FFAE00'],
        });
      }, 450);
    } catch (e) {
      // safe fallback
    }
    // Suara victory dan text-to-speech perayaan level dinonaktifkan sesuai preferensi pengguna
  }, [levelTitle, starsEarned]);

  return (
    <div className="modal-backdrop">
      <div className="card-kid" style={{
        maxWidth: '480px',
        width: '100%',
        maxHeight: '92vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        border: '4px solid #FDE68A',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3.5vw, 24px)',
          flex: 1,
        }}>
        {/* Ikon Piala / Perayaan */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          backgroundColor: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}>
          <Trophy size={48} color="#D97706" />
        </div>

        <h3 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-text-navy)',
          marginBottom: '4px',
        }}>
          🎉 LUAR BIASA! 🎉
        </h3>
        <p style={{ color: 'var(--color-text-slate)', fontSize: '1rem', marginBottom: '16px' }}>
          Tantangan <strong>{levelTitle}</strong> Berhasil Ditaklukkan!
        </p>

        {/* Tampilan 3 Bintang dengan Animasi Pop */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[1, 2, 3].map((starIdx) => {
            const isFilled = starIdx <= starsEarned;
            return (
              <div
                key={starIdx}
                className={isFilled ? 'animate-gentle-bounce' : ''}
                style={{
                  transform: `scale(${starIdx === 2 ? 1.25 : 1})`,
                  transition: 'all 0.3s ease',
                }}
              >
                <Star
                  size={46}
                  fill={isFilled ? '#FFAE00' : '#E2E8F0'}
                  color={isFilled ? '#D48800' : '#CBD5E1'}
                />
              </div>
            );
          })}
        </div>

        {/* Kotak Ringkasan Efisiensi Kode */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '18px',
          padding: '12px 20px',
          border: '2px solid #E2E8F0',
          width: '100%',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-slate)', fontWeight: 600 }}>
              Balok Digunakan
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {blocksUsed}
            </div>
          </div>
          <div style={{ borderLeft: '2px solid #E2E8F0' }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-slate)', fontWeight: 600 }}>
              Target 3 Bintang
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
              ≤ {targetBlocksFor3Stars} Balok
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}>
          {hasNextLevel ? (
            <button
              className="btn-chunky btn-secondary btn-lg"
              onClick={() => { sounds.playClick(); onNextLevel(); }}
              style={{ width: '100%' }}
            >
              <Sparkles size={22} />
              <span>LEVEL BERIKUTNYA</span>
              <ArrowRight size={22} />
            </button>
          ) : (
            <div style={{
              padding: '12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '16px',
              fontWeight: 700,
              color: '#B45309',
            }}>
              👑 Selamat! Kamu Telah Menamatkan Seluruh 12 Level ByteSize!
            </div>
          )}

          <button
            className="btn-chunky btn-white"
            onClick={() => { sounds.playClick(); onReplay(); }}
            style={{ width: '100%' }}
          >
            <RotateCcw size={18} />
            <span>Mainkan Lagi Level Ini</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

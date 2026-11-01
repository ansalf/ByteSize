import React, { useState } from 'react';
import { X, Play, RotateCcw, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface SafePathTutorialModalProps {
  onClose: () => void;
  onProceedToPlay: () => void;
}

export const SafePathTutorialModal: React.FC<SafePathTutorialModalProps> = ({
  onClose,
  onProceedToPlay,
}) => {
  // Tab Demo: 'WITHOUT_CHECK' (Kondisi A) vs 'WITH_CHECK' (Kondisi B)
  const [activeScenario, setActiveScenario] = useState<'WITHOUT_CHECK' | 'WITH_CHECK'>('WITHOUT_CHECK');
  
  // State animasi demo
  // Step 0: Initial
  // Step 1: Sedang mengecek (khusus B) / Langsung maju (khusus A)
  // Step 2: Hasil (Tabrakan di A / Menghindar dan selamat di B)
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  const handleStartDemo = () => {
    sounds.playClick();
    setIsDemoRunning(true);
    setDemoStep(1);

    if (activeScenario === 'WITHOUT_CHECK') {
      // Kondisi A: Karakter maju tanpa melihat -> menabrak batu!
      setTimeout(() => {
        sounds.playBump();
        setDemoStep(2);
        setIsDemoRunning(false);
      }, 900);
    } else {
      // Kondisi B: Karakter cek sensor dulu -> deteksi batu -> sensor batalkan maju & berbelok aman!
      setTimeout(() => {
        sounds.playStep();
        setDemoStep(2);
        setTimeout(() => {
          sounds.playVictory();
          setDemoStep(3);
          setIsDemoRunning(false);
        }, 1100);
      }, 900);
    }
  };

  const handleResetDemo = () => {
    sounds.playClick();
    setDemoStep(0);
    setIsDemoRunning(false);
  };

  const handleSwitchTab = (tab: 'WITHOUT_CHECK' | 'WITH_CHECK') => {
    sounds.playClick();
    setActiveScenario(tab);
    setDemoStep(0);
    setIsDemoRunning(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 1250 }}>
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          padding: 'clamp(18px, 4vw, 28px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
          border: '4px solid #00C2CB',
          position: 'relative',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
      >
        {/* Tombol Tutup */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
          }}
        >
          <X size={22} />
        </button>

        {/* HEADER TUTORIAL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            backgroundColor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            border: '2px solid #7DD3FC',
          }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PANDUAN VISUAL SENSOR
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
              Mengapa Robot Butuh "Jalur Aman"?
            </h3>
          </div>
        </div>

        {/* ANALOGI CERITA DUNIA NYATA ANAK SD */}
        <div style={{
          backgroundColor: '#F0FDFA',
          padding: '14px 18px',
          borderRadius: '18px',
          border: '2px solid #99F6E4',
          marginBottom: '18px',
          lineHeight: 1.5,
          fontSize: '0.93rem',
          color: '#134E4A',
        }}>
          <strong>👀 Bayangkan saat kamu ingin menyeberang jalan:</strong>
          <p style={{ marginTop: '4px' }}>
            Apakah kamu langsung lari begitu saja tanpa menengok? Tentu tidak! Kamu akan <b>menengok ke depan dulu</b> untuk memastikan tidak ada kendaraan atau batu besar.
            Sama seperti robot: kode <code>ifPathAhead()</code> adalah <b>mata sensorik robot</b> untuk memeriksa apakah petak di depannya aman sebelum melangkah!
          </p>
        </div>

        {/* TAB KOMPARASI KONDISI A vs KONDISI B */}
        <div style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => handleSwitchTab('WITHOUT_CHECK')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeScenario === 'WITHOUT_CHECK' ? '#EF4444' : 'transparent',
              color: activeScenario === 'WITHOUT_CHECK' ? '#FFFFFF' : '#64748B',
              boxShadow: activeScenario === 'WITHOUT_CHECK' ? '0 3px 0 #B91C1C' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            ❌ Kondisi A: Tanpa Cek Jalur
          </button>
          <button
            onClick={() => handleSwitchTab('WITH_CHECK')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeScenario === 'WITH_CHECK' ? '#10B981' : 'transparent',
              color: activeScenario === 'WITH_CHECK' ? '#FFFFFF' : '#64748B',
              boxShadow: activeScenario === 'WITH_CHECK' ? '0 3px 0 #047857' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            ✅ Kondisi B: Pakai Jalur Aman
          </button>
        </div>

        {/* PANGGUNG MINI SIMULASI KOMPARASI */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '20px',
          border: '2.5px solid #E2E8F0',
          padding: '18px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}>
          {/* Mini Grid 3 Petak: [Robot] -> [Batu/Celah] -> [Tujuan Bawah/Kanan] */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Petak 1: Titik Awal Robot */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              backgroundColor: demoStep === 0 || (activeScenario === 'WITH_CHECK' && demoStep < 3) ? '#FEF08A' : '#FEF9C3',
              border: '2px solid #FACC15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              position: 'relative',
            }}>
              {demoStep === 0 && '🤖'}
              {demoStep > 0 && activeScenario === 'WITH_CHECK' && demoStep < 3 && '🤖'}
              <span style={{ position: 'absolute', bottom: '2px', fontSize: '0.65rem', fontWeight: 800, color: '#854D0E' }}>
                START
              </span>
            </div>

            {/* Panah Indikator Arah */}
            <div style={{ fontSize: '1.2rem', color: '#94A3B8' }}>➔</div>

            {/* Petak 2: Petak Rintangan di Depan */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              backgroundColor: (activeScenario === 'WITH_CHECK' && demoStep === 1) 
                ? '#FEE2E2' 
                : '#E2E8F0',
              border: (activeScenario === 'WITH_CHECK' && demoStep === 1) 
                ? '3px solid #DC2626' 
                : '2px solid #94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              position: 'relative',
              boxShadow: (activeScenario === 'WITH_CHECK' && demoStep === 1) ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
            }}>
              {activeScenario === 'WITHOUT_CHECK' && demoStep === 2 ? '💥' : '🪨'}
              
              {/* Badge Hasil Pemeriksaan Sensor */}
              {activeScenario === 'WITH_CHECK' && demoStep >= 1 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '2px 6px',
                  borderRadius: '8px',
                }}>
                  ⚠️ BAHAYA!
                </span>
              )}
            </div>

            {/* Petak 3: Jalur Alternatif Bawah/Samping */}
            {activeScenario === 'WITH_CHECK' && (
              <>
                <div style={{ fontSize: '1.2rem', color: '#10B981' }}>⬇️</div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  backgroundColor: demoStep === 3 ? '#DCFCE7' : '#FEF08A',
                  border: '2px solid #86EFAC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  position: 'relative',
                }}>
                  {demoStep === 3 ? '🤖' : '🏁'}
                  <span style={{ position: 'absolute', bottom: '2px', fontSize: '0.62rem', fontWeight: 800, color: '#166534' }}>
                    FINISH
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Kotak Kode yang Dijalankan di Demo */}
          <div style={{
            width: '100%',
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: '14px',
            fontFamily: 'var(--font-family-code)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}>
            <div style={{ color: '#94A3B8', fontSize: '0.72rem', marginBottom: '4px', textTransform: 'uppercase' }}>
              Kode Program:
            </div>
            {activeScenario === 'WITHOUT_CHECK' ? (
              <div>
                <span style={{ color: '#F87171' }}>// Langsung maju tanpa sensor:</span><br />
                <span style={{ color: '#FDE047' }}>moveForward();</span> <span style={{ color: '#EF4444' }}>// 💥 Menabrak batu!</span>
              </div>
            ) : (
              <div>
                <span style={{ color: '#38BDF8' }}>// Periksa jalan di depan dulu:</span><br />
                <span style={{ color: '#FDE047' }}>ifPathAhead(() =&gt; &#123;</span><br />
                &nbsp;&nbsp;moveForward();<br />
                <span style={{ color: '#FDE047' }}>&#125;);</span> <span style={{ color: '#10B981' }}>// 🛡️ Batal maju karena ada batu!</span><br />
                <span style={{ color: '#4ADE80' }}>turnRight();</span><br />
                <span style={{ color: '#4ADE80' }}>moveForward();</span> <span style={{ color: '#10B981' }}>// ✅ Selamat lewat rute bawah!</span>
              </div>
            )}
          </div>

          {/* Pesan Edukatif Hasil Simulasi */}
          <div style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: activeScenario === 'WITHOUT_CHECK' ? '#FEF2F2' : '#ECFDF5',
            border: activeScenario === 'WITHOUT_CHECK' ? '1.5px solid #FCA5A5' : '1.5px solid #86EFAC',
            color: activeScenario === 'WITHOUT_CHECK' ? '#991B1B' : '#065F46',
            fontSize: '0.86rem',
            lineHeight: 1.4,
          }}>
            {activeScenario === 'WITHOUT_CHECK' ? (
              demoStep === 2 ? (
                <div>
                  <strong>💥 Aduh! Karakter menabrak batu!</strong>
                  <p style={{ marginTop: '2px' }}>
                    Karena tidak memeriksa jalan dengan <code>ifPathAhead()</code>, perintah <code>moveForward()</code> dipaksa melangkah dan karakter menabrak rintangan!
                  </p>
                </div>
              ) : (
                'Tekan tombol "Jalankan Simulasi" untuk melihat apa yang terjadi jika tidak memeriksa jalur.'
              )
            ) : (
              demoStep >= 1 ? (
                <div>
                  <strong>🛡️ Luar Biasa! Karakter selamat!</strong>
                  <p style={{ marginTop: '2px' }}>
                    Sensor <code>ifPathAhead()</code> mendeteksi batu di depan. Karena jalan tidak aman, perintah maju di dalamnya <b>otomatis dibatalkan</b> sehingga robot tidak menabrak batu, lalu bisa berbelok ke jalan aman!
                  </p>
                </div>
              ) : (
                'Tekan tombol "Jalankan Simulasi" untuk melihat bagaimana sensor melindungi robot dari tabrakan.'
              )
            )}
          </div>

          {/* Tombol Play / Ulang Simulasi */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={handleStartDemo}
              disabled={isDemoRunning || demoStep > 0}
              className={`btn-chunky ${activeScenario === 'WITHOUT_CHECK' ? 'btn-danger' : 'btn-success'}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
            >
              <Play size={16} /> Jalankan Simulasi
            </button>
            {demoStep > 0 && (
              <button
                onClick={handleResetDemo}
                className="btn-chunky btn-white"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
              >
                <RotateCcw size={16} /> Ulangi
              </button>
            )}
          </div>
        </div>

        {/* 3 KUNCI PENTING MEMAHAMI SENSOR JALUR AMAN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
            📌 3 Hal Penting yang Perlu Diingat Anak:
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
            <span style={{ fontSize: '1rem' }}>1️⃣</span>
            <span><b>ifPathAhead(() =&gt; &#123; ... &#125;)</b> hanya mengecek 1 petak tepat di depan arah pandang robot saat ini.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
            <span style={{ fontSize: '1rem' }}>2️⃣</span>
            <span>Jika jalan di depan <b>ADA BATU</b> atau jurang, semua kode di dalam kurung kurawal <code>&#123; &#125;</code> akan <b>dilewati dengan aman</b>.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
            <span style={{ fontSize: '1rem' }}>3️⃣</span>
            <span>Gunakan kode ini saat kamu menghadapi jalur bercabang atau rute yang belum pasti keamanannya!</span>
          </div>
        </div>

        {/* TOMBOL LANJUT MAIN */}
        <button
          onClick={() => { sounds.playClick(); onProceedToPlay(); }}
          className="btn-chunky btn-secondary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        >
          <span>Paham! Sekarang Saya Siap Coba di Permainan 🚀</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

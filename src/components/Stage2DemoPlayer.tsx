import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, ArrowLeft, Terminal, CheckCircle, Code2, SkipForward, Sparkles, RotateCw, Repeat } from 'lucide-react';
import { Direction, LevelConfig } from '../types/game';
import { GameStage } from './GameStage';
import { executeJavaScriptSafely } from '../engine/jsInterpreter';
import { sounds } from '../utils/sound';

interface Stage2DemoPlayerProps {
  level: LevelConfig;
  avatarId: string;
  onProceedToChallenge: () => void;
  onBackToLesson: () => void;
}

export const Stage2DemoPlayer: React.FC<Stage2DemoPlayerProps> = ({
  level,
  avatarId,
  onProceedToChallenge,
  onBackToLesson,
}) => {
  const { demoScenario } = level;

  // Memoize level configuration for demo
  const demoLevelConfig: LevelConfig = React.useMemo(() => ({
    ...level,
    gridSize: demoScenario.gridSize,
    startPos: demoScenario.startPos,
    startDir: demoScenario.startDir,
    goalPos: demoScenario.goalPos,
    grid: demoScenario.grid,
    collectibles: demoScenario.collectibles,
  }), [level, demoScenario]);

  // Helper metadata balok visual untuk demo
  const getBlockInfo = (codeLine: string) => {
    if (codeLine.includes('moveForward')) {
      return { label: 'Maju 1 Langkah', code: 'moveForward();', icon: <ArrowRight size={18} />, className: 'block-forward' };
    }
    if (codeLine.includes('turnRight')) {
      return { label: 'Belok Kanan', code: 'turnRight();', icon: <RotateCw size={18} />, className: 'block-turn-right' };
    }
    if (codeLine.includes('turnLeft')) {
      return { label: 'Belok Kiri', icon: <RotateCcw size={18} />, code: 'turnLeft();', className: 'block-turn-left' };
    }
    if (codeLine.includes('repeat')) {
      return { label: 'Ulangi (Loop)', icon: <Repeat size={18} />, code: codeLine, className: 'block-repeat' };
    }
    return { label: 'Jalankan Aksi', icon: <ArrowRight size={18} />, code: codeLine, className: 'block-forward' };
  };

  // Precompute the entire simulation path from demoScenario.executableCode
  const precomputedResult = React.useMemo(() => {
    return executeJavaScriptSafely(demoScenario.executableCode, demoLevelConfig);
  }, [demoScenario.executableCode, demoLevelConfig]);

  // Map each code step 1-to-1 with its resulting physical movement and block metadata
  const mappedSteps = React.useMemo(() => {
    // Collect non-idle steps
    const physicalSteps = precomputedResult.steps.filter(s => s.status !== 'IDLE');
    return demoScenario.codeSteps.map((stepMeta, index) => {
      // Corresponding physical step in simulation
      const physicalState = physicalSteps[index] || physicalSteps[physicalSteps.length - 1] || {
        playerPos: demoScenario.startPos,
        playerDir: demoScenario.startDir,
        collectedItems: [],
        status: 'RUNNING',
      };
      return {
        ...stepMeta,
        blockInfo: getBlockInfo(stepMeta.codeLine),
        targetPos: physicalState.playerPos,
        targetDir: physicalState.playerDir,
        collectedItems: physicalState.collectedItems,
        status: physicalState.status,
      };
    });
  }, [demoScenario, precomputedResult]);

  // State tampilan penulisan kode & progres langkah
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Posisi & Jejak Langkah Karakter (Single Source of Truth)
  const [demoPlayerPos, setDemoPlayerPos] = useState<{ x: number; y: number }>(demoScenario.startPos);
  const [demoPlayerDir, setDemoPlayerDir] = useState<Direction>(demoScenario.startDir);
  const [demoCollectedItems, setDemoCollectedItems] = useState<{ x: number; y: number }[]>([]);
  const [trailSteps, setTrailSteps] = useState<{ x: number; y: number }[]>([demoScenario.startPos]);
  const [demoStatusMessage, setDemoStatusMessage] = useState<string>('Memulai demo interaktif...');
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [isCrashed, setIsCrashed] = useState<boolean>(false);

  // Timer reference untuk pembatalan aman
  const timerRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  // Jalankan siklus demo animasi berurutan (sama seperti mesin GameplayScreen)
  const startDemoPlayback = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Reset posisi awal
    setDemoPlayerPos(demoScenario.startPos);
    setDemoPlayerDir(demoScenario.startDir);
    setDemoCollectedItems([]);
    setTrailSteps([demoScenario.startPos]);
    setTypedLines([]);
    setDemoLogs([]);
    setCurrentStepIndex(0);
    setIsFinished(false);
    setIsCrashed(false);
    setIsPlaying(true);
    setDemoStatusMessage('Robot bersiap memulai demo langkah...');

    let stepIdx = 0;
    const playNextStep = () => {
      if (!isPlayingRef.current) {
        return;
      }

      if (stepIdx >= mappedSteps.length) {
        setIsFinished(true);
        setDemoStatusMessage(demoScenario.resultExplanation);
        sounds.playCollect();
        return;
      }

      const step = mappedSteps[stepIdx];

      // Update posisi fisik, arah, jejak langkah, dan editor
      setDemoPlayerPos(step.targetPos);
      setDemoPlayerDir(step.targetDir);
      setDemoCollectedItems(step.collectedItems || []);
      setTrailSteps(prev => [...prev, step.targetPos]);
      setTypedLines(prev => [...prev, step.codeLine]);
      setDemoStatusMessage(`${step.codeLine} ➔ ${step.explanation}`);
      setDemoLogs(prev => [...prev, `[Eksekusi Langkah ${stepIdx + 1}]: ${step.codeLine} (${step.explanation})`]);
      setCurrentStepIndex(stepIdx + 1);

      if (step.status === 'CRASHED' || step.status === 'OUT_OF_BOUNDS') {
        sounds.playBump();
        setIsCrashed(true);
      } else if (step.status === 'SUCCESS' || (step.collectedItems && step.collectedItems.length > 0)) {
        sounds.playCollect();
      } else {
        sounds.playStep();
      }

      stepIdx++;
      timerRef.current = window.setTimeout(playNextStep, 950);
    };

    // Mulai langkah pertama setelah jeda awal 500ms
    timerRef.current = window.setTimeout(playNextStep, 500);
  };

  // Inisialisasi awal saat komponen dimuat atau level berganti
  useEffect(() => {
    startDemoPlayback();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [level.id, mappedSteps]);

  // Kontrol: Ulangi Demo dari Awal
  const handleResetDemo = () => {
    sounds.playClick();
    startDemoPlayback();
  };

  // Kontrol: Jeda / Putar
  const handleTogglePlay = () => {
    sounds.playClick();
    if (isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
      setDemoStatusMessage('Demo dijeda.');
    } else {
      setIsPlaying(true);
      // Lanjutkan langkah dari currentStepIndex
      let stepIdx = currentStepIndex;
      const playNextStep = () => {
        if (stepIdx >= mappedSteps.length) {
          setIsFinished(true);
          setDemoStatusMessage(demoScenario.resultExplanation);
          sounds.playCollect();
          return;
        }

        const step = mappedSteps[stepIdx];
        setDemoPlayerPos(step.targetPos);
        setDemoPlayerDir(step.targetDir);
        setDemoCollectedItems(step.collectedItems || []);
        setTrailSteps(prev => [...prev, step.targetPos]);
        setTypedLines(prev => [...prev, step.codeLine]);
        setDemoStatusMessage(`${step.codeLine} ➔ ${step.explanation}`);
        setDemoLogs(prev => [...prev, `[Eksekusi Langkah ${stepIdx + 1}]: ${step.codeLine} (${step.explanation})`]);
        setCurrentStepIndex(stepIdx + 1);

        if (step.status === 'CRASHED' || step.status === 'OUT_OF_BOUNDS') {
          sounds.playBump();
          setIsCrashed(true);
        } else if (step.status === 'SUCCESS' || (step.collectedItems && step.collectedItems.length > 0)) {
          sounds.playCollect();
        } else {
          sounds.playStep();
        }

        stepIdx++;
        timerRef.current = window.setTimeout(playNextStep, 950);
      };
      timerRef.current = window.setTimeout(playNextStep, 300);
    }
  };

  // Kontrol: Langsung Selesai (Skip)
  const handleSkipDemo = () => {
    sounds.playClick();
    if (timerRef.current) clearTimeout(timerRef.current);

    const finalStep = mappedSteps[mappedSteps.length - 1];
    setTypedLines(demoScenario.codeSteps.map(s => s.codeLine));
    setCurrentStepIndex(mappedSteps.length);
    setIsFinished(true);

    if (finalStep) {
      setDemoPlayerPos(finalStep.targetPos);
      setDemoPlayerDir(finalStep.targetDir);
      setDemoCollectedItems(finalStep.collectedItems || []);
      setTrailSteps([demoScenario.startPos, ...mappedSteps.map(s => s.targetPos)]);
    }
    setDemoStatusMessage(demoScenario.resultExplanation);
    setDemoLogs(demoScenario.codeSteps.map((s, i) => `[Eksekusi Baris ${i + 1}]: ${s.codeLine} (${s.explanation})`));
  };

  const activeStep = demoScenario.codeSteps[Math.min(Math.max(0, currentStepIndex - 1), demoScenario.codeSteps.length - 1)];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      maxWidth: '1000px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* HEADER NAVIGASI & KONTROL STEPPER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <button
          className="btn-chunky btn-white btn-sm"
          onClick={() => { sounds.playClick(); onBackToLesson(); }}
        >
          <ArrowLeft size={18} /> Kembali ke Materi
        </button>

        {/* STEPPER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: '16px',
          border: '2px solid #E2E8F0',
          boxShadow: '0 2px 0 #CBD5E1',
          fontSize: '0.78rem',
          fontWeight: 800,
        }}>
          <span style={{ color: '#059669' }}>1. BACA ✓</span>
          <span style={{ color: '#94A3B8' }}>➔</span>
          <span style={{
            backgroundColor: '#FFAE00',
            color: '#FFFFFF',
            padding: '3px 8px',
            borderRadius: '10px',
          }}>
            2. DEMO
          </span>
          <span style={{ color: '#94A3B8' }}>➔</span>
          <span style={{ color: '#94A3B8' }}>3. COBA</span>
        </div>

        <button
          className="btn-chunky btn-secondary btn-sm"
          onClick={() => { sounds.playClick(); onProceedToChallenge(); }}
        >
          <span>Mulai Misi!</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* BANNER STATUS AKTIF DEMO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '3px solid #E2E8F0',
        boxShadow: '0 4px 0 #E2E8F0',
      }}>
        <span style={{ fontSize: '1.6rem' }} className="animate-gentle-bounce">
          🎬
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            DEMO LEVEL {level.id}: {demoScenario.title}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-navy)' }}>
            {demoStatusMessage}
          </div>
        </div>
      </div>

      {/* AREA DEMONSTRASI: KODE DI KIRI, GAME DI KANAN */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start',
      }}>
        {/* SISI KIRI: BALOK VISUAL DEMO & JENDELA KODE JAVASCRIPT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* KARTU 1: BALOK VISUAL YANG SEDANG DIJALANKAN DEMO */}
          <div className="card-kid" style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-navy)' }}>
                🧩 Balok Demo yang Dipilih Robot:
              </h4>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isFinished ? '#059669' : '#D97706',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '8px',
              }}>
                {isFinished ? 'Demo Selesai!' : `Langkah ${currentStepIndex} / ${mappedSteps.length}`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '110px' }}>
              {mappedSteps.map((step, idx) => {
                const isExecuted = idx < currentStepIndex;
                const isCurrentlyActive = idx === currentStepIndex - 1;
                return (
                  <div
                    key={idx}
                    className={`code-block-item ${step.blockInfo.className} ${isCurrentlyActive ? 'is-active-step' : ''}`}
                    style={{
                      margin: 0,
                      padding: '10px 14px',
                      opacity: isExecuted ? 1 : 0.45,
                      transform: isCurrentlyActive ? 'scale(1.02)' : 'none',
                      transition: 'all 0.3s ease',
                      border: isCurrentlyActive ? '3px solid #FFAE00' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}>
                        {idx + 1}
                      </span>
                      {step.blockInfo.icon}
                      <span style={{ fontWeight: 800 }}>{step.blockInfo.label}</span>
                      <span style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.22)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-family-code)',
                        color: '#FEF08A',
                        marginLeft: '4px',
                      }}>
                        {step.blockInfo.code}
                      </span>
                    </div>
                    {isExecuted && <CheckCircle size={16} color="#FFFFFF" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* KARTU 2: JENDELA KODE JAVASCRIPT NYATA YANG MUNCUL DARI BALOK */}
          <div className="card-kid" style={{
            padding: '0',
            overflow: 'hidden',
            backgroundColor: '#0F172A',
            border: '3px solid #334155',
            boxShadow: '0 6px 0 #000000',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              backgroundColor: '#1E293B',
              borderBottom: '2px solid #334155',
              color: '#F8FAFC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={18} color="#00C2CB" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  💻 Kode JavaScript Nyata di Balik Balok Demo:
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#38BDF8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}>
                <Sparkles size={12} /> Otomatis Terbuat!
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              fontFamily: 'var(--font-family-code)',
              fontSize: '0.95rem',
              color: '#38BDF8',
              lineHeight: '1.7',
              minHeight: '100px',
              maxHeight: '160px',
              overflowY: 'auto',
              backgroundColor: '#0F172A',
            }}>
              {typedLines.length === 0 ? (
                <span style={{ color: '#64748B', fontStyle: 'italic' }}>
                  // Robot bersiap memilih balok dan kode akan otomatis muncul di sini...
                </span>
              ) : (
                typedLines.map((line, idx) => {
                  const isCurrentLine = idx === typedLines.length - 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isCurrentLine ? 'rgba(255, 174, 0, 0.25)' : 'transparent',
                        color: isCurrentLine ? '#FDE047' : '#38BDF8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ color: '#475569', width: '20px', textAlign: 'right', fontSize: '0.8rem', userSelect: 'none' }}>
                        {idx + 1}
                      </span>
                      <span>{line}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Penjelasan Baris Aktif */}
          {activeStep && (
            <div style={{
              backgroundColor: '#FFFBEB',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '2px solid #FDE68A',
              fontSize: '0.9rem',
              color: '#92400E',
              lineHeight: 1.5,
            }}>
              💡 <strong>Hubungan Kode & Gerakan:</strong> {activeStep.explanation}
            </div>
          )}

          {/* TOOLBAR KONTROL DEMO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <button
              className="btn-chunky btn-primary btn-sm"
              onClick={handleTogglePlay}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Jeda' : 'Lanjutkan'}</span>
            </button>

            <button
              className="btn-chunky btn-white btn-sm"
              onClick={handleResetDemo}
            >
              <RotateCcw size={16} />
              <span>Ulangi Demo</span>
            </button>

            <button
              className="btn-chunky btn-white btn-sm"
              onClick={handleSkipDemo}
            >
              <SkipForward size={16} />
              <span>Langsung Selesai</span>
            </button>
          </div>
        </div>

        {/* SISI KANAN: PANGGUNG ARENA DENGAN GERAKAN KARAKTER NYATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <GameStage
            level={demoLevelConfig}
            playerPos={demoPlayerPos}
            playerDir={demoPlayerDir}
            collectedItems={demoCollectedItems}
            avatarId={avatarId}
            isCrashed={isCrashed}
            trailSteps={trailSteps}
          />

          {/* CONSOLE OUTPUT LOG DEMO */}
          <div className="card-kid" style={{
            padding: '12px 16px',
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            borderRadius: '18px',
            border: '2px solid #334155',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#94A3B8',
              marginBottom: '6px',
            }}>
              <Terminal size={14} color="#00C2CB" />
              <span>Console Log Gerakan Nyata</span>
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontFamily: 'var(--font-family-code)',
              maxHeight: '80px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}>
              {demoLogs.length === 0 ? (
                <span style={{ color: '#64748B', fontStyle: 'italic' }}>
                  Log pergerakan robot akan muncul saat instruksi dieksekusi...
                </span>
              ) : (
                demoLogs.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={10} color="#2ECB71" />
                    <span>{l}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOMBOL LANJUT KE TAHAP 3 (COBA SENDIRI) */}
          <button
            className="btn-chunky btn-secondary btn-lg"
            onClick={() => { sounds.playClick(); onProceedToChallenge(); }}
            style={{ width: '100%', padding: '16px' }}
          >
            <span>AKU SIAP MENCOBA SENDIRI!</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

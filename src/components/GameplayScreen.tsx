import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, HelpCircle, Code, LayoutGrid, BookOpen } from 'lucide-react';
import { BlockType, CodeBlock, CurriculumStageId, Direction, LevelConfig, UserProgress } from '../types/game';
import { GameStage } from './GameStage';
import { CodeWorkshop } from './CodeWorkshop';
import { TextCodeEditor } from './TextCodeEditor';
import { Stage1LessonReader } from './Stage1LessonReader';
import { VictoryModal } from './VictoryModal';
import { BonusChallengeModal } from './BonusChallengeModal';
import { SafePathTutorialModal } from './SafePathTutorialModal';
import { WORLDS } from '../config/levels';
import { simulateCode } from '../engine/gameEngine';
import { executeJavaScriptSafely } from '../engine/jsInterpreter';
import { blocksToJavaScript, javaScriptToBlocks } from '../engine/codeConverter';
import { sounds } from '../utils/sound';

interface GameplayScreenProps {
  level: LevelConfig;
  progress: UserProgress;
  onLevelComplete: (levelId: number, starsEarned: number) => void;
  onNextLevel: () => void;
  onBackToMap: () => void;
  onSaveCodeForLevel: (levelId: number, code: string) => void;
  onMarkLessonRead: (levelId: number) => void;
  onSaveLessonQuizAnswer?: (levelId: number, answerIndex: number) => void;
  onMarkDemoCompleted: (levelId: number) => void;
  onUpdateStageHints?: (stageId: string, count: number) => void;
  hasNextLevel: boolean;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  level,
  progress,
  onLevelComplete,
  onNextLevel,
  onBackToMap,
  onSaveCodeForLevel,
  onMarkLessonRead,
  onSaveLessonQuizAnswer,
  onMarkDemoCompleted,
  onUpdateStageHints,
  hasNextLevel,
}) => {
  // ALUR 2 TAHAP: 'LESSON' (Materi Bacaan & Cerita Pengantar) -> 'CHALLENGE' (Main / Coba Sendiri)
  // Setiap kali masuk ke level baru atau berpindah card level, anak SELALU disambut pengantar materi terlebih dahulu
  const [currentStage, setCurrentStage] = useState<'LESSON' | 'CHALLENGE'>('LESSON');

  // State Layar Mobile (< 768px portrait)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mode Editor di Tantangan: 'BLOCKS' (Puzzle Interaktif + Live Code Preview) atau 'TEXT' (JavaScript)
  const [editorMode, setEditorMode] = useState<'BLOCKS' | 'TEXT'>('BLOCKS');

  // Ambil kode tersimpan anak jika ada, jika belum pernah ada maka mulai dari KOSONG agar anak menyusun sendiri
  const savedUserCode = progress.savedCodePerLevel[level.id] !== undefined 
    ? progress.savedCodePerLevel[level.id] 
    : '';
  const [jsCode, setJsCode] = useState<string>(savedUserCode);
  const [blocks, setBlocks] = useState<CodeBlock[]>(() => javaScriptToBlocks(savedUserCode));

  // State Console Log & Error Ramah Anak
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [friendlyExplanation, setFriendlyExplanation] = useState<string | null>(null);

  // State Runtime Simulasi Game Panggung
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(level.startPos);
  const [playerDir, setPlayerDir] = useState<Direction>(level.startDir);
  const [collectedItems, setCollectedItems] = useState<{ x: number; y: number }[]>([]);
  const [trailSteps, setTrailSteps] = useState<{ x: number; y: number }[]>([level.startPos]);
  const [checkedTile, setCheckedTile] = useState<{ x: number; y: number; isClear: boolean } | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCrashed, setIsCrashed] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(level.storyIntro);

  // State Modal Kemenangan & Bantuan Petunjuk Cepat
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{ stars: number; blocks: number } | null>(null);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showBonusChallengeModal, setShowBonusChallengeModal] = useState<boolean>(false);
  const [showSafePathTutorial, setShowSafePathTutorial] = useState<boolean>(false);

  // Cari Stage ID dari level ini
  const currentWorld = WORLDS.find(w => w.id === level.worldId);
  const currentStageId: CurriculumStageId = (currentWorld?.stageId as CurriculumStageId) || 'BEGINNER';

  // Kuota hint stage (maks 3 default, tidak kembali 0 saat pindah level di stage yang sama)
  const stageHintsRemaining = progress.stageHintsRemaining?.[currentStageId] !== undefined
    ? progress.stageHintsRemaining[currentStageId]
    : 3;

  const handleOpenHint = () => {
    sounds.playClick();
    if (stageHintsRemaining > 0) {
      // Kurangi kuota jika modal hint baru pertama kali dibuka di level ini
      if (onUpdateStageHints) {
        onUpdateStageHints(currentStageId, Math.max(0, stageHintsRemaining - 1));
      }
      setShowHintModal(true);
    } else {
      // Kuota habis, buka tantangan ekstra untuk mendapatkan hint!
      sounds.playBump();
      setShowBonusChallengeModal(true);
    }
  };

  const handleEarnBonusHint = () => {
    if (onUpdateStageHints) {
      onUpdateStageHints(currentStageId, stageHintsRemaining + 1);
    }
    setShowBonusChallengeModal(false);
    setShowHintModal(true);
  };

  const timerRef = useRef<number | null>(null);

  // Saat ID level berganti, atur ulang tahapan
  useEffect(() => {
    handleReset();
    const existingCode = progress.savedCodePerLevel[level.id] !== undefined
      ? progress.savedCodePerLevel[level.id]
      : '';
    setJsCode(existingCode);
    setBlocks(javaScriptToBlocks(existingCode));
    setConsoleLogs([]);
    setRuntimeError(null);
    setFriendlyExplanation(null);
    setStatusMessage(level.storyIntro);
    setShowVictoryModal(false);

    // Setiap kali berpindah level/card, selalu buka materi pengantar (LESSON) agar anak membaca konsep sebelum ngoding
    setCurrentStage('LESSON');
  }, [level.id]);

  // Simpan otomatis kode setiap kali anak mengedit kode (Auto-save)
  const handleCodeChange = (newCode: string) => {
    setJsCode(newCode);
    onSaveCodeForLevel(level.id, newCode);
  };

  // Navigasi Langsung dari Materi ke Main / Tantangan
  const handleFinishLesson = () => {
    onMarkLessonRead(level.id);
    onMarkDemoCompleted(level.id);
    setCurrentStage('CHALLENGE');
  };

  // Handler Sinkronisasi Dua Arah Saat Berpindah Mode
  const handleSwitchMode = (targetMode: 'TEXT' | 'BLOCKS') => {
    sounds.playClick();
    if (targetMode === 'TEXT') {
      const generatedCode = blocksToJavaScript(blocks);
      if (generatedCode.trim()) {
        setJsCode(generatedCode);
        onSaveCodeForLevel(level.id, generatedCode);
      }
    } else {
      const generatedBlocks = javaScriptToBlocks(jsCode);
      setBlocks(generatedBlocks);
    }
    setEditorMode(targetMode);
  };

  // Handler Reset Posisi Karakter
  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsCrashed(false);
    setPlayerPos(level.startPos);
    setPlayerDir(level.startDir);
    setCollectedItems([]);
    setTrailSteps([level.startPos]);
    setCheckedTile(null);
    setActiveBlockId(null);
    setStatusMessage('Karakter kembali ke posisi awal. Siap melangkah lagi!');
  };

  // Handler Stop Eksekusi
  const handleStopExecution = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setStatusMessage('Eksekusi program dihentikan.');
  };

  // Handler Reset Kode ke Bawaan (Kosongkan agar anak menyusun dari awal)
  const handleResetCode = () => {
    setJsCode('');
    setBlocks([]);
    onSaveCodeForLevel(level.id, '');
    setConsoleLogs([]);
    setRuntimeError(null);
    setFriendlyExplanation(null);
    handleReset();
  };

  // Handler Menambah Blok Visual
  const handleAddBlock = (type: BlockType) => {
    const newBlock: CodeBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      repeatCount: type === 'REPEAT' ? 2 : undefined,
      children: type === 'REPEAT' || type === 'IF_PATH_CLEAR' ? [] : undefined,
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    const converted = blocksToJavaScript(updated);
    setJsCode(converted);
    onSaveCodeForLevel(level.id, converted);
  };

  const handleRemoveBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    const converted = blocksToJavaScript(updated);
    setJsCode(converted);
    onSaveCodeForLevel(level.id, converted);
  };

  const handleClearBlocks = () => {
    setBlocks([]);
    setJsCode('');
    onSaveCodeForLevel(level.id, '');
    handleReset();
  };

  const handleAddChildToRepeat = (parentIndex: number, childType: BlockType) => {
    const updated = [...blocks];
    const parent = { ...updated[parentIndex] };
    const child: CodeBlock = {
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: childType,
      repeatCount: childType === 'REPEAT' ? 2 : undefined,
      children: childType === 'REPEAT' ? [] : undefined,
    };
    parent.children = [...(parent.children || []), child];
    updated[parentIndex] = parent;
    setBlocks(updated);
    const converted = blocksToJavaScript(updated);
    setJsCode(converted);
    onSaveCodeForLevel(level.id, converted);
  };

  const handleRemoveChildFromRepeat = (parentIndex: number, childIndex: number) => {
    const updated = [...blocks];
    const parent = { ...updated[parentIndex] };
    parent.children = (parent.children || []).filter((_, i) => i !== childIndex);
    updated[parentIndex] = parent;
    setBlocks(updated);
    const converted = blocksToJavaScript(updated);
    setJsCode(converted);
    onSaveCodeForLevel(level.id, converted);
  };

  const handleChangeRepeatCount = (parentIndex: number, newCount: number) => {
    const updated = [...blocks];
    updated[parentIndex] = { ...updated[parentIndex], repeatCount: newCount };
    setBlocks(updated);
    const converted = blocksToJavaScript(updated);
    setJsCode(converted);
    onSaveCodeForLevel(level.id, converted);
  };

  // Handler EKSEKUSI PROGRAM TAHAP 3 (RUN)
  const handleRunProgram = () => {
    handleReset();
    setIsRunning(true);
    setRuntimeError(null);
    setFriendlyExplanation(null);
    sounds.playClick();

    if (editorMode === 'TEXT') {
      const res = executeJavaScriptSafely(jsCode, level);
      setConsoleLogs(res.logs);

      if (!res.success) {
        setIsRunning(false);
        setRuntimeError(res.error);
        setFriendlyExplanation(res.friendlyExplanation);
        sounds.playBump();
        return;
      }

      // Filter out IDLE step jika ada langkah gerakan nyata
      const executableSteps = res.steps.length > 1 ? res.steps.slice(1) : res.steps;

      let stepIndex = 0;
      const playNextStep = () => {
        if (stepIndex >= executableSteps.length) {
          setIsRunning(false);
          if (res.finalStatus === 'SUCCESS') {
            setVictoryData({
              stars: res.starsEarned,
              blocks: res.linesUsed,
            });
            setShowVictoryModal(true);
            onLevelComplete(level.id, res.starsEarned);
          }
          return;
        }

        const step = executableSteps[stepIndex];
        setPlayerPos(step.playerPos);
        setPlayerDir(step.playerDir);
        setCollectedItems(step.collectedItems);
        setTrailSteps(prev => [...prev, step.playerPos]);
        setCheckedTile(step.checkedTile || null);
        setStatusMessage(step.message);

        if (step.status === 'CRASHED' || step.status === 'OUT_OF_BOUNDS') {
          sounds.playBump();
          setIsCrashed(true);
        } else if (step.status === 'SUCCESS') {
          sounds.playCollect();
        } else {
          sounds.playStep();
        }

        stepIndex++;
        timerRef.current = window.setTimeout(playNextStep, 500);
      };

      timerRef.current = window.setTimeout(playNextStep, 150);

    } else {
      if (blocks.length === 0) {
        setIsRunning(false);
        sounds.playBump();
        setStatusMessage('Belum ada balok kode yang disusun! Silakan tambahkan balok.');
        return;
      }

      const res = simulateCode(blocks, level);
      setConsoleLogs([
        '🚀 Menjalankan blok pemrograman visual...',
        `Total blok dieksekusi: ${res.totalBlocksUsed}`,
      ]);

      const executableSteps = res.steps.length > 1 ? res.steps.slice(1) : res.steps;

      let stepIndex = 0;
      const playNextStep = () => {
        if (stepIndex >= executableSteps.length) {
          setIsRunning(false);
          setActiveBlockId(null);
          if (res.finalStatus === 'SUCCESS') {
            setVictoryData({
              stars: res.starsEarned,
              blocks: res.totalBlocksUsed,
            });
            setShowVictoryModal(true);
            onLevelComplete(level.id, res.starsEarned);
          }
          return;
        }

        const step = executableSteps[stepIndex];
        setPlayerPos(step.playerPos);
        setPlayerDir(step.playerDir);
        setCollectedItems(step.collectedItems);
        setTrailSteps(prev => [...prev, step.playerPos]);
        setCheckedTile(step.checkedTile || null);
        setActiveBlockId(step.activeBlockId);
        setStatusMessage(step.message);

        if (step.status === 'CRASHED' || step.status === 'OUT_OF_BOUNDS') {
          sounds.playBump();
          setIsCrashed(true);
        } else if (step.status === 'SUCCESS') {
          sounds.playCollect();
        } else if (step.activeBlockId) {
          sounds.playStep();
        }

        stepIndex++;
        timerRef.current = window.setTimeout(playNextStep, 500);
      };

      timerRef.current = window.setTimeout(playNextStep, 150);
    }
  };

  // JIKA SEDANG DI TAHAP 1 — BACA DAN PAHAMI
  if (currentStage === 'LESSON') {
    return (
      <Stage1LessonReader
        level={level}
        avatarId={progress.selectedAvatarId}
        savedAnswerIndex={progress.lessonQuizAnswers?.[level.id]}
        onSaveAnswer={(ansIdx) => {
          if (onSaveLessonQuizAnswer) onSaveLessonQuizAnswer(level.id, ansIdx);
        }}
        onProceedToChallenge={handleFinishLesson}
        onBackToMap={onBackToMap}
      />
    );
  }

  // JIKA SEDANG DI TAHAP 2 — COBA SENDIRI (CHALLENGE)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1,
    }}>
      {/* HEADER: Navigasi & Tombol Buka Materi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Tombol Kembali & Info Level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-chunky btn-white btn-sm"
            onClick={() => { sounds.playClick(); onBackToMap(); }}
          >
            <ArrowLeft size={18} /> Level
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {level.worldName}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
              }}>
                TAHAP 2: COBA SENDIRI 🚀
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-navy)', lineHeight: 1.1 }}>
              Level {level.id}: {level.title}
            </h2>
          </div>
        </div>

        {/* TOMBOL BUKA KEMBALI MATERI & SWITCHER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tombol Buka Materi */}
          <button
            className="btn-chunky btn-white btn-sm"
            onClick={() => { sounds.playClick(); setCurrentStage('LESSON'); }}
            title="Buka Kembali Materi Bacaan"
          >
            <BookOpen size={16} color="#00C2CB" />
            <span>Baca Materi</span>
          </button>

          {/* Mode Switcher (JavaScript vs Balok) */}
          <div style={{
            display: 'flex',
            backgroundColor: '#E2E8F0',
            padding: '3px',
            borderRadius: '16px',
          }}>
            <button
              onClick={() => handleSwitchMode('TEXT')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '13px',
                border: 'none',
                fontFamily: 'var(--font-family-kids)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: editorMode === 'TEXT' ? '#00C2CB' : 'transparent',
                color: editorMode === 'TEXT' ? '#FFFFFF' : '#475569',
              }}
            >
              <Code size={16} /> JavaScript
            </button>
            <button
              onClick={() => handleSwitchMode('BLOCKS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '13px',
                border: 'none',
                fontFamily: 'var(--font-family-kids)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: editorMode === 'BLOCKS' ? '#00C2CB' : 'transparent',
                color: editorMode === 'BLOCKS' ? '#FFFFFF' : '#475569',
              }}
            >
              <LayoutGrid size={16} /> Balok
            </button>
          </div>

          {/* Tombol Panduan Jalur Aman khusus jika level mendukung sensor */}
          {level.allowedBlocks.includes('IF_PATH_CLEAR') && (
            <button
              className="btn-chunky btn-white btn-sm"
              onClick={() => { sounds.playClick(); setShowSafePathTutorial(true); }}
              title="Pelajari Cara Kerja Jalur Aman (ifPathAhead)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '2px solid #00C2CB',
                color: '#0891B2',
              }}
            >
              <span>🛡️ Panduan Sensor</span>
            </button>
          )}

          {/* Petunjuk / Hint Cepat dengan kuota stage */}
          <button
            className="btn-chunky btn-secondary btn-sm"
            onClick={handleOpenHint}
            title={stageHintsRemaining > 0 ? `Hint tersisa ${stageHintsRemaining}/3` : 'Kuota hint habis! Selesaikan tantangan untuk menambah hint'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: stageHintsRemaining === 0 ? '#F59E0B' : undefined,
            }}
          >
            <HelpCircle size={18} />
            <span>Hint ({stageHintsRemaining}/3) 💡</span>
          </button>
        </div>
      </div>

      {/* BANNER STATUS MISI */}
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
        <span style={{ fontSize: '1.6rem' }}>
          {isCrashed ? '⚠️' : '💬'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-slate)' }}>
            MISI TANTANGAN:
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: isCrashed ? 'var(--color-danger)' : 'var(--color-text-navy)',
          }}>
            {statusMessage}
          </div>
        </div>
      </div>

      {/* LAYOUT TAMPILAN: UNIFIED SCREEN UNTUK MOBILE & DESKTOP (Tanpa perlu bolak-balik tab!) */}
      <div style={{
        display: isMobileScreen ? 'flex' : 'grid',
        flexDirection: isMobileScreen ? 'column' : undefined,
        gridTemplateColumns: isMobileScreen ? undefined : 'minmax(320px, 420px) minmax(360px, 1fr)',
        gap: isMobileScreen ? '12px' : '18px',
        alignItems: 'start',
        width: '100%',
      }}>
        {/* SECTION 1: ARENA GAME (Selalu terlihat di atas pada layar HP) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobileScreen ? '8px' : '14px',
          width: '100%',
        }}>
          <GameStage
            level={level}
            playerPos={playerPos}
            playerDir={playerDir}
            collectedItems={collectedItems}
            avatarId={progress.selectedAvatarId}
            isCrashed={isCrashed}
            trailSteps={trailSteps}
            activeHatId={progress.activeHatId}
            activeThemeId={progress.activeThemeId}
            checkedTile={checkedTile}
            compact={isMobileScreen}
          />

          {/* Tombol Run & Reset di Arena (Akses Cepat) */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={isRunning}
              onClick={handleRunProgram}
              className="btn-chunky btn-success"
              style={{
                flex: 2,
                padding: isMobileScreen ? '10px 14px' : '14px 20px',
                fontSize: isMobileScreen ? '0.95rem' : '1.1rem',
              }}
            >
              <Play size={20} fill="#FFFFFF" />
              <span>{isRunning ? 'SEDANG JALAN...' : (editorMode === 'BLOCKS' ? 'JALANKAN BALOK! 🚀' : 'JALANKAN KODE! 🚀')}</span>
            </button>
            <button
              onClick={() => { sounds.playClick(); handleReset(); }}
              className="btn-chunky btn-danger"
              style={{
                flex: 1,
                padding: isMobileScreen ? '10px 12px' : '14px',
                fontSize: isMobileScreen ? '0.9rem' : '1rem',
              }}
            >
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: WORKSHOP KODE / EDITOR (Langsung di bawah arena, terlihat bersatu) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}>
          {editorMode === 'TEXT' ? (
            <TextCodeEditor
              code={jsCode}
              onChangeCode={handleCodeChange}
              onRunCode={handleRunProgram}
              onStopCode={handleStopExecution}
              onResetCode={handleResetCode}
              isRunning={isRunning}
              logs={consoleLogs}
              error={runtimeError}
              friendlyExplanation={friendlyExplanation}
            />
          ) : (
            <CodeWorkshop
              allowedBlocks={level.allowedBlocks}
              blocks={blocks}
              jsCode={jsCode}
              activeBlockId={activeBlockId}
              isRunning={isRunning}
              onAddBlock={handleAddBlock}
              onRemoveBlock={handleRemoveBlock}
              onClearBlocks={handleClearBlocks}
              onAddChildToRepeat={handleAddChildToRepeat}
              onRemoveChildFromRepeat={handleRemoveChildFromRepeat}
              onChangeRepeatCount={handleChangeRepeatCount}
            />
          )}
        </div>
      </div>

      {/* MODAL PETUNJUK CEPAT (HINT) */}
      {showHintModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="card-kid" style={{
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            padding: '24px',
            border: '4px solid #FDE68A',
            borderRadius: '28px',
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>
              💡
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-navy)', marginBottom: '6px' }}>
              Petunjuk Tantangan Level {level.id}
            </h3>
            <div style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#B45309',
              backgroundColor: '#FEF3C7',
              padding: '4px 12px',
              borderRadius: '12px',
              marginBottom: '14px',
              border: '1.5px solid #FCD34D',
            }}>
              Sisa Kuota Hint Stage Ini: <b>{stageHintsRemaining}/3</b>
            </div>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-slate)',
              lineHeight: 1.6,
              marginBottom: '16px',
              backgroundColor: '#FFFBEB',
              padding: '14px',
              borderRadius: '16px',
              border: '2px dashed #FCD34D',
            }}>
              {level.hint}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-chunky btn-white btn-sm"
                onClick={() => {
                  sounds.playClick();
                  setShowHintModal(false);
                  setCurrentStage('LESSON');
                }}
                style={{ flex: 1 }}
              >
                Baca Ulang Materi
              </button>
              <button
                className="btn-chunky btn-primary btn-sm"
                onClick={() => { sounds.playClick(); setShowHintModal(false); }}
                style={{ flex: 1 }}
              >
                Aku Paham!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN VISUAL JALUR AMAN (SAFE PATH TUTORIAL) */}
      {showSafePathTutorial && (
        <SafePathTutorialModal
          onClose={() => setShowSafePathTutorial(false)}
          onProceedToPlay={() => setShowSafePathTutorial(false)}
        />
      )}

      {/* MODAL BONUS TANTANGAN HINT SAAT KUOTA HABIS */}
      {showBonusChallengeModal && (
        <BonusChallengeModal
          stageId={currentStageId}
          onSuccessEarnHint={handleEarnBonusHint}
          onClose={() => setShowBonusChallengeModal(false)}
        />
      )}

      {/* MODAL KEMENANGAN LEVEL */}
      {showVictoryModal && victoryData && (
        <VictoryModal
          levelTitle={level.title}
          starsEarned={victoryData.stars}
          blocksUsed={victoryData.blocks}
          targetBlocksFor3Stars={level.maxBlocksFor3Stars}
          onNextLevel={() => {
            setShowVictoryModal(false);
            onNextLevel();
          }}
          onReplay={() => {
            setShowVictoryModal(false);
            handleReset();
          }}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
};

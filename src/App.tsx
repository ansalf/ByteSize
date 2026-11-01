import React, { useState, useEffect } from 'react';
import { UserProgress } from './types/game';
import { HeaderBar } from './components/HeaderBar';
import { HomeScreen } from './components/HomeScreen';
import { AvatarSelectScreen } from './components/AvatarSelectScreen';
import { WorldMapScreen } from './components/WorldMapScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { LEVELS } from './config/levels';
import { loadUserProgress, saveUserProgress, getActiveProfileId, setActiveProfileId } from './utils/storage';
import { sounds } from './utils/sound';

type ScreenState = 'HOME' | 'AVATAR_SELECT' | 'WORLD_MAP' | 'GAMEPLAY';

export const App: React.FC = () => {
  const [currentProfileId, setCurrentProfileId] = useState<string>(getActiveProfileId);
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress(getActiveProfileId()));
  
  // Jika pengguna baru belum mengisi nama panggilan, langsung sambut ke layar pembuatan avatar & nama
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    const loaded = loadUserProgress(getActiveProfileId());
    return (!loaded.hasCustomizedName && (!loaded.playerName || loaded.playerName === 'Petualang Cilik')) 
      ? 'AVATAR_SELECT' 
      : 'HOME';
  });
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Sinkronisasi status audio synthesizer
  useEffect(() => {
    sounds.setEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Simpan progres ke LocalStorage saat berubah
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next, currentProfileId);
      return next;
    });
  };

  // Beralih ke profil anak lain
  const handleSwitchProfile = (newProfileId: string) => {
    setActiveProfileId(newProfileId);
    setCurrentProfileId(newProfileId);
    const loaded = loadUserProgress(newProfileId);
    setProgress(loaded);
  };

  // Toggle On/Off Suara
  const handleToggleSound = () => {
    updateProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Pilih Avatar Baru
  const handleSelectAvatar = (avatarId: string, playerName: string) => {
    updateProgress((prev) => ({
      ...prev,
      selectedAvatarId: avatarId,
      playerName: playerName.trim() || 'Petualang Cilik',
      hasCustomizedName: true,
    }));
    setCurrentScreen('WORLD_MAP');
  };

  // Buka Level dari Peta
  const handleSelectLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setCurrentScreen('GAMEPLAY');
  };

  // Mengubah kuota hint tersisa per stage (maks 3 default, berkurang saat pakai hint, bertambah saat selesaikan tantangan)
  const handleUpdateStageHints = (stageId: string, count: number) => {
    updateProgress((prev) => ({
      ...prev,
      stageHintsRemaining: {
        BEGINNER: 3,
        INTERMEDIATE: 3,
        ADVANCED: 3,
        CREATOR_STUDIO: 3,
        ...(prev.stageHintsRemaining || {}),
        [stageId]: count,
      },
    }));
  };

  // Callback saat level selesai dan menang
  const handleLevelComplete = (levelId: number, starsEarned: number) => {
    updateProgress((prev) => {
      const currentStars = prev.stars[levelId] || 0;
      const newStars = Math.max(currentStars, starsEarned);
      const nextUnlocked = Math.max(prev.unlockedLevel, levelId + 1);
      const bonusCoins = starsEarned * 10;

      return {
        ...prev,
        unlockedLevel: nextUnlocked,
        stars: {
          ...prev.stars,
          [levelId]: newStars,
        },
        coins: prev.coins + bonusCoins,
      };
    });
  };

  // Menyimpan kode pengerjaan anak per level (Auto-Save)
  const handleSaveCodeForLevel = (levelId: number, code: string) => {
    updateProgress((prev) => ({
      ...prev,
      savedCodePerLevel: {
        ...prev.savedCodePerLevel,
        [levelId]: code,
      },
    }));
  };

  // Menandai materi level sudah dibaca (Tahap 1 selesai)
  const handleMarkLessonRead = (levelId: number) => {
    updateProgress((prev) => ({
      ...prev,
      lessonsRead: {
        ...prev.lessonsRead,
        [levelId]: true,
      },
    }));
  };

  // Menyimpan jawaban kuis pemahaman materi agar tidak hilang saat baca ulang
  const handleSaveLessonQuizAnswer = (levelId: number, answerIndex: number) => {
    updateProgress((prev) => ({
      ...prev,
      lessonQuizAnswers: {
        ...(prev.lessonQuizAnswers || {}),
        [levelId]: answerIndex,
      },
    }));
  };

  // Menandai demo level sudah ditonton (Tahap 2 selesai)
  const handleMarkDemoCompleted = (levelId: number) => {
    updateProgress((prev) => ({
      ...prev,
      demosCompleted: {
        ...prev.demosCompleted,
        [levelId]: true,
      },
    }));
  };

  // Pindah ke Level Berikutnya
  const handleNextLevel = () => {
    const nextId = activeLevelId + 1;
    if (nextId <= LEVELS.length) {
      setActiveLevelId(nextId);
      setCurrentScreen('GAMEPLAY');
    } else {
      setCurrentScreen('WORLD_MAP');
    }
  };

  const activeLevelConfig = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];

  return (
    <div className="app-container">
      {/* Header Bar Persisten */}
      <HeaderBar
        progress={progress}
        onToggleSound={handleToggleSound}
        onNavigateHome={() => setCurrentScreen('HOME')}
        onNavigateAvatars={() => setCurrentScreen('AVATAR_SELECT')}
        onNavigateWorldMap={() => setCurrentScreen('WORLD_MAP')}
        onOpenProfileManager={() => setShowProfileModal(true)}
        currentScreen={currentScreen}
      />

      {/* Konten Layar Berdasarkan State */}
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {currentScreen === 'HOME' && (
          <HomeScreen
            progress={progress}
            onStartAdventure={() => {
              setActiveLevelId(Math.min(progress.unlockedLevel, LEVELS.length));
              setCurrentScreen('GAMEPLAY');
            }}
            onOpenAvatarSelect={() => setCurrentScreen('AVATAR_SELECT')}
            onOpenWorldMap={() => setCurrentScreen('WORLD_MAP')}
            onUpdateProgress={updateProgress}
          />
        )}

        {currentScreen === 'AVATAR_SELECT' && (
          <AvatarSelectScreen
            progress={progress}
            onSelectAvatar={handleSelectAvatar}
            onBack={() => setCurrentScreen('HOME')}
            onUpdateProgress={updateProgress}
          />
        )}

        {currentScreen === 'WORLD_MAP' && (
          <WorldMapScreen
            progress={progress}
            onSelectLevel={handleSelectLevel}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'GAMEPLAY' && (
          <GameplayScreen
            level={activeLevelConfig}
            progress={progress}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            onBackToMap={() => setCurrentScreen('WORLD_MAP')}
            onSaveCodeForLevel={handleSaveCodeForLevel}
            onMarkLessonRead={handleMarkLessonRead}
            onSaveLessonQuizAnswer={handleSaveLessonQuizAnswer}
            onMarkDemoCompleted={handleMarkDemoCompleted}
            onUpdateStageHints={handleUpdateStageHints}
            hasNextLevel={activeLevelId < LEVELS.length}
          />
        )}
      </main>

      {/* Modal Pengelola Multi-Profil & Ekspor/Impor */}
      {showProfileModal && (
        <ProfileManagerModal
          currentProfileId={currentProfileId}
          onSwitchProfile={handleSwitchProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default App;

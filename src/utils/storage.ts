import { UserProgress } from '../types/game';

const PROFILES_KEY = 'bytesize_profiles_catalog_v2';
const ACTIVE_PROFILE_ID_KEY = 'bytesize_active_profile_id_v2';

export const DEFAULT_PROGRESS: UserProgress = {
  selectedAvatarId: 'bytey',
  playerName: '',
  hasCustomizedName: false,
  unlockedLevel: 1,
  unlockedStages: {
    BEGINNER: true,
    INTERMEDIATE: false,
    ADVANCED: false,
    CREATOR_STUDIO: false,
  },
  masteredCompetencies: [],
  stars: {},
  coins: 0,
  dailyStreak: 1,
  lastDailyQuizDate: '',
  soundEnabled: true,
  lessonsRead: {},
  demosCompleted: {},
  savedCodePerLevel: {},
};

export interface ProfileItem {
  id: string;
  name: string;
  avatarId: string;
  updatedAt: number;
}

// Mengambil ID Profil Aktif
export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_ID_KEY) || 'default_profile';
  } catch {
    return 'default_profile';
  }
}

// Menyimpan ID Profil Aktif
export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  } catch (e) {
    console.error('Failed to set active profile id:', e);
  }
}

// Mengambil daftar semua profil anak di perangkat ini
export function listProfiles(): ProfileItem[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      return [{ id: 'default_profile', name: 'Petualang Cilik', avatarId: 'bytey', updatedAt: Date.now() }];
    }
    return JSON.parse(raw);
  } catch {
    return [{ id: 'default_profile', name: 'Petualang Cilik', avatarId: 'bytey', updatedAt: Date.now() }];
  }
}

// Menyimpan daftar profil
export function saveProfileCatalog(profiles: ProfileItem[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profile catalog:', e);
  }
}

// Memuat progres profil tertentu
export function loadUserProgress(profileId: string = getActiveProfileId()): UserProgress {
  try {
    const raw = localStorage.getItem(`bytesize_progress_${profileId}`);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);

    // Buka stage secara dinamis jika anak sudah melewati level tertentu
    const unlockedLevel = parsed.unlockedLevel || 1;
    const isIntermediateUnlocked = unlockedLevel >= 13 || Boolean(parsed.unlockedStages?.INTERMEDIATE);
    const isAdvancedUnlocked = unlockedLevel >= 25 || Boolean(parsed.unlockedStages?.ADVANCED);
    const isCreatorUnlocked = unlockedLevel >= 37 || Boolean(parsed.unlockedStages?.CREATOR_STUDIO);

    // Hitung total koin yang seharusnya diperoleh dari seluruh bintang level yang telah diselesaikan
    const starsMap: Record<number, number> = parsed.stars || {};
    const totalEarnedCoinsFromStars = Object.values(starsMap).reduce((sum, s) => sum + (s * 10), 0);

    // Koin awal anak adalah total koin yang diperoleh dari bintang yang sudah diselesaikan
    // Jika ada koin tersimpan tapi lebih kecil karena terpotong aksesoris lama, kembalikan seperti semula
    const currentCoins = Math.max(parsed.coins !== undefined ? parsed.coins : 0, totalEarnedCoinsFromStars);

    // Migrasi backward-compatibility jika ada streak lama di localStorage bebas
    const legacyStreak = localStorage.getItem(`bytesize_daily_streak_${parsed.playerName}`) || 
                         localStorage.getItem('bytesize_daily_streak_Petualang Cilik');
    const legacyDate = localStorage.getItem(`bytesize_daily_date_${parsed.playerName}`) ||
                       localStorage.getItem('bytesize_daily_date_Petualang Cilik');

    const streakVal = parsed.dailyStreak !== undefined 
      ? parsed.dailyStreak 
      : (legacyStreak ? parseInt(legacyStreak, 10) : 1);
    const dateVal = parsed.lastDailyQuizDate !== undefined 
      ? parsed.lastDailyQuizDate 
      : (legacyDate || '');

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      coins: currentCoins,
      dailyStreak: streakVal,
      lastDailyQuizDate: dateVal,
      activeHatId: undefined, // Aksesori dihapus
      activeThemeId: undefined,
      unlockedStages: {
        BEGINNER: true,
        INTERMEDIATE: isIntermediateUnlocked,
        ADVANCED: isAdvancedUnlocked,
        CREATOR_STUDIO: isCreatorUnlocked,
        ...(parsed.unlockedStages || {}),
      },
      masteredCompetencies: parsed.masteredCompetencies || [],
      stars: starsMap,
      lessonsRead: parsed.lessonsRead || {},
      demosCompleted: parsed.demosCompleted || {},
      savedCodePerLevel: parsed.savedCodePerLevel || {},
    };
  } catch (e) {
    console.error('Failed to load user progress:', e);
    return { ...DEFAULT_PROGRESS };
  }
}

// Menyimpan progres profil aktif
export function saveUserProgress(progress: UserProgress, profileId: string = getActiveProfileId()): void {
  try {
    localStorage.setItem(`bytesize_progress_${profileId}`, JSON.stringify(progress));

    // Sinkronkan ke katalog profil
    const profiles = listProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profileId);
    const profileItem: ProfileItem = {
      id: profileId,
      name: progress.playerName,
      avatarId: progress.selectedAvatarId,
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = profileItem;
    } else {
      profiles.push(profileItem);
    }
    saveProfileCatalog(profiles);
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
}

// Ekspor seluruh data progres ke string JSON untuk cadangan/pindah perangkat
export function exportProgressToJSON(profileId: string = getActiveProfileId()): string {
  const data = {
    profileId,
    progress: loadUserProgress(profileId),
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
  };
  return JSON.stringify(data, null, 2);
}

// Impor data progres dari string JSON
export function importProgressFromJSON(jsonString: string): { success: boolean; message: string; newProgress?: UserProgress } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.progress) {
      return { success: false, message: 'Format data JSON tidak valid!' };
    }
    const importedProgress: UserProgress = {
      ...DEFAULT_PROGRESS,
      ...parsed.progress,
      stars: parsed.progress.stars || {},
      lessonsRead: parsed.progress.lessonsRead || {},
      demosCompleted: parsed.progress.demosCompleted || {},
      savedCodePerLevel: parsed.savedCodePerLevel || {},
    };
    const targetId = parsed.profileId || `imported_${Date.now()}`;
    setActiveProfileId(targetId);
    saveUserProgress(importedProgress, targetId);
    return { success: true, message: `Progres milik ${importedProgress.playerName} berhasil diimpor!`, newProgress: importedProgress };
  } catch (err: unknown) {
    return { success: false, message: 'Gagal mengimpor file: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

// Reset data profil aktif
export function resetUserProgress(profileId: string = getActiveProfileId()): UserProgress {
  try {
    localStorage.removeItem(`bytesize_progress_${profileId}`);
  } catch (e) {
    console.error('Failed to clear progress:', e);
  }
  return { ...DEFAULT_PROGRESS };
}

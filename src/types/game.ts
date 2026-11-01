export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export type BlockType = 
  | 'FORWARD' 
  | 'TURN_LEFT' 
  | 'TURN_RIGHT' 
  | 'REPEAT' 
  | 'IF_PATH_CLEAR' 
  | 'COLLECT';

export interface CodeBlock {
  id: string;
  type: BlockType;
  repeatCount?: number; // Untuk blok REPEAT (2x, 3x, 4x)
  children?: CodeBlock[]; // Untuk blok REPEAT atau IF (body)
}

export type TileType = 
  | 'EMPTY'        // Rerumputan / jurang / tidak bisa dilewati
  | 'PATH'         // Jalan setapak
  | 'START'        // Titik awal pemain
  | 'GOAL'         // Titik finish
  | 'OBSTACLE'     // Batu, pohon, rintangan
  | 'STAR'         // Item bintang/baterai yang bisa dikoleksi
  | 'PORTAL';      // Portal

export type LevelTrack = 'GUIDED' | 'CHALLENGE';

// TAHAP 1 — Materi Pembelajaran Menyeluruh
export interface LevelLessonMaterial {
  title: string;
  conceptName: string;
  story: string;
  conceptExplanation: string;
  missionGoal: string;
  howToWriteCode: string[];
  syntaxCodeSnippet: string;
  syntaxExplanation: string;
  thinkingQuestion: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    questionPool?: Array<{
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    }>;
  };
}

// Alias untuk kompatibilitas
export type LevelInstruction = LevelLessonMaterial;

// TAHAP 2 — Skenario Demo Otomatis
export interface DemoCodeStep {
  codeLine: string;
  explanation: string;
  highlightLineIndex: number;
}

export interface LevelDemoScenario {
  title: string;
  description: string;
  codeSteps: DemoCodeStep[];
  executableCode: string; // Kode JS yang benar-benar dieksekusi di game demo
  gridSize: { cols: number; rows: number };
  startPos: { x: number; y: number };
  startDir: Direction;
  goalPos: { x: number; y: number };
  grid: TileType[][];
  collectibles?: { x: number; y: number }[];
  resultExplanation: string;
}

// Konfigurasi Level Lengkap (Tahap 1, 2, dan 3)
export interface LevelConfig {
  id: number;
  worldId: number;
  track: LevelTrack;
  title: string;
  subtitle: string;
  worldName: string;
  storyIntro: string;
  hint: string;
  gridSize: { cols: number; rows: number };
  startPos: { x: number; y: number };
  startDir: Direction;
  goalPos: { x: number; y: number };
  grid: TileType[][];
  collectibles?: { x: number; y: number; collected?: boolean }[];
  maxBlocksFor3Stars: number;
  maxBlocksFor2Stars: number;
  allowedBlocks: BlockType[];
  concept: string;
  initialCode: string;
  lessonMaterial: LevelLessonMaterial; // Tahap 1
  demoScenario: LevelDemoScenario;       // Tahap 2
}

export type CurriculumStageId = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'CREATOR_STUDIO';

export interface CurriculumStageConfig {
  id: CurriculumStageId;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  levelRange: [number, number];
  prerequisiteStage?: CurriculumStageId;
  competencies: string[];
}

export interface WorldConfig {
  id: number;
  stageId?: CurriculumStageId; // Stage kepemilikan dunia
  name: string;
  themeColor: string;
  icon: string;
  description: string;
  levels: number[];
}

// Profil Pengguna Lokal (Multi-Profil Ramah Anak)
export interface UserProgress {
  selectedAvatarId: string;
  playerName: string;
  hasCustomizedName?: boolean;   // Menandai apakah pemain sudah mengisi username/nama panggilan sendiri
  unlockedLevel: number;
  unlockedStages?: Record<CurriculumStageId, boolean>;
  stageHintsRemaining?: Record<CurriculumStageId, number>; // Kuota hint maks 3 per stage (tidak reset antar level di stage yg sama)
  masteredCompetencies?: string[]; // Daftar ID kompetensi yang sudah dikuasai
  stars: Record<number, number>; // levelId -> stars (1..3)
  coins: number;
  dailyStreak?: number;          // Streak kuis harian anak (terikat profil permanen)
  lastDailyQuizDate?: string;    // Tanggal terakhir pengerjaan kuis (YYYY-MM-DD)
  unlockedAvatars?: string[]; // ID avatar yang sudah dibeli dengan koin
  unlockedRewards?: string[]; // ID reward/item toko yang sudah dibeli dengan koin
  activeThemeId?: string;     // Tema warna papan arena aktif
  activeHatId?: string;       // Aksesori topi avatar aktif
  soundEnabled: boolean;
  lessonsRead: Record<number, boolean>;      // levelId -> boolean
  demosCompleted: Record<number, boolean>;   // levelId -> boolean
  lessonQuizAnswers?: Record<number, number>; // levelId -> index jawaban kuis materi yang sudah dijawab
  savedCodePerLevel: Record<number, string>; // levelId -> saved js code
}

export interface AvatarOption {
  id: string;
  name: string;
  nickname: string;
  emoji: string;
  description: string;
  soundType: 
    | 'meow' | 'bark' | 'beep' | 'dino' | 'fox' | 'duck' | 'panda' 
    | 'horse' | 'lion' | 'penguin' | 'elephant' | 'tiger' | 'rabbit' 
    | 'bear' | 'monkey' | 'frog' | 'owl' | 'dragon';
  unlockedAtLevel?: number;
  price?: number; // Harga koin di toko (misal Kuda = 100 koin)
}

export type BonusChallengeType = 'DEBUGGING' | 'ORDERING' | 'CONCEPT_QUIZ';

export interface BonusChallenge {
  id: string;
  type: BonusChallengeType;
  title: string;
  description: string;
  codeSnippet?: string;
  options?: string[];
  correctOptionIndex?: number;
  // Untuk tantangan menyusun urutan instruksi (ORDERING)
  orderItems?: { id: string; text: string }[];
  correctOrder?: string[]; // Array of ids
  explanation: string;
}



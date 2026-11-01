import { CodeBlock, Direction, LevelConfig } from '../types/game';

export interface GameStepState {
  playerPos: { x: number; y: number };
  playerDir: Direction;
  collectedItems: { x: number; y: number }[];
  activeBlockId: string | null;
  status: 'IDLE' | 'RUNNING' | 'CRASHED' | 'OUT_OF_BOUNDS' | 'SUCCESS' | 'NOT_FINISHED';
  message: string;
  checkedTile?: { x: number; y: number; isClear: boolean } | null;
}

export interface SimulationResult {
  steps: GameStepState[];
  finalStatus: 'SUCCESS' | 'CRASHED' | 'OUT_OF_BOUNDS' | 'NOT_FINISHED';
  collectedCount: number;
  totalCollectibles: number;
  totalBlocksUsed: number;
  starsEarned: number;
}

// Menghitung arah baru saat berbelok 90 derajat
export function getNewDirection(current: Direction, turn: 'LEFT' | 'RIGHT'): Direction {
  const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  const currentIndex = dirs.indexOf(current);
  if (turn === 'RIGHT') {
    return dirs[(currentIndex + 1) % 4];
  } else {
    return dirs[(currentIndex + 3) % 4];
  }
}

// Menghitung delta koordinat untuk satu langkah maju
export function getForwardDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'UP': return { dx: 0, dy: -1 };
    case 'RIGHT': return { dx: 1, dy: 0 };
    case 'DOWN': return { dx: 0, dy: 1 };
    case 'LEFT': return { dx: -1, dy: 0 };
  }
}

// Mengecek apakah petak di depan aman / bisa dilewati
export function isPathAheadClear(
  pos: { x: number; y: number },
  dir: Direction,
  level: LevelConfig
): boolean {
  const { dx, dy } = getForwardDelta(dir);
  const nextX = pos.x + dx;
  const nextY = pos.y + dy;

  // Cek batas grid
  if (nextX < 0 || nextX >= level.gridSize.cols || nextY < 0 || nextY >= level.gridSize.rows) {
    return false;
  }

  const tile = level.grid[nextY][nextX];
  if (tile === 'EMPTY' || tile === 'OBSTACLE') {
    return false;
  }
  return true;
}

// Hitung total blok yang digunakan (termasuk isi loop)
export function countBlocks(blocks: CodeBlock[]): number {
  let count = 0;
  for (const b of blocks) {
    count++;
    if (b.children && b.children.length > 0) {
      count += countBlocks(b.children);
    }
  }
  return count;
}

// Mesin Simulator AST (Tanpa eval) yang aman dan mengeksekusi instruksi per langkah
export function simulateCode(
  blocks: CodeBlock[],
  level: LevelConfig
): SimulationResult {
  const steps: GameStepState[] = [];
  let playerPos = { ...level.startPos };
  let playerDir = level.startDir;
  let collectedItems: { x: number; y: number }[] = [];
  let executionTerminated = false;
  let terminationReason: 'CRASHED' | 'OUT_OF_BOUNDS' | 'SUCCESS' | 'NOT_FINISHED' = 'NOT_FINISHED';

  // Langkah awal (Initial state)
  steps.push({
    playerPos: { ...playerPos },
    playerDir,
    collectedItems: [...collectedItems],
    activeBlockId: null,
    status: 'IDLE',
    message: 'Mulai petualangan!',
  });

  // Batas iterasi maksimum untuk mencegah infinite loops anak SD
  const MAX_STEP_LIMIT = 60;
  let totalStepsExecuted = 0;

  // Eksekutor rekursif murni AST
  function executeBlockList(list: CodeBlock[]): boolean {
    for (const block of list) {
      if (executionTerminated) return false;
      if (totalStepsExecuted >= MAX_STEP_LIMIT) {
        steps.push({
          playerPos: { ...playerPos },
          playerDir,
          collectedItems: [...collectedItems],
          activeBlockId: block.id,
          status: 'NOT_FINISHED',
          message: 'Langkah terlalu banyak! Coba periksa apakah ada perulangan yang berputar tanpa henti.',
        });
        executionTerminated = true;
        terminationReason = 'NOT_FINISHED';
        return false;
      }

      if (block.type === 'FORWARD') {
        totalStepsExecuted++;
        const { dx, dy } = getForwardDelta(playerDir);
        const nextX = playerPos.x + dx;
        const nextY = playerPos.y + dy;

        // Cek batas koordinat
        if (nextX < 0 || nextX >= level.gridSize.cols || nextY < 0 || nextY >= level.gridSize.rows) {
          playerPos = { x: nextX, y: nextY };
          steps.push({
            playerPos: { ...playerPos },
            playerDir,
            collectedItems: [...collectedItems],
            activeBlockId: block.id,
            status: 'OUT_OF_BOUNDS',
            message: 'Aduh! Karaktermu melangkah keluar dari jalur peta!',
          });
          executionTerminated = true;
          terminationReason = 'OUT_OF_BOUNDS';
          return false;
        }

        const targetTile = level.grid[nextY][nextX];
        if (targetTile === 'EMPTY') {
          playerPos = { x: nextX, y: nextY };
          steps.push({
            playerPos: { ...playerPos },
            playerDir,
            collectedItems: [...collectedItems],
            activeBlockId: block.id,
            status: 'CRASHED',
            message: 'Oops! Karaktermu terperosok ke rumput liar. Yuk coba atur arahnya lagi!',
          });
          executionTerminated = true;
          terminationReason = 'CRASHED';
          return false;
        }

        if (targetTile === 'OBSTACLE') {
          playerPos = { x: nextX, y: nextY };
          steps.push({
            playerPos: { ...playerPos },
            playerDir,
            collectedItems: [...collectedItems],
            activeBlockId: block.id,
            status: 'CRASHED',
            message: 'Boing! Karaktermu menabrak rintangan batu! Yuk cari jalan lain.',
          });
          executionTerminated = true;
          terminationReason = 'CRASHED';
          return false;
        }

        // Langkah berhasil
        playerPos = { x: nextX, y: nextY };

        // Cek jika mendarat di atas bintang koleksi
        const isCollectibleHere = (level.collectibles || []).some(
          c => c.x === playerPos.x && c.y === playerPos.y
        ) || targetTile === 'STAR';

        if (isCollectibleHere) {
          const alreadyCollected = collectedItems.some(
            c => c.x === playerPos.x && c.y === playerPos.y
          );
          if (!alreadyCollected) {
            collectedItems.push({ ...playerPos });
          }
        }

        const isReachingGoal = level.goalPos.x === playerPos.x && level.goalPos.y === playerPos.y;
        let stepExplanation = 'Bagus! Jalan di depanmu aman dari rintangan. Robot berhasil melangkah 1 petak maju.';
        if (isReachingGoal) {
          stepExplanation = 'Hebat! Robot melangkah di jalur aman dan berhasil mencapai bendera finish!';
        } else if (isCollectibleHere) {
          stepExplanation = 'Hore! Jalur aman membawamu mengumpulkan bintang berkilau!';
        }

        steps.push({
          playerPos: { ...playerPos },
          playerDir,
          collectedItems: [...collectedItems],
          activeBlockId: block.id,
          status: 'RUNNING',
          message: stepExplanation,
        });

      } else if (block.type === 'TURN_LEFT') {
        totalStepsExecuted++;
        playerDir = getNewDirection(playerDir, 'LEFT');
        steps.push({
          playerPos: { ...playerPos },
          playerDir,
          collectedItems: [...collectedItems],
          activeBlockId: block.id,
          status: 'RUNNING',
          message: 'Karakter berputar ke Kiri!',
        });

      } else if (block.type === 'TURN_RIGHT') {
        totalStepsExecuted++;
        playerDir = getNewDirection(playerDir, 'RIGHT');
        steps.push({
          playerPos: { ...playerPos },
          playerDir,
          collectedItems: [...collectedItems],
          activeBlockId: block.id,
          status: 'RUNNING',
          message: 'Karakter berputar ke Kanan!',
        });

      } else if (block.type === 'REPEAT') {
        const times = block.repeatCount || 2;
        const children = block.children || [];
        for (let i = 0; i < times; i++) {
          if (executionTerminated) break;
          // Sorot blok repeat
          steps.push({
            playerPos: { ...playerPos },
            playerDir,
            collectedItems: [...collectedItems],
            activeBlockId: block.id,
            status: 'RUNNING',
            message: `Mengulang putaran ke-${i + 1} dari ${times}x...`,
          });
          executeBlockList(children);
        }

      } else if (block.type === 'IF_PATH_CLEAR') {
        const canPass = isPathAheadClear(playerPos, playerDir, level);
        const { dx, dy } = getForwardDelta(playerDir);
        const targetCoord = { x: playerPos.x + dx, y: playerPos.y + dy };

        steps.push({
          playerPos: { ...playerPos },
          playerDir,
          collectedItems: [...collectedItems],
          activeBlockId: block.id,
          status: 'RUNNING',
          checkedTile: { x: targetCoord.x, y: targetCoord.y, isClear: canPass },
          message: canPass 
            ? '🔍 Sensor: Jalan di depan AMAN (✓ Bebas rintangan)! Menjalankan instruksi di dalam...' 
            : '🔍 Sensor: Jalan di depan ADA RINTANGAN (⚠️ Bahaya/Batu)! Melompati instruksi agar tidak menabrak.',
        });

        if (canPass) {
          executeBlockList(block.children || []);
        }
      }
    }
    return true;
  }

  // Jalankan eksekusi
  if (blocks.length === 0) {
    terminationReason = 'NOT_FINISHED';
  } else {
    executeBlockList(blocks);
  }

  // Evaluasi kondisi kemenangan akhir
  const totalCollectibles = (level.collectibles?.length || 0);
  const collectedCount = collectedItems.length;
  const isAtGoal = playerPos.x === level.goalPos.x && playerPos.y === level.goalPos.y;
  const allCollectiblesGathered = collectedCount >= totalCollectibles;

  if (!executionTerminated) {
    if (isAtGoal && allCollectiblesGathered) {
      terminationReason = 'SUCCESS';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeBlockId: null,
        status: 'SUCCESS',
        message: 'Hore! Karaktermu berhasil mencapai bendera finish dengan gemilang! 🎉',
      });
    } else if (isAtGoal && !allCollectiblesGathered) {
      terminationReason = 'NOT_FINISHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeBlockId: null,
        status: 'NOT_FINISHED',
        message: 'Kamu sudah sampai di finish, tapi masih ada bintang yang tertinggal! Yuk ambil semuanya dulu!',
      });
    } else {
      terminationReason = 'NOT_FINISHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeBlockId: null,
        status: 'NOT_FINISHED',
        message: 'Karaktermu berhenti sebelum sampai di garis finish. Tambahkan beberapa langkah lagi ya!',
      });
    }
  }

  // Hitung perolehan bintang (1 sampai 3)
  const blocksUsed = countBlocks(blocks);
  let starsEarned = 0;
  if (terminationReason === 'SUCCESS') {
    if (blocksUsed <= level.maxBlocksFor3Stars) {
      starsEarned = 3;
    } else if (blocksUsed <= level.maxBlocksFor2Stars) {
      starsEarned = 2;
    } else {
      starsEarned = 1;
    }
  }

  return {
    steps,
    finalStatus: terminationReason,
    collectedCount,
    totalCollectibles,
    totalBlocksUsed: blocksUsed,
    starsEarned,
  };
}

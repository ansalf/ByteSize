import { Direction, LevelConfig } from '../types/game';
import { getForwardDelta, getNewDirection, isPathAheadClear } from './gameEngine';

export interface InterpreterStep {
  playerPos: { x: number; y: number };
  playerDir: Direction;
  collectedItems: { x: number; y: number }[];
  activeLine: number | null;
  status: 'IDLE' | 'RUNNING' | 'CRASHED' | 'OUT_OF_BOUNDS' | 'SUCCESS' | 'NOT_FINISHED';
  message: string;
  checkedTile?: { x: number; y: number; isClear: boolean } | null;
}

export interface InterpreterOutput {
  success: boolean;
  steps: InterpreterStep[];
  logs: string[];
  error: string | null;
  friendlyExplanation: string | null;
  finalStatus: 'SUCCESS' | 'CRASHED' | 'OUT_OF_BOUNDS' | 'NOT_FINISHED';
  collectedCount: number;
  totalCollectibles: number;
  starsEarned: number;
  linesUsed: number;
}

/**
 * Menganalisis error JavaScript dan menerjemahkannya ke dalam bahasa ramah anak SD
 */
export function getKidFriendlyErrorMessage(err: Error | string, code: string): { message: string; explanation: string } {
  const errStr = typeof err === 'string' ? err : err.message || '';

  if (errStr.includes('is not defined')) {
    const varName = errStr.split(' ')[0] || 'Perintah';
    return {
      message: `Ups! ${varName} belum dikenal oleh robot!`,
      explanation: `Pastikan ejaannya benar (misal: "moveRight()", "moveForward()"). Perhatikan huruf besar-kecilnya ya!`,
    };
  }

  if (errStr.includes('Unexpected token') || errStr.includes('SyntaxError')) {
    if (code.includes('(') && !code.includes(')')) {
      return {
        message: 'Tanda kurung tutup ")" belum dipasang!',
        explanation: 'Setiap tanda kurung buka "(" harus selalu ditutup dengan tanda kurung tutup ")". Contoh: moveRight()',
      };
    }
    if (code.includes('{') && !code.includes('}')) {
      return {
        message: 'Kurung kurawal "}" belum ditutup!',
        explanation: 'Setiap blok kode dengan "{" membutuhkan tanda penutup "}" di akhir baris.',
      };
    }
    return {
      message: 'Ada kesalahan penulisan sintaks koding!',
      explanation: 'Periksa kembali tanda titik koma (;), tanda kurung, atau ejaan katamu.',
    };
  }

  if (errStr.includes('Maximum call stack') || errStr.includes('infinite loop')) {
    return {
      message: 'Perulangan berputar tanpa henti!',
      explanation: 'Pastikan kondisi pada loop atau fungsi memiliki batas akhir agar robot tidak pusing!',
    };
  }

  return {
    message: 'Ada kendala pada kodemu!',
    explanation: errStr,
  };
}

/**
 * Eksekutor JavaScript Terkendali & Aman (Sandboxed Function Execution Tanpa eval bebas)
 * Mendukung API:
 * - moveForward(), turnLeft(), turnRight()
 * - moveRight(), moveDown(), moveLeft(), moveUp() (Pergerakan langsung 4 arah)
 * - repeat(count, callback), ifPathAhead(callback), console.log()
 */
export function executeJavaScriptSafely(
  code: string,
  level: LevelConfig
): InterpreterOutput {
  const steps: InterpreterStep[] = [];
  const logs: string[] = [];

  let playerPos = { ...level.startPos };
  let playerDir = level.startDir;
  let collectedItems: { x: number; y: number }[] = [];
  let isTerminated = false;
  let terminationStatus: 'SUCCESS' | 'CRASHED' | 'OUT_OF_BOUNDS' | 'NOT_FINISHED' = 'NOT_FINISHED';

  // State awal
  steps.push({
    playerPos: { ...playerPos },
    playerDir,
    collectedItems: [...collectedItems],
    activeLine: 1,
    status: 'IDLE',
    message: 'Mempersiapkan petualangan kodemu...',
  });

  let totalOperations = 0;
  const MAX_OPERATIONS = 120; // Batas aman untuk mencegah loop macet

  const checkSafety = () => {
    totalOperations++;
    if (totalOperations > MAX_OPERATIONS) {
      isTerminated = true;
      terminationStatus = 'NOT_FINISHED';
      throw new Error('infinite loop detected: Operasi kode melebihi batas 120 langkah.');
    }
  };

  // Helper melangkah ke arah delta tertentu
  const executeStep = (targetDir: Direction, actionName: string, friendlyMsg: string) => {
    checkSafety();
    if (isTerminated) return;

    playerDir = targetDir;
    const { dx, dy } = getForwardDelta(targetDir);
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    // Batas peta
    if (nextX < 0 || nextX >= level.gridSize.cols || nextY < 0 || nextY >= level.gridSize.rows) {
      playerPos = { x: nextX, y: nextY };
      isTerminated = true;
      terminationStatus = 'OUT_OF_BOUNDS';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'OUT_OF_BOUNDS',
        message: `Aduh! ${actionName} membuat karakter melangkah keluar dari batas arena!`,
      });
      return;
    }

    const targetTile = level.grid[nextY][nextX];
    if (targetTile === 'EMPTY') {
      playerPos = { x: nextX, y: nextY };
      isTerminated = true;
      terminationStatus = 'CRASHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'CRASHED',
        message: `Oops! Karakter terperosok ke rumput liar saat ${friendlyMsg.toLowerCase()}!`,
      });
      return;
    }

    if (targetTile === 'OBSTACLE') {
      playerPos = { x: nextX, y: nextY };
      isTerminated = true;
      terminationStatus = 'CRASHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'CRASHED',
        message: `Boing! Karakter menabrak rintangan batu saat ${friendlyMsg.toLowerCase()}!`,
      });
      return;
    }

    // Melangkah sukses
    playerPos = { x: nextX, y: nextY };

    // Cek bintang koleksi
    const isCollectible = (level.collectibles || []).some(c => c.x === playerPos.x && c.y === playerPos.y) || targetTile === 'STAR';
    if (isCollectible && !collectedItems.some(c => c.x === playerPos.x && c.y === playerPos.y)) {
      collectedItems.push({ ...playerPos });
      logs.push(`⭐ Karakter mengoleksi bintang di kotak (${playerPos.x}, ${playerPos.y})!`);
    }

    const isReachingGoal = level.goalPos.x === playerPos.x && level.goalPos.y === playerPos.y;
    let educationalMessage = `${actionName}: Bagus! Jalur di depanmu aman. Karakter melangkah maju 1 petak.`;
    if (isReachingGoal) {
      educationalMessage = `${actionName}: Hebat! Jalur ini aman dan membawa karakter tepat mencapai bendera finish!`;
    } else if (isCollectible) {
      educationalMessage = `${actionName}: Asyik! Melewati jalur aman dan berhasil mengambil bintang emas!`;
    }

    steps.push({
      playerPos: { ...playerPos },
      playerDir,
      collectedItems: [...collectedItems],
      activeLine: null,
      status: 'RUNNING',
      message: educationalMessage,
    });
  };

  // API PERGERAKAN ARAH
  const moveRight = () => executeStep('RIGHT', 'moveRight()', 'Karakter bergerak satu langkah ke kanan.');
  const moveDown = () => executeStep('DOWN', 'moveDown()', 'Karakter bergerak satu langkah ke bawah.');
  const moveLeft = () => executeStep('LEFT', 'moveLeft()', 'Karakter bergerak satu langkah ke kiri.');
  const moveUp = () => executeStep('UP', 'moveUp()', 'Karakter bergerak satu langkah ke atas.');

  // API RELATIF (moveForward, turnLeft, turnRight)
  const moveForward = () => {
    executeStep(playerDir, 'moveForward()', 'Karakter bergerak satu langkah ke depan.');
  };

  const turnLeft = () => {
    checkSafety();
    if (isTerminated) return;
    playerDir = getNewDirection(playerDir, 'LEFT');
    steps.push({
      playerPos: { ...playerPos },
      playerDir,
      collectedItems: [...collectedItems],
      activeLine: null,
      status: 'RUNNING',
      message: 'turnLeft(): Karakter berputar 90° ke kiri.',
    });
  };

  const turnRight = () => {
    checkSafety();
    if (isTerminated) return;
    playerDir = getNewDirection(playerDir, 'RIGHT');
    steps.push({
      playerPos: { ...playerPos },
      playerDir,
      collectedItems: [...collectedItems],
      activeLine: null,
      status: 'RUNNING',
      message: 'turnRight(): Karakter berputar 90° ke kanan.',
    });
  };

  const repeat = (count: number, callback: () => void) => {
    checkSafety();
    if (isTerminated) return;
    const safeCount = Math.min(Math.max(1, count || 1), 20);
    logs.push(`🌀 Memulai perulangan repeat(${safeCount}x)...`);
    for (let i = 0; i < safeCount; i++) {
      if (isTerminated) break;
      callback();
    }
  };

  const ifPathAhead = (callback: () => void) => {
    checkSafety();
    if (isTerminated) return;
    const canPass = isPathAheadClear(playerPos, playerDir, level);
    const { dx, dy } = getForwardDelta(playerDir);
    const targetCoord = { x: playerPos.x + dx, y: playerPos.y + dy };

    steps.push({
      playerPos: { ...playerPos },
      playerDir,
      collectedItems: [...collectedItems],
      activeLine: null,
      status: 'RUNNING',
      checkedTile: { x: targetCoord.x, y: targetCoord.y, isClear: canPass },
      message: canPass
        ? '🔍 ifPathAhead(): Jalan di depan AMAN (✓ Bebas rintangan)! Menjalankan instruksi di dalam...'
        : '🔍 ifPathAhead(): Jalan di depan ADA RINTANGAN (⚠️ Bahaya/Batu)! Melompati instruksi agar tidak menabrak.',
    });

    if (canPass) {
      logs.push('✅ ifPathAhead: Jalan di depan aman! Menjalankan instruksi...');
      callback();
    } else {
      logs.push('⛔ ifPathAhead: Jalan di depan ada rintangan! Melewati instruksi.');
    }
  };

  const customLog = (...args: unknown[]) => {
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    logs.push(`[Console]: ${formatted}`);
  };

  // Sandboxed Function Constructor
  try {
    const sandboxScope = {
      moveRight,
      moveDown,
      moveLeft,
      moveUp,
      moveForward,
      turnLeft,
      turnRight,
      repeat,
      ifPathAhead,
      console: { log: customLog, warn: customLog, error: customLog },
      window: undefined,
      document: undefined,
      fetch: undefined,
      localStorage: undefined,
      eval: undefined,
      Function: undefined,
    };

    const paramNames = Object.keys(sandboxScope);
    const paramValues = Object.values(sandboxScope);

    const runner = new Function(...paramNames, `"use strict";\n${code}`);
    runner(...paramValues);

  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const friendly = getKidFriendlyErrorMessage(errorObj, code);
    return {
      success: false,
      steps,
      logs,
      error: errorObj.message,
      friendlyExplanation: `${friendly.message} — ${friendly.explanation}`,
      finalStatus: 'NOT_FINISHED',
      collectedCount: collectedItems.length,
      totalCollectibles: level.collectibles?.length || 0,
      starsEarned: 0,
      linesUsed: code.split('\n').filter(l => l.trim()).length,
    };
  }

  // Evaluasi kemenangan akhir
  const totalCollectibles = (level.collectibles?.length || 0);
  const collectedCount = collectedItems.length;
  const isAtGoal = playerPos.x === level.goalPos.x && playerPos.y === level.goalPos.y;
  const allCollectiblesGathered = collectedCount >= totalCollectibles;

  if (!isTerminated) {
    if (isAtGoal && allCollectiblesGathered) {
      terminationStatus = 'SUCCESS';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'SUCCESS',
        message: 'Hore! Program kodemu sukses mengantar robot ke bendera finish! 🎉',
      });
      logs.push('🎉 Level Selesai! Selamat!');
    } else if (isAtGoal && !allCollectiblesGathered) {
      terminationStatus = 'NOT_FINISHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'NOT_FINISHED',
        message: 'Robot sudah di bendera, tapi belum semua bintang diambil!',
      });
      logs.push('⚠️ Masih ada bintang yang tertinggal!');
    } else {
      terminationStatus = 'NOT_FINISHED';
      steps.push({
        playerPos: { ...playerPos },
        playerDir,
        collectedItems: [...collectedItems],
        activeLine: null,
        status: 'NOT_FINISHED',
        message: 'Robot berhenti sebelum sampai di garis bendera finish.',
      });
      logs.push('ℹ️ Robot belum mencapai tujuan finish.');
    }
  }

  const codeLines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//')).length;
  let starsEarned = 0;
  if (terminationStatus === 'SUCCESS') {
    if (codeLines <= level.maxBlocksFor3Stars + 2) {
      starsEarned = 3;
    } else if (codeLines <= level.maxBlocksFor2Stars + 3) {
      starsEarned = 2;
    } else {
      starsEarned = 1;
    }
  }

  return {
    success: true,
    steps,
    logs,
    error: null,
    friendlyExplanation: null,
    finalStatus: terminationStatus,
    collectedCount,
    totalCollectibles,
    starsEarned,
    linesUsed: codeLines,
  };
}

import React, { useState } from 'react';
import { ArrowLeft, Play, Check, Share2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TileType, Direction, LevelConfig, BlockType, CodeBlock } from '../types/game';
import { AVATARS } from '../config/avatars';
import { simulateCode } from '../engine/gameEngine';
import { sounds } from '../utils/sound';

interface CreatorStudioScreenProps {
  avatarId: string;
  onBackToHome: () => void;
}

type PaletteTool = 'WALL' | 'ITEM' | 'GOAL' | 'START' | 'EMPTY';

export const CreatorStudioScreen: React.FC<CreatorStudioScreenProps> = ({
  avatarId,
  onBackToHome,
}) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const cols = 6;
  const rows = 6;

  // Grid Builder State
  const [grid, setGrid] = useState<TileType[][]>(() => {
    return Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 'PATH' as TileType));
  });

  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [goalPos, setGoalPos] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [collectibles, setCollectibles] = useState<{ x: number; y: number }[]>([
    { x: 2, y: 2 },
    { x: 4, y: 3 },
  ]);

  // Selected tool
  const [selectedTool, setSelectedTool] = useState<PaletteTool>('WALL');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Playtest state
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [testPlayerPos, setTestPlayerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [testPlayerDir, setTestPlayerDir] = useState<Direction>('RIGHT');
  const [testStatus, setTestStatus] = useState<string>('Susun blok perintah di samping kanan lalu klik Uji Level!');
  const [isTestSuccess, setIsTestSuccess] = useState<boolean>(false);

  // Mengedit petak grid
  const handleCellClick = (x: number, y: number) => {
    sounds.playClick();

    if (selectedTool === 'START') {
      if (x === goalPos.x && y === goalPos.y) return;
      setStartPos({ x, y });
      setTestPlayerPos({ x, y });
      setCollectibles(prev => prev.filter(c => !(c.x === x && c.y === y)));
      const nextGrid = grid.map((r, ry) => r.map((c, cx) => (cx === x && ry === y ? 'PATH' : c)));
      setGrid(nextGrid as TileType[][]);
      return;
    }

    if (selectedTool === 'GOAL') {
      if (x === startPos.x && y === startPos.y) return;
      setGoalPos({ x, y });
      setCollectibles(prev => prev.filter(c => !(c.x === x && c.y === y)));
      const nextGrid = grid.map((r, ry) => r.map((c, cx) => (cx === x && ry === y ? 'PATH' : c)));
      setGrid(nextGrid as TileType[][]);
      return;
    }

    if (selectedTool === 'ITEM') {
      if ((x === startPos.x && y === startPos.y) || (x === goalPos.x && y === goalPos.y)) return;
      const exists = collectibles.some(c => c.x === x && c.y === y);
      if (exists) {
        setCollectibles(prev => prev.filter(c => !(c.x === x && c.y === y)));
      } else {
        setCollectibles(prev => [...prev, { x, y }]);
      }
      return;
    }

    if (selectedTool === 'WALL') {
      if ((x === startPos.x && y === startPos.y) || (x === goalPos.x && y === goalPos.y)) return;
      setCollectibles(prev => prev.filter(c => !(c.x === x && c.y === y)));
      const nextGrid = grid.map((r, ry) =>
        r.map((cell, cx) => (cx === x && ry === y ? (cell === 'OBSTACLE' ? 'PATH' : 'OBSTACLE') : cell))
      );
      setGrid(nextGrid as TileType[][]);
      return;
    }

    if (selectedTool === 'EMPTY') {
      setCollectibles(prev => prev.filter(c => !(c.x === x && c.y === y)));
      const nextGrid = grid.map((r, ry) =>
        r.map((cell, cx) => (cx === x && ry === y ? 'PATH' : cell))
      );
      setGrid(nextGrid as TileType[][]);
    }
  };

  // Bersihkan arena
  const handleResetGrid = () => {
    sounds.playBump();
    setGrid(Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 'PATH' as TileType)));
    setCollectibles([]);
    setStartPos({ x: 0, y: 0 });
    setGoalPos({ x: 5, y: 5 });
    setTestPlayerPos({ x: 0, y: 0 });
    setTestPlayerDir('RIGHT');
    setBlocks([]);
  };

  // Blok handler sederhana
  const handleAddBlock = (type: BlockType) => {
    sounds.playClick();
    const newBlock: CodeBlock = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlock = (index: number) => {
    sounds.playBump();
    setBlocks(prev => prev.filter((_, idx) => idx !== index));
  };

  // Ekspor level menjadi kode teks rahasia
  const handleExportLevel = () => {
    sounds.playCollect();
    const levelData = {
      s: [startPos.x, startPos.y],
      g: [goalPos.x, goalPos.y],
      c: collectibles.map(item => [item.x, item.y]),
      w: grid.flatMap((row, y) => row.map((cell, x) => (cell === 'OBSTACLE' ? [x, y] : null)).filter(Boolean)),
    };
    const codeString = 'BYTE-' + btoa(JSON.stringify(levelData));
    navigator.clipboard.writeText(codeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Jalankan playtest menggunakan simulateCode resmi
  const handleRunPlaytest = async () => {
    sounds.playClick();
    setIsTestSuccess(false);
    setTestPlayerPos(startPos);
    setTestPlayerDir('RIGHT');

    const mockLevel: LevelConfig = {
      id: 999,
      worldId: 1,
      track: 'GUIDED',
      title: 'Level Buatanku',
      subtitle: 'Tantangan Khusus',
      worldName: 'Creator Studio',
      storyIntro: 'Coba taklukkan level buatanmu sendiri!',
      hint: 'Perhatikan jalur dan kumpulkan semua bintang!',
      gridSize: { cols, rows },
      startPos,
      startDir: 'RIGHT',
      goalPos,
      grid,
      collectibles: collectibles.map(c => ({ ...c, collected: false })),
      maxBlocksFor3Stars: 10,
      maxBlocksFor2Stars: 15,
      allowedBlocks: ['FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'COLLECT', 'REPEAT'],
      concept: 'Creator Studio',
      initialCode: '',
      lessonMaterial: {} as any,
      demoScenario: {} as any,
    };

    const simResult = simulateCode(blocks, mockLevel);

    for (let i = 0; i < simResult.steps.length; i++) {
      const step = simResult.steps[i];
      await new Promise(res => setTimeout(res, 260));
      setTestPlayerPos(step.playerPos);
      setTestPlayerDir(step.playerDir);

      if (step.status === 'RUNNING') sounds.playStep();
      if (step.status === 'CRASHED' || step.status === 'OUT_OF_BOUNDS') sounds.playBump();
    }

    if (simResult.finalStatus === 'SUCCESS') {
      sounds.playVictory();
      setIsTestSuccess(true);
      setTestStatus('🎉 HEBAT! Level buatanmu berhasil dituntaskan dengan sempurna!');
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } else {
      sounds.playBump();
      setTestStatus('Robot belum sampai di garis finish atau menabrak rintangan! Periksa balok kodemu.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '1080px',
      margin: '0 auto',
      width: '100%',
      padding: '12px 6px',
    }}>
      {/* HEADER CREATOR STUDIO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '24px',
        border: '3px solid #BAE6FD',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => { sounds.playClick(); onBackToHome(); }}
            className="btn-chunky btn-white btn-sm"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🎨</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
                Creator Studio: Bikin Level Koding!
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, margin: '2px 0 0 0' }}>
              Rancang arena teka-teki kodingmu sendiri lalu uji langsung bersama partner {avatar.name}!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExportLevel}
            className="btn-chunky btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedCode ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copiedCode ? 'Kode Tersalin!' : 'Salin Kode Level'}</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE AREA: ARENA BUILDER & PALETTE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '20px',
      }}>
        {/* KOLOM KIRI: ARENA GRID BUILDER */}
        <div className="card-kid" style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '26px',
          border: '3.5px solid #FDE68A',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}>
          {/* PALET ALAT DESAIN */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            width: '100%',
            padding: '10px',
            backgroundColor: '#FFFBEB',
            borderRadius: '18px',
            border: '2px solid #FEF08A',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#B45309', marginRight: '4px' }}>
              PILIH ALAT:
            </span>
            {[
              { id: 'WALL', label: 'Batu 🪨', color: '#94A3B8' },
              { id: 'ITEM', label: 'Bintang ⭐', color: '#F59E0B' },
              { id: 'START', label: 'Start 🚀', color: '#00C2CB' },
              { id: 'GOAL', label: 'Finish 🏁', color: '#22C55E' },
              { id: 'EMPTY', label: 'Jalan 🟩', color: '#10B981' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => { sounds.playClick(); setSelectedTool(tool.id as PaletteTool); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '12px',
                  backgroundColor: selectedTool === tool.id ? tool.color : '#FFFFFF',
                  color: selectedTool === tool.id ? '#FFFFFF' : '#334155',
                  border: selectedTool === tool.id ? `2px solid ${tool.color}` : '2px solid #CBD5E1',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: selectedTool === tool.id ? '0 3px 0 rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* GRID INTERAKTIF EDITABLE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 54px)`,
            gridTemplateRows: `repeat(${rows}, 54px)`,
            gap: '6px',
            backgroundColor: '#0F172A',
            padding: '12px',
            borderRadius: '22px',
            boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
          }}>
            {Array.from({ length: rows }).map((_, y) =>
              Array.from({ length: cols }).map((_, x) => {
                const isPlayerHere = testPlayerPos.x === x && testPlayerPos.y === y;
                const isGoal = goalPos.x === x && goalPos.y === y;
                const isItem = collectibles.some(c => c.x === x && c.y === y);
                const isWall = grid[y][x] === 'OBSTACLE';

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      backgroundColor: isWall ? '#334155' : '#1E293B',
                      border: isPlayerHere ? '2.5px solid #00C2CB' : isGoal ? '2.5px solid #22C55E' : '1.5px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative',
                    }}
                  >
                    {isWall ? '🪨' : isPlayerHere ? (
                      <span style={{
                        display: 'inline-block',
                        transform: testPlayerDir === 'UP' ? 'rotate(-90deg)' : testPlayerDir === 'DOWN' ? 'rotate(90deg)' : testPlayerDir === 'LEFT' ? 'scaleX(-1)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}>
                        {avatar.emoji}
                      </span>
                    ) : isGoal ? '🏁' : isItem ? '⭐' : ''}
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={handleResetGrid}
            className="btn-chunky btn-white btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Bersihkan Arena
          </button>
        </div>

        {/* KOLOM KANAN: WORKSHOP KODE & PLAYTEST */}
        <div className="card-kid" style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '26px',
          border: '3.5px solid #BAE6FD',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text-navy)', margin: 0 }}>
              🧪 Uji Level Buatanmu
            </h3>
            <button
              onClick={handleRunPlaytest}
              className="btn-chunky btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Play size={16} fill="#FFFFFF" />
              <span>Uji Level!</span>
            </button>
          </div>

          <div style={{
            padding: '10px 14px',
            borderRadius: '14px',
            backgroundColor: isTestSuccess ? '#DCFCE7' : '#F1F5F9',
            border: isTestSuccess ? '2px solid #86EFAC' : '2px solid #E2E8F0',
            fontSize: '0.84rem',
            fontWeight: 800,
            color: isTestSuccess ? '#15803D' : '#475569',
          }}>
            {testStatus}
          </div>

          {/* PALET BALOK PERINTAH CEPAT */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { type: 'FORWARD', label: '+ Maju', color: '#00C2CB' },
              { type: 'TURN_LEFT', label: '+ Belok Kiri', color: '#FFAE00' },
              { type: 'TURN_RIGHT', label: '+ Belok Kanan', color: '#FFAE00' },
              { type: 'COLLECT', label: '+ Ambil', color: '#2ECB71' },
            ].map(b => (
              <button
                key={b.type}
                onClick={() => handleAddBlock(b.type as BlockType)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '12px',
                  backgroundColor: b.color,
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* DAFTAR BALOK KODE TERSUSUN */}
          <div style={{
            flex: 1,
            minHeight: '220px',
            maxHeight: '340px',
            overflowY: 'auto',
            backgroundColor: '#F8FAFC',
            borderRadius: '18px',
            border: '2px dashed #CBD5E1',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {blocks.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem', margin: 'auto' }}>
                Klik tombol <b>+ Maju / Belok</b> di atas untuk menyusun perintah robotmu!
              </div>
            ) : (
              blocks.map((block, idx) => (
                <div
                  key={block.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E2E8F0',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#334155',
                  }}
                >
                  <span>{idx + 1}. {block.type === 'FORWARD' ? 'Maju 1 Langkah' : block.type === 'TURN_LEFT' ? 'Belok Kiri ↺' : block.type === 'TURN_RIGHT' ? 'Belok Kanan ↻' : 'Ambil Bintang ⭐'}</span>
                  <button
                    onClick={() => handleRemoveBlock(idx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                    }}
                    title="Hapus baris"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

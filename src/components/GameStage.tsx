import React from 'react';
import { Direction, LevelConfig } from '../types/game';
import { AVATARS } from '../config/avatars';

interface GameStageProps {
  level: LevelConfig;
  playerPos: { x: number; y: number };
  playerDir: Direction;
  collectedItems: { x: number; y: number }[];
  avatarId: string;
  isCrashed: boolean;
  trailSteps?: { x: number; y: number }[]; // Jejak langkah kotak yang telah dilalui
  activeHatId?: string;
  activeThemeId?: string;
}

export const GameStage: React.FC<GameStageProps> = ({
  level,
  playerPos,
  playerDir,
  collectedItems,
  avatarId,
  isCrashed,
  trailSteps = [],
}) => {
  const currentAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  // Rotasi sudut CSS untuk arah hadap karakter
  const getDirAngle = (dir: Direction): number => {
    switch (dir) {
      case 'RIGHT': return 0;
      case 'DOWN': return 90;
      case 'LEFT': return 180;
      case 'UP': return 270;
    }
  };

  const arenaBg = '#E0F2FE';
  const arenaBorder = '4px solid #BAE6FD';


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: arenaBg,
      borderRadius: '24px',
      border: arenaBorder,
      padding: '20px',
      minHeight: '340px',
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s ease',
    }}>


      {/* Grid Arena Wrapper dengan Touch Scroll Responsif */}
      <div 
        className="touch-scroll-x"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '4px',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${level.gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${level.gridSize.rows}, 1fr)`,
          gap: 'clamp(4px, 1.2vw, 8px)',
          maxWidth: '100%',
          margin: '0 auto',
        }}>
        {level.grid.map((row, y) =>
          row.map((tile, x) => {
            const isPlayerHere = playerPos.x === x && playerPos.y === y;
            const isCollectible = (level.collectibles || []).some(c => c.x === x && c.y === y) || tile === 'STAR';
            const isCollected = collectedItems.some(c => c.x === x && c.y === y);
            const isGoal = level.goalPos.x === x && level.goalPos.y === y;
            const isTrailed = trailSteps.some(step => step.x === x && step.y === y);

            let tileBg = '#CBD5E1';
            let tileBorder = '2px solid #94A3B8';
            let tileEmoji = '';

            if (tile === 'PATH' || tile === 'START' || tile === 'GOAL' || tile === 'STAR') {
              tileBg = isTrailed ? '#FEF9C3' : '#FEF08A'; // Ubin jejak langkah berwarna kuning lembut
              tileBorder = isTrailed ? '2px dashed #EAB308' : '2px solid #FACC15';
            } else if (tile === 'OBSTACLE') {
              tileBg = '#E2E8F0';
              tileBorder = '2px solid #94A3B8';
              tileEmoji = '🪨';
            } else if (tile === 'EMPTY') {
              tileBg = '#A7F3D0';
              tileBorder = '2px solid #6EE7B7';
              tileEmoji = '🌿';
            }

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: 'clamp(44px, 8vw, 68px)',
                  height: 'clamp(44px, 8vw, 68px)',
                  backgroundColor: tileBg,
                  border: tileBorder,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: '1.4rem',
                  boxShadow: '0 3px 0 rgba(0, 0, 0, 0.08)',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
              >
                {/* Penanda jejak titik langkah */}
                {isTrailed && !isPlayerHere && !tileEmoji && (
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>🐾</span>
                )}

                {tileEmoji && !isPlayerHere && (
                  <span style={{ opacity: 0.7, fontSize: '1.2rem' }}>{tileEmoji}</span>
                )}

                {tile === 'START' && !isPlayerHere && !isTrailed && (
                  <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>⛳</span>
                )}

                {isGoal && !isPlayerHere && (
                  <span style={{ fontSize: '1.8rem' }} className="animate-gentle-bounce">
                    🏁
                  </span>
                )}

                {isCollectible && !isCollected && !isPlayerHere && (
                  <span style={{ fontSize: '1.8rem' }} className="animate-pulse-glow">
                    ⭐
                  </span>
                )}

                {/* Karakter Pemain */}
                {isPlayerHere && (
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `rotate(${getDirAngle(playerDir)}deg) ${isCrashed ? 'scale(0.85)' : 'scale(1.05)'}`,
                      transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      zIndex: 20,
                    }}
                  >
                    <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1 }}>
                      {isCrashed ? '😵' : currentAvatar.emoji}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Bar Status Arah & Posisi */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.9rem',
        fontWeight: 700,
        backgroundColor: '#FFFFFF',
        padding: '6px 14px',
        borderRadius: '14px',
        boxShadow: '0 2px 0 #CBD5E1',
      }}>
        <span>Posisi: <strong>({playerPos.x}, {playerPos.y})</strong></span>
        <span>•</span>
        <span>Arah: <strong>{playerDir}</strong></span>
        <span>•</span>
        <span>Bintang: <strong>{collectedItems.length} / {level.collectibles?.length || 0}</strong></span>
      </div>
    </div>
  );
};

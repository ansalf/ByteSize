import React from 'react';
import { ArrowRight, RotateCcw, RotateCw, Repeat, HelpCircle, Trash2, Plus, Code2, Sparkles } from 'lucide-react';
import { BlockType, CodeBlock } from '../types/game';
import { sounds } from '../utils/sound';

interface CodeWorkshopProps {
  allowedBlocks: BlockType[];
  blocks: CodeBlock[];
  jsCode: string;
  activeBlockId: string | null;
  isRunning: boolean;
  onAddBlock: (type: BlockType) => void;
  onRemoveBlock: (index: number) => void;
  onClearBlocks: () => void;
  onAddChildToRepeat: (parentIndex: number, childType: BlockType) => void;
  onRemoveChildFromRepeat: (parentIndex: number, childIndex: number) => void;
  onChangeRepeatCount: (parentIndex: number, newCount: number) => void;
}

export const CodeWorkshop: React.FC<CodeWorkshopProps> = ({
  allowedBlocks,
  blocks,
  jsCode,
  activeBlockId,
  isRunning,
  onAddBlock,
  onRemoveBlock,
  onClearBlocks,
  onAddChildToRepeat,
  onRemoveChildFromRepeat,
  onChangeRepeatCount,
}) => {
  // Label, ikon, dan representasi kode asli JavaScript untuk setiap balok perintah
  const getBlockMeta = (type: BlockType) => {
    switch (type) {
      case 'FORWARD':
        return {
          label: 'Maju 1 Langkah',
          codeSnippet: 'moveForward();',
          explanation: 'Memajukan robot 1 petak ke arah depan',
          icon: <ArrowRight size={20} />,
          className: 'block-forward',
        };
      case 'TURN_LEFT':
        return {
          label: 'Belok Kiri',
          codeSnippet: 'turnLeft();',
          explanation: 'Memutar arah robot 90° ke kiri',
          icon: <RotateCcw size={20} />,
          className: 'block-turn-left',
        };
      case 'TURN_RIGHT':
        return {
          label: 'Belok Kanan',
          codeSnippet: 'turnRight();',
          explanation: 'Memutar arah robot 90° ke kanan',
          icon: <RotateCw size={20} />,
          className: 'block-turn-right',
        };
      case 'REPEAT':
        return {
          label: 'Ulangi (Loop)',
          codeSnippet: 'repeat(count, () => { ... });',
          explanation: 'Mengulang sekumpulan perintah beberapa kali',
          icon: <Repeat size={20} />,
          className: 'block-repeat',
        };
      case 'IF_PATH_CLEAR':
        return {
          label: 'Jika Jalan Aman',
          codeSnippet: 'ifPathAhead(() => { ... });',
          explanation: 'Hanya melangkah jika tidak ada jurang atau batu',
          icon: <HelpCircle size={20} />,
          className: 'block-if',
        };
      default:
        return {
          label: type,
          codeSnippet: `${type.toLowerCase()}();`,
          explanation: 'Menjalankan instruksi',
          icon: <ArrowRight size={20} />,
          className: 'block-forward',
        };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
    }}>
      {/* BAGIAN 1: PALETTE BLOK TERSEDIA */}
      <div className="card-kid" style={{ padding: '16px' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--color-text-navy)',
          marginBottom: '10px',
        }}>
          🧩 Sentuh Balok Perintah untuk Menambahkan:
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 135px), 1fr))',
          gap: '8px',
        }}>
          {allowedBlocks.map((type) => {
            const meta = getBlockMeta(type);
            return (
              <button
                key={type}
                disabled={isRunning}
                onClick={() => { sounds.playClick(); onAddBlock(type); }}
                className={`code-block-item ${meta.className}`}
                style={{
                  border: 'none',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {meta.icon}
                    <span style={{ fontWeight: 800 }}>{meta.label}</span>
                  </div>
                  <Plus size={16} strokeWidth={3} />
                </div>
                {/* Kode JavaScript Asli yang Muncul di Balok */}
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-family-code)',
                  color: '#FEF08A',
                  letterSpacing: '0.5px',
                }}>
                  {meta.codeSnippet}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BAGIAN 2: BAKI URUTAN KODE (WORKSPACE) */}
      <div className="card-kid" style={{
        padding: '16px',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-navy)' }}>
            📝 Urutan Kodemu ({blocks.length} Langkah):
          </h4>
          {blocks.length > 0 && !isRunning && (
            <button
              onClick={() => { sounds.playClick(); onClearBlocks(); }}
              className="btn-chunky btn-danger btn-sm"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} /> Hapus Semua
            </button>
          )}
        </div>

        {/* Jika belum ada balok koding */}
        {blocks.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px dashed #CBD5E1',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--color-text-slate)',
            gap: '8px',
          }}>
            <span style={{ fontSize: '2.5rem' }}>👆</span>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>
              Belum ada balok koding di sini!
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Sentuh balok perintah di atas untuk menyusun langkah karaktermu.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}>
            {blocks.map((block, idx) => {
              const meta = getBlockMeta(block.type);
              const isActive = activeBlockId === block.id;

              return (
                <div key={block.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Baris Balok Utama */}
                  <div
                    className={`code-block-item ${meta.className} ${isActive ? 'is-active-step' : ''}`}
                    style={{ margin: 0 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                      }}>
                        {idx + 1}
                      </span>
                      {meta.icon}
                      <span style={{ fontWeight: 800 }}>{meta.label}</span>

                      {/* Teks Kode JavaScript Asli di Balok */}
                      <span style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.22)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-family-code)',
                        color: '#FEF08A',
                        marginLeft: '4px',
                      }}>
                        {block.type === 'REPEAT' ? `repeat(${block.repeatCount || 2}x)` : meta.codeSnippet}
                      </span>

                      {/* Dropdown Jumlah Perulangan jika tipe REPEAT */}
                      {block.type === 'REPEAT' && (
                        <select
                          disabled={isRunning}
                          value={block.repeatCount || 2}
                          onChange={(e) => onChangeRepeatCount(idx, Number(e.target.value))}
                          style={{
                            marginLeft: '8px',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-family-kids)',
                            fontWeight: 700,
                            border: 'none',
                            backgroundColor: '#FFFFFF',
                            color: 'var(--color-text-navy)',
                          }}
                        >
                          <option value={2}>2 kali</option>
                          <option value={3}>3 kali</option>
                          <option value={4}>4 kali</option>
                        </select>
                      )}
                    </div>

                    {!isRunning && (
                      <button
                        onClick={() => { sounds.playClick(); onRemoveBlock(idx); }}
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          border: 'none',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                        title="Hapus Balok Ini"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Isi Kontainer Anak jika blok REPEAT atau IF */}
                  {(block.type === 'REPEAT' || block.type === 'IF_PATH_CLEAR') && (
                    <div style={{
                      marginLeft: '24px',
                      padding: '10px 12px',
                      borderLeft: '4px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '0 12px 12px 12px',
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-slate)' }}>
                        Isi di dalam {meta.label}:
                      </div>

                      {(block.children || []).map((child, childIdx) => {
                        const childMeta = getBlockMeta(child.type);
                        const isChildActive = activeBlockId === child.id;
                        return (
                          <div
                            key={child.id}
                            className={`code-block-item ${childMeta.className} ${isChildActive ? 'is-active-step' : ''}`}
                            style={{ margin: 0, padding: '6px 10px', fontSize: '0.9rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {childMeta.icon}
                              <span>{childMeta.label}</span>
                            </div>
                            {!isRunning && (
                              <button
                                onClick={() => { sounds.playClick(); onRemoveChildFromRepeat(idx, childIdx); }}
                                style={{
                                  background: 'rgba(0,0,0,0.2)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Tombol Cepat Tambah Aksi ke dalam Loop */}
                      {!isRunning && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <button
                            className="btn-chunky btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { sounds.playClick(); onAddChildToRepeat(idx, 'FORWARD'); }}
                          >
                            + Maju
                          </button>
                          <button
                            className="btn-chunky btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { sounds.playClick(); onAddChildToRepeat(idx, 'TURN_RIGHT'); }}
                          >
                            + Belok Kanan
                          </button>
                          <button
                            className="btn-chunky btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => { sounds.playClick(); onAddChildToRepeat(idx, 'TURN_LEFT'); }}
                          >
                            + Belok Kiri
                          </button>
                          {allowedBlocks.includes('REPEAT') && (
                            <button
                              className="btn-chunky btn-white btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#8854D0', border: '1px solid #8854D0' }}
                              onClick={() => { sounds.playClick(); onAddChildToRepeat(idx, 'REPEAT'); }}
                            >
                              + Ulangi (Loop Bersarang)
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BAGIAN 3: JENDELA KODE JAVASCRIPT ASLI YANG MUNCUL DARI BALOK */}
      <div className="card-kid" style={{
        padding: '0',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        border: '3px solid #334155',
        boxShadow: '0 6px 0 #000000',
      }}>
        {/* Header Jendela Kode */}
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
              💻 Kode JavaScript Nyata di Balik Balokmu:
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

        {/* Isi Kode Nyata */}
        <div style={{
          padding: '14px 16px',
          fontFamily: 'var(--font-family-code)',
          fontSize: '0.95rem',
          color: '#38BDF8',
          lineHeight: '1.7',
          maxHeight: '160px',
          overflowY: 'auto',
          backgroundColor: '#0F172A',
        }}>
          {blocks.length === 0 ? (
            <span style={{ color: '#64748B', fontStyle: 'italic' }}>
              // Sentuh balok di atas, maka baris kode JavaScript asli akan otomatis tersusun di sini!
            </span>
          ) : (
            (jsCode || '// Menyusun kode...').split('\n').map((line, lIdx) => (
              <div key={lIdx} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: '#475569', width: '20px', textAlign: 'right', fontSize: '0.8rem', userSelect: 'none' }}>
                  {lIdx + 1}
                </span>
                <span style={{ color: line.includes('repeat') || line.includes('if') ? '#FDE047' : '#38BDF8' }}>
                  {line}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

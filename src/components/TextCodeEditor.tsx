import React, { useRef, useState } from 'react';
import { Play, Square, RotateCcw, Terminal, AlertTriangle, CheckCircle, Code2, Copy } from 'lucide-react';
import { sounds } from '../utils/sound';

interface TextCodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  onRunCode: () => void;
  onStopCode: () => void;
  onResetCode: () => void;
  isRunning: boolean;
  logs: string[];
  error: string | null;
  friendlyExplanation: string | null;
}

export const TextCodeEditor: React.FC<TextCodeEditorProps> = ({
  code,
  onChangeCode,
  onRunCode,
  onStopCode,
  onResetCode,
  isRunning,
  logs,
  error,
  friendlyExplanation,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Menghitung nomor baris
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Menangani indentasi otomatis dengan tombol Tab (2 spasi)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    sounds.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
    }}>
      {/* EDITOR WORKSPACE CONTAINER */}
      <div className="card-kid" style={{
        padding: '0',
        overflow: 'hidden',
        border: '3px solid #CBD5E1',
        backgroundColor: '#1E293B', // Dark theme editor modern
        boxShadow: '0 8px 0 #94A3B8',
      }}>
        {/* Header Bar Editor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#0F172A',
          borderBottom: '2px solid #334155',
          color: '#F8FAFC',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={18} color="#00C2CB" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              JavaScript Editor (<code style={{ color: '#00C2CB' }}>main.js</code>)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="btn-chunky btn-sm"
              style={{
                backgroundColor: '#334155',
                padding: '4px 10px',
                fontSize: '0.8rem',
                color: '#E2E8F0',
                boxShadow: 'none',
              }}
            >
              <Copy size={14} />
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Input Text Area dengan Line Numbers */}
        <div style={{
          display: 'flex',
          minHeight: '260px',
          maxHeight: '380px',
          overflowY: 'auto',
          position: 'relative',
        }}>
          {/* Kolom Nomor Baris */}
          <div style={{
            padding: '12px 10px',
            backgroundColor: '#0F172A',
            color: '#64748B',
            fontFamily: 'var(--font-family-code)',
            fontSize: '0.95rem',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid #334155',
            lineHeight: '1.6',
            minWidth: '40px',
          }}>
            {lineNumbers.map(n => (
              <div key={n}>{n}</div>
            ))}
          </div>

          {/* Area Textarea Editor */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            style={{
              flex: 1,
              padding: '12px 14px',
              fontFamily: 'var(--font-family-code)',
              fontSize: '1rem',
              color: '#38BDF8', // Cyan-blue JS code color
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.6',
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
            placeholder={`// Tulis kodemu di sini:\nmoveForward();\nturnRight();`}
          />
        </div>
      </div>

      {/* TOOLBAR AKSI EKSEKUSI (RUN, STOP, RESET) */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        {!isRunning ? (
          <button
            onClick={() => { sounds.playClick(); onRunCode(); }}
            className="btn-chunky btn-success btn-lg"
            style={{ flex: 2, minWidth: '160px' }}
          >
            <Play size={22} fill="#FFFFFF" />
            <span>JALANKAN KODE (RUN)</span>
          </button>
        ) : (
          <button
            onClick={() => { sounds.playClick(); onStopCode(); }}
            className="btn-chunky btn-danger btn-lg"
            style={{ flex: 2, minWidth: '160px' }}
          >
            <Square size={22} fill="#FFFFFF" />
            <span>HENTIKAN (STOP)</span>
          </button>
        )}

        <button
          onClick={() => { sounds.playClick(); onResetCode(); }}
          className="btn-chunky btn-white"
          style={{ flex: 1, minWidth: '110px' }}
        >
          <RotateCcw size={18} />
          <span>Reset Kode</span>
        </button>
      </div>

      {/* KOTAK ERROR & PENJELASAN RAMAH ANAK */}
      {error && (
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: '#FFF1F2',
          borderRadius: '18px',
          border: '3px solid #FDA4AF',
          color: '#BE123C',
          alignItems: 'flex-start',
        }}>
          <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>
              ⚠️ Ada Bug di Baris Kodemu!
            </div>
            <div style={{ fontSize: '0.9rem', color: '#9F1239', lineHeight: 1.5 }}>
              {friendlyExplanation || error}
            </div>
          </div>
        </div>
      )}

      {/* CONSOLE OUTPUT LOGS */}
      <div className="card-kid" style={{
        padding: '14px',
        backgroundColor: '#0F172A',
        color: '#E2E8F0',
        borderRadius: '18px',
        border: '2px solid #334155',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#94A3B8',
          marginBottom: '8px',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '6px',
        }}>
          <Terminal size={16} color="#00C2CB" />
          <span>Console Output / Terminal Log</span>
        </div>

        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          fontFamily: 'var(--font-family-code)',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {logs.length === 0 ? (
            <span style={{ color: '#64748B', fontStyle: 'italic' }}>
              // Tekan tombol Jalankan untuk melihat log eksekusi kodemu...
            </span>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={12} color="#2ECB71" />
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

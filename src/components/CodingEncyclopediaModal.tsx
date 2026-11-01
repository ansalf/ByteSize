import React, { useState } from 'react';
import { X, Search, Lightbulb, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CodingEncyclopediaModalProps {
  onClose: () => void;
}

interface TermEntry {
  id: string;
  term: string;
  conceptName: string;
  emoji: string;
  color: string;
  analogyStory: string;
  kidDefinition: string;
  codeExample: string;
  funFact: string;
}

const CODING_TERMS: TermEntry[] = [
  {
    id: 'sequence',
    term: 'Sequence (Urutan Langkah)',
    conceptName: 'Dasar Pemikiran Algoritma',
    emoji: '👣',
    color: '#00C2CB',
    analogyStory: 'Sama seperti memakai sepatu: kamu harus pakai kaos kaki dulu, baru pakai sepatu. Kalau dibalik, sepatunya tidak bisa masuk!',
    kidDefinition: 'Komputer membaca perintah satu per satu dari baris paling atas sampai ke bawah secara berurutan.',
    codeExample: 'moveForward();\nturnRight();\nmoveForward();',
    funFact: 'Komputer tidak bisa menebak pikiran kita, jadi urutan perintahmu harus jelas!',
  },
  {
    id: 'loop',
    term: 'Loop (Perulangan)',
    conceptName: 'Mengulang Perintah Otomatis',
    emoji: '🌀',
    color: '#8854D0',
    analogyStory: 'Seperti mengayuh sepeda: kaki kanan kayuh, kaki kiri kayuh, diulang terus sampai tiba di sekolah tanpa harus diperintah satu-satu!',
    kidDefinition: 'Perintah agar komputer mengulang suatu gerakan beberapa kali tanpa kita perlu menulis kode yang sama berulang-ulang.',
    codeExample: 'repeat(4) {\n  moveForward();\n  turnRight();\n}',
    funFact: 'Loop menghemat tenaga programmer sehingga kode jadi rapi dan pendek!',
  },
  {
    id: 'variable',
    term: 'Variable (Wadah Penyimpan)',
    conceptName: 'Penyimpanan Nilai & Data',
    emoji: '📦',
    color: '#F59E0B',
    analogyStory: 'Seperti kotak bekal makan siang: ada label namanya, dan isinya bisa berganti-ganti, hari ini roti, besok nasi goreng!',
    kidDefinition: 'Tempat di dalam memori komputer untuk menyimpan data (seperti jumlah koin, nama pemain, atau nyawa karakter).',
    codeExample: 'let koin = 10;\nkoin = koin + 5;',
    funFact: 'Bintang dan koin yang kamu kumpulkan di ByteSize disimpan di dalam variabel lho!',
  },
  {
    id: 'condition',
    term: 'Jalur Aman & Sensor If (ifPathAhead)',
    conceptName: 'Mata Sensorik Pengambilan Keputusan',
    emoji: '🛡️',
    color: '#10B981',
    analogyStory: 'Seperti menengok kanan-kiri sebelum menyeberang jalan: kamu harus memastikan jalan aman dulu sebelum melangkah. Jika ada kendaraan atau batu besar, kamu berhenti dan mencari jalan lain!',
    kidDefinition: 'Perintah agar robot memeriksa petak di depannya. JIKA petak itu aman (bebas batu), instruksi di dalamnya dijalankan. JIKA ada batu/rintangan, instruksi di dalamnya otomatis dilewati agar robot tidak menabrak!',
    codeExample: 'ifPathAhead(() => {\n  moveForward();\n});',
    funFact: 'Sensor ifPathAhead() membuat robot punya "mata" sendiri sehingga tidak menabrak rintangan!',
  },
  {
    id: 'bug',
    term: 'Bug & Debugging',
    conceptName: 'Menemukan & Memperbaiki Error',
    emoji: '🐞',
    color: '#EF4444',
    analogyStory: 'Dulu sekali di tahun 1947, ada ngengat (serangga/bug) sungguhan yang tersangkut di mesin komputer raksasa dan bikin macet!',
    kidDefinition: '"Bug" artinya kesalahan di kode yang bikin karakter mogok. "Debugging" adalah tugas seru kita mencari dan memperbaikinya.',
    codeExample: '// Bug: harusnya turnRight, tapi ditulis turnLeft\nturnLeft(); // <- Ini yang diperbaiki!',
    funFact: 'Semua programmer hebat di dunia sering bikin bug. Yang penting jangan menyerah!',
  },
  {
    id: 'function',
    term: 'Function (Jurus Khusus)',
    conceptName: 'Kumpulan Perintah yang Diberi Nama',
    emoji: '⚡',
    color: '#EC4899',
    analogyStory: 'Seperti jurus di game: ketika kamu tekan tombol "LompatTinggi", tubuhmu otomatis menekuk lutut, mengayun tangan, dan meloncat.',
    kidDefinition: 'Satu nama tombol untuk menjalankan beberapa langkah perintah sekaligus dengan cepat.',
    codeExample: 'function lompatPagar() {\n  moveForward();\n  jump();\n}',
    funFact: 'Fungsi membuat kode koding kita seperti kumpulan mantra sihir yang kuat!',
  },
];

export const CodingEncyclopediaModal: React.FC<CodingEncyclopediaModalProps> = ({
  onClose,
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string>(CODING_TERMS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTerms = CODING_TERMS.filter(item =>
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.conceptName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeEntry = CODING_TERMS.find(t => t.id === selectedTermId) || CODING_TERMS[0];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 1150 }}>
      <div
        className="card-kid"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '92vh',
          overflow: 'hidden',
          borderRadius: '28px',
          backgroundColor: '#FFFFFF',
          border: '4px solid #38BDF8',
          boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          position: 'relative',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Tombol Tutup Pojok Kanan Atas */}
        <button
          onClick={() => { sounds.playClick(); onClose(); }}
          className="btn-chunky btn-white"
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            border: '2px solid #CBD5E1',
            boxShadow: '0 3px 0 #94A3B8',
          }}
          title="Tutup Kamus"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* HEADER KAMUS BERGAMBAR */}
        <div style={{
          background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
          padding: '16px 60px 14px 20px',
          borderBottom: '2px dashed #BAE6FD',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
          }}>
            📖
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#075985', margin: 0 }}>
              Kamus Koding Bergambar
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#0369A1', fontWeight: 700, margin: '2px 0 0 0' }}>
              Pelajari istilah koding dengan cerita & analogi seru yang mudah dipahami!
            </p>
          </div>
        </div>

        {/* AREA KONTEN (DUAL PANEL: LIST ISTILAH & KARTU PENJELASAN) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#F8FAFC',
        }}>
          {/* KOLOM KIRI: DAFTAR ISTILAH */}
          <div style={{
            borderRight: '1.5px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
          }}>
            {/* Input Pencarian Sederhana */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F1F5F9',
              padding: '6px 10px',
              borderRadius: '12px',
              marginBottom: '6px',
            }}>
              <Search size={14} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari istilah..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '0.78rem',
                  width: '100%',
                  fontWeight: 700,
                  color: '#1E293B',
                }}
              />
            </div>

            {filteredTerms.map((item) => {
              const isSelected = selectedTermId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTermId(item.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '14px',
                    backgroundColor: isSelected ? `${item.color}15` : '#FFFFFF',
                    border: isSelected ? `2px solid ${item.color}` : '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: isSelected ? item.color : '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.term.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                      {item.conceptName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* KOLOM KANAN: PENJELASAN BERGAMBAR & ANALOGI */}
          <div style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {/* Header Istilah */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px',
              borderRadius: '18px',
              backgroundColor: `${activeEntry.color}15`,
              border: `2px solid ${activeEntry.color}40`,
            }}>
              <span style={{ fontSize: '2.5rem' }}>{activeEntry.emoji}</span>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {activeEntry.term}
                </h4>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: activeEntry.color,
                  backgroundColor: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '8px',
                }}>
                  {activeEntry.conceptName}
                </span>
              </div>
            </div>

            {/* Kotak Analogi Dunia Nyata */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #FDE68A',
              borderRadius: '16px',
              padding: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 900, color: '#B45309', marginBottom: '4px' }}>
                <Lightbulb size={16} />
                <span>Analogi di Dunia Nyata:</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#78350F', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                "{activeEntry.analogyStory}"
              </p>
            </div>

            {/* Arti Bahasa Sederhana Anak */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#334155', marginBottom: '4px' }}>
                💡 Artinya dalam Koding:
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                {activeEntry.kidDefinition}
              </p>
            </div>

            {/* Contoh Kode JavaScript Asli */}
            <div style={{
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              padding: '12px 16px',
              color: '#F8FAFC',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
            }}>
              <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700, marginBottom: '6px' }}>
                CONTOH KODE JAVASCRIPT:
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#38BDF8' }}>
                {activeEntry.codeExample}
              </pre>
            </div>

            {/* Fakta Seru */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#047857',
              backgroundColor: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              padding: '10px 14px',
              borderRadius: '14px',
              fontWeight: 700,
            }}>
              <Sparkles size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span><b>Fakta Keren:</b> {activeEntry.funFact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

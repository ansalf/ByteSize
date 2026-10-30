import React, { useState } from 'react';
import { Users, Plus, Trash2, Check, Edit2, X } from 'lucide-react';
import { listProfiles, saveProfileCatalog, setActiveProfileId, loadUserProgress, saveUserProgress, ProfileItem } from '../utils/storage';
import { AVATARS } from '../config/avatars';
import { sounds } from '../utils/sound';

interface ProfileManagerModalProps {
  currentProfileId: string;
  onSwitchProfile: (newProfileId: string) => void;
  onClose: () => void;
}

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  currentProfileId,
  onSwitchProfile,
  onClose,
}) => {
  const [profiles, setProfiles] = useState<ProfileItem[]>(listProfiles);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerAvatarId, setNewPlayerAvatarId] = useState<string>('bytey');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Buat profil anak baru dengan avatar pilihan
  const handleCreateProfile = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) return;
    sounds.playClick();
    const newId = `profile_${Date.now()}`;
    const newProfile: ProfileItem = {
      id: newId,
      name: trimmedName,
      avatarId: newPlayerAvatarId,
      updatedAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfileCatalog(updated);
    
    // Inisialisasi data progres awal untuk pemain baru dengan avatar & nama yang dipilih
    try {
      localStorage.setItem(`bytesize_progress_${newId}`, JSON.stringify({
        selectedAvatarId: newPlayerAvatarId,
        playerName: trimmedName,
        unlockedLevel: 1,
        unlockedStages: { BEGINNER: true, INTERMEDIATE: false, ADVANCED: false, CREATOR_STUDIO: false },
        masteredCompetencies: [],
        stars: {},
        coins: 0,
        soundEnabled: true,
        lessonsRead: {},
        demosCompleted: {},
        savedCodePerLevel: {},
      }));
    } catch (e) {
      console.error(e);
    }

    setActiveProfileId(newId);
    setNewPlayerName('');
    setNewPlayerAvatarId('bytey');
    onSwitchProfile(newId);
    onClose();
  };

  // Mulai mode edit nama (Rename)
  const handleStartRename = (profile: ProfileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setEditingId(profile.id);
    setEditingName(profile.name);
  };

  // Simpan nama baru hasil edit (Save Rename)
  const handleSaveRename = (profileId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const trimmed = editingName.trim();
    if (!trimmed) return;
    sounds.playClick();

    // 1. Update di listProfiles catalog
    const updated = profiles.map(p => p.id === profileId ? { ...p, name: trimmed, updatedAt: Date.now() } : p);
    setProfiles(updated);
    saveProfileCatalog(updated);

    // 2. Update di data progress profile tersebut
    try {
      const prog = loadUserProgress(profileId);
      prog.playerName = trimmed;
      saveUserProgress(prog, profileId);
    } catch (err) {
      console.error(err);
    }

    // 3. Jika sedang mengedit profile aktif, refresh state di App
    if (profileId === currentProfileId) {
      onSwitchProfile(profileId);
    }

    setEditingId(null);
    setEditingName('');
  };

  // Batalkan mode edit nama
  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setEditingId(null);
    setEditingName('');
  };

  // Pilih profil
  const handleSelect = (id: string) => {
    if (editingId) return; // Jangan ganti jika sedang mengetik edit nama
    sounds.playClick();
    setActiveProfileId(id);
    onSwitchProfile(id);
    onClose();
  };

  // Hapus profil (jika lebih dari 1)
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) return;
    sounds.playBump();
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    saveProfileCatalog(updated);
    if (id === currentProfileId) {
      onSwitchProfile(updated[0].id);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="card-kid" style={{
        maxWidth: '520px',
        width: '100%',
        maxHeight: '92vh',
        overflow: 'hidden',
        padding: 0,
        borderRadius: '28px',
        backgroundColor: '#FFFFFF',
        border: '4px solid #BAE6FD',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'clamp(16px, 3.5vw, 24px)',
          flex: 1,
        }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="#00C2CB" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-navy)' }}>
              Pilih Profil Pemain
            </h3>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="btn-chunky btn-white btn-sm"
            style={{ padding: '4px 10px' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-slate)', marginBottom: '16px' }}>
          Satu HP atau tablet bisa digunakan bersama oleh kakak dan adik dengan profil masing-masing!
        </p>

        {/* Daftar Profil Tersedia */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '220px',
          overflowY: 'auto',
          marginBottom: '16px',
        }}>
          {profiles.map(p => {
            const isCurrent = p.id === currentProfileId;
            const isEditing = editingId === p.id;
            const avatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];

            return (
              <div
                key={p.id}
                onClick={() => !isEditing && handleSelect(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  backgroundColor: isCurrent ? '#E0F2FE' : '#F8FAFC',
                  border: isCurrent ? '2px solid #00C2CB' : '2px solid #E2E8F0',
                  cursor: isEditing ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{avatar.emoji}</span>
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(p.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        maxLength={18}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Nama baru..."
                        style={{
                          width: '100%',
                          maxWidth: '180px',
                          padding: '6px 10px',
                          fontSize: '0.95rem',
                          fontFamily: 'var(--font-family-kids)',
                          fontWeight: 800,
                          borderRadius: '10px',
                          border: '2px solid #00C2CB',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!editingName.trim()}
                        title="Simpan Nama"
                        style={{
                          backgroundColor: '#2ECB71',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        title="Batal"
                        style={{
                          backgroundColor: '#E2E8F0',
                          color: '#64748B',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: 'var(--color-text-navy)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </div>
                      {isCurrent && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>
                          Sedang Aktif ✓
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {/* Tombol Rename */}
                    <button
                      onClick={(e) => handleStartRename(p, e)}
                      title="Ubah Nama Pemain (Rename)"
                      style={{
                        background: 'rgba(0, 194, 203, 0.1)',
                        border: '1.5px solid #00C2CB',
                        color: '#009AA2',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Ubah</span>
                    </button>

                    {isCurrent && <Check size={18} color="#00C2CB" strokeWidth={3} />}
                    {profiles.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        title="Hapus Profil"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tambah Profil Baru */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '20px',
          border: '2px solid #E2E8F0',
          padding: '14px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-navy)', marginBottom: '8px' }}>
            ➕ Tambah Pemain Baru:
          </div>

          {/* Pilihan Avatar Karakter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}>
            {AVATARS.map((av) => {
              const isSelected = newPlayerAvatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setNewPlayerAvatarId(av.id);
                  }}
                  title={av.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #00C2CB' : '2px solid #E2E8F0',
                    backgroundColor: isSelected ? '#E0F2FE' : '#FFFFFF',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{av.emoji}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isSelected ? '#008D94' : '#64748B',
                  }}>
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Input Nama & Tombol Tambah */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              placeholder="Ketik nama anak di sini..."
              value={newPlayerName}
              maxLength={18}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateProfile();
                }
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '14px',
                border: '2px solid #CBD5E1',
                fontFamily: 'var(--font-family-kids)',
                fontWeight: 700,
                fontSize: '0.95rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
            <button
              onClick={handleCreateProfile}
              disabled={!newPlayerName.trim()}
              className="btn-chunky btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              <Plus size={16} /> Tambah
            </button>
          </div>
        </div>

        {/* Tombol Reset Seluruh Data (Mulai dari Awal) */}
        <div style={{
          borderTop: '2px dashed #E2E8F0',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <button
            onClick={() => {
              if (window.confirm('Apakah kamu yakin ingin mereset SEMUA data dan memulai petualangan baru dari awal (isi nama lagi)?')) {
                sounds.playBump();
                try {
                  localStorage.clear();
                  window.location.reload();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className="btn-chunky btn-sm"
            style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #FCA5A5',
              boxShadow: '0 3px 0 #EF4444',
              color: '#DC2626',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="Hapus semua progres dan mulai dari awal (Isi nama pemain baru)"
          >
            🔄 Reset Semua Data & Mulai dari Awal
          </button>
          <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700 }}>
            ✨ Seluruh bintang & kodemu otomatis tersimpan aman!
          </span>
        </div>
        </div>
      </div>
    </div>
  );
};

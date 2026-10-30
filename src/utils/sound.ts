// Sintesis efek suara ramah anak menggunakan Web Audio API lokal tanpa file eksternal

export type AvatarSoundType = 
  | 'meow' | 'bark' | 'beep' | 'dino' | 'fox' | 'duck' | 'panda' 
  | 'horse' | 'lion' | 'penguin' | 'elephant' | 'tiger' | 'rabbit' 
  | 'bear' | 'monkey' | 'frog' | 'owl' | 'dragon';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    // AudioContext dibuat saat interaksi pertama pemain
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAvatarVoice();
      this.stopSpeech();
    }
  }

  // Menghentikan dan me-mute suara avatar yang sedang diputar sebelumnya
  public stopAvatarVoice() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // Abaikan jika sudah stopped
      }
      this.currentAudio = null;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Efek suara klik tombol membal (Tactile pop)
  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Efek suara langkah karakter
  public playStep() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Efek suara mengambil bintang/koin (Ding!)
  public playCollect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Efek suara tabrakan/menabrak rintangan (Boing halus/tidak menakutkan)
  public playBump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Efek suara menang level (Fanfare gembira)
  public playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.25);
    });
  }

  // Suara karakter avatar yang khas sesuai jenis hewan/robotnya
  public playAvatarVoice(soundType: AvatarSoundType) {
    if (!this.enabled) return;

    // Hentikan suara avatar sebelumnya terlebih dahulu agar tidak saling tumpang tindih
    this.stopAvatarVoice();

    // Pastikan AudioContext di-resume saat user click
    this.initCtx();

    // Pemetaan nama file audio di public/sounds/ (untuk hewan yang sudah ada rekaman mp3)
    const localMp3Map: Record<string, string> = {
      meow: '/sounds/kucing.mp3',
      bark: '/sounds/anjing.mp3',
      beep: '/sounds/robot.mp3',
      dino: '/sounds/dino.mp3',
      fox: '/sounds/rubah.mp3',
      duck: '/sounds/bebek.mp3',
    };

    const mp3File = localMp3Map[soundType];

    // Jika ada file mp3 fisik yang sudah ada di public/sounds, coba putar
    if (mp3File) {
      try {
        const audio = new Audio(mp3File);
        audio.volume = 0.9;
        this.currentAudio = audio;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Jika browser memblokir audio file, langsung fallback ke Web Audio synthesizer
            this.synthesizeRealisticVoice(soundType);
          });
        }
        return;
      } catch {
        // Fallback langsung ke synthesizer
      }
    }

    // Untuk karakter horse, lion, penguin dan fallback: LANGSUNG mainkan Web Audio synthesizer tanpa delay!
    this.synthesizeRealisticVoice(soundType);
  }

  // Synthesizer akustik berfrekuensi alami menyerupai vokal hewan asli
  private synthesizeRealisticVoice(soundType: AvatarSoundType) {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. KUCING: Vokalisasi Meow (Formant Vowel 'Mee-Ow' dengan harmonik ganda)
    if (soundType === 'meow') {
      const fundFreq = 520;
      [1, 1.9, 2.8].forEach((harmonic, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';

        // Intonasi vokal meow: naik sedikit lalu meluncur turun panjang
        osc.frequency.setValueAtTime(fundFreq * harmonic, t);
        osc.frequency.exponentialRampToValueAtTime(fundFreq * 1.6 * harmonic, t + 0.18);
        osc.frequency.exponentialRampToValueAtTime(fundFreq * 0.85 * harmonic, t + 0.6);

        // Amplitude envelope meong
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    }

    // 2. ANJING: Gonggongan ganda berkarakter (Thump serak + letupan vokal "Woof! Woof!")
    else if (soundType === 'bark') {
      [0, 0.22].forEach((delay) => {
        if (!this.ctx) return;
        // Suara serak tenggorokan (bandpass noise burst)
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, t + delay);
        filter.Q.setValueAtTime(3.0, t + delay);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, t + delay);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t + delay);

        // Nada vokal gonggongan (Pitch drop 400Hz -> 120Hz)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, t + delay);
        osc.frequency.exponentialRampToValueAtTime(130, t + delay + 0.11);
        oscGain.gain.setValueAtTime(0.3, t + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.12);
      });
    }

    // 3. ROBOT: Chiptune arpeggio sci-fi
    else if (soundType === 'beep') {
      const pitches = [523, 659, 784, 1046, 1318];
      pitches.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, t + idx * 0.05);
        gain.gain.setValueAtTime(0.12, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx + 1) * 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + (idx + 1) * 0.05);
      });
    }

    // 4. DINOSAURUS: Raungan bass menggelegar dalam
    else if (soundType === 'dino') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.linearRampToValueAtTime(800, t + 0.2);
      filter.frequency.exponentialRampToValueAtTime(150, t + 0.7);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, t);
      osc.frequency.linearRampToValueAtTime(160, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.7);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    }

    // 5. RUBAH (FOX): Suara "Yip-Yip!" nyaring melengking
    else if (soundType === 'fox') {
      [0, 0.15].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, t + delay);
        osc.frequency.exponentialRampToValueAtTime(1750, t + delay + 0.05);
        osc.frequency.exponentialRampToValueAtTime(850, t + delay + 0.12);

        gain.gain.setValueAtTime(0.28, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.12);
      });
    }

    // 6. BEBEK (DUCK): Suara Kwek-Kwek otentik ("Quack! Quack!")
    else if (soundType === 'duck') {
      // Dua letupan suara kwek: "Kwek ... Kwek!"
      [0, 0.24].forEach((delay, quackIdx) => {
        if (!this.ctx) return;
        const startTime = t + delay;
        const duration = quackIdx === 0 ? 0.18 : 0.22;

        // Karakter paruh bebek kaya resonansi formant nasal (sawtooth bandpass)
        const osc = this.ctx.createOscillator();
        const bandpass = this.ctx.createBiquadFilter();
        const formant = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Pitch scoop bebek turun cepat dari ~720Hz ke ~380Hz
        osc.frequency.setValueAtTime(720, startTime);
        osc.frequency.exponentialRampToValueAtTime(390, startTime + duration);

        // Filter resonansi vokal nasal (formant rongga paruh bebek di ~1200Hz - 850Hz)
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1400, startTime);
        bandpass.frequency.linearRampToValueAtTime(900, startTime + duration);
        bandpass.Q.setValueAtTime(3.8, startTime);

        formant.type = 'peaking';
        formant.frequency.setValueAtTime(2400, startTime);
        formant.gain.setValueAtTime(4.0, startTime);
        formant.Q.setValueAtTime(2.0, startTime);

        // Envelope suara kwek (puncak cepat lalu meluruh)
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.38, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(bandpass);
        bandpass.connect(formant);
        formant.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    }

    // 7. KUDA (HORSE): Suara Ringkikan Kuda ("Neigh / Whinny")
    else if (soundType === 'horse') {
      // Ringkikan kuda memiliki getaran frekuensi (vibrato/tremolo cepat) dari nada tinggi turun
      const osc = this.ctx.createOscillator();
      const modOsc = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Frekuensi modulasi getaran tenggorokan kuda (~18Hz vibrato)
      modOsc.type = 'sine';
      modOsc.frequency.setValueAtTime(18, t);
      modGain.gain.setValueAtTime(80, t);
      modGain.gain.linearRampToValueAtTime(140, t + 0.3);
      modGain.gain.exponentialRampToValueAtTime(20, t + 0.9);

      modOsc.connect(osc.frequency);

      // Pitch sweep kuda: mulai melengking ~880Hz, melonjak ke ~1150Hz, lalu turun bergetar ke ~450Hz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.linearRampToValueAtTime(1150, t + 0.18);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.9);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.frequency.linearRampToValueAtTime(950, t + 0.9);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.1);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      modOsc.start(t);
      osc.start(t);
      modOsc.stop(t + 0.9);
      osc.stop(t + 0.9);
    }

    // 8. SINGA (LION): Auman raja hutan bass menggelegar ("Roar!")
    else if (soundType === 'lion') {
      // Dua lapis suara auman: sub-bass rumble + distorted growl
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(90, t);
      osc1.frequency.linearRampToValueAtTime(160, t + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(55, t + 0.85);

      osc2.frequency.setValueAtTime(95, t);
      osc2.frequency.linearRampToValueAtTime(165, t + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(58, t + 0.85);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);
      filter.frequency.linearRampToValueAtTime(900, t + 0.2);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.85);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.42, t + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.85);
      osc2.stop(t + 0.85);
    }

    // 9. PINGUIN (PENGUIN): Suara cicitan gembira pinguin kutub ("Chirp-Honk!")
    else if (soundType === 'penguin') {
      [0, 0.14, 0.28].forEach((delay, idx) => {
        if (!this.ctx) return;
        const startTime = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startFreq = idx === 0 ? 1100 : idx === 1 ? 1450 : 1250;
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, startTime + 0.04);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.85, startTime + 0.11);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.11);
      });
    }

    // 10. KATAK (FROG): Suara "Ribbit / Kroak" membal gembira
    else if (soundType === 'frog') {
      [0, 0.16].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t + delay);
        osc.frequency.linearRampToValueAtTime(260, t + delay + 0.04);
        osc.frequency.exponentialRampToValueAtTime(110, t + delay + 0.12);

        gain.gain.setValueAtTime(0.01, t + delay);
        gain.gain.linearRampToValueAtTime(0.32, t + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.12);
      });
    }

    // 11. MONYET (MONKEY): Cicitan tawa monyet riang ("Ooh-Ooh-Aah-Aah!")
    else if (soundType === 'monkey') {
      [0, 0.12, 0.24, 0.36].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const baseFreq = idx < 2 ? 650 : 850;
        osc.frequency.setValueAtTime(baseFreq, t + delay);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + delay + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + delay + 0.09);

        gain.gain.setValueAtTime(0.01, t + delay);
        gain.gain.linearRampToValueAtTime(0.28, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.09);
      });
    }

    // 12. KELINCI (RABBIT): Suara cicitan hidung berderak lucu ("Twitch-Squeak")
    else if (soundType === 'rabbit') {
      [0, 0.12].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, t + delay);
        osc.frequency.exponentialRampToValueAtTime(1800, t + delay + 0.03);
        osc.frequency.exponentialRampToValueAtTime(1100, t + delay + 0.08);

        gain.gain.setValueAtTime(0.01, t + delay);
        gain.gain.linearRampToValueAtTime(0.25, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.08);
      });
    }

    // 13. GAJAH (ELEPHANT): Suara terompet belalai gajah megah ("Pawoo!")
    else if (soundType === 'elephant') {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(620, t + 0.25);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.linearRampToValueAtTime(1400, t + 0.3);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.38, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    }

    // 14. BURUNG HANTU (OWL): Suara kokok malam ("Hoo-Hoo!")
    else if (soundType === 'owl') {
      [0, 0.25].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const dur = idx === 0 ? 0.16 : 0.35;
        osc.frequency.setValueAtTime(480, t + delay);
        osc.frequency.exponentialRampToValueAtTime(380, t + delay + dur);

        gain.gain.setValueAtTime(0.01, t + delay);
        gain.gain.linearRampToValueAtTime(0.3, t + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + dur);
      });
    }

    // 15. HARIMAU (TIGER): Geraman sangar harimau ("Growl-Chuff")
    else if (soundType === 'tiger') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.linearRampToValueAtTime(190, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.65);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.linearRampToValueAtTime(1000, t + 0.18);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.36, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    }

    // 16. NAGA API (DRAGON): Semburan deru api mitis ("Whoosh-Roar!")
    else if (soundType === 'dragon') {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, t);
      osc.frequency.linearRampToValueAtTime(240, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(45, t + 1.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.linearRampToValueAtTime(1200, t + 0.3);
      filter.frequency.exponentialRampToValueAtTime(180, t + 1.0);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.0);
    }

    // 17. BERUANG / PANDA / DEFAULT: Suara gumaman lembut
    else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(170, t + 0.28);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  // Pembacaan narasi materi / penjelasan suara ramah anak (Speech Synthesis & Web Audio)
  public speakText(text: string, onStart?: () => void, onEnd?: () => void) {
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    if (!this.enabled) {
      if (onEnd) onEnd();
      return;
    }

    // 1. Pastikan AudioContext siap & aktif
    this.initCtx();

    // Bunyikan chime notifikasi ramah anak sebagai feedback langsung saat tombol ditekan
    this.playCollect();

    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis API tidak didukung pada browser ini.');
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }

    const synth = window.speechSynthesis;

    // Bersihkan antrean speech sebelumnya
    try {
      synth.cancel();
      if (synth.paused) {
        synth.resume();
      }
    } catch (e) {
      console.warn('Synth cancel/resume warning:', e);
    }

    // Pemecahan kalimat agar tidak melampaui buffer browser (~140 karakter per potong)
    const rawSentences = text
      .replace(/[\n\r]+/g, ' ')
      .replace(/([.!?])\s*/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of rawSentences) {
      if ((currentChunk + ' ' + sentence).length > 130) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    const doSpeak = () => {
      const allVoices = synth.getVoices() || [];
      // Cari suara bahasa Indonesia jika tersedia di sistem operasi / browser
      const idVoice = allVoices.find(v => 
        v.lang.toLowerCase().startsWith('id') || 
        v.lang.toLowerCase().includes('indonesia') ||
        v.name.toLowerCase().includes('indonesia')
      );

      // Fallback: gunakan suara default browser jika suara Indonesia belum terinstall di OS
      const fallbackVoice = idVoice || allVoices.find(v => v.default) || allVoices[0];

      let currentIdx = 0;
      let hasStarted = false;
      let keepAliveTimer: any = null;

      const clearTimer = () => {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
      };

      const finishSpeaking = () => {
        clearTimer();
        if (onEnd) onEnd();
      };

      // Workaround bug Chrome di Mac: Chrome bisa pause speech secara sepihak jika utterance lama
      keepAliveTimer = setInterval(() => {
        if (synth.speaking && synth.paused) {
          synth.resume();
        }
      }, 5000);

      const speakChunk = (idx: number) => {
        if (idx >= chunks.length) {
          finishSpeaking();
          return;
        }

        try {
          if (synth.paused) {
            synth.resume();
          }

          const utterance = new SpeechSynthesisUtterance(chunks[idx]);
          
          if (idVoice) {
            utterance.voice = idVoice;
            utterance.lang = idVoice.lang;
          } else if (fallbackVoice) {
            utterance.voice = fallbackVoice;
            utterance.lang = fallbackVoice.lang || 'id-ID';
          } else {
            utterance.lang = 'id-ID';
          }

          utterance.rate = 0.95; // Kecepatan ramah anak, jelas dan tidak terburu-buru
          utterance.pitch = 1.05; // Sedikit lebih ceria untuk anak-anak

          utterance.onstart = () => {
            if (!hasStarted) {
              hasStarted = true;
              if (onStart) onStart();
            }
          };

          utterance.onend = () => {
            currentIdx++;
            speakChunk(currentIdx);
          };

          utterance.onerror = (e) => {
            console.warn('SpeechSynthesis chunk error:', e);
            currentIdx++;
            if (currentIdx < chunks.length) {
              speakChunk(currentIdx);
            } else {
              finishSpeaking();
            }
          };

          synth.speak(utterance);
        } catch (err) {
          console.warn('synth.speak error:', err);
          finishSpeaking();
        }
      };

      // Mulai chunk pertama
      speakChunk(0);
    };

    // Chrome/Safari memuat daftar voices secara asinkron
    if (synth.getVoices().length > 0) {
      setTimeout(doSpeak, 60);
    } else {
      let fired = false;
      const onVoicesChanged = () => {
        if (!fired) {
          fired = true;
          synth.removeEventListener('voiceschanged', onVoicesChanged);
          doSpeak();
        }
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      // Fallback timeout jika browser tidak menembakkan onvoiceschanged
      setTimeout(() => {
        if (!fired) {
          fired = true;
          synth.removeEventListener('voiceschanged', onVoicesChanged);
          doSpeak();
        }
      }, 250);
    }
  }

  // Hentikan pembacaan suara seketika
  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Failed to stop speech:', e);
      }
    }
  }
}

export const sounds = new SoundEffectsManager();

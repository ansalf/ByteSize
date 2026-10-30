export interface ShopItem {
  id: string;
  name: string;
  category: 'AVATAR';
  price: number;
  emoji: string;
  description: string;
  previewValue: string; // ID avatar
}

export const SHOP_ITEMS: ShopItem[] = [
  // Toko Karakter Avatar Eksklusif (11 Avatar Keren)
  {
    id: 'avatar_horse',
    name: 'Guntur si Kuda',
    category: 'AVATAR',
    price: 100, // Sesuai permintaan: Kuda 100 koin
    emoji: '🐴',
    description: 'Cepat bagai kilat, tangguh melompati rintangan dan penuh semangat juara!',
    previewValue: 'horse',
  },
  {
    id: 'avatar_penguin',
    name: 'Piko si Pinguin',
    category: 'AVATAR',
    price: 80,
    emoji: '🐧',
    description: 'Pinguin lucu yang sangat teliti menyusun setiap langkah balok kode!',
    previewValue: 'penguin',
  },
  {
    id: 'avatar_frog',
    name: 'Kero si Katak',
    category: 'AVATAR',
    price: 75,
    emoji: '🐸',
    description: 'Ahli melompati batu rintangan dan berenang di rawa tantangan koding!',
    previewValue: 'frog',
  },
  {
    id: 'avatar_monkey',
    name: 'Chiko si Monyet',
    category: 'AVATAR',
    price: 85,
    emoji: '🐵',
    description: 'Suka berayun lincah menjelajahi cabang logika percabangan!',
    previewValue: 'monkey',
  },
  {
    id: 'avatar_rabbit',
    name: 'Mochi si Kelinci',
    category: 'AVATAR',
    price: 90,
    emoji: '🐰',
    description: 'Cepat melompat antar loop pengulangan dan selalu riang gembira!',
    previewValue: 'rabbit',
  },
  {
    id: 'avatar_bear',
    name: 'Barnaby si Beruang',
    category: 'AVATAR',
    price: 110,
    emoji: '🐻',
    description: 'Kuat, hangat, dan setia melindungi program dari bug yang mengganggu!',
    previewValue: 'bear',
  },
  {
    id: 'avatar_elephant',
    name: 'Boni si Gajah',
    category: 'AVATAR',
    price: 120,
    emoji: '🐘',
    description: 'Punya daya ingat memori kode yang sangat kuat dan bijaksana!',
    previewValue: 'elephant',
  },
  {
    id: 'avatar_owl',
    name: 'Hooty si Burung Hantu',
    category: 'AVATAR',
    price: 130,
    emoji: '🦉',
    description: 'Mata tajam yang mampu melihat kesalahan kode terkecil di kegelapan!',
    previewValue: 'owl',
  },
  {
    id: 'avatar_tiger',
    name: 'Raja Belang si Harimau',
    category: 'AVATAR',
    price: 140,
    emoji: '🐯',
    description: 'Penuh wibawa, gesit melompati baris kode dengan ketangkasan luar biasa!',
    previewValue: 'tiger',
  },
  {
    id: 'avatar_lion',
    name: 'Leo si Singa',
    category: 'AVATAR',
    price: 150,
    emoji: '🦁',
    description: 'Raja algoritma yang pemberani dan pantang menyerah menyelesaikan misi!',
    previewValue: 'lion',
  },
  {
    id: 'avatar_dragon',
    name: 'Ignis si Naga Api',
    category: 'AVATAR',
    price: 200,
    emoji: '🐲',
    description: 'Avatar mitos legendaris yang menyemburkan api keberanian programmer cilik!',
    previewValue: 'dragon',
  },
];


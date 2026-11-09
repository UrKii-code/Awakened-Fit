export interface CosmeticItem {
  id: string;
  name: string;
  category: 'aura' | 'frame' | 'crest' | 'title';
  tokenPrice: number;
  description: string;
  previewColor: string;
  glowEffect: string;
  unlockedByDefault?: boolean;
}

export const COSMETIC_STORE_ITEMS: CosmeticItem[] = [
  {
    id: 'aura_titan_ember',
    name: 'Titan Ember Aura',
    category: 'aura',
    tokenPrice: 80,
    description: 'Surrounds your Hunter crest with floating volcanic sparks and crimson embers.',
    previewColor: '#f97316',
    glowEffect: '0 0 25px rgba(249, 115, 22, 0.7)',
  },
  {
    id: 'aura_void_surge',
    name: 'Void Surge Aura',
    category: 'aura',
    tokenPrice: 100,
    description: 'Discharges electric cyan arcs and high-velocity shadow trails.',
    previewColor: '#00e5ff',
    glowEffect: '0 0 25px rgba(0, 229, 255, 0.7)',
  },
  {
    id: 'aura_celestial_halo',
    name: 'Celestial Arcane Halo',
    category: 'aura',
    tokenPrice: 120,
    description: 'A radiant violet halo of pure willpower and deep meditative focus.',
    previewColor: '#a855f7',
    glowEffect: '0 0 25px rgba(168, 85, 247, 0.7)',
  },
  {
    id: 'frame_obsidian_hex',
    name: 'Obsidian Hex Frame',
    category: 'frame',
    tokenPrice: 60,
    description: 'Carved metallic obsidian border with sharp runic edge bevels.',
    previewColor: '#334155',
    glowEffect: '0 0 15px rgba(51, 65, 85, 0.5)',
  },
  {
    id: 'frame_gold_aurora',
    name: 'Sun-Forged Auric Frame',
    category: 'frame',
    tokenPrice: 150,
    description: 'Radiant gold metallic casing awarded to consistent iron lifters.',
    previewColor: '#fbbf24',
    glowEffect: '0 0 25px rgba(251, 191, 36, 0.8)',
  },
  {
    id: 'title_iron_will',
    name: 'Title: The Indomitable',
    category: 'title',
    tokenPrice: 50,
    description: 'Equip the legendary prestige title "The Indomitable" across all game sync networks.',
    previewColor: '#38bdf8',
    glowEffect: '0 0 10px rgba(56, 189, 248, 0.5)',
  },
];

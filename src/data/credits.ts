export type CreditEntry = {
  role?: string;
  name?: string;
};

export type CreditSectionData = {
  id: string;
  title: string;
  align: 'left' | 'right' | 'center';
  durationMs?: number;
  waitForIdle?: boolean;
  entries: CreditEntry[];
};

export type CreditsSequenceItem =
  | { type: 'section'; id: string }
  | { type: 'characters'; durationMs: number }
  | { type: 'oraxor'; durationMs: number }
  | { type: 'history'; durationMs: number };

export const creditsSections: CreditSectionData[] = [
  {
    id: 'opening-title',
    title: 'The Praxor Website',
    align: 'center',
    durationMs: 3200,
    entries: [],
  },
  {
    id: 'opening-joke',
    title: 'what the fuck why did it get cinematic',
    align: 'center',
    durationMs: 2000,
    entries: [],
  },
  {
    id: 'website',
    title: 'WEBSITE',
    align: 'left',
    durationMs: 5000,
    entries: [
      { role: 'Development', name: 'praxor' },
      { role: 'Design', name: 'praxor' },
      { role: 'Hosting', name: 'GitHub Pages' },
      { role: 'Libraries' },
    ],
  },
  {
    id: 'art-graphics',
    title: 'ART & GRAPHICS',
    align: 'right',
    durationMs: 5000,
    entries: [
      { role: 'Original Artwork', name: 'Praxor' },
      { role: 'Contributors' },
      { role: 'Commissions' },
    ],
  },
  {
    id: 'lore-writing',
    title: 'Lore & Writing',
    align: 'center',
    durationMs: 2600,
    entries: [{ name: 'praxor' }],
  },
  {
    id: 'content',
    title: 'CONTENT',
    align: 'left',
    durationMs: 5000,
    entries: [
      { role: 'Writing', name: 'praxor' },
      { role: 'Blog / Updates', name: 'praxor' },
      { role: 'Documentation', name: '"... did we really do any of that?"' },
    ],
  },
  {
    id: 'testing',
    title: 'TESTING',
    align: 'center',
    durationMs: 5000,
    entries: [
      { role: 'Bug Testers', name: 'The Praxor Fan Club' },
      { role: 'Mobile Testing', name: 'ME. PRAXOR.' },
      { role: 'Feature Testing', name: 'All of my friends, and you!' },
    ],
  },
  {
    id: 'special-thanks',
    title: 'SPECIAL THANKS',
    align: 'right',
    durationMs: 4000,
    entries: [
      { role: 'Friends', name: 'All of my friends.' },
      { role: 'Contributors', name: 'praxor' },
      { role: 'Inspiration', name: 'my imagination and a number of other things' },
    ],
  },
  {
    id: 'ending',
    title: 'thanks for watching.',
    align: 'center',
    waitForIdle: true,
    entries: [],
  },
];

export const creditsSequence: CreditsSequenceItem[] = [
  { type: 'section', id: 'opening-title' },
  { type: 'section', id: 'opening-joke' },
  { type: 'section', id: 'website' },
  { type: 'section', id: 'art-graphics' },
  { type: 'characters', durationMs: 1800 },
  { type: 'oraxor', durationMs: 2400 },
  { type: 'section', id: 'lore-writing' },
  { type: 'section', id: 'content' },
  { type: 'section', id: 'testing' },
  { type: 'section', id: 'special-thanks' },
  { type: 'history', durationMs: 2000 },
  { type: 'section', id: 'ending' },
];

export const historyImages = [
  '/media/hist/websitescreenshot1.png',
  '/media/hist/websitescreenshot2.png',
  '/media/hist/websitescreenshot3.png',
  '/media/hist/websitescreenshot4.png',
  '/media/hist/websitescreenshot5.png',
  '/media/hist/websitescreenshot6.png',
];
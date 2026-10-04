import type { AchievementId } from './achievements';

export type ThemeDefinition = {
	id: string;
	name: string;
	/** CSS background for the selector preview. */
	swatch: string;
	preview: ThemePreviewTokens;
	/** Theme is only selectable once this achievement is unlocked. */
	unlockedBy?: AchievementId;
};

export type ThemePreviewTokens = {
	bg: string;
	card: string;
	text: string;
	muted: string;
	accent: string;
	accentContrast: string;
	accent10: string;
	mutedBorder: string;
};

export const DEFAULT_THEME = 'praxorian';

export const themes: readonly ThemeDefinition[] = [
	{ id: 'praxorian', name: 'Praxorian', swatch: 'linear-gradient(135deg,#130623 45%,#6822b3)', preview: { bg: '#0b0614', card: '#130623', text: '#f3f0ff', muted: '#bfb3f5', accent: '#6822b3', accentContrast: '#ffffff', accent10: 'rgba(104,34,179,.06)', mutedBorder: 'rgba(74,16,205,.08)' } },
	{ id: 'berhian', name: 'Berhian', swatch: 'linear-gradient(135deg,#0a1a0f 40%,#2fa84f 70%,#e0b83a)', preview: { bg: '#050e08', card: '#0b1a10', text: '#eef6e6', muted: '#a6c29b', accent: '#2fa84f', accentContrast: '#04110a', accent10: 'rgba(47,168,79,.08)', mutedBorder: 'rgba(47,168,79,.18)' } },
	{ id: 'toohi-ian', name: 'Toohi-ian', swatch: 'linear-gradient(135deg,#17143d,#7c6cff 55%,#5cd1ff)', preview: { bg: '#0b0a24', card: '#17143d', text: '#f1eeff', muted: '#b9b3f2', accent: '#8b7bff', accentContrast: '#0b0a24', accent10: 'rgba(139,123,255,.1)', mutedBorder: 'rgba(139,123,255,.25)' } },
	{ id: 'macintoshing', name: 'Macintoshing', swatch: 'linear-gradient(180deg,#ffffff,#8ccaf0)', preview: { bg: '#ffffff', card: '#f5f5f5', text: '#000000', muted: '#333333', accent: '#1f78b8', accentContrast: '#ffffff', accent10: 'rgba(31,120,184,.1)', mutedBorder: '#cccccc' } },
	{ id: 'praxor-pop', name: 'Salted Pop Rocks', swatch: 'linear-gradient(135deg,#ffd6ea,#b9a1e8 60%,#a9d8f5)', preview: { bg: '#fff7fc', card: '#ffffff', text: '#2d2430', muted: '#6f5b6d', accent: '#b8457f', accentContrast: '#ffffff', accent10: 'rgba(242,143,189,.16)', mutedBorder: '#e7cde0' } },
	{ id: 'amoled', name: 'AMOLED', swatch: 'linear-gradient(135deg,#000000 55%,#f5f5f5)', preview: { bg: '#000000', card: '#050505', text: '#f5f5f5', muted: '#a8a8a8', accent: '#f5f5f5', accentContrast: '#000000', accent10: 'rgba(255,255,255,.1)', mutedBorder: 'rgba(255,255,255,.22)' } },
	{ id: 'cult', name: 'Cult', swatch: 'linear-gradient(135deg,#020812,#061326 50%,#3872b1)', preview: { bg: '#020812', card: '#061326', text: '#dcecff', muted: '#7895b8', accent: '#3872b1', accentContrast: '#ffffff', accent10: 'rgba(56,114,177,.1)', mutedBorder: 'rgba(56,114,177,.2)' }, unlockedBy: 'cultbound' },
	{ id: 'true-fr', name: 'True FR', swatch: 'linear-gradient(135deg,#04070a 30%,#2f8fe0 55%,#2fbf71 75%,#e6b422)', preview: { bg: '#03070a', card: '#0a1215', text: '#f3f1e2', muted: '#9fbfb2', accent: '#2f8fe0', accentContrast: '#03070a', accent10: 'rgba(47,143,224,.1)', mutedBorder: 'rgba(230,180,34,.22)' }, unlockedBy: 'trueFr' },
	{ id: 'rainbow', name: 'Rainbow', swatch: 'linear-gradient(120deg,#f178a8,#ac90f5 35%,#62c7cf 68%,#edbe61)', preview: { bg: '#10131f', card: '#191e2d', text: '#eff2ff', muted: '#aeb9cf', accent: '#62c7cf', accentContrast: '#10131f', accent10: 'rgba(98,199,207,.1)', mutedBorder: 'rgba(164,176,210,.22)' }, unlockedBy: 'surpriseSurprise' },
	{ id: 'matrix', name: 'Matrix', swatch: 'linear-gradient(135deg,#030907 35%,#12301d 68%,#50bd73)', preview: { bg: '#030907', card: '#0a150e', text: '#e1f2e5', muted: '#9eb8a4', accent: '#59c77a', accentContrast: '#041009', accent10: 'rgba(89,199,122,.1)', mutedBorder: 'rgba(89,199,122,.22)' } },
];

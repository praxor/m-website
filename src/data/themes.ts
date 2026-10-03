import type { AchievementId } from './achievements';

export type ThemeDefinition = {
	id: string;
	name: string;
	/** CSS background for the selector preview. */
	swatch: string;
	/** Theme is only selectable once this achievement is unlocked. */
	unlockedBy?: AchievementId;
};

export const DEFAULT_THEME = 'praxorian';

export const themes: readonly ThemeDefinition[] = [
	{ id: 'praxorian', name: 'Praxorian', swatch: 'linear-gradient(135deg,#130623 45%,#6822b3)' },
	{ id: 'berhian', name: 'Berhian', swatch: 'linear-gradient(135deg,#0a1a0f 40%,#2fa84f 70%,#e0b83a)' },
	{ id: 'toohi-ian', name: 'Toohi-ian', swatch: 'linear-gradient(135deg,#17143d,#7c6cff 55%,#5cd1ff)' },
	{ id: 'macintoshing', name: 'Macintoshing', swatch: 'linear-gradient(180deg,#ffffff,#8ccaf0)' },
	{ id: 'praxor-pop', name: 'Salted Pop Rocks', swatch: 'linear-gradient(135deg,#ffd6ea,#b9a1e8 60%,#a9d8f5)' },
	{ id: 'amoled', name: 'AMOLED', swatch: 'linear-gradient(135deg,#000000 55%,#f5f5f5)' },
	{ id: 'cult', name: 'Cult', swatch: 'linear-gradient(135deg,#020812,#061326 50%,#3872b1)', unlockedBy: 'cultbound' },
	{ id: 'true-fr', name: 'True FR', swatch: 'linear-gradient(135deg,#04070a 30%,#2f8fe0 55%,#2fbf71 75%,#e6b422)', unlockedBy: 'trueFr' },
];

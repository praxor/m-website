import { characters } from './characters';
import { getCharacterArtwork } from './character-artwork';
import { historyImages } from './credits';

export type AchievementDefinition = {
	name: string;
	description: string;
	hint?: string;
	rewards?: readonly AchievementReward[];
	progress?: AchievementProgressDefinition;
	/** Secret achievements show their name but not their condition until unlocked. */
	secret: boolean;
	/** Progress needed for single-step achievements. Defaults to 1. */
	goal?: number;
	/** Label for progress values, e.g. "seconds". */
	unit?: 'seconds';
	/** Unlock when a played track title contains one of these (case-insensitive). */
	trackTitles?: readonly string[];
	/** Progress is derived from the visited-post list versus the site's current posts. */
	derived?: 'allPosts';
	/** Cumulative visible time on the site, in seconds. */
	activeSeconds?: number;
	/** Continuous visible time without user interaction, in seconds. */
	inactiveSeconds?: number;
	/** Visible time on one page (marked with data-track-page) in a single visit. */
	pageSeconds?: { page: string; seconds: number };
	/** Press-and-hold on an element marked data-hold-unlock; weekday is 0 (Sunday) to 6. */
	hold?: { ms: number; weekday?: number };
};

export type AchievementProgressDefinition = {
	/** Initial persisted progress for a newly created achievement state. */
	initial?: number;
	/** Explicit current/max target; existing goal and timed goals remain supported. */
	maximum?: number;
	/** Show anonymous current progress before a secret achievement is unlocked. */
	showWhenHidden?: boolean;
	/** Reveal the exact maximum for a secret achievement while it is locked. */
	revealMaximumWhenHidden?: boolean;
};

export type AchievementReward = {
	id: string;
	name: string;
	description: string;
	/** Theme rewards include an ID so the shared theme preview can be shown. */
	themeId?: string;
};

const characterArtworkGoal = (slug: string) => {
	const character = characters.find((item) => item.slug === slug);
	return Math.max(1, character ? getCharacterArtwork(character).length : 0);
};

export const achievements = {
	reader: {
		name: 'Reader',
		description: 'Click on any post / update for the first time',
		secret: false,
	},
	premiumReader: {
		name: 'Premium Reader',
		description: 'Click on all (current) posts / updates',
		secret: false,
		derived: 'allPosts',
	},
	patient: {
		name: 'Patient',
		description: "Sit on the website for 5 minutes. You don't need to sit still.",
		secret: false,
		unit: 'seconds',
		activeSeconds: 300,
	},
	veryPatient: {
		name: 'Very Patient',
		description: "Sit on the website for 30 minutes. You don't need to sit still.",
		secret: false,
		unit: 'seconds',
		activeSeconds: 1800,
	},
	rollingGirl: {
		name: 'Rolling Girl',
		description: 'Enjoy the show',
		secret: true,
		trackTitles: ['rolling girl'],
	},
	cultbound: {
		name: 'Cultbound',
		description: 'View the cult page',
		secret: true,
	},
	nightcoreBeLike: {
		name: 'Nightcore be like:',
		description: 'Click the cat on the home page. Hope you enjoy!',
		secret: true,
	},
	trueFr: {
		name: 'True FR',
		description: 'Sit on the Axis character page for 5 minutes.',
		secret: true,
		unit: 'seconds',
		pageSeconds: { page: 'character-axis', seconds: 300 },
	},
	veeeryyyPatient: {
		name: 'Veeeryyy Patient...',
		description: 'Sit on the website doing NOTHING for an hour. Pretty easy.',
		secret: true,
		unit: 'seconds',
		inactiveSeconds: 3600,
	},
	bestDayEver: {
		name: 'This Is The Best Day Ever',
		description: "Click and hold on Praxor V1's portrait on a random Tuesday.",
		secret: true,
		hold: { ms: 2500, weekday: 2 },
	},
	creditsFlyingPraxor: {
		name: 'IS THAT A FUCKING BIRD-',
		description: 'Click on the flying praxor with a trail in the credits.',
		secret: true,
	},
	futureMysterySettingUnlock: {
		name: '???',
		description: '???',
		secret: true,
	},
	surpriseSurprise: {
		name: 'Surprise, surprise.',
		description: 'They will be missed...',
		secret: true,
	},
	v1Connoisseur: {
		name: 'V1 Connoisseur',
		description: 'View all praxor!V1 artwork.',
		secret: false,
		progress: { maximum: characterArtworkGoal('praxor-v1') },
	},
	v2Connoisseur: {
		name: 'V2 Connoisseur',
		description: 'View all praxor!V2 artwork.',
		secret: false,
		progress: { maximum: characterArtworkGoal('praxor-v2') },
	},
	creditsArtwork: {
		name: 'This is actually pretty nice.',
		description: 'View all artwork on the credits page.',
		hint: 'Tap on a picture.',
		secret: false,
		progress: { maximum: historyImages.length },
	},
	aFractionOfMyPower: {
		name: 'A fraction of my power.',
		description: 'This is in reference to the fact that I have 10k+ hours on Crush Crush.',
		secret: true,
		unit: 'seconds',
		activeSeconds: 36000,
	},
	plinkoNewBeginnings: {
		name: 'Plinko: New Beginnings.',
		description: 'Achieve 100 cumulative points in Plinko.',
		secret: false,
		progress: { maximum: 100 },
	},
	plinkoNotSoNewBeginnings: {
		name: 'Plinko: Not-so New Beginnings.',
		description: 'Achieve 500 cumulative points in Plinko.',
		secret: false,
		progress: { maximum: 500 },
	},
	plinkoMasterfulBeginnings: {
		name: 'Plinko: Masterful Beginnings.',
		description: 'Achieve 2,500 cumulative points in Plinko.',
		secret: false,
		progress: { maximum: 2500 },
	},
	iLovePlinko: {
		name: 'ILOVEPLINKO',
		description: 'Achieve 5,000 cumulative points in Plinko.',
		secret: true,
		progress: { maximum: 5000, showWhenHidden: true },
	},
	plinkoExtremeExaminer: {
		name: 'Sisyphean Plinko Examiner Decadence',
		description: 'Achieve 10,000 cumulative points in Plinko while Plinko Extreme Mode is enabled.',
		secret: true,
		progress: { maximum: 10000, showWhenHidden: true },
	},
} as const satisfies Record<string, AchievementDefinition>;

export type AchievementId = keyof typeof achievements;
export const FUTURE_MYSTERY_SETTING_ACHIEVEMENT: AchievementId = 'futureMysterySettingUnlock';

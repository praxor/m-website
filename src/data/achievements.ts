export type AchievementDefinition = {
	name: string;
	description: string;
	rewards?: readonly AchievementReward[];
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

export type AchievementReward = {
	id: string;
	name: string;
	description: string;
	/** Theme rewards include an ID so the shared theme preview can be shown. */
	themeId?: string;
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
} as const satisfies Record<string, AchievementDefinition>;

export type AchievementId = keyof typeof achievements;

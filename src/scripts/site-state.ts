import { achievements, type AchievementDefinition, type AchievementId, type AchievementReward } from '../data/achievements';
import { DEFAULT_THEME, themes, type ThemeDefinition } from '../data/themes';
import { PLINKO_STATE_EVENT, type PlinkoStateDetail } from './plinko-events';

export const STORAGE_KEY = 'praxor:site-state';
/** Every localStorage key holding personalised data; register new ones here so Reset Data clears them. */
const RESETTABLE_KEYS: string[] = [STORAGE_KEY];
export const registerResettableKey = (key: string) => { if (!RESETTABLE_KEYS.includes(key)) RESETTABLE_KEYS.push(key); };
const VERSION = 5;

export type ArtworkCollection = 'praxor-v1' | 'praxor-v2' | 'credits';

export type Settings = {
	theme: string;
	forceTheme: boolean;
	plinkoExtremeMode: boolean;
	/** null = follow the browser's prefers-reduced-motion. */
	reducedMotion: boolean | null;
};

export type AchievementState = {
	unlocked: boolean;
	progress: number;
	/** Set once the unlock toast has been shown, so it never repeats. */
	notified?: boolean;
	unlockedAt?: number;
};

export type SiteState = {
	version: number;
	flashingWarningAcknowledged: boolean;
	settings: Settings;
	achievements: Record<string, AchievementState>;
	artworkViews: Record<ArtworkCollection, string[]>;
	visitedPosts: string[];
	activity: { totalActiveSeconds: number };
};

export type AchievementView = {
	id: AchievementId;
	name: string;
	description: string;
	secret: boolean;
	unlocked: boolean;
	progress: number;
	goal: number;
	progressVisible: boolean;
	goalVisible: boolean;
	hint?: string;
	unit?: 'seconds';
};

export type AchievementUnlockDetail = {
	id: AchievementId;
	name: string;
	rewards: AchievementReward[];
};

export const CHANGE_EVENT = 'site-state:change';
export const UNLOCK_EVENT = 'site-state:unlock';

const defaultSettings = (): Settings => ({ theme: DEFAULT_THEME, forceTheme: false, reducedMotion: null, plinkoExtremeMode: false });
const defaultState = (): SiteState => ({
	version: VERSION,
	flashingWarningAcknowledged: false,
	settings: defaultSettings(),
	achievements: {},
	artworkViews: { 'praxor-v1': [], 'praxor-v2': [], credits: [] },
	visitedPosts: [],
	activity: { totalActiveSeconds: 0 },
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

// Add a step here when VERSION is bumped.
const migrate = (raw: Record<string, unknown>): Record<string, unknown> => {
	let data = raw;
	let version = typeof raw.version === 'number' ? raw.version : 1;
	if (version < 2 && isRecord(raw.settings)) {
		// v1 had system/light/dark; light maps to the closest new theme.
		data = { ...raw, version: 2, settings: { ...raw.settings, theme: raw.settings.theme === 'light' ? 'macintoshing' : DEFAULT_THEME } };
		version = 2;
	}
	if (version < 3) {
		data = { ...data, version: 3, flashingWarningAcknowledged: false };
		version = 3;
	}
	if (version < 4) {
		const settings = isRecord(data.settings) ? data.settings : {};
		data = { ...data, version: 4, settings: { ...settings, plinkoExtremeMode: false } };
		version = 4;
	}
	if (version < 5) data = { ...data, version: 5, artworkViews: {} };
	return data;
};

const sanitize = (raw: unknown): SiteState => {
	const state = defaultState();
	if (!isRecord(raw)) return state;
	const data = migrate(raw);
	state.flashingWarningAcknowledged = data.flashingWarningAcknowledged === true;
	if (isRecord(data.settings)) {
		const { theme, forceTheme, reducedMotion, plinkoExtremeMode } = data.settings;
		if (typeof theme === 'string' && themes.some((item) => item.id === theme)) state.settings.theme = theme;
		if (typeof forceTheme === 'boolean') state.settings.forceTheme = forceTheme;
			if (typeof plinkoExtremeMode === 'boolean') state.settings.plinkoExtremeMode = plinkoExtremeMode;
		if (typeof reducedMotion === 'boolean') state.settings.reducedMotion = reducedMotion;
	}
	if (isRecord(data.achievements)) {
		for (const [id, entry] of Object.entries(data.achievements)) {
			if (!isRecord(entry)) continue;
			state.achievements[id] = {
				unlocked: entry.unlocked === true,
				progress: typeof entry.progress === 'number' && Number.isFinite(entry.progress) ? Math.max(0, entry.progress) : 0,
				...(entry.notified === true ? { notified: true } : {}),
				...(typeof entry.unlockedAt === 'number' ? { unlockedAt: entry.unlockedAt } : {}),
			};
		}
	}
	if (isRecord(data.artworkViews)) {
		for (const collection of ['praxor-v1', 'praxor-v2', 'credits'] as const) {
			const saved = data.artworkViews[collection];
			if (Array.isArray(saved)) state.artworkViews[collection] = [...new Set(saved.filter((id): id is string => typeof id === 'string'))];
		}
	}
	if (Array.isArray(data.visitedPosts)) {
		state.visitedPosts = [...new Set(data.visitedPosts.filter((id): id is string => typeof id === 'string'))];
	}
	if (isRecord(data.activity) && typeof data.activity.totalActiveSeconds === 'number' && Number.isFinite(data.activity.totalActiveSeconds)) {
		state.activity.totalActiveSeconds = Math.max(0, data.activity.totalActiveSeconds);
	}
	return state;
};

const read = (): SiteState => {
	try {
		const text = window.localStorage.getItem(STORAGE_KEY);
		return sanitize(text ? JSON.parse(text) : null);
	} catch {
		return defaultState();
	}
};

let cache: SiteState | null = null;
let frozen = false;
const getState = () => (cache ??= read());

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

/** Writes to storage without notifying listeners; used for high-frequency data like active time. */
export const flushState = () => {
	if (frozen) return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
	} catch {
		// Storage unavailable or full: keep working from memory.
	}
};

const save = () => {
	flushState();
	emit(CHANGE_EVENT);
};

const definitionOf = (id: AchievementId): AchievementDefinition => achievements[id];
const goalOf = (definition: AchievementDefinition, total = 1): number =>
	definition.derived ? Math.max(total, 1)
		: definition.progress?.maximum ?? definition.goal ?? definition.activeSeconds ?? definition.inactiveSeconds ?? definition.pageSeconds?.seconds ?? 1;
const entry = (id: AchievementId): AchievementState => (getState().achievements[id] ??= {
	unlocked: false,
	progress: definitionOf(id).progress?.initial ?? 0,
});

// Themes

export const isThemeAvailable = (id: string) => {
	const theme = themes.find((item) => item.id === id);
	return !!theme && (!theme.unlockedBy || getState().achievements[theme.unlockedBy]?.unlocked === true);
};

export const getAvailableThemes = (): ThemeDefinition[] => themes.filter((item) => isThemeAvailable(item.id));

/** The stored theme if still selectable, otherwise the default. */
export const effectiveTheme = () => (isThemeAvailable(getState().settings.theme) ? getState().settings.theme : DEFAULT_THEME);

// Settings

/** Erases all stored personalised data; later writes are blocked so a pending flush can't restore it. */
export const resetAllData = () => {
	frozen = true;
	cache = defaultState();
	try {
		for (const key of RESETTABLE_KEYS) window.localStorage.removeItem(key);
	} catch {
		// Storage unavailable: nothing to erase.
	}
};

export const getSettings = (): Readonly<Settings> => getState().settings;

export const acknowledgeFlashingWarning = () => {
	if (getState().flashingWarningAcknowledged) return;
	getState().flashingWarningAcknowledged = true;
	document.documentElement.dataset.warningRequired = 'false';
	save();
};

export const updateSettings = (patch: Partial<Settings>) => {
	const next = sanitize({ version: VERSION, settings: { ...getState().settings, ...patch } }).settings;
	if (patch.theme !== undefined && !isThemeAvailable(next.theme)) next.theme = getState().settings.theme;
	Object.assign(getState().settings, next);
	applySettings();
	save();
};

export const prefersReducedMotion = () => getSettings().reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const applySettings = (root: HTMLElement = document.documentElement) => {
	root.dataset.siteTheme = effectiveTheme();
	root.dataset.forceTheme = String(getSettings().forceTheme);
	root.dataset.reducedMotion = String(prefersReducedMotion());
};

// Activity bridge: site-activity.ts owns the timers and reports values through here.

export const getTotalActiveSeconds = () => getState().activity.totalActiveSeconds;
export const setTotalActiveSeconds = (seconds: number) => { getState().activity.totalActiveSeconds = seconds; };

const live = { inactiveSeconds: 0, pageKey: '', pageSeconds: 0 };
export const setLiveActivity = (values: Partial<typeof live>) => Object.assign(live, values);

// Achievements

const currentPostIds = (): string[] => {
	try {
		const parsed = JSON.parse(document.getElementById('site-post-ids')?.textContent || '[]');
		return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
};

const announce = (id: AchievementId) => {
	const state = entry(id);
	if (state.notified) return;
	state.notified = true;
	const themeRewards = themes.filter((theme) => theme.unlockedBy === id).map((theme) => ({
		id: `theme:${theme.id}`,
		name: `${theme.name} theme`,
		description: `You unlocked the ${theme.name} theme.`,
		themeId: theme.id,
	}));
	emit(UNLOCK_EVENT, { id, name: achievements[id].name, rewards: [...themeRewards, ...(definitionOf(id).rewards ?? [])] } satisfies AchievementUnlockDetail);
};

const syncDerived = (): boolean => {
	const ids = currentPostIds();
	if (!ids.length) return false;
	const visited = new Set(getState().visitedPosts);
	const count = ids.filter((id) => visited.has(id)).length;
	const complete = count >= ids.length;
	const premium = entry('premiumReader');
	let changed = premium.progress !== count || premium.unlocked !== complete;
	premium.progress = count;
	if (complete && !premium.unlocked) {
		premium.unlocked = true;
		premium.unlockedAt = Date.now();
		changed = true;
		announce('premiumReader');
	} else if (!complete) premium.unlocked = false;
	return changed;
};

export const unlockAchievement = (id: AchievementId) => {
	const state = entry(id);
	if (state.unlocked) return false;
	state.unlocked = true;
	state.progress = goalOf(definitionOf(id));
	state.unlockedAt = Date.now();
	announce(id);
	applySettings();
	save();
	return true;
};

/** Updates persisted current progress and unlocks through the standard pipeline at the goal. */
export const updateAchievementProgress = (id: AchievementId, current: number) => {
	if (!Number.isFinite(current)) return false;
	const state = entry(id);
	if (state.unlocked) return false;
	const goal = goalOf(definitionOf(id));
	const progress = Math.min(goal, Math.max(0, current));
	if (state.progress === progress) return progress >= goal ? unlockAchievement(id) : false;
	state.progress = progress;
	if (progress >= goal) unlockAchievement(id);
	else save();
	return true;
};

const artworkAchievement: Record<ArtworkCollection, AchievementId> = {
	'praxor-v1': 'v1Connoisseur',
	'praxor-v2': 'v2Connoisseur',
	credits: 'creditsArtwork',
};

export const recordArtworkView = (collection: ArtworkCollection, artworkId: string) => {
	const normalizedId = artworkId.trim();
	if (!normalizedId) return false;
	const views = getState().artworkViews[collection];
	if (views.includes(normalizedId)) return false;
	views.push(normalizedId);
	updateAchievementProgress(artworkAchievement[collection], views.length);
	return true;
};

const persistedProgress = (id: AchievementId) => getAchievements().find((item) => item.id === id)?.progress ?? 0;

const recordPlinkoScore = (detail: PlinkoStateDetail) => {
	if (detail.reason !== 'score' || !Number.isFinite(detail.pointsEarned) || detail.pointsEarned <= 0) return;
	const cumulative = (id: AchievementId) => persistedProgress(id) + detail.pointsEarned;
	for (const id of ['plinkoNewBeginnings', 'plinkoNotSoNewBeginnings', 'plinkoMasterfulBeginnings', 'iLovePlinko'] as const) {
		updateAchievementProgress(id, cumulative(id));
	}
	if (detail.extremeMode) updateAchievementProgress('plinkoExtremeExaminer', cumulative('plinkoExtremeExaminer'));
};

export const recordPostVisit = (postId: string) => {
	const state = getState();
	if (!state.visitedPosts.includes(postId)) state.visitedPosts.push(postId);
	unlockAchievement('reader');
	syncDerived();
	save();
};

export const recordTrackPlay = (title: string) => {
	const normalized = title.toLowerCase();
	for (const id of Object.keys(achievements) as AchievementId[]) {
		if (definitionOf(id).trackTitles?.some((match) => normalized.includes(match))) unlockAchievement(id);
	}
};

const progressOf = (id: AchievementId, definition: AchievementDefinition, goal: number): number => {
	const saved = getState().achievements[id];
	if (saved?.unlocked) return goal;
	if (definition.activeSeconds) return Math.floor(getState().activity.totalActiveSeconds);
	if (definition.inactiveSeconds) return Math.floor(live.inactiveSeconds);
	if (definition.pageSeconds) return live.pageKey === definition.pageSeconds.page ? Math.floor(live.pageSeconds) : 0;
	return saved?.progress ?? definition.progress?.initial ?? 0;
};

export const getAchievements = (): AchievementView[] => {
	const total = currentPostIds().length;
	return (Object.keys(achievements) as AchievementId[]).map((id) => {
		const definition = definitionOf(id);
		const goal = goalOf(definition, total);
		const saved = getState().achievements[id];
		const unlocked = saved?.unlocked === true;
		const progress = Math.min(progressOf(id, definition, goal), goal);
		const hidden = definition.secret && !unlocked;
		const hasMeaningfulProgress = goal > 1 || progress > 0 || definition.progress !== undefined
			|| definition.derived !== undefined || definition.activeSeconds !== undefined
			|| definition.inactiveSeconds !== undefined || definition.pageSeconds !== undefined;
		return {
			id,
			name: definition.name,
			description: definition.description,
			secret: definition.secret,
			unlocked,
			progress,
			goal,
			progressVisible: !hidden || (definition.progress?.showWhenHidden ?? hasMeaningfulProgress),
			goalVisible: !hidden || definition.progress?.revealMaximumWhenHidden === true,
			hint: definition.hint,
			unit: definition.unit,
		};
	});
};

// Declarative page hooks: pages mark themselves instead of calling storage code.
const trackPageView = () => {
	const postId = document.querySelector<HTMLElement>('[data-post-id]')?.dataset.postId;
	if (postId) recordPostVisit(postId);
	else if (syncDerived()) save();
	const unlockId = document.querySelector<HTMLElement>('[data-unlock-on-view]')?.dataset.unlockOnView;
	if (unlockId && unlockId in achievements) unlockAchievement(unlockId as AchievementId);
};

/** Unlocks every achievement through the normal pipeline; gated themes follow from their achievements. */
export const unlockEverything = () => {
	const state = getState();
	for (const id of currentPostIds()) if (!state.visitedPosts.includes(id)) state.visitedPosts.push(id);
	syncDerived();
	for (const id of Object.keys(achievements) as AchievementId[]) unlockAchievement(id);
	applySettings();
	save();
};

let initialized = false;
export const initSiteState = () => {
	if (initialized) return;
	initialized = true;
	applySettings();
	window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { applySettings(); emit(CHANGE_EVENT); });
	document.addEventListener('astro:before-swap', (event) => applySettings((event as Event & { newDocument: Document }).newDocument.documentElement));
	document.addEventListener('astro:after-swap', () => applySettings());
	document.addEventListener('astro:page-load', trackPageView);
	window.addEventListener('site-artwork:view', (event) => {
		const detail = (event as CustomEvent<{ collection?: ArtworkCollection; src?: string }>).detail;
		if (detail?.collection && detail.src) recordArtworkView(detail.collection, detail.src);
	});
	window.addEventListener(PLINKO_STATE_EVENT, (event) => recordPlinkoScore((event as CustomEvent<PlinkoStateDetail>).detail));
	window.addEventListener('storage', (event) => {
		if (event.key !== STORAGE_KEY) return;
		cache = read();
		applySettings();
		emit(CHANGE_EVENT);
	});
	(window as unknown as Record<string, unknown>).iReallyReallyREALLYHateHavingFun = () => { unlockEverything(); };
	trackPageView();
};

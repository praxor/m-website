import { achievements, type AchievementDefinition, type AchievementId, type AchievementReward } from '../data/achievements';
import { characters } from '../data/characters';
import { DEFAULT_THEME, themes, type ThemeDefinition } from '../data/themes';
import { PLINKO_STATE_EVENT, type PlinkoStateDetail } from './plinko-events';

export const STORAGE_KEY = 'praxor:site-state';
/** Every localStorage key holding personalised data; register new ones here so Reset Data clears them. */
const RESETTABLE_KEYS: string[] = [STORAGE_KEY];
export const registerResettableKey = (key: string) => { if (!RESETTABLE_KEYS.includes(key)) RESETTABLE_KEYS.push(key); };
const VERSION = 7;
const VISIT_SESSION_KEY = 'praxor:site-visit-counted';

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
	chapterViews: Record<string, string[]>;
	visitedPosts: string[];
	siteVisits: number;
	stats: UsageStats;
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
	category: 'site' | 'characters' | 'plinko' | 'stats';
	hint?: string;
	unit?: 'seconds';
};

export type AchievementUnlockDetail = {
	id: AchievementId;
	name: string;
	rewards: AchievementReward[];
};

type UsageStats = {
	activeSeconds: number;
	idleSeconds: number;
	postsClicked: number;
	pagesVisited: number;
	musicListenedSeconds: number;
	songsPlayed: number;
	plinkoRoundsPlayed: number;
	plinkoResets: number;
	plinkoRoundsPlayedInPEM: number;
	highestPlinkoScore: number;
	totalPlinkoScore: number;
	settingsClicks: number;
	catsAccumulated: number;
	catsExploded: number;
	timesWatchedCredits: number;
	pageSeconds: Record<string, number>;
	characterSeconds: Record<string, number>;
};

export const CHANGE_EVENT = 'site-state:change';
export const UNLOCK_EVENT = 'site-state:unlock';

const defaultSettings = (): Settings => ({ theme: DEFAULT_THEME, forceTheme: false, reducedMotion: null, plinkoExtremeMode: false });
const defaultUsageStats = (): UsageStats => ({
	activeSeconds: 0,
	idleSeconds: 0,
	postsClicked: 0,
	pagesVisited: 0,
	musicListenedSeconds: 0,
	songsPlayed: 0,
	plinkoRoundsPlayed: 0,
	plinkoResets: 0,
	plinkoRoundsPlayedInPEM: 0,
	highestPlinkoScore: 0,
	totalPlinkoScore: 0,
	settingsClicks: 0,
	catsAccumulated: 0,
	catsExploded: 0,
	timesWatchedCredits: 0,
	pageSeconds: {},
	characterSeconds: {},
});
const defaultState = (): SiteState => ({
	version: VERSION,
	flashingWarningAcknowledged: false,
	settings: defaultSettings(),
	achievements: {},
	artworkViews: { 'praxor-v1': [], 'praxor-v2': [], credits: [] },
	chapterViews: {},
	visitedPosts: [],
	siteVisits: 0,
	stats: defaultUsageStats(),
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
	if (version < 6) data = { ...data, version: 6, chapterViews: {}, siteVisits: 0 };
	if (version < 7) data = { ...data, version: 7, stats: {} };
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
	if (isRecord(data.chapterViews)) {
		for (const [slug, saved] of Object.entries(data.chapterViews)) {
			if (Array.isArray(saved)) state.chapterViews[slug] = [...new Set(saved.filter((id): id is string => typeof id === 'string'))];
		}
	}
	if (Array.isArray(data.visitedPosts)) {
		state.visitedPosts = [...new Set(data.visitedPosts.filter((id): id is string => typeof id === 'string'))];
	}
	if (typeof data.siteVisits === 'number' && Number.isFinite(data.siteVisits)) state.siteVisits = Math.max(0, Math.floor(data.siteVisits));
	if (isRecord(data.stats)) {
		for (const key of Object.keys(defaultUsageStats()) as (keyof UsageStats)[]) {
			const saved = data.stats[key];
			if (key === 'pageSeconds' || key === 'characterSeconds') {
				if (isRecord(saved)) {
					state.stats[key] = Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value >= 0)) as Record<string, number>;
				}
			} else if (typeof saved === 'number' && Number.isFinite(saved)) {
				state.stats[key] = Math.max(0, saved);
			}
		}
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
	definition.chapterCharacter ? Math.max(characters.find((character) => character.slug === definition.chapterCharacter)?.chapters?.length ?? 0, 1)
		: definition.derived ? Math.max(total, 1)
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
		window.sessionStorage.removeItem(VISIT_SESSION_KEY);
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

export const getUsageStats = () => {
	const stats = getState().stats;
	const favorite = (times: Record<string, number>) => Object.entries(times).sort((first, second) => second[1] - first[1])[0]?.[0] ?? '';
	const favoritePagePath = favorite(stats.pageSeconds);
	const favoriteCharacterSlug = favorite(stats.characterSeconds);
	const favoriteCharacter = characters.find((character) => character.slug === favoriteCharacterSlug)?.name ?? '';
	const favoritePage = favoritePagePath === '/' ? 'Home' : favoritePagePath.split('/').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' / ');
	return {
		...stats,
		siteVisits: getState().siteVisits,
		favoritePage: favoritePage || '—',
		favoriteCharacter: favoriteCharacter || '—',
	};
};

const incrementUsageStat = (key: keyof Omit<UsageStats, 'pageSeconds' | 'characterSeconds'>, amount = 1) => {
	getState().stats[key] += amount;
	save();
};

export const recordTimeSample = (pathname: string, seconds: number, active: boolean) => {
	if (!Number.isFinite(seconds) || seconds <= 0) return;
	const state = getState();
	const segments = pathname.split('/').filter(Boolean);
	state.stats[active ? 'activeSeconds' : 'idleSeconds'] += seconds;
	if (segments.length <= 1) {
		const pagePath = segments.length ? `/${segments[0]}` : '/';
		state.stats.pageSeconds[pagePath] = (state.stats.pageSeconds[pagePath] ?? 0) + seconds;
	} else if (segments[0] === 'characters' && segments.length === 2 && characters.some((character) => character.slug === segments[1])) {
		const slug = segments[1];
		state.stats.characterSeconds[slug] = (state.stats.characterSeconds[slug] ?? 0) + seconds;
	}
};

let lastMusicListenFlush = 0;

export const recordMusicListenSeconds = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds <= 0) return;
	getState().stats.musicListenedSeconds += seconds;
	const now = Date.now();
	if (now - lastMusicListenFlush >= 5000) {
		lastMusicListenFlush = now;
		flushState();
	}
};

export const recordSongClick = () => incrementUsageStat('songsPlayed');
export const recordSettingsClick = () => incrementUsageStat('settingsClicks');
export const recordCatsAccumulated = () => incrementUsageStat('catsAccumulated');
export const recordCatsExploded = () => incrementUsageStat('catsExploded');
export const recordCreditsWatched = () => incrementUsageStat('timesWatchedCredits');

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
	if (detail.reason === 'reset') {
		incrementUsageStat('plinkoResets');
		updateAchievementProgress('plinko500HatTrick', 0);
		return;
	}
	if (detail.reason === 'mode-change' && !detail.extremeMode) {
		updateAchievementProgress('plinko500HatTrick', 0);
		return;
	}
	if (detail.reason !== 'score') return;
	if (!Number.isFinite(detail.pointsEarned) || detail.pointsEarned <= 0) return;
	const stats = getState().stats;
	stats.plinkoRoundsPlayed += 1;
	if (detail.extremeMode) stats.plinkoRoundsPlayedInPEM += 1;
	stats.totalPlinkoScore += detail.pointsEarned;
	stats.highestPlinkoScore = Math.max(stats.highestPlinkoScore, detail.totalPoints);
	save();
	if (detail.extremeMode && detail.pointsEarned === 500) {
		unlockAchievement('plinkoExtreme500');
		updateAchievementProgress('plinko500HatTrick', persistedProgress('plinko500HatTrick') + 1);
	} else {
		updateAchievementProgress('plinko500HatTrick', 0);
	}
	const cumulative = (id: AchievementId) => persistedProgress(id) + detail.pointsEarned;
	for (const id of ['plinkoNewBeginnings', 'plinkoNotSoNewBeginnings', 'plinkoMasterfulBeginnings', 'iLovePlinko'] as const) {
		updateAchievementProgress(id, cumulative(id));
	}
	if (detail.extremeMode) updateAchievementProgress('plinkoExtremeExaminer', cumulative('plinkoExtremeExaminer'));
};

const chapterAchievement: Record<string, AchievementId> = {
	axis: 'axisChapters',
	'praxor-v1': 'v1Chapters',
	'praxor-v2': 'v2Chapters',
	'praxor-irl': 'irlChapters',
};

export const recordChapterView = (characterSlug: string, chapterNumber: number) => {
	const character = characters.find((item) => item.slug === characterSlug);
	if (!character?.chapters?.some((chapter) => chapter.number === chapterNumber)) return false;
	const views = (getState().chapterViews[characterSlug] ??= []);
	const chapterId = String(chapterNumber);
	if (views.includes(chapterId)) return false;
	views.push(chapterId);
	const achievement = chapterAchievement[characterSlug];
	if (achievement) updateAchievementProgress(achievement, views.length);
	else save();
	return true;
};

const recordSiteVisit = () => {
	try {
		if (window.sessionStorage.getItem(VISIT_SESSION_KEY)) return;
		window.sessionStorage.setItem(VISIT_SESSION_KEY, 'true');
	} catch {
		// Continue counting visits if session storage is unavailable.
	}
	const state = getState();
	state.siteVisits += 1;
	updateAchievementProgress('visitor', state.siteVisits);
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
	if (definition.chapterCharacter) return getState().chapterViews[definition.chapterCharacter]?.length ?? 0;
	if (id === 'visitor') return getState().siteVisits;
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
			|| definition.inactiveSeconds !== undefined || definition.pageSeconds !== undefined
			|| definition.chapterCharacter !== undefined;
		return {
			id,
			name: definition.name,
			description: definition.description,
			secret: definition.secret,
			unlocked,
			progress,
			goal,
			category: definition.category ?? 'site',
			progressVisible: definition.showProgress !== false && (!hidden || (definition.progress?.showWhenHidden ?? hasMeaningfulProgress)),
			goalVisible: !hidden || definition.progress?.revealMaximumWhenHidden === true,
			hint: definition.hint,
			unit: definition.unit,
		};
	});
};

// Declarative page hooks: pages mark themselves instead of calling storage code.
const trackPageView = () => {
	const pageLocation = `${window.location.pathname}${window.location.search}`;
	const postId = document.querySelector<HTMLElement>('[data-post-id]')?.dataset.postId;
	if (pageLocation !== lastTrackedPageLocation) {
		lastTrackedPageLocation = pageLocation;
		getState().stats.pagesVisited += 1;
		save();
	}
	if (postId) recordPostVisit(postId);
	else if (syncDerived()) save();
	const unlockId = document.querySelector<HTMLElement>('[data-unlock-on-view]')?.dataset.unlockOnView;
	if (unlockId && unlockId in achievements) unlockAchievement(unlockId as AchievementId);
};

let lastTrackedPageLocation = '';

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
	document.addEventListener('click', (event) => {
		if ((event.target as Element).closest('[data-post-href]')) incrementUsageStat('postsClicked');
	});
	window.addEventListener('storage', (event) => {
		if (event.key !== STORAGE_KEY) return;
		cache = read();
		applySettings();
		emit(CHANGE_EVENT);
	});
	(window as unknown as Record<string, unknown>).iReallyReallyREALLYHateHavingFun = () => { unlockEverything(); };
	recordSiteVisit();
	trackPageView();
};

import { achievements, type AchievementId } from '../data/achievements';
import { flushState, getTotalActiveSeconds, recordCatsAccumulated, recordTimeSample, setLiveActivity, setTotalActiveSeconds, unlockAchievement } from './site-state';

export const ACTIVITY_EVENT = 'site-activity:tick';

const TICK_MS = 1000;
// A longer gap between ticks means the device slept or the page was frozen, so it isn't credited.
const MAX_GAP_MS = 3000;
const ACTIVE_WINDOW_MS = 10000;
const FLUSH_EVERY_MS = 10000;
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove', 'scroll'] as const;

let timer = 0;
let lastTick = 0;
let lastFlush = 0;
let lastInteraction = 0;
let pointerX = -1;
let pointerY = -1;
let pageKey = '';
let pageMs = 0;
let inactiveMs = 0;
let catRollElapsedMs = 0;
let controller: AbortController | null = null;

const isVisible = () => document.visibilityState === 'visible';

/** Single source of truth for time-based tracking. */
export const SiteActivity = {
	/** Cumulative visible time across all visits, in seconds. */
	get totalActiveSeconds() { return getTotalActiveSeconds(); },
	/** Continuous visible time since the last user interaction, in seconds. */
	get currentInactiveSeconds() { return inactiveMs / 1000; },
	/** Visible time on the current page, in seconds. */
	get pageActiveSeconds() { return pageMs / 1000; },
	get pageKey() { return pageKey; },
	get isVisible() { return isVisible(); },
};

const publish = () => {
	setLiveActivity({ inactiveSeconds: inactiveMs / 1000, pageKey, pageSeconds: pageMs / 1000 });
	window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
};

const evaluate = () => {
	const total = getTotalActiveSeconds();
	for (const id of Object.keys(achievements) as AchievementId[]) {
		const { activeSeconds, inactiveSeconds, pageSeconds } = achievements[id] as {
			activeSeconds?: number; inactiveSeconds?: number; pageSeconds?: { page: string; seconds: number };
		};
		if (activeSeconds && total >= activeSeconds) unlockAchievement(id);
		if (inactiveSeconds && inactiveMs / 1000 >= inactiveSeconds) unlockAchievement(id);
		if (pageSeconds && pageKey === pageSeconds.page && pageMs / 1000 >= pageSeconds.seconds) unlockAchievement(id);
	}
};

const tick = () => {
	const now = performance.now();
	const gap = now - lastTick;
	lastTick = now;
	if (!isVisible()) return;
	if (gap > MAX_GAP_MS) {
		lastInteraction = now;
	} else {
		setTotalActiveSeconds(getTotalActiveSeconds() + gap / 1000);
		pageMs += gap;
		recordTimeSample(window.location.pathname, gap / 1000, now - lastInteraction <= ACTIVE_WINDOW_MS);
		catRollElapsedMs += gap;
		while (catRollElapsedMs >= 10000) {
			catRollElapsedMs -= 10000;
			if (Math.random() < 0.02) recordCatsAccumulated();
		}
	}
	inactiveMs = now - lastInteraction;
	evaluate();
	publish();
	if (now - lastFlush >= FLUSH_EVERY_MS) {
		lastFlush = now;
		flushState();
	}
};

const startTimer = () => {
	if (timer) return;
	lastTick = lastInteraction = performance.now();
	timer = window.setInterval(tick, TICK_MS);
};

const stopTimer = () => {
	window.clearInterval(timer);
	timer = 0;
};

const onVisibility = () => {
	if (isVisible()) {
		inactiveMs = 0;
		startTimer();
	} else {
		stopTimer();
		inactiveMs = 0;
		flushState();
		publish();
	}
};

const onPageLoad = () => {
	pageKey = document.querySelector<HTMLElement>('[data-track-page]')?.dataset.trackPage ?? '';
	pageMs = 0;
	publish();
};

export const initSiteActivity = () => {
	if (controller) return;
	controller = new AbortController();
	const { signal } = controller;
	const markInteraction = () => { lastInteraction = performance.now(); };
	for (const name of INTERACTION_EVENTS) window.addEventListener(name, markInteraction, { passive: true, capture: true, signal });
	// Layout shifts can synthesize pointermove at an unchanged position; only real movement counts.
	window.addEventListener('pointermove', (event) => {
		if (event.clientX === pointerX && event.clientY === pointerY) return;
		pointerX = event.clientX;
		pointerY = event.clientY;
		markInteraction();
	}, { passive: true, signal });
	document.addEventListener('visibilitychange', onVisibility, { signal });
	document.addEventListener('astro:page-load', onPageLoad, { signal });
	window.addEventListener('pagehide', flushState, { signal });
	onPageLoad();
	if (isVisible()) startTimer();
};

export const destroySiteActivity = () => {
	controller?.abort();
	controller = null;
	stopTimer();
};
